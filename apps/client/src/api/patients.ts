import axios from '../lib/axios';
import type { Patient, Evaluation, TreatmentSession } from '../types/patient';

export interface CreatePatientDto {
  name: string;
  age: number;
  occupation: string;
  previousOccupation?: string;
  address?: string;
  gender?: string;
  phone: string;
  email?: string;
  birthDate: string;
}

export interface CreateTreatmentSessionDto {
  date: string;
  phaseNumber: number;
  procedures: string[];
  patientResponse: string;
  finalPainLevel: number;
  observations?: string;
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
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

const mapPatient = (patient: Patient): Patient => ({
  ...patient,
  clinicalCases: patient.clinicalCases?.map((c) => {
    const rawCase = c as unknown as {
      evaluation?: Evaluation;
      evaluations?: Evaluation[];
    };

    // Normalize to array
    let evaluations =
      rawCase.evaluations || (rawCase.evaluation ? [rawCase.evaluation] : []);

    evaluations = evaluations.map((evaluation) => {
      if (evaluation) {
        evaluation.posturogram = evaluation.posturogram || {};
        evaluation.orthopedicTests = evaluation.orthopedicTests || {};
        evaluation.avdEvaluation = evaluation.avdEvaluation || {
          barthel: {
            total: 0,
          } as unknown as Evaluation['avdEvaluation']['barthel'],
          lawton: {
            total: 0,
          } as unknown as Evaluation['avdEvaluation']['lawton'],
        };
        if (!evaluation.avdEvaluation.barthel) {
          evaluation.avdEvaluation.barthel = {
            total: 0,
          } as unknown as Evaluation['avdEvaluation']['barthel'];
        }
        if (!evaluation.avdEvaluation.lawton) {
          evaluation.avdEvaluation.lawton = {
            total: 0,
          } as unknown as Evaluation['avdEvaluation']['lawton'];
        }
        evaluation.painScale = evaluation.painScale || {
          activity: 0,
          rest: 0,
          palpation: 0,
          type: 'chronic',
        };
        evaluation.diagnosis = evaluation.diagnosis || {};
        evaluation.footprints = evaluation.footprints || [];
        evaluation.postureVideos = evaluation.postureVideos || [];
      }
      return evaluation;
    });

    // Remove legacy evaluation property if it exists in spread
    const { evaluation: _, ...rest } = c as any;

    return {
      ...rest,
      evaluations,
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
      `/patients/sessions/${sessionId}`,
      data,
    );
    return response.data;
  },

  deleteSession: async (sessionId: string) => {
    await axios.delete(`/patients/sessions/${sessionId}`);
  },

  updateEvaluation: async (id: string, data: UpdateEvaluationDto) => {
    const response = await axios.patch<Evaluation>(
      `/patients/evaluations/${id}`,
      data,
    );
    return response.data;
  },
};
