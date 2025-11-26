import React, { useState } from 'react';
import { User, ID } from '../types';
import AddUserModal from './AddUserModal';

interface UsuariosProps {
    users: User[];
    onSaveUser: (user: Omit<User, 'id'> | User) => void;
    onDeleteUser: (id: ID) => void;
}

const Usuarios: React.FC<UsuariosProps> = ({ users, onSaveUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const handleOpenModal = (user: User | null = null) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setUserToEdit(null);
        setIsModalOpen(false);
    };

    const handleSave = (user: Omit<User, 'id'> | User) => {
        onSaveUser(user);
        handleCloseModal();
    };
    
    const handleDelete = (id: ID) => {
        if (window.confirm('Tem certeza de que deseja excluir este usuário?')) {
            onDeleteUser(id);
        }
    }

    return (
        <>
            <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h2>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        Adicionar Usuário
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome</th>
                                <th scope="col" className="px-6 py-3">Username</th>
                                <th scope="col" className="px-6 py-3">Função</th>
                                <th scope="col" className="px-6 py-3">Quinta</th>
                                <th scope="col" className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4">{user.username}</td>
                                    <td className="px-6 py-4">{user.role}</td>
                                    <td className="px-6 py-4">{user.quintaName || 'N/A'}</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => handleOpenModal(user)} className="font-medium text-purple-600 hover:underline">Editar</button>
                                        <button onClick={() => handleDelete(user.id)} className="font-medium text-red-600 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddUserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                userToEdit={userToEdit}
            />
        </>
    );
};

export default Usuarios;