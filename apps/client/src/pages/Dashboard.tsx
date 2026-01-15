import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
}

interface Session {
  id: string;
  patient: Patient;
  date: Date;
}

export const Dashboard = () => {
  const navigate = useNavigate();

  const todaySessions: Session[] = [];

  const recentPatients: Patient[] = [];

  const handleNewPatient = () => {
    navigate('/pacientes/nuevo');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Panel Principal
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Bienvenido, Dr. García
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Sesiones hoy
          </h2>
          {todaySessions.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">
              No hay sesiones programadas para hoy
            </p>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  {session.patient.photoUrl ? (
                    <img
                      src={session.patient.photoUrl}
                      alt={`${session.patient.firstName} ${session.patient.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <span className="text-teal-600 dark:text-teal-400 font-semibold">
                        {session.patient.firstName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {session.patient.firstName} {session.patient.lastName}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(session.date).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Pacientes recientes
          </h2>
          {recentPatients.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">
              No hay pacientes recientes
            </p>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  {patient.photoUrl ? (
                    <img
                      src={patient.photoUrl}
                      alt={`${patient.firstName} ${patient.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <span className="text-sky-600 dark:text-sky-400 font-semibold">
                        {patient.firstName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-sky-600 dark:text-sky-400">
                      Visto recientemente
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleNewPatient}
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        aria-label="Nuevo Paciente"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};
