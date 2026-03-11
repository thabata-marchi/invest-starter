import { View } from './View.js';

export class ModelView extends View {
    #trainModelBtn = document.querySelector('#trainModelBtn');
    #investmentsArrow = document.querySelector('#investmentsArrow');
    #investmentsDiv = document.querySelector('#investmentsDiv');
    #allInvestorsList = document.querySelector('#allInvestorsList');
    #runRecommendationBtn = document.querySelector('#runRecommendationBtn');
    #chromaStatus = document.querySelector('#chromaStatus');
    #onTrainModel;
    #onRunRecommendation;

    constructor() {
        super();
        this.attachEventListeners();
    }

    registerTrainModelCallback(callback) {
        this.#onTrainModel = callback;
    }
    registerRunRecommendationCallback(callback) {
        this.#onRunRecommendation = callback;
    }

    attachEventListeners() {
        this.#trainModelBtn.addEventListener('click', () => {
            this.#onTrainModel();
        });
        this.#runRecommendationBtn.addEventListener('click', () => {
            this.#onRunRecommendation();
        });

        this.#investmentsDiv.addEventListener('click', () => {
            const investorsList = this.#allInvestorsList;
            const isHidden = window.getComputedStyle(investorsList).display === 'none';

            if (isHidden) {
                investorsList.style.display = 'block';
                this.#investmentsArrow.classList.remove('bi-chevron-down');
                this.#investmentsArrow.classList.add('bi-chevron-up');
            } else {
                investorsList.style.display = 'none';
                this.#investmentsArrow.classList.remove('bi-chevron-up');
                this.#investmentsArrow.classList.add('bi-chevron-down');
            }
        });
    }

    enableRecommendButton() {
        this.#runRecommendationBtn.disabled = false;
    }

    updateTrainingProgress(progress) {
        this.#trainModelBtn.disabled = true;
        this.#trainModelBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Training...';

        if (progress.progress === 100) {
            this.#trainModelBtn.disabled = false;
            this.#trainModelBtn.innerHTML = '<i class="bi bi-cpu"></i> Train Model';
        }
    }

    updateChromaStatus(synced) {
        if (this.#chromaStatus) {
            this.#chromaStatus.className = `chroma-status ${synced ? 'synced' : 'offline'}`;
            this.#chromaStatus.title = synced ? 'ChromaDB synced' : 'ChromaDB offline';
        }
    }

    renderAllInvestorsData(investors) {
        const knowledgeLabels = {
            'nunca_investiu': 'Never invested',
            'basico': 'Basic',
            'intermediario': 'Intermediate'
        };

        const html = investors.map(investor => {
            const investmentsHtml = investor.investments.map(inv => {
                return `<span class="badge bg-light text-dark me-1 mb-1">${inv.name}</span>`;
            }).join('');

            return `
                <div class="investor-data-summary">
                    <h6>${investor.name} (${investor.age} anos) - ${knowledgeLabels[investor.knowledgeLevel] || investor.knowledgeLevel}</h6>
                    <div class="investments-badges">
                        ${investmentsHtml || '<span class="text-muted">Sem investimentos</span>'}
                    </div>
                </div>
            `;
        }).join('');

        this.#allInvestorsList.innerHTML = html;
    }
}
