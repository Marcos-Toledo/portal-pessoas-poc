/**
 * Jornada de Ponto (squad A) — versao nativa.
 * Na POC os componentes de jornada ficam neste app; em producao seriam
 * bundles federados via Re.Pack, publicados pela squad de forma
 * independente e carregados em runtime pelo shell.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { PontoRegistro } from '@portal/api-client';
import { colors, spacing } from '@portal/design-tokens';
import { client, telemetry } from '../client';

export function PontoJourney() {
  const [registros, setRegistros] = useState<PontoRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(() => {
    client
      .getPontoDoDia()
      .then(setRegistros)
      .catch((e) => telemetry.error(e, { journey: 'ponto' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(refresh, [refresh]);

  const registrar = async () => {
    setSaving(true);
    try {
      const r = await client.registrarPonto();
      telemetry.track('ponto_registrado', { tipo: r.tipo });
      setRegistros((prev) => [...prev, r]);
    } catch (e) {
      telemetry.error(e as Error, { journey: 'ponto' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.md }}
    >
      <Pressable
        style={[styles.button, saving && { opacity: 0.6 }]}
        onPress={registrar}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrar ponto agora</Text>
        )}
      </Pressable>

      <Text style={styles.sectionTitle}>Batidas de hoje</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : registros.length === 0 ? (
        <Text style={styles.muted}>Nenhuma batida registrada hoje.</Text>
      ) : (
        registros.map((r) => (
          <View key={r.id} style={styles.row}>
            <View
              style={[
                styles.tipoBadge,
                {
                  backgroundColor:
                    r.tipo === 'ENTRADA' ? '#dcfce7' : '#fee2e2',
                },
              ]}
            >
              <Text
                style={[
                  styles.tipoText,
                  { color: r.tipo === 'ENTRADA' ? '#166534' : '#991b1b' },
                ]}
              >
                {r.tipo}
              </Text>
            </View>
            <Text style={styles.hora}>
              {new Date(r.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfaceAlt },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  muted: { color: colors.textMuted, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tipoBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  tipoText: { fontSize: 11, fontWeight: '700' },
  hora: { fontSize: 15, fontWeight: '600', color: colors.text },
});
