import { LifeBuoy, ArrowRight, Ticket as TicketIcon, TrendingUp, MessageSquare, ShieldCheck } from 'lucide-react';

interface WelcomeProps {
  onEnter: () => void;
}

export default function Welcome({ onEnter }: WelcomeProps) {
  const features = [
    {
      icon: <TicketIcon className="h-5 w-5" />,
      title: 'Abertura de Chamados',
      desc: 'Registre solicitações de suporte com categorias e prioridades',
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Acompanhamento',
      desc: 'Acompanhe o status e o histórico de cada chamado em tempo real',
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: 'Atualizações',
      desc: 'Adicione comentários e mantenha todos informados sobre o progresso',
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: 'Organização',
      desc: 'Filtre por status, prioridade e categoria para encontrar o que precisa',
    },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-12">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-slate-500/10 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Logo + title */}
        <div className="animate-fade-in flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <LifeBuoy className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Portal de Chamados
          </h1>
          <p className="mt-3 max-w-lg text-base text-slate-400 sm:text-lg">
            Sistema de suporte e atendimento do setor. Abra chamados, acompanhe o progresso e mantenha tudo organizado em um só lugar.
          </p>
        </div>

        {/* Feature cards */}
        <div className="animate-fade-in mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2" style={{ animationDelay: '0.1s' }}>
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                <p className="mt-0.5 text-sm text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div className="animate-fade-in mt-10 flex flex-col items-center" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={onEnter}
            className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-slate-900 transition-all hover:bg-slate-100 active:scale-95"
          >
            Acessar o Portal
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="mt-4 text-xs text-slate-500">
            Entre para visualizar e gerenciar os chamados do setor
          </p>
        </div>
      </div>
    </div>
  );
}
