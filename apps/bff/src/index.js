/**
 * BFF (Backend for Frontend) da POC.
 *
 * Responsabilidades demonstradas:
 *  - Journey Registry (manifest): fonte da verdade do Plugin Registry.
 *    Adicionar uma jornada = nova entrada aqui, sem rebuild do shell.
 *  - Feature flags para rollout gradual.
 *  - APIs mock de domínio (ponto, benefícios, notificações, busca).
 *  - Em produção faria também o proxy reverso do Strangler Fig.
 */
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ?? 4000;

const user = {
  id: 'u-1001',
  name: 'Marina Souza',
  roles: ['colaborador'],
};

const manifest = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  journeys: [
    {
      id: 'ponto',
      name: 'Registro de Ponto',
      description: 'Registre suas batidas e acompanhe o espelho de ponto.',
      route: '/jornada/ponto',
      icon: '🕐',
      category: 'Tempo',
      type: 'mfe',
      remote: {
        name: 'mfePonto',
        entry: 'http://localhost:5001/remoteEntry.js',
        module: './mount',
      },
      requiredRoles: ['*'],
    },
    {
      id: 'beneficios',
      name: 'Benefícios',
      description: 'Plano de saúde, vale-alimentação e previdência.',
      route: '/jornada/beneficios',
      icon: '🎁',
      category: 'Pessoas',
      type: 'mfe',
      remote: {
        name: 'mfeBeneficios',
        entry: 'http://localhost:5002/remoteEntry.js',
        module: './mount',
      },
      requiredRoles: ['*'],
    },
    {
      id: 'ferias',
      name: 'Férias',
      description: 'Solicitação e acompanhamento de férias (sistema legado).',
      route: '/jornada/ferias',
      icon: '🏖️',
      category: 'Pessoas',
      type: 'legacy',
      legacyUrl: 'http://localhost:4001/ferias?embedded=true',
      requiredRoles: ['*'],
    },
    {
      id: 'holerite',
      name: 'Holerite',
      description: 'Demonstrativos de pagamento (sistema legado).',
      route: '/jornada/holerite',
      icon: '💰',
      category: 'Financeiro',
      type: 'legacy',
      legacyUrl: 'http://localhost:4001/holerite?embedded=true',
      requiredRoles: ['*'],
    },
  ],
};

const featureFlags = {
  'jornada-ponto': true,
  'jornada-beneficios': true,
  'busca-global': true,
};

const notifications = [
  {
    id: 'n1',
    title: 'Férias aprovadas',
    message: 'Suas férias de 12/01 a 26/01 foram aprovadas.',
    createdAt: new Date(Date.now() - 3600e3).toISOString(),
    read: false,
    source: 'jornada-ferias',
  },
  {
    id: 'n2',
    title: 'Holerite disponível',
    message: 'O demonstrativo de setembro já está disponível.',
    createdAt: new Date(Date.now() - 86400e3).toISOString(),
    read: false,
    source: 'jornada-holerite',
  },
];

const beneficios = [
  { id: 'b1', nome: 'Plano de Saúde', descricao: 'Cobertura nacional, coparticipação 20%.', status: 'ATIVO' },
  { id: 'b2', nome: 'Vale-Alimentação', descricao: 'R$ 35/dia útil.', status: 'ATIVO' },
  { id: 'b3', nome: 'Previdência Privada', descricao: 'Match de até 5% do salário.', status: 'DISPONIVEL' },
  { id: 'b4', nome: 'Auxílio Home Office', descricao: 'R$ 120/mês.', status: 'PENDENTE' },
];

const pontoDoDia = [];

app.get('/api/me', (_req, res) => res.json(user));

app.get('/api/manifest', (_req, res) =>
  res.json({ ...manifest, generatedAt: new Date().toISOString() }),
);

app.get('/api/feature-flags', (_req, res) => res.json(featureFlags));

app.get('/api/notifications', (_req, res) => res.json(notifications));

app.get('/api/beneficios', (_req, res) => res.json(beneficios));

app.get('/api/ponto/hoje', (_req, res) => res.json(pontoDoDia));

app.post('/api/ponto/registrar', (_req, res) => {
  const registro = {
    id: `p-${Date.now()}`,
    timestamp: new Date().toISOString(),
    tipo: pontoDoDia.length % 2 === 0 ? 'ENTRADA' : 'SAIDA',
  };
  pontoDoDia.push(registro);
  res.status(201).json(registro);
});

app.get('/api/search', (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase();
  const results = manifest.journeys
    .filter(
      (j) =>
        j.name.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.category.toLowerCase().includes(q),
    )
    .map((j) => ({
      id: j.id,
      title: j.name,
      kind: 'jornada',
      route: j.route,
    }));
  res.json(results);
});

app.post('/api/telemetry', (req, res) => {
  console.log('[bff:telemetry]', JSON.stringify(req.body));
  res.status(204).end();
});

app.listen(PORT, () => console.log(`[bff] http://localhost:${PORT}`));
