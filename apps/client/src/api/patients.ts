import axios from '../lib/axios';
import type {
  Patient,
  ClinicalCase,
  Evaluation,
  TreatmentSession,
  TreatmentPlan,
  VoiceNote,
} from '../types/patient';

export interface CreatePatientDto {
  name: string;
  occupation: string;
  previousOccupation?: string;
  gender?: string;
  phone: string;
  email?: string;
  birthDate: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  referralSource?: string;
  medicalFlags: string[];
}

export interface CreateTreatmentSessionDto {
  date: string;
  phaseNumber: number;
  procedures: string[];
  patientResponse: string;
  finalPainLevel: number;
  observations?: string;
}

export interface CreateClinicalCaseDto {
  patientId: string;
  title: string;
  consultationReason?: string;
}

export interface UpdateTreatmentSessionDto {
  date?: string;
  phaseNumber?: number;
  procedures?: string[];
  patientResponse?: string;
  finalPainLevel?: number;
  observations?: string;
}

export interface UpdateEvaluationDto {
  posturogram?: Partial<Evaluation['posturogram']>;
  orthopedicTests?: Partial<Evaluation['orthopedicTests']>;
  avdEvaluation?: Partial<Evaluation['avdEvaluation']>;
  painScale?: Partial<Evaluation['painScale']>;
  diagnosis?: Partial<Evaluation['diagnosis']>;
  voiceNotes?: VoiceNote[];
}

export interface UpdateClinicalCaseDto {
  title?: string;
  consultationReason?: string;
  status?: 'active' | 'completed' | 'inactive';
}

export interface UpdateTreatmentPlanObjectivesDto {
  therapeutic?: string;
  prophylactic?: string;
  educational?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

const normalizeEvaluation = (evaluation: Evaluation): Evaluation => {
  const normalized = { ...evaluation };

  normalized.posturogram = normalized.posturogram || {};
  normalized.orthopedicTests = normalized.orthopedicTests || {};
  normalized.avdEvaluation = normalized.avdEvaluation || {
    barthel: {
      total: 0,
    } as unknown as Evaluation['avdEvaluation']['barthel'],
    lawton: {
      total: 0,
    } as unknown as Evaluation['avdEvaluation']['lawton'],
  };

  if (!normalized.avdEvaluation.barthel) {
    normalized.avdEvaluation.barthel = {
      total: 0,
    } as unknown as Evaluation['avdEvaluation']['barthel'];
  }

  if (!normalized.avdEvaluation.lawton) {
    normalized.avdEvaluation.lawton = {
      total: 0,
    } as unknown as Evaluation['avdEvaluation']['lawton'];
  }

  normalized.painScale = normalized.painScale || {
    activity: 0,
    rest: 0,
    palpation: 0,
    type: 'chronic',
  };

  normalized.diagnosis = normalized.diagnosis || {};
  normalized.footprints = normalized.footprints || [];
  normalized.postureVideos = normalized.postureVideos || [];

  return normalized;
};

const mapPatient = (patient: Patient): Patient => ({
  ...patient,
  clinicalCases: patient.clinicalCases?.map((c) => {
    const rawCase = c as unknown as {
      evaluation?: Evaluation;
      evaluations?: Evaluation[];
    };

    const evaluation = rawCase.evaluation
      ? normalizeEvaluation(rawCase.evaluation)
      : rawCase.evaluations && rawCase.evaluations.length > 0
        ? normalizeEvaluation(rawCase.evaluations[0])
        : undefined;

    const rest = { ...c };
    if ('evaluation' in rest) {
      delete (rest as { evaluation?: unknown }).evaluation;
    }

    return {
      ...rest,
      evaluation,
      evaluations: evaluation ? [evaluation] : [],
    };
  }),
});

export const patientsApi = {
  findAll: async () => {
    const response = await axios.get<PaginatedResponse<Patient>>('/patients');
    return response.data.data.map(mapPatient);
  },

  findOne: async (id: string) => {
    const response = await axios.get<Patient>(`/patients/${id}`);
    return mapPatient(response.data);
  },

  create: async (data: CreatePatientDto) => {
    const response = await axios.post<Patient>('/patients', data);
    return mapPatient(response.data);
  },

  createCase: async (data: CreateClinicalCaseDto) => {
    const response = await axios.post<ClinicalCase>('/cases', data);
    return response.data;
  },

  updateCase: async (id: string, data: UpdateClinicalCaseDto) => {
    const response = await axios.patch<ClinicalCase>(`/cases/${id}`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePatientDto>) => {
    const response = await axios.patch<Patient>(`/patients/${id}`, data);
    return mapPatient(response.data);
  },

  delete: async (id: string) => {
    await axios.delete(`/patients/${id}`);
  },

  addSession: async (caseId: string, data: CreateTreatmentSessionDto) => {
    const response = await axios.post<TreatmentSession>(
      `/patients/cases/${caseId}/sessions`,
      data,
    );
    return response.data;
  },

  updateSession: async (sessionId: string, data: UpdateTreatmentSessionDto) => {
    const response = await axios.patch<TreatmentSession>(
      `/sessions/${sessionId}`,
      data,
    );
    return response.data;
  },

  deleteSession: async (sessionId: string) => {
    await axios.delete(`/sessions/${sessionId}`);
  },

  updateEvaluation: async (id: string, data: UpdateEvaluationDto) => {
    const response = await axios.patch<Evaluation>(
      `/patients/evaluations/${id}`,
      data,
    );
    return response.data;
  },

  updateTreatmentPlanObjectives: async (
    planId: string,
    data: UpdateTreatmentPlanObjectivesDto,
  ): Promise<TreatmentPlan> => {
    const response = await axios.patch<TreatmentPlan>(
      `/treatment-plans/${planId}/objectives`,
      data,
    );
    return response.data;
  },
};
