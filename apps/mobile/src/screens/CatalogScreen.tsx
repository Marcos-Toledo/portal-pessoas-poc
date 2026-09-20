/**
 * Catalogo de jornadas — a "home" do shell mobile.
 * Cards navegam para a jornada; o que acontece depois depende do tipo:
 * mfe -> jornada nativa da squad; legacy -> WebView do sistema antigo.
 */
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JourneyManifestEntry } from '@portal/core';
import { colors, spacing } from '@portal/design-tokens';
import { client, telemetry } from '../client';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Catalog'>;

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
        style={[styles.badgeText, { color: isLegacy ? '#92400e' : '#166534' }]}
      >
        {isLegacy ? 'legado' : 'novo'}
      </Text>
    </View>
  );
}

export function CatalogScreen({ navigation }: Props) {
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
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
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
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            onPress={() => {
              telemetry.track('journey_open', { journey: item.id });
              navigation.navigate('Journey', { journey: item });
            }}
          >
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <JourneyBadge type={item.type} />
              </View>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
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
    alignItems: 'center',
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
  chevron: {
    fontSize: 22,
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
