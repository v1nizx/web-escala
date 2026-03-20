import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { startOfMonth, endOfMonth } from 'date-fns';

const escalasRef = collection(db, 'escalas');

/**
 * Busca escalas de um mês específico
 * @param {Date} mesReferencia - Qualquer data dentro do mês desejado
 * @returns {Promise<Array>} Lista de escalas ordenadas por data
 */
export async function getEscalasPorMes(mesReferencia) {
  const inicio = startOfMonth(mesReferencia);
  const fim = endOfMonth(mesReferencia);

  const q = query(
    escalasRef,
    where('data', '>=', Timestamp.fromDate(inicio)),
    where('data', '<=', Timestamp.fromDate(fim))
  );

  const snapshot = await getDocs(q);
  const lista = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    data: d.data().data.toDate(),
  }));
  return lista.sort((a, b) => a.data - b.data);
}

/**
 * Adiciona uma nova escala
 */
export async function adicionarEscala({ data, membroId, nome, funcao }) {
  return addDoc(escalasRef, {
    data: Timestamp.fromDate(data),
    membroID: membroId,
    nome,
    funcao,
  });
}

/**
 * Edita uma escala existente
 */
export async function editarEscala(id, campos) {
  const ref = doc(db, 'escalas', id);
  const updates = { ...campos };
  if (updates.data instanceof Date) {
    updates.data = Timestamp.fromDate(updates.data);
  }
  return updateDoc(ref, updates);
}

/**
 * Deleta uma escala
 */
export async function deletarEscala(id) {
  return deleteDoc(doc(db, 'escalas', id));
}
