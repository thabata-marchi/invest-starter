export class ProductController {
    #productView;
    #currentInvestor = null;
    #events;
    #productService;
    constructor({
        productView,
        events,
        productService
    }) {
        this.#productView = productView;
        this.#productService = productService;
        this.#events = events;
        this.init();
    }

    static init(deps) {
        return new ProductController(deps);
    }

    async init() {
        this.setupCallbacks();
        this.setupEventListeners();
        const products = await this.#productService.getProducts();
        this.#productView.render(products, true);
    }

    setupEventListeners() {
        this.#events.onInvestorSelected((investor) => {
            this.#currentInvestor = investor;
            this.#productView.onInvestorSelected(investor);
            this.#events.dispatchRecommend(investor);
        });

        this.#events.onRecommendationsReady(({ recommendations }) => {
            this.#productView.render(recommendations, false);
        });
    }

    setupCallbacks() {
        this.#productView.registerInvestProductCallback(this.handleInvestProduct.bind(this));
    }

    async handleInvestProduct(product) {
        const investor = this.#currentInvestor;
        this.#events.dispatchInvestmentAdded({ investor, product });
    }
}
