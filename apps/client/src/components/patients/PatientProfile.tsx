import type { PatientProfileProps } from '../../types/patient';
import {
  User,
  Calendar,
  Phone,
  Briefcase,
  Activity,
  FileText,
  ArrowRight,
  Video,
  Footprints,
  Mic,
  Edit2,
} from 'lucide-react';

export function PatientProfile({
  patient,
  onEdit,
  onVoiceDictation,
  onCaptureFootprint,
  onCaptureVideo,
  onSchedule,
}: PatientProfileProps) {
  const activeCase = patient.clinicalCases?.find((c) => c.status === 'active');
  const pastCases =
    patient.clinicalCases?.filter((c) => c.status !== 'active') || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
      case 'completed':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300';
      case 'inactive':
        return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300';
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300';
    }
  };

  const getAge = (birthDateString: string, age?: number) => {
    if (age) return age;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    const calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    return monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? calculatedAge - 1
      : calculatedAge;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header / Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {patient.name}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {getAge(patient.birthDate, patient.age)} años
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase size={14} />
                {patient.occupation}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={14} />
                {patient.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={onSchedule}
            className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Calendar size={18} />
            <span className="hidden sm:inline">Agendar Cita</span>
          </button>
          <button
            onClick={onEdit}
            className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 transition-colors"
          >
            <Edit2 size={18} />
            <span>Editar Perfil</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Case & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ActionCard
              icon={<Mic className="text-rose-500" />}
              label="Dictar Notas"
              onClick={onVoiceDictation}
            />
            <ActionCard
              icon={<Footprints className="text-amber-500" />}
              label="Capturar Huella"
              onClick={onCaptureFootprint}
            />
            <ActionCard
              icon={<Video className="text-sky-500" />}
              label="Video Postura"
              onClick={onCaptureVideo}
            />
            <ActionCard
              icon={<FileText className="text-emerald-500" />}
              label="Nueva Evaluación"
              onClick={() => {}}
            />
          </div>

          {/* Active Clinical Case */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="text-teal-500" size={20} />
                Caso Activo
              </h2>
              {activeCase && (
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                  En Tratamiento
                </span>
              )}
            </div>

            {activeCase ? (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  {activeCase.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {activeCase.consultationReason}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <MetricCard
                    label="Nivel de Dolor"
                    value={`${activeCase.evaluation?.painScale?.activity || 0}/10`}
                    sub="Escala EVA"
                  />
                  <MetricCard
                    label="Sesiones"
                    value={`${activeCase.treatmentSessions?.length || 0}/15`}
                    sub="Completadas"
                  />
                  <MetricCard
                    label="Índice Barthel"
                    value={`${activeCase.evaluation?.avdEvaluation?.barthel?.total || 0}/100`}
                    sub="Funcionalidad"
                  />
                </div>

                <div className="flex justify-end">
                  <button className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-medium hover:underline">
                    Ver Expediente Completo <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <FileText size={24} />
                </div>
                <h3 className="text-slate-900 dark:text-white font-medium">
                  No hay caso activo
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Este paciente no tiene un tratamiento en curso.
                </p>
                <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                  Crear Nuevo Caso
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: History */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 h-fit">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Historial Clínico
          </h2>

          <div className="space-y-4">
            {pastCases.length > 0 ? (
              pastCases.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-700 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(c.startDate).toLocaleDateString()}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${getStatusColor(c.status)}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-teal-600 transition-colors">
                    {c.title}
                  </h4>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                No hay casos anteriores.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all gap-3 h-32"
    >
      <div className="p-3 rounded-full bg-slate-50 dark:bg-slate-700 group-hover:bg-white transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
      <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
        {label}
      </span>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
        {value}
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500">{sub}</span>
    </div>
  );
}
