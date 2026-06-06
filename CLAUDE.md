@AGENTS.md

# Adota AI

Aplicativo móvel que utiliza inteligência artificial para recomendar animais para
adoção com base no perfil do usuário (estilo de vida, tempo disponível, espaço
físico). Conecta adotantes a ONGs responsáveis pelo cadastro dos animais,
buscando reduzir devoluções por incompatibilidade entre adotante e animal.

Projeto acadêmico AEP — UniCesumar, ESOFT 7º semestre, 2026.1.
Alinhado à ODS 15 da ONU (proteção da vida terrestre).

## Stack

- React Native (Android e iOS)
- Expo SDK 56
- TypeScript
- Expo Router (file-based routing)
- Firebase (Auth, Firestore, Storage) — persistência e sincronização em tempo real

## Perfis de usuário

- **Adotante**: cadastra perfil com preferências e recebe recomendações de animais
  compatíveis.
- **ONG**: cadastra e gerencia os animais disponíveis para adoção.

## Algoritmo de recomendação

Sistema baseado em **K-Nearest Neighbors (KNN)**:

- O perfil do adotante é representado como um vetor de características (espécie
  preferida, porte, idade, espaço disponível, etc.).
- Cada animal cadastrado também é convertido em vetor com a mesma dimensão.
- A similaridade é calculada por **medida de distância** (Euclidiana) entre o vetor
  do adotante e os vetores dos animais.
- Os `k` animais mais próximos são retornados como recomendação.

Implementação em `services/knn.ts`.

## Estrutura de pastas

```
adota-ai/
├── CLAUDE.md
├── app/
│   ├── _layout.tsx
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (adotante)/
│   │   ├── home.tsx              ← lista de animais recomendados
│   │   ├── perfil.tsx
│   │   └── animal/[id].tsx
│   └── (ong)/
│       ├── dashboard.tsx
│       └── cadastrar-animal.tsx
├── components/                   ← componentes reutilizáveis
├── services/
│   ├── firebase.ts               ← inicialização do Firebase
│   ├── knn.ts                    ← lógica de recomendação
│   └── animals.ts                ← CRUD de animais
├── types/
│   ├── Animal.ts
│   └── User.ts
└── constants/
    └── theme.ts
```

## Regras de código

- **TypeScript estrito**: nunca use `any`. Prefira tipos explícitos, `unknown` +
  narrowing, ou genéricos quando necessário.
- **Componentes funcionais**: sempre. Sem `class components`.
- **Estilos**: `StyleSheet.create({ ... })` no fim do arquivo. Sem estilos inline
  (exceto valores dinâmicos pontuais).
- **Nomenclatura**:
  - Componentes em **PascalCase** (`AnimalCard.tsx`, `ProfileForm.tsx`).
  - Hooks em `camelCase` com prefixo `use` (`useAdopterProfile`).
  - Funções e variáveis em `camelCase`.
  - Tipos e interfaces em **PascalCase** (`Animal`, `AdopterProfile`).
- **Rotas Expo Router**: arquivos em `app/` em `kebab-case` ou `camelCase`
  conforme convenção do router; grupos entre parênteses (`(auth)`, `(adotante)`,
  `(ong)`) não afetam a URL.
- **Imports**: relativos curtos; agrupar libs externas, depois internas.
- **Sem comentários supérfluos**: nomes auto-explicativos > comentários.
