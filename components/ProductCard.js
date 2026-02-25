// components/ProductCard.js
// Displays a product in a two-column grid card.
// Navigates to /product/[id] on press.

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../services/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 2 - Spacing.sm) / 2;

export default function ProductCard({ product }) {
  const router = useRouter();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />

        {/* Sale / New badge */}
        {product.badge ? (
          <View style={[styles.badge, product.badge === 'Sale' ? styles.badgeSale : styles.badgeNew]}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        ) : null}

        {/* Discount % pill */}
        {discount ? (
          <View style={styles.discountPill}>
            <Text style={styles.discountText}>−{discount}%</Text>
          </View>
        ) : null}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* Rating row */}
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.reviews}>({product.reviews})</Text>
        </View>

        {/* Price row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.originalPrice ? (
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  imageWrap: {
    width: '100%',
    height: CARD_WIDTH * 1.1,
    backgroundColor: Colors.bgElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeSale: { backgroundColor: Colors.accent },
  badgeNew:  { backgroundColor: Colors.gold },
  badgeText: {
    color: Colors.bg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  discountPill: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.bg + 'CC',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  discountText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    padding: Spacing.sm + 2,
  },
  category: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  name: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 2,
  },
  star:    { color: Colors.gold, fontSize: 11 },
  rating:  { color: Colors.text, fontSize: 11, fontWeight: '600' },
  reviews: { color: Colors.textMuted, fontSize: 10 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  originalPrice: {
    color: Colors.textMuted,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
});
