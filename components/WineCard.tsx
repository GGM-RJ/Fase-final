import React from 'react';
import { StockItem, WineType } from '../types';

interface WineCardProps {
  wine: StockItem;
}

const getTypeColor = (type: WineType) => {
    switch (type) {
        case 'Tinto':
            return 'bg-red-800 text-white';
        case 'Branco':
            return 'bg-yellow-200 text-yellow-800';
        case 'Rosé':
            return 'bg-pink-300 text-white';
        case 'Porto':
            return 'bg-purple-900 text-white';
        case 'Espumante':
            return 'bg-blue-300 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
};

const WineCard: React.FC<WineCardProps> = ({ wine }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{wine.brand}</p>
                <h3 className="text-xl font-bold text-gray-800 mt-1">{wine.wineName}</h3>
            </div>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getTypeColor(wine.wineType)}`}>
              {wine.wineType}
            </span>
        </div>
        
        <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
                <span className="font-medium">Quinta:</span>
                <span className="font-semibold text-gray-800">{wine.quintaName || 'N/A'}</span>
            </div>
             <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                <span className="font-medium">Stock:</span>
                <span className="font-bold text-lg text-purple-700">{wine.quantity}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WineCard;