import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import type { Ticket } from '@/lib/supabase';
import { exportTicketsCsv } from '@/lib/export';

interface ExportMenuProps {
  tickets: Ticket[];
}

export default function ExportMenu({ tickets }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleCsv() {
    exportTicketsCsv(tickets);
    setOpen(false);
  }

  function handlePdf() {
    window.print();
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative no-print">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="animate-scale-in absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
          <button
            onClick={handleCsv}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <div className="text-left">
              <p className="font-medium">Exportar CSV</p>
              <p className="text-xs text-slate-400">Planilha com todos os chamados</p>
            </div>
          </button>
          <button
            onClick={handlePdf}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <FileText className="h-4 w-4 text-red-600" />
            <div className="text-left">
              <p className="font-medium">Exportar PDF</p>
              <p className="text-xs text-slate-400">Imprimir ou salvar como PDF</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
