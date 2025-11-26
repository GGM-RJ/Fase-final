import { StockItem, TransferLog, User, ID } from '../types';

// Altere para true para testar a conexão com o banco (requer deploy ou SWA CLI)
export const USE_CLOUD_DB = false;

// URL base do Data API Builder no Azure Static Web Apps
const API_BASE_URL = '/data-api/rest'; 

/**
 * Função genérica para chamadas ao Data API Builder.
 * O DAB retorna listas dentro de um objeto { value: [] }, então tratamos isso aqui.
 */
async function request<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    // Opcional: Se quiser simular roles do SWA localmente
    // headers['X-MS-API-ROLE'] = 'anonymous';

    const config: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            // Tenta ler o erro da API para debug
            const errorText = await response.text();
            console.error(`API Error (${response.status}):`, errorText);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        // Em DELETEs (204 No Content), não há JSON para parsear
        if (response.status === 204) {
            return {} as T;
        }

        const data = await response.json();
        
        // O Data API Builder retorna arrays dentro da propriedade "value"
        if (data && data.value && Array.isArray(data.value)) {
            return data.value as T;
        }
        
        return data as T;
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}

export const apiService = {
    // Stock (Entity: StockItem)
    getStock: () => request<StockItem[]>('/StockItem'),
    addWine: (wine: StockItem) => request<StockItem>('/StockItem', 'POST', wine),
    // DAB não suporta bulk update nativo via REST facilmente, então usamos updates individuais
    updateStockItem: (item: StockItem) => request<StockItem>(`/StockItem/id/${item.id}`, 'PUT', item),
    deleteWine: (id: ID) => request<void>(`/StockItem/id/${id}`, 'DELETE'),

    // Transfers (Entity: TransferLog)
    getTransfers: () => request<TransferLog[]>('/TransferLog'),
    addTransfer: (transfer: TransferLog) => request<TransferLog>('/TransferLog', 'POST', transfer),
    updateTransfer: (transfer: TransferLog) => request<TransferLog>(`/TransferLog/id/${transfer.id}`, 'PUT', transfer),

    // Users (Entity: User)
    getUsers: () => request<User[]>('/User'),
    saveUser: (user: User) => request<User>('/User', 'POST', user),
    updateUser: (user: User) => request<User>(`/User/id/${user.id}`, 'PUT', user),
    deleteUser: (id: ID) => request<void>(`/User/id/${id}`, 'DELETE'),
};
