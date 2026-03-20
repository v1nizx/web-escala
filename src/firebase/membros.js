import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from './config';

const membrosRef = collection(db, 'membros');

/**
 * Busca todos os membros ativos
 */
export async function getMembrosAtivos() {
  const q = query(
    membrosRef,
    where('ativo', '==', true)
  );
  const snapshot = await getDocs(q);
  const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return lista.sort((a, b) => a.nome.localeCompare(b.nome));
}

/**
 * Busca todos os membros (ativos e inativos)
 */
export async function getTodosMembros() {
  const snapshot = await getDocs(membrosRef);
  const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return lista.sort((a, b) => a.nome.localeCompare(b.nome));
}

/**
 * Adiciona um novo membro
 */
export async function adicionarMembro(nome) {
  return addDoc(membrosRef, { nome, ativo: true });
}

/**
 * Alterna o status ativo/inativo de um membro
 */
export async function toggleMembroAtivo(id, ativoAtual) {
  const ref = doc(db, 'membros', id);
  return updateDoc(ref, { ativo: !ativoAtual });
}

/**
 * Deleta um membro
 */
export async function deletarMembro(id) {
  return deleteDoc(doc(db, 'membros', id));
}
