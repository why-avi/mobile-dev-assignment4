// app/profile.jsx
// User Profile screen — view/edit user info, order history, account links.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getUser, updateUser, getOrders } from '../services/database';
import CartButton from '../components/CartButton';
import { Colors, Spacing, Radius } from '../services/theme';

// ── Small sub-component: editable field row ───────────────────────────────────
function ProfileField({ label, icon, value, onChangeText, editable, keyboardType }) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.row, editable && fieldStyles.rowActive]}>
        <Ionicons
          name={icon}
          size={16}
          color={editable ? Colors.accent : Colors.textMuted}
          style={{ marginRight: 4 }}
        />
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize="none"
          placeholderTextColor={Colors.textMuted}
        />
        {editable && (
          <Ionicons name="create-outline" size={14} color={Colors.textFaint} />
        )}
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  rowActive: {
    borderColor: Colors.accent + '66',
    backgroundColor: Colors.accent + '0A',
  },
  input: { flex: 1, color: Colors.text, fontSize: 15 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [user, setUser]         = useState(null);
  const [orders, setOrders]     = useState([]);
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    try {
      const [u, o] = await Promise.all([getUser(), getOrders()]);
      setUser(u);
      setOrders(o ?? []);
      if (u) setForm({ name: u.name, email: u.email, phone: u.phone ?? '' });
    } catch (err) {
      console.error('[ProfileScreen] load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert('Validation', 'Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      await updateUser(form);
      await load();
      setEditing(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) setForm({ name: user.name, email: user.email, phone: user.phone ?? '' });
    setEditing(false);
  };

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile hero card ─────────────────────────────────────────────── */}
      <View style={styles.heroCard}>
        <View style={styles.avatarWrap}>
         
          <View style={styles.verifiedDot}>
            <Ionicons name="checkmark" size={10} color={Colors.bg} />
          </View>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{orders.length}</Text>
            <Text style={styles.statLbl}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>${totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLbl}>Spent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>⭐ VIP</Text>
            <Text style={styles.statLbl}>Status</Text>
          </View>
        </View>
      </View>

      {/* ── Personal info ─────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <TouchableOpacity
            style={styles.editToggle}
            onPress={() => (editing ? handleSave() : setEditing(true))}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.accent} size="small" />
            ) : (
              <>
                <Ionicons
                  name={editing ? 'checkmark-circle-outline' : 'pencil-outline'}
                  size={16}
                  color={Colors.accent}
                />
                <Text style={styles.editToggleText}>{editing ? 'Save' : 'Edit'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <ProfileField
          label="Full Name"
          icon="person-outline"
          value={form.name}
          onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
          editable={editing}
        />
        <ProfileField
          label="Email Address"
          icon="mail-outline"
          value={form.email}
          onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
          editable={editing}
          keyboardType="email-address"
        />
        <ProfileField
          label="Phone Number"
          icon="call-outline"
          value={form.phone}
          onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
          editable={editing}
          keyboardType="phone-pad"
        />

        {editing && (
          <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Order history ─────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order History</Text>

        {orders.length === 0 ? (
          <View style={styles.noOrders}>
            <Text style={styles.noOrdersIcon}>📦</Text>
            <Text style={styles.noOrdersText}>No orders yet</Text>
          </View>
        ) : (
          orders.map((order) => {
            let parsedItems = [];
            try { parsedItems = JSON.parse(order.items_json); } catch (_) {}
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <View>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>
                <View style={styles.orderBottom}>
                  <Text style={styles.orderItems}>{parsedItems.length} item(s)</Text>
                  <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* ── Account menu ──────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {[
          { icon: 'heart-outline',          label: 'Wishlist',           count: '12' },
          { icon: 'location-outline',        label: 'Saved Addresses',    count: '3' },
          { icon: 'card-outline',            label: 'Payment Methods',    count: '2' },
          { icon: 'notifications-outline',   label: 'Notifications' },
          { icon: 'shield-outline',          label: 'Privacy & Security' },
          { icon: 'help-circle-outline',     label: 'Help & Support' },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuRow} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={18} color={Colors.accent} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <View style={styles.menuRight}>
              {item.count && <Text style={styles.menuCount}>{item.count}</Text>}
              <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { paddingBottom: 20 },
  centered:      { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },

  // ── Hero card ──────────────────────────────────────────────────────────────
  heroCard: {
    margin: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarWrap:  { position: 'relative', marginBottom: Spacing.md },
  avatar: {
    width: 86, height: 86,
    borderRadius: 43,
    borderWidth: 3, borderColor: Colors.accent,
  },
  verifiedDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.bgCard,
  },
  userName:  { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  userEmail: { color: Colors.textMuted, fontSize: 14, marginBottom: Spacing.lg },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
    width: '100%',
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statVal:     { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 2 },
  statLbl:     { color: Colors.textMuted, fontSize: 11 },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },

  // ── Section ────────────────────────────────────────────────────────────────
  section:       { marginHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle:  { color: Colors.text, fontSize: 17, fontWeight: '700' },

  editToggle:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  editToggleText: { color: Colors.accent, fontSize: 14, fontWeight: '700' },

  cancelBtn:  { marginTop: 8, alignSelf: 'center' },
  cancelText: { color: Colors.textMuted, fontSize: 14 },

  // ── Orders ─────────────────────────────────────────────────────────────────
  noOrders:     { alignItems: 'center', padding: 24 },
  noOrdersIcon: { fontSize: 40, marginBottom: 12 },
  noOrdersText: { color: Colors.textMuted, fontSize: 15 },

  orderCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId:     { color: Colors.text, fontSize: 14, fontWeight: '700' },
  orderDate:   { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  statusBadge: {
    backgroundColor: Colors.success + '22',
    borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusText: { color: Colors.success, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingTop: 12,
  },
  orderItems: { color: Colors.textMuted, fontSize: 13 },
  orderTotal: { color: Colors.accent, fontSize: 16, fontWeight: '800' },

  // ── Menu ───────────────────────────────────────────────────────────────────
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLeft:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIconWrap:{
    width: 36, height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel:  { color: Colors.text, fontSize: 15, fontWeight: '600' },
  menuRight:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuCount:  { color: Colors.textMuted, fontSize: 13 },
});
