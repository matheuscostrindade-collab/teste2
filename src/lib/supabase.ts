import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TicketStatus = 'aberto' | 'em_andamento' | 'aguardando' | 'resolvido' | 'fechado';
export type TicketPriority = 'baixa' | 'media' | 'alta' | 'critica';
export type TicketCategory = 'hardware' | 'software' | 'rede' | 'acesso' | 'outro';

export interface Ticket {
  id: string;
  ticket_number: number;
  title: string;
  description: string;
  requester_name: string;
  requester_email: string;
  requester_department: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export interface TicketUpdate {
  id: string;
  ticket_id: string;
  author_name: string;
  content: string;
  new_status: TicketStatus | null;
  created_at: string;
}

export interface TicketInsert {
  title: string;
  description: string;
  requester_name: string;
  requester_email: string;
  requester_department: string;
  category: TicketCategory;
  priority: TicketPriority;
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em Andamento',
  aguardando: 'Aguardando',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  aberto: 'bg-blue-100 text-blue-700 border-blue-200',
  em_andamento: 'bg-amber-100 text-amber-700 border-amber-200',
  aguardando: 'bg-purple-100 text-purple-700 border-purple-200',
  resolvido: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  fechado: 'bg-gray-200 text-gray-600 border-gray-300',
};

export const STATUS_DOT_COLORS: Record<TicketStatus, string> = {
  aberto: 'bg-blue-500',
  em_andamento: 'bg-amber-500',
  aguardando: 'bg-purple-500',
  resolvido: 'bg-emerald-500',
  fechado: 'bg-gray-400',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  baixa: 'bg-gray-100 text-gray-600 border-gray-200',
  media: 'bg-blue-100 text-blue-700 border-blue-200',
  alta: 'bg-orange-100 text-orange-700 border-orange-200',
  critica: 'bg-red-100 text-red-700 border-red-200',
};

export const PRIORITY_DOT_COLORS: Record<TicketPriority, string> = {
  baixa: 'bg-gray-400',
  media: 'bg-blue-500',
  alta: 'bg-orange-500',
  critica: 'bg-red-500',
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  hardware: 'Hardware',
  software: 'Software',
  rede: 'Rede',
  acesso: 'Acesso',
  outro: 'Outro',
};

export const ALL_STATUSES: TicketStatus[] = ['aberto', 'em_andamento', 'aguardando', 'resolvido', 'fechado'];
export const ALL_PRIORITIES: TicketPriority[] = ['baixa', 'media', 'alta', 'critica'];
export const ALL_CATEGORIES: TicketCategory[] = ['hardware', 'software', 'rede', 'acesso', 'outro'];
