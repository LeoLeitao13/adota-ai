import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

type AnimalJSON = {
  nome: string;
  especie: 'cachorro' | 'gato' | 'outro';
  idade: number;
  porte: 'pequeno' | 'medio' | 'grande';
  energia: 1 | 2 | 3 | 4 | 5;
  espaco_necessario: 'apartamento' | 'casa_pequena' | 'casa_grande';
  sociavel_criancas: boolean;
  sociavel_animais: boolean;
  foto_url: string;
  descricao: string;
  ong_id: string;
  disponivel: boolean;
};

const COLLECTION = 'animais';
const JSON_PATH = './data/animais-seed.json';

function slugificar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function main(): Promise<void> {
  const raw = readFileSync(JSON_PATH, 'utf-8');
  const animais: AnimalJSON[] = JSON.parse(raw);

  console.log(`Subindo ${animais.length} animais → coleção "${COLLECTION}"`);
  console.log('');

  let criados = 0;
  let erros = 0;

  for (const animal of animais) {
    const id = `seed_${slugificar(animal.nome)}`;
    try {
      await setDoc(doc(db, COLLECTION, id), {
        ...animal,
        criado_em: Timestamp.now(),
      });
      console.log(`  ✓ ${animal.nome.padEnd(10)} → animais/${id}`);
      criados++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  ✗ ${animal.nome}: ${msg}`);
      erros++;
    }
  }

  console.log('');
  console.log(`Concluído: ${criados} ok, ${erros} erros.`);
  process.exit(erros > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Falha:', e);
  process.exit(1);
});
