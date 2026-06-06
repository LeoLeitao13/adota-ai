import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { ONG, PerfilAdotante, User } from '../types';

type DadosAdotante = Omit<PerfilAdotante, 'id' | 'email' | 'tipo' | 'criado_em'>;
type DadosONG = Omit<ONG, 'id' | 'email' | 'tipo' | 'criado_em'>;

const USERS_COLLECTION = 'users';

export async function cadastrarAdotante(
  email: string,
  senha: string,
  dados: DadosAdotante,
): Promise<PerfilAdotante> {
  const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, senha);
  const perfil: PerfilAdotante = {
    id: cred.user.uid,
    email,
    tipo: 'adotante',
    criado_em: new Date(),
    ...dados,
  };
  await setDoc(doc(db, USERS_COLLECTION, cred.user.uid), perfil);
  return perfil;
}

export async function cadastrarONG(
  email: string,
  senha: string,
  dados: DadosONG,
): Promise<ONG> {
  const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, senha);
  const ong: ONG = {
    id: cred.user.uid,
    email,
    tipo: 'ong',
    criado_em: new Date(),
    ...dados,
  };
  await setDoc(doc(db, USERS_COLLECTION, cred.user.uid), ong);
  return ong;
}

export async function login(email: string, senha: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, senha);
  const usuario = await buscarUsuario(cred.user.uid);
  if (!usuario) {
    throw new Error('Usuário autenticado, mas perfil não encontrado no Firestore.');
  }
  return usuario;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function getUserAtual(): Promise<User | null> {
  const current = auth.currentUser;
  if (!current) return null;
  return buscarUsuario(current.uid);
}

async function buscarUsuario(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snap.exists()) return null;
  const raw = snap.data();
  return {
    ...raw,
    criado_em: raw.criado_em instanceof Timestamp ? raw.criado_em.toDate() : raw.criado_em,
  } as User;
}
