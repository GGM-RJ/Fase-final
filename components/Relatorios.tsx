import React from 'react';
import { StockItem, TransferLog } from '../../types';
import RelatorioMovimentacao from './reports/RelatorioMovimentacao';

interface RelatoriosProps {
    stock: StockItem[];
    transferHistory: TransferLog[];
}

const Relatorios: React.FC<RelatoriosProps> = ({ stock, transferHistory }) => {
    return (
        <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Relatório de Movimentação</h2>
            <p className="text-gray-500 mb-6">
                Filtre o histórico de movimentações por período e por quinta, e exporte os dados para uma planilha Excel.
            </p>
            <RelatorioMovimentacao transferHistory={transferHistory} />
        </div>
    );
};

export default Relatorios;