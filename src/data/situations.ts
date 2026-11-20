import type { Situation } from '../lib/chat';

/**
 * Situações reais em formato de conversa. Liberam conforme o número de palavras vistas.
 * Para criar outra: copie um bloco, mantenha o id único e coloque "why" em toda opção errada.
 */
export const situations: Situation[] = [
  {
    id: 'restaurante',
    title: 'Jantar no restaurante',
    subtitle: 'Do "boa noite" até pagar a conta',
    emoji: '🍝',
    partner: { name: 'Mike', role: 'garçom' },
    unlockAt: 0,
    steps: [
      { kind: 'them', text: "Good evening! Welcome to Luna's.", pt: "Boa noite! Bem-vindo ao Luna's." },
      {
        kind: 'choose',
        goal: 'Cumprimente o garçom',
        options: [
          { text: 'Good evening!', pt: 'Boa noite!', ok: true },
          { text: 'Good night!', pt: 'Boa noite! (despedida)', ok: false, why: '"Good night" é usado para se despedir ou na hora de dormir. Para cumprimentar à noite, use "Good evening".' },
          { text: 'Good morning!', pt: 'Bom dia!', ok: false, why: '"Good morning" é bom dia. À noite, o cumprimento é "Good evening".' },
        ],
      },
      { kind: 'them', text: 'How many people?', pt: 'Quantas pessoas?' },
      { kind: 'build', goal: 'Peça uma mesa para duas pessoas', text: 'A table for two, please.', pt: 'Uma mesa para dois, por favor.', extra: ['to', 'the'] },
      { kind: 'them', text: 'Right this way. Here is the menu.', pt: 'Por aqui. Aqui está o cardápio.' },
      {
        kind: 'choose',
        goal: 'Agradeça',
        options: [
          { text: 'Thank you!', pt: 'Obrigado!', ok: true },
          { text: "You're welcome!", pt: 'De nada!', ok: false, why: '"You\'re welcome" é "de nada", a resposta para quando alguém te agradece.' },
          { text: 'Excuse me!', pt: 'Com licença!', ok: false, why: '"Excuse me" é "com licença", para chamar a atenção ou pedir passagem.' },
        ],
      },
      { kind: 'them', text: 'What would you like to drink?', pt: 'O que você gostaria de beber?' },
      {
        kind: 'choose',
        goal: 'Peça uma água',
        options: [
          { text: "I'd like some water, please.", pt: 'Eu gostaria de uma água, por favor.', ok: true },
          { text: 'Water, please.', pt: 'Água, por favor.', ok: true },
          { text: 'I want drink water.', pt: '(frase quebrada)', ok: false, why: 'Falta o "to" (I want to drink) e, sem "please", soa seco. Num restaurante, "I\'d like..." ou "..., please" é o mais natural.' },
        ],
      },
      { kind: 'them', text: 'Are you ready to order?', pt: 'Está pronto para pedir?' },
      {
        kind: 'choose',
        goal: 'Diga que ainda não e peça mais um minuto',
        options: [
          { text: 'Not yet. One more minute, please.', pt: 'Ainda não. Mais um minuto, por favor.', ok: true },
          { text: 'Yes, I am ready.', pt: 'Sim, estou pronto.', ok: false, why: 'O objetivo era pedir mais tempo. "Not yet" significa "ainda não".' },
          { text: 'No. Go away.', pt: 'Não. Vá embora.', ok: false, why: '"Go away" é "vá embora", muito grosseiro. Peça tempo com "One more minute, please".' },
        ],
      },
      { kind: 'them', text: 'No problem. Take your time.', pt: 'Sem problema. Fique à vontade.' },
      { kind: 'them', text: 'So, what can I get you?', pt: 'Então, o que vai ser?' },
      { kind: 'build', goal: 'Peça o frango com arroz', text: "I'd like the chicken with rice, please.", pt: 'Eu gostaria do frango com arroz, por favor.', extra: ['want', 'of'] },
      { kind: 'them', text: 'Great choice! Anything else?', pt: 'Ótima escolha! Mais alguma coisa?' },
      {
        kind: 'choose',
        goal: 'Diga que é só isso',
        options: [
          { text: "No, that's all. Thanks.", pt: 'Não, é só isso. Obrigado.', ok: true },
          { text: "That's everything, thank you.", pt: 'É tudo, obrigado.', ok: true },
          { text: "No, I'm full.", pt: 'Não, estou satisfeito.', ok: false, why: '"I\'m full" é "estou cheio / satisfeito", algo que se diz depois de comer, não antes.' },
        ],
      },
      { kind: 'them', text: 'Here you go. Enjoy your meal!', pt: 'Aqui está. Bom apetite!' },
      { kind: 'them', text: 'How is everything?', pt: 'Está tudo bem com a comida?' },
      {
        kind: 'choose',
        goal: 'Diga que está delicioso',
        options: [
          { text: "It's delicious!", pt: 'Está delicioso!', ok: true },
          { text: "It's delicate!", pt: 'Está delicado!', ok: false, why: 'Falso amigo: "delicate" é delicado, frágil. Gostoso é "delicious" ou "tasty".' },
          { text: "It's expensive!", pt: 'Está caro!', ok: false, why: '"Expensive" é caro. Para elogiar a comida, use "delicious".' },
        ],
      },
      { kind: 'them', text: "Thank you! I'll tell the chef.", pt: 'Obrigado! Vou avisar o chef.' },
      {
        kind: 'choose',
        goal: 'Peça a conta',
        options: [
          { text: 'Can I have the check, please?', pt: 'Pode me trazer a conta, por favor?', ok: true },
          { text: 'Could I get the bill, please?', pt: 'Pode me trazer a conta, por favor? (inglês britânico)', ok: true },
          { text: 'Can I have the account, please?', pt: '(conta bancária)', ok: false, why: 'Armadilha clássica: "account" é conta de banco ou de usuário. A conta do restaurante é "check" (EUA) ou "bill" (Reino Unido).' },
        ],
      },
      { kind: 'them', text: 'Sure. Cash or card?', pt: 'Claro. Dinheiro ou cartão?' },
      { kind: 'build', goal: 'Diga que vai pagar com cartão', text: 'By card, please.', pt: 'No cartão, por favor.', extra: ['money', 'the'] },
      { kind: 'them', text: 'Thank you! Have a great night.', pt: 'Obrigado! Tenha uma ótima noite.' },
      {
        kind: 'choose',
        goal: 'Despeça-se',
        options: [
          { text: 'Thanks, you too! Good night!', pt: 'Obrigado, você também! Boa noite!', ok: true },
          { text: 'Good evening!', pt: 'Boa noite! (chegada)', ok: false, why: '"Good evening" é para chegar. Na saída, à noite, diga "Good night" ou "Have a good night".' },
          { text: 'Welcome!', pt: 'Bem-vindo!', ok: false, why: '"Welcome" é "bem-vindo", quem recebe é que diz. Para se despedir, "Good night!".' },
        ],
      },
    ],
  },
  {
    id: 'cafeteria',
    title: 'Pedido na cafeteria',
    subtitle: 'Café para viagem e um muffin',
    emoji: '☕',
    partner: { name: 'Sam', role: 'barista' },
    unlockAt: 20,
    steps: [
      { kind: 'them', text: 'Hi there! What can I get you?', pt: 'Oi! O que vai querer?' },
      {
        kind: 'choose',
        goal: 'Peça um café',
        options: [
          { text: 'Can I get a coffee, please?', pt: 'Pode me ver um café, por favor?', ok: true },
          { text: 'A coffee, please.', pt: 'Um café, por favor.', ok: true },
          { text: 'Give me coffee.', pt: 'Me dá café.', ok: false, why: 'Sem "please" e com "give me", soa como uma ordem. Peça com "Can I get...?" ou "..., please".' },
        ],
      },
      { kind: 'them', text: 'Sure! What size? Small, medium or large?', pt: 'Claro! Qual tamanho? Pequeno, médio ou grande?' },
      {
        kind: 'choose',
        goal: 'Peça o tamanho médio',
        options: [
          { text: 'Medium, please.', pt: 'Médio, por favor.', ok: true },
          { text: 'Middle, please.', pt: '(o meio)', ok: false, why: '"Middle" é o meio de alguma coisa (the middle of the street). Tamanho médio é "medium".' },
          { text: 'Large, please.', pt: 'Grande, por favor.', ok: false, why: '"Large" é grande. Médio é "medium".' },
        ],
      },
      { kind: 'them', text: 'For here or to go?', pt: 'Para tomar aqui ou para viagem?' },
      {
        kind: 'choose',
        goal: 'Diga que é para viagem',
        options: [
          { text: 'To go, please.', pt: 'Para viagem, por favor.', ok: true },
          { text: 'For travel, please.', pt: '(tradução literal)', ok: false, why: 'Tradução ao pé da letra de "para viagem". Em inglês é "to go" (EUA) ou "takeaway" (Reino Unido).' },
          { text: 'For here, please.', pt: 'Para tomar aqui, por favor.', ok: false, why: '"For here" é para consumir no local. Para levar, diga "to go".' },
        ],
      },
      { kind: 'them', text: 'Can I get a name for the order?', pt: 'Qual o nome para o pedido?' },
      { kind: 'build', goal: 'Diga o seu nome', text: 'My name is João.', pt: 'Meu nome é João.', extra: ['I', 'am'] },
      { kind: 'them', text: 'Thanks, João! Anything else? We have fresh muffins.', pt: 'Valeu, João! Mais alguma coisa? Temos muffins fresquinhos.' },
      {
        kind: 'choose',
        goal: 'Peça um muffin também',
        options: [
          { text: 'Yes, one muffin too, please.', pt: 'Sim, um muffin também, por favor.', ok: true },
          { text: 'Yes, I want a muffin too much.', pt: '(muffin demais)', ok: false, why: '"Too much" significa "demais", excesso. "Também" no fim da frase é só "too".' },
          { text: "No, that's all.", pt: 'Não, é só isso.', ok: false, why: 'O objetivo era aceitar o muffin. "That\'s all" é "é só isso".' },
        ],
      },
      { kind: 'them', text: "That's eight dollars.", pt: 'São oito dólares.' },
      { kind: 'build', goal: 'Pergunte se pode pagar com cartão', text: 'Can I pay by card?', pt: 'Posso pagar com cartão?', extra: ['money', 'to'] },
      { kind: 'them', text: "Of course. Here's your receipt.", pt: 'Claro. Aqui está seu recibo.' },
      {
        kind: 'choose',
        goal: 'Agradeça e deseje um bom dia',
        options: [
          { text: 'Thanks! Have a nice day.', pt: 'Obrigado! Tenha um bom dia.', ok: true },
          { text: 'Thanks! Good day for you.', pt: '(tradução literal)', ok: false, why: 'Tradução ao pé da letra de "bom dia pra você". O natural é "Have a nice day".' },
          { text: 'Thanks! Nice to meet you.', pt: 'Obrigado! Prazer em te conhecer.', ok: false, why: '"Nice to meet you" é para quando você conhece alguém, não para despedida de balcão.' },
        ],
      },
      { kind: 'them', text: 'You too! Enjoy your coffee.', pt: 'Você também! Aproveite o café.' },
    ],
  },
  {
    id: 'conhecer',
    title: 'Conhecendo alguém',
    subtitle: 'Bate-papo numa festa',
    emoji: '🎉',
    partner: { name: 'Emma', role: 'convidada da festa' },
    unlockAt: 40,
    steps: [
      { kind: 'them', text: "Hi! I'm Emma. What's your name?", pt: 'Oi! Eu sou a Emma. Qual é o seu nome?' },
      {
        kind: 'choose',
        goal: 'Apresente-se',
        options: [
          { text: "Hi Emma, I'm João. Nice to meet you!", pt: 'Oi Emma, eu sou o João. Prazer!', ok: true },
          { text: 'My name is João.', pt: 'Meu nome é João.', ok: true },
          { text: 'I have João.', pt: '(eu tenho João)', ok: false, why: '"Have" é ter. Para dizer o nome, use "I\'m João" ou "My name is João".' },
        ],
      },
      { kind: 'them', text: 'Nice to meet you, João! Where are you from?', pt: 'Prazer, João! De onde você é?' },
      { kind: 'build', goal: 'Diga que é do Brasil', text: "I'm from Brazil.", pt: 'Eu sou do Brasil.', extra: ['of', 'in'] },
      { kind: 'them', text: 'Oh, cool! I love Brazil. What do you do?', pt: 'Que legal! Eu amo o Brasil. O que você faz?' },
      {
        kind: 'choose',
        goal: 'Conte que você cria vídeos e imagens',
        options: [
          { text: 'I make videos and images.', pt: 'Eu crio vídeos e imagens.', ok: true },
          { text: 'I do videos and images.', pt: '(faço vídeos)', ok: false, why: 'Para criar ou produzir algo, o verbo é "make". "Do" é para ações e tarefas (do homework).' },
          { text: "I'm make videos.", pt: '(frase quebrada)', ok: false, why: 'Não se usa "I\'m" junto com outro verbo assim. O certo é "I make videos".' },
        ],
      },
      { kind: 'them', text: 'Wow, that is great! Do you speak English well?', pt: 'Uau, que ótimo! Você fala inglês bem?' },
      {
        kind: 'choose',
        goal: 'Diga que está aprendendo',
        options: [
          { text: "I'm learning. A little bit!", pt: 'Estou aprendendo. Um pouquinho!', ok: true },
          { text: "I'm learning English.", pt: 'Estou aprendendo inglês.', ok: true },
          { text: "I'm learned English.", pt: '(frase quebrada)', ok: false, why: '"Learned" é o passado. Para algo que está acontecendo agora, use "I\'m learning".' },
        ],
      },
      { kind: 'them', text: 'Your English is good! Do you like music?', pt: 'Seu inglês é bom! Você gosta de música?' },
      {
        kind: 'choose',
        goal: 'Agradeça e diga que ama música',
        options: [
          { text: 'Thank you! Yes, I love music.', pt: 'Obrigado! Sim, eu amo música.', ok: true },
          { text: 'Thank you! Yes, I like very much music.', pt: '(ordem errada)', ok: false, why: 'Em inglês, "very much" vai no fim: "I like music very much".' },
          { text: 'Thank you! Yes, I am like music.', pt: '(frase quebrada)', ok: false, why: 'Não use "am" com "like". É só "I like music".' },
        ],
      },
      { kind: 'them', text: "Me too! Let's talk later. I need to find my friend.", pt: 'Eu também! Vamos conversar depois. Preciso achar minha amiga.' },
      { kind: 'build', goal: 'Despeça-se até mais tarde', text: 'See you later, Emma!', pt: 'Até mais tarde, Emma!', extra: ['Look', 'after'] },
    ],
  },
  {
    id: 'direcoes',
    title: 'Pedindo direções',
    subtitle: 'Achar a estação de trem',
    emoji: '🗺️',
    partner: { name: 'Mr. Brown', role: 'pedestre' },
    unlockAt: 70,
    steps: [
      {
        kind: 'choose',
        goal: 'Chame a atenção da pessoa com educação',
        options: [
          { text: 'Excuse me!', pt: 'Com licença!', ok: true },
          { text: 'Hey, you!', pt: 'Ei, você!', ok: false, why: 'Com estranhos, "Hey, you!" soa rude. Use "Excuse me".' },
          { text: 'Permission!', pt: '(tradução literal)', ok: false, why: 'Tradução ao pé da letra de "com licença". Em inglês é "Excuse me".' },
        ],
      },
      { kind: 'them', text: 'Yes? Can I help you?', pt: 'Sim? Posso te ajudar?' },
      { kind: 'build', goal: 'Pergunte onde fica a estação de trem', text: 'Where is the train station?', pt: 'Onde fica a estação de trem?', extra: ['stay', 'are'] },
      { kind: 'them', text: 'Go straight and turn left at the bank.', pt: 'Siga reto e vire à esquerda no banco.' },
      {
        kind: 'choose',
        goal: 'Confirme: à esquerda no banco?',
        options: [
          { text: 'Left at the bank?', pt: 'À esquerda no banco?', ok: true },
          { text: 'Turn left at the bank, right?', pt: 'Viro à esquerda no banco, certo?', ok: true },
          { text: 'Right at the bank?', pt: 'À direita no banco?', ok: false, why: '"Right" é direita. Ele disse "left", esquerda.' },
        ],
      },
      { kind: 'them', text: "Yes, that's right. Then the station is on your right.", pt: 'Isso mesmo. Depois a estação fica à sua direita.' },
      {
        kind: 'choose',
        goal: 'Pergunte se é longe',
        options: [
          { text: 'Is it far?', pt: 'É longe?', ok: true },
          { text: 'Is it long?', pt: 'É comprido?', ok: false, why: '"Long" é comprido, longo. Para distância, use "far".' },
          { text: 'Is it big?', pt: 'É grande?', ok: false, why: '"Big" é grande. Para perguntar se é longe: "Is it far?".' },
        ],
      },
      { kind: 'them', text: "No, it's about five minutes on foot.", pt: 'Não, são uns cinco minutos a pé.' },
      {
        kind: 'choose',
        goal: 'Agradeça',
        options: [
          { text: 'Thank you so much!', pt: 'Muito obrigado!', ok: true },
          { text: 'Thanks a lot!', pt: 'Valeu mesmo!', ok: true },
          { text: 'Thanks for nothing!', pt: 'Obrigado por nada! (irônico)', ok: false, why: '"Thanks for nothing" é irônico: quer dizer que a pessoa não ajudou em nada.' },
        ],
      },
      { kind: 'them', text: "You're welcome. Have a good day!", pt: 'De nada. Tenha um bom dia!' },
    ],
  },
  {
    id: 'hotel',
    title: 'Check-in no hotel',
    subtitle: 'Reserva, quarto e Wi-Fi',
    emoji: '🛎️',
    partner: { name: 'Lisa', role: 'recepcionista' },
    unlockAt: 100,
    steps: [
      { kind: 'them', text: 'Good afternoon! Welcome to the Grand Hotel.', pt: 'Boa tarde! Bem-vindo ao Grand Hotel.' },
      {
        kind: 'choose',
        goal: 'Diga que você tem uma reserva',
        options: [
          { text: 'Hi! I have a reservation.', pt: 'Oi! Eu tenho uma reserva.', ok: true },
          { text: 'Hi! I have a reserve.', pt: '(reserva natural)', ok: false, why: '"Reserve" é reserva no sentido de estoque ou reserva natural. Reserva de hotel é "reservation".' },
          { text: 'Hi! I want a room now.', pt: 'Oi! Quero um quarto agora.', ok: false, why: 'O objetivo era avisar que já existe reserva: "I have a reservation".' },
        ],
      },
      { kind: 'them', text: 'Great. What name is it under?', pt: 'Ótimo. Em nome de quem está?' },
      { kind: 'build', goal: 'Diga que a reserva está no nome de João', text: 'The reservation is for João.', pt: 'A reserva é para o João.', extra: ['to', 'of'] },
      { kind: 'them', text: 'Here it is. Two nights. Can I see your passport?', pt: 'Aqui está. Duas noites. Posso ver seu passaporte?' },
      {
        kind: 'choose',
        goal: 'Entregue o passaporte',
        options: [
          { text: 'Sure, here you go.', pt: 'Claro, aqui está.', ok: true },
          { text: 'Yes, here it is.', pt: 'Sim, aqui está.', ok: true },
          { text: 'Yes, take it easy.', pt: 'Sim, vai com calma.', ok: false, why: '"Take it easy" é "relaxa / vai com calma". Para entregar algo: "Here you go".' },
        ],
      },
      { kind: 'them', text: 'Thank you. Your room is 304, on the third floor.', pt: 'Obrigada. Seu quarto é o 304, no terceiro andar.' },
      { kind: 'build', goal: 'Pergunte a que horas é o café da manhã', text: 'What time is breakfast?', pt: 'Que horas é o café da manhã?', extra: ['coffee', 'hour'] },
      { kind: 'them', text: 'Breakfast is from seven to ten.', pt: 'O café da manhã é das sete às dez.' },
      {
        kind: 'choose',
        goal: 'Pergunte a senha do Wi-Fi',
        options: [
          { text: "What's the Wi-Fi password?", pt: 'Qual é a senha do Wi-Fi?', ok: true },
          { text: "What's the Wi-Fi word?", pt: 'Qual é a palavra do Wi-Fi?', ok: false, why: '"Word" é palavra. Senha é "password".' },
          { text: "What's the Wi-Fi senha?", pt: '(misturou português)', ok: false, why: '"Senha" em inglês é "password".' },
        ],
      },
      { kind: 'them', text: "It's on your key card. Enjoy your stay!", pt: 'Está no seu cartão-chave. Aproveite a estadia!' },
      {
        kind: 'choose',
        goal: 'Agradeça',
        options: [
          { text: 'Thank you very much!', pt: 'Muito obrigado!', ok: true },
          { text: 'Enjoy you too!', pt: '(frase quebrada)', ok: false, why: 'Não faz sentido em inglês. Para responder, basta "Thank you!" ou "Thanks, you too!".' },
          { text: 'Thank you very many!', pt: '(frase quebrada)', ok: false, why: '"Many" é para coisas contáveis. O certo é "Thank you very much".' },
        ],
      },
    ],
  },
];
