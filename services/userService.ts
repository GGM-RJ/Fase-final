import { User } from '../types';
import { storageService } from './storageService';
import { users as mockUsers } from '../data/users';

const USERS_KEY = 'users';

const getUsers = (): User[] => {
    return storageService.getItem<User[]>(USERS_KEY, mockUsers);
};

const saveUsers = (users: User[]): void => {
    storageService.setItem(USERS_KEY, users);
};

const saveUser = (user: Omit<User, 'id'> | User): User => {
    const users = getUsers();
    let savedUser: User;
    if ('id' in user) {
        // Edit
        const updatedUsers = users.map(u => (u.id === user.id ? user : u));
        saveUsers(updatedUsers);
        savedUser = user;
    } else {
        // Add
        const newUser = {
            ...user,
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        };
        const updatedUsers = [...users, newUser];
        saveUsers(updatedUsers);
        savedUser = newUser;
    }
    return savedUser;
};

const deleteUser = (id: number): void => {
    let users = getUsers();
    users = users.filter(u => u.id !== id);
    saveUsers(users);
};

export const userService = {
    getUsers,
    saveUser,
    deleteUser,
};