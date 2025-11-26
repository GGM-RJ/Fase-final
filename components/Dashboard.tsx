// FIX: Provide full implementation for the Dashboard component.
import React from 'react';
import { StockItem, TransferLog, ID } from '../types';
import StatCard from './StatCard';
import { quintaService } from '../services/quintaService';
import { useAuth } from '../contexts/AuthContext';

// Placeholder icons, in a real app these would be imported from an icon library
const WineBottleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4H7zm0 0L7 5m0 16H5m2 0h2" /></svg>;
const CubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7l8 4" /></svg>;
const LocationMarkerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.72-1.72a10 10 0 115.84 16.1" /></svg>;


interface DashboardProps {
    stock: StockItem[];
    transferHistory: TransferLog[];
    pendingTransfers: TransferLog[];
    onApprove: (id: ID) => void;
    onReject: (id: ID) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stock, transferHistory, pendingTransfers, onApprove, onReject }) => {
    const { currentUser } = useAuth();
    const totalQuintas = quintaService.getQuintas().length;
    const lowStockItems = stock.filter(item => item.lowStockAlert && item.quantity <= 6);
    const recentTransfers = transferHistory.slice(0, 5);
    
    const canApprove = currentUser?.role === 'Supervisor' || (currentUser?.role === 'Operador' && currentUser.permissions?.includes('Aprovar'));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

            {lowStockItems.length > 0 && (
                 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="py-1"><svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8h2v2H9v-2z"/></svg></div>
                        <div>
                            <p className="font-bold">Alerta de Stock Baixo</p>
                            <ul className="list-disc list-inside text-sm">
                                {lowStockItems.map(item => (
                                    <li key={item.id}>
                                        {item.brand} - {item.wineName}: <span className="font-semibold">{item.quantity}</span> garrafas restantes em {item.quintaName || 'Stock Geral'}.
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                 <StatCard 
                    title="Total de Quintas" 
                    value={totalQuintas.toString()}
                    description="Locais de armazenamento"
                    icon={<LocationMarkerIcon />}
                    borderColor="border-green-500"
                />
                <StatCard 
                    title="Transferências Pendentes" 
                    value={pendingTransfers.length.toString()}
                    description="Aguardando aprovação"
                    icon={<RefreshIcon />}
                    borderColor="border-orange-500"
                />
            </div>

            {canApprove && pendingTransfers.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Transferências Pendentes de Aprovação</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Data</th>
                                    <th scope="col" className="px-6 py-3">Solicitante</th>
                                    <th scope="col" className="px-6 py-3">Vinho</th>
                                    <th scope="col" className="px-6 py-3 text-right">Qtd</th>
                                    <th scope="col" className="px-6 py-3">De</th>
                                    <th scope="col" className="px-6 py-3">Para</th>
                                    <th scope="col" className="px-6 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingTransfers.map(log => (
                                    <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium">{log.requesterName}</td>
                                        <td className="px-6 py-4">{log.brand} - {log.wineName}</td>
                                        <td className="px-6 py-4 text-right font-bold">{log.quantity}</td>
                                        <td className="px-6 py-4">{log.fromQuinta}</td>
                                        <td className="px-6 py-4">{log.toQuinta}</td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            <button onClick={() => onApprove(log.id)} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Aprovar</button>
                                            <button onClick={() => onReject(log.id)} className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Reprovar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Últimas Atividades</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Vinho</th>
                                <th scope="col" className="px-6 py-3 text-right">Qtd</th>
                                <th scope="col" className="px-6 py-3">De</th>
                                <th scope="col" className="px-6 py-3">Para</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransfers.map(log => (
                                <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{new Date(log.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium">{log.brand} - {log.wineName}</td>
                                    <td className="px-6 py-4 text-right font-bold">{log.quantity}</td>
                                    <td className="px-6 py-4">{log.fromQuinta}</td>
                                    <td className="px-6 py-4">{log.toQuinta}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;