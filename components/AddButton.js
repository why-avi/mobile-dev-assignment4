import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../services/theme';

export default function AddButton({
  color = Colors.text,
  size = 24,
  onAddProduct,
}) {
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    tags: '',
  });

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const closePrompt = () => {
    if (saving) return;
    setVisible(false);
    setForm({
      name: '',
      price: '',
      category: '',
      description: '',
      tags: '',
    });
  };

  const submitProduct = async () => {
    const name = form.name.trim();
    const category = form.category.trim();
    const description = form.description.trim();
    const price = Number(form.price);
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (!name || !category || !description || tags.length === 0) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }

    if (
      Number.isNaN(price)
    ) {
      Alert.alert('Invalid Numbers', 'Price must be a valid number.');
      return;
    }

    if (price <= 0) {
      Alert.alert('Invalid Values', 'Price must be greater than 0.');
      return;
    }

    try {
      setSaving(true);
      await onAddProduct?.({
        name,
        price,
        category,
        description,
        tags,
      });
      closePrompt();
    } catch (err) {
      Alert.alert('Save Failed', 'Could not add product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.wrapper}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="add-circle-outline" size={size} color={color} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closePrompt}
      >
        <View style={styles.backdrop}>
          <View style={styles.promptCard}>
            <Text style={styles.title}>Add Product</Text>
            <Text style={styles.subtitle}>Fill required fields to add a product.</Text>

            <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent}>
              <TextInput
                value={form.name}
                onChangeText={(v) => setField('name', v)}
                style={styles.input}
                placeholder="Name *"
                placeholderTextColor={Colors.textFaint}
                autoFocus
              />
              <TextInput
                value={form.price}
                onChangeText={(v) => setField('price', v)}
                style={styles.input}
                placeholder="Price * (e.g. 49.99)"
                placeholderTextColor={Colors.textFaint}
                keyboardType="decimal-pad"
              />
              <TextInput
                value={form.category}
                onChangeText={(v) => setField('category', v)}
                style={styles.input}
                placeholder="Category *"
                placeholderTextColor={Colors.textFaint}
              />
              <TextInput
                value={form.description}
                onChangeText={(v) => setField('description', v)}
                style={[styles.input, styles.textArea]}
                placeholder="Description *"
                placeholderTextColor={Colors.textFaint}
                multiline
              />
              <TextInput
                value={form.tags}
                onChangeText={(v) => setField('tags', v)}
                style={styles.input}
                placeholder="Tags * (comma separated)"
                placeholderTextColor={Colors.textFaint}
                returnKeyType="done"
                onSubmitEditing={submitProduct}
              />
            </ScrollView>

            <View style={styles.actions}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={closePrompt} disabled={saving}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnPrimary, saving && styles.btnDisabled]}
                onPress={submitProduct}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.bg} />
                ) : (
                  <Text style={styles.btnPrimaryText}>Add</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000099',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  promptCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '86%',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  formScroll: {
    maxHeight: 420,
  },
  formContent: {
    gap: Spacing.sm,
    paddingBottom: 2,
  },
  input: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: 4,
  },
  btn: {
    minWidth: 86,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  btnGhost: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnGhostText: {
    color: Colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  btnPrimary: {
    backgroundColor: Colors.accent,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnPrimaryText: {
    color: Colors.bg,
    fontWeight: '800',
    fontSize: 13,
  },
});
