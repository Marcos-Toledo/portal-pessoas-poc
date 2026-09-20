/**
 * Dispatcher de jornadas — equivale ao que o shell web faz com
 * loadRemote + mount: dado o manifest, decide como renderizar.
 *  - type 'mfe': jornada nativa da squad (registro por id; desconhecida
 *    cai no fallback — em producao seria loadRemote via Re.Pack)
 *  - type 'legacy': WebView apontando para o sistema antigo
 */
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JourneyManifestEntry } from '@portal/core';
import { colors, spacing } from '@portal/design-tokens';
import type { RootStackParamList } from '../App';
import { PontoJourney } from '../journeys/PontoJourney';
import { BeneficiosJourney } from '../journeys/BeneficiosJourney';
import { LegacyScreen } from './LegacyScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Journey'>;

const nativeJourneys: Record<
  string,
  React.ComponentType<{ journey: JourneyManifestEntry }>
> = {
  ponto: PontoJourney,
  beneficios: BeneficiosJourney,
};

export function JourneyScreen({ route }: Props) {
  const { journey } = route.params;

  if (journey.type === 'legacy') {
    return <LegacyScreen journey={journey} />;
  }

  const Journey = nativeJourneys[journey.id];
  if (!Journey) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>{journey.icon} {journey.name}</Text>
        <Text style={styles.fallbackText}>
          Jornada moderna sem bundle nativo nesta POC — em producao seria
          carregada via Re.Pack (Module Federation OTA).
        </Text>
      </View>
    );
  }
  return <Journey journey={journey} />;
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surfaceAlt,
  },
  fallbackTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  fallbackText: {
    marginTop: spacing.sm,
    fontSize: 13,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
