// app/index.jsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import ProductCard from '../components/ProductCard';
import CartButton from '../components/CartButton';
import AddButton from '../components/AddButton';
import {
  PRODUCTS,
  CATEGORIES,
  upsertProducts,
} from '../services/products';
import { addCustomProduct, getCustomProducts } from '../services/database';
import { Colors, Spacing, Radius } from '../services/theme';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState(PRODUCTS);

  useEffect(() => {
    let mounted = true;

    const loadCustomProducts = async () => {
      try {
        const rows = await getCustomProducts();
        if (!mounted || rows.length === 0) return;

        const hydrated = rows.map((p) => ({
          ...p,
          image: DEFAULT_IMAGE,
          images: [DEFAULT_IMAGE],
        }));

        upsertProducts(hydrated);
        setProducts((prev) => {
          const map = new Map(prev.map((p) => [String(p.id), p]));
          hydrated.forEach((p) => map.set(String(p.id), p));
          return Array.from(map.values());
        });
      } catch (err) {
        console.error('[HomeScreen] loadCustomProducts:', err);
      }
    };

    loadCustomProducts();
    return () => {
      mounted = false;
    };
  }, []);

  // Derived list  Esearch takes priority over category filter
  //useMemo memorizes (caches) a computed value so React doesn’t recompute it on every render.
  // Why useMemo- In React, components re-render often. If you calculate something expensive each time, it can slow things down.
  // useMemo runs the function only when data changes. Otherwise, it returns the cached value.
  const displayedProducts = useMemo(() => {
    const q = query.toLowerCase().trim();

    return products.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, query, activeCategory]);

  const featuredProducts = useMemo(() => products.slice(0, 3), [products]);

  const handleAddProduct = useCallback(
    async (input) => {
      const category =
        input.category?.trim() || (activeCategory === 'All' ? 'Accessories' : activeCategory);
      const nextId = String(
        products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1
      );
      const created = {
        id: nextId,
        name: input.name,
        price: input.price,
        originalPrice: null,
        category,
        rating: 0,
        reviews: 0,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        description: input.description,
        badge: 'New',
        inStock: true,
        tags: input.tags,
      };

      setProducts((prev) => [created, ...prev.filter((p) => String(p.id) !== created.id)]);

      upsertProducts([created]);
      await addCustomProduct(created);
      setQuery('');
      Alert.alert('Product Added', `${created.name} was added to the catalog.`);
    },
    [activeCategory, products]
  );

  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return "Good morning 👋";
    } else if (currentHour < 18) {
      return "Good afternoon 👋";
    } else {
      return "Good evening 👋";
    }
  };

  // ── Sticky header rendered inside the FlatList ──────────────────────────────
//useCallback memorizes a function, so React doesn’t recreate it on every render.
//In React, functions are recreated on every render:
     //const ListHeader () => (
        //.....
      //);
//Even if nothing changes, ListHeader function is new every time.

//This can cause unnecessary re-renders in child components.

//const ListHeader = useCallback(
    ///...
    //);'
    //Now:

    //The function stays the same between renders
    
    //It only changes if dependencies change
    // useCallback --Only recreate this function if dependencies change.
    //Don’t use them everywhere. They are performance optimizations, not required for normal code.
  const ListHeader = useCallback(
    () => (
      <View>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headline}>Find your style.</Text>
          </View>
          <View style={styles.topActions}>
            <AddButton onAddProduct={handleAddProduct} />
            <CartButton />
            <TouchableOpacity onPress={() => router.push('/profile')}>
            
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products…"
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Featured horizontal banner  Ehidden during search */}
        {!query.trim() && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionLabel}>Featured</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.featuredCard}
                  onPress={() => router.push(`/product/${item.id}`)}
                  activeOpacity={0.88}
                >
                  <Image source={{ uri: item.image }} style={styles.featuredImage} />
                  <View style={styles.featuredOverlay}>
                    <Text style={styles.featuredCategory}>{item.category}</Text>
                    <Text style={styles.featuredName}>{item.name}</Text>
                    <Text style={styles.featuredPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category chip filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          style={styles.categorySection}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
              onPress={() => {
                setActiveCategory(cat);
                setQuery('');
              }}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Row count label */}
        <View style={styles.productHeader}>
          <Text style={styles.sectionLabel}>
            {query.trim()
              ? `Results for "${query.trim()}"`
              : activeCategory === 'All'
              ? 'All Products'
              : activeCategory}
          </Text>
          <Text style={styles.countText}>{displayedProducts.length} items</Text>
        </View>
      </View>
    ),
    [query, activeCategory, displayedProducts.length, featuredProducts, handleAddProduct, router]
  );

  const renderItem = useCallback(({ item }) => <ProductCard product={item} />, []);

  const EmptyState = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptySubtitle}>Try a different search or category</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={displayedProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg },
  listContent: { paddingBottom: 40 },

  // ── Top bar ──────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  greeting:  { color: Colors.textMuted, fontSize: 13, marginBottom: 2 },
  headline:  { color: Colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  topActions:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.accent,
  },

  // ── Search ───────────────────────────────────────────────────────────────────
  searchRow: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 46,
    gap: 8,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15 },

  // ── Featured ─────────────────────────────────────────────────────────────────
  featuredSection: { marginBottom: Spacing.md },
  sectionLabel: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  featuredScroll: { paddingLeft: Spacing.md, paddingRight: Spacing.sm },
  featuredCard: {
    width: 220,
    height: 140,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featuredImage:   { width: '100%', height: '100%', position: 'absolute' },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 12,
    backgroundColor: 'rgba(10,10,15,0.72)',
  },
  featuredCategory: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  featuredName:  { color: Colors.text, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  featuredPrice: { color: Colors.gold, fontSize: 14, fontWeight: '800' },

  // ── Categories ───────────────────────────────────────────────────────────────
  categorySection: { marginBottom: Spacing.sm },
  categoryScroll:  { paddingHorizontal: Spacing.md, gap: 8 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  catChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  catText:       { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  catTextActive: { color: Colors.bg },

  // ── Product header ───────────────────────────────────────────────────────────
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  countText: { color: Colors.textMuted, fontSize: 12 },

  // ── Grid ─────────────────────────────────────────────────────────────────────
  columnWrapper: { paddingHorizontal: Spacing.md, gap: Spacing.sm },

  // ── Empty state ──────────────────────────────────────────────────────────────
  emptyState:   { alignItems: 'center', paddingTop: 60 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyTitle:   { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle:{ color: Colors.textMuted, fontSize: 14 },
});


