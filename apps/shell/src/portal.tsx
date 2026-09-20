/**
 * Bootstrap do shell: carrega usuário, feature flags, manifest de jornadas
 * e notificações, e monta o MountContext injetado em cada MFE.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createTelemetry,
  TypedEventBus,
  type FeatureFlags,
  type JourneyManifestEntry,
  type MountContext,
  type Notification,
  type PortalUser,
} from '@portal/core';
import {
  createPortalClient,
  type PortalClient,
} from '@portal/api-client';
import { ensureFederationHost } from './federation';

const API_BASE_URL = 'http://localhost:4000';
const AUTH_TOKEN = 'sso-token-mock.eyJzdWIiOiJ1LTEwMDEifQ.assinatura';

interface PortalState {
  ready: boolean;
  user: PortalUser | null;
  journeys: JourneyManifestEntry[];
  featureFlags: FeatureFlags;
  notifications: Notification[];
  client: PortalClient;
  mountContext: MountContext;
  pushNotification: (n: Notification) => void;
}

const PortalContext = createContext<PortalState | null>(null);

export function usePortal(): PortalState {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal fora do PortalProvider');
  return ctx;
}

function isJourneyVisible(
  j: JourneyManifestEntry,
  flags: FeatureFlags,
  user: PortalUser | null,
): boolean {
  const flag = flags[`jornada-${j.id}`];
  const flagOk = flag === undefined ? true : flag;
  const rolesOk =
    j.requiredRoles.includes('*') ||
    (user !== null && j.requiredRoles.some((r) => user.roles.includes(r)));
  return flagOk && rolesOk;
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const client = useMemo(
    () => createPortalClient(API_BASE_URL, () => AUTH_TOKEN),
    [],
  );
  const telemetry = useMemo(
    () => createTelemetry('portal-shell', API_BASE_URL),
    [],
  );

  const [user, setUser] = useState<PortalUser | null>(null);
  const [journeys, setJourneys] = useState<JourneyManifestEntry[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureFederationHost();
    Promise.all([
      client.me(),
      client.getManifest(),
      client.getFeatureFlags(),
      client.getNotifications(),
    ])
      .then(([me, manifest, flags, notifs]) => {
        setUser(me);
        setFeatureFlags(flags);
        setJourneys(
          manifest.journeys.filter((j) => isJourneyVisible(j, flags, me)),
        );
        setNotifications(notifs);
        setReady(true);
        telemetry.track('portal_boot', {
          journeys: manifest.journeys.length,
        });
      })
      .catch((e) => telemetry.error(e as Error, { phase: 'bootstrap' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notificações emitidas por MFEs chegam via Event Bus, sem acoplamento.
  useEffect(
    () =>
      TypedEventBus.on('notification:received', (n) => {
        setNotifications((prev) => [
          {
            id: n.id,
            title: n.title,
            message: n.message,
            source: n.source,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      }),
    [],
  );

  const mountContext = useMemo<MountContext>(
    () => ({
      user: user ?? { id: 'anon', name: 'Anônimo', roles: [] },
      apiBaseUrl: API_BASE_URL,
      authToken: AUTH_TOKEN,
      featureFlags,
      telemetry,
      eventBus: TypedEventBus,
    }),
    [user, featureFlags, telemetry],
  );

  const value: PortalState = {
    ready,
    user,
    journeys,
    featureFlags,
    notifications,
    client,
    mountContext,
    pushNotification: (n) => setNotifications((prev) => [n, ...prev]),
  };

  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}
