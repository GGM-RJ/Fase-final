import { User, ID } from '../types';
import { storageService } from './storageService';
import { users as mockUsers } from '../data/users';
import { generateId } from '../utils/idGenerator';
import { apiService, USE_CLOUD_DB } from './api';

const USERS_KEY = 'users';

const mockAsync = <T>(data: T): Promise<T> => {
    return new Promise((resolve) => setTimeout(() => resolve(data), 100));
};

const getUsers = async (): Promise<User[]> => {
    if (USE_CLOUD_DB) return apiService.getUsers();
    return mockAsync(storageService.getItem<User[]>(USERS_KEY, mockUsers));
};

const saveUser = async (user: Omit<User, 'id'> | User): Promise<User> => {
    if (USE_CLOUD_DB) {
        if ('id' in user) {
            return apiService.updateUser(user);
        } else {
            return apiService.saveUser({ ...user, id: generateId() });
        }
    } else {
        const users = storageService.getItem<User[]>(USERS_KEY, mockUsers);
        let savedUser: User;
        if ('id' in user) {
            // Edit
            const updatedUsers = users.map(u => (u.id === user.id ? user : u));
            storageService.setItem(USERS_KEY, updatedUsers);
            savedUser = user;
        } else {
            // Add
            const newUser: User = {
                ...user,
                id: generateId(),
            };
            const updatedUsers = [...users, newUser];
            storageService.setItem(USERS_KEY, updatedUsers);
            savedUser = newUser;
        }
        return mockAsync(savedUser);
    }
};

const deleteUser = async (id: ID): Promise<void> => {
    if (USE_CLOUD_DB) {
        return apiService.deleteUser(id);
    } else {
        let users = storageService.getItem<User[]>(USERS_KEY, mockUsers);
        users = users.filter(u => u.id !== id);
        storageService.setItem(USERS_KEY, users);
        return mockAsync(undefined);
    }
};

export const userService = {
    getUsers,
    saveUser,
    deleteUser,
};