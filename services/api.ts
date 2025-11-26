import { StockItem, TransferLog, User, ID } from '../types';

// Mude para true quando tiver o backend Azure pronto
export const USE_CLOUD_DB = false;

// URL base da sua API no Azure (ex: Azure Functions ou Static Web Apps Data API)
const API_BASE_URL = '/api'; 

async function request<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const headers = { 'Content-Type': 'application/json' };
    const config: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}

export const apiService = {
    // Stock
    getStock: () => request<StockItem[]>('/stock'),
    addWine: (wine: StockItem) => request<StockItem>('/stock', 'POST', wine),
    updateStock: (stock: StockItem[]) => request<void>('/stock/bulk', 'PUT', stock), // Azure function spec
    updateSingleStockItem: (item: StockItem) => request<StockItem>(`/stock/${item.id}`, 'PUT', item),
    deleteWine: (id: ID) => request<void>(`/stock/${id}`, 'DELETE'),

    // Transfers
    getTransfers: () => request<TransferLog[]>('/transfers'),
    addTransfer: (transfer: TransferLog) => request<TransferLog>('/transfers', 'POST', transfer),
    updateTransfer: (transfer: TransferLog) => request<TransferLog>(`/transfers/${transfer.id}`, 'PUT', transfer),

    // Users
    getUsers: () => request<User[]>('/users'),
    saveUser: (user: User) => request<User>('/users', 'POST', user),
    updateUser: (user: User) => request<User>(`/users/${user.id}`, 'PUT', user),
    deleteUser: (id: ID) => request<void>(`/users/${id}`, 'DELETE'),
};