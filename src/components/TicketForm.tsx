import { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import type { TicketInsert, TicketPriority, TicketCategory } from '@/lib/supabase';
import {
  ALL_PRIORITIES,
  ALL_CATEGORIES,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  PRIORITY_DOT_COLORS,
} from '@/lib/supabase';

interface TicketFormProps {
  onSubmit: (data: TicketInsert) => Promise<void>;
  onClose: () => void;
}

export default function TicketForm({ onSubmit, onClose }: TicketFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterDepartment, setRequesterDepartment] = useState('');
  const [category, setCategory] = useState<TicketCategory>('hardware');
  const [priority, setPriority] = useState<TicketPriority>('media');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !requesterName.trim() || !requesterEmail.trim()) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        requester_name: requesterName.trim(),
        requester_email: requesterEmail.trim(),
        requester_department: requesterDepartment.trim(),
        category,
        priority,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar chamado.');
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200';
  const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6">
      <div className="animate-scale-in mt-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Novo Chamado</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className={labelClass}>
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descreva o problema em poucas palavras"
              className={fieldClass}
              maxLength={120}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Descrição Detalhada</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Forneça detalhes do problema, quando ocorreu, mensagens de erro, etc."
              rows={4}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Nome do Solicitante <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Nome completo"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                placeholder="email@empresa.com"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Departamento</label>
            <input
              type="text"
              value={requesterDepartment}
              onChange={(e) => setRequesterDepartment(e.target.value)}
              placeholder="Ex: Financeiro, RH, TI..."
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Categoria</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      category === cat
                        ? 'border-slate-800 bg-slate-800 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Prioridade</label>
              <div className="space-y-2">
                {ALL_PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      priority === p
                        ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT_COLORS[p]}`} />
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Enviando...' : 'Abrir Chamado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
