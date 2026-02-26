
import React, { useState, useCallback } from 'react';
import { ACTIVITIES, SHOP_ITEMS } from '../constants';
import { Activity, ActivityName, ShopItem } from '../types';
import ActivityModal, { PeliCharacter } from './ActivityModal';
import { useAppContext } from '../contexts/AppContext';
import { DrachmaIcon } from './Icons';

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  const Icon = activity.icon;
  return (
    <button
      onClick={onClick}
      className={`relative w-full aspect-square rounded-2xl p-4 flex flex-col justify-between items-start text-white shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 bg-gradient-to-br ${activity.color}`}
    >
      <Icon className="w-10 h-10 drop-shadow-md" />
      <div className="text-left w-full z-10">
          <span className="font-bold text-lg block">{activity.name}</span>
          <span className="text-xs bg-black/20 px-2 py-1 rounded-full mt-1 inline-flex items-center gap-1">
             +{activity.reward} <DrachmaIcon className="w-3 h-3" />
          </span>
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-20">
         <Icon className="w-24 h-24" />
      </div>
    </button>
  );
};

const ShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { drachma, buyItem, equipItem, inventory, equippedItems } = useAppContext();
    const [activeCategory, setActiveCategory] = useState<'hat'|'clothes'|'food'>('hat');
    const [feedback, setFeedback] = useState<string | null>(null);

    const filteredItems = SHOP_ITEMS.filter(item => item.category === activeCategory);

    const handleItemClick = (item: ShopItem) => {
        const isConsumable = item.category === 'food';
        const isOwned = inventory.includes(item.id);

        if (isConsumable) {
            // Always buy
            if (buyItem(item.id, item.price)) {
                setFeedback(`Bought ${item.name}!`);
                setTimeout(() => setFeedback(null), 1000);
            } else {
                setFeedback("Not enough Drachma!");
                setTimeout(() => setFeedback(null), 1500);
            }
        } else {
            // Gear logic
            if (isOwned) {
                // Toggle equip
                const current = equippedItems[activeCategory as keyof typeof equippedItems];
                if (current === item.id) {
                    equipItem(activeCategory as keyof typeof equippedItems, null); // Unequip
                } else {
                    equipItem(activeCategory as keyof typeof equippedItems, item.id); // Equip
                }
            } else {
                // Buy
                if (buyItem(item.id, item.price)) {
                    setFeedback(`Bought ${item.name}!`);
                    setTimeout(() => setFeedback(null), 1500);
                } else {
                    setFeedback("Not enough Drachma!");
                    setTimeout(() => setFeedback(null), 1500);
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                {/* Header */}
                <div className="bg-indigo-500 p-4 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold">Peli Shop 🛍️</h2>
                    <button onClick={onClose} className="font-bold text-2xl">&times;</button>
                </div>

                {/* Preview Area */}
                <div className="bg-indigo-50 dark:bg-gray-700 h-48 flex items-center justify-center relative">
                     <div className="w-40 h-40 transform scale-125">
                         <PeliCharacter emotion="Happy" />
                     </div>
                     <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-1 text-black border border-gray-200">
                        {drachma} <DrachmaIcon className="w-4 h-4" />
                     </div>
                     {feedback && (
                         <div className="absolute bottom-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm animate-bounce z-10">
                             {feedback}
                         </div>
                     )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-600 overflow-x-auto scrollbar-hide">
                    {['hat', 'clothes', 'food'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat as any)}
                            className={`flex-1 py-3 text-sm font-bold uppercase transition-colors px-4 min-w-[80px] ${activeCategory === cat ? 'border-b-4 border-indigo-500 text-indigo-500' : 'text-gray-400'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4 scrollbar-hide">
                    {filteredItems.map(item => {
                        const count = inventory.filter(id => id === item.id).length;
                        const isOwned = count > 0;
                        const isEquipped = equippedItems[activeCategory as keyof typeof equippedItems] === item.id;
                        const isConsumable = item.category === 'food';
                        
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className={`rounded-xl p-3 border-2 flex flex-col items-center gap-2 transition-all ${
                                    isEquipped 
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                    : (isOwned && !isConsumable)
                                        ? 'border-indigo-200 bg-white dark:bg-gray-700' 
                                        : 'border-gray-100 bg-gray-50 dark:bg-gray-800 opacity-90'
                                }`}
                            >
                                <span className="text-4xl filter drop-shadow-sm">{item.icon}</span>
                                <div className="text-center w-full">
                                    <span className="font-bold text-sm block truncate">{item.name}</span>
                                    
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                        <span className="text-xs font-bold text-gray-500">{item.price}</span>
                                        <DrachmaIcon className="w-3 h-3" />
                                    </div>

                                    {/* Logic for Labels */}
                                    {isConsumable ? (
                                        <div className="mt-1 text-xs font-bold text-indigo-500">
                                            {isOwned ? `x${count} Owned` : 'Buy Now'}
                                        </div>
                                    ) : (
                                        isOwned && (
                                            <span className={`text-xs font-bold mt-1 inline-block ${isEquipped ? 'text-green-600' : 'text-indigo-400'}`}>
                                                {isEquipped ? 'EQUIPPED' : 'OWNED'}
                                            </span>
                                        )
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ActivitiesTab: React.FC = () => {
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const { drachma } = useAppContext();

  const handleOpenModal = useCallback((activityName: ActivityName) => {
    setActiveActivity(ACTIVITIES[activityName]);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveActivity(null);
  }, []);
  
  const handleGoToShop = useCallback(() => {
    setActiveActivity(null);
    setIsShopOpen(true);
  }, []);

  return (
    <div className="p-4 pt-2">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
          <button 
             onClick={() => setIsShopOpen(true)}
             className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full shadow-md font-bold flex items-center gap-2 border border-indigo-100 dark:border-gray-700 hover:scale-105 transition-transform"
          >
              <span>🛍️</span> Shop
          </button>
          
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-full font-bold shadow-sm border border-yellow-200 dark:border-yellow-700 flex items-center gap-2">
              <DrachmaIcon className="w-5 h-5" /> {drachma} <span className="text-xs opacity-70">Drachma</span>
          </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-6 mt-2">Activities</h1>
      
      <div className="grid grid-cols-2 gap-4 pb-20">
        {Object.values(ACTIVITIES).map((activity) => (
          <ActivityCard key={activity.name} activity={activity} onClick={() => handleOpenModal(activity.name)} />
        ))}
      </div>
      
      {activeActivity && <ActivityModal activity={activeActivity} onClose={handleCloseModal} onOpenShop={handleGoToShop} />}
      {isShopOpen && <ShopModal onClose={() => setIsShopOpen(false)} />}
    </div>
  );
};

export default ActivitiesTab;
