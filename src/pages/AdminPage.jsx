import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getEscalasPorMes, adicionarEscala, deletarEscala } from '../firebase/escalas';
import { getDiasEspeciaisMes, adicionarDiaEspecial, deletarDiaEspecial, getSabadosRemovidosMes, adicionarSabadoRemovido, deletarSabadoRemovido } from '../firebase/excecoes';
import { getMembrosAtivos } from '../firebase/membros';
import { gerarSabadosMes, formatarDataBR } from '../utils/dateUtils';
import SkeletonCard from '../components/SkeletonCard';

const funcaoConfig = {
  camera: { label: 'Câmera', icon: '📹', color: 'text-primary-400' },
  stories: { label: 'Stories', icon: '📱', color: 'text-gold-400' },
  apoio: { label: 'Apoio', icon: '🤝', color: 'text-primary-300' },
};

export default function AdminPage() {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [escalas, setEscalas] = useState([]);
  const [membros, setMembros] = useState([]);
  const [diasEspeciais, setDiasEspeciais] = useState([]);
  const [sabadosRemovidos, setSabadosRemovidos] = useState([]);
  const [sabados, setSabados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(null);
  const [erro, setErro] = useState('');

  // Form state - Escala
  const [dataEscala, setDataEscala] = useState('');
  const [membroSelecionado, setMembroSelecionado] = useState('');
  const [funcaoSelecionada, setFuncaoSelecionada] = useState('camera');

  // Form state - Dia Especial
  const [dataDiaEspecial, setDataDiaEspecial] = useState('');
  const [motivoDiaEspecial, setMotivoDiaEspecial] = useState('');
  const [salvandoDiaEspecial, setSalvandoDiaEspecial] = useState(false);
  const [deletandoDiaEspecial, setDeletandoDiaEspecial] = useState(null);

  // Form state - Sábado Removido
  const [dataSabadoRemovido, setDataSabadoRemovido] = useState('');
  const [motivoSabadoRemovido, setMotivoSabadoRemovido] = useState('');
  const [salvandoSabadoRemovido, setSalvandoSabadoRemovido] = useState(false);
  const [deletandoSabadoRemovido, setDeletandoSabadoRemovido] = useState(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const [escalasDados, membrosDados, diasEspeciaisData, sabadosRemovidosData] = await Promise.all([
        getEscalasPorMes(mesAtual),
        getMembrosAtivos(),
        getDiasEspeciaisMes(mesAtual),
        getSabadosRemovidosMes(mesAtual),
      ]);
      setEscalas(escalasDados);
      setMembros(membrosDados);
      setDiasEspeciais(diasEspeciaisData);
      setSabadosRemovidos(sabadosRemovidosData);
      setSabados(gerarSabadosMes(mesAtual));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setErro('Não foi possível carregar os dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [mesAtual]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function handleAdicionar(e) {
    e.preventDefault();
    if (!dataEscala || !membroSelecionado) return;

    setSalvando(true);
    try {
      const membro = membros.find((m) => m.id === membroSelecionado);
      if (!membro) throw new Error('Membro não encontrado');
      await adicionarEscala({
        data: new Date(dataEscala + 'T12:00:00'),
        membroId: membroSelecionado,
        nome: membro.nome,
        funcao: funcaoSelecionada,
      });
      setDataEscala('');
      setMembroSelecionado('');
      setFuncaoSelecionada('camera');
      await carregarDados();
    } catch (err) {
      console.error('Erro ao adicionar escala:', err);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar(id) {
    if (!confirm('Deseja realmente deletar esta escala?')) return;
    setDeletando(id);
    try {
      await deletarEscala(id);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      alert('Erro ao deletar. Tente novamente.');
    } finally {
      setDeletando(null);
    }
  }

  async function handleAdicionarDiaEspecial(e) {
    e.preventDefault();
    if (!dataDiaEspecial || !motivoDiaEspecial.trim()) return;

    setSalvandoDiaEspecial(true);
    try {
      await adicionarDiaEspecial({
        data: new Date(dataDiaEspecial + 'T12:00:00'),
        motivo: motivoDiaEspecial,
      });
      setDataDiaEspecial('');
      setMotivoDiaEspecial('');
      await carregarDados();
    } catch (err) {
      console.error('Erro ao adicionar dia especial:', err);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvandoDiaEspecial(false);
    }
  }

  async function handleDeletarDiaEspecial(id) {
    if (!confirm('Deseja realmente remover este dia especial?')) return;
    setDeletandoDiaEspecial(id);
    try {
      await deletarDiaEspecial(id);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao deletar dia especial:', err);
      alert('Erro ao deletar. Tente novamente.');
    } finally {
      setDeletandoDiaEspecial(null);
    }
  }

  async function handleAdicionarSabadoRemovido(e) {
    e.preventDefault();
    if (!dataSabadoRemovido || !motivoSabadoRemovido.trim()) return;

    setSalvandoSabadoRemovido(true);
    try {
      await adicionarSabadoRemovido({
        data: new Date(dataSabadoRemovido + 'T12:00:00'),
        motivo: motivoSabadoRemovido,
      });
      setDataSabadoRemovido('');
      setMotivoSabadoRemovido('');
      await carregarDados();
    } catch (err) {
      console.error('Erro ao adicionar sábado removido:', err);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvandoSabadoRemovido(false);
    }
  }

  async function handleDeletarSabadoRemovido(id) {
    if (!confirm('Deseja realmente remover este sábado da lista de removidos?')) return;
    setDeletandoSabadoRemovido(id);
    try {
      await deletarSabadoRemovido(id);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao deletar sábado removido:', err);
      alert('Erro ao deletar. Tente novamente.');
    } finally {
      setDeletandoSabadoRemovido(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Painel Admin</h1>
        <Link
          to="/admin/membros"
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 transition-colors"
        >
          👤 Membros
        </Link>
      </div>

      {/* Erro de carregamento */}
      {erro && (
        <div className="px-4 py-3 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm text-center">
          {erro}
          <button onClick={carregarDados} className="ml-2 underline hover:no-underline">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Navegação entre meses */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMesAtual((prev) => subMonths(prev, 1))}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-900/50 text-green-300 hover:bg-green-800/60 hover:text-white transition-all active:scale-95 border border-green-800/30"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <h2 className="text-base font-bold capitalize text-slate-100">
          {format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <button
          onClick={() => setMesAtual((prev) => addMonths(prev, 1))}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-900/50 text-green-300 hover:bg-green-800/60 hover:text-white transition-all active:scale-95 border border-green-800/30"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda - Adicionar Escala */}
        <div className="space-y-6">
          {/* Formulário - Adicionar Escala */}
          <form
            onSubmit={handleAdicionar}
            className="rounded-2xl border border-green-800/30 bg-green-950/30 p-4 space-y-4"
          >
            <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
              ➕ Nova Escala
            </h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="data" className="block text-xs font-medium text-slate-500 mb-1">
                  Data
                </label>
                <input
                  id="data"
                  type="date"
                  value={dataEscala}
                  onChange={(e) => setDataEscala(e.target.value)}
                  required
                  className="block w-full max-w-full appearance-none min-w-0 px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="membro" className="block text-xs font-medium text-slate-500 mb-1">
                  Voluntário
                </label>
                <select
                  id="membro"
                  value={membroSelecionado}
                  onChange={(e) => setMembroSelecionado(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm"
                >
                  <option value="">Selecione um voluntário</option>
                  {membros.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="funcao" className="block text-xs font-medium text-slate-500 mb-1">
                  Função
                </label>
                <select
                  id="funcao"
                  value={funcaoSelecionada}
                  onChange={(e) => setFuncaoSelecionada(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm"
                >
                  <option value="camera">📹 Câmera</option>
                  <option value="stories">📱 Stories</option>
                  <option value="apoio">🤝 Apoio</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="w-full px-4 py-3 rounded-xl font-semibold text-sm bg-green-700 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-green-700/25"
            >
              {salvando ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Salvando…
                </span>
              ) : (
                '+ Adicionar Escala'
              )}
            </button>
          </form>

          {/* Lista de escalas */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : escalas.length > 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">📋 Escalas do Mês</h3>
              {escalas.map((escala) => (
                <div
                  key={escala.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-800/30 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">
                      {format(escala.data, 'dd/MM/yyyy · EEEE', { locale: ptBR })}
                    </p>
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {escala.nome}
                    </p>
                    <span className="text-xs text-slate-400">
                      {escala.funcao === 'camera' ? '📹' : escala.funcao === 'stories' ? '📱' : '🤝'} {escala.funcao}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeletar(escala.id)}
                    disabled={deletando === escala.id}
                    className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 disabled:opacity-40 text-lg"
                    title="Deletar escala"
                  >
                    {deletando === escala.id ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      '🗑'
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 rounded-xl bg-slate-900/30 border border-slate-800">
              <span className="text-3xl">📭</span>
              <p className="text-slate-500 text-sm mt-2">Nenhuma escala neste mês</p>
            </div>
          )}
        </div>

        {/* Coluna Direita - Gerenciar Dias Especiais */}
        <div className="space-y-6">
          {/* Formulário - Adicionar Dia Especial */}
          <form
            onSubmit={handleAdicionarDiaEspecial}
            className="rounded-2xl border border-gold-800/30 bg-gold-950/30 p-4 space-y-4"
          >
            <h2 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">
              ✨ Adicionar Dia Especial
            </h2>
            <p className="text-xs text-gold-300/70">
              Use para marcar dias com escala obrigatória fora dos sábados (ex: Semana Santa, dia 19, etc)
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="data-esp" className="block text-xs font-medium text-slate-500 mb-1">
                  Data
                </label>
                <input
                  id="data-esp"
                  type="date"
                  value={dataDiaEspecial}
                  onChange={(e) => setDataDiaEspecial(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="motivo-esp" className="block text-xs font-medium text-slate-500 mb-1">
                  Motivo
                </label>
                <input
                  id="motivo-esp"
                  type="text"
                  placeholder="Ex: Semana Santa, Missa especial, Dia 19"
                  value={motivoDiaEspecial}
                  onChange={(e) => setMotivoDiaEspecial(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={salvandoDiaEspecial}
              className="w-full px-4 py-3 rounded-xl font-semibold text-sm bg-gold-700 text-white hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-gold-700/25"
            >
              {salvandoDiaEspecial ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Salvando…
                </span>
              ) : (
                '✨ Adicionar Dia Especial'
              )}
            </button>
          </form>

          {/* Lista de dias especiais */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-700/30 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : diasEspeciais.length > 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">✨ Dias Especiais do Mês</h3>
              {diasEspeciais.map((dia) => (
                <div
                  key={dia.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gold-900/30 bg-gold-950/20 text-sm"
                >
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">
                      {format(dia.data, 'dd/MM/yyyy · EEEE', { locale: ptBR })}
                    </p>
                    <p className="text-sm font-medium text-gold-300">
                      {dia.motivo}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletarDiaEspecial(dia.id)}
                    disabled={deletandoDiaEspecial === dia.id}
                    className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg text-gold-400/60 hover:text-gold-400 hover:bg-gold-500/10 transition-colors shrink-0 disabled:opacity-40 text-lg"
                    title="Remover dia especial"
                  >
                    {deletandoDiaEspecial === dia.id ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      '✕'
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 rounded-xl bg-slate-900/30 border border-slate-800">
              <span className="text-3xl">✅</span>
              <p className="text-slate-500 text-sm mt-2">Nenhum dia especial neste mês</p>
            </div>
          )}
        </div>

        {/* Coluna Direita - Gerenciar Sábados Removidos */}
        <div className="space-y-6">
          {/* Formulário - Remover Sábado */}
          <form
            onSubmit={handleAdicionarSabadoRemovido}
            className="rounded-2xl border border-red-800/30 bg-red-950/30 p-4 space-y-4"
          >
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
              ✕ Remover Sábado
            </h2>
            <p className="text-xs text-red-300/70">
              Use para remover sábados sem escala (ex: Feriado, sem culto, etc)
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="data-sab" className="block text-xs font-medium text-slate-500 mb-1">
                  Data
                </label>
                <input
                  id="data-sab"
                  type="date"
                  value={dataSabadoRemovido}
                  onChange={(e) => setDataSabadoRemovido(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="motivo-sab" className="block text-xs font-medium text-slate-500 mb-1">
                  Motivo
                </label>
                <input
                  id="motivo-sab"
                  type="text"
                  placeholder="Ex: Feriado, Sem culto"
                  value={motivoSabadoRemovido}
                  onChange={(e) => setMotivoSabadoRemovido(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={salvandoSabadoRemovido}
              className="w-full px-4 py-3 rounded-xl font-semibold text-sm bg-red-700 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-red-700/25"
            >
              {salvandoSabadoRemovido ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Salvando…
                </span>
              ) : (
                '✕ Remover Sábado'
              )}
            </button>
          </form>

          {/* Lista de sábados removidos */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-700/30 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : sabadosRemovidos.length > 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">✕ Sábados Removidos</h3>
              {sabadosRemovidos.map((sabado) => (
                <div
                  key={sabado.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-red-900/30 bg-red-950/20 text-sm"
                >
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">
                      {format(sabado.data, 'dd/MM/yyyy · EEEE', { locale: ptBR })}
                    </p>
                    <p className="text-sm font-medium text-red-300">
                      {sabado.motivo}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletarSabadoRemovido(sabado.id)}
                    disabled={deletandoSabadoRemovido === sabado.id}
                    className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 disabled:opacity-40 text-lg"
                    title="Remover sábado"
                  >
                    {deletandoSabadoRemovido === sabado.id ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      '✕'
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 rounded-xl bg-slate-900/30 border border-slate-800">
              <span className="text-3xl">✅</span>
              <p className="text-slate-500 text-sm mt-2">Todos os sábados estão ativos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
