export class ProductService {
    async getProducts() {
        const response = await fetch('./data/products.json');
        return await response.json();
    }

    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(product => product.id === id);
    }

    async getProductsByIds(ids) {
        const products = await this.getProducts();
        return products.filter(product => ids.includes(product.id));
    }
}
