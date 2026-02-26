// app/product/[id].jsx
// Dynamic product detail screen.
// `id` is extracted with useLocalSearchParams()  EExpo Router populates it
// automatically from the [id] segment in the file name.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProductById, removeProductById } from '../../services/products';
import { addToCart, deleteCustomProduct } from '../../services/database';
import { useCart } from '../../services/CartContext';
import { Colors, Spacing, Radius } from '../../services/theme';

const { width, height } = Dimensions.get('window');

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router  = useRouter();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity]   = useState(1);
  const [added, setAdded]         = useState(false);

  useEffect(() => {
    setProduct(getProductById(id));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart(product);
      }
      await refreshCart();
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      Alert.alert('Error', 'Could not add to cart. Please try again.');
    }
  };

  const handleDeleteProduct = () => {
    if (!product) return;

    Alert.alert(
      'Delete Product',
      `Delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove from both SQLite custom table and in-memory catalog.
              await deleteCustomProduct(product.id);
              removeProductById(product.id);
              Alert.alert('Deleted', 'Product removed successfully.');
              router.replace('/');
            } catch (err) {
              Alert.alert('Error', 'Could not delete product. Please try again.');
            }
          },
        },
      ]
    );
  };

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Product not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Floating nav buttons (back + cart) */}
      <SafeAreaView style={styles.floatingHeader} edges={['top']}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.push('/cart')}>
          <Ionicons name="bag-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero image */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: product.images?.[activeImg] ?? product.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Thumbnail strip (shown only when product has multiple images) */}
          {product.images?.length > 1 && (
            <View style={styles.thumbStrip}>
              {product.images.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.thumb, activeImg === idx && styles.thumbActive]}
                  onPress={() => setActiveImg(idx)}
                >
                  <Image source={{ uri }} style={styles.thumbImg} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Content area */}
        <View style={styles.content}>
          {/* Category + badge */}
          <View style={styles.metaRow}>
            <Text style={styles.category}>{product.category}</Text>
            {product.badge ? (
              <View style={[styles.badge, product.badge === 'Sale' ? styles.badgeSale : styles.badgeNew]}>
                <Text style={styles.badgeText}>{product.badge}</Text>
              </View>
            ) : null}
          </View>

          {/* Title */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Star rating */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Text key={n} style={n <= Math.round(product.rating) ? styles.starOn : styles.starOff}>
                  ★
                </Text>
              ))}
            </View>
            <Text style={styles.ratingVal}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviews.toLocaleString()} reviews)</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.originalPrice ? (
              <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
            ) : null}
            {discount ? (
              <View style={styles.savePill}>
                <Text style={styles.savePillText}>Save {discount}%</Text>
              </View>
            ) : null}
          </View>

          {/* Description */}
          <Text style={styles.descLabel}>About this product</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {product.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}># {tag}</Text>
              </View>
            ))}
          </View>

          {/* Quantity selector */}
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Ionicons name="remove" size={18} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => Math.min(10, q + 1))}
              >
                <Ionicons name="add" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Delete Button */} 
              <TouchableOpacity 
              style={styles.dltWrapper}
              onPress={handleDeleteProduct}>
                <Ionicons name='close-outline' size={20} style={styles.dltBadge} />
                <Text style={styles.dltText}>Delete</Text>
              </TouchableOpacity>

          {/* Spacer so content clears the CTA bar */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* ── Fixed Add-to-Cart CTA ─────────────────────────────────────────── */}
      <SafeAreaView style={styles.ctaBar} edges={['bottom']}>
        <TouchableOpacity
          style={[styles.addBtn, added && styles.addBtnSuccess]}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <Ionicons
            name={added ? 'checkmark-circle' : 'bag-add-outline'}
            size={20}
            color={Colors.bg}
          />
          <Text style={styles.addBtnText}>
            {added
              ? 'Added to Cart!'
              : `Add to Cart  ·  $${(product.price * quantity).toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  //--- Delete Button -------------------------------------------------
  dltWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: Colors.danger + '18',
    gap: 6,
  },
  dltBadge: {
    color: Colors.danger,
  },
  dltText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Floating header ───────────────────────────────────────────────────────
  floatingHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  circleBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgCard + 'EE',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },

  // ── Hero image ────────────────────────────────────────────────────────────
  heroWrap: {
    width,
    height: height * 0.46,
    backgroundColor: Colors.bgElevated,
  },
  heroImage: { width: '100%', height: '100%' },
  thumbStrip: {
    position: 'absolute',
    bottom: 12, right: 12,
    gap: 6,
  },
  thumb: {
    width: 50, height: 50,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: { borderColor: Colors.accent },
  thumbImg:    { width: '100%', height: '100%' },

  // ── Content ───────────────────────────────────────────────────────────────
  content: { padding: Spacing.md },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  category: {
    color: Colors.accent,
    fontSize: 12, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeSale: { backgroundColor: Colors.accent },
  badgeNew:  { backgroundColor: Colors.gold },
  badgeText: { color: Colors.bg, fontSize: 10, fontWeight: '700' },

  name: {
    color: Colors.text,
    fontSize: 24, fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 10,
  },

  ratingRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  stars:       { flexDirection: 'row' },
  starOn:      { color: Colors.gold, fontSize: 14 },
  starOff:     { color: Colors.textFaint, fontSize: 14 },
  ratingVal:   { color: Colors.text, fontSize: 14, fontWeight: '700' },
  reviewCount: { color: Colors.textMuted, fontSize: 13 },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  price:         { color: Colors.text, fontSize: 28, fontWeight: '800' },
  originalPrice: { color: Colors.textMuted, fontSize: 17, textDecorationLine: 'line-through' },
  savePill: {
    backgroundColor: Colors.success + '22',
    borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  savePillText: { color: Colors.success, fontSize: 12, fontWeight: '700' },

  descLabel:   { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  description: { color: Colors.textMuted, fontSize: 14, lineHeight: 22, marginBottom: 16 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag:     {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  tagText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },

  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  qtyLabel: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  qtyControl: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  qtyBtn:   { padding: 2 },
  qtyValue: {
    color: Colors.text, fontSize: 17, fontWeight: '700',
    minWidth: 24, textAlign: 'center',
  },

  // ── CTA bar ───────────────────────────────────────────────────────────────
  ctaBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 4,
  },
  addBtnSuccess: { backgroundColor: Colors.success },
  addBtnText: { color: Colors.bg, fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },

  // ── Not found ─────────────────────────────────────────────────────────────
  notFound:     { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.text, fontSize: 18, marginBottom: 20 },
  backBtn:      { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingHorizontal: 24, paddingVertical: 12 },
  backBtnText:  { color: Colors.bg, fontWeight: '700', fontSize: 15 },
});

