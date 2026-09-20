import type { TypedEventBus } from './events';

/**
 * Contratos entre Shell, BFF e MFEs.
 * O JourneyManifest é o coração do Plugin Registry Pattern:
 * o shell descobre jornadas em runtime, sem rebuild.
 */

export type JourneyType = 'mfe' | 'legacy';

export interface JourneyManifestEntry {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: string;
  category: string;
  type: JourneyType;
  /** Apenas para type = 'mfe' */
  remote?: {
    name: string;
    entry: string;
    module: string;
  };
  /** Apenas para type = 'legacy' */
  legacyUrl?: string;
  requiredRoles: string[];
}

export interface JourneyManifest {
  version: string;
  generatedAt: string;
  journeys: JourneyManifestEntry[];
}

export interface FeatureFlags {
  [flag: string]: boolean;
}

export interface PortalUser {
  id: string;
  name: string;
  roles: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  source: string;
}

/**
 * Contexto que o Shell injeta em cada MFE no mount.
 * É a única "porta de entrada" — MFEs não conhecem o shell diretamente.
 */
export interface MountContext {
  user: PortalUser;
  apiBaseUrl: string;
  authToken: string;
  featureFlags: FeatureFlags;
  telemetry: Telemetry;
  eventBus: typeof TypedEventBus;
}

export interface MountedJourney {
  unmount: () => void;
}

export interface Telemetry {
  track(event: string, props?: Record<string, unknown>): void;
  error(error: Error, context?: Record<string, unknown>): void;
}

