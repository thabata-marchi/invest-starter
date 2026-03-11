import { events } from "./constants.js";

export default class Events {

    static onTrainingComplete(callback) {
        document.addEventListener(events.trainingComplete, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTrainingComplete(data) {
        const event = new CustomEvent(events.trainingComplete, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onRecommend(callback) {
        document.addEventListener(events.recommend, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchRecommend(data) {
        const event = new CustomEvent(events.recommend, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onRecommendationsReady(callback) {
        document.addEventListener(events.recommendationsReady, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchRecommendationsReady(data) {
        const event = new CustomEvent(events.recommendationsReady, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTrainModel(callback) {
        document.addEventListener(events.modelTrain, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTrainModel(data) {
        const event = new CustomEvent(events.modelTrain, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTFVisLogs(callback) {
        document.addEventListener(events.tfvisLogs, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTFVisLogs(data) {
        const event = new CustomEvent(events.tfvisLogs, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTFVisorData(callback) {
        document.addEventListener(events.tfvisData, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTFVisorData(data) {
        const event = new CustomEvent(events.tfvisData, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onProgressUpdate(callback) {
        document.addEventListener(events.modelProgressUpdate, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchProgressUpdate(progressData) {
        const event = new CustomEvent(events.modelProgressUpdate, {
            detail: progressData
        });
        document.dispatchEvent(event);
    }

    static onInvestorSelected(callback) {
        document.addEventListener(events.investorSelected, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchInvestorSelected(data) {
        const event = new CustomEvent(events.investorSelected, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onInvestorsUpdated(callback) {
        document.addEventListener(events.investorsUpdated, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchInvestorsUpdated(data) {
        const event = new CustomEvent(events.investorsUpdated, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onInvestmentAdded(callback) {
        document.addEventListener(events.investmentAdded, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchInvestmentAdded(data) {
        const event = new CustomEvent(events.investmentAdded, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onInvestmentRemoved(callback) {
        document.addEventListener(events.investmentRemoved, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchInvestmentRemoved(data) {
        const event = new CustomEvent(events.investmentRemoved, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onVectorsReady(callback) {
        document.addEventListener(events.vectorsReady, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchVectorsReady(data) {
        const event = new CustomEvent(events.vectorsReady, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onChromaDBSynced(callback) {
        document.addEventListener(events.chromaDBSynced, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchChromaDBSynced(data) {
        const event = new CustomEvent(events.chromaDBSynced, {
            detail: data
        });
        document.dispatchEvent(event);
    }
}
