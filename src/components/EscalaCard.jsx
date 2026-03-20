import { format, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const funcaoConfig = {
  camera: {
    label: 'Câmera',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: '📹',
  },
  stories: {
    label: 'Stories',
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    icon: '📱',
  },
  apoio: {
    label: 'Apoio',
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    icon: '🤝',
  },
};

export default function EscalaCard({ escala }) {
  const { data, nome, funcao } = escala;
  const config = funcaoConfig[funcao] || funcaoConfig.apoio;
  const isCurrentWeek = isThisWeek(data, { weekStartsOn: 0 });

  const dataFormatada = format(data, "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-300
        ${
          isCurrentWeek
            ? 'border-green-500/50 bg-green-500/5 shadow-lg shadow-green-500/10'
            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
        }
      `}
    >
      {isCurrentWeek && (
        <div className="absolute top-0 right-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-700 text-white rounded-bl-xl">
            Esta semana
          </span>
        </div>
      )}

      <div className="p-4 space-y-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {dataFormatada}
        </p>

        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-100">{nome}</h3>
          <span
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
              border ${config.bg} ${config.text} ${config.border}
            `}
          >
            <span>{config.icon}</span>
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
}
