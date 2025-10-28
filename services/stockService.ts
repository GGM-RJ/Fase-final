import { StockItem } from '../types';
import { storageService } from './storageService';
import { initialStock } from '../data/wines';

const STOCK_KEY = 'stock';

const getStock = (): StockItem[] => {
    return storageService.getItem<StockItem[]>(STOCK_KEY, initialStock);
};

const saveStock = (stock: StockItem[]): void => {
    storageService.setItem(STOCK_KEY, stock);
};

const addWine = (newWine: Omit<StockItem, 'id'>): StockItem => {
    const stock = getStock();
    const newStockItem: StockItem = {
        ...newWine,
        id: stock.length > 0 ? Math.max(...stock.map(i => i.id)) + 1 : 1,
    };
    const updatedStock = [...stock, newStockItem];
    saveStock(updatedStock);
    return newStockItem;
};

const updateStock = (updatedStock: StockItem[]): void => {
    saveStock(updatedStock);
};

const deleteWine = (id: number): void => {
    let stock = getStock();
    stock = stock.filter(item => item.id !== id);
    saveStock(stock);
};

const addStockQuantity = (id: number, quantityToAdd: number): void => {
    const stock = getStock();
    const itemIndex = stock.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        stock[itemIndex].quantity += quantityToAdd;
        saveStock(stock);
    }
};

const removeStockQuantity = (id: number, quantityToRemove: number): void => {
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