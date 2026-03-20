import { useEffect, useState, useCallback } from 'react';
import { format, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getEscalasPorMes, adicionarEscala } from '../firebase/escalas';
import { getMembrosAtivos } from '../firebase/membros';
import EscalaCard from '../components/EscalaCard';
import SkeletonCard from '../components/SkeletonCard';

export default function EscalaPage() {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [escalas, setEscalas] = useState([]);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulário de voluntário
  const [mostrarForm, setMostrarForm] = useState(false);
  const [dataEscala, setDataEscala] = useState('');
  const [membroSelecionado, setMembroSelecionado] = useState('');
  const [funcaoSelecionada, setFuncaoSelecionada] = useState('camera');
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

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

  function proximoMes() {
    setMesAtual((prev) => addMonths(prev, 1));
  }

  function mesAnterior() {
    setMesAtual((prev) => subMonths(prev, 1));
  }

  async function handlePreencher(e) {
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
      setMostrarForm(false);
      setMensagemSucesso('✅ Escala preenchida com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 4000);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao preencher escala:', err);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  function gerarTextoWhatsApp() {
    const hoje = new Date();
    const inicioSemana = startOfWeek(hoje, { weekStartsOn: 0 });
    const fimSemana = endOfWeek(hoje, { weekStartsOn: 0 });

    const escalaSemana = escalas.filter(
      (e) => e.data >= inicioSemana && e.data <= fimSemana
    );

    if (escalaSemana.length === 0) {
      return null;
    }

    const funcaoEmoji = { camera: '📹', stories: '📱', apoio: '🤝' };
    const funcaoLabel = { camera: 'Câmera', stories: 'Stories', apoio: 'Apoio' };

    let texto = '✝️ *Escala PASCOM*\n';
    texto += `📅 Semana de ${format(inicioSemana, "dd/MM", { locale: ptBR })} a ${format(fimSemana, "dd/MM", { locale: ptBR })}\n\n`;

    escalaSemana.forEach((e) => {
      const emoji = funcaoEmoji[e.funcao] || '🤝';
      const label = funcaoLabel[e.funcao] || e.funcao;
      texto += `${emoji} *${label}*: ${e.nome}\n`;
      texto += `   📆 ${format(e.data, "EEEE, d 'de' MMMM", { locale: ptBR })}\n\n`;
    });

    texto += '_Enviado via Web Escala PASCOM_';
    return texto;
  }

  function compartilharWhatsApp() {
    const texto = gerarTextoWhatsApp();
    if (!texto) {
      alert('Nenhuma escala encontrada para esta semana.');
      return;
    }
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

  const mesFormatado = format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Navegação entre meses */}
      <div className="flex items-center justify-between">
        <button
          onClick={mesAnterior}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-900/50 text-green-300 hover:bg-green-800/60 hover:text-white transition-all active:scale-95 border border-green-800/30"
          aria-label="Mês anterior"
        >
          ‹
        </button>

        <h1 className="text-lg font-bold capitalize text-slate-100">
          {mesFormatado}
        </h1>

        <button
          onClick={proximoMes}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-900/50 text-green-300 hover:bg-green-800/60 hover:text-white transition-all active:scale-95 border border-green-800/30"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2">
        <button
          onClick={compartilharWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all active:scale-[0.98]"
        >
          <span className="text-lg">💬</span>
          WhatsApp
        </button>

        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border transition-all active:scale-[0.98] ${
            mostrarForm
              ? 'bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30'
              : 'bg-amber-600/20 text-amber-400 border-amber-500/30 hover:bg-amber-600/30'
          }`}
        >
          <span className="text-lg">{mostrarForm ? '✕' : '✋'}</span>
          {mostrarForm ? 'Cancelar' : 'Preencher Escala'}
        </button>
      </div>

      {/* Mensagem de sucesso */}
      {mensagemSucesso && (
        <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center animate-pulse">
          {mensagemSucesso}
        </div>
      )}

      {/* Formulário do voluntário */}
      {mostrarForm && (
        <form
          onSubmit={handlePreencher}
          className="rounded-2xl border border-amber-700/30 bg-amber-950/20 p-4 space-y-4 animate-[fadeIn_0.2s_ease-out]"
        >
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
            📋 Preencher minha escala
          </h2>

          <div className="space-y-3">
            <div>
              <label htmlFor="vol-nome" className="block text-xs font-medium text-slate-500 mb-1">
                Seu nome
              </label>
              <select
                id="vol-nome"
                value={membroSelecionado}
                onChange={(e) => setMembroSelecionado(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm"
              >
                <option value="">Selecione seu nome</option>
                {membros.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="vol-data" className="block text-xs font-medium text-slate-500 mb-1">
                Data
              </label>
              <input
                id="vol-data"
                type="date"
                value={dataEscala}
                onChange={(e) => setDataEscala(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="vol-funcao" className="block text-xs font-medium text-slate-500 mb-1">
                Função
              </label>
              <select
                id="vol-funcao"
                value={funcaoSelecionada}
                onChange={(e) => setFuncaoSelecionada(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm"
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
            className="w-full px-4 py-3 rounded-xl font-semibold text-sm bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-amber-600/25"
          >
            {salvando ? 'Salvando…' : '✓ Confirmar minha escala'}
          </button>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Lista de escalas */}
      {!loading && escalas.length > 0 && (
        <div className="space-y-3">
          {escalas.map((escala) => (
            <EscalaCard key={escala.id} escala={escala} />
          ))}
        </div>
      )}

      {/* Sem escalas */}
      {!loading && escalas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <span className="text-5xl">📋</span>
          <p className="text-slate-500 text-center text-sm">
            Nenhuma escala cadastrada para{' '}
            <span className="font-medium capitalize text-slate-400">
              {mesFormatado}
            </span>
          </p>
          <button
            onClick={() => setMostrarForm(true)}
            className="mt-2 px-4 py-2 rounded-xl text-sm font-medium text-amber-400 bg-amber-600/10 border border-amber-500/20 hover:bg-amber-600/20 transition-colors"
          >
            ✋ Seja o primeiro a preencher!
          </button>
        </div>
      )}
    </div>
  );
}
