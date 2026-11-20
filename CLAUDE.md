# Miller Minute: instruções para o Claude

App de quiz pessoal do João para aprender inglês (nível básico). PWA em React + Vite +
TypeScript strict, sem backend. Plano e métodos em `docs/PLANO.md`.

- Conversa, código, commits e documentação em português do Brasil. Commits convencionais
  (`feat:`, `fix:`, `docs:`, `test:`, `chore:`). Staging por caminhos explícitos.
- Trabalhe em branch própria e entregue por pull request; nunca faça merge nem publique (deploy)
  sem o João pedir.
- Validação: `npm ci`, `npm run check`, `npm test`, `npm run build`. Nunca declarar testes
  aprovados sem executar. Testes automáticos não substituem o João testando no celular.
- Conteúdo: nunca mudar o texto em inglês de um item já publicado (forma o id do progresso);
  traduções e exemplos podem ser corrigidos. Novos pacotes entram no fim de `src/data/packs.ts`.
- Lógica de aprendizado fica em `src/lib/` como funções puras com testes.
- Preservar acessibilidade (foco visível, teclado, rótulos) e `prefers-reduced-motion`.
- Evitar dependências novas; se necessárias, explicar no PR.
