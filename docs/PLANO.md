# Plano do app

## Métodos de aprendizado (pesquisa e decisão)

| Método | Evidência | Onde entra |
|---|---|---|
| Repetição espaçada (SRS) | Forte, a mais bem sustentada para vocabulário | Motor do app: decide o que volta e quando |
| Prática de recuperação (active recall) | Forte | O formato de quiz; digitar fixa mais que escolher |
| Sistema Leitner | Base do SRS, simples | **Fase 1** (atual) |
| FSRS (algoritmo do Anki) | Prevê melhor que o SM-2 no benchmark do projeto | Fase 2 (`ts-fsrs`) |
| Input compreensível (Krashen) | Aceito, mas debatido; melhor junto com produção | Fase 3: frases e textos curtos |
| Lista de frequência | Consenso prático | Ordem dos pacotes |
| Shadowing | Pouca evidência formal; popular para pronúncia | Fase 4, opcional |
| Intercalação (interleaving) | Forte em outras áreas, pouco testada em idiomas | Mistura de tipos de pergunta na sessão |

## Como funciona hoje (Fase 1)

- Cada item fica numa caixa de 0 a 6. Acertou: sobe e volta depois de 1, 2, 4, 7, 15, 30 dias
  (contados a partir do início do dia). Errou: desce uma caixa e fica pendente na hora.
- O tipo de pergunta acompanha a caixa: 0–1 inglês → português (múltipla escolha);
  2–3 português → inglês (múltipla escolha); 4+ português → inglês digitando.
- Item novo: é apresentado (palavra, tradução, áudio, exemplo), perguntado 2 passos depois
  e repetido no fim da sessão, na direção inversa, para fixar.
- Errou na sessão: o item volta 3 passos depois (até 3 vezes), sem mexer de novo na caixa.
- Até 6 novos por sessão e 12 por dia. Até 20 revisões por sessão.
- Caixa 4+ (intervalo de 7+ dias) = "dominado". Com 80% do pacote dominado, o próximo libera.
- Digitação: ignora maiúsculas, acentos, pontuação e apóstrofo; 1 letra errada em palavras
  de 5+ letras conta como acerto, mostrando a grafia certa.
- Progresso salvo só no aparelho (localStorage). Sem backend e sem conta.

## Próximas fases

1. **Fase 2 — FSRS**: trocar o Leitner pelo FSRS, com botões "difícil / bom / fácil".
2. **Fase 3 — contexto**: completar lacunas em frases, ouvir e escolher (listening), pacote 2.
3. **Fase 4 — uso**: ditado, shadowing e leituras curtas.
4. **Futuro**: geração de frases por IA (exige servidor e chave de API) e sincronização entre aparelhos.

## Como entra conteúdo novo

Os pacotes ficam em `src/data/`. Para criar o próximo: novo arquivo `packN.ts` no mesmo formato,
adicionado ao fim da lista em `src/data/packs.ts`. O texto em inglês forma o id do progresso:
corrigir a tradução é seguro, mudar o inglês reinicia o progresso daquele item.
