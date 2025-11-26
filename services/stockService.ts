import { StockItem, ID } from '../types';
import { storageService } from './storageService';
import { initialStock } from '../data/wines';
import { generateId } from '../utils/idGenerator';
import { apiService, USE_CLOUD_DB } from './api';

const STOCK_KEY = 'stock';

// Helper to simulate async delay for local storage to match API behavior
const mockAsync = <T>(data: T): Promise<T> => {
    return new Promise((resolve) => setTimeout(() => resolve(data), 100));
};

const getStock = async (): Promise<StockItem[]> => {
    if (USE_CLOUD_DB) return apiService.getStock();
    return mockAsync(storageService.getItem<StockItem[]>(STOCK_KEY, initialStock));
};

const saveStockLocal = (stock: StockItem[]): void => {
    storageService.setItem(STOCK_KEY, stock);
};

const addWine = async (newWine: Omit<StockItem, 'id'>): Promise<StockItem> => {
    const newStockItem: StockItem = {
        ...newWine,
        id: generateId(),
    };

    if (USE_CLOUD_DB) {
        return apiService.addWine(newStockItem);
    } else {
        const stock = storageService.getItem<StockItem[]>(STOCK_KEY, initialStock);
        const updatedStock = [...stock, newStockItem];
        saveStockLocal(updatedStock);
        return mockAsync(newStockItem);
    }
};

// Update a single item (preferred for Cloud DBs)
const updateItem = async (item: StockItem): Promise<void> => {
    if (USE_CLOUD_DB) {
        await apiService.updateStockItem(item);
    } else {
        const stock = storageService.getItem<StockItem[]>(STOCK_KEY, initialStock);
        const updatedStock = stock.map(s => s.id === item.id ? item : s);
        saveStockLocal(updatedStock);
        return mockAsync(undefined);
    }
};

// Deprecated for Cloud DB use, kept for compatibility if needed, but App.tsx should ideally use updateItem
const updateStock = async (updatedStock: StockItem[]): Promise<void> => {
    if (USE_CLOUD_DB) {
        // Fallback: iterate and update one by one since DAB REST doesn't support bulk PUT
        await Promise.all(updatedStock.map(item => apiService.updateStockItem(item)));
    } else {
        saveStockLocal(updatedStock);
        return mockAsync(undefined);
    }
};

const deleteWine = async (id: ID): Promise<void> => {
    if (USE_CLOUD_DB) {
        return apiService.deleteWine(id);
    } else {
        let stock = storageService.getItem<StockItem[]>(STOCK_KEY, initialStock);
        stock = stock.filter(item => item.id !== id);
        saveStockLocal(stock);
        return mockAsync(undefined);
    }
};

const addStockQuantity = async (id: ID, quantityToAdd: number): Promise<void> => {
    if (USE_CLOUD_DB) {
         const stock = await apiService.getStock();
         const item = stock.find(s => s.id === id);
         if (item) {
             item.quantity += quantityToAdd;
             await apiService.updateStockItem(item);
         }
    } else {
        const stock = storageService.getItem<StockItem[]>(STOCK_KEY, initialStock);
        const itemIndex = stock.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            stock[itemIndex].quantity += quantityToAdd;
            saveStockLocal(stock);
        }
        return mockAsync(undefined);
    }
};

const removeStockQuantity = async (id: ID, quantityToRemove: number): Promise<void> => {
     if (USE_CLOUD_DB) {
         const stock = await apiService.getStock();
         const item = stock.find(s => s.id === id);
         if (item) {
             const newQuantity = item.quantity - quantityToRemove;
             item.quantity = Math.max(0, newQuantity);
             await apiService.updateStockItem(item);
         }
    } else {
        const stock = storageService.getItem<StockItem[]>(STOCK_KEY, initialStock);
        const itemIndex = stock.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            const newQuantity = stock[itemIndex].quantity - quantityToRemove;
            stock[itemIndex].quantity = Math.max(0, newQuantity);
            saveStockLocal(stock);
        }
        return mockAsync(undefined);
    }
};

export const stockService = {
    getStock,
    addWine,
    updateItem,
    updateStock, // Kept for legacy compatibility
    deleteWine,
    addStockQuantity,
    removeStockQuantity,
};