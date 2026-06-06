export type Especie = 'cachorro' | 'gato' | 'outro';
export type Porte = 'pequeno' | 'medio' | 'grande';
export type EspacoNecessario = 'apartamento' | 'casa_pequena' | 'casa_grande';
export type NivelEnergia = 1 | 2 | 3 | 4 | 5;

export interface Animal {
  id: string;
  nome: string;
  especie: Especie;
  idade: number;
  porte: Porte;
  energia: NivelEnergia;
  espaco_necessario: EspacoNecessario;
  sociavel_criancas: boolean;
  sociavel_animais: boolean;
  foto_url: string;
  descricao: string;
  ong_id: string;
  disponivel: boolean;
  criado_em: Date;
}
