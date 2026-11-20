/**
 * Histórias curtas (input compreensível): frases simples com áudio e tradução,
 * seguidas de perguntas de compreensão. Liberam conforme as palavras vistas.
 */
export interface StoryQuestion {
  q: string;
  options: { text: string; ok: boolean }[];
  /** Explicação mostrada depois da resposta, citando a frase da história. */
  why: string;
}

export interface Story {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  unlockAt: number;
  sentences: { en: string; pt: string }[];
  questions: StoryQuestion[];
}

export const stories: Story[] = [
  {
    id: 'manha-tom',
    title: "Tom's morning",
    emoji: '☀️',
    subtitle: 'A manhã corrida do Tom',
    unlockAt: 0,
    sentences: [
      { en: 'Tom wakes up at seven every day.', pt: 'O Tom acorda às sete todo dia.' },
      { en: 'Today he is late.', pt: 'Hoje ele está atrasado.' },
      { en: 'He drinks a coffee very fast.', pt: 'Ele bebe um café bem rápido.' },
      { en: 'He cannot find his keys.', pt: 'Ele não consegue achar as chaves.' },
      { en: 'His cat is sleeping on the keys!', pt: 'O gato dele está dormindo em cima das chaves!' },
      { en: 'Tom laughs and takes the keys.', pt: 'O Tom ri e pega as chaves.' },
      { en: 'He runs to the bus.', pt: 'Ele corre para o ônibus.' },
      { en: 'The bus is late too. Tom is happy.', pt: 'O ônibus também está atrasado. O Tom fica feliz.' },
    ],
    questions: [
      {
        q: 'Que horas o Tom acorda normalmente?',
        options: [
          { text: 'Às sete', ok: true },
          { text: 'Às oito', ok: false },
          { text: 'Às seis', ok: false },
        ],
        why: '"Tom wakes up at seven every day": seven = sete.',
      },
      {
        q: 'Onde estavam as chaves?',
        options: [
          { text: 'Embaixo do gato', ok: true },
          { text: 'Na mesa', ok: false },
          { text: 'No ônibus', ok: false },
        ],
        why: '"His cat is sleeping on the keys": o gato estava dormindo em cima das chaves.',
      },
      {
        q: 'Por que o Tom fica feliz no final?',
        options: [
          { text: 'O ônibus também estava atrasado', ok: true },
          { text: 'Ele achou dinheiro', ok: false },
          { text: 'Ele não precisou trabalhar', ok: false },
        ],
        why: '"The bus is late too": o ônibus também estava atrasado, então ele não perdeu.',
      },
    ],
  },
  {
    id: 'cafe-ana',
    title: "Ana's coffee shop",
    emoji: '☕',
    subtitle: 'O pequeno café da Ana',
    unlockAt: 30,
    sentences: [
      { en: 'Ana has a small coffee shop.', pt: 'A Ana tem um pequeno café.' },
      { en: 'It is near the school.', pt: 'Ele fica perto da escola.' },
      { en: 'Every morning, many students come for coffee and bread.', pt: 'Toda manhã, muitos estudantes vêm tomar café e comer pão.' },
      { en: 'Ana knows the name of every student.', pt: 'A Ana sabe o nome de cada estudante.' },
      { en: 'One day, a new student comes in.', pt: 'Um dia, um estudante novo entra.' },
      { en: 'He does not speak English well.', pt: 'Ele não fala inglês bem.' },
      { en: 'Ana speaks slowly and helps him.', pt: 'A Ana fala devagar e ajuda ele.' },
      { en: 'Now he comes every day, and his English is better.', pt: 'Agora ele vem todo dia, e o inglês dele está melhor.' },
    ],
    questions: [
      {
        q: 'Onde fica o café da Ana?',
        options: [
          { text: 'Perto da escola', ok: true },
          { text: 'Perto do hospital', ok: false },
          { text: 'Longe da cidade', ok: false },
        ],
        why: '"It is near the school": near = perto de.',
      },
      {
        q: 'O que a Ana faz para ajudar o estudante novo?',
        options: [
          { text: 'Fala devagar', ok: true },
          { text: 'Dá café de graça', ok: false },
          { text: 'Fala em português', ok: false },
        ],
        why: '"Ana speaks slowly and helps him": slowly = devagar.',
      },
      {
        q: 'O que mudou com o estudante novo?',
        options: [
          { text: 'O inglês dele melhorou', ok: true },
          { text: 'Ele mudou de escola', ok: false },
          { text: 'Ele abriu um café', ok: false },
        ],
        why: '"His English is better": better = melhor.',
      },
    ],
  },
  {
    id: 'londres',
    title: 'A trip to London',
    emoji: '🇬🇧',
    subtitle: 'A primeira viagem da Maria',
    unlockAt: 60,
    sentences: [
      { en: 'Maria is from Brazil.', pt: 'A Maria é do Brasil.' },
      { en: 'This is her first trip to London.', pt: 'Esta é a primeira viagem dela para Londres.' },
      { en: 'The weather is cold and it rains a lot.', pt: 'O tempo está frio e chove muito.' },
      { en: 'She buys an umbrella in a small store.', pt: 'Ela compra um guarda-chuva numa lojinha.' },
      { en: 'She asks a man: "Where is the museum?"', pt: 'Ela pergunta para um homem: "Onde fica o museu?"' },
      { en: 'The man says: "Go straight and turn right."', pt: 'O homem diz: "Siga reto e vire à direita."' },
      { en: 'The museum is free and beautiful.', pt: 'O museu é gratuito e lindo.' },
      { en: 'Maria thinks: "I want to come back next year."', pt: 'A Maria pensa: "Quero voltar no ano que vem."' },
    ],
    questions: [
      {
        q: 'Como está o tempo em Londres?',
        options: [
          { text: 'Frio e chuvoso', ok: true },
          { text: 'Quente e ensolarado', ok: false },
          { text: 'Com neve', ok: false },
        ],
        why: '"The weather is cold and it rains a lot": cold = frio, rains = chove.',
      },
      {
        q: 'Para chegar ao museu, Maria deve...',
        options: [
          { text: 'Seguir reto e virar à direita', ok: true },
          { text: 'Virar à esquerda', ok: false },
          { text: 'Pegar um ônibus', ok: false },
        ],
        why: '"Go straight and turn right": right = direita.',
      },
      {
        q: 'Quanto custa o museu?',
        options: [
          { text: 'É de graça', ok: true },
          { text: 'É caro', ok: false },
          { text: 'A história não diz', ok: false },
        ],
        why: '"The museum is free": free aqui significa grátis.',
      },
    ],
  },
  {
    id: 'cachorro',
    title: 'The lost dog',
    emoji: '🐕',
    subtitle: 'Um cachorro perdido na rua',
    unlockAt: 100,
    sentences: [
      { en: 'On Saturday, Leo finds a small dog in the street.', pt: 'No sábado, o Leo encontra um cachorrinho na rua.' },
      { en: 'The dog is dirty and hungry.', pt: 'O cachorro está sujo e com fome.' },
      { en: 'Leo gives him water and food.', pt: 'O Leo dá água e comida para ele.' },
      { en: 'The dog has a name on his collar: "Max".', pt: 'O cachorro tem um nome na coleira: "Max".' },
      { en: 'There is also a phone number.', pt: 'Também tem um número de telefone.' },
      { en: 'Leo calls the number.', pt: 'O Leo liga para o número.' },
      { en: 'A girl answers. She is crying because she lost her dog.', pt: 'Uma menina atende. Ela está chorando porque perdeu o cachorro.' },
      { en: 'One hour later, Max is home again.', pt: 'Uma hora depois, o Max está em casa de novo.' },
    ],
    questions: [
      {
        q: 'Como o cachorro estava quando o Leo o encontrou?',
        options: [
          { text: 'Sujo e com fome', ok: true },
          { text: 'Limpo e feliz', ok: false },
          { text: 'Dormindo', ok: false },
        ],
        why: '"The dog is dirty and hungry": dirty = sujo, hungry = com fome.',
      },
      {
        q: 'Como o Leo encontrou a dona?',
        options: [
          { text: 'Ligou para o número na coleira', ok: true },
          { text: 'Perguntou aos vizinhos', ok: false },
          { text: 'Foi à polícia', ok: false },
        ],
        why: '"There is also a phone number. Leo calls the number."',
      },
      {
        q: 'Por que a menina estava chorando?',
        options: [
          { text: 'Ela tinha perdido o cachorro', ok: true },
          { text: 'Ela estava com fome', ok: false },
          { text: 'Ela perdeu o celular', ok: false },
        ],
        why: '"She is crying because she lost her dog": lost = perdeu.',
      },
    ],
  },
  {
    id: 'trabalho',
    title: 'First day at work',
    emoji: '💼',
    subtitle: 'O primeiro dia num emprego novo',
    unlockAt: 150,
    sentences: [
      { en: 'Today is my first day at a new job.', pt: 'Hoje é o meu primeiro dia num emprego novo.' },
      { en: 'I arrive early, at eight thirty.', pt: 'Eu chego cedo, às oito e meia.' },
      { en: 'My boss, Mrs. Clark, shows me the office.', pt: 'Minha chefe, a Sra. Clark, me mostra o escritório.' },
      { en: 'My desk is next to the window.', pt: 'Minha mesa fica ao lado da janela.' },
      { en: 'At lunch, my new friends invite me to a restaurant.', pt: 'No almoço, meus novos amigos me convidam para um restaurante.' },
      { en: 'In the afternoon, I have a lot of questions.', pt: 'À tarde, eu tenho muitas perguntas.' },
      { en: 'Everyone is patient and helps me.', pt: 'Todo mundo é paciente e me ajuda.' },
      { en: 'I go home tired, but very happy.', pt: 'Eu vou para casa cansado, mas muito feliz.' },
    ],
    questions: [
      {
        q: 'A que horas a pessoa chega?',
        options: [
          { text: 'Às oito e meia', ok: true },
          { text: 'Às nove', ok: false },
          { text: 'Ao meio-dia', ok: false },
        ],
        why: '"I arrive early, at eight thirty": eight thirty = oito e meia.',
      },
      {
        q: 'Onde fica a mesa?',
        options: [
          { text: 'Ao lado da janela', ok: true },
          { text: 'Perto da porta', ok: false },
          { text: 'Na cozinha', ok: false },
        ],
        why: '"My desk is next to the window": next to = ao lado de.',
      },
      {
        q: 'Como a pessoa se sente no fim do dia?',
        options: [
          { text: 'Cansada, mas muito feliz', ok: true },
          { text: 'Triste e cansada', ok: false },
          { text: 'Com raiva', ok: false },
        ],
        why: '"I go home tired, but very happy".',
      },
    ],
  },
  {
    id: 'estrelas',
    title: 'A night under the stars',
    emoji: '🌌',
    subtitle: 'Uma noite olhando o céu',
    unlockAt: 200,
    sentences: [
      { en: 'On a cold night, Sofia and her father go to the mountain.', pt: 'Numa noite fria, a Sofia e o pai vão para a montanha.' },
      { en: 'There are no city lights there.', pt: 'Lá não tem luzes da cidade.' },
      { en: 'They can see thousands of stars.', pt: 'Eles conseguem ver milhares de estrelas.' },
      { en: '"Look, Dad! A shooting star!" says Sofia.', pt: '"Olha, pai! Uma estrela cadente!", diz a Sofia.' },
      { en: 'Her father tells her about planets and black holes.', pt: 'O pai conta para ela sobre planetas e buracos negros.' },
      { en: '"Time is different near a black hole," he says.', pt: '"O tempo é diferente perto de um buraco negro", ele diz.' },
      { en: 'Sofia wants to be an astronaut one day.', pt: 'A Sofia quer ser astronauta um dia.' },
      { en: 'Her father smiles: "Then study hard. The stars can wait."', pt: 'O pai sorri: "Então estude bastante. As estrelas podem esperar."' },
    ],
    questions: [
      {
        q: 'Por que dá para ver tantas estrelas na montanha?',
        options: [
          { text: 'Não há luzes da cidade', ok: true },
          { text: 'Eles usam um telescópio', ok: false },
          { text: 'É de manhã', ok: false },
        ],
        why: '"There are no city lights there": sem as luzes da cidade, o céu fica escuro.',
      },
      {
        q: 'O que a Sofia viu?',
        options: [
          { text: 'Uma estrela cadente', ok: true },
          { text: 'Um avião', ok: false },
          { text: 'A lua', ok: false },
        ],
        why: '"A shooting star!": shooting star = estrela cadente.',
      },
      {
        q: 'O que a Sofia quer ser?',
        options: [
          { text: 'Astronauta', ok: true },
          { text: 'Professora', ok: false },
          { text: 'Médica', ok: false },
        ],
        why: '"Sofia wants to be an astronaut one day".',
      },
    ],
  },
];
