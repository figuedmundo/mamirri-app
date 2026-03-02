import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from '../lib/axios';
import { patientsApi } from './patients';

vi.mock('../lib/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('patientsApi.createCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts to /cases with patientId, title and consultationReason', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        id: 'case-1',
        patientId: 'patient-1',
        title: 'Dolor de hombro',
        status: 'active',
        startDate: '2026-03-01',
        consultationReason: 'Molestia al levantar el brazo',
      },
    } as never);

    await patientsApi.createCase({
      patientId: 'patient-1',
      title: 'Dolor de hombro',
      consultationReason: 'Molestia al levantar el brazo',
    });

    expect(axios.post).toHaveBeenCalledWith('/cases', {
      patientId: 'patient-1',
      title: 'Dolor de hombro',
      consultationReason: 'Molestia al levantar el brazo',
    });
  });
});
