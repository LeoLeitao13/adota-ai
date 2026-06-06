/**
 * Validações e máscaras de campos do formulário.
 * Funções puras, sem dependência de Firebase ou React.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const TELEFONE_REGEX = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const NAO_DIGITO_REGEX = /\D/g;

export const SENHA_MIN = 6;
export const NOME_MIN = 2;

export function validarEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validarSenha(senha: string): boolean {
  return senha.length >= SENHA_MIN;
}

export function validarCNPJ(cnpj: string): boolean {
  return CNPJ_REGEX.test(cnpj.trim());
}

export function validarTelefone(telefone: string): boolean {
  return TELEFONE_REGEX.test(telefone.trim());
}

/**
 * Aplica máscara XX.XXX.XXX/XXXX-XX progressivamente
 * conforme o usuário digita.
 */
export function aplicarMascaraCNPJ(valor: string): string {
  const d = valor.replace(NAO_DIGITO_REGEX, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/**
 * Aplica máscara (XX) XXXX-XXXX (fixo) ou (XX) XXXXX-XXXX (celular)
 * conforme a quantidade de dígitos.
 */
export function aplicarMascaraTelefone(valor: string): string {
  const d = valor.replace(NAO_DIGITO_REGEX, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
