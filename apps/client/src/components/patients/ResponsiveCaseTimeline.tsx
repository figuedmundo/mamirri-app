import { useState } from 'react';
import type { ClinicalCase } from '../../types/patient';
import { CaseTimeline } from './CaseTimeline';
import { useBreakpointFlags } from '../../hooks/use-breakpoint';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CalendarDays } from 'lucide-react';

interface ResponsiveCaseTimelineProps {
  clinicalCase: ClinicalCase;
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
}

export function ResponsiveCaseTimeline({
  clinicalCase,
  activeSessionId,
  onSelectSession,
}: ResponsiveCaseTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDesktop } = useBreakpointFlags();

  if (isDesktop) {
    return (
      <CaseTimeline
        clinicalCase={clinicalCase}
        activeSessionId={activeSessionId}
        onSelectSession={onSelectSession}
      />
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 h-14 w-14 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xl flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Ver línea de tiempo"
      >
        <CalendarDays size={24} />
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-5 border-b border-slate-200 dark:border-slate-800">
            <SheetTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Línea de Tiempo
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(100vh-60px)]">
            <CaseTimeline
              clinicalCase={clinicalCase}
              activeSessionId={activeSessionId}
              onSelectSession={(id) => {
                onSelectSession(id);
                setIsOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
