export class InvestorController {
    #investorService;
    #investorView;
    #events;
    constructor({
        investorView,
        investorService,
        events,
    }) {
        this.#investorView = investorView;
        this.#investorService = investorService;
        this.#events = events;
    }

    static init(deps) {
        return new InvestorController(deps);
    }

    async renderInvestors(nonTrainedInvestor) {
        const investors = await this.#investorService.getDefaultInvestors();

        this.#investorService.addInvestor(nonTrainedInvestor);
        const defaultAndNonTrained = [nonTrainedInvestor, ...investors];

        this.#investorView.renderInvestorOptions(defaultAndNonTrained);
        this.setupCallbacks();
        this.setupInvestmentObserver();

        this.#events.dispatchInvestorsUpdated({ investors: defaultAndNonTrained });
    }

    setupCallbacks() {
        this.#investorView.registerInvestorSelectCallback(this.handleInvestorSelect.bind(this));
        this.#investorView.registerInvestmentRemoveCallback(this.handleInvestmentRemove.bind(this));
    }

    setupInvestmentObserver() {
        this.#events.onInvestmentAdded(
            async (...data) => {
                return this.handleInvestmentAdded(...data);
            }
        );
    }

    async handleInvestorSelect(investorId) {
        const investor = await this.#investorService.getInvestorById(investorId);
        this.#events.dispatchInvestorSelected(investor);
        return this.displayInvestorDetails(investor);
    }

    async handleInvestmentAdded({ investor, product }) {
        const updatedInvestor = await this.#investorService.getInvestorById(investor.id);
        updatedInvestor.investments.push({
            ...product
        });

        await this.#investorService.updateInvestor(updatedInvestor);

        const lastInvestment = updatedInvestor.investments[updatedInvestor.investments.length - 1];
        this.#investorView.addPastInvestment(lastInvestment);
        this.#events.dispatchInvestorsUpdated({ investors: await this.#investorService.getInvestors() });
    }

    async handleInvestmentRemove({ investorId, product }) {
        const investor = await this.#investorService.getInvestorById(investorId);
        const index = investor.investments.findIndex(item => item.id === product.id);

        if (index !== -1) {
            investor.investments.splice(index, 1);
            await this.#investorService.updateInvestor(investor);

            const updatedInvestors = await this.#investorService.getInvestors();
            this.#events.dispatchInvestorsUpdated({ investors: updatedInvestors });
        }
    }

    async displayInvestorDetails(investor) {
        this.#investorView.renderInvestorDetails(investor);
        this.#investorView.renderPastInvestments(investor.investments);
    }

    getSelectedInvestorId() {
        return this.#investorView.getSelectedInvestorId();
    }
}
