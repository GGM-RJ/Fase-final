import { TransferLog } from '../types';
import { storageService } from './storageService';
import { transferHistory as initialHistory } from '../data/dashboardData';
import { generateId } from '../utils/idGenerator';
import { apiService, USE_CLOUD_DB } from './api';

const HISTORY_KEY = 'transferHistory';

const mockAsync = <T>(data: T): Promise<T> => {
    return new Promise((resolve) => setTimeout(() => resolve(data), 100));
};

const getTransferHistory = async (): Promise<TransferLog[]> => {
    if (USE_CLOUD_DB) return apiService.getTransfers();
    // Re-hydrate dates from local storage strings
    const history = storageService.getItem<any[]>(HISTORY_KEY, initialHistory);
    const parsedHistory = history.map(h => ({...h, date: new Date(h.date)}));
    return mockAsync(parsedHistory);
};

const addTransfer = async (newLog: TransferLog): Promise<void> => {
    const logWithId = {
        ...newLog,
        id: newLog.id || generateId()
    };

    if (USE_CLOUD_DB) {
        await apiService.addTransfer(logWithId);
    } else {
        const history = storageService.getItem<TransferLog[]>(HISTORY_KEY, initialHistory);
        const updatedHistory = [logWithId, ...history];
        storageService.setItem(HISTORY_KEY, updatedHistory);
        await mockAsync(undefined);
    }
};

const updateTransfer = async (updatedLog: TransferLog): Promise<void> => {
    if (USE_CLOUD_DB) {
        await apiService.updateTransfer(updatedLog);
    } else {
        const history = storageService.getItem<TransferLog[]>(HISTORY_KEY, initialHistory);
        const updatedHistory = history.map(log => log.id === updatedLog.id ? updatedLog : log);
        storageService.setItem(HISTORY_KEY, updatedHistory);
        await mockAsync(undefined);
    }
}

export const transferService = {
    getTransferHistory,
    addTransfer,
    updateTransfer,
};