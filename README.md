# Miller Minute

Aplicativo de quiz para aprender inglês com repetição: no começo para decorar e, com o tempo,
com repetição espaçada e prática de recuperação. Funciona como app instalável (PWA) no Android
e no iPhone, offline, sem conta e sem servidor. O nome é uma homenagem ao filme Interestelar: no planeta de Miller, uma hora vale sete anos; aqui, poucos minutos por dia valem anos de inglês. O visual ainda é provisório.

**App publicado:** https://joao-victor-alves-carvalho.github.io/miller-minute/

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
3. Aba Actions → **Deploy** → Run workflow. O app fica em https://joao-victor-alves-carvalho.github.io/miller-minute/.
4. **Android (Chrome)**: abrir o endereço → menu ⋮ → **Instalar app**.
   **iPhone (Safari)**: abrir o endereço → Compartilhar → **Adicionar à Tela de Início**.

O progresso fica salvo no aparelho; atualizações do app chegam sozinhas e não apagam o progresso.

**Como atualizar**: abra o app com internet. Ele baixa a versão nova em segundo plano e recarrega
sozinho em alguns segundos (às vezes é preciso fechar e abrir de novo). A versão aparece no rodapé
da tela inicial.

**Notificações (12h e 21h)**: uma tarefa agendada do GitHub Actions
(`.github/workflows/notify.yml`) envia um lembrete por volta do meio-dia e das 21h (Brasília).
Configuração única:
1. No app instalado: Ajustes → Notificações → **Ativar notificações** → **Copiar código de inscrição**.
2. No GitHub: Settings → Secrets and variables → Actions → New repository secret:
   - `PUSH_SUBSCRIPTION`: o código copiado (para vários aparelhos, use uma lista JSON `[{...}, {...}]`);
   - `VAPID_PRIVATE_KEY`: a chave privada VAPID (a pública está em `src/lib/push.ts`).
3. Para testar: aba Actions → **Notificações** → Run workflow.

O GitHub pode atrasar tarefas agendadas em alguns minutos e pausa as agendadas de repositórios sem
atividade por 60 dias (basta reativar na aba Actions). No iPhone, só funciona com o app instalado
na Tela de Início (iOS 16.4+). As mensagens ficam em `src/lib/pushMessages.ts`.

**Microfone**: no Android (Chrome), o reconhecimento de voz usa o serviço do Google e precisa de
internet. Se o navegador não tiver reconhecimento de voz, as perguntas de falar não aparecem.

## Estrutura

- `src/data/` — pacotes de conteúdo (`pack1.ts`: 387 palavras e frases essenciais).
- `src/lib/` — lógica pura e testada: agendamento Leitner, montagem da sessão, alternativas,
  correção da resposta digitada, progresso.
- `src/screens/` — telas: Início, Sessão, Resultado, Palavras.
- `src/components/` — aurora de fundo, confete, ícones, botão de áudio.
