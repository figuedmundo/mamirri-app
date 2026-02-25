import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ClinicOnboardingProvider,
  isStep1Valid,
  useClinicOnboarding,
} from './ClinicOnboardingContext';

function ContextHarness() {
  const { state, setCurrentStep, updateClinicData, reset } =
    useClinicOnboarding();

  return (
    <div>
      <p>step:{state.currentStep}</p>
      <p>name:{state.clinicData.name}</p>
      <button type="button" onClick={() => setCurrentStep(2)}>
        go-step-2
      </button>
      <button
        type="button"
        onClick={() =>
          updateClinicData({
            name: 'Mamirri Clinic',
            email: 'clinic@example.com',
          })
        }
      >
        fill-valid-step-1
      </button>
      <button type="button" onClick={reset}>
        reset
      </button>
      <button
        type="button"
        onClick={() => {
          if (isStep1Valid(state.clinicData)) {
            setCurrentStep(2);
          }
        }}
      >
        validate-and-next
      </button>
    </div>
  );
}

describe('ClinicOnboardingContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates state when navigating between steps', () => {
    render(
      <ClinicOnboardingProvider>
        <ContextHarness />
      </ClinicOnboardingProvider>,
    );

    expect(screen.getByText('step:1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'go-step-2' }));

    expect(screen.getByText('step:2')).toBeInTheDocument();
  });

  it('persists form data to localStorage', async () => {
    render(
      <ClinicOnboardingProvider>
        <ContextHarness />
      </ClinicOnboardingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'fill-valid-step-1' }));

    await waitFor(() => {
      const raw = localStorage.getItem('clinic_onboarding_draft');
      expect(raw).not.toBeNull();
      expect(raw).toContain('Mamirri Clinic');
      expect(raw).toContain('clinic@example.com');
    });
  });

  it('reset clears all in-memory state and localStorage', async () => {
    render(
      <ClinicOnboardingProvider>
        <ContextHarness />
      </ClinicOnboardingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'fill-valid-step-1' }));
    fireEvent.click(screen.getByRole('button', { name: 'go-step-2' }));
    fireEvent.click(screen.getByRole('button', { name: 'reset' }));

    expect(screen.getByText('step:1')).toBeInTheDocument();
    expect(screen.getByText('name:')).toBeInTheDocument();

    await waitFor(() => {
      const raw = localStorage.getItem('clinic_onboarding_draft');
      expect(raw).not.toBeNull();
      expect(raw).not.toContain('Mamirri Clinic');
    });
  });

  it('prevents step progression when step 1 validation fails', () => {
    render(
      <ClinicOnboardingProvider>
        <ContextHarness />
      </ClinicOnboardingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'validate-and-next' }));
    expect(screen.getByText('step:1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'fill-valid-step-1' }));
    fireEvent.click(screen.getByRole('button', { name: 'validate-and-next' }));
    expect(screen.getByText('step:2')).toBeInTheDocument();
  });
});
