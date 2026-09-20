/**
 * Shell Mobile (POC) — camada nativa minima.
 *
 * O que este app demonstra:
 *  - A camada nativa fica estritamente enxuta: navegacao (stack),
 *    catalogo de jornadas e dispatch por tipo. Nenhuma regra de
 *    negocio vive aqui — as jornadas nativas ficam em src/journeys/.
 *  - Reuso real dos pacotes do monorepo: @portal/api-client (mesmo
 *    cliente HTTP do web), @portal/core (contratos + telemetry) e
 *    @portal/design-tokens (mesmas cores do web).
 *  - Coexistencia: jornadas legadas abrem em WebView (mesmo papel do
 *    iframe sandboxed no shell web).
 *
 * Producao: cada jornada seria um bundle federado via Re.Pack
 * (Module Federation para React Native) atualizado OTA — mesmo modelo
 * de deploy independente por squad que o web ja tem.
 */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { JourneyManifestEntry } from '@portal/core';
import { colors } from '@portal/design-tokens';
import { CatalogScreen } from './screens/CatalogScreen';
import { JourneyScreen } from './screens/JourneyScreen';

export type RootStackParamList = {
  Catalog: undefined;
  Journey: { journey: JourneyManifestEntry };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerTintColor: colors.primary,
            headerStyle: { backgroundColor: colors.surface },
            headerTitleStyle: { color: colors.text },
          }}
        >
          <Stack.Screen
            name="Catalog"
            component={CatalogScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Journey"
            component={JourneyScreen}
            options={({ route }) => ({ title: route.params.journey.name })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
