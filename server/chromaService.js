import { ChromaClient } from 'chromadb';

export class ChromaService {
    #client;
    #investorCollection;
    #productCollection;

    constructor() {
        this.#client = new ChromaClient({ path: 'http://localhost:8000' });
    }

    async initCollections() {
        this.#investorCollection = await this.#client.getOrCreateCollection({
            name: 'investor_vectors',
            metadata: { 'hnsw:space': 'cosine' }
        });

        this.#productCollection = await this.#client.getOrCreateCollection({
            name: 'product_vectors',
            metadata: { 'hnsw:space': 'cosine' }
        });

        console.log('ChromaDB collections initialized');
    }

    async upsertInvestors(vectors) {
        const ids = vectors.map(v => v.id);
        const embeddings = vectors.map(v => v.vector);
        const metadatas = vectors.map(v => v.metadata);

        await this.#investorCollection.upsert({
            ids,
            embeddings,
            metadatas
        });

        return { success: true, count: ids.length };
    }

    async upsertProducts(vectors) {
        const ids = vectors.map(v => v.id);
        const embeddings = vectors.map(v => v.vector);
        const metadatas = vectors.map(v => v.metadata);

        await this.#productCollection.upsert({
            ids,
            embeddings,
            metadatas
        });

        return { success: true, count: ids.length };
    }

    async querySimilarInvestors(queryEmbedding, nResults = 100) {
        const results = await this.#investorCollection.query({
            queryEmbeddings: [queryEmbedding],
            nResults
        });

        return {
            ids: results.ids[0],
            distances: results.distances[0],
            metadatas: results.metadatas[0]
        };
    }
}
