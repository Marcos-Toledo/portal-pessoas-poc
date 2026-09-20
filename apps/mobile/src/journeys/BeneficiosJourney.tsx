/**
 * Jornada de Beneficios (squad B) — versao nativa.
 */
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Beneficio } from '@portal/api-client';
import { colors, spacing } from '@portal/design-tokens';
import { client, telemetry } from '../client';

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  ATIVO: { bg: '#dcfce7', fg: '#166534', label: 'ativo' },
  DISPONIVEL: { bg: '#dbeafe', fg: '#1e40af', label: 'disponível' },
  PENDENTE: { bg: '#fef3c7', fg: '#92400e', label: 'pendente' },
};

export function BeneficiosJourney() {
  const [items, setItems] = useState<Beneficio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .getBeneficios()
      .then(setItems)
      .catch((e) => telemetry.error(e, { journey: 'beneficios' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.md }}
      data={items}
      keyExtractor={(b) => b.id}
      renderItem={({ item }) => {
        const s = STATUS_STYLE[item.status] ?? STATUS_STYLE.PENDENTE;
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <View style={[styles.badge, { backgroundColor: s.bg }]}>
                <Text style={[styles.badgeText, { color: s.fg }]}>
                  {s.label}
                </Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>{item.descricao}</Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfaceAlt },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardDesc: { marginTop: 4, fontSize: 13, color: colors.textMuted },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
