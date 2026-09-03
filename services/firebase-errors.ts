/**
 * Tradução de códigos de erro do Firebase Auth para mensagens
 * amigáveis em português. Centraliza o que antes era duas
 * implementações separadas (login e cadastro) com cobertura
 * de códigos inconsistente entre elas.
 */

type ContextoErro = 'login' | 'cadastro';

const MENSAGENS_COMUNS: Record<string, string> = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
};

const MENSAGENS_LOGIN: Record<string, string> = {
  ...MENSAGENS_COMUNS,
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente em alguns minutos.',
};

const MENSAGENS_CADASTRO: Record<string, string> = {
  ...MENSAGENS_COMUNS,
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/weak-password': 'Senha muito fraca.',
};

const MENSAGENS_PADRAO: Record<ContextoErro, string> = {
  login: 'Não foi possível entrar. Tente novamente.',
  cadastro: 'Não foi possível concluir o cadastro. Tente novamente.',
};

function codigoDoErro(e: unknown): string | null {
  if (typeof e === 'object' && e !== null && 'code' in e) {
    return String((e as { code: unknown }).code);
  }
  return null;
}

/**
 * Converte um erro lançado pelo Firebase Auth (ou desconhecido)
 * em uma mensagem amigável, de acordo com o contexto da tela.
 */
export function mensagemErroFirebase(e: unknown, contexto: ContextoErro): string {
  const codigo = codigoDoErro(e);
  if (!codigo) return MENSAGENS_PADRAO[contexto];

  const mapa = contexto === 'login' ? MENSAGENS_LOGIN : MENSAGENS_CADASTRO;
  return mapa[codigo] ?? MENSAGENS_PADRAO[contexto];
}
