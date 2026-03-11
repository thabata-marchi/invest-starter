export class InvestorService {
    #storageKey = 'meu-primeiro-investimento-investors';

    getNewInvestorTemplate() {
        return {
            id: 99,
            name: "New Investor",
            age: 25,
            monthlyIncome: 3000,
            knowledgeLevel: "nunca_investiu",
            lossTolerancy: "nenhuma",
            riskProfile: "conservador",
            investmentHorizon: "curto",
            objectives: ["reserva_emergencia"],
            investments: []
        };
    }

    async getDefaultInvestors() {
        const response = await fetch('./data/investors.json');
        const investors = await response.json();
        this.#setStorage(investors);

        return investors;
    }

    async getInvestors() {
        const investors = this.#getStorage();
        return investors;
    }

    async getInvestorById(investorId) {
        const investors = this.#getStorage();
        return investors.find(investor => investor.id === investorId);
    }

    async updateInvestor(investor) {
        const investors = this.#getStorage();
        const investorIndex = investors.findIndex(i => i.id === investor.id);

        investors[investorIndex] = { ...investors[investorIndex], ...investor };
        this.#setStorage(investors);

        return investors[investorIndex];
    }

    async addInvestor(investor) {
        const investors = this.#getStorage();
        this.#setStorage([investor, ...investors]);
    }

    #getStorage() {
        const data = sessionStorage.getItem(this.#storageKey);
        return data ? JSON.parse(data) : [];
    }

    #setStorage(data) {
        sessionStorage.setItem(this.#storageKey, JSON.stringify(data));
    }
}
