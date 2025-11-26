import { TransferLog } from '../types';
import { storageService } from './storageService';
import { transferHistory as initialHistory } from '../data/dashboardData';
import { generateId } from '../utils/idGenerator';

const HISTORY_KEY = 'transferHistory';

const getTransferHistory = (): TransferLog[] => {
    return storageService.getItem<TransferLog[]>(HISTORY_KEY, initialHistory);
};

const saveTransferHistory = (history: TransferLog[]): void => {
    storageService.setItem(HISTORY_KEY, history);
};

const addTransfer = (newLog: TransferLog): void => {
    const history = getTransferHistory();
    // Ensure ID is generated if not provided (though App.tsx usually provides logic, we centralize safety here)
    const logWithId = {
        ...newLog,
        id: newLog.id || generateId()
    };
    const updatedHistory = [logWithId, ...history];
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