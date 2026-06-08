import type { Animal, EspacoNecessario, EstiloVida, PerfilAdotante } from '../types';

const VALOR_ESTILO_VIDA: Record<EstiloVida, number> = {
  sedentario: 1,
  moderado: 2,
  ativo: 3,
};

const VALOR_ESPACO: Record<EspacoNecessario, number> = {
  apartamento: 1,
  casa_pequena: 2,
  casa_grande: 3,
};


function energiaParaEstiloVida(energia: number): number {
  if (energia <= 2) return VALOR_ESTILO_VIDA.sedentario;
  if (energia === 3) return VALOR_ESTILO_VIDA.moderado;
  return VALOR_ESTILO_VIDA.ativo;
}


export function vetorizarPerfil(perfil: PerfilAdotante): number[] {
  return [
    VALOR_ESTILO_VIDA[perfil.estilo_vida], 
    VALOR_ESPACO[perfil.moradia],          
    perfil.tempo_disponivel,              
    perfil.tem_criancas ? 1 : 0,           
    perfil.tem_animais ? 1 : 0,           
  ];
}

export function vetorizarAnimal(animal: Animal): number[] {
  return [
    energiaParaEstiloVida(animal.energia),    
    VALOR_ESPACO[animal.espaco_necessario],  
    animal.energia,                           
    animal.sociavel_criancas ? 1 : 0,         
    animal.sociavel_animais ? 1 : 0,          
  ];
}

export function distanciaEuclidiana(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Vetores devem ter a mesma dimensão (a=${a.length}, b=${b.length}).`,
    );
  }
  let soma = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    soma += diff * diff;
  }
  return Math.sqrt(soma);
}


export type AnimalPontuado = {
  animal: Animal;
  distancia: number;
};

export function pontuarAnimais(
  perfil: PerfilAdotante,
  animais: Animal[],
): AnimalPontuado[] {
  const vetorPerfil = vetorizarPerfil(perfil);
  return animais
    .filter((animal) => animal.disponivel)
    .map((animal) => ({
      animal,
      distancia: distanciaEuclidiana(vetorPerfil, vetorizarAnimal(animal)),
    }))
    .sort((a, b) => a.distancia - b.distancia);
}

export function recomendar(
  perfil: PerfilAdotante,
  animais: Animal[],
  k: number = 5,
): Animal[] {
  return pontuarAnimais(perfil, animais)
    .slice(0, k)
    .map((p) => p.animal);
}


export function testarKNN(): void {
  const perfilMock: PerfilAdotante = {
    id: 'mock-adotante',
    email: 'mock@test.com',
    tipo: 'adotante',
    criado_em: new Date(),
    nome: 'Adotante Mock',
    estilo_vida: 'sedentario',
    moradia: 'apartamento',
    tempo_disponivel: 2,
    tem_criancas: false,
    tem_animais: false,
    preferencia_especie: 'gato',
    preferencia_porte: 'pequeno',
  };

  const agora = new Date();
  const animaisMock: Animal[] = [
    {
      id: 'mock-1',
      nome: 'Mia (gata calma, apto)',
      especie: 'gato',
      idade: 36,
      porte: 'pequeno',
      energia: 1,
      espaco_necessario: 'apartamento',
      sociavel_criancas: false,
      sociavel_animais: false,
      foto_url: '',
      descricao: '',
      ong_id: 'mock-ong',
      disponivel: true,
      criado_em: agora,
    },
    {
      id: 'mock-2',
      nome: 'Pipoca (cão pequeno, apto)',
      especie: 'cachorro',
      idade: 12,
      porte: 'pequeno',
      energia: 3,
      espaco_necessario: 'apartamento',
      sociavel_criancas: true,
      sociavel_animais: true,
      foto_url: '',
      descricao: '',
      ong_id: 'mock-ong',
      disponivel: true,
      criado_em: agora,
    },
    {
      id: 'mock-3',
      nome: 'Bidu (cão médio, casa pequena)',
      especie: 'cachorro',
      idade: 24,
      porte: 'medio',
      energia: 4,
      espaco_necessario: 'casa_pequena',
      sociavel_criancas: true,
      sociavel_animais: true,
      foto_url: '',
      descricao: '',
      ong_id: 'mock-ong',
      disponivel: true,
      criado_em: agora,
    },
    {
      id: 'mock-4',
      nome: 'Thor (cão grande, casa grande)',
      especie: 'cachorro',
      idade: 18,
      porte: 'grande',
      energia: 5,
      espaco_necessario: 'casa_grande',
      sociavel_criancas: true,
      sociavel_animais: true,
      foto_url: '',
      descricao: '',
      ong_id: 'mock-ong',
      disponivel: true,
      criado_em: agora,
    },
    {
      id: 'mock-5',
      nome: 'Indisponível (NÃO deve aparecer)',
      especie: 'gato',
      idade: 24,
      porte: 'pequeno',
      energia: 1,
      espaco_necessario: 'apartamento',
      sociavel_criancas: false,
      sociavel_animais: false,
      foto_url: '',
      descricao: '',
      ong_id: 'mock-ong',
      disponivel: false,
      criado_em: agora,
    },
  ];

  console.log('========== testarKNN ==========');
  console.log('Perfil mock:', {
    estilo_vida: perfilMock.estilo_vida,
    moradia: perfilMock.moradia,
    tempo_disponivel: perfilMock.tempo_disponivel,
    tem_criancas: perfilMock.tem_criancas,
    tem_animais: perfilMock.tem_animais,
  });
  console.log('Vetor do perfil:', vetorizarPerfil(perfilMock));
  console.log('--- Ranking (menor distância = mais compatível) ---');

  const ranking = pontuarAnimais(perfilMock, animaisMock);
  ranking.forEach(({ animal, distancia }, i) => {
    console.log(
      `${i + 1}. d=${distancia.toFixed(3)} | ${animal.nome} | vetor=${JSON.stringify(
        vetorizarAnimal(animal),
      )}`,
    );
  });

  const indisponivelNoRanking = ranking.some((p) => !p.animal.disponivel);
  console.log(
    `Filtro disponivel: ${indisponivelNoRanking ? '❌ falhou' : '✅ ok'} (esperado: ok)`,
  );
  console.log('===============================');
}
