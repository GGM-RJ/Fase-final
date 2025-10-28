import { storageService } from './storageService';
import { quintas as initialQuintas } from '../data/dashboardData';

const QUINTAS_KEY = 'quintas';

export interface Quinta {
    name: string;
}

const getQuintas = (): Quinta[] => {
    return storageService.getItem<Quinta[]>(QUINTAS_KEY, initialQuintas);
};

export const quintaService = {
    getQuintas,
};