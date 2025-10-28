// FIX: Define types used across the application to resolve import errors.
export type WineType = 'Tinto' | 'Branco' | 'Rosé' | 'Porto' | 'Espumante';

export interface StockItem {
  id: number;
  brand: string;
  wineName: string;
  wineType: WineType;
  quantity: number;
  quintaName?: string;
  lowStockAlert?: boolean;
}

export type TransferStatus = 'Pendente' | 'Aprovado' | 'Reprovado';

export interface TransferLog {
    id: number;
    date: Date;
    brand: string;
    wineName: string;
    quantity: number;
    fromQuinta: string;
    toQuinta: string;
    movementType: 'Entrada' | 'Saída';
    requesterName: string;
    toWhom: string;
    status: TransferStatus;
    approverName?: string;
}

export type UserRole = 'Supervisor' | 'Operador' | 'Visitante' | 'Quinta';

// Pages that can be assigned as permissions to an Operator role.
export type Permission = 'Vinhos' | 'Stock' | 'Movimentar Vinhos' | 'Histórico' | 'Relatórios' | 'Usuários' | 'Aprovar';


export interface User {
  id: number;
  username: string;
  password?: string; // Not always present on client-side user object
  name: string;
  role: UserRole;
  permissions?: Permission[];
  quintaName?: string; // Link user to a specific Quinta
}