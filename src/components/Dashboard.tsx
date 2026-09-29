import { useMemo } from 'react';
import {
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import type { Ticket } from '@/lib/supabase';
import { STATUS_LABELS, STATUS_DOT_COLORS, CATEGORY_LABELS } from '@/lib/supabase';
import { timeAgo } from '@/lib/format';
import { StatusBadge, PriorityBadge } from '@/components/Badges';

interface DashboardProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

export default function Dashboard({ tickets, onTicketClick }: DashboardProps) {
  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'aberto').length;
    const inProgress = tickets.filter((t) => t.status === 'em_andamento').length;
    const resolved = tickets.filter((t) => t.status === 'resolvido' || t.status === 'fechado').length;
    const critical = tickets.filter(
      (t) => t.priority === 'critica' && t.status !== 'fechado' && t.status !== 'resolvido'
    ).length;
    return { open, inProgress, resolved, critical, total: tickets.length };
  }, [tickets]);

  const byCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tickets) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tickets]);

  const recentTickets = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6),
    [tickets]
  );

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      aberto: 0,
      em_andamento: 0,
      aguardando: 0,
      resolvido: 0,
      fechado: 0,
    };
    for (const t of tickets) {
      counts[t.status] = (counts[t.status] || 0) + 1;
    }
    return counts;
  }, [tickets]);

  const maxCategory = Math.max(1, ...byCategory.map((c) => c[1]));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Chamados Abertos"
          value={stats.open}
          icon={<TicketIcon className="h-5 w-5" />}
          accent="blue"
        />
        <StatCard
          label="Em Andamento"
          value={stats.inProgress}
          icon={<Activity className="h-5 w-5" />}
          accent="amber"
        />
        <StatCard
          label="Resolvidos"
          value={stats.resolved}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          label="Críticos Pendentes"
          value={stats.critical}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            Distribuição por Status
          </h3>
          <div className="mt-4 space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status as keyof typeof STATUS_DOT_COLORS]}`} />
                      {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                    </span>
                    <span className="font-medium text-slate-900">{count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${STATUS_DOT_COLORS[status as keyof typeof STATUS_DOT_COLORS]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <TicketIcon className="h-4 w-4 text-slate-400" />
            Chamados por Categoria
          </h3>
          <div className="mt-4 space-y-3">
            {byCategory.length === 0 && (
              <p className="text-sm text-slate-400">Nenhum chamado ainda.</p>
            )}
            {byCategory.map(([cat, count]) => (
              <div key={cat}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}</span>
                  <span className="font-medium text-slate-900">{count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-700 transition-all duration-500"
                    style={{ width: `${(count / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent tickets */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Clock className="h-4 w-4 text-slate-400" />
            Chamados Recentes
          </h3>
          <div className="mt-4 space-y-2">
            {recentTickets.length === 0 && (
              <p className="text-sm text-slate-400">Nenhum chamado ainda.</p>
            )}
            {recentTickets.map((t) => (
              <button
                key={t.id}
                onClick={() => onTicketClick(t)}
                className="w-full rounded-lg border border-slate-100 p-3 text-left transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900 line-clamp-1">#{t.ticket_number} — {t.title}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">{timeAgo(t.created_at)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ACCENT_CLASSES: Record<string, { bg: string; text: string; iconBg: string }> = {
  blue: { bg: 'from-blue-50 to-white', text: 'text-blue-700', iconBg: 'bg-blue-100 text-blue-600' },
  amber: { bg: 'from-amber-50 to-white', text: 'text-amber-700', iconBg: 'bg-amber-100 text-amber-600' },
  emerald: { bg: 'from-emerald-50 to-white', text: 'text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-600' },
  red: { bg: 'from-red-50 to-white', text: 'text-red-700', iconBg: 'bg-red-100 text-red-600' },
};

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: keyof typeof ACCENT_CLASSES;
}) {
  const c = ACCENT_CLASSES[accent];
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${c.bg} p-5 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-1 text-3xl font-bold ${c.text}`}>{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
