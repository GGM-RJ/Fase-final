/**
 * Este arquivo serve como referência para quando você conectar seu Backend (Azure Functions).
 * O Cosmos DB não deve ser acessado diretamente do Front-end por segurança (chaves expostas).
 * Você deve criar uma Azure Function para cada operação.
 */

import { StockItem } from '../types';

const API_BASE_URL = '/api'; // URL da sua Azure Function

export const cosmosStockService = {
    async getStock(): Promise<StockItem[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/stock`);
            if (!response.ok) throw new Error('Falha ao buscar stock');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async addWine(wine: Omit<StockItem, 'id'>): Promise<StockItem | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wine)
            });
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }
};