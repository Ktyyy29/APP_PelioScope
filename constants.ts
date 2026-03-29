
import { Emotion, EmotionData, Activity, ActivityName, ShopItem } from './types';
import { HeartIcon, GiftIcon, MusicNoteIcon, SparklesIcon, FireIcon, BookOpenIcon, BeakerIcon, DropIcon, CakeIcon } from './components/Icons';

export const EMOTION_DETAILS: Record<Emotion, EmotionData> = {
  // FIX: Changed pulseColor from a Tailwind class to a hex color for use in inline styles.
  Happy: { emoji: '😊', color: 'text-yellow-400', pulseColor: '#fcd34d' },
  Sad: { emoji: '😢', color: 'text-blue-400', pulseColor: '#93c5fd' },
  Angry: { emoji: '😡', color: 'text-red-700', pulseColor: '#dc2626' },
  Shocked: { emoji: '😲', color: 'text-indigo-400', pulseColor: '#a5b4fc' },
  Neutral: { emoji: '😐', color: 'text-gray-400', pulseColor: '#d1d5db' },
  Disgust: { emoji: '🤢', color: 'text-lime-500', pulseColor: '#84cc16' },
  Anxious: { emoji: '😰', color: 'text-blue-300', pulseColor: '#7dd3fc' },
  Stressed: { emoji: '😫', color: 'text-orange-500', pulseColor: '#f97316' },
  Embarrassed: { emoji: '😳', color: 'text-pink-400', pulseColor: '#f472b6' },
};

export const ACTIVITIES: Record<ActivityName, Activity> = {
  'Mood Boost': { name: 'Mood Boost', icon: SparklesIcon, color: 'from-yellow-400 to-orange-400', duration: 30, reward: 0 },
  'Give Gift': { name: 'Give Gift', icon: GiftIcon, color: 'from-pink-400 to-rose-400', duration: 10, reward: 0 },
  'Bath Time': { name: 'Bath Time', icon: DropIcon, color: 'from-blue-400 to-sky-500', duration: 45, reward: 60 },
  'Feeding': { name: 'Feeding', icon: CakeIcon, color: 'from-orange-400 to-red-400', duration: 20, reward: 0 },
  'Play Music': { name: 'Play Music', icon: MusicNoteIcon, color: 'from-sky-400 to-cyan-400', duration: 180, reward: 0 },
  'Exercise': { name: 'Exercise', icon: FireIcon, color: 'from-red-500 to-orange-500', duration: 300, reward: 100 },
  'Meditate': { name: 'Meditate', icon: BeakerIcon, color: 'from-purple-500 to-indigo-500', duration: 600, reward: 80 },
  'Tell Story': { name: 'Tell Story', icon: BookOpenIcon, color: 'from-green-400 to-emerald-400', duration: 120, reward: 60 },
};

export const SHOP_ITEMS: ShopItem[] = [
    // HATS
    { id: 'hat_cap', name: 'Blue Cap', category: 'hat', price: 200, icon: '🧢' },
    { id: 'hat_bow', name: 'Pink Bow', category: 'hat', price: 150, icon: '🎀' },
    { id: 'hat_crown', name: 'Gold Crown', category: 'hat', price: 500, icon: '👑' },
    { id: 'hat_cowboy', name: 'Cowboy Hat', category: 'hat', price: 300, icon: '🤠' },
    { id: 'hat_beanie', name: 'Green Beanie', category: 'hat', price: 250, icon: '🧶' },
    
    // CLOTHES
    { id: 'cloth_tie', name: 'Bow Tie', category: 'clothes', price: 100, icon: '👔' },
    { id: 'cloth_scarf', name: 'Cozy Scarf', category: 'clothes', price: 150, icon: '🧣' },
    { id: 'cloth_glasses', name: 'Cool Shades', category: 'clothes', price: 250, icon: '😎' },
    { id: 'cloth_flower', name: 'Flower Pin', category: 'clothes', price: 120, icon: '🌸' },

    // FOOD & DRINK
    { id: 'apple', name: 'Apple', category: 'food', price: 10, icon: '🍎', hungerValue: 20 },
    { id: 'burger', name: 'Burger', category: 'food', price: 25, icon: '🍔', hungerValue: 30 },
    { id: 'cake', name: 'Cake', category: 'food', price: 20, icon: '🍰', hungerValue: 25 },
    { id: 'water', name: 'Water', category: 'food', price: 5, icon: '💧', hungerValue: 10 },
    { id: 'juice', name: 'Juice', category: 'food', price: 15, icon: '🧃', hungerValue: 15 },
];

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];
