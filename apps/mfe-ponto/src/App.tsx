import { createPortalClient, type PontoRegistro } from "@portal/api-client";
import type { MountContext } from "@portal/core";
import { Badge, Button, Card, Spinner } from "@portal/ui";
import { useCallback, useEffect, useState } from "react";

export function App({ ctx }: { ctx: MountContext }) {
  const [registros, setRegistros] = useState<PontoRegistro[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const client = createPortalClient(ctx.apiBaseUrl, () => ctx.authToken);

  const carregar = useCallback(() => {
    client
      .getPontoDoDia()
      .then(setRegistros)
      .catch((e) => {
        setErro("Falha ao carregar registros.");
        ctx.telemetry.error(e, { journeyId: "ponto" });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ctx.telemetry.track("journey_view", { journeyId: "ponto" });
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registrar = async () => {
    setLoading(true);
    try {
      const reg = await client.registrarPonto();
      setRegistros((prev) => [...(prev ?? []), reg]);
      ctx.eventBus.emit("ponto:registrado", {
        timestamp: reg.timestamp,
        tipo: reg.tipo,
      });
      ctx.eventBus.emit("notification:received", {
        id: reg.id,
        title: "Ponto registrado",
        message: `${reg.tipo} às ${new Date(reg.timestamp).toLocaleTimeString("pt-BR")}`,
        source: "mfe-ponto",
      });
      ctx.telemetry.track("ponto_registrado", { tipo: reg.tipo });
    } catch (e) {
      ctx.telemetry.error(e as Error, { journeyId: "ponto" });
      setErro("Não foi possível registrar o ponto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "var(--portal-space-md)" }}>
      <Card title="Registro de Ponto">
        <p style={{ color: "var(--portal-color-text-muted)", marginTop: 0 }}>
          Olá, <b>{ctx.user.name}</b>. Registre sua batida abaixo.
        </p>
        <Button onPress={registrar} disabled={loading} size="lg">
          {loading ? "Registrando..." : "Registrar ponto agora"}
        </Button>
        {erro && <p style={{ color: "var(--portal-color-danger)" }}>{erro}</p>}
      </Card>

      <Card title="Batidas de hoje">
        {registros === null ? (
          <Spinner />
        ) : registros.length === 0 ? (
          <p style={{ color: "var(--portal-color-text-muted)" }}>
            Nenhum registro hoje.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 8,
            }}
          >
            {registros.map((r) => (
              <li
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "var(--portal-space-sm)",
                  background: "var(--portal-color-surface-alt)",
                  borderRadius: "var(--portal-radius-md)",
                }}
              >
                <span>{new Date(r.timestamp).toLocaleTimeString("pt-BR")}</span>
                <Badge tone={r.tipo === "ENTRADA" ? "success" : "info"}>
                  {r.tipo}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
