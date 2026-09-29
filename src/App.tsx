import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, ListFilter, LifeBuoy, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Ticket, TicketInsert } from '@/lib/supabase';
import Dashboard from '@/components/Dashboard';
import TicketList from '@/components/TicketList';
import TicketForm from '@/components/TicketForm';
import TicketDetail from '@/components/TicketDetail';
import Welcome from '@/components/Welcome';
import ExportMenu from '@/components/ExportMenu';

type View = 'dashboard' | 'tickets';

export default function App() {
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setLoadError('Não foi possível carregar os chamados. Tente novamente.');
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (entered) loadTickets();
  }, [entered, loadTickets]);

  async function handleCreateTicket(data: TicketInsert) {
    const { data: newTicket, error } = await supabase
      .from('tickets')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    setTickets((prev) => [newTicket as Ticket, ...prev]);
    setShowForm(false);
    setSelectedTicket(newTicket as Ticket);
  }

  function handleTicketUpdated(updated: Ticket) {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTicket(updated);
  }

  function handleTicketDeleted() {
    if (selectedTicket) {
      setTickets((prev) => prev.filter((t) => t.id !== selectedTicket.id));
    }
    setSelectedTicket(null);
  }

  const navItems = [
    { id: 'dashboard' as View, label: 'Painel', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'tickets' as View, label: 'Chamados', icon: <ListFilter className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {!entered ? (
        <Welcome onEnter={() => setEntered(true)} />
      ) : (
        <>
      {/* Header */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Portal de Chamados</h1>
              <p className="hidden text-xs text-slate-400 sm:block">Sistema de suporte do setor</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  view === item.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="no-print flex items-center gap-2">
            <ExportMenu tickets={tickets} />
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Chamado</span>
            </button>
          </div>
        </div>
      </header>

      {/* Print-only header */}
      <div className="hidden print:block px-6 py-4 border-b border-slate-300">
        <h1 className="text-xl font-bold text-slate-900">Portal de Chamados — {view === 'dashboard' ? 'Painel' : 'Lista de Chamados'}</h1>
        <p className="text-sm text-slate-500">Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {loadError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
            <button onClick={loadTickets} className="ml-2 underline">
              Tentar novamente
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200/60" />
              ))}
            </div>
          </div>
        ) : view === 'dashboard' ? (
          <Dashboard tickets={tickets} onTicketClick={setSelectedTicket} />
        ) : (
          <TicketList
            tickets={tickets}
            onTicketClick={setSelectedTicket}
            onCreateClick={() => setShowForm(true)}
          />
        )}
      </main>

      {/* Modals */}
      <div className="no-print">
      {showForm && (
        <TicketForm onSubmit={handleCreateTicket} onClose={() => setShowForm(false)} />
      )}

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={handleTicketUpdated}
          onTicketDeleted={handleTicketDeleted}
        />
      )}
      </div>
        </>
      )}
    </div>
  );
}
