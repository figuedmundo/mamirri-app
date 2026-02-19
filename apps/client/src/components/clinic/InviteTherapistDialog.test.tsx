import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InviteTherapistDialog } from './InviteTherapistDialog';

describe('InviteTherapistDialog', () => {
  it('submits email and role', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <InviteTherapistDialog
        open={true}
        onOpenChange={() => undefined}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('terapeuta@clinic.com'), {
      target: { value: 'new@clinic.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Enviar invitación' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'new@clinic.com',
        role: 'THERAPIST',
      });
    });
  });
});
