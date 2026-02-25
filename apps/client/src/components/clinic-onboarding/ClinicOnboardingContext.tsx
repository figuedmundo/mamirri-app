/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

export type OnboardingStep = 1 | 2 | 3;

export type InvitationDraft = {
  id: string;
  email: string;
  role: 'THERAPIST' | 'CLINIC_OWNER';
};

export type ClinicDataDraft = {
  name: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  mondayOpen: string;
  mondayClose: string;
};

export type ClinicOnboardingState = {
  currentStep: OnboardingStep;
  clinicData: ClinicDataDraft;
  invitations: InvitationDraft[];
  isLoading: boolean;
  error?: string;
};

type ClinicOnboardingAction =
  | { type: 'SET_STEP'; payload: OnboardingStep }
  | { type: 'UPDATE_CLINIC_DATA'; payload: Partial<ClinicDataDraft> }
  | { type: 'ADD_INVITATION'; payload: InvitationDraft }
  | {
      type: 'UPDATE_INVITATION';
      payload: { id: string; patch: Partial<InvitationDraft> };
    }
  | { type: 'REMOVE_INVITATION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'RESET' };

const STORAGE_KEY = 'clinic_onboarding_draft';

const initialClinicData: ClinicDataDraft = {
  name: '',
  email: '',
  phone: '',
  address: '',
  logoUrl: '',
  mondayOpen: '09:00',
  mondayClose: '17:00',
};

export const initialOnboardingState: ClinicOnboardingState = {
  currentStep: 1,
  clinicData: initialClinicData,
  invitations: [],
  isLoading: false,
  error: undefined,
};

export function isStep1Valid(data: ClinicDataDraft): boolean {
  const name = data.name.trim();
  const email = data.email.trim();
  return name.length >= 2 && email.includes('@');
}

function parseStoredState(raw: string | null): ClinicOnboardingState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ClinicOnboardingState>;
    return {
      ...initialOnboardingState,
      ...parsed,
      clinicData: {
        ...initialClinicData,
        ...(parsed.clinicData ?? {}),
      },
      invitations: Array.isArray(parsed.invitations) ? parsed.invitations : [],
      currentStep:
        parsed.currentStep === 2 || parsed.currentStep === 3
          ? parsed.currentStep
          : 1,
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clinicOnboardingReducer(
  state: ClinicOnboardingState,
  action: ClinicOnboardingAction,
): ClinicOnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'UPDATE_CLINIC_DATA':
      return {
        ...state,
        clinicData: {
          ...state.clinicData,
          ...action.payload,
        },
      };
    case 'ADD_INVITATION':
      return {
        ...state,
        invitations: [...state.invitations, action.payload],
      };
    case 'UPDATE_INVITATION':
      return {
        ...state,
        invitations: state.invitations.map((invitation) =>
          invitation.id === action.payload.id
            ? {
                ...invitation,
                ...action.payload.patch,
              }
            : invitation,
        ),
      };
    case 'REMOVE_INVITATION':
      return {
        ...state,
        invitations: state.invitations.filter(
          (invitation) => invitation.id !== action.payload,
        ),
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'RESET':
      return initialOnboardingState;
    default:
      return state;
  }
}

type ClinicOnboardingContextValue = {
  state: ClinicOnboardingState;
  setCurrentStep: (step: OnboardingStep) => void;
  updateClinicData: (patch: Partial<ClinicDataDraft>) => void;
  addInvitation: (invitation: InvitationDraft) => void;
  updateInvitation: (id: string, patch: Partial<InvitationDraft>) => void;
  removeInvitation: (id: string) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string | undefined) => void;
  reset: () => void;
};

const ClinicOnboardingContext =
  createContext<ClinicOnboardingContextValue | null>(null);

export function ClinicOnboardingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    clinicOnboardingReducer,
    initialOnboardingState,
    (baseState) =>
      parseStoredState(localStorage.getItem(STORAGE_KEY)) ?? baseState,
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentStep: state.currentStep,
        clinicData: state.clinicData,
        invitations: state.invitations,
      }),
    );
  }, [state.currentStep, state.clinicData, state.invitations]);

  const value = useMemo<ClinicOnboardingContextValue>(
    () => ({
      state,
      setCurrentStep: (step) => dispatch({ type: 'SET_STEP', payload: step }),
      updateClinicData: (patch) =>
        dispatch({ type: 'UPDATE_CLINIC_DATA', payload: patch }),
      addInvitation: (invitation) =>
        dispatch({ type: 'ADD_INVITATION', payload: invitation }),
      updateInvitation: (id, patch) =>
        dispatch({ type: 'UPDATE_INVITATION', payload: { id, patch } }),
      removeInvitation: (id) =>
        dispatch({ type: 'REMOVE_INVITATION', payload: id }),
      setLoading: (value) => dispatch({ type: 'SET_LOADING', payload: value }),
      setError: (value) => dispatch({ type: 'SET_ERROR', payload: value }),
      reset: () => {
        localStorage.removeItem(STORAGE_KEY);
        dispatch({ type: 'RESET' });
      },
    }),
    [state],
  );

  return (
    <ClinicOnboardingContext.Provider value={value}>
      {children}
    </ClinicOnboardingContext.Provider>
  );
}

export function useClinicOnboarding() {
  const context = useContext(ClinicOnboardingContext);
  if (!context) {
    throw new Error(
      'useClinicOnboarding must be used inside ClinicOnboardingProvider',
    );
  }

  return context;
}
