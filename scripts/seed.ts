import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { cadastrarAdotante, cadastrarONG } from '../services/auth';
import type { Animal, ONG, PerfilAdotante } from '../types';

type DadosONG = Omit<ONG, 'id' | 'email' | 'tipo' | 'criado_em'>;
type DadosAdotante = Omit<PerfilAdotante, 'id' | 'email' | 'tipo' | 'criado_em'>;
type AnimalSemMeta = Omit<Animal, 'id' | 'criado_em' | 'ong_id'>;

type ContaSeed<T> = {
  email: string;
  senha: string;
  dados: T;
};

export type SeedResult = {
  ongs: Array<{ email: string; uid: string; criado: boolean }>;
  animais: Array<{ id: string; nome: string; criado: boolean }>;
  adotantes: Array<{ email: string; uid: string; criado: boolean }>;
  erros: string[];
};

const SENHA_PADRAO = 'teste123';
const COLLECTION_USERS = 'users';
const COLLECTION_ANIMAIS = 'animais';

const ONGS: ReadonlyArray<ContaSeed<DadosONG>> = [
  {
    email: 'ong.patinhas@test.com',
    senha: SENHA_PADRAO,
    dados: {
      nome: 'Equipe Patinhas',
      nome_ong: 'Patinhas Felizes',
      cnpj: '12.345.678/0001-90',
      telefone: '(11) 98765-4321',
    },
  },
  {
    email: 'ong.amigosfieis@test.com',
    senha: SENHA_PADRAO,
    dados: {
      nome: 'Equipe Amigos Fiéis',
      nome_ong: 'Associação Amigos Fiéis',
      cnpj: '98.765.432/0001-10',
      telefone: '(11) 91234-5678',
    },
  },
];

const ANIMAIS_ONG_1: ReadonlyArray<AnimalSemMeta> = [
  {
    nome: 'Mia',
    especie: 'gato',
    idade: 36,
    porte: 'pequeno',
    energia: 1,
    espaco_necessario: 'apartamento',
    sociavel_criancas: true,
    sociavel_animais: false,
    foto_url: 'https://picsum.photos/seed/mia/400/300',
    descricao:
      'Gata adulta, muito calma. Adora dormir no sofá e receber carinho. Ideal para casa tranquila.',
    disponivel: true,
  },
  {
    nome: 'Bigode',
    especie: 'gato',
    idade: 24,
    porte: 'pequeno',
    energia: 2,
    espaco_necessario: 'apartamento',
    sociavel_criancas: false,
    sociavel_animais: true,
    foto_url: 'https://picsum.photos/seed/bigode/400/300',
    descricao:
      'Gato independente, brinca um pouco no fim do dia e descansa o resto. Convive bem com outros gatos.',
    disponivel: true,
  },
  {
    nome: 'Pipoca',
    especie: 'cachorro',
    idade: 12,
    porte: 'pequeno',
    energia: 3,
    espaco_necessario: 'apartamento',
    sociavel_criancas: true,
    sociavel_animais: true,
    foto_url: 'https://picsum.photos/seed/pipoca/400/300',
    descricao:
      'Cachorrinha alegre e adaptável. Se dá bem com crianças e outros pets, ótima para apartamento.',
    disponivel: true,
  },
  {
    nome: 'Luna',
    especie: 'gato',
    idade: 18,
    porte: 'pequeno',
    energia: 4,
    espaco_necessario: 'casa_pequena',
    sociavel_criancas: true,
    sociavel_animais: true,
    foto_url: 'https://picsum.photos/seed/luna/400/300',
    descricao:
      'Gata jovem e brincalhona. Gosta de explorar e precisa de espaço para correr.',
    disponivel: true,
  },
  {
    nome: 'Tobby',
    especie: 'cachorro',
    idade: 30,
    porte: 'pequeno',
    energia: 3,
    espaco_necessario: 'casa_pequena',
    sociavel_criancas: true,
    sociavel_animais: false,
    foto_url: 'https://picsum.photos/seed/tobby/400/300',
    descricao:
      'Cachorro adulto carinhoso. Prefere ser o único pet da casa.',
    disponivel: true,
  },
];

const ANIMAIS_ONG_2: ReadonlyArray<AnimalSemMeta> = [
  {
    nome: 'Bidu',
    especie: 'cachorro',
    idade: 24,
    porte: 'medio',
    energia: 4,
    espaco_necessario: 'casa_pequena',
    sociavel_criancas: true,
    sociavel_animais: true,
    foto_url: 'https://picsum.photos/seed/bidu/400/300',
    descricao:
      'Cachorro de porte médio, ativo e brincalhão. Precisa de passeios diários.',
    disponivel: true,
  },
  {
    nome: 'Nina',
    especie: 'cachorro',
    idade: 48,
    porte: 'medio',
    energia: 2,
    espaco_necessario: 'casa_grande',
    sociavel_criancas: true,
    sociavel_animais: true,
    foto_url: 'https://picsum.photos/seed/nina/400/300',
    descricao:
      'Cachorra de meia-idade, calma e dócil. Ótima para famílias que querem companhia tranquila.',
    disponivel: true,
  },
  {
    nome: 'Thor',
    especie: 'cachorro',
    idade: 18,
    porte: 'grande',
    energia: 5,
    espaco_necessario: 'casa_grande',
    sociavel_criancas: true,
    sociavel_animais: true,
    foto_url: 'https://picsum.photos/seed/thor/400/300',
    descricao:
      'Cachorro grande e muito ativo. Precisa de muito espaço e exercício diário.',
    disponivel: true,
  },
  {
    nome: 'Maya',
    especie: 'cachorro',
    idade: 36,
    porte: 'grande',
    energia: 4,
    espaco_necessario: 'casa_grande',
    sociavel_criancas: true,
    sociavel_animais: false,
    foto_url: 'https://picsum.photos/seed/maya/400/300',
    descricao:
      'Cachorra grande e energética. Melhor sem outros pets em casa.',
    disponivel: true,
  },
  {
    nome: 'Sansão',
    especie: 'cachorro',
    idade: 24,
    porte: 'grande',
    energia: 5,
    espaco_necessario: 'casa_grande',
    sociavel_criancas: false,
    sociavel_animais: true,
    foto_url: 'https://picsum.photos/seed/sansao/400/300',
    descricao:
      'Cachorro grande e brincalhão. Ideal para adultos com quintal espaçoso.',
    disponivel: true,
  },
];

const ADOTANTES: ReadonlyArray<ContaSeed<DadosAdotante>> = [
  {
    email: 'ana.silva@test.com',
    senha: SENHA_PADRAO,
    dados: {
      nome: 'Ana Silva',
      estilo_vida: 'sedentario',
      moradia: 'apartamento',
      tempo_disponivel: 2,
      tem_criancas: false,
      tem_animais: false,
      preferencia_especie: 'gato',
      preferencia_porte: 'pequeno',
    },
  },
  {
    email: 'pedro.santos@test.com',
    senha: SENHA_PADRAO,
    dados: {
      nome: 'Pedro Santos',
      estilo_vida: 'ativo',
      moradia: 'casa_grande',
      tempo_disponivel: 5,
      tem_criancas: true,
      tem_animais: true,
      preferencia_especie: 'cachorro',
      preferencia_porte: 'grande',
    },
  },
];

/**
 * Popula o Firestore com dados de teste — idempotente.
 *
 * Comportamento por entidade:
 *  - ONG/Adotante: tenta criar; se o email já existe, faz login com a
 *    mesma senha pra recuperar o uid e garante que o doc em /users
 *    exista (merge dos dados — não sobrescreve criado_em existente).
 *  - Animal: id determinístico `${ong_id}_${slug(nome)}`. Se já existe,
 *    pula. Senão, cria.
 *
 * Senha padrão: "teste123".
 */
export async function runSeed(): Promise<SeedResult> {
  const resultado: SeedResult = {
    ongs: [],
    animais: [],
    adotantes: [],
    erros: [],
  };

  const animaisPorOng: ReadonlyArray<ReadonlyArray<AnimalSemMeta>> = [
    ANIMAIS_ONG_1,
    ANIMAIS_ONG_2,
  ];

  for (let i = 0; i < ONGS.length; i++) {
    const ongConfig = ONGS[i];
    try {
      const r = await garantirONG(ongConfig);
      resultado.ongs.push({
        email: ongConfig.email,
        uid: r.id,
        criado: r.criado,
      });

      for (const animal of animaisPorOng[i] ?? []) {
        try {
          const a = await garantirAnimal({ ...animal, ong_id: r.id });
          resultado.animais.push({
            id: a.id,
            nome: animal.nome,
            criado: a.criado,
          });
        } catch (e) {
          resultado.erros.push(
            `Animal "${animal.nome}" (${ongConfig.email}): ${mensagemErro(e)}`,
          );
        }
      }
    } catch (e) {
      resultado.erros.push(`ONG ${ongConfig.email}: ${mensagemErro(e)}`);
    }
  }

  for (const adotConfig of ADOTANTES) {
    try {
      const r = await garantirAdotante(adotConfig);
      resultado.adotantes.push({
        email: adotConfig.email,
        uid: r.id,
        criado: r.criado,
      });
    } catch (e) {
      resultado.erros.push(
        `Adotante ${adotConfig.email}: ${mensagemErro(e)}`,
      );
    }
  }

  try {
    await signOut(auth);
  } catch {
    // ignora — não compromete o seed
  }

  return resultado;
}

async function garantirONG(
  config: ContaSeed<DadosONG>,
): Promise<{ id: string; criado: boolean }> {
  try {
    const ong = await cadastrarONG(config.email, config.senha, config.dados);
    return { id: ong.id, criado: true };
  } catch (e) {
    if (codigoErroAuth(e) !== 'auth/email-already-in-use') throw e;
    const cred = await signInWithEmailAndPassword(
      auth,
      config.email,
      config.senha,
    );
    await setDoc(
      doc(db, COLLECTION_USERS, cred.user.uid),
      {
        id: cred.user.uid,
        email: config.email,
        tipo: 'ong',
        ...config.dados,
      },
      { merge: true },
    );
    return { id: cred.user.uid, criado: false };
  }
}

async function garantirAdotante(
  config: ContaSeed<DadosAdotante>,
): Promise<{ id: string; criado: boolean }> {
  try {
    const adotante = await cadastrarAdotante(
      config.email,
      config.senha,
      config.dados,
    );
    return { id: adotante.id, criado: true };
  } catch (e) {
    if (codigoErroAuth(e) !== 'auth/email-already-in-use') throw e;
    const cred = await signInWithEmailAndPassword(
      auth,
      config.email,
      config.senha,
    );
    await setDoc(
      doc(db, COLLECTION_USERS, cred.user.uid),
      {
        id: cred.user.uid,
        email: config.email,
        tipo: 'adotante',
        ...config.dados,
      },
      { merge: true },
    );
    return { id: cred.user.uid, criado: false };
  }
}

async function garantirAnimal(
  animal: Omit<Animal, 'id' | 'criado_em'>,
): Promise<{ id: string; criado: boolean }> {
  const id = `${animal.ong_id}_${slugificar(animal.nome)}`;
  const ref = doc(db, COLLECTION_ANIMAIS, id);
  const existente = await getDoc(ref);
  if (existente.exists()) {
    return { id, criado: false };
  }
  await setDoc(ref, { ...animal, criado_em: serverTimestamp() });
  return { id, criado: true };
}

function slugificar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function codigoErroAuth(e: unknown): string | null {
  if (typeof e === 'object' && e !== null && 'code' in e) {
    return String((e as { code: unknown }).code);
  }
  return null;
}

function mensagemErro(e: unknown): string {
  const code = codigoErroAuth(e);
  if (code) return code;
  if (e instanceof Error) return e.message;
  return 'erro desconhecido';
}
