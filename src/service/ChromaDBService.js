export class ChromaDBService {
    #baseUrl = 'http://localhost:3001/api';

    async checkHealth() {
        try {
            const response = await fetch(`${this.#baseUrl}/health`);
            return await response.json();
        } catch {
            return { status: 'offline' };
        }
    }

    async upsertInvestorVectors(vectors) {
        const response = await fetch(`${this.#baseUrl}/vectors/investors/upsert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vectors })
        });
        return await response.json();
    }

    async upsertProductVectors(vectors) {
        const response = await fetch(`${this.#baseUrl}/vectors/products/upsert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vectors })
        });
        return await response.json();
    }

    async querySimilarInvestors(vector, n = 100) {
        const response = await fetch(`${this.#baseUrl}/vectors/investors/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vector, n })
        });
        return await response.json();
    }
}
