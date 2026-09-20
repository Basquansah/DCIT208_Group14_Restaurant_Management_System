export interface MenuItem {
  id: string;
  name: string;
  category: 'Staples' | 'Proteins' | 'Stews & Soups';
  price: number;
  description: string;
  image: string;
  isAvailable: boolean; // Indicates if food is available or finished
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Banku',
    category: 'Staples',
    price: 15.00,
    description: 'Traditional corn and cassava dough portion.',
    image: '/images/Banku.jpg',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Jollof Rice',
    category: 'Staples',
    price: 25.00,
    description: 'Spiced Ghanaian tomato jollof rice.',
    image: '/images/Jollof.jpg',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Plain Rice',
    category: 'Staples',
    price: 20.00,
    description: 'Steamed long-grain white rice.',
    image: '/images/Plain Rice.jpg',
    isAvailable: true,
  },
  {
    id: '4',
    name: 'Waakye',
    category: 'Staples',
    price: 25.00,
    description: 'Classic rice and beans cooked with dried sorghum leaves.',
    image: '/images/Waakye.jpg',
    isAvailable: true,
  },
  {
    id: '5',
    name: 'Kenkey',
    category: 'Staples',
    price: 15.00,
    description: 'Fermented white corn dough wrapped in corn husks.',
    image: '/images/Kenkey.jpg',
    isAvailable: true,
  },
  {
    id: '6',
    name: 'Fufu',
    category: 'Staples',
    price: 30.00,
    description: 'Pounded cassava and green plantain portion.',
    image: '/images/Fufu.jpg',
    isAvailable: true,
  },
  {
    id: '7',
    name: 'Fish',
    category: 'Proteins',
    price: 20.00,
    description: 'Fried or grilled seasoned fish portion.',
    image: '/images/Fried Fish.jpg',
    isAvailable: true,
  },
  {
    id: '8',
    name: 'Chicken',
    category: 'Proteins',
    price: 25.00,
    description: 'Crispy fried or roasted chicken piece.',
    image: '/images/Fried Chicken.jpg',
    isAvailable: true,
  },
  {
    id: '9',
    name: 'Gizzard',
    category: 'Proteins',
    price: 15.00,
    description: 'Spiced and grilled turkey/chicken gizzard skewer.',
    image: '/images/Gizzard.jpg',
    isAvailable: true,
  },
  {
    id: '10',
    name: 'Sausages',
    category: 'Proteins',
    price: 10.00,
    description: 'Pan-fried meat sausages.',
    image: '/images/Sausages.jpg',
    isAvailable: true,
  },
  {
    id: '11',
    name: 'Meat (Assorted)',
    category: 'Proteins',
    price: 20.00,
    description: 'Selection of goat, beef, or cow hide (wele).',
    image: '/images/Meat Assorted_11zon.jpg',
    isAvailable: true,
  },
  {
    id: '12',
    name: 'Tomato Stew',
    category: 'Stews & Soups',
    price: 10.00,
    description: 'Rich spiced tomato and onion stew.',
    image: '/images/Tomatoe Stew.jpg',
    isAvailable: true,
  },
  {
    id: '13',
    name: 'Other Stews',
    category: 'Stews & Soups',
    price: 10.00,
    description: 'Contour/palava stew or vegetable stew options.',
    image: '/images/Kontomire.jpg',
    isAvailable: true,
  },
  {
    id: '14',
    name: 'Goat Soup',
    category: 'Stews & Soups',
    price: 20.00,
    description: 'Traditional light goat soup with indigenous spices.',
    image: '/images/Goat Soup.jpg',
    isAvailable: true,
  },
  {
    id: '15',
    name: 'Chicken Soup',
    category: 'Stews & Soups',
    price: 15.00,
    description: 'Slow-simmered chicken light soup.',
    image: '/images/Chiken Soup.jpg',
    isAvailable: true,
  },
  {
    id: '16',
    name: 'Fish Soup',
    category: 'Stews & Soups',
    price: 15.00,
    description: 'Fresh fish light soup seasoned with local herbs.',
    image: '/images/Fish Soup.jpg',
    isAvailable: true,
  },
  {
    id: '17',
    name: 'Groundnut / Palm Soup',
    category: 'Stews & Soups',
    price: 20.00,
    description: 'Rich peanut butter or palm nut soup.',
    image: '/images/Palmnut Soup.jpg',
    isAvailable: true,
  },
  {
    id: '18',
    name: 'Pepper (Shito & Fresh)',
    category: 'Stews & Soups',
    price: 5.00,
    description: 'Black pepper (shito) or freshly ground red/green pepper sauce.',
    image: '/images/Pepper.jpg',
    isAvailable: true,
  },
];

export const MENU_AVAILABILITY_STORAGE_KEY = 'restaurant-menu-availability';

export function readMenuAvailability(): Record<string, boolean> {
  try {
    const stored = window.localStorage.getItem(MENU_AVAILABILITY_STORAGE_KEY);
    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean')
    );
  } catch {
    return {};
  }
}

export function saveMenuItemAvailability(id: string, isAvailable: boolean): void {
  const availability = readMenuAvailability();
  availability[id] = isAvailable;
  window.localStorage.setItem(MENU_AVAILABILITY_STORAGE_KEY, JSON.stringify(availability));
  window.dispatchEvent(new Event('menu-availability-change'));
}