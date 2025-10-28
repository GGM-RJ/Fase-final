import { TransferLog } from '../types';

export const quintas = [
  { name: 'Quinta do Bomfim' },
  { name: 'Quinta dos Malvedos' },
  { name: 'Quinta dos Canais' },
  { name: 'Quinta do Vesuvio' },
];

const now = new Date();
const yesterday = new Date();
yesterday.setDate(now.getDate() - 1);
const lastMonth = new Date();
lastMonth.setMonth(now.getMonth() - 1);


export const transferHistory: TransferLog[] = [
    { id: 1, date: now, brand: 'Quinta do Crasto', wineName: 'Crasto Superior', quantity: 5, fromQuinta: 'Stock Geral', toQuinta: 'Quinta do Bomfim', movementType: 'Saída', requesterName: 'Ana Silva (Supervisor)', toWhom: 'Evento Interno', status: 'Aprovado', approverName: 'Ana Silva (Supervisor)' },
    { id: 2, date: yesterday, brand: 'Cartuxa', wineName: 'Pêra-Manca', quantity: 10, fromQuinta: 'Quinta dos Malvedos', toQuinta: 'Quinta do Bomfim', movementType: 'Saída', requesterName: 'Gestor Quinta dos Malvedos', toWhom: 'Transferência de estoque', status: 'Aprovado', approverName: 'Ana Silva (Supervisor)' },
    { id: 3, date: lastMonth, brand: 'Herdade do Esporão', wineName: 'Reserva', quantity: 15, fromQuinta: 'Stock Geral', toQuinta: 'Quinta dos Canais', movementType: 'Saída', requesterName: 'Ana Silva (Supervisor)', toWhom: 'Venda para Cliente', status: 'Aprovado', approverName: 'Ana Silva (Supervisor)' },
    { id: 4, date: new Date('2023-10-26T10:30:00Z'), brand: 'Quinta do Crasto', wineName: 'Crasto Superior', quantity: 24, fromQuinta: 'Stock Geral', toQuinta: 'Quinta do Bomfim', movementType: 'Saída', requesterName: 'Ana Silva (Supervisor)', toWhom: 'Gerente da Quinta', status: 'Aprovado', approverName: 'Ana Silva (Supervisor)' },
    { id: 5, date: new Date('2023-10-25T15:00:00Z'), brand: 'Cartuxa', wineName: 'Pêra-Manca', quantity: 12, fromQuinta: 'Quinta dos Malvedos', toQuinta: 'Stock Geral', movementType: 'Entrada', requesterName: 'Ana Silva (Supervisor)', toWhom: 'Armazém Central', status: 'Aprovado', approverName: 'Ana Silva (Supervisor)' },
    { id: 6, date: new Date('2023-10-24T09:15:00Z'), brand: 'Taylor\'s', wineName: 'Late Bottled Vintage', quantity: 6, fromQuinta: 'Quinta dos Canais', toQuinta: 'Quinta do Vesuvio', movementType: 'Saída', requesterName: 'Ana Silva (Supervisor)', toWhom: 'Visitante VIP', status: 'Reprovado' },
];