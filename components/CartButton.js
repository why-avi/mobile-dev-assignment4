// components/CartButton.js
// Shopping bag icon with a live item-count badge.
// Tapping navigates to /cart.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../services/CartContext';
import { Colors, Radius } from '../services/theme';

export default function CartButton({ color = Colors.text, size = 24 }) {
  const router = useRouter();
  const { cartCount } = useCart();

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={() => router.push('/cart')}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="bag-outline" size={size} color={color} />

      {cartCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {cartCount > 99 ? '99+' : String(cartCount)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },
});
