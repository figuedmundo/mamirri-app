import axios from '../lib/axios';
import type {
  Footprint,
  PostureVideo,
  SessionPhoto,
  VoiceNote,
} from '../types/patient';

export const mediaApi = {
  uploadPatientPhoto: async (patientId: string, file: Blob): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    await axios.post(`/media/patients/${patientId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadFootprint: async (
    evaluationId: string,
    file: Blob,
    type: 'initial' | 'final' | 'followup',
  ): Promise<Footprint> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axios.post<Footprint>(
      `/media/evaluations/${evaluationId}/footprints`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  uploadPostureVideo: async (
    evaluationId: string,
    file: Blob,
    type: 'gait' | 'static' | 'dynamic',
    duration: number,
  ): Promise<PostureVideo> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('duration', duration.toString());

    const response = await axios.post<PostureVideo>(
      `/media/evaluations/${evaluationId}/posture-videos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  uploadSessionPhoto: async (
    sessionId: string,
    file: Blob,
    caption?: string,
  ): Promise<SessionPhoto> => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    const response = await axios.post<SessionPhoto>(
      `/media/sessions/${sessionId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  uploadEvaluationVoiceNote: async (
    evaluationId: string,
    file: Blob,
    durationSeconds: number,
  ): Promise<VoiceNote> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('duration', durationSeconds.toString());

    const response = await axios.post<VoiceNote>(
      `/media/evaluations/${evaluationId}/voice-notes`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  uploadSessionVoiceNote: async (
    sessionId: string,
    file: Blob,
    durationSeconds: number,
  ): Promise<VoiceNote> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('duration', durationSeconds.toString());

    const response = await axios.post<VoiceNote>(
      `/media/sessions/${sessionId}/voice-notes`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  getVoiceNoteStatus: async (
    entityType: 'evaluations' | 'sessions',
    entityId: string,
    voiceNoteId: string,
  ): Promise<VoiceNote> => {
    const response = await axios.get<VoiceNote>(
      `/media/${entityType}/${entityId}/voice-notes/${voiceNoteId}`,
    );
    return response.data;
  },

  getSessionPhotos: async (sessionId: string): Promise<SessionPhoto[]> => {
    const response = await axios.get<SessionPhoto[]>(
      `/media/sessions/${sessionId}/photos`,
    );
    return response.data;
  },

  deleteSessionPhoto: async (
    sessionId: string,
    photoId: string,
  ): Promise<void> => {
    await axios.delete(`/media/sessions/${sessionId}/photos/${photoId}`);
  },
};
