// app/_layout.jsx
// Root layout: initialises the SQLite database, wraps the app in CartProvider,
// then renders an Expo Router Stack navigator.

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '../services/database';
import { CartProvider } from '../services/CartContext';
import { Colors } from '../services/theme';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('[RootLayout] DB init failed:', err);
        setDbReady(true); // still let the app render
      });
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <CartProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.bg },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'slide_from_right',
        }}
      >
        {/* Home — no header (custom top bar inside screen) */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* Product detail — transparent header so image bleeds to top */}
        <Stack.Screen
          name="product/[id]"
          options={{
            headerShown: true,
            headerTransparent: true,
            title: '',
          }}
        />

        {/* Cart — slides up as a modal */}
        <Stack.Screen
          name="cart"
          options={{
            headerShown: true,
            title: 'My Cart',
            presentation: 'modal',
          }}
        />

        {/* Profile */}
        <Stack.Screen
          name="profile"
          options={{
            headerShown: true,
            title: 'Profile',
          }}
        />
      </Stack>
    </CartProvider>
  );
}
