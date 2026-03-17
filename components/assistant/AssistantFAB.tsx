import { TouchableOpacity, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { ThemedText } from '../ui/ThemedText';
import { COLORS } from '../../lib/utils/constants';

export function AssistantFAB() {
  const pathname = usePathname();

  // Hide FAB when already on the assistant screen
  if (pathname === '/assistant') return null;

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.push('/assistant')}
      activeOpacity={0.8}
    >
      <ThemedText variant="body" style={styles.icon}>
        💬
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 100,
  },
  icon: {
    fontSize: 24,
  },
});
