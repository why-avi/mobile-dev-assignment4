// constants/products.js
// Static product catalog with helper functions

export const CATEGORIES = ['All', 'Electronics', 'Apparel', 'Footwear', 'Accessories', 'Home'];

export const PRODUCTS = [
  {
    id: '1',
    name: 'Arc Wireless Headphones',
    price: 249.99,
    originalPrice: 329.99,
    category: 'Electronics',
    rating: 4.8,
    reviews: 1247,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80',
    ],
    description:
      'Experience audio like never before. The Arc Wireless Headphones deliver crystal-clear highs, rich mids, and thunderous bass through 40mm custom-tuned drivers. With 30-hour battery life and adaptive noise cancellation, these are built for the discerning audiophile.',
    badge: 'Sale',
    inStock: true,
    tags: ['wireless', 'noise-cancelling', 'premium'],
  },
  {
    id: '2',
    name: 'Phantom Sport Watch',
    price: 189.00,
    originalPrice: null,
    category: 'Accessories',
    rating: 4.6,
    reviews: 892,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
    description:
      'Engineered for performance, designed for style. The Phantom Sport Watch tracks heart rate, sleep, GPS, and more — wrapped in an aerospace-grade titanium case with sapphire crystal glass. Water resistant to 100m.',
    badge: 'New',
    inStock: true,
    tags: ['fitness', 'gps', 'titanium'],
  },
  {
    id: '3',
    name: 'Noir Leather Sneakers',
    price: 145.00,
    originalPrice: null,
    category: 'Footwear',
    rating: 4.7,
    reviews: 613,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    description:
      'Where minimalism meets luxury. Handcrafted from full-grain Italian leather with a vulcanized rubber sole. The Noir sneaker transitions effortlessly from street to studio, morning to midnight.',
    badge: null,
    inStock: true,
    tags: ['leather', 'minimalist', 'handcrafted'],
  },
  {
    id: '4',
    name: 'Studio Pro Laptop Bag',
    price: 119.99,
    originalPrice: 159.99,
    category: 'Accessories',
    rating: 4.5,
    reviews: 445,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
    description:
      'Carry everything, show nothing. The Studio Pro Bag features a padded 16" laptop sleeve, hidden pockets, and a magnetic closure system. Made from recycled-fiber canvas with vegan leather trim.',
    badge: 'Sale',
    inStock: true,
    tags: ['laptop', 'canvas', 'vegan'],
  },
  {
    id: '5',
    name: 'Urban Puffer Jacket',
    price: 215.00,
    originalPrice: null,
    category: 'Apparel',
    rating: 4.9,
    reviews: 782,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80'],
    description:
      "Stay warm without compromising on style. The Urban Puffer uses recycled 700-fill-power down insulation inside a ripstop shell. Packable to the size of a water bottle, it's your go-anywhere layer.",
    badge: 'New',
    inStock: true,
    tags: ['down', 'packable', 'winter'],
  },
  {
    id: '6',
    name: 'Ceramic Pour-Over Set',
    price: 89.00,
    originalPrice: null,
    category: 'Home',
    rating: 4.4,
    reviews: 329,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'],
    description:
      'Elevate your morning ritual. This hand-thrown ceramic pour-over set includes the dripper, server, and two mugs — all finished in our signature matte ash glaze. Designed for the coffee enthusiast who appreciates beauty in function.',
    badge: null,
    inStock: true,
    tags: ['coffee', 'ceramic', 'handmade'],
  },
  {
    id: '7',
    name: 'Precision Keyboard',
    price: 179.99,
    originalPrice: null,
    category: 'Electronics',
    rating: 4.7,
    reviews: 1054,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80'],
    description:
      'Type with authority. The Precision Keyboard features custom low-profile mechanical switches, a brushed aluminum chassis, and per-key RGB lighting. Bluetooth 5.3 with tri-device pairing and USB-C charging.',
    badge: null,
    inStock: true,
    tags: ['mechanical', 'bluetooth', 'rgb'],
  },
  {
    id: '8',
    name: 'Essential Tee — Obsidian',
    price: 48.00,
    originalPrice: null,
    category: 'Apparel',
    rating: 4.3,
    reviews: 2156,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
    description:
      "The only t-shirt you'll ever need. Made from 200gsm Supima cotton with a relaxed boxy fit. Pre-shrunk, garment-dyed, and stonewashed for a lived-in feel right out of the bag.",
    badge: null,
    inStock: true,
    tags: ['cotton', 'essential', 'unisex'],
  },
];

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === String(id)) || null;
}

export function getProductsByCategory(category) {
  if (!category || category === 'All') return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}

export function searchProducts(query) {
  const q = query.toLowerCase().trim();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
  );
}

export function upsertProducts(items) {
  if (!Array.isArray(items) || items.length === 0) return;

  items.forEach((item) => {
    const normalized = { ...item, id: String(item.id) };
    const idx = PRODUCTS.findIndex((p) => p.id === normalized.id);
    if (idx >= 0) {
      PRODUCTS[idx] = normalized;
    } else {
      PRODUCTS.unshift(normalized);
    }
  });
}

export function removeProductById(id) {
  const target = String(id);
  const idx = PRODUCTS.findIndex((p) => p.id === target);
  if (idx >= 0) {
    PRODUCTS.splice(idx, 1);
    return true;
  }
  return false;
}
