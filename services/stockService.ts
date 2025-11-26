import { StockItem, ID } from '../types';
import { storageService } from './storageService';
import { initialStock } from '../data/wines';
import { generateId } from '../utils/idGenerator';

const STOCK_KEY = 'stock';

const getStock = (): StockItem[] => {
    return storageService.getItem<StockItem[]>(STOCK_KEY, initialStock);
};

const saveStock = (stock: StockItem[]): void => {
    storageService.setItem(STOCK_KEY, stock);
};

const addWine = (newWine: Omit<StockItem, 'id'>): StockItem => {
    const stock = getStock();
    // Use generateId() for Cosmos DB compatibility (string IDs)
    const newStockItem: StockItem = {
        ...newWine,
        id: generateId(),
    };
    const updatedStock = [...stock, newStockItem];
    saveStock(updatedStock);
    return newStockItem;
};

const updateStock = (updatedStock: StockItem[]): void => {
    saveStock(updatedStock);
};

const deleteWine = (id: ID): void => {
    let stock = getStock();
    stock = stock.filter(item => item.id !== id);
    saveStock(stock);
};

const addStockQuantity = (id: ID, quantityToAdd: number): void => {
    const stock = getStock();
    const itemIndex = stock.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        stock[itemIndex].quantity += quantityToAdd;
        saveStock(stock);
    }
};

const removeStockQuantity = (id: ID, quantityToRemove: number): void => {
    const stock = getStock();
    const itemIndex = stock.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        const newQuantity = stock[itemIndex].quantity - quantityToRemove;
        // For items in general stock (which this function serves via the UI), set quantity to 0 instead of removing.
        stock[itemIndex].quantity = Math.max(0, newQuantity);
        saveStock(stock);
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