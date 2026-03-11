import { View } from './View.js';

export class InvestorView extends View {
    #investorSelect = document.querySelector('#investorSelect');
    #investorAge = document.querySelector('#investorAge');
    #investorIncome = document.querySelector('#investorIncome');
    #investorKnowledge = document.querySelector('#investorKnowledge');
    #investorRisk = document.querySelector('#investorRisk');
    #investorHorizon = document.querySelector('#investorHorizon');
    #investorObjectives = document.querySelector('#investorObjectives');
    #pastInvestmentsList = document.querySelector('#pastInvestmentsList');

    #investmentTemplate;
    #onInvestorSelect;
    #onInvestmentRemove;

    constructor() {
        super();
        this.init();
    }

    async init() {
        this.#investmentTemplate = await this.loadTemplate('./src/view/templates/past-investment.html');
        this.attachInvestorSelectListener();
    }

    registerInvestorSelectCallback(callback) {
        this.#onInvestorSelect = callback;
    }

    registerInvestmentRemoveCallback(callback) {
        this.#onInvestmentRemove = callback;
    }

    renderInvestorOptions(investors) {
        const options = investors.map(investor => {
            return `<option value="${investor.id}">${investor.name}</option>`;
        }).join('');

        this.#investorSelect.innerHTML += options;
    }

    renderInvestorDetails(investor) {
        this.#investorAge.value = investor.age;
        this.#investorIncome.value = `R$ ${investor.monthlyIncome.toLocaleString('pt-BR')}`;

        const knowledgeLabels = {
            'nunca_investiu': 'Never invested',
            'basico': 'Knows the basics',
            'intermediario': 'Intermediate'
        };
        const riskLabels = {
            'conservador': 'Conservative',
            'moderado': 'Moderate',
            'arrojado': 'Aggressive'
        };
        const horizonLabels = {
            'curto': 'Short term',
            'medio': 'Medium term',
            'longo': 'Long term'
        };
        const objectiveLabels = {
            'reserva_emergencia': 'Emergency fund',
            'viagem': 'Travel',
            'casa_propria': 'Buy a home',
            'aposentadoria': 'Retirement',
            'renda_extra': 'Extra income'
        };

        this.#investorKnowledge.innerHTML = `<span class="badge bg-info">${knowledgeLabels[investor.knowledgeLevel] || investor.knowledgeLevel}</span>`;
        this.#investorRisk.innerHTML = `<span class="badge bg-${this.#getRiskColor(investor.riskProfile)}">${riskLabels[investor.riskProfile] || investor.riskProfile}</span>`;
        this.#investorHorizon.innerHTML = `<span class="badge bg-secondary">${horizonLabels[investor.investmentHorizon] || investor.investmentHorizon}</span>`;
        this.#investorObjectives.innerHTML = (investor.objectives || [])
            .map(obj => `<span class="badge bg-light text-dark me-1">${objectiveLabels[obj] || obj}</span>`)
            .join('');
    }

    #getRiskColor(risk) {
        if (risk === 'conservador') return 'success';
        if (risk === 'moderado') return 'warning';
        return 'danger';
    }

    renderPastInvestments(pastInvestments) {
        if (!this.#investmentTemplate) return;

        if (!pastInvestments || pastInvestments.length === 0) {
            this.#pastInvestmentsList.innerHTML = '<p class="text-muted">Nenhum investimento ainda.</p>';
            return;
        }

        const html = pastInvestments.map(product => {
            return this.replaceTemplate(this.#investmentTemplate, {
                ...product,
                product: JSON.stringify(product)
            });
        }).join('');

        this.#pastInvestmentsList.innerHTML = html;
        this.attachInvestmentClickHandlers();
    }

    addPastInvestment(product) {
        if (this.#pastInvestmentsList.innerHTML.includes('Nenhum investimento')) {
            this.#pastInvestmentsList.innerHTML = '';
        }

        const investmentHtml = this.replaceTemplate(this.#investmentTemplate, {
            ...product,
            product: JSON.stringify(product)
        });

        this.#pastInvestmentsList.insertAdjacentHTML('afterbegin', investmentHtml);

        const newInvestment = this.#pastInvestmentsList.firstElementChild.querySelector('.past-investment');
        newInvestment.classList.add('past-investment-highlight');

        setTimeout(() => {
            newInvestment.classList.remove('past-investment-highlight');
        }, 1000);

        this.attachInvestmentClickHandlers();
    }

    attachInvestorSelectListener() {
        this.#investorSelect.addEventListener('change', (event) => {
            const investorId = event.target.value ? Number(event.target.value) : null;

            if (investorId) {
                if (this.#onInvestorSelect) {
                    this.#onInvestorSelect(investorId);
                }
            } else {
                this.#investorAge.value = '';
                this.#investorIncome.value = '';
                this.#investorKnowledge.innerHTML = '';
                this.#investorRisk.innerHTML = '';
                this.#investorHorizon.innerHTML = '';
                this.#investorObjectives.innerHTML = '';
                this.#pastInvestmentsList.innerHTML = '';
            }
        });
    }

    attachInvestmentClickHandlers() {
        const investmentElements = document.querySelectorAll('.past-investment');

        investmentElements.forEach(investmentElement => {
            investmentElement.onclick = (event) => {
                const product = JSON.parse(investmentElement.dataset.product);
                const investorId = this.getSelectedInvestorId();
                const element = investmentElement.closest('.col-md-6');

                this.#onInvestmentRemove({ element, investorId, product });

                element.style.transition = 'opacity 0.5s ease';
                element.style.opacity = '0';

                setTimeout(() => {
                    element.remove();
                    if (document.querySelectorAll('.past-investment').length === 0) {
                        this.renderPastInvestments([]);
                    }
                }, 500);
            }
        });
    }

    getSelectedInvestorId() {
        return this.#investorSelect.value ? Number(this.#investorSelect.value) : null;
    }
}
