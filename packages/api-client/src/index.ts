/**
 * Cliente HTTP padronizado do portal.
 * Todo acesso a backend passa por aqui — MFEs nunca chamam fetch/axios
 * diretamente. É o que permite trocar BFF, auth ou retry policy sem
 * tocar nas jornadas.
 */
import type {
  FeatureFlags,
  JourneyManifest,
  Notification,
  PortalUser,
} from '@portal/core';

export interface PontoRegistro {
  id: string;
  timestamp: string;
  tipo: 'ENTRADA' | 'SAIDA';
}

export interface Beneficio {
  id: string;
  nome: string;
  descricao: string;
  status: 'ATIVO' | 'PENDENTE' | 'DISPONIVEL';
}

export interface SearchResult {
  id: string;
  title: string;
  kind: 'jornada' | 'pagina';
  route: string;
}

export function createPortalClient(baseUrl: string, getToken: () => string) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      throw new Error(`API ${path} -> ${res.status}`);
    }
    return (await res.json()) as T;
  }

  return {
    me: () => request<PortalUser>('/api/me'),
    getManifest: () => request<JourneyManifest>('/api/manifest'),
    getFeatureFlags: () => request<FeatureFlags>('/api/feature-flags'),
    getNotifications: () => request<Notification[]>('/api/notifications'),
    search: (q: string) =>
      request<SearchResult[]>(`/api/search?q=${encodeURIComponent(q)}`),
    getBeneficios: () => request<Beneficio[]>('/api/beneficios'),
    getPontoDoDia: () => request<PontoRegistro[]>('/api/ponto/hoje'),
    registrarPonto: () =>
      request<PontoRegistro>('/api/ponto/registrar', { method: 'POST' }),
  };
}

export type PortalClient = ReturnType<typeof createPortalClient>;
