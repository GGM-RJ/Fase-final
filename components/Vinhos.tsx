import React, { useState } from 'react';
import { StockItem } from '../types';
import WineCard from './WineCard';
import { quintaService } from '../services/quintaService';

interface VinhosProps {
    stock: StockItem[];
}

const Vinhos: React.FC<VinhosProps> = ({ stock }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuinta, setSelectedQuinta] = useState('Todas as Quintas');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleQuintaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuinta(event.target.value);
  };

  // First, filter to only include wines that are in a quinta.
  const winesInQuintas = stock.filter(wine => !!wine.quintaName);

  const filteredWines = winesInQuintas
    .filter(wine => {
        if (selectedQuinta === 'Todas as Quintas') {
            return true;
        }
        return wine.quintaName === selectedQuinta;
    })
    .filter(wine => {
      const term = searchTerm.toLowerCase();
      return (
        wine.brand.toLowerCase().includes(term) ||
        wine.wineName.toLowerCase().includes(term)
      );
    });
    
  const allQuintas = ['Todas as Quintas', ...quintaService.getQuintas().map(q => q.name)];

  return (
    <div>
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <input
            type="text"
            placeholder="Pesquisar por marca ou nome do vinho..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
            </div>
        </div>
        <div className="w-full md:w-auto md:min-w-[200px]">
          <select
            value={selectedQuinta}
            onChange={handleQuintaChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {allQuintas.map(quinta => (
              <option key={quinta} value={quinta}>
                {quinta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredWines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredWines.map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-8 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700">Nenhum vinho encontrado</h3>
            <p className="text-gray-500 mt-2">Nenhum vinho foi encontrado nas quintas com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
};

export default Vinhos;