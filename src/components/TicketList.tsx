import { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  Inbox,
  X,
  Plus,
} from 'lucide-react';
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/lib/supabase';
import {
  ALL_STATUSES,
  ALL_PRIORITIES,
  ALL_CATEGORIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
} from '@/lib/supabase';
import { formatDate, timeAgo } from '@/lib/format';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/Badges';

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onCreateClick: () => void;
}

type FilterType = 'status' | 'priority' | 'category';

export default function TicketList({ tickets, onTicketClick, onCreateClick }: TicketListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return tickets
      .filter((t) => {
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.requester_name.toLowerCase().includes(q) ||
            t.requester_email.toLowerCase().includes(q) ||
            `#${t.ticket_number}`.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter]);

  const activeFilterCount =
    (statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0);

  function clearFilters() {
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, solicitante, nº..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${
              activeFilterCount > 0
                ? 'border-slate-800 bg-slate-800 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="ml-0.5 rounded-full bg-white/20 px-1.5 text-xs">{activeFilterCount}</span>
            )}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Novo Chamado
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="animate-fade-in rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as TicketStatus | 'all')}
              options={[{ value: 'all', label: 'Todos' }, ...ALL_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))]}
            />
            <FilterSelect
              label="Prioridade"
              value={priorityFilter}
              onChange={(v) => setPriorityFilter(v as TicketPriority | 'all')}
              options={[{ value: 'all', label: 'Todas' }, ...ALL_PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))]}
            />
            <FilterSelect
              label="Categoria"
              value={categoryFilter}
              onChange={(v) => setCategoryFilter(v as TicketCategory | 'all')}
              options={[{ value: 'all', label: 'Todas' }, ...ALL_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))]}
            />
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-slate-500 hover:text-slate-700"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-slate-500">
        {filtered.length} {filtered.length === 1 ? 'chamado encontrado' : 'chamados encontrados'}
      </p>

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16">
          <Inbox className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm font-medium text-slate-600">Nenhum chamado encontrado</p>
          <p className="mt-1 text-sm text-slate-400">Tente ajustar a busca ou os filtros.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onTicketClick(ticket)}
              className="group w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-slate-400">#{ticket.ticket_number}</span>
                    <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-slate-700">
                      {ticket.title}
                    </h3>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-500">{ticket.description || 'Sem descrição'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <CategoryBadge category={ticket.category} />
                  </div>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs font-medium text-slate-600">{ticket.requester_name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{ticket.requester_department || '—'}</p>
                  <p className="mt-1.5 text-xs text-slate-400">{timeAgo(ticket.updated_at)}</p>
                </div>
              </div>
              {ticket.assigned_to && (
                <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-400">
                  Responsável: <span className="font-medium text-slate-600">{ticket.assigned_to}</span>
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
