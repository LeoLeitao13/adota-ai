import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Animal } from '../types';

const COLLECTION = 'animais';
const COLLECTION_INTERESSES = 'interesses';

export async function cadastrarAnimal(
  animal: Omit<Animal, 'id' | 'criado_em'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...animal,
    criado_em: serverTimestamp(),
  });
  return ref.id;
}

export async function listarAnimaisPorONG(ong_id: string): Promise<Animal[]> {
  const q = query(collection(db, COLLECTION), where('ong_id', '==', ong_id));
  const snap = await getDocs(q);
  return snap.docs.map((d) => dadosParaAnimal(d.id, d.data()));
}

export async function listarAnimaisDisponiveis(): Promise<Animal[]> {
  const q = query(collection(db, COLLECTION), where('disponivel', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => dadosParaAnimal(d.id, d.data()));
}

export async function buscarAnimal(id: string): Promise<Animal | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return dadosParaAnimal(snap.id, snap.data());
}

export async function atualizarAnimal(
  id: string,
  dados: Partial<Animal>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), dados);
}

export async function deletarAnimal(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Registra o interesse de um adotante em um animal.
 * Usa id determinístico ({adotante}_{animal}) pra evitar duplicatas.
 */
export async function registrarInteresse(
  adotante_id: string,
  animal_id: string,
): Promise<void> {
  const id = `${adotante_id}_${animal_id}`;
  await setDoc(doc(db, COLLECTION_INTERESSES, id), {
    adotante_id,
    animal_id,
    criado_em: serverTimestamp(),
  });
}

function dadosParaAnimal(id: string, data: DocumentData): Animal {
  return {
    ...data,
    id,
    criado_em:
      data.criado_em instanceof Timestamp ? data.criado_em.toDate() : new Date(),
  } as Animal;
}
