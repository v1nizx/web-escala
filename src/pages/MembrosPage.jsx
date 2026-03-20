import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getTodosMembros,
  adicionarMembro,
  toggleMembroAtivo,
  deletarMembro,
} from '../firebase/membros';

export default function MembrosPage() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoNome, setNovoNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregarMembros() {
    setLoading(true);
    try {
      const dados = await getTodosMembros();
      setMembros(dados);
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarMembros();
  }, []);

  async function handleAdicionar(e) {
    e.preventDefault();
    if (!novoNome.trim()) return;

    setSalvando(true);
    try {
      await adicionarMembro(novoNome.trim());
      setNovoNome('');
      await carregarMembros();
    } catch (err) {
      console.error('Erro ao adicionar membro:', err);
    } finally {
      setSalvando(false);
    }
  }

  async function handleToggle(id, ativoAtual) {
    try {
      await toggleMembroAtivo(id, ativoAtual);
      await carregarMembros();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  }

  async function handleDeletar(id, nome) {
    if (!confirm(`Deseja realmente deletar o membro "${nome}"?`)) return;
    try {
      await deletarMembro(id);
      await carregarMembros();
    } catch (err) {
      console.error('Erro ao deletar membro:', err);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Voluntários</h1>
        <Link
          to="/admin"
          className="text-sm font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          ← Voltar
        </Link>
      </div>

      {/* Formulário */}
      <form
        onSubmit={handleAdicionar}
        className="flex gap-2"
      >
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome do voluntário"
          required
          className="flex-1 px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm"
        />
        <button
          type="submit"
          disabled={salvando}
          className="px-5 py-3 rounded-xl font-semibold text-sm bg-green-700 text-white hover:bg-green-600 disabled:opacity-50 transition-all active:scale-[0.98] shrink-0"
        >
          {salvando ? '…' : '+'}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Lista de membros */}
      {!loading && membros.length > 0 && (
        <div className="space-y-2">
          {membros.map((membro) => (
            <div
              key={membro.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                membro.ativo
                  ? 'border-slate-800 bg-slate-900/50'
                  : 'border-slate-800/50 bg-slate-900/20 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    membro.ativo ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                />
                <span
                  className={`text-sm font-medium truncate ${
                    membro.ativo ? 'text-slate-200' : 'text-slate-500 line-through'
                  }`}
                >
                  {membro.nome}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggle(membro.id, membro.ativo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    membro.ativo
                      ? 'text-amber-400 hover:bg-amber-500/10'
                      : 'text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  {membro.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => handleDeletar(membro.id, membro.nome)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Deletar membro"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sem membros */}
      {!loading && membros.length === 0 && (
        <div className="text-center py-10">
          <span className="text-4xl">👤</span>
          <p className="text-slate-500 text-sm mt-2">
            Nenhum voluntário cadastrado
          </p>
        </div>
      )}
    </div>
  );
}
