import { InvestorController } from './controller/InvestorController.js';
import { ProductController } from './controller/ProductController.js';
import { ModelController } from './controller/ModelTrainingController.js';
import { TFVisorController } from './controller/TFVisorController.js';
import { TFVisorView } from './view/TFVisorView.js';
import { InvestorService } from './service/InvestorService.js';
import { ProductService } from './service/ProductService.js';
import { ChromaDBService } from './service/ChromaDBService.js';
import { InvestorView } from './view/InvestorView.js';
import { ProductView } from './view/ProductView.js';
import { ModelView } from './view/ModelTrainingView.js';
import Events from './events/events.js';
import { WorkerController } from './controller/WorkerController.js';

// Create shared services
const investorService = new InvestorService();
const productService = new ProductService();
const chromaDBService = new ChromaDBService();

// Create views
const investorView = new InvestorView();
const productView = new ProductView();
const modelView = new ModelView();
const tfVisorView = new TFVisorView();
const mlWorker = new Worker('/src/workers/modelTrainingWorker.js', { type: 'module' });

// Set up worker message handler
const w = WorkerController.init({
    worker: mlWorker,
    events: Events,
    chromaDBService,
});

const investors = await investorService.getDefaultInvestors();
w.triggerTrain(investors);


ModelController.init({
    modelView,
    investorService,
    events: Events,
});

TFVisorController.init({
    tfVisorView,
    events: Events,
});

ProductController.init({
    productView,
    investorService,
    productService,
    events: Events,
});

const investorController = InvestorController.init({
    investorView,
    investorService,
    productService,
    events: Events,
});

investorController.renderInvestors(investorService.getNewInvestorTemplate());
