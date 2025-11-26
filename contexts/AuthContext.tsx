import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';
import { users as mockUsers } from '../data/users'; // Fallback / Mock for initial login logic

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
      const loadUsers = async () => {
          const loadedUsers = await userService.getUsers();
          setUsers(loadedUsers);
      };
      loadUsers();
  }, []);

  const login = (username: string, password: string): boolean => {
    // Note: In a real cloud implementation, login should also be an async API call returning a token.
    // For now, we compare against the loaded users list for role data, but verify password against mock 
    // (since localstorage doesn't keep passwords safe, and this is a simulation).
    
    // 1. Find user in the full list (from DB or LocalStorage)
    const userFound = users.find(u => u.username === username);
    
    // 2. Find user in Mock for password verification (Simulation)
    const mockUser = mockUsers.find(u => u.username === username);

    // If using Cloud DB, authentication should really happen server-side.
    // As a bridge, we check if the password matches the hardcoded mock.
    if (userFound && mockUser && mockUser.password === password) {
      const userToStore = { ...userFound };
      // Do not store password
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