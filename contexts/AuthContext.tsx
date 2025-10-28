import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';
import { users as mockUsers } from '../data/users'; // for password check

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
        return null;
    }
  });
  
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
      setUsers(userService.getUsers());
  }, []);

  const login = (username: string, password: string): boolean => {
    // We need to check password against the original mock or a secure source.
    // Here we simulate it by finding the user in the mock data.
    // In a real app, this logic would be handled by a backend.
    const userWithPassword = mockUsers.find(u => u.username === username && u.password === password);
    const userFromStorage = users.find(u => u.username === username);

    if (userWithPassword && userFromStorage) {
      const userToStore = { ...userFromStorage };
      // Do not store password in state or local storage
      delete userToStore.password; 
      setCurrentUser(userToStore);
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = { currentUser, users, setUsers, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
