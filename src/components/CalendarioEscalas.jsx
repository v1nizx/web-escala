import { useState, useEffect } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { gerarSabadosMes, formatarDataBR, ehSabado, mesmaData } from '../utils/dateUtils';
import { getDiasEspeciaisMes, ehDiaEspecial, getSabadosRemovidosMes, ehSabadoRemovido } from '../firebase/excecoes';

export default function CalendarioEscalas({ mesAtual, escalas = [] }) {
  const [sabados, setSabados] = useState([]);
  const [diasEspeciais, setDiasEspeciais] = useState([]);
  const [sabadosRemovidos, setSabadosRemovidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        // Gera sábados do mês
        const sabadosMes = gerarSabadosMes(mesAtual);
        setSabados(sabadosMes);

        // Carrega dias especiais e sábados removidos do mês
        const [diasEspeciaisData, sabadosRemovidosData] = await Promise.all([
          getDiasEspeciaisMes(mesAtual),
          getSabadosRemovidosMes(mesAtual),
        ]);
        setDiasEspeciais(diasEspeciaisData);
        setSabadosRemovidos(sabadosRemovidosData);
      } catch (error) {
        console.error('Erro ao carregar calendário:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [mesAtual]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Agrupa escalas por data
  const escalasPorData = {};
  escalas.forEach((escala) => {
    const chave = formatarDataBR(escala.data);
    if (!escalasPorData[chave]) {
      escalasPorData[chave] = [];
    }
    escalasPorData[chave].push(escala);
  });

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900/50 to-gold-900/50 px-4 py-3 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100">📅 Datas com Escala Obrigatória</h2>
      </div>

      {/* Lista de sábados e dias especiais */}
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {sabados.length === 0 && diasEspeciais.length === 0 ? (
          <p className="text-slate-400 text-center py-4">Nenhuma data com escala neste mês</p>
        ) : (
          <>
            {/* Sábados */}
            {sabados.filter((sabado) => !ehSabadoRemovido(sabado, sabadosRemovidos)).length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-primary-400 uppercase mb-2">Sábados</h3>
                {sabados
                  .filter((sabado) => !ehSabadoRemovido(sabado, sabadosRemovidos))
                  .map((sabado) => {
                  const dataFormatada = formatarDataBR(sabado);
                  const temEscalas = escalas.filter(e => formatarDataBR(e.data) === dataFormatada) || [];

                  return (
                    <div
                      key={dataFormatada}
                      className={`p-3 rounded-lg border transition-all mb-2 ${
                        temEscalas.length > 0
                          ? 'bg-primary-950/30 border-primary-700/50'
                          : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                      }`}
                    >
                      {/* Data */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-100">
                          {format(sabado, "d 'de' MMMM", { locale: ptBR })}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-primary-700/50 text-primary-300">
                          Sábado
                        </span>
                      </div>

                      {/* Status */}
                      {temEscalas.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-sm text-primary-300 font-medium">✅ {temEscalas.length} preenchida(s)</p>
                          <div className="space-y-1">
                            {temEscalas.map((escala) => (
                              <div key={escala.id} className="text-xs text-slate-300 pl-2 border-l border-slate-600">
                                {escala.nome} - <span className="text-slate-400">{escala.funcao}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">Disponível para preencher</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dias Especiais */}
            {diasEspeciais.length > 0 && (
              <div>
                {diasEspeciais.map((dia) => {
                  const dataFormatada = formatarDataBR(dia.data);
                  const temEscalas = escalas.filter(e => formatarDataBR(e.data) === dataFormatada) || [];

                  return (
                    <div
                      key={dataFormatada}
                      className={`p-3 rounded-lg border transition-all mb-2 ${
                        temEscalas.length > 0
                          ? 'bg-gold-950/30 border-gold-700/50'
                          : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                      }`}
                    >
                      {/* Data */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-100">
                          {format(dia.data, "d 'de' MMMM", { locale: ptBR })}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-gold-700/50 text-gold-300">
                          {dia.motivo}
                        </span>
                      </div>

                      {/* Status */}
                      {temEscalas.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-sm text-gold-300 font-medium">✅ {temEscalas.length} preenchida(s)</p>
                          <div className="space-y-1">
                            {temEscalas.map((escala) => (
                              <div key={escala.id} className="text-xs text-slate-300 pl-2 border-l border-slate-600">
                                {escala.nome} - <span className="text-slate-400">{escala.funcao}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">Disponível para preencher</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
