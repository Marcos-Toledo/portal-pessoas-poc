/**
 * Jornada legada — mesma estrategia do iframe no web: o sistema antigo
 * e renderizado "dentro" do app novo via WebView. Na migracao real, a
 * jornada vai sendo reescrita ate a WebView poder ser removida
 * (Strangler Fig).
 */
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { JourneyManifestEntry } from '@portal/core';
import { colors } from '@portal/design-tokens';
import { resolveUrl } from '../client';

export function LegacyScreen({ journey }: { journey: JourneyManifestEntry }) {
  if (!journey.legacyUrl) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>
          Jornada legada sem URL configurada.
        </Text>
      </View>
    );
  }
  return (
    <WebView
      source={{ uri: resolveUrl(journey.legacyUrl) }}
      style={styles.webview}
    />
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fallbackText: { color: colors.textMuted },
});
