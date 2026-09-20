/**
 * Singletons da camada nativa: cliente do BFF, telemetry e hosts.
 * hostUri aponta para a maquina que roda o Metro — resolve localhost,
 * emulador Android (10.0.2.2) e dispositivo fisico na mesma rede.
 */
import Constants from 'expo-constants';
import { createPortalClient } from '@portal/api-client';
import { createTelemetry } from '@portal/core';

export const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
export const API_BASE_URL = `http://${host}:4000`;
export const AUTH_TOKEN = 'sso-token-mock.eyJzdWIiOiJ1LTEwMDEifQ.assinatura';

export const client = createPortalClient(API_BASE_URL, () => AUTH_TOKEN);
export const telemetry = createTelemetry('portal-mobile', API_BASE_URL);

/** URLs do manifest apontam para localhost; no device/emulador trocamos pelo host real. */
export const resolveUrl = (url: string) => url.replace('localhost', host);
