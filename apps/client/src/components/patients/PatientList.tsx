import type { PatientListProps, Patient } from '../../types/patient';
import { getActiveEvaluation } from '../../lib/evaluation-utils';
import {
  Search,
  Plus,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Activity,
} from 'lucide-react';
import { useState, useTransition } from 'react';

const getAge = (birthDateString: string) => {
  if (!birthDateString) return 0;
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let calculatedAge = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    calculatedAge--;
  }
  return calculatedAge >= 0 ? calculatedAge : 0;
};

export function PatientList({
  patients,
  onView,
  onCreate,
  onEdit,
  onDelete,
  onSchedule,
}: PatientListProps) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'active' | 'recent' | 'today'
  >('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    startTransition(() => {
      setSearchTerm(value);
    });
  };

  const handleFilterChange = (
    filter: 'all' | 'active' | 'recent' | 'today',
  ) => {
    startTransition(() => {
      setActiveFilter(filter);
    });
  };

  const filteredPatients = (patients || []).filter((patient) => {
    const matchesSearch = patient.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'active' && patient.isActive) ||
      (activeFilter === 'recent' && isRecent(patient.createdAt)) ||
      (activeFilter === 'today' && hasAppointmentToday(patient));
    return matchesSearch && matchesFilter;
  });

  function isRecent(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  }

  function hasAppointmentToday(patient: Patient): boolean {
    const today = new Date().toDateString();
    return (
      patient.clinicalCases?.some(
        (clinicalCase) =>
          clinicalCase.status === 'active' &&
          clinicalCase.treatmentSessions?.some(
            (session) => new Date(session.date).toDateString() === today,
          ),
      ) ?? false
    );
  }

  const getFilterClasses = (_filter: string, isActive: boolean) => {
    const baseClasses =
      'px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap text-sm';
    const activeClasses =
      'bg-teal-600 text-white shadow-md border border-teal-600';
    const inactiveClasses =
      'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700';

    return isActive
      ? `${baseClasses} ${activeClasses}`
      : `${baseClasses} ${inactiveClasses}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pacientes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gestión de expedientes y seguimiento clínico
          </p>
        </div>

        {onCreate && (
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 transition-all hover:scale-105 active:scale-95 font-medium"
          >
            <Plus size={20} />
            <span>Nuevo Paciente</span>
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, ID o teléfono..."
            defaultValue={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-sm"
          />
          {isPending && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
          <button
            onClick={() => handleFilterChange('all')}
            className={getFilterClasses('all', activeFilter === 'all')}
          >
            Todos
          </button>
          <button
            onClick={() => handleFilterChange('active')}
            className={getFilterClasses('active', activeFilter === 'active')}
          >
            Activos
          </button>
          <button
            onClick={() => handleFilterChange('recent')}
            className={getFilterClasses('recent', activeFilter === 'recent')}
          >
            Recientes
          </button>
          <button
            onClick={() => handleFilterChange('today')}
            className={getFilterClasses('today', activeFilter === 'today')}
          >
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              Cita hoy
            </span>
          </button>
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <EmptyState
          hasPatients={(patients || []).length > 0}
          searchTerm={searchTerm}
          activeFilter={activeFilter}
          onCreate={onCreate}
          onClearSearch={() => setSearchTerm('')}
          onClearFilter={() => setActiveFilter('all')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => {
            const activeCase = patient.clinicalCases?.find(
              (c) => c.status === 'active',
            );
            const activeEvaluation = activeCase
              ? getActiveEvaluation(activeCase)
              : undefined;
            const painLevel = activeEvaluation?.painScale?.activity || 0;
            const lastSession =
              activeCase?.treatmentSessions?.[
                activeCase.treatmentSessions.length - 1
              ];

            return (
              <div
                key={patient.id}
                onClick={() => onView?.(patient.id)}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-teal-500/30 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
              >
                <div
                  className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${activeCase ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                />

                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4 pl-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {patient.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {getAge(patient.birthDate)} años • {patient.occupation}
                      </p>
                    </div>
                    {patient.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                        Inactivo
                      </span>
                    )}
                  </div>

                  {activeCase ? (
                    <div className="mb-4 pl-3">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Activity size={12} />
                        Caso Activo
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <p className="font-medium text-slate-700 dark:text-slate-200 line-clamp-1 mb-2">
                          {activeCase.title}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-center border border-slate-100 dark:border-slate-700">
                            <span className="block text-[10px] text-slate-400 uppercase">
                              Dolor
                            </span>
                            <div className="flex items-center justify-center gap-1">
                              <span
                                className={`text-lg font-bold ${painLevel > 5 ? 'text-rose-500' : 'text-emerald-500'}`}
                              >
                                {painLevel}
                              </span>
                              <span className="text-xs text-slate-400">
                                /10
                              </span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-center border border-slate-100 dark:border-slate-700">
                            <span className="block text-[10px] text-slate-400 uppercase">
                              Sesiones
                            </span>
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-lg font-bold text-sky-500">
                                {activeCase.treatmentSessions?.length || 0}
                              </span>
                              <span className="text-xs text-slate-400">
                                /15
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-3 mb-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                      <p className="text-sm text-slate-400 italic">
                        Sin caso activo actualmente
                      </p>
                    </div>
                  )}

                  {lastSession && (
                    <div className="pl-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <Clock size={12} />
                      <span>Última visita: {formatDate(lastSession.date)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-5 py-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSchedule?.(patient.id);
                    }}
                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Agendar cita"
                  >
                    <Calendar size={16} />
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(patient.id);
                      }}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(patient.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function EmptyState({
  hasPatients,
  searchTerm,
  activeFilter,
  onCreate,
  onClearSearch,
  onClearFilter,
}: {
  hasPatients: boolean;
  searchTerm: string;
  activeFilter: 'all' | 'active' | 'recent' | 'today';
  onCreate?: () => void;
  onClearSearch: () => void;
  onClearFilter: () => void;
}) {
  if (!hasPatients) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-teal-50 to-sky-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl border-2 border-dashed border-teal-200 dark:border-teal-800">
        <div className="w-20 h-20 mx-auto mb-5 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-lg shadow-teal-100 dark:shadow-none">
          <Plus className="text-teal-500" size={36} />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Comienza agregando tu primer paciente
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          Tu lista de pacientes está vacía. Agrega un nuevo paciente para
          empezar a gestionar sus expedientes clínicos.
        </p>
        {onCreate && (
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 transition-all hover:scale-105 active:scale-95 font-medium"
          >
            <Plus size={20} />
            Agregar Primer Paciente
          </button>
        )}
      </div>
    );
  }

  if (searchTerm) {
    return (
      <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
        <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
          <Search className="text-slate-300 dark:text-slate-600" size={28} />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
          Sin resultados para "{searchTerm}"
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
          No encontramos pacientes que coincidan con tu búsqueda. Intenta con
          otro término.
        </p>
        <button
          onClick={onClearSearch}
          className="inline-flex items-center gap-2 px-4 py-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg font-medium transition-colors"
        >
          Limpiar búsqueda
        </button>
      </div>
    );
  }

  const filterLabels: Record<string, string> = {
    active: 'activos',
    recent: 'recientes',
    today: 'con cita hoy',
  };

  return (
    <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
      <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
        <Activity className="text-slate-300 dark:text-slate-600" size={28} />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
        No hay pacientes {filterLabels[activeFilter]}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
        {activeFilter === 'active' &&
          'No tienes pacientes con casos activos en este momento.'}
        {activeFilter === 'recent' &&
          'No tienes pacientes agregados en los últimos 30 días.'}
        {activeFilter === 'today' &&
          'No tienes pacientes con cita programada para hoy.'}
      </p>
      <button
        onClick={onClearFilter}
        className="inline-flex items-center gap-2 px-4 py-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg font-medium transition-colors"
      >
        Ver todos los pacientes
      </button>
    </div>
  );
}
