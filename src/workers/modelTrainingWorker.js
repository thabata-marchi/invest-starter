import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';

console.log('Model training worker initialized');
let _globalCtx = {};
let _model = null;

const WEIGHTS = {
    knowledgeLevel: 0.20,
    lossTolerancy: 0.20,
    riskProfile: 0.15,
    horizon: 0.10,
    objectives: 0.10,
    age: 0.10,
    income: 0.15,
    productType: 0.15,
    complexity: 0.20,
}

const normalize = (value, min, max) => (value - min) / ((max - min) || 1);

const oneHotWeighted = (index, length, weight) => {
    return tf.oneHot(index, length).cast('float32').mul(weight);
}

function makeContext(products, investors) {
    const ages = investors.map(i => i.age);
    const incomes = investors.map(i => i.monthlyIncome);
    const returns = products.map(p => p.expectedReturn);
    const risks = products.map(p => p.risk);
    const liquidities = products.map(p => p.liquidity);
    const minInvestments = products.map(p => p.minimumInvestment);

    const knowledgeLevels = ['nunca_investiu', 'basico', 'intermediario'];
    const lossTolerancies = ['nenhuma', 'baixa', 'media'];
    const riskProfiles = ['conservador', 'moderado', 'arrojado'];
    const horizons = ['curto', 'medio', 'longo'];
    const objectivesList = ['reserva_emergencia', 'viagem', 'casa_propria', 'aposentadoria', 'renda_extra'];
    const productTypes = ['tesouro', 'cdb', 'lci', 'lca', 'fundo', 'acao'];
    const complexities = ['simples', 'medio', 'avancado'];

    const knowledgeIndex = Object.fromEntries(knowledgeLevels.map((k, i) => [k, i]));
    const lossIndex = Object.fromEntries(lossTolerancies.map((l, i) => [l, i]));
    const riskIndex = Object.fromEntries(riskProfiles.map((r, i) => [r, i]));
    const horizonIndex = Object.fromEntries(horizons.map((h, i) => [h, i]));
    const objectivesIndex = Object.fromEntries(objectivesList.map((o, i) => [o, i]));
    const typeIndex = Object.fromEntries(productTypes.map((t, i) => [t, i]));
    const complexityIndex = Object.fromEntries(complexities.map((c, i) => [c, i]));

    // Investor vector dims: 3 + 3 + 3 + 3 + 5 + 1 + 1 = 19
    const investorDims = knowledgeLevels.length + lossTolerancies.length +
        riskProfiles.length + horizons.length + objectivesList.length + 2;

    // Product vector dims: 6 + 3 + 1 + 1 + 1 + 1 = 13
    const productDims = productTypes.length + complexities.length + 4;

    return {
        products,
        investors,
        minAge: Math.min(...ages),
        maxAge: Math.max(...ages),
        minIncome: Math.min(...incomes),
        maxIncome: Math.max(...incomes),
        minReturn: Math.min(...returns),
        maxReturn: Math.max(...returns),
        minRisk: Math.min(...risks),
        maxRisk: Math.max(...risks),
        minLiquidity: Math.min(...liquidities),
        maxLiquidity: Math.max(...liquidities),
        minInvestment: Math.min(...minInvestments),
        maxInvestment: Math.max(...minInvestments),
        knowledgeIndex,
        lossIndex,
        riskIndex,
        horizonIndex,
        objectivesIndex,
        typeIndex,
        complexityIndex,
        numKnowledge: knowledgeLevels.length,
        numLoss: lossTolerancies.length,
        numRisk: riskProfiles.length,
        numHorizons: horizons.length,
        numObjectives: objectivesList.length,
        numTypes: productTypes.length,
        numComplexities: complexities.length,
        investorDims,
        productDims,
        dimentions: investorDims + productDims,
    };
}

function encodeProduct(product, context) {
    const type = oneHotWeighted(
        context.typeIndex[product.type] ?? 0,
        context.numTypes,
        WEIGHTS.productType
    );

    const complexity = oneHotWeighted(
        context.complexityIndex[product.complexity] ?? 0,
        context.numComplexities,
        WEIGHTS.complexity
    );

    const expectedReturn = tf.tensor1d([
        normalize(product.expectedReturn, context.minReturn, context.maxReturn)
    ]);

    const risk = tf.tensor1d([
        normalize(product.risk, context.minRisk, context.maxRisk)
    ]);

    const liquidity = tf.tensor1d([
        normalize(product.liquidity, context.minLiquidity, context.maxLiquidity)
    ]);

    const minInvestment = tf.tensor1d([
        normalize(product.minimumInvestment, context.minInvestment, context.maxInvestment)
    ]);

    return tf.concat([type, complexity, expectedReturn, risk, liquidity, minInvestment]);
}

function encodeInvestor(investor, context) {
    const knowledge = oneHotWeighted(
        context.knowledgeIndex[investor.knowledgeLevel] ?? 0,
        context.numKnowledge,
        WEIGHTS.knowledgeLevel
    );

    const lossTolerance = oneHotWeighted(
        context.lossIndex[investor.lossTolerancy] ?? 0,
        context.numLoss,
        WEIGHTS.lossTolerancy
    );

    const riskProfile = oneHotWeighted(
        context.riskIndex[investor.riskProfile] ?? 0,
        context.numRisk,
        WEIGHTS.riskProfile
    );

    const horizon = oneHotWeighted(
        context.horizonIndex[investor.investmentHorizon] ?? 0,
        context.numHorizons,
        WEIGHTS.horizon
    );

    // Multi-hot para objetivos
    const objectivesArray = new Array(context.numObjectives).fill(0);
    (investor.objectives || []).forEach(obj => {
        const idx = context.objectivesIndex[obj];
        if (idx !== undefined) objectivesArray[idx] = WEIGHTS.objectives;
    });
    const objectives = tf.tensor1d(objectivesArray);

    const age = tf.tensor1d([
        normalize(investor.age, context.minAge, context.maxAge) * WEIGHTS.age
    ]);

    const income = tf.tensor1d([
        normalize(investor.monthlyIncome, context.minIncome, context.maxIncome) * WEIGHTS.income
    ]);

    return tf.concat([knowledge, lossTolerance, riskProfile, horizon, objectives, age, income]);
}

function createTrainingData(context) {
    const inputs = [];
    const labels = [];

    context.investors
        .filter(investor => investor.investments.length)
        .forEach(investor => {
            const investorVector = encodeInvestor(investor, context).dataSync();
            context.products.forEach(product => {
                const productVector = encodeProduct(product, context).dataSync();
                const label = investor.investments.some(
                    inv => inv.name === product.name ? 1 : 0
                );
                inputs.push([...investorVector, ...productVector]);
                labels.push(label);
            });
        });

    return {
        xs: tf.tensor2d(inputs),
        ys: tf.tensor2d(labels, [labels.length, 1]),
        inputDimensions: context.dimentions,
    };
}

async function configureNeuralNetAndTrain(trainData) {
    const model = tf.sequential();

    model.add(tf.layers.dense({
        inputShape: [trainData.inputDimensions],
        units: 128,
        activation: 'relu'
    }));

    model.add(tf.layers.dense({
        units: 64,
        activation: 'relu'
    }));

    model.add(tf.layers.dense({
        units: 32,
        activation: 'relu'
    }));

    model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid'
    }));

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    await model.fit(trainData.xs, trainData.ys, {
        epochs: 100,
        batchSize: 32,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                postMessage({
                    type: workerEvents.trainingLog,
                    epoch: epoch,
                    loss: logs.loss,
                    accuracy: logs.acc
                });
            }
        }
    });
    return model;
}

async function trainModel({ investors }) {
    console.log('Training model with investors:', investors);
    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 50 } });
    const products = await (await fetch('/data/products.json')).json();

    const context = makeContext(products, investors);
    context.productVectors = products.map(product => {
        return {
            name: product.name,
            meta: { ...product },
            vector: encodeProduct(product, context).dataSync()
        };
    });

    _globalCtx = context;

    const trainData = createTrainingData(context);
    _model = await configureNeuralNetAndTrain(trainData);

    // Export vectors for ChromaDB
    const investorVectors = investors.map(inv => ({
        id: String(inv.id),
        vector: Array.from(encodeInvestor(inv, context).dataSync()),
        metadata: {
            name: inv.name,
            knowledgeLevel: inv.knowledgeLevel,
            riskProfile: inv.riskProfile
        }
    }));

    const productVectors = products.map(prod => ({
        id: String(prod.id),
        vector: Array.from(encodeProduct(prod, context).dataSync()),
        metadata: {
            name: prod.name,
            type: prod.type,
            complexity: prod.complexity
        }
    }));

    postMessage({
        type: workerEvents.vectorsReady,
        investorVectors,
        productVectors
    });

    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 100 } });
    postMessage({ type: workerEvents.trainingComplete });
}

function recommend(user, ctx) {
    if (!_model) {
        console.error('Model not trained yet');
        return;
    }
    const context = _globalCtx;
    const userVector = encodeInvestor(user, context).dataSync();

    const inputs = context.productVectors.map(({ vector }) => {
        return [...userVector, ...vector];
    });

    const inputTensor = tf.tensor2d(inputs);
    const predictions = _model.predict(inputTensor);
    const scores = predictions.dataSync();

    const recommendations = context.productVectors.map((item, index) => {
        return {
            ...item.meta,
            name: item.name,
            score: scores[index]
        };
    });

    const sortedItems = recommendations
        .sort((a, b) => b.score - a.score);

    postMessage({
        type: workerEvents.recommend,
        user,
        recommendations: sortedItems
    });
}

const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.recommend]: d => recommend(d.user, _globalCtx),
};

self.onmessage = e => {
    const { action, ...data } = e.data;
    if (handlers[action]) handlers[action](data);
};
