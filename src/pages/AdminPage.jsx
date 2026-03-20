import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getEscalasPorMes, adicionarEscala, deletarEscala } from '../firebase/escalas';
import { getMembrosAtivos } from '../firebase/membros';
import SkeletonCard from '../components/SkeletonCard';

const funcaoConfig = {
  camera: { label: 'Câmera', icon: '📹', color: 'text-blue-400' },
  stories: { label: 'Stories', icon: '📱', color: 'text-purple-400' },
  apoio: { label: 'Apoio', icon: '🤝', color: 'text-slate-400' },
};

export default function AdminPage() {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [escalas, setEscalas] = useState([]);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Form state
  const [dataEscala, setDataEscala] = useState('');
  const [membroSelecionado, setMembroSelecionado] = useState('');
  const [funcaoSelecionada, setFuncaoSelecionada] = useState('camera');

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [escalasDados, membrosDados] = await Promise.all([
        getEscalasPorMes(mesAtual),
        getMembrosAtivos(),
      ]);
      setEscalas(escalasDados);
      setMembros(membrosDados);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
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
    try {
      await deletarEscala(id);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao deletar:', err);
    }
  }

  const mesFormatado = format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Painel Admin</h1>
        <Link
          to="/admin/membros"
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
        >
          👤 Membros
        </Link>
      </div>

      {/* Formulário */}
      <form
        onSubmit={handleAdicionar}
        className="rounded-2xl border border-green-800/30 bg-green-950/30 p-4 space-y-4"
      >
        <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
          Nova Escala
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
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm"
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
          {salvando ? 'Salvando…' : '+ Adicionar Escala'}
        </button>
      </form>

      {/* Navegação entre meses */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMesAtual((prev) => subMonths(prev, 1))}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-900/50 text-green-300 hover:bg-green-800/60 hover:text-white transition-all active:scale-95 border border-green-800/30"
        >
          ‹
        </button>
        <h2 className="text-base font-bold capitalize text-slate-100">
          {mesFormatado}
        </h2>
        <button
          onClick={() => setMesAtual((prev) => addMonths(prev, 1))}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-900/50 text-green-300 hover:bg-green-800/60 hover:text-white transition-all active:scale-95 border border-green-800/30"
        >
          ›
        </button>
      </div>

      {/* Lista de escalas do mês */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : escalas.length > 0 ? (
        <div className="space-y-2">
          {escalas.map((escala) => {
            const config = funcaoConfig[escala.funcao] || funcaoConfig.apoio;
            return (
              <div
                key={escala.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">
                    {format(escala.data, "dd/MM/yyyy · EEEE", { locale: ptBR })}
                  </p>
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {escala.nome}
                  </p>
                  <span className={`text-xs font-medium ${config.color}`}>
                    {config.icon} {config.label}
                  </span>
                </div>
                <button
                  onClick={() => handleDeletar(escala.id)}
                  className="ml-3 w-9 h-9 flex items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Deletar escala"
                >
                  🗑
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <span className="text-4xl">📭</span>
          <p className="text-slate-500 text-sm mt-2">
            Nenhuma escala neste mês
          </p>
        </div>
      )}
    </div>
  );
}
