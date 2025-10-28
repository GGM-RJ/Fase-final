import React, { useMemo } from 'react';
import { StockItem } from '../../types';
import { handlePrint } from '../../utils/print';

interface RelatorioEstoqueProps {
  stock: StockItem[];
}

const RelatorioEstoque: React.FC<RelatorioEstoqueProps> = ({ stock }) => {
  const groupedStock = useMemo(() => {
    const groups: { [key: string]: StockItem[] } = { 'Stock Geral': [] };
    stock.forEach(item => {
      const key = item.quintaName || 'Stock Geral';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return groups;
  }, [stock]);

  const generateReportContent = () => {
    // FIX: Explicitly type `items` as StockItem[] to resolve type inference issue where it was considered `unknown`.
    return Object.entries(groupedStock).map(([quinta, items]: [string, StockItem[]]) => {
        if (items.length === 0) return '';
        const tableRows = items.map(item => `
            <tr>
                <td>${item.brand}</td>
                <td>${item.wineName}</td>
                <td>${item.wineType}</td>
                <td style="text-align: right; font-weight: bold;">${item.quantity}</td>
            </tr>
        `).join('');
        return `
            <h2>${quinta}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Marca</th>
                        <th>Nome do Vinho</th>
                        <th>Tipo</th>
                        <th style="text-align: right;">Quantidade</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
    }).join('');
  };

  const onPrint = () => {
    handlePrint('Estoque por Quinta', generateReportContent());
  };

  return (
    <div>
        <div className="flex justify-end">
             <button onClick={onPrint} className="px-4 py-2 text-sm bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700">
                Imprimir Relatório
            </button>
        </div>
        {/* FIX: Explicitly type `items` as StockItem[] to resolve type inference issue where it was considered `unknown`. */}
        {Object.entries(groupedStock).map(([quinta, items]: [string, StockItem[]]) => {
            if (items.length === 0 && quinta !== 'Stock Geral') return null;
            return (
                <div key={quinta} className="mt-6">
                    <h3 className="text-xl font-bold text-gray-700">{quinta}</h3>
                    {items.length > 0 ? (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Marca</th>
                                    <th scope="col" className="px-6 py-3">Nome do Vinho</th>
                                    <th scope="col" className="px-6 py-3">Tipo</th>
                                    <th scope="col" className="px-6 py-3 text-right">Quantidade</th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.map(item => (
                                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{item.brand}</td>
                                        <td className="px-6 py-4">{item.wineName}</td>
                                        <td className="px-6 py-4">{item.wineType}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-800">{item.quantity}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                         <p className="text-gray-500 mt-2">Nenhum item em estoque.</p>
                    )}
                </div>
            )
        })}
    </div>
  );
};

export default RelatorioEstoque;