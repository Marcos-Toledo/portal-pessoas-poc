/**
 * Simula um sistema legado (ex.: JSP/ASP.NET) servido em outra origem.
 *
 * Demonstra o padrão de encapsulamento:
 *  - roda em porta própria (origem diferente do shell);
 *  - comunica-se com o shell via postMessage com contrato tipado;
 *  - recebe o token SSO do shell somente após handshake LEGACY_READY;
 *  - reporta navegação interna para o shell refletir na URL.
 */
import http from 'node:http';

const PORT = process.env.PORT ?? 4001;
const SHELL_ORIGIN = process.env.SHELL_ORIGIN ?? 'http://localhost:5173';

function page(title, body) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${title} — Sistema Legado</title>
<style>
  body { font-family: Tahoma, Verdana, sans-serif; background:#e8e8e8; margin:0; }
  .bar { background:#003366; color:#fff; padding:8px 12px; font-size:12px; }
  .content { padding:16px; }
  table { border-collapse:collapse; background:#fff; width:100%; }
  td, th { border:1px solid #999; padding:6px 10px; font-size:13px; text-align:left; }
  th { background:#ccc; }
  .btn { background:#003366; color:#fff; border:1px solid #001a33; padding:4px 12px; font-size:12px; cursor:pointer; }
  .token { background:#ffffcc; border:1px dashed #999; padding:8px; font-size:11px; margin-top:12px; word-break:break-all; }
</style>
</head>
<body>
<div class="bar">SISTEMA LEGADO RH-WEB v3.2 — ${title}</div>
<div class="content">
  ${body}
  <p><button class="btn" onclick="navInterna()">Navegar dentro do legado</button></p>
  <div id="auth" class="token">Aguardando credencial do Shell...</div>
</div>
<script>
  const SHELL_ORIGIN = '${SHELL_ORIGIN}';
  window.addEventListener('message', (event) => {
    if (event.origin !== SHELL_ORIGIN) return;
    if (event.data && event.data.type === 'SHELL_AUTH_TOKEN') {
      document.getElementById('auth').textContent =
        'Token SSO recebido do Shell: ' + event.data.payload.token.slice(0, 24) + '...';
    }
  });
  function navInterna() {
    window.parent.postMessage(
      { type: 'LEGACY_NAVIGATION', payload: '?pagina=detalhe', timestamp: Date.now() },
      SHELL_ORIGIN
    );
  }
  window.parent.postMessage(
    { type: 'LEGACY_READY', timestamp: Date.now() },
    SHELL_ORIGIN
  );
</script>
</body>
</html>`;
}

const pages = {
  '/ferias': page('Férias', `
    <h2>Solicitação de Férias</h2>
    <table><tr><th>Período</th><th>Dias</th><th>Status</th></tr>
    <tr><td>12/01/2027 - 26/01/2027</td><td>15</td><td>APROVADO</td></tr>
    <tr><td>01/07/2027 - 15/07/2027</td><td>15</td><td>SALDO DISPONÍVEL</td></tr></table>`),
  '/holerite': page('Holerite', `
    <h2>Demonstrativo de Pagamento</h2>
    <table><tr><th>Competência</th><th>Bruto</th><th>Líquido</th></tr>
    <tr><td>09/2026</td><td>R$ 9.850,00</td><td>R$ 7.412,30</td></tr>
    <tr><td>08/2026</td><td>R$ 9.850,00</td><td>R$ 7.398,10</td></tr></table>`),
};

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    const html = pages[url.pathname];
    res.writeHead(html ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html ?? '<h1>404 — legado</h1>');
  })
  .listen(PORT, () =>
    console.log(`[legacy] http://localhost:${PORT} (ferias, holerite)`),
  );
