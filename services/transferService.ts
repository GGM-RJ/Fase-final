import { TransferLog } from '../types';
import { storageService } from './storageService';
import { transferHistory as initialHistory } from '../data/dashboardData';

const HISTORY_KEY = 'transferHistory';

const getTransferHistory = (): TransferLog[] => {
    return storageService.getItem<TransferLog[]>(HISTORY_KEY, initialHistory);
};

const saveTransferHistory = (history: TransferLog[]): void => {
    storageService.setItem(HISTORY_KEY, history);
};

const addTransfer = (newLog: TransferLog): void => {
    const history = getTransferHistory();
    const updatedHistory = [newLog, ...history];
    saveTransferHistory(updatedHistory);
};

const updateTransfer = (updatedLog: TransferLog): void => {
    const history = getTransferHistory();
    const updatedHistory = history.map(log => log.id === updatedLog.id ? updatedLog : log);
    saveTransferHistory(updatedHistory);
}

export const transferService = {
    getTransferHistory,
    addTransfer,
    updateTransfer,
};