import { workerEvents } from "../events/constants.js";

export class WorkerController {
    #worker;
    #events;
    #chromaDBService;
    #alreadyTrained = false;
    constructor({ worker, events, chromaDBService }) {
        this.#worker = worker;
        this.#events = events;
        this.#chromaDBService = chromaDBService;
        this.#alreadyTrained = false;
        this.init();
    }

    async init() {
        this.setupCallbacks();
    }

    static init(deps) {
        return new WorkerController(deps);
    }

    setupCallbacks() {
        this.#events.onTrainModel((data) => {
            this.#alreadyTrained = false;
            this.triggerTrain(data);
        });
        this.#events.onTrainingComplete(() => {
            this.#alreadyTrained = true;
        });

        this.#events.onRecommend((data) => {
            if (!this.#alreadyTrained) return;
            this.triggerRecommend(data);
        });

        const eventsToIgnoreLogs = [
            workerEvents.progressUpdate,
            workerEvents.trainingLog,
            workerEvents.tfVisData,
            workerEvents.tfVisLogs,
            workerEvents.trainingComplete,
            workerEvents.vectorsReady,
        ];

        this.#worker.onmessage = (event) => {
            if (!eventsToIgnoreLogs.includes(event.data.type))
                console.log(event.data);

            if (event.data.type === workerEvents.progressUpdate) {
                this.#events.dispatchProgressUpdate(event.data.progress);
            }

            if (event.data.type === workerEvents.trainingComplete) {
                this.#events.dispatchTrainingComplete(event.data);
            }

            if (event.data.type === workerEvents.tfVisData) {
                this.#events.dispatchTFVisorData(event.data.data);
            }

            if (event.data.type === workerEvents.trainingLog) {
                this.#events.dispatchTFVisLogs(event.data);
            }

            if (event.data.type === workerEvents.recommend) {
                this.#events.dispatchRecommendationsReady(event.data);
            }

            if (event.data.type === workerEvents.vectorsReady) {
                this.#syncVectorsToChromaDB(event.data);
            }
        };
    }

    async #syncVectorsToChromaDB(data) {
        try {
            const { investorVectors, productVectors } = data;

            await Promise.all([
                this.#chromaDBService.upsertInvestorVectors(investorVectors),
                this.#chromaDBService.upsertProductVectors(productVectors)
            ]);

            console.log('Vectors synced to ChromaDB');
            this.#events.dispatchChromaDBSynced({ synced: true });
        } catch (error) {
            console.warn('ChromaDB sync failed (server may be offline):', error.message);
            this.#events.dispatchChromaDBSynced({ synced: false });
        }
    }

    triggerTrain(investors) {
        this.#worker.postMessage({ action: workerEvents.trainModel, investors });
    }

    async triggerRecommend(investor) {
        // Try to fetch similar investors from ChromaDB
        try {
            const health = await this.#chromaDBService.checkHealth();
            if (health.status === 'ok') {
                const similar = await this.#chromaDBService.querySimilarInvestors(
                    Array.from(Object.values(investor)),
                    100
                );
                console.log('Similar investors from ChromaDB:', similar);
            }
        } catch {
            console.log('ChromaDB offline, using local prediction only');
        }

        this.#worker.postMessage({ action: workerEvents.recommend, user: investor });
    }
}
