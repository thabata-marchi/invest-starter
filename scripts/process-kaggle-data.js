/**
 * Script to process Kaggle data (Bank Marketing Dataset)
 * and generate investors.json with beginner investor profiles.
 *
 * Dataset: https://www.kaggle.com/datasets/henriqueyamahata/bank-marketing
 * Download bank-additional-full.csv and place it in this folder.
 *
 * Usage: node scripts/process-kaggle-data.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = join(__dirname, 'bank-additional-full.csv');
const OUTPUT_PATH = join(__dirname, '..', 'data', 'investors.json');

const PRODUCTS = JSON.parse(
    readFileSync(join(__dirname, '..', 'data', 'products.json'), 'utf-8')
);

const NAMES = [
    'Ana Silva', 'Bruno Costa', 'Carla Mendes', 'Diego Ferreira', 'Eduarda Nunes',
    'Felipe Santos', 'Gabriela Lima', 'Henrique Almeida', 'Isabela Rodrigues', 'João Oliveira',
    'Karen Souza', 'Lucas Pereira', 'Marina Campos', 'Nicolas Ribeiro', 'Olivia Martins',
    'Pedro Gomes', 'Rafaela Barbosa', 'Samuel Araujo', 'Tatiana Dias', 'Ulisses Franco',
    'Vanessa Rocha', 'Wagner Pinto', 'Ximena Torres', 'Yuri Cardoso', 'Zilda Moreira',
    'Amanda Lopes', 'Bernardo Reis', 'Cecília Duarte', 'Daniel Vieira', 'Elena Nascimento',
    'Fábio Correia', 'Giovana Teixeira', 'Hugo Monteiro', 'Irene Barros', 'Julio Ramos',
    'Larissa Cunha', 'Marcelo Pires', 'Natália Fonseca', 'Otávio Machado', 'Patrícia Medeiros',
    'Renato Azevedo', 'Sônia Guimarães', 'Thiago Nogueira', 'Úrsula Carvalho', 'Vítor Alencar',
    'Wesley Batista', 'Yasmin Freitas', 'Zeca Morais', 'Alice Andrade', 'Breno Lacerda'
];

function deriveKnowledgeLevel(education, age) {
    if (['illiterate', 'basic.4y', 'basic.6y'].includes(education)) return 'nunca_investiu';
    if (['basic.9y', 'high.school'].includes(education)) {
        return age > 35 ? 'basico' : 'nunca_investiu';
    }
    if (['professional.course', 'university.degree'].includes(education)) {
        if (age > 40) return 'intermediario';
        if (age > 28) return 'basico';
        return 'nunca_investiu';
    }
    return 'nunca_investiu';
}

function deriveLossTolerancy(balance, marital) {
    if (balance < 500 || marital === 'married') return 'nenhuma';
    if (balance < 3000) return 'baixa';
    return 'media';
}

function deriveRiskProfile(knowledge, lossTolerance) {
    if (knowledge === 'nunca_investiu' || lossTolerance === 'nenhuma') return 'conservador';
    if (knowledge === 'intermediario' && lossTolerance === 'media') return 'arrojado';
    return 'moderado';
}

function deriveHorizon(age, riskProfile) {
    if (age < 25 || riskProfile === 'conservador') return 'curto';
    if (age > 40 || riskProfile === 'arrojado') return 'longo';
    return 'medio';
}

function deriveObjectives(age, riskProfile) {
    const objectives = [];
    if (riskProfile === 'conservador') objectives.push('reserva_emergencia');
    if (age < 30) objectives.push('viagem');
    if (age >= 28 && age <= 40) objectives.push('casa_propria');
    if (age > 35) objectives.push('aposentadoria');
    if (riskProfile === 'arrojado') objectives.push('renda_extra');
    return objectives.length ? objectives : ['reserva_emergencia'];
}

function deriveIncome(balance) {
    return Math.max(1800, Math.round(Math.abs(balance) * 2.5 + 1800));
}

function assignInvestments(riskProfile, knowledgeLevel) {
    const simple = PRODUCTS.filter(p => p.complexity === 'simples');
    const medium = PRODUCTS.filter(p => p.complexity === 'medio');
    const advanced = PRODUCTS.filter(p => p.complexity === 'avancado');

    let pool, count;

    if (knowledgeLevel === 'nunca_investiu') {
        pool = simple;
        count = 1 + Math.floor(Math.random() * 2);
    } else if (riskProfile === 'conservador') {
        pool = [...simple, ...medium.slice(0, 2)];
        count = 2 + Math.floor(Math.random() * 2);
    } else if (riskProfile === 'moderado') {
        pool = [...simple, ...medium];
        count = 2 + Math.floor(Math.random() * 2);
    } else {
        pool = [...medium, ...advanced];
        count = 3 + Math.floor(Math.random() * 2);
    }

    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        expectedReturn: p.expectedReturn
    }));
}

function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(';').map(h => h.replace(/"/g, ''));

    return lines.slice(1).map(line => {
        const values = line.split(';').map(v => v.replace(/"/g, ''));
        const row = {};
        headers.forEach((h, i) => row[h] = values[i]);
        return row;
    });
}

function main() {
    let rows;

    try {
        const csvContent = readFileSync(CSV_PATH, 'utf-8');
        rows = parseCSV(csvContent);
        console.log(`CSV loaded: ${rows.length} rows`);
    } catch {
        console.log('Kaggle CSV not found. Using existing investors.json data.');
        console.log('To generate new data, download the dataset from:');
        console.log('https://www.kaggle.com/datasets/henriqueyamahata/bank-marketing');
        console.log('And place bank-additional-full.csv in scripts/');
        return;
    }

    const selected = rows
        .filter(r => parseInt(r.age) >= 18 && parseInt(r.age) <= 60)
        .sort(() => Math.random() - 0.5)
        .slice(0, 50);

    const investors = selected.map((row, index) => {
        const age = parseInt(row.age);
        const balance = parseInt(row.balance) || Math.floor(Math.random() * 5000);
        const education = row.education || 'high.school';
        const marital = row.marital || 'single';

        const knowledgeLevel = deriveKnowledgeLevel(education, age);
        const lossTolerancy = deriveLossTolerancy(balance, marital);
        const riskProfile = deriveRiskProfile(knowledgeLevel, lossTolerancy);
        const investmentHorizon = deriveHorizon(age, riskProfile);
        const objectives = deriveObjectives(age, riskProfile);
        const monthlyIncome = deriveIncome(balance);
        const investments = assignInvestments(riskProfile, knowledgeLevel);

        return {
            id: index + 1,
            name: NAMES[index] || `Investor ${index + 1}`,
            age,
            monthlyIncome,
            knowledgeLevel,
            lossTolerancy,
            riskProfile,
            investmentHorizon,
            objectives,
            investments
        };
    });

    writeFileSync(OUTPUT_PATH, JSON.stringify(investors, null, 4), 'utf-8');
    console.log(`Generated: ${OUTPUT_PATH} with ${investors.length} investors`);
}

main();
