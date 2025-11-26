// FIX: Provide mock user data to resolve import errors.
import { User } from '../types';

export const users: User[] = [
  {
    id: 1,
    username: 'supervisor',
    password: '123',
    name: 'Ana Silva (Supervisor)',
    role: 'Supervisor',
  },
  {
    id: 4,
    username: 'bomfim',
    password: '123',
    name: 'Quinta do Bomfim',
    role: 'Quinta',
    quintaName: 'Quinta do Bomfim',
  },
  {
    id: 5,
    username: 'canais',
    password: '123',
    name: 'Quinta dos Canais',
    role: 'Quinta',
    quintaName: 'Quinta dos Canais',
  },
  {
    id: 6,
    username: 'malvedos',
    password: '123',
    name: 'Quinta dos Malvedos',
    role: 'Quinta',
    quintaName: 'Quinta dos Malvedos',
  },
  {
    id: 7,
    username: 'vesuvio',
    password: '123',
    name: 'Quinta do Vesuvio',
    role: 'Quinta',
    quintaName: 'Quinta do Vesuvio',
  },
];