# Loop — English

Aplicativo de quiz para aprender inglês com repetição: no começo para decorar e, com o tempo,
com repetição espaçada e prática de recuperação. Funciona como app instalável (PWA) no Android
e no iPhone, offline, sem conta e sem servidor. O nome "Loop" e o visual são provisórios.

Plano, métodos e regras do agendamento: [docs/PLANO.md](docs/PLANO.md).

## Rodar no computador

Requer Node.js 22 ou superior.

```bash
npm ci
npm run dev        # abre em http://localhost:5173
npm run check      # TypeScript
npm test           # testes da lógica
npm run build      # gera dist/
```

## Instalar no celular

O app precisa estar publicado num endereço HTTPS. Pelo GitHub Pages:

1. No plano gratuito, o Pages exige repositório **público** (Settings → General → Change visibility).
2. Settings → Pages → Source: **GitHub Actions**.
3. Aba Actions → **Deploy** → Run workflow. O endereço aparece no fim da execução.
4. **Android (Chrome)**: abrir o endereço → menu ⋮ → **Instalar app**.
   **iPhone (Safari)**: abrir o endereço → Compartilhar → **Adicionar à Tela de Início**.

O progresso fica salvo no aparelho; atualizações do app chegam sozinhas e não apagam o progresso.

## Estrutura

- `src/data/` — pacotes de conteúdo (`pack1.ts`: 387 palavras e frases essenciais).
- `src/lib/` — lógica pura e testada: agendamento Leitner, montagem da sessão, alternativas,
  correção da resposta digitada, progresso.
- `src/screens/` — telas: Início, Sessão, Resultado, Palavras.
- `src/components/` — aurora de fundo, confete, ícones, botão de áudio.
