import type { Animal, EspacoNecessario, EstiloVida, PerfilAdotante } from '../types';

/**
 * ===========================================================
 *  Recomendação por K-Nearest Neighbors (KNN)
 * ===========================================================
 *
 *  CONTEXTO ACADÊMICO
 *  ------------------
 *  KNN é um algoritmo de aprendizado de máquina não paramétrico
 *  e baseado em instâncias: não há "fase de treino" propriamente
 *  dita — os dados rotulados ficam disponíveis em memória e a
 *  inferência consiste em comparar diretamente um ponto de
 *  consulta (query) com cada ponto conhecido, devolvendo os k
 *  vizinhos mais próximos (Russell & Norvig, 2022).
 *
 *  VETOR DE CARACTERÍSTICAS (feature vector)
 *  -----------------------------------------
 *  Cada entidade (adotante ou animal) é descrita por um vetor
 *  numérico em ℝⁿ. Cada posição do vetor representa uma feature
 *  específica e DEVE ocupar o mesmo eixo nos dois lados — só
 *  assim a comparação ponto-a-ponto faz sentido. Aqui usamos
 *  n = 5 dimensões:
 *
 *    [0] estilo de vida              (1=sedentario, 2=moderado, 3=ativo)
 *    [1] espaço/moradia              (1=apartamento, 2=casa_pequena, 3=casa_grande)
 *    [2] tempo disponível / energia  (1 a 5)
 *    [3] convive com crianças        (0 = não, 1 = sim)
 *    [4] convive com outros animais  (0 = não, 1 = sim)
 *
 *  Features categóricas (estilo de vida, espaço) recebem
 *  codificação ordinal porque há ordem natural de intensidade.
 *  Features booleanas são codificadas como 0/1.
 *
 *  DISTÂNCIA EUCLIDIANA
 *  --------------------
 *  Métrica clássica de dissimilaridade entre dois pontos
 *  a, b ∈ ℝⁿ:
 *
 *      d(a, b) = √( Σᵢ (aᵢ − bᵢ)² )
 *
 *  Geometricamente é o comprimento da reta entre os dois pontos
 *  no espaço n-dimensional. Quanto menor d, mais próximos — e,
 *  no nosso domínio, mais compatíveis adotante e animal.
 *
 *  POR QUE KNN É ADEQUADO AQUI?
 *  ----------------------------
 *  • Sem treino prévio: animais novos cadastrados por ONGs
 *    entram imediatamente no pool de candidatos.
 *  • Interpretável: dá pra mostrar a distância e justificar a
 *    recomendação ("este animal combina porque seu vetor é o
 *    mais próximo do seu").
 *  • Dataset pequeno (centenas/milhares de animais): a busca
 *    O(N) é eficiente o suficiente em runtime mobile.
 *  • Adequado ao problema: similaridade entre perfis é o que
 *    queremos medir, e KNN é literalmente "encontre os mais
 *    parecidos".
 *
 *  LIMITAÇÕES CONHECIDAS
 *  ---------------------
 *  • Features não normalizadas: o eixo [2] (range 1–5) pesa
 *    mais que as binárias (0–1). Intencional neste protótipo
 *    (tempo/energia é critério forte), mas em produção pode-se
 *    aplicar min-max ou z-score.
 *  • A distância trata todas as dimensões com o mesmo peso.
 *    Pesos por importância podem ser introduzidos depois.
 */

// ─── Codificação das features categóricas ─────────────────────

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

/**
 * Projeta a energia do animal (1–5) no eixo de estilo de vida
 * do dono (1–3). Bucketing explícito:
 *   energia ≤ 2 → sedentário | energia = 3 → moderado | ≥ 4 → ativo.
 */
function energiaParaEstiloVida(energia: number): number {
  if (energia <= 2) return VALOR_ESTILO_VIDA.sedentario;
  if (energia === 3) return VALOR_ESTILO_VIDA.moderado;
  return VALOR_ESTILO_VIDA.ativo;
}

// ─── Vetorização ──────────────────────────────────────────────

/**
 * Converte o perfil do adotante em vetor de 5 dimensões.
 * É o "ponto de consulta" no espaço de features.
 */
export function vetorizarPerfil(perfil: PerfilAdotante): number[] {
  return [
    VALOR_ESTILO_VIDA[perfil.estilo_vida], // [0]
    VALOR_ESPACO[perfil.moradia],          // [1]
    perfil.tempo_disponivel,               // [2]
    perfil.tem_criancas ? 1 : 0,           // [3]
    perfil.tem_animais ? 1 : 0,            // [4]
  ];
}

/**
 * Converte o animal em vetor de 5 dimensões — mesma ordem e
 * mesmas escalas do vetor do perfil. A dimensão [2] reutiliza
 * `energia` diretamente: animal mais energético exige adotante
 * com mais tempo disponível.
 */
export function vetorizarAnimal(animal: Animal): number[] {
  return [
    energiaParaEstiloVida(animal.energia),    // [0]
    VALOR_ESPACO[animal.espaco_necessario],   // [1]
    animal.energia,                           // [2]
    animal.sociavel_criancas ? 1 : 0,         // [3]
    animal.sociavel_animais ? 1 : 0,          // [4]
  ];
}

// ─── Distância ────────────────────────────────────────────────

/**
 * Distância Euclidiana entre dois vetores de mesma dimensão.
 *
 *   d(a, b) = √( Σᵢ (aᵢ − bᵢ)² )
 *
 * Lança erro se os vetores tiverem tamanhos diferentes — isso
 * indicaria bug na vetorização (perfil e animal devem ter sempre
 * a mesma dimensão).
 */
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

// ─── Recomendação ─────────────────────────────────────────────

export type AnimalPontuado = {
  animal: Animal;
  distancia: number;
};

/**
 * Para cada animal DISPONÍVEL, calcula a distância até o perfil
 * e devolve a lista ordenada por similaridade (menor distância
 * primeiro). Exposto para inspeção/debug (testarKNN, telas de
 * explicação) — o `recomendar` é só esta função + slice.
 */
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

/**
 * Recomenda os k animais mais compatíveis com o perfil.
 *
 * Etapas:
 *   1. Filtra animais com `disponivel === true`.
 *   2. Vetoriza perfil e cada animal restante.
 *   3. Calcula distância Euclidiana entre o perfil e cada animal.
 *   4. Ordena pelo menor d (mais similar primeiro).
 *   5. Devolve os k primeiros.
 */
export function recomendar(
  perfil: PerfilAdotante,
  animais: Animal[],
  k: number = 5,
): Animal[] {
  return pontuarAnimais(perfil, animais)
    .slice(0, k)
    .map((p) => p.animal);
}

// ─── Validação manual (sem Firebase) ──────────────────────────

/**
 * Roda o algoritmo com perfil e animais mock e imprime o ranking
 * no console — útil pra validar a lógica sem depender do
 * Firestore. Pode ser chamado de uma tela de debug ou de um
 * script Node.
 *
 * Inclui um animal com `disponivel: false` para verificar que o
 * filtro funciona (ele não deve aparecer no ranking).
 */
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
