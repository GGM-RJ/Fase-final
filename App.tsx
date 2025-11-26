import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Vinhos from './components/Vinhos';
import Stock from './components/Stock';
import Transferir from './components/Transferir';
import Historico from './components/Historico';
import Relatorios from './components/Relatorios';
import Usuarios from './components/Usuarios';
import Footer from './components/Footer';

import { stockService } from './services/stockService';
import { transferService } from './services/transferService';
import { userService } from './services/userService';
import { generateId } from './utils/idGenerator';

import { StockItem, TransferLog, User, ID } from './types';

export type Page = 'Dashboard' | 'Vinhos' | 'Stock' | 'Movimentar Vinhos' | 'Histórico' | 'Relatórios' | 'Usuários';

const AppContent: React.FC = () => {
  const { currentUser, users, setUsers } = useAuth();
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  
  const [stock, setStock] = useState<StockItem[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from services on initial render
  const refreshData = async () => {
      setIsLoading(true);
      try {
        const [loadedStock, loadedHistory] = await Promise.all([
            stockService.getStock(),
            transferService.getTransferHistory()
        ]);
        setStock(loadedStock);
        setTransferHistory(loadedHistory);
      } catch (error) {
          console.error("Failed to load data", error);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    if (currentUser) {
        refreshData();
    }
  }, [currentUser]);


  if (!currentUser) {
    return <Login />;
  }

  const pendingTransfers = transferHistory.filter(t => t.status === 'Pendente');

  const handleAddWine = async (newWine: Omit<StockItem, 'id'>) => {
    await stockService.addWine(newWine);
    // Refresh to get new ID and updated state
    const updatedStock = await stockService.getStock();
    setStock(updatedStock);
  };
  
  const handleTransfer = async (transferLog: Omit<TransferLog, 'id' | 'date' | 'status'>) => {
      const canAutoApprove = currentUser?.role === 'Supervisor' || 
                             (currentUser?.role === 'Operador' && currentUser.permissions?.includes('Aprovar'));
      
      const status = currentUser?.role === 'Quinta' ? 'Pendente' : (canAutoApprove ? 'Aprovado' : 'Pendente');

      const newLog: TransferLog = {
          ...transferLog,
          id: generateId(), 
          date: new Date(),
          status: status,
      };

      if (status === 'Aprovado') {
          newLog.approverName = currentUser?.name;
      }
      
      await transferService.addTransfer(newLog);
      
      // Update history state
      const updatedHistory = await transferService.getTransferHistory();
      setTransferHistory(updatedHistory);

      if (status === 'Aprovado') {
          await updateStockForTransfer(newLog);
      }
  };
  
  const updateStockForTransfer = async (log: TransferLog) => {
      // Logic for cloud-compatible granular updates
      // Instead of dumping the whole state, we find and update specific items.
      
      const sourceIdentifier = log.fromQuinta === 'Stock Geral' ? undefined : log.fromQuinta;
      const destIdentifier = log.toQuinta === 'Stock Geral' ? undefined : log.toQuinta;

      // 1. Handle Source (Decrement)
      if (log.fromQuinta !== 'Ajuste de Stock') { // If it's not a fresh entry/production
          const sourceItem = stock.find(s => 
              s.brand === log.brand &&
              s.wineName === log.wineName &&
              s.quintaName === sourceIdentifier
          );

          if (sourceItem) {
              const updatedSource = { ...sourceItem, quantity: Math.max(0, sourceItem.quantity - log.quantity) };
              await stockService.updateItem(updatedSource);
          }
      }
      
      // 2. Handle Destination (Increment)
      if (log.toQuinta !== 'Consumo') {
          const destItem = stock.find(s => 
              s.brand === log.brand &&
              s.wineName === log.wineName &&
              s.quintaName === destIdentifier
          );
          
          if (destItem) {
              const updatedDest = { ...destItem, quantity: destItem.quantity + log.quantity };
              await stockService.updateItem(updatedDest);
          } else {
              // Create new item in destination
              // We need wine details (type). We try to find it from source or catalog logic.
              const originalWine = stock.find(s => s.brand === log.brand && s.wineName === log.wineName);
              await stockService.addWine({
                  brand: log.brand,
                  wineName: log.wineName,
                  wineType: originalWine?.wineType || 'Tinto',
                  quantity: log.quantity,
                  quintaName: destIdentifier,
              });
          }
      }
      
      // Fetch fresh to ensure IDs and everything is correct
      const freshStock = await stockService.getStock();
      setStock(freshStock);
  };

  const handleApproval = async (id: ID, newStatus: 'Aprovado' | 'Reprovado') => {
      const transferToProcess = transferHistory.find(log => log.id === id);

      if (transferToProcess) {
          const updatedTransfer = { ...transferToProcess, status: newStatus };
          if (newStatus === 'Aprovado') {
            updatedTransfer.approverName = currentUser?.name;
          }
          
          await transferService.updateTransfer(updatedTransfer);
          
          const updatedHistory = await transferService.getTransferHistory();
          setTransferHistory(updatedHistory);

          if (newStatus === 'Aprovado') {
              await updateStockForTransfer(updatedTransfer);
          }
      }
  };

  const handleSaveUser = async (user: Omit<User, 'id'> | User) => {
    await userService.saveUser(user);
    const updatedUsers = await userService.getUsers();
    setUsers(updatedUsers);
  };

  const handleDeleteUser = async (id: ID) => {
      if (currentUser.id === id) {
          alert("Você não pode deletar seu próprio usuário.");
          return;
      }
      await userService.deleteUser(id);
      const updatedUsers = await userService.getUsers();
      setUsers(updatedUsers);
  }

  const handleDeleteWine = async (id: ID) => {
      if (currentUser?.role !== 'Supervisor') {
          alert("Apenas supervisores podem excluir vinhos.");
          return;
      }

      // Use LOCAL state stock to check conditions (fastest)
      const wineToDelete = stock.find(item => item.id === id);

      if (!wineToDelete) {
          alert("Vinho não encontrado.");
          return;
      }

      // Check 1: Quantity must be 0
      if (wineToDelete.quantity > 0) {
          alert(`Não é possível excluir o vinho "${wineToDelete.brand} - ${wineToDelete.wineName}" pois ainda existem ${wineToDelete.quantity} garrafas no Stock Geral. Ajuste a quantidade para 0 antes de excluir.`);
          return;
      }

      // Check 2: Must not exist in any Quinta's stock
      const isInQuintaStock = stock.some(item => 
          item.brand === wineToDelete.brand &&
          item.wineName === wineToDelete.wineName &&
          item.quintaName // This item is in a quinta's stock
      );

      if (isInQuintaStock) {
          alert(`Este vinho não pode ser excluído pois ainda existe stock em uma ou mais quintas. Transfira todo o stock para o "Stock Geral" e zere a quantidade antes de excluir.`);
          return;
      }

      await stockService.deleteWine(id);
      const updatedStock = await stockService.getStock();
      setStock(updatedStock); 
  };

  const handleAddStockQuantity = async (id: ID, quantityToAdd: number) => {
    if (currentUser?.role !== 'Supervisor') {
        alert("Apenas supervisores podem ajustar o stock.");
        return;
    }
    await stockService.addStockQuantity(id, quantityToAdd);
    const updatedStock = await stockService.getStock();
    setStock(updatedStock); 
  };

  const handleRemoveStockQuantity = async (id: ID, quantityToRemove: number) => {
    if (currentUser?.role !== 'Supervisor') {
        alert("Apenas supervisores podem ajustar o stock.");
        return;
    }
    await stockService.removeStockQuantity(id, quantityToRemove);
    const updatedStock = await stockService.getStock();
    setStock(updatedStock); 
  };


  const renderPage = () => {
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Carregando dados...</span>
            </div>
        );
    }

    switch (activePage) {
      case 'Dashboard':
        return <Dashboard 
                  stock={stock} 
                  transferHistory={transferHistory} 
                  pendingTransfers={pendingTransfers}
                  onApprove={(id) => handleApproval(id, 'Aprovado')}
                  onReject={(id) => handleApproval(id, 'Reprovado')}
                />;
      case 'Vinhos':
        return <Vinhos stock={stock} />;
      case 'Stock':
        return <Stock stock={stock} onAddWine={handleAddWine} onDeleteWine={handleDeleteWine} onAddStockQuantity={handleAddStockQuantity} onRemoveStockQuantity={handleRemoveStockQuantity} />;
      case 'Movimentar Vinhos':
        return <Transferir stock={stock} onTransfer={handleTransfer} />;
      case 'Histórico':
        return <Historico transferHistory={transferHistory} />;
      case 'Relatórios':
        return <Relatorios stock={stock} transferHistory={transferHistory} />;
      case 'Usuários':
        return <Usuarios users={users} onSaveUser={handleSaveUser} onDeleteUser={handleDeleteUser} />;
      default:
        return <Dashboard 
                  stock={stock} 
                  transferHistory={transferHistory}
                  pendingTransfers={pendingTransfers}
                  onApprove={(id) => handleApproval(id, 'Aprovado')}
                  onReject={(id) => handleApproval(id, 'Reprovado')}
                />;
    }
  };

  return (
    <div className="flex h-screen bg-green-50 font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-green-50 p-6">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
