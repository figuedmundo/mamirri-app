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
  observations: string;
}

export interface UpdateEvaluationDto {
  posturogram?: any;
  orthopedicTests?: any;
  avdEvaluation?: any;
  painScale?: any;
  diagnosis?: any;
}

export const patientsApi = {
  findAll: async () => {
    const response = await axios.get<Patient[]>('/patients');
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await axios.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  create: async (data: CreatePatientDto) => {
    const response = await axios.post<Patient>('/patients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePatientDto>) => {
    const response = await axios.patch<Patient>(`/patients/${id}`, data);
    return response.data;
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

  updateEvaluation: async (id: string, data: UpdateEvaluationDto) => {
    const response = await axios.patch<Evaluation>(
      `/patients/evaluations/${id}`,
      data,
    );
    return response.data;
  },
};
