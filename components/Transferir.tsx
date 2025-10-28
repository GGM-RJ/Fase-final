import React, { useState, useMemo, useEffect } from 'react';
import { StockItem, TransferLog } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { quintaService } from '../services/quintaService';

interface TransferirProps {
  stock: StockItem[];
  onTransfer: (transferLog: Omit<TransferLog, 'id' | 'date' | 'status'>) => void;
}

// Interface for items in the transfer list
interface TransferItem {
  brand: string;
  wineName: string;
  quantity: number;
}

const Transferir: React.FC<TransferirProps> = ({ stock, onTransfer }) => {
    const { currentUser } = useAuth();

    // Main form state
    const [fromQuinta, setFromQuinta] = useState('');
    const [toQuinta, setToQuinta] = useState('');
    const [movementType, setMovementType] = useState<'Entrada' | 'Saída'>('Saída');
    const [requesterName, setRequesterName] = useState('');
    const [toWhom, setToWhom] = useState('');
    const [isConsumption, setIsConsumption] = useState(false);
    const [error, setError] = useState('');
    
    // State for adding a single item
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWineIdentifier, setSelectedWineIdentifier] = useState<string>('');
    const [quantity, setQuantity] = useState<number | ''>('');
    
    // State for the list of items to transfer
    const [transferItems, setTransferItems] = useState<TransferItem[]>([]);

    const isQuintaUser = currentUser?.role === 'Quinta';

    useEffect(() => {
        if (isQuintaUser && currentUser.quintaName) {
            setFromQuinta(currentUser.quintaName);
            setRequesterName(currentUser.name);
        } else {
             setRequesterName(currentUser?.name || '');
        }
    }, [currentUser, isQuintaUser]);
    
     useEffect(() => {
        if (isConsumption) {
            setToQuinta('Consumo');
        } else {
            if (toQuinta === 'Consumo') {
                setToQuinta('');
            }
        }
    }, [isConsumption]);

    const availableWines = useMemo(() => {
        if (!fromQuinta) return [];

        const fromIdentifier = fromQuinta === 'Stock Geral' ? undefined : fromQuinta;
        const stockToFilter = stock.filter(item => item.quintaName === fromIdentifier && item.quantity > 0);
        
        const wines = new Map<string, { brand: string, wineName: string }>();
        stockToFilter.forEach(item => {
            const key = `${item.brand} - ${item.wineName}`;
            const alreadyAdded = transferItems.some(addedItem => addedItem.brand === item.brand && addedItem.wineName === item.wineName);
            if (!wines.has(key) && !alreadyAdded) {
                wines.set(key, { brand: item.brand, wineName: item.wineName });
            }
        });

        const wineList = Array.from(wines.values()).map(w => `${w.brand} - ${w.wineName}`).sort();
        
        if (!searchTerm) return wineList;
        return wineList.filter(wine => wine.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [stock, searchTerm, fromQuinta, transferItems]);
    
    useEffect(() => {
        // Auto-select wine if the search narrows down to a single option.
        if (availableWines.length === 1) {
            setSelectedWineIdentifier(availableWines[0]);
        } else if (selectedWineIdentifier && !availableWines.includes(selectedWineIdentifier)) {
            // Clear selection if it's no longer in the list of available options.
            // This happens when the search term changes and the selection is filtered out.
            setSelectedWineIdentifier('');
        }
    }, [availableWines, selectedWineIdentifier]);


    const selectedWineInfo = useMemo(() => {
        if (!selectedWineIdentifier) return null;
        const [brand, wineName] = selectedWineIdentifier.split(' - ');
        return { brand, wineName };
    }, [selectedWineIdentifier]);
    
    const availableQuantity = useMemo(() => {
        if (!selectedWineInfo || !fromQuinta) return 0;
        const fromIdentifier = fromQuinta === 'Stock Geral' ? undefined : fromQuinta;
        const stockItem = stock.find(item => 
            item.brand === selectedWineInfo.brand &&
            item.wineName === selectedWineInfo.wineName &&
            item.quintaName === fromIdentifier
        );
        return stockItem?.quantity || 0;
    }, [stock, selectedWineInfo, fromQuinta]);
    
    const allQuintaNames = quintaService.getQuintas().map(q => q.name);

    const handleAddToList = () => {
        setError('');

        if (!selectedWineIdentifier || !quantity) {
            setError('Selecione um vinho e uma quantidade para adicionar.');
            return;
        }

        const numQuantity = Number(quantity);
        if (numQuantity <= 0) {
            setError('A quantidade deve ser maior que zero.');
            return;
        }

        if (numQuantity > availableQuantity) {
            setError(`Quantidade indisponível. Máximo em estoque: ${availableQuantity}`);
            return;
        }

        const [brand, wineName] = selectedWineIdentifier.split(' - ');
        setTransferItems(prev => [...prev, { brand, wineName, quantity: numQuantity }]);
        setSelectedWineIdentifier('');
        setQuantity('');
        setSearchTerm('');
    };

    const handleRemoveFromList = (index: number) => {
        setTransferItems(prev => prev.filter((_, i) => i !== index));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (transferItems.length === 0) {
            setError('Adicione pelo menos um vinho à lista de transferência.');
            return;
        }

        if (!fromQuinta || !toQuinta || !requesterName || !toWhom) {
            setError('Todos os campos de Detalhes da Transferência são obrigatórios.');
            return;
        }

        transferItems.forEach(item => {
            onTransfer({
                brand: item.brand,
                wineName: item.wineName,
                quantity: item.quantity,
                fromQuinta,
                toQuinta: isConsumption ? 'Consumo' : toQuinta,
                movementType,
                requesterName,
                toWhom,
            });
        });

        setTransferItems([]);
        setSelectedWineIdentifier('');
        setQuantity('');
        setSearchTerm('');
        if (!isQuintaUser) setFromQuinta('');
        setToQuinta('');
        if (!isQuintaUser) setRequesterName(currentUser?.name || '');
        setToWhom('');
        setIsConsumption(false);
        alert('Solicitação de transferência registrada com sucesso para todos os itens!');
    };
    
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-gray-700";

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Movimentar Vinhos</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <fieldset className="space-y-4 border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2 text-gray-700">1. Detalhes da Transferência</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fromQuinta" className={`${labelClasses} required`}>Quinta de Origem *</label>
                            <select id="fromQuinta" value={fromQuinta} onChange={e => setFromQuinta(e.target.value)} className={inputClasses} disabled={isQuintaUser || transferItems.length > 0} required>
                                <option value="">Selecione a origem</option>
                                <option value="Stock Geral">Stock Geral</option>
                                {allQuintaNames.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                            {transferItems.length > 0 && <p className="text-xs text-gray-500 mt-1">Limpe a lista abaixo para alterar a origem.</p>}
                        </div>
                        <div>
                            <label htmlFor="toQuinta" className={`${labelClasses} required`}>Quinta de Destino *</label>
                            <select id="toQuinta" value={toQuinta} onChange={e => setToQuinta(e.target.value)} className={inputClasses} disabled={isConsumption} required={!isConsumption}>
                                <option value="">Selecione o destino</option>
                                {!isQuintaUser && <option value="Stock Geral">Stock Geral</option>}
                                {allQuintaNames.filter(q => q !== fromQuinta).map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="pt-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <input type="checkbox" checked={isConsumption} onChange={(e) => setIsConsumption(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"/>
                            <span>Marcar como Consumo (saída de estoque sem transferência)</span>
                        </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="requesterName" className={`${labelClasses} required`}>Solicitante *</label>
                            <input type="text" id="requesterName" value={requesterName} onChange={e => setRequesterName(e.target.value)} className={inputClasses} disabled={isQuintaUser} required/>
                        </div>
                        <div>
                            <label htmlFor="toWhom" className={`${labelClasses} required`}>Para Quem/Finalidade *</label>
                            <input type="text" id="toWhom" value={toWhom} onChange={e => setToWhom(e.target.value)} className={inputClasses} placeholder="Ex: Cliente, Evento, Reposição" required/>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="movementType" className={`${labelClasses} required`}>Tipo de Movimento *</label>
                        <select id="movementType" value={movementType} onChange={e => setMovementType(e.target.value as 'Entrada' | 'Saída')} className={inputClasses + " max-w-xs"} required>
                            <option value="Saída">Saída</option>
                            <option value="Entrada">Entrada</option>
                        </select>
                    </div>
                </fieldset>

                <fieldset className="space-y-4 border p-4 rounded-md" disabled={!fromQuinta}>
                     <legend className="text-lg font-semibold px-2 text-gray-700">2. Adicionar Vinhos</legend>
                     {!fromQuinta && <div className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md border border-yellow-200">Selecione uma Quinta de Origem para começar a adicionar vinhos.</div>}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                         <div>
                            <label htmlFor="search-wine" className={labelClasses}>Pesquisar Vinho</label>
                            <input id="search-wine" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={inputClasses} placeholder="Filtrar vinhos disponíveis..."/>
                        </div>
                        <div>
                            <label htmlFor="wine" className={`${labelClasses} required`}>Vinho a ser Movimentado *</label>
                            <select id="wine" value={selectedWineIdentifier} onChange={e => setSelectedWineIdentifier(e.target.value)} className={inputClasses}>
                                <option value="">Selecione um vinho</option>
                                {availableWines.map(wine => <option key={wine} value={wine}>{wine}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div>
                            <label htmlFor="quantity" className={labelClasses}>Quantidade (Garrafas) *</label>
                            <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} className={inputClasses} placeholder={availableQuantity > 0 ? `Disponível: ${availableQuantity}` : ''} min="1" max={availableQuantity}/>
                        </div>
                        <div className="pt-6">
                            <button type="button" onClick={handleAddToList} disabled={!selectedWineIdentifier || !quantity} className="w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Adicionar à Lista
                            </button>
                        </div>
                     </div>
                </fieldset>
                
                {transferItems.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Vinhos a Transferir ({transferItems.reduce((acc, item) => acc + item.quantity, 0)} garrafas)</h3>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Vinho</th>
                                        <th scope="col" className="px-6 py-3 text-right">Quantidade</th>
                                        <th scope="col" className="px-6 py-3 text-center">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transferItems.map((item, index) => (
                                        <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{item.brand} - {item.wineName}</td>
                                            <td className="px-6 py-4 text-right font-bold">{item.quantity}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button type="button" onClick={() => handleRemoveFromList(index)} className="font-medium text-red-600 hover:underline">Remover</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {error && <p className="text-sm text-red-600 text-center pt-2">{error}</p>}

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={transferItems.length === 0} className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Registrar Movimentação ({transferItems.length} {transferItems.length === 1 ? 'item' : 'itens'})
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Transferir;