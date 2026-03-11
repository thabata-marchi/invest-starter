export const events = {
    investorSelected: 'investor:selected',
    investorsUpdated: 'investors:updated',
    investmentAdded: 'investment:added',
    investmentRemoved: 'investment:remove',
    modelTrain: 'training:train',
    trainingComplete: 'training:complete',
    modelProgressUpdate: 'model:progress-update',
    recommendationsReady: 'recommendations:ready',
    recommend: 'recommend',
    vectorsReady: 'vectors:ready',
    chromaDBSynced: 'chromadb:synced',
}

export const workerEvents = {
    trainingComplete: 'training:complete',
    trainModel: 'train:model',
    recommend: 'recommend',
    trainingLog: 'training:log',
    progressUpdate: 'progress:update',
    tfVisData: 'tfvis:data',
    tfVisLogs: 'tfvis:logs',
    vectorsReady: 'vectors:ready',
}
