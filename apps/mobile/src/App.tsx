/**
 * Shell Mobile (POC) — camada nativa mínima.
 *
 * O que este app demonstra:
 *  - A camada nativa fica estritamente enxuta: navegação/container e
 *    renderização de lista. Nenhuma regra de negócio vive aqui.
 *  - Reuso real dos pacotes do monorepo: @portal/api-client (mesmo
 *    cliente HTTP do web), @portal/core (contratos + telemetry) e
 *    @portal/design-tokens (mesmas cores/tipografia do web).
 *
 * Produção: cada jornada seria um bundle federado via Re.Pack
 * (Module Federation para React Native) atualizado OTA — mesmo modelo
 * de deploy independente por squad que o web já tem.
 */
import { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { createPortalClient } from '@portal/api-client';
import { createTelemetry, type JourneyManifestEntry } from '@portal/core';
import { colors, spacing } from '@portal/design-tokens';

const API_BASE_URL = 'http://localhost:4000';
const AUTH_TOKEN = 'sso-token-mock.eyJzdWIiOiJ1LTEwMDEifQ.assinatura';

const client = createPortalClient(API_BASE_URL, () => AUTH_TOKEN);
const telemetry = createTelemetry('portal-mobile', API_BASE_URL);

function JourneyBadge({ type }: { type: JourneyManifestEntry['type'] }) {
  const isLegacy = type === 'legacy';
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isLegacy ? '#fef3c7' : '#dcfce7' },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: isLegacy ? '#92400e' : '#166534' },
        ]}
      >
        {isLegacy ? 'legado' : 'novo'}
      </Text>
    </View>
  );
}

export default function App() {
  const [journeys, setJourneys] = useState<JourneyManifestEntry[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    telemetry.track('app_boot', { platform: 'mobile' });
    client.me().then((u) => setUserName(u.name.split(' ')[0]));
    client
      .getManifest()
      .then((m) => setJourneys(m.journeys))
      .catch((e) => telemetry.error(e, { phase: 'manifest' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Portal Pessoas</Text>
        <Text style={styles.subtitle}>Olá, {userName || '...'}</Text>
      </View>
      <FlatList
        data={journeys}
        keyExtractor={(j) => j.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <JourneyBadge type={item.type} />
              </View>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Carregando jornadas...</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: colors.textMuted,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardIcon: {
    fontSize: 26,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.textMuted,
  },
});
