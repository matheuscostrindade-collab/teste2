import { useState, useEffect, useCallback } from 'react';
import {
  X,
  ArrowLeft,
  Send,
  User,
  Mail,
  Building2,
  Calendar,
  Clock,
  UserCog,
  MessageSquare,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import type { Ticket, TicketUpdate, TicketStatus, TicketPriority, TicketCategory } from '@/lib/supabase';
import {
  ALL_STATUSES,
  ALL_PRIORITIES,
  ALL_CATEGORIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  STATUS_DOT_COLORS,
  PRIORITY_DOT_COLORS,
} from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { formatDate, timeAgo } from '@/lib/format';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/Badges';

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  onTicketUpdated: (ticket: Ticket) => void;
  onTicketDeleted: () => void;
}

export default function TicketDetail({ ticket, onClose, onTicketUpdated, onTicketDeleted }: TicketDetailProps) {
  const [updates, setUpdates] = useState<TicketUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateText, setUpdateText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [statusChange, setStatusChange] = useState<TicketStatus | ''>('');
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [category, setCategory] = useState<TicketCategory>(ticket.category);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadUpdates = useCallback(async () => {
    const { data, error } = await supabase
      .from('ticket_updates')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError('Não foi possível carregar o histórico.');
      return;
    }
    setUpdates(data || []);
  }, [ticket.id]);

  useEffect(() => {
    setLoading(true);
    loadUpdates().finally(() => setLoading(false));
  }, [loadUpdates]);

  async function handleAddUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!updateText.trim() || !authorName.trim()) {
      setError('Preencha seu nome e a mensagem.');
      return;
    }

    setSubmitting(true);
    try {
      const newUpdate: Omit<TicketUpdate, 'id' | 'created_at'> = {
        ticket_id: ticket.id,
        author_name: authorName.trim(),
        content: updateText.trim(),
        new_status: statusChange || null,
      };

      const { data: updateData, error: updateError } = await supabase
        .from('ticket_updates')
        .insert(newUpdate)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatesToApply: Partial<Ticket> = { updated_at: new Date().toISOString() };
      if (statusChange) updatesToApply.status = statusChange as TicketStatus;
      if (assignedTo !== ticket.assigned_to) updatesToApply.assigned_to = assignedTo;
      if (priority !== ticket.priority) updatesToApply.priority = priority;
      if (category !== ticket.category) updatesToApply.category = category;

      const { data: updatedTicket, error: ticketError } = await supabase
        .from('tickets')
        .update(updatesToApply)
        .eq('ticket.id', ticket.id)
        .select()
        .single();

      if (ticketError) throw ticketError;

      setUpdates((prev) => [updateData as TicketUpdate, ...prev]);
      onTicketUpdated(updatedTicket as Ticket);
      setUpdateText('');
      setStatusChange('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar atualização.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('tickets').delete().eq('id', ticket.id);
      if (error) throw error;
      onTicketDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir chamado.');
      setSubmitting(false);
      setConfirmDelete(false);
    }
  }

  const infoRow = 'flex items-center gap-2.5 text-sm text-slate-600';

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-slate-900/40 backdrop-blur-sm">
      <div className="animate-slide-in flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <span className="font-mono text-xs text-slate-400">#{ticket.ticket_number}</span>
              <h2 className="text-lg font-semibold text-slate-900">{ticket.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <CategoryBadge category={ticket.category} />
          </div>

          {/* Description */}
          {ticket.description && (
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Descrição</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-600">{ticket.description}</p>
            </div>
          )}

          {/* Requester info */}
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-100 p-4 sm:grid-cols-2">
            <div className={infoRow}>
              <User className="h-4 w-4 text-slate-400" />
              {ticket.requester_name}
            </div>
            <div className={infoRow}>
              <Mail className="h-4 w-4 text-slate-400" />
              {ticket.requester_email}
            </div>
            <div className={infoRow}>
              <Building2 className="h-4 w-4 text-slate-400" />
              {ticket.requester_department || '—'}
            </div>
            <div className={infoRow}>
              <Calendar className="h-4 w-4 text-slate-400" />
              {formatDate(ticket.created_at)}
            </div>
            {ticket.assigned_to && (
              <div className={infoRow}>
                <UserCog className="h-4 w-4 text-slate-400" />
                {ticket.assigned_to}
              </div>
            )}
            <div className={infoRow}>
              <Clock className="h-4 w-4 text-slate-400" />
              Atualizado {timeAgo(ticket.updated_at)}
            </div>
          </div>

          {/* Editable fields */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Alterar Status</label>
              <select
                value={statusChange || ticket.status}
                onChange={(e) => setStatusChange(e.target.value as TicketStatus | '')}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {ALL_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Responsável (técnico)</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Atribuir a..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Updates / Timeline */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              Histórico de Atualizações ({updates.length})
            </h3>

            {loading ? (
              <div className="mt-3 space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : updates.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                Nenhuma atualização ainda. Seja o primeiro a comentar.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {updates.map((u) => (
                  <div key={u.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">{u.author_name}</span>
                      <span className="text-xs text-slate-400">{timeAgo(u.created_at)}</span>
                    </div>
                    {u.new_status && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_COLORS[u.new_status]}`} />
                        Status alterado para: <strong className="font-medium">{STATUS_LABELS[u.new_status]}</strong>
                      </div>
                    )}
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{u.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add update form */}
        <div className="border-t border-slate-100 px-6 py-4">
          <form onSubmit={handleAddUpdate} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Seu nome"
                className="w-40 shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <input
                type="text"
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                placeholder="Adicionar comentário ou atualização..."
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {statusChange && (
              <p className="text-xs text-slate-500">
                Status será alterado para: <strong>{STATUS_LABELS[statusChange as TicketStatus]}</strong>
              </p>
            )}
          </form>

          {/* Delete */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Excluir este chamado?</span>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-red-700"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Excluir chamado
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
