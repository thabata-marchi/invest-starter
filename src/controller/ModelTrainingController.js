export class ModelController {
    #modelView;
    #investorService;
    #events;
    #currentInvestor = null;
    #alreadyTrained = false;
    constructor({
        modelView,
        investorService,
        events,
    }) {
        this.#modelView = modelView;
        this.#investorService = investorService;
        this.#events = events;

        this.init();
    }

    static init(deps) {
        return new ModelController(deps);
    }

    async init() {
        this.setupCallbacks();
    }

    setupCallbacks() {
        this.#modelView.registerTrainModelCallback(this.handleTrainModel.bind(this));
        this.#modelView.registerRunRecommendationCallback(this.handleRunRecommendation.bind(this));

        this.#events.onInvestorSelected((investor) => {
            this.#currentInvestor = investor;
            if (!this.#alreadyTrained) return;
            this.#modelView.enableRecommendButton();
        });

        this.#events.onTrainingComplete(() => {
            this.#alreadyTrained = true;
            if (!this.#currentInvestor) return;
            this.#modelView.enableRecommendButton();
        });

        this.#events.onInvestorsUpdated(
            async (...data) => {
                return this.refreshInvestorsData(...data);
            }
        );

        this.#events.onProgressUpdate(
            (progress) => {
                this.handleTrainingProgressUpdate(progress);
            }
        );

        this.#events.onChromaDBSynced(({ synced }) => {
            this.#modelView.updateChromaStatus(synced);
        });
    }

    async handleTrainModel() {
        const investors = await this.#investorService.getInvestors();
        this.#events.dispatchTrainModel(investors);
    }

    handleTrainingProgressUpdate(progress) {
        this.#modelView.updateTrainingProgress(progress);
    }

    async handleRunRecommendation() {
        const currentInvestor = this.#currentInvestor;
        const updatedInvestor = await this.#investorService.getInvestorById(currentInvestor.id);
        this.#events.dispatchRecommend(updatedInvestor);
    }

    async refreshInvestorsData({ investors }) {
        this.#modelView.renderAllInvestorsData(investors);
    }
}
