import { View } from './View.js';

export class ProductView extends View {
    #productList = document.querySelector('#productList');
    #buttons;
    #productTemplate;
    #onInvestProduct;

    constructor() {
        super();
        this.init();
    }

    async init() {
        this.#productTemplate = await this.loadTemplate('./src/view/templates/product-card.html');
    }

    onInvestorSelected(investor) {
        this.setButtonsState(investor.id ? false : true);
    }

    registerInvestProductCallback(callback) {
        this.#onInvestProduct = callback;
    }

    #getTypeColor(type) {
        const colors = {
            'tesouro': 'success',
            'cdb': 'primary',
            'lci': 'info',
            'lca': 'info',
            'fundo': 'warning',
            'acao': 'danger'
        };
        return colors[type] || 'secondary';
    }

    #getComplexityColor(complexity) {
        const colors = {
            'simples': 'success',
            'medio': 'warning',
            'avancado': 'danger'
        };
        return colors[complexity] || 'secondary';
    }

    #getComplexityLabel(complexity) {
        const labels = {
            'simples': 'Simple',
            'medio': 'Medium',
            'avancado': 'Advanced'
        };
        return labels[complexity] || complexity;
    }

    #getRiskLabel(risk) {
        if (risk <= 0.1) return 'Very low';
        if (risk <= 0.2) return 'Low';
        if (risk <= 0.4) return 'Medium';
        if (risk <= 0.6) return 'High';
        return 'Very high';
    }

    render(products, disableButtons = true) {
        if (!this.#productTemplate) return;

        const html = products.map(product => {
            const scorePercent = product.score !== undefined
                ? Math.round(product.score * 100) : 0;

            const badgesHtml = (product.badges || [])
                .map(b => `<span class="badge bg-light text-dark badge-sm me-1">${b}</span>`)
                .join('');

            return this.replaceTemplate(this.#productTemplate, {
                name: product.name,
                type: product.type,
                typeColor: this.#getTypeColor(product.type),
                complexityColor: this.#getComplexityColor(product.complexity),
                complexityLabel: this.#getComplexityLabel(product.complexity),
                expectedReturn: product.expectedReturn,
                riskLabel: this.#getRiskLabel(product.risk),
                liquidity: product.liquidity,
                minimumInvestment: product.minimumInvestment,
                educationalTip: product.educationalTip || '',
                badgesHtml,
                scoreDisplay: product.score !== undefined ? 'block' : 'none',
                scorePercent,
                product: JSON.stringify(product)
            });
        }).join('');

        this.#productList.innerHTML = html;
        this.attachInvestButtonListeners();
        this.setButtonsState(disableButtons);
    }

    setButtonsState(disabled) {
        if (!this.#buttons) {
            this.#buttons = document.querySelectorAll('.invest-btn');
        }
        this.#buttons.forEach(button => {
            button.disabled = disabled;
        });
    }

    attachInvestButtonListeners() {
        this.#buttons = document.querySelectorAll('.invest-btn');
        this.#buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                const product = JSON.parse(button.dataset.product);
                const originalText = button.innerHTML;

                button.innerHTML = '<i class="bi bi-check-circle-fill"></i> Invested!';
                button.classList.remove('btn-primary');
                button.classList.add('btn-success');
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('btn-success');
                    button.classList.add('btn-primary');
                }, 500);
                this.#onInvestProduct(product, button);
            });
        });
    }
}
