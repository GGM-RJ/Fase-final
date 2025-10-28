import React, { useState, useMemo } from 'react';
import { StockItem } from '../types';
import AddWineModal from './AddWineModal';
import AdjustStockModal from './AdjustStockModal';
import { useAuth } from '../contexts/AuthContext';

interface StockProps {
  stock: StockItem[];
  onAddWine: (newWine: Omit<StockItem, 'id'>) => void;
  onDeleteWine: (id: number) => void;
  onAddStockQuantity: (id: number, quantity: number) => void;
  onRemoveStockQuantity: (id: number, quantity: number) => void;
}

const Stock: React.FC<StockProps> = ({ stock, onAddWine, onDeleteWine, onAddStockQuantity, onRemoveStockQuantity }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedWine, setSelectedWine] = useState<StockItem | null>(null);
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneralStockExpanded, setIsGeneralStockExpanded] = useState(false);

  const canAddWine = currentUser?.role === 'Supervisor' || 
                     (currentUser?.role === 'Operador' && currentUser.permissions?.includes('Stock'));
                     
  const canDeleteWine = currentUser?.role === 'Supervisor';

  const generalStock = stock.filter(item => !item.quintaName);
  const quintaStock = stock.filter(item => item.quintaName);

  const filterStock = (data: StockItem[]) => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      item.brand.toLowerCase().includes(term) ||
      item.wineName.toLowerCase().includes(term)
    );
  };
  
  const quintaStockSummary = useMemo(() => {
    const summary: { [key: string]: number } = {};
    
    quintaStock.forEach(item => {
        if (item.quintaName) {
            if (summary[item.quintaName]) {
                summary[item.quintaName] += item.quantity;
            } else {
                summary[item.quintaName] = item.quantity;
            }
        }
    });

    return Object.entries(summary).map(([quintaName, totalQuantity]) => ({
        quintaName,
        totalQuantity
    })).sort((a, b) => a.quintaName.localeCompare(b.quintaName));

  }, [quintaStock]);


  const filteredGeneralStock = filterStock(generalStock);
  const generalStockToShow = isGeneralStockExpanded ? filteredGeneralStock : filteredGeneralStock.slice(0, 5);
  
  const handleOpenAdjustModal = (item: StockItem) => {
    setSelectedWine(item);
    setIsAdjustModalOpen(true);
  };


  return (
    <>
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Stock</h2>
          {canAddWine && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Adicionar Vinho
            </button>
          )}
        </div>
        
        {/* Estoque Geral - Detailed List */}
        <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Stock Geral</h3>

            <div className="mb-6">
                <input 
                    type="text"
                    placeholder="Pesquisar no Stock Geral..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Marca</th>
                        <th scope="col" className="px-6 py-3">Nome do Vinho</th>
                        <th scope="col" className="px-6 py-3">Tipo</th>
                        <th scope="col" className="px-6 py-3 text-right">Quantidade</th>
                        {canDeleteWine && <th scope="col" className="px-6 py-3 text-center">Ações</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {generalStockToShow.map((item) => (
                        <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{item.brand}</td>
                          <td className="px-6 py-4">{item.wineName}</td>
                          <td className="px-6 py-4">{item.wineType}</td>
                          <td className="px-6 py-4 text-right font-bold text-gray-800">{item.quantity}</td>
                          {canDeleteWine && (
                            <td className="px-6 py-4 text-center">
                                <button 
                                    onClick={() => handleOpenAdjustModal(item)}
                                    className="font-medium text-red-600 hover:underline"
                                >
                                    Ajustar / Excluir
                                </button>
                            </td>
                          )}
                        </tr>
                    ))}
                    </tbody>
                </table>
                {filteredGeneralStock.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum item encontrado.</p>}
            </div>

            {filteredGeneralStock.length > 5 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setIsGeneralStockExpanded(!isGeneralStockExpanded)}
                  className="px-4 py-2 text-sm text-purple-600 font-semibold rounded-md hover:bg-purple-50 focus:outline-none"
                >
                  {isGeneralStockExpanded ? 'Ver menos' : 'Ver mais'}
                </button>
              </div>
            )}
        </div>
        
        {/* Estoque nas Quintas - Summary */}
        <div>
            <h3 className="text-xl font-bold text-gray-700 mb-4">Stock nas Quintas</h3>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Quinta</th>
                        <th scope="col" className="px-6 py-3 text-right">Total de Garrafas</th>
                    </tr>
                    </thead>
                    <tbody>
                    {quintaStockSummary.map((item) => (
                        <tr key={item.quintaName} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{item.quintaName}</td>
                            <td className="px-6 py-4 text-right font-bold text-gray-800">{item.totalQuantity}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {quintaStockSummary.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum item em stock nas quintas.</p>}
            </div>
        </div>
      </div>
      {canAddWine && (
        <AddWineModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddWine={onAddWine}
        />
      )}
      {canDeleteWine && (
        <AdjustStockModal
            isOpen={isAdjustModalOpen}
            onClose={() => setIsAdjustModalOpen(false)}
            wine={selectedWine}
            onAddQuantity={onAddStockQuantity}
            onRemoveQuantity={onRemoveStockQuantity}
            onDelete={onDeleteWine}
        />
      )}
    </>
  );
};

export default Stock;