import type { Situation } from '../lib/chat';

/**
 * Cenas de filme: diálogos ORIGINAIS no clima de gêneros de cinema (nenhuma fala copiada de
 * filmes reais), cheios de expressões que aparecem muito em filmes e séries.
 * Mesmo formato das situações reais. Ids precisam ser únicos também em relação a situations.ts.
 */
export const scenes: Situation[] = [
  {
    id: 'cena-orion',
    title: 'Missão Órion',
    subtitle: 'Ficção científica: você é o piloto e o motor está falhando',
    emoji: '🚀',
    partner: { name: 'Nave Órion', role: 'canal de rádio da missão' },
    unlockAt: 0,
    steps: [
      { kind: 'scene', text: 'Deep space. Your ship, Orion, is far from Earth.', pt: 'Espaço profundo. Sua nave, a Órion, está longe da Terra.' },
      { kind: 'them', who: 'Base Control', text: 'Orion, this is Base. Do you copy?', pt: 'Órion, aqui é a Base. Está na escuta?' },
      {
        kind: 'choose',
        goal: 'Responda que está ouvindo bem',
        options: [
          { text: 'Copy that, Base. Loud and clear.', pt: 'Entendido, Base. Alto e claro.', ok: true },
          { text: 'I am hearing you, Base.', pt: '(estranho no rádio)', ok: false, why: 'No rádio, o natural é "Copy that" (entendido) ou "Loud and clear" (alto e claro). "I am hearing you" soa estranho.' },
          { text: 'Yes, I copy your homework.', pt: 'Sim, eu copio sua lição de casa.', ok: false, why: 'No rádio, "copy" significa "receber a mensagem", não copiar alguma coisa.' },
        ],
      },
      { kind: 'them', who: 'Ava (copiloto)', text: 'Captain, we have a problem. The engine is losing power.', pt: 'Capitão, temos um problema. O motor está perdendo potência.' },
      { kind: 'build', goal: 'Pergunte quanto tempo vocês têm', text: 'How much time do we have?', pt: 'Quanto tempo nós temos?', extra: ['many', 'is'] },
      { kind: 'them', who: 'Ava (copiloto)', text: 'About ten minutes. Maybe less.', pt: 'Uns dez minutos. Talvez menos.' },
      {
        kind: 'choose',
        goal: 'Peça para ela manter a calma',
        options: [
          { text: 'Stay calm. We can fix this.', pt: 'Mantenha a calma. Nós conseguimos consertar isso.', ok: true },
          { text: 'Be quiet!', pt: 'Fique quieta!', ok: false, why: '"Be quiet" é "fique quieta / calada", não "mantenha a calma". Numa emergência, diga "Stay calm".' },
          { text: 'Calm yourself down of this!', pt: '(frase quebrada)', ok: false, why: 'Frase quebrada. O natural é "Stay calm" ou "Calm down".' },
        ],
      },
      { kind: 'them', who: 'Base Control', text: "Orion, you need to turn back now. That's an order.", pt: 'Órion, vocês precisam voltar agora. É uma ordem.' },
      {
        kind: 'choose',
        goal: 'Diga que entendeu e que estão voltando',
        options: [
          { text: "Roger that. We're heading back.", pt: 'Entendido. Estamos voltando.', ok: true },
          { text: 'Okay, Base. We are coming back home now.', pt: 'Ok, Base. Estamos voltando para casa agora.', ok: true },
          { text: 'Roger? Who is Roger?', pt: 'Roger? Quem é Roger?', ok: false, why: 'Piada à parte: no rádio, "Roger" ou "Roger that" significa "entendido". Aqui não é um nome!' },
        ],
      },
      { kind: 'scene', text: 'The engine makes a loud noise... and then it starts working again.', pt: 'O motor faz um barulho alto... e volta a funcionar.' },
      { kind: 'them', who: 'Ava (copiloto)', text: "Engine is back online! We're going home!", pt: 'O motor voltou! Vamos para casa!' },
      { kind: 'build', goal: 'Comemore: "Missão cumprida!"', text: 'Mission accomplished!', pt: 'Missão cumprida!', extra: ['complete', 'is'] },
      { kind: 'them', who: 'Base Control', text: 'Good job, Orion. Welcome home.', pt: 'Bom trabalho, Órion. Bem-vindos de volta.' },
    ],
  },
  {
    id: 'cena-chave',
    title: 'Quem pegou a chave?',
    subtitle: 'Policial: você é o detetive e interroga um suspeito',
    emoji: '🕵️',
    partner: { name: 'Mr. Grey', role: 'suspeito' },
    unlockAt: 50,
    steps: [
      { kind: 'scene', text: 'Police station. Night. The key to the museum is missing.', pt: 'Delegacia. Noite. A chave do museu sumiu.' },
      { kind: 'them', text: "I already told you. I don't know anything.", pt: 'Eu já disse. Eu não sei de nada.' },
      {
        kind: 'choose',
        goal: 'Peça para ele se sentar',
        options: [
          { text: 'Please, sit down.', pt: 'Por favor, sente-se.', ok: true },
          { text: 'Sit up.', pt: 'Endireite-se.', ok: false, why: '"Sit up" é endireitar a postura. Para sentar, é "sit down".' },
          { text: 'Sit you down.', pt: '(ordem errada)', ok: false, why: 'Ordem errada. O certo é "Sit down, please" ou "Please, sit down".' },
        ],
      },
      { kind: 'them', text: 'Fine. What do you want?', pt: 'Tá bom. O que você quer?' },
      { kind: 'build', goal: 'Pergunte onde ele estava ontem à noite', text: 'Where were you last night?', pt: 'Onde você estava ontem à noite?', extra: ['was', 'yesterday'] },
      { kind: 'them', text: 'I was at home. Alone. Watching TV.', pt: 'Eu estava em casa. Sozinho. Vendo TV.' },
      {
        kind: 'choose',
        goal: 'Diga que isso não é verdade',
        options: [
          { text: "That's not true.", pt: 'Isso não é verdade.', ok: true },
          { text: "That's a lie.", pt: 'Isso é mentira.', ok: true },
          { text: "That's not truth.", pt: '(quase)', ok: false, why: 'Depois de "that\'s", use o adjetivo "true": "That\'s not true". "Truth" é o substantivo (a verdade).' },
        ],
      },
      { kind: 'them', text: "Okay, okay! I was at the museum. But I didn't take the key!", pt: 'Tá, tá! Eu estava no museu. Mas eu não peguei a chave!' },
      {
        kind: 'choose',
        goal: 'Pergunte quem pegou, então',
        options: [
          { text: 'Then who took it?', pt: 'Então quem pegou?', ok: true },
          { text: 'So who did it?', pt: 'Então quem fez isso?', ok: true },
          { text: 'Who taked it?', pt: '(verbo errado)', ok: false, why: '"Take" é irregular: o passado é "took", e não "taked".' },
        ],
      },
      { kind: 'them', text: 'The guard! He has the key. I saw him!', pt: 'O guarda! Ele está com a chave. Eu vi!' },
      { kind: 'build', goal: 'Diga: "Vamos falar com o guarda."', text: "Let's talk to the guard.", pt: 'Vamos falar com o guarda.', extra: ['speak', 'at'] },
      { kind: 'them', text: 'Can I go home now?', pt: 'Posso ir para casa agora?' },
      {
        kind: 'choose',
        goal: 'Diga que ainda não e que ele fica aqui',
        options: [
          { text: 'Not yet. Stay here.', pt: 'Ainda não. Fique aqui.', ok: true },
          { text: 'Not already. Stay here.', pt: '(quase)', ok: false, why: '"Ainda não" é "not yet". "Already" é "já".' },
          { text: 'No more. Stay here.', pt: 'Não mais. Fique aqui.', ok: false, why: '"No more" é "não mais / chega". Para "ainda não", use "not yet".' },
        ],
      },
      { kind: 'scene', text: 'You close the door. Case almost solved.', pt: 'Você fecha a porta. Caso quase resolvido.' },
    ],
  },
  {
    id: 'cena-encontro',
    title: 'O encontro desastrado',
    subtitle: 'Comédia romântica: um jantar que começa mal',
    emoji: '💘',
    partner: { name: 'Lily', role: 'seu encontro' },
    unlockAt: 100,
    steps: [
      { kind: 'scene', text: 'A nice restaurant. You are waiting at the table.', pt: 'Um restaurante bonito. Você está esperando na mesa.' },
      { kind: 'them', who: 'Lily', text: "Hi! Sorry I'm late. The traffic was crazy!", pt: 'Oi! Desculpa o atraso. O trânsito estava uma loucura!' },
      {
        kind: 'choose',
        goal: 'Diga que não tem problema e elogie',
        options: [
          { text: 'No worries! You look great.', pt: 'Sem problema! Você está ótima.', ok: true },
          { text: "Don't worry, you are late.", pt: 'Não se preocupe, você está atrasada.', ok: false, why: 'Isso reforça o atraso, nada romântico! "No worries" já diz "sem problema".' },
          { text: "It's no problem of you.", pt: '(frase quebrada)', ok: false, why: 'Frase quebrada. "No problem" ou "No worries" bastam.' },
        ],
      },
      { kind: 'them', who: 'Waiter', text: 'Here are your drinks.', pt: 'Aqui estão as bebidas.' },
      { kind: 'scene', text: "Oops! You knock over the juice. It goes all over Lily's dress.", pt: 'Ops! Você derruba o suco. Ele cai todo no vestido da Lily.' },
      {
        kind: 'choose',
        goal: 'Peça desculpas, morrendo de vergonha',
        options: [
          { text: "I'm so sorry! I'm so clumsy.", pt: 'Me desculpa! Sou muito desastrado.', ok: true },
          { text: "I'm so embarrassing!", pt: '(quase)', ok: false, why: 'Cuidado: "embarrassing" descreve a situação (constrangedora). Você está "embarrassed". E aqui o principal é pedir desculpas: "I\'m so sorry!".' },
          { text: 'Excuse me!', pt: 'Com licença!', ok: false, why: '"Excuse me" é "com licença". Depois de um acidente, diga "I\'m so sorry!".' },
        ],
      },
      { kind: 'them', who: 'Lily', text: "Ha ha! It's okay. It's just juice.", pt: 'Haha! Tudo bem. É só suco.' },
      { kind: 'build', goal: 'Ofereça pagar a lavanderia', text: 'Let me pay for the dry cleaning.', pt: 'Deixa eu pagar a lavanderia.', extra: ['to', 'wash'] },
      { kind: 'them', who: 'Lily', text: "Don't be silly! So... tell me something about you.", pt: 'Deixa disso! Então... me conta alguma coisa sobre você.' },
      {
        kind: 'choose',
        goal: 'Conte que você ama filmes',
        options: [
          { text: 'I love movies. I watch one every weekend.', pt: 'Eu amo filmes. Assisto um todo fim de semana.', ok: true },
          { text: 'I love films of action.', pt: '(ordem errada)', ok: false, why: 'Em inglês, o tipo vem antes: "action movies" (filmes de ação).' },
          { text: 'I am loving movies since child.', pt: '(frase quebrada)', ok: false, why: 'Para gostos, use o presente simples: "I love movies". E "desde criança" é "since I was a kid".' },
        ],
      },
      { kind: 'them', who: 'Lily', text: 'Me too! Do you want to see a movie after dinner?', pt: 'Eu também! Quer ver um filme depois do jantar?' },
      {
        kind: 'choose',
        goal: 'Aceite, animado',
        options: [
          { text: "I'd love to!", pt: 'Eu adoraria!', ok: true },
          { text: 'Sounds great!', pt: 'Parece ótimo!', ok: true },
          { text: 'I would like to love it.', pt: '(estranho)', ok: false, why: 'Soa estranho. Para aceitar um convite com animação: "I\'d love to!".' },
        ],
      },
      { kind: 'them', who: 'Lily', text: "Great! But this time, I'm carrying the drinks.", pt: 'Ótimo! Mas desta vez, eu levo as bebidas.' },
    ],
  },
  {
    id: 'cena-escuro',
    title: 'A casa no escuro',
    subtitle: 'Terror: a luz acaba e alguém bate na porta',
    emoji: '🕯️',
    partner: { name: 'Jake', role: 'seu amigo' },
    unlockAt: 150,
    steps: [
      { kind: 'scene', text: 'An old house. A stormy night. You and Jake are watching a horror movie.', pt: 'Uma casa antiga. Noite de tempestade. Você e o Jake estão vendo um filme de terror.' },
      { kind: 'them', who: 'Jake', text: 'Did you hear that?', pt: 'Você ouviu isso?' },
      {
        kind: 'choose',
        goal: 'Diga que não ouviu nada',
        options: [
          { text: "No, I didn't hear anything.", pt: 'Não, eu não ouvi nada.', ok: true },
          { text: "No, I didn't hear nothing.", pt: '(dupla negação)', ok: false, why: 'O inglês padrão não usa dupla negação: "didn\'t hear anything" (ou "heard nothing").' },
          { text: "No, I didn't listen.", pt: 'Não, eu não escutei (com atenção).', ok: false, why: '"Listen" é escutar com atenção. Perceber um som é "hear": "I didn\'t hear anything".' },
        ],
      },
      { kind: 'scene', text: 'Suddenly, the lights go out. Everything is dark.', pt: 'De repente, as luzes se apagam. Tudo fica escuro.' },
      { kind: 'build', goal: 'Peça para ele ligar a lanterna', text: 'Turn on the flashlight!', pt: 'Liga a lanterna!', extra: ['open', 'lamp'] },
      { kind: 'them', who: 'Jake', text: "It's not working! Wait... someone is at the door.", pt: 'Não está funcionando! Espera... tem alguém na porta.' },
      { kind: 'scene', text: 'Knock. Knock. Knock.', pt: 'Toc. Toc. Toc.' },
      {
        kind: 'choose',
        goal: 'Diga para ele não abrir a porta',
        options: [
          { text: "Don't open the door!", pt: 'Não abre a porta!', ok: true },
          { text: 'No open the door!', pt: '(frase quebrada)', ok: false, why: 'Para proibir, use "Don\'t" + verbo: "Don\'t open the door!".' },
          { text: "Don't close the door!", pt: 'Não fecha a porta!', ok: false, why: 'É o contrário! "Open" é abrir; "close" é fechar.' },
        ],
      },
      { kind: 'them', who: 'Voz lá fora', text: 'Pizza delivery! Hello? Is anybody home?', pt: 'Entrega de pizza! Alô? Tem alguém em casa?' },
      {
        kind: 'choose',
        goal: 'Pergunte se ele pediu pizza',
        options: [
          { text: 'Wait... did you order pizza?', pt: 'Espera... você pediu pizza?', ok: true },
          { text: 'You ordered pizza?', pt: 'Você pediu pizza?', ok: true },
          { text: 'Did you ask a pizza?', pt: '(verbo errado)', ok: false, why: 'Pedir comida é "order". "Ask" é perguntar, ou pedir algo a alguém ("ask for").' },
        ],
      },
      { kind: 'them', who: 'Jake', text: 'Oh yeah! I forgot! Ha ha.', pt: 'Ah, é! Eu esqueci! Haha.' },
      { kind: 'build', goal: 'Diga: "Você quase me matou de susto!"', text: 'You scared me to death!', pt: 'Você quase me matou de susto!', extra: ['killed', 'of'] },
      { kind: 'scene', text: 'The lights come back on.', pt: 'As luzes voltam.' },
      { kind: 'them', who: 'Jake', text: "Sorry! Let's eat. I'm starving!", pt: 'Foi mal! Vamos comer. Estou morrendo de fome!' },
    ],
  },
];
