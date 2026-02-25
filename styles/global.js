// styles/global.js
import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '../constants/theme';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  bodyText: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: '800',
  },
});
