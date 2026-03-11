# Invest Starter

Educational project developed during the **AI Engineering postgraduate program at UNIPDS**, coordinated by **Erick Wendel**.

Investment recommendation system for **beginners/newcomers** who are learning to invest, using Machine Learning in the browser.

## Demo
▶ [Watch the demo](docs/demo/video/demo.mp4)

![Demo](./docs/demo/video/demo.gif)

## About the Project

This project was developed as part of **Module 3 of the AI Engineering postgraduate program at UNIPDS**. The goal is to train an ML (Machine Learning) model with TensorFlow.js, save client and product vectors in **ChromaDB** (vector database), and at prediction time query the 100 most similar investors in the database before running `model.predict()`.

The system works as a **digital advisor** that understands a person's profile (income, knowledge level, loss tolerance, life goals) and recommends suitable financial products, prioritizing safety and simplicity for those just getting started.

### Features for Beginners

- **Knowledge level** of the investor (never invested / knows the basics / intermediate)
- **Loss tolerance** (can't lose anything / accepts small losses / accepts risk)
- **Complexity** of products (simple / medium / advanced) — the model learns not to recommend volatile stocks to someone who has never invested
- **Educational tips** on each product card ("What is this?")
- Visual **badges** such as "Ideal for beginners", "FGC Protection", "Fixed income"

## Architecture

The project follows the **MVC with events** (Event-Driven) pattern, using Vanilla JS without frameworks. The same architecture as the reference project [exemplo-01-ecommerce-recomendations-template](../exemplo-01-ecommerce-recomendations-template/).

```
invest-starter/
├── index.html                         # Bootstrap 5 layout + TF.js via CDN
├── style.css                          # Green + white theme
├── package.json                       # browser-sync + concurrently + express + chromadb
├── scripts/
│   └── process-kaggle-data.js         # Kaggle CSV → JSON
├── server/
│   ├── server.js                      # Express proxy for ChromaDB (port 3001)
│   └── chromaService.js               # ChromaDB client wrapper
├── data/
│   ├── investors.json                 # 20 investor profiles
│   └── products.json                  # 16 financial products
└── src/
    ├── index.js                       # Bootstrap and dependency injection
    ├── workers/
    │   └── modelTrainingWorker.js     # Feature encoding + training + predict (Web Worker)
    ├── controller/
    │   ├── ModelTrainingController.js  # Coordinates training UI and events
    │   ├── WorkerController.js        # Manages Web Worker + ChromaDB sync
    │   ├── InvestorController.js      # Investor selection and investments
    │   ├── ProductController.js       # Product display and invest action
    │   └── TFVisorController.js       # TF.js chart visualization
    ├── service/
    │   ├── InvestorService.js         # Persistence via sessionStorage
    │   ├── ProductService.js          # Product fetch
    │   └── ChromaDBService.js         # Fetch wrapper for Express/ChromaDB API
    ├── view/
    │   ├── View.js                    # Base with template loading
    │   ├── InvestorView.js            # Investor profile panel
    │   ├── ProductView.js             # Financial products grid
    │   ├── ModelTrainingView.js       # Training UI (buttons, progress)
    │   ├── TFVisorView.js             # Loss/accuracy charts
    │   └── templates/
    │       ├── product-card.html      # Product card template
    │       └── past-investment.html   # Past investment template
    └── events/
        ├── constants.js               # Event names
        └── events.js                  # Pub/Sub via CustomEvent on document
```

## How It Works

### 1. Feature Engineering

**Investor Vector (~19 dimensions):**

| Feature | Encoding | Weight |
|---------|----------|--------|
| Knowledge level | one-hot (3) | 0.20 |
| Loss tolerance | one-hot (3) | 0.20 |
| Risk profile | one-hot (3) | 0.15 |
| Investment horizon | one-hot (3) | 0.10 |
| Life goals | multi-hot (5) | 0.10 |
| Age | normalized | 0.10 |
| Monthly income | normalized | 0.15 |

**Product Vector (~13 dimensions):**

| Feature | Encoding | Weight |
|---------|----------|--------|
| Type (CDB/LCI/LCA/Stock/Fund/Treasury) | one-hot (6) | 0.15 |
| Complexity (simple/medium/advanced) | one-hot (3) | 0.20 |
| Expected return | normalized | — |
| Risk (volatility) | normalized | — |
| Liquidity (D+N) | normalized | — |
| Minimum investment | normalized | — |

### 2. Neural Network

```
Input[32] → Dense(128, ReLU) → Dense(64, ReLU) → Dense(32, ReLU) → Dense(1, Sigmoid)

Optimizer: Adam (lr=0.01)
Loss: Binary Crossentropy
Epochs: 100 | Batch: 32
```

The model runs entirely in a **Web Worker** (does not block the UI).

### 3. ChromaDB (Vector Database)

After training, vectors are saved to ChromaDB via the Express proxy:

```
Train → Worker computes vectors → main thread → Express (3001) → ChromaDB (8000)
Recommend → ChromaDB returns 100 similar → Worker runs predict() → ranking
```

**Collections:** `investor_vectors` and `product_vectors` (cosine distance)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) (for ChromaDB — optional)

## How to Run

```bash
# Clone and install
cd meu-primeiro-investimento
npm install

# Option 1: Frontend only (without ChromaDB)
npm run dev
# Open http://localhost:3000

# Option 2: Frontend + ChromaDB
docker run -p 8000:8000 chromadb/chroma   # Terminal 1
npm start                                  # Terminal 2
# Open http://localhost:3000
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts frontend only with browser-sync |
| `npm start` | Starts frontend + Express server (ChromaDB proxy) |
| `npm run server` | Starts Express server only |
| `npm run process-data` | Processes Kaggle CSV and generates investors.json |

## Kaggle Data (Optional)

To generate new investors from real data:

1. Download the [Bank Marketing Dataset](https://www.kaggle.com/datasets/henriqueyamahata/bank-marketing) from Kaggle
2. Place the `bank-additional-full.csv` file in the `scripts/` folder
3. Run:

```bash
npm run process-data
```

The script derives investor profiles (knowledge, tolerance, risk) from the CSV demographic data.

## Technologies

- **Vanilla JavaScript** (ES Modules, no frameworks)
- **TensorFlow.js** — training and prediction in the browser via Web Worker
- **TensorFlow.js Vis** — real-time accuracy and loss charts
- **ChromaDB** — vector database for similarity search
- **Express** — proxy server for ChromaDB
- **Bootstrap 5** — responsive UI
- **browser-sync** — live reload for development

## License

MIT
