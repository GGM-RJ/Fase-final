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

const updateStock = async (updatedStock: StockItem[]): Promise<void> => {
    if (USE_CLOUD_DB) {
        // Warning: Bulk update depends on backend implementation. 
        // Ideally update item by item or use a bulk endpoint.
        return apiService.updateStock(updatedStock);
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
         // Fetch current, update, send back. Ideally backend handles atomic increment.
         const stock = await apiService.getStock();
         const item = stock.find(s => s.id === id);
         if (item) {
             item.quantity += quantityToAdd;
             await apiService.updateSingleStockItem(item);
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
             await apiService.updateSingleStockItem(item);
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
    updateStock,
    deleteWine,
    addStockQuantity,
    removeStockQuantity,
};