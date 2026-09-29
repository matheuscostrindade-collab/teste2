import type { Ticket } from '@/lib/supabase';
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from '@/lib/supabase';
import { formatDate } from '@/lib/format';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportTicketsCsv(tickets: Ticket[]): void {
  const headers = [
    'Número',
    'Título',
    'Descrição',
    'Solicitante',
    'E-mail',
    'Departamento',
    'Categoria',
    'Prioridade',
    'Status',
    'Responsável',
    'Criado em',
    'Atualizado em',
  ];

  const rows = tickets.map((t) =>
    [
      `#${t.ticket_number}`,
      t.title,
      t.description,
      t.requester_name,
      t.requester_email,
      t.requester_department,
      CATEGORY_LABELS[t.category],
      PRIORITY_LABELS[t.priority],
      STATUS_LABELS[t.status],
      t.assigned_to,
      formatDate(t.created_at),
      formatDate(t.updated_at),
    ]
      .map(escapeCsv)
      .join(',')
  );

  const csv = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `chamados_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
