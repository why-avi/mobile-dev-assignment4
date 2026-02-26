//database.js
// expo-sqlite v15 uses the new async API exclusively.
// All methods return Promises — no callbacks, no synchronous calls.

import * as SQLite from 'expo-sqlite';

let _db = null;

/** Returns a singleton DB connection */
async function getDB() {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('shoplux.db');
  }
  return _db;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

export async function initDatabase() {
  const db = await getDB();

  // WAL mode for better performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cart (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT    NOT NULL,
      name       TEXT    NOT NULL,
      price      REAL    NOT NULL,
      image      TEXT    NOT NULL,
      quantity   INTEGER NOT NULL DEFAULT 1,
      created_at TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL DEFAULT 'Guest',
      email      TEXT NOT NULL DEFAULT 'guest@shoplux.com',
      phone      TEXT DEFAULT '',
      avatar     TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      total      REAL    NOT NULL,
      items_json TEXT    NOT NULL,
      status     TEXT    DEFAULT 'confirmed',
      created_at TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id     TEXT    NOT NULL UNIQUE,
      name           TEXT    NOT NULL,
      price          REAL    NOT NULL,
      original_price REAL,
      category       TEXT    NOT NULL,
      rating         REAL    NOT NULL DEFAULT 0,
      reviews        INTEGER NOT NULL DEFAULT 0,
      description    TEXT    NOT NULL DEFAULT '',
      badge          TEXT,
      in_stock       INTEGER NOT NULL DEFAULT 1,
      tags_json      TEXT    NOT NULL DEFAULT '[]',
      created_at     TEXT    DEFAULT (datetime('now'))
    );
  `);

  // Seed default user once
  const user = await db.getFirstAsync('SELECT id FROM users LIMIT 1');
  if (!user) {
    await db.runAsync(
      'INSERT INTO users (name, email, phone, avatar) VALUES (?, ?, ?, ?)',
      [
        'Alex Rivera',
        'alex.rivera@shoplux.com',
        '+1 (555) 234-5678',
        'https://i.pravatar.cc/150?img=12',
      ]
    );
  }
}

// ─── CART ─────────────────────────────────────────────────────────────────────

/** Returns all cart rows ordered newest first */
export async function getCartItems() {
  const db = await getDB();
  return db.getAllAsync('SELECT * FROM cart ORDER BY created_at DESC');
}

/** Adds one unit of a product; increments quantity if already present */
export async function addToCart(product) {
  const db = await getDB();
  const existing = await db.getFirstAsync(
    'SELECT id, quantity FROM cart WHERE product_id = ?',
    [String(product.id)]
  );

  if (existing) {
    await db.runAsync(
      'UPDATE cart SET quantity = quantity + 1 WHERE id = ?',
      [existing.id]
    );
  } else {
    await db.runAsync(
      'INSERT INTO cart (product_id, name, price, image, quantity) VALUES (?, ?, ?, ?, 1)',
      [String(product.id), product.name, product.price, product.image]
    );
  }
}

/** Removes a single cart row by its row id */
export async function removeFromCart(id) {
  const db = await getDB();
  await db.runAsync('DELETE FROM cart WHERE id = ?', [id]);
}

/** Sets quantity; deletes the row if newQty <= 0 */
export async function updateCartQuantity(id, newQty) {
  const db = await getDB();
  if (newQty <= 0) {
    await db.runAsync('DELETE FROM cart WHERE id = ?', [id]);
  } else {
    await db.runAsync('UPDATE cart SET quantity = ? WHERE id = ?', [newQty, id]);
  }
}

/** Deletes every row from cart */
export async function clearCart() {
  const db = await getDB();
  await db.runAsync('DELETE FROM cart');
}

/** Returns total item count (sum of quantities) */
export async function getCartCount() {
  const db = await getDB();
  const row = await db.getFirstAsync('SELECT SUM(quantity) AS total FROM cart');
  return row?.total ?? 0;
}

// ─── USER ─────────────────────────────────────────────────────────────────────

/** Returns the single user row */
export async function getUser() {
  const db = await getDB();
  return db.getFirstAsync('SELECT * FROM users LIMIT 1');
}

/** Updates name / email / phone on user id = 1 */
export async function updateUser({ name, email, phone }) {
  const db = await getDB();
  await db.runAsync(
    'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = 1',
    [name, email, phone ?? '']
  );
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

/** Returns all orders newest first */
export async function getOrders() {
  const db = await getDB();
  return db.getAllAsync('SELECT * FROM orders ORDER BY created_at DESC');
}

/** Creates an order record and wipes the cart */
export async function placeOrder(items, total) {
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO orders (total, items_json, status) VALUES (?, ?, ?)',
    [total, JSON.stringify(items), 'confirmed']
  );
  await clearCart();
}

// PRODUCTS -------------------------------------------------------------

/** Returns custom products added by user (persisted in SQLite) */
export async function getCustomProducts() {
  const db = await getDB();
  const rows = await db.getAllAsync('SELECT * FROM products ORDER BY created_at DESC');

  return (rows ?? []).map((row) => ({
    id: String(row.product_id),
    name: row.name,
    price: Number(row.price),
    originalPrice: row.original_price == null ? null : Number(row.original_price),
    category: row.category,
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
    description: row.description ?? '',
    badge: row.badge ?? null,
    inStock: Number(row.in_stock ?? 1) === 1,
    tags: (() => {
      try {
        const parsed = JSON.parse(row.tags_json ?? '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })(),
  }));
}

/** Inserts or updates a custom product by product_id (minimal add-product payload) */
export async function addCustomProduct(product) {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO products
      (product_id, name, price, category, description, tags_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      String(product.id),
      product.name,
      Number(product.price),
      product.category ?? 'Accessories',
      product.description ?? '',
      JSON.stringify(product.tags ?? []),
    ]
  );
}

/* Removes custom product by product ID */
export async function deleteCustomProduct(productId) {
  const db = await getDB();
  await db.runAsync('DELETE FROM products WHERE product_id = ?', [String(productId)]);
}
