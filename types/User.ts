import type { Especie, EspacoNecessario, Porte } from './Animal';

export type TipoUsuario = 'adotante' | 'ong';
export type EstiloVida = 'sedentario' | 'moderado' | 'ativo';
export type NivelTempoDisponivel = 1 | 2 | 3 | 4 | 5;

export interface UserBase {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  criado_em: Date;
}

export interface PerfilAdotante extends UserBase {
  tipo: 'adotante';
  estilo_vida: EstiloVida;
  moradia: EspacoNecessario;
  tempo_disponivel: NivelTempoDisponivel;
  tem_criancas: boolean;
  tem_animais: boolean;
  preferencia_especie: Especie;
  preferencia_porte: Porte;
}

export interface ONG extends UserBase {
  tipo: 'ong';
  nome_ong: string;
  cnpj: string;
  telefone: string;
  endereco?: string;
}

export type User = PerfilAdotante | ONG;
