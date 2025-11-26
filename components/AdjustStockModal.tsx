import React, { useState, useEffect } from 'react';
import { StockItem, ID } from '../types';

interface AdjustStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    wine: StockItem | null;
    onAddQuantity: (id: ID, quantity: number) => void;
    onRemoveQuantity: (id: ID, quantity: number) => void;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ isOpen, onClose, wine, onAddQuantity, onRemoveQuantity }) => {
    const [quantityToAdd, setQuantityToAdd] = useState<number | ''>('');
    const [quantityToRemove, setQuantityToRemove] = useState<number | ''>('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setQuantityToAdd('');
            setQuantityToRemove('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen || !wine) return null;

    const handleAdd = () => {
        setError('');
        const numQuantity = Number(quantityToAdd);
        if (!quantityToAdd || numQuantity <= 0) {
            setError('Por favor, insira uma quantidade válida para adicionar.');
            return;
        }
        onAddQuantity(wine.id, numQuantity);
        onClose();
    };

    const handleRemove = () => {
        setError('');
        const numQuantity = Number(quantityToRemove);
        if (!quantityToRemove || numQuantity <= 0) {
            setError('Por favor, insira uma quantidade válida para remover.');
            return;
        }
        if (numQuantity > wine.quantity) {
            setError(`A quantidade a remover não pode ser maior que o stock atual (${wine.quantity}).`);
            return;
        }
        onRemoveQuantity(wine.id, numQuantity);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Ajustar Stock</h2>
                <p className="text-gray-600 mb-4">Vinho: <span className="font-semibold">{wine.brand} - {wine.wineName}</span></p>
                <p className="text-gray-500 mb-6">Stock atual: <span className="font-bold text-lg text-purple-700">{wine.quantity}</span> garrafas.</p>

                <div className="space-y-4">
                    {/* Add Section */}
                    <div>
                        <label htmlFor="quantityToAdd" className="block text-sm font-medium text-gray-700">Adicionar Garrafas</label>
                         <div className="mt-1 flex gap-2">
                             <input
                                type="number"
                                id="quantityToAdd"
                                value={quantityToAdd}
                                onChange={(e) => setQuantityToAdd(e.target.value === '' ? '' : Number(e.target.value))}
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                placeholder="Ex: 12"
                                min="1"
                            />
                            <button
                                onClick={handleAdd}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Adicionar
                            </button>
                         </div>
                    </div>

                    {/* Remove Section */}
                    <div>
                        <label htmlFor="quantityToRemove" className="block text-sm font-medium text-gray-700">Remover Garrafas</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="number"
                                id="quantityToRemove"
                                value={quantityToRemove}
                                onChange={(e) => setQuantityToRemove(e.target.value === '' ? '' : Number(e.target.value))}
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                placeholder="Ex: 5"
                                min="1"
                                max={wine.quantity}
                            />
                            <button
                                onClick={handleRemove}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                    
                    {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}

                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdjustStockModal;