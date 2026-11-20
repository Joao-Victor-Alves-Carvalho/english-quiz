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

**Microfone**: no Android (Chrome), o reconhecimento de voz usa o serviço do Google e precisa de
internet. Se o navegador não tiver reconhecimento de voz, as perguntas de falar não aparecem.

## Estrutura

- `src/data/` — pacotes de conteúdo (`pack1.ts`: 387 palavras e frases essenciais).
- `src/lib/` — lógica pura e testada: agendamento Leitner, montagem da sessão, alternativas,
  correção da resposta digitada, progresso.
- `src/screens/` — telas: Início, Sessão, Resultado, Palavras.
- `src/components/` — aurora de fundo, confete, ícones, botão de áudio.
