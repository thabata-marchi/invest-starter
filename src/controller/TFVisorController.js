
export class TFVisorController {
    #tfVisorView;
    #events;
    constructor({
        tfVisorView,
        events,
    }) {
        this.#tfVisorView = tfVisorView;
        this.#events = events;

        this.init();
    }

    static init(deps) {
        return new TFVisorController(deps);
    }

    async init() {
        this.setupCallbacks();
    }

    setupCallbacks() {
        this.#events.onTrainModel(() => {
            this.#tfVisorView.resetDashboard();
        });

        this.#events.onTFVisLogs(
            (log) => {
                this.#tfVisorView.handleTrainingLog(log);
            }
        );
    }

}
