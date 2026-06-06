import type { Animal } from '../types';

/**
 * Dataset embutido de animais de demonstração — mesclado ao pool do
 * Firestore na home do adotante (dedup por id, Firestore tem prioridade).
 * Permite que o KNN tenha o que ranquear mesmo sem dados cadastrados,
 * e mantém variedade quando uma ONG cadastra animais novos durante a demo.
 *
 * Fotos:
 *   - cat → loremflickr.com (real photos, varied seeds)
 *   - dog → placedog.net (real photos, id 1-199)
 */

const AGORA = new Date();
const ONG_PATINHAS = 'demo-ong-patinhas';
const ONG_AMIGOS = 'demo-ong-amigos';

export const ANIMAIS_DEMO: ReadonlyArray<Animal> = [
  {
    id: 'demo-mia',
    nome: 'Mia',
    especie: 'gato',
    idade: 36,
    porte: 'pequeno',
    energia: 1,
    espaco_necessario: 'apartamento',
    sociavel_criancas: true,
    sociavel_animais: false,
    foto_url: 'https://loremflickr.com/400/300/cat?lock=11',
    descricao:
      'Gata adulta, muito calma. Adora dormir no sofá e receber carinho. Ideal para casa tranquila.',
    ong_id: ONG_PATINHAS,
    disponivel: true,
    criado_em: AGORA,
  },
  {
    id: 'demo-bigode',
    nome: 'Bigode',
    especie: 'gato',
    idade: 24,
    porte: 'pequeno',
    energia: 2,
    espaco_necessario: 'apartamento',
    sociavel_criancas: false,
    sociavel_animais: true,
    foto_url: 'https://loremflickr.com/400/300/cat?lock=22',
    descricao:
      'Gato independente, brinca um pouco no fim do dia e descansa o resto. Convive bem com outros gatos.',
    ong_id: ONG_PATINHAS,
    disponivel: true,
    criado_em: AGORA,
  },
  {
    id: 'demo-pipoca',
    nome: 'Pipoca',
    especie: 'cachorro',
    idade: 12,
    porte: 'pequeno',
    energia: 3,
    espaco_necessario: 'apartamento',
    sociavel_criancas: true,
    sociavel_animais: true,
    foto_url: 'https://placedog.net/400/300?id=12',
    descricao:
      'Cachorrinha alegre e adaptável. Se dá bem com crianças e outros pets, ótima para apartamento.',
    ong_id: ONG_PATINHAS,
    disponivel: true,
    criado_em: AGORA,
  },
  {
    id: 'demo-luna',
    nome: 'Luna',
    especie: 'gato',
    idade: 18,
    porte: 'pequeno',
    energia: 4,
    espaco_necessario: 'casa_pequena',
    sociavel_criancas: true,
    sociavel_animais: true,
    foto_url: 'https://loremflickr.com/400/300/cat?lock=33',
    descricao:
      'Gata jovem e brincalhona. Gosta de explorar e precisa de espaço para correr.',
    ong_id: ONG_PATINHAS,
    disponivel: true,
    criado_em: AGORA,
  },
  {
    id: 'demo-tobby',
    nome: 'Tobby',
    especie: 'cachorro',
    idade: 30,
    porte: 'pequeno',
    energia: 3,
    espaco_necessario: 'casa_pequena',
    sociavel_criancas: true,
    sociavel_animais: false,
    foto_url: 'https://placedog.net/400/300?id=44',
    descricao:
      'Cachorro adulto carinhoso. Prefere ser o único pet da casa.',
    ong_id: ONG_PATINHAS,
    disponivel: true,
    criado_em: AGORA,
  },
  {
    id: 'demo-bidu',
    nome: 'Bidu',
    especie: 'cachorro',
    idade: 24,
    porte: 'medio',
    energia: 4,
    espaco_necessario: 'casa_pequena',
    sociavel_criancas: true,
    sociavel_animais: true,
    foto_url: 'https://placedog.net/400/300?id=56',
    descricao:
      'Cachorro de porte médio, ativo e brincalhão. Precisa de passeios diários.',
    ong_id: ONG_AMIGOS,
    disponivel: true,
    criado_em: AGORA,
  },
  {
    id: 'demo-nina',
    nome: 'Nina',
    especie: 'cachorro',
    idade: 48,
    porte: 'medio',
    energia: 2,
    espaco_necessario: 'casa_grande',
    sociavel_criancas: true,
    sociavel_animais: true,
    foto_url: 'https://placedog.net/400/300?id=78',
    descricao:
      'Cachorra de meia-idade, calma e dócil. Ótima para famílias que querem companhia tranquila.',
    ong_id: ONG_AMIGOS,
    disponivel: true,
    criado_em: AGORA,
  },
  {
    id: 'demo-thor',
    nome: 'Thor',
    especie: 'cachorro',
    idade: 18,
    porte: 'grande',
    energia: 5,
    espaco_necessario: 'casa_grande',
    sociavel_criancas: true,
    sociavel_animais: true,
    foto_url: 'https://placedog.net/400/300?id=99',
    descricao:
      'Cachorro grande e muito ativo. Precisa de muito espaço e exercício diário.',
    ong_id: ONG_AMIGOS,
    disponivel: true,
    criado_em: AGORA,
  },
  {
    id: 'demo-maya',
    nome: 'Maya',
    especie: 'cachorro',
    idade: 36,
    porte: 'grande',
    energia: 4,
    espaco_necessario: 'casa_grande',
    sociavel_criancas: true,
    sociavel_animais: false,
    foto_url: 'https://placedog.net/400/300?id=121',
    descricao:
      'Cachorra grande e energética. Melhor sem outros pets em casa.',
    ong_id: ONG_AMIGOS,
    disponivel: true,
    criado_em: AGORA,
  },
  {
    id: 'demo-sansao',
    nome: 'Sansão',
    especie: 'cachorro',
    idade: 24,
    porte: 'grande',
    energia: 5,
    espaco_necessario: 'casa_grande',
    sociavel_criancas: false,
    sociavel_animais: true,
    foto_url: 'https://placedog.net/400/300?id=143',
    descricao:
      'Cachorro grande e brincalhão. Ideal para adultos com quintal espaçoso.',
    ong_id: ONG_AMIGOS,
    disponivel: true,
    criado_em: AGORA,
  },
];
