import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { startOfMonth, endOfMonth } from 'date-fns';
import { normalizarData } from '../utils/dateUtils';

const diasEspeciaisRef = collection(db, 'dias_especiais');
const sabadosRemovidosRef = collection(db, 'sabados_removidos');

/**
 * Busca todos os dias especiais (dias não-sábados com escala obrigatória) de um mês
 * @param {Date} mesReferencia - Qualquer data dentro do mês desejado
 * @returns {Promise<Array>} Lista de dias especiais com id, data e motivo
 */
export async function getDiasEspeciaisMes(mesReferencia) {
  const inicio = startOfMonth(mesReferencia);
  const fim = endOfMonth(mesReferencia);

  const q = query(
    diasEspeciaisRef,
    where('data', '>=', Timestamp.fromDate(inicio)),
    where('data', '<=', Timestamp.fromDate(fim))
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    data: d.data().data.toDate(),
  }));
}

/**
 * Adiciona um dia especial (obrigatório ter escala)
 * @param {Date} data - A data especial
 * @param {string} motivo - Motivo do dia especial (ex: "Semana Santa", "Missa especial")
 * @returns {Promise<DocumentReference>}
 */
export async function adicionarDiaEspecial({ data, motivo }) {
  const dataNormalizada = normalizarData(data);
  return addDoc(diasEspeciaisRef, {
    data: Timestamp.fromDate(dataNormalizada),
    motivo,
    criadoEm: Timestamp.now(),
  });
}

/**
 * Remove um dia especial
 * @param {string} id - ID do documento do dia especial
 * @returns {Promise<void>}
 */
export async function deletarDiaEspecial(id) {
  return deleteDoc(doc(db, 'dias_especiais', id));
}

/**
 * Verifica se uma data é um dia especial
 * @param {Date} data
 * @param {Array} diasEspeciais
 * @returns {boolean}
 */
export function ehDiaEspecial(data, diasEspeciais) {
  return diasEspeciais.some(
    (dia) =>
      dia.data.getFullYear() === data.getFullYear() &&
      dia.data.getMonth() === data.getMonth() &&
      dia.data.getDate() === data.getDate()
  );
}

/**
 * Busca todos os sábados removidos (sem escala) de um mês
 * @param {Date} mesReferencia - Qualquer data dentro do mês desejado
 * @returns {Promise<Array>} Lista de sábados removidos com id, data e motivo
 */
export async function getSabadosRemovidosMes(mesReferencia) {
  const inicio = startOfMonth(mesReferencia);
  const fim = endOfMonth(mesReferencia);

  const q = query(
    sabadosRemovidosRef,
    where('data', '>=', Timestamp.fromDate(inicio)),
    where('data', '<=', Timestamp.fromDate(fim))
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    data: d.data().data.toDate(),
  }));
}

/**
 * Adiciona um sábado removido (sem escala)
 * @param {Date} data - A data do sábado
 * @param {string} motivo - Motivo de remoção (ex: "Sem culto", "Feriado")
 * @returns {Promise<DocumentReference>}
 */
export async function adicionarSabadoRemovido({ data, motivo }) {
  const dataNormalizada = normalizarData(data);
  return addDoc(sabadosRemovidosRef, {
    data: Timestamp.fromDate(dataNormalizada),
    motivo,
    criadoEm: Timestamp.now(),
  });
}

/**
 * Remove um sábado da lista de removidos
 * @param {string} id - ID do documento do sábado removido
 * @returns {Promise<void>}
 */
export async function deletarSabadoRemovido(id) {
  return deleteDoc(doc(db, 'sabados_removidos', id));
}

/**
 * Verifica se um sábado foi removido
 * @param {Date} data
 * @param {Array} sabadosRemovidos
 * @returns {boolean}
 */
export function ehSabadoRemovido(data, sabadosRemovidos) {
  return sabadosRemovidos.some(
    (sabado) =>
      sabado.data.getFullYear() === data.getFullYear() &&
      sabado.data.getMonth() === data.getMonth() &&
      sabado.data.getDate() === data.getDate()
  );
}
