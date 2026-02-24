import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { clinicsApi, type InvitationSummary } from '../api/clinics';
import { useClinic } from '../hooks/use-clinic';
import {
  TherapistList,
  type TherapistRow,
} from '../components/clinic/TherapistList';
import { InvitationList } from '../components/clinic/InvitationList';
import { InviteTherapistDialog } from '../components/clinic/InviteTherapistDialog';
import { ClinicSettings } from '../components/clinic/ClinicSettings';

export default function ClinicDashboard() {
  const { clinicId, isAdmin, isClinicOwner } = useClinic();
  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState<{
    id: string;
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    subdomain?: string | null;
    businessHours?: Record<string, unknown> | null;
  } | null>(null);
  const [therapists, setTherapists] = useState<TherapistRow[]>([]);
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  const canManage = isAdmin || isClinicOwner;

  const resolvedClinicId = useMemo(() => clinicId ?? '', [clinicId]);

  const loadData = async () => {
    if (!resolvedClinicId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [clinicResponse, therapistsResponse, invitationsResponse] =
        await Promise.all([
          clinicsApi.getById(resolvedClinicId),
          clinicsApi.listTherapists(resolvedClinicId),
          clinicsApi.listInvitations(resolvedClinicId),
        ]);
      setClinic(clinicResponse);
      setTherapists(therapistsResponse);
      setInvitations(invitationsResponse);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [resolvedClinicId]);

  if (!canManage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sin permisos</CardTitle>
        </CardHeader>
        <CardContent>
          Solo CLINIC_OWNER o ADMIN pueden acceder a este panel.
        </CardContent>
      </Card>
    );
  }

  if (!resolvedClinicId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sin clínica asignada</CardTitle>
        </CardHeader>
        <CardContent>Tu usuario no tiene clinicId asignado.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Clínica</CardTitle>
          <Button type="button" onClick={() => setInviteOpen(true)}>
            Invitar terapeuta
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? 'Cargando clínica...' : <p>{clinic?.name}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terapeutas</CardTitle>
        </CardHeader>
        <CardContent>
          <TherapistList
            therapists={therapists}
            isLoading={loading}
            onPromote={async (userId) => {
              await clinicsApi.updateTherapist(resolvedClinicId, userId, {
                role: 'CLINIC_OWNER',
              });
              await loadData();
            }}
            onDemote={async (userId) => {
              await clinicsApi.updateTherapist(resolvedClinicId, userId, {
                role: 'THERAPIST',
              });
              await loadData();
            }}
            onRemove={async (userId) => {
              await clinicsApi.removeTherapist(resolvedClinicId, userId);
              await loadData();
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invitaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <InvitationList
            invitations={invitations}
            isLoading={loading}
            onResend={async (email, role) => {
              await clinicsApi.inviteTherapist(resolvedClinicId, {
                email,
                role,
              });
              await loadData();
            }}
          />
        </CardContent>
      </Card>

      {clinic ? (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Clínica</CardTitle>
          </CardHeader>
          <CardContent>
            <ClinicSettings
              initialValues={clinic}
              onSave={async (values) => {
                await clinicsApi.updateById(resolvedClinicId, values);
                await loadData();
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <InviteTherapistDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={async (payload) => {
          const result = await clinicsApi.inviteTherapist(
            resolvedClinicId,
            payload,
          );
          await loadData();
          return result;
        }}
      />
    </div>
  );
}
