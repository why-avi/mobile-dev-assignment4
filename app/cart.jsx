// app/cart.jsx
// Shopping Cart screen.
// Reads from SQLite, supports quantity update, remove, and checkout.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  getCartItems,
  removeFromCart,
  updateCartQuantity,
  placeOrder,
} from '../services/database';
import { useCart } from '../services/CartContext';
import { Colors, Spacing, Radius } from '../services/theme';

export default function CartScreen() {
  const router = useRouter();
  const { refreshCart } = useCart();

  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  // ── Load cart from SQLite ─────────────────────────────────────────────────
  const loadCart = useCallback(async () => {
    try {
      const rows = await getCartItems();
      setItems(rows ?? []);
    } catch (err) {
      console.error('[CartScreen] loadCart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleRemove = async (id) => {
    await removeFromCart(id);
    await loadCart();
    await refreshCart();
  };

  const handleQtyChange = async (id, newQty) => {
    await updateCartQuantity(id, newQty);
    await loadCart();
    await refreshCart();
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    Alert.alert(
      'Confirm Order',
      `Place order for $${total.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: async () => {
            setCheckingOut(true);
            try {
              await placeOrder(items, total);
              await loadCart();
              await refreshCart();
              Alert.alert(
                '🎉 Order Confirmed!',
                'Thank you for shopping with ShopLux.',
                [{ text: 'Continue Shopping', onPress: () => router.push('/') }]
              );
            } catch (err) {
              Alert.alert('Error', 'Failed to place order. Please try again.');
            } finally {
              setCheckingOut(false);
            }
          },
        },
      ]
    );
  };

  // ── Derived totals ────────────────────────────────────────────────────────
  const total     = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

  // ── Loading spinner ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>🛍️</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some items to get started</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/')}>
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Cart item row ─────────────────────────────────────────────────────────
  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <TouchableOpacity onPress={() => router.push(`/product/${item.product_id}`)}>
        <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
      </TouchableOpacity>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemUnitPrice}>${item.price.toFixed(2)} each</Text>

        <View style={styles.itemFooter}>
          {/* Quantity control */}
          <View style={styles.qtyControl}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleQtyChange(item.id, item.quantity - 1)}
            >
              <Ionicons
                name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                size={15}
                color={item.quantity === 1 ? Colors.danger : Colors.text}
              />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleQtyChange(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={15} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Row subtotal */}
          <Text style={styles.subtotal}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      </View>

      {/* Remove button */}
      <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
        <Ionicons name="close" size={16} color={Colors.textFaint} />
      </TouchableOpacity>
    </View>
  );

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <Text style={styles.countLabel}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Order summary + checkout CTA */}
      <SafeAreaView style={styles.summary} edges={['bottom']}>
        <View style={styles.summaryRows}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>Free</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkoutBtn, checkingOut && { opacity: 0.7 }]}
          onPress={handleCheckout}
          disabled={checkingOut}
        >
          {checkingOut ? (
            <ActivityIndicator color={Colors.bg} size="small" />
          ) : (
            <>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.bg} />
              <Text style={styles.checkoutText}>Secure Checkout</Text>
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  centered:  { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },

  // ── Empty ──────────────────────────────────────────────────────────────────
  emptyIcon:     { fontSize: 56, marginBottom: 16 },
  emptyTitle:    { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14, marginBottom: 28 },
  shopBtn:       { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingHorizontal: 28, paddingVertical: 14 },
  shopBtnText:   { color: Colors.bg, fontSize: 15, fontWeight: '800' },

  // ── List ───────────────────────────────────────────────────────────────────
  listContent: { paddingBottom: 20 },
  countLabel:  {
    color: Colors.textMuted,
    fontSize: 13,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  // ── Item row ───────────────────────────────────────────────────────────────
  itemRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  itemImage: {
    width: 90, height: 90,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
  },
  itemInfo:       { flex: 1 },
  itemName:       { color: Colors.text, fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 4 },
  itemUnitPrice:  { color: Colors.textMuted, fontSize: 12, marginBottom: 8 },
  itemFooter:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  qtyControl: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.border,
  },
  qtyBtn:   { padding: 2 },
  qtyValue: { color: Colors.text, fontSize: 14, fontWeight: '700', minWidth: 18, textAlign: 'center' },
  subtotal: { color: Colors.text, fontSize: 15, fontWeight: '700' },

  removeBtn: {
    alignSelf: 'flex-start',
    padding: 4,
  },

  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  // ── Summary ────────────────────────────────────────────────────────────────
  summary: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  summaryRows: { gap: 8, marginBottom: Spacing.md },
  summaryRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel:{ color: Colors.textMuted, fontSize: 14 },
  summaryValue:{ color: Colors.text, fontSize: 14, fontWeight: '600' },
  totalRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 4,
  },
  totalLabel: { color: Colors.text, fontSize: 17, fontWeight: '800' },
  totalValue: { color: Colors.accent, fontSize: 22, fontWeight: '800' },

  checkoutBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  checkoutText: { color: Colors.bg, fontSize: 16, fontWeight: '800' },
});
