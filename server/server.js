import express from 'express';
import cors from 'cors';
import { ChromaService } from './chromaService.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const chromaService = new ChromaService();

let initialized = false;

async function ensureInit() {
    if (!initialized) {
        await chromaService.initCollections();
        initialized = true;
    }
}

app.get('/api/health', async (req, res) => {
    try {
        await ensureInit();
        res.json({ status: 'ok' });
    } catch (error) {
        res.status(503).json({ status: 'error', message: error.message });
    }
});

app.post('/api/vectors/investors/upsert', async (req, res) => {
    try {
        await ensureInit();
        const result = await chromaService.upsertInvestors(req.body.vectors);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/vectors/products/upsert', async (req, res) => {
    try {
        await ensureInit();
        const result = await chromaService.upsertProducts(req.body.vectors);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/vectors/investors/query', async (req, res) => {
    try {
        await ensureInit();
        const { vector, n } = req.body;
        const result = await chromaService.querySimilarInvestors(vector, n);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`ChromaDB proxy server running on http://localhost:${PORT}`);
    console.log('Make sure ChromaDB is running: docker run -p 8000:8000 chromadb/chroma');
});
