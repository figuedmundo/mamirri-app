import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TherapistList } from './TherapistList';

describe('TherapistList', () => {
  it('renders therapist rows and action callbacks', () => {
    const onPromote = vi.fn();
    const onDemote = vi.fn();
    const onRemove = vi.fn();

    render(
      <TherapistList
        therapists={[
          {
            id: 'u-1',
            name: 'Therapist One',
            email: 'one@clinic.com',
            role: 'THERAPIST',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'u-2',
            name: 'Owner Two',
            email: 'owner@clinic.com',
            role: 'CLINIC_OWNER',
            createdAt: new Date().toISOString(),
          },
        ]}
        onPromote={onPromote}
        onDemote={onDemote}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText('Therapist One')).toBeInTheDocument();
    expect(screen.getByText('Owner Two')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Hacer owner' }));
    expect(onPromote).toHaveBeenCalledWith('u-1');

    fireEvent.click(screen.getByRole('button', { name: 'Bajar a terapeuta' }));
    expect(onDemote).toHaveBeenCalledWith('u-2');

    fireEvent.click(screen.getAllByRole('button', { name: 'Quitar' })[0]);
    expect(onRemove).toHaveBeenCalledWith('u-1');
  });
});
