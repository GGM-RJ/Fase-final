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

import { StockItem, TransferLog, User } from './types';

export type Page = 'Dashboard' | 'Vinhos' | 'Stock' | 'Movimentar Vinhos' | 'Histórico' | 'Relatórios' | 'Usuários';

const AppContent: React.FC = () => {
  const { currentUser, users, setUsers } = useAuth();
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  
  const [stock, setStock] = useState<StockItem[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferLog[]>([]);

  // Load data from services on initial render
  useEffect(() => {
    setStock(stockService.getStock());
    setTransferHistory(transferService.getTransferHistory());
  }, []);


  if (!currentUser) {
    return <Login />;
  }

  const pendingTransfers = transferHistory.filter(t => t.status === 'Pendente');

  const handleAddWine = (newWine: Omit<StockItem, 'id'>) => {
    stockService.addWine(newWine);
    setStock(stockService.getStock()); // Re-fetch to update UI
  };
  
  const handleTransfer = (transferLog: Omit<TransferLog, 'id' | 'date' | 'status'>) => {
      const canAutoApprove = currentUser?.role === 'Supervisor' || 
                             (currentUser?.role === 'Operador' && currentUser.permissions?.includes('Aprovar'));
      
      const status = currentUser?.role === 'Quinta' ? 'Pendente' : (canAutoApprove ? 'Aprovado' : 'Pendente');

      const allHistory = transferService.getTransferHistory();
      const newLog: TransferLog = {
          ...transferLog,
          id: allHistory.length > 0 ? Math.max(...allHistory.map(t => t.id)) + 1 : 1,
          date: new Date(),
          status: status,
      };

      if (status === 'Aprovado') {
          newLog.approverName = currentUser?.name;
      }
      
      transferService.addTransfer(newLog);
      setTransferHistory(transferService.getTransferHistory());

      if (status === 'Aprovado') {
          updateStockForTransfer(newLog);
      }
  };
  
  const updateStockForTransfer = (log: TransferLog) => {
      const currentStock = stockService.getStock();
      
      // Decrement source
      const sourceIdentifier = log.fromQuinta === 'Stock Geral' ? undefined : log.fromQuinta;
      const sourceIndex = currentStock.findIndex(s => 
          s.brand === log.brand &&
          s.wineName === log.wineName &&
          s.quintaName === sourceIdentifier
      );
      if (sourceIndex > -1) {
          currentStock[sourceIndex].quantity -= log.quantity;
      }
      
      // Increment destination if not consumption
      if (log.toQuinta !== 'Consumo') {
          const destIdentifier = log.toQuinta === 'Stock Geral' ? undefined : log.toQuinta;
          const destIndex = currentStock.findIndex(s => 
              s.brand === log.brand &&
              s.wineName === log.wineName &&
              s.quintaName === destIdentifier
          );
          
          if (destIndex > -1) {
              currentStock[destIndex].quantity += log.quantity;
          } else {
              const originalWine = stockService.getStock().find(s => s.brand === log.brand && s.wineName === log.wineName);
              currentStock.push({
                  id: Math.max(...currentStock.map(i => i.id)) + 1,
                  brand: log.brand,
                  wineName: log.wineName,
                  wineType: originalWine?.wineType || 'Tinto',
                  quantity: log.quantity,
                  quintaName: destIdentifier,
              });
          }
      }
      
      const updatedStock = currentStock.filter(s => s.quantity > 0);
      stockService.updateStock(updatedStock);
      setStock(updatedStock);
  };

  const handleApproval = (id: number, newStatus: 'Aprovado' | 'Reprovado') => {
      const history = transferService.getTransferHistory();
      const transferToProcess = history.find(log => log.id === id);

      if (transferToProcess) {
          transferToProcess.status = newStatus;
          if (newStatus === 'Aprovado') {
            transferToProcess.approverName = currentUser?.name;
          }
          transferService.updateTransfer(transferToProcess);
          setTransferHistory(transferService.getTransferHistory());

          if (newStatus === 'Aprovado') {
              updateStockForTransfer(transferToProcess);
          }
      }
  };

  const handleSaveUser = (user: Omit<User, 'id'> | User) => {
    userService.saveUser(user);
    setUsers(userService.getUsers());
  };

  const handleDeleteUser = (id: number) => {
      if (currentUser.id === id) {
          alert("Você não pode deletar seu próprio usuário.");
          return;
      }
      userService.deleteUser(id);
      setUsers(userService.getUsers());
  }

  const handleDeleteWine = (id: number) => {
      if (currentUser?.role !== 'Supervisor') {
          alert("Apenas supervisores podem excluir vinhos.");
          return;
      }
      stockService.deleteWine(id);
      setStock(stockService.getStock()); // Re-fetch to update UI
  };

  const handleAddStockQuantity = (id: number, quantityToAdd: number) => {
    if (currentUser?.role !== 'Supervisor') {
        alert("Apenas supervisores podem ajustar o stock.");
        return;
    }
    stockService.addStockQuantity(id, quantityToAdd);
    setStock(stockService.getStock());
  };

  const handleRemoveStockQuantity = (id: number, quantityToRemove: number) => {
    if (currentUser?.role !== 'Supervisor') {
        alert("Apenas supervisores podem ajustar o stock.");
        return;
    }
    stockService.removeStockQuantity(id, quantityToRemove);
    setStock(stockService.getStock());
  };


  const renderPage = () => {
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