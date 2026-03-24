import { startOfMonth, endOfMonth, isSaturday, addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Gera todos os sábados de um mês específico
 * @param {Date} mesReferencia - Qualquer data dentro do mês desejado
 * @returns {Array<Date>} Lista de sábados ordenados
 */
export function gerarSabadosMes(mesReferencia) {
  const inicio = startOfMonth(mesReferencia);
  const fim = endOfMonth(mesReferencia);
  
  const sabados = [];
  let dataAtual = inicio;
  
  // Encontra o primeiro sábado do mês
  while (dataAtual <= fim && !isSaturday(dataAtual)) {
    dataAtual = addDays(dataAtual, 1);
  }
  
  // Adiciona todos os sábados até o final do mês
  while (dataAtual <= fim) {
    sabados.push(new Date(dataAtual));
    dataAtual = addDays(dataAtual, 7);
  }
  
  return sabados;
}

/**
 * Formata uma data para string no formato DD/MM/YYYY
 * @param {Date} data
 * @returns {string}
 */
export function formatarDataBR(data) {
  return format(data, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Formata uma data para string legível
 * @param {Date} data
 * @returns {string}
 */
export function formatarDataLegivel(data) {
  return format(data, "EEEE, dd 'de' MMMM", { locale: ptBR });
}

/**
 * Verifica se uma data é um sábado
 * @param {Date} data
 * @returns {boolean}
 */
export function ehSabado(data) {
  return isSaturday(data);
}

/**
 * Converte data para timestamp normalizado (midnight UTC)
 * @param {Date} data
 * @returns {Date}
 */
export function normalizarData(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

/**
 * Compara duas datas (ignorando hora)
 * @param {Date} data1
 * @param {Date} data2
 * @returns {boolean}
 */
export function mesmaData(data1, data2) {
  return (
    data1.getFullYear() === data2.getFullYear() &&
    data1.getMonth() === data2.getMonth() &&
    data1.getDate() === data2.getDate()
  );
}
