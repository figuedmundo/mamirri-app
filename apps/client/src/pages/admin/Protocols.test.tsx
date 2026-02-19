import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminProtocols from './Protocols';

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockArchive = vi.fn();
const mockRestore = vi.fn();

vi.mock('@/hooks/use-library', () => ({
  useCategoriesQuery: () => ({
    data: [{ id: 'cat-1', name: 'Osteología' }],
  }),
  useProtocolsWithDeletedQuery: (
    _categoryId?: string,
    includeDeleted = false,
  ) => ({
    isLoading: false,
    data: [
      {
        id: 'prot-1',
        title: 'Esfinge',
        categoryId: 'cat-1',
        definition: 'Definición',
        rationale: 'Justificación',
        procedure: ['Paso 1'],
        tags: ['lumbar'],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        deletedAt: includeDeleted ? '2026-01-02' : null,
        category: { id: 'cat-1', name: 'Osteología' },
        references: [],
      },
    ],
  }),
  useCreateProtocol: () => ({ isPending: false, mutateAsync: mockCreate }),
  useUpdateProtocol: () => ({ isPending: false, mutateAsync: mockUpdate }),
  useArchiveProtocol: () => ({ isPending: false, mutateAsync: mockArchive }),
  useRestoreProtocol: () => ({ isPending: false, mutateAsync: mockRestore }),
}));

describe('AdminProtocols page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({});
    mockUpdate.mockResolvedValue({});
    mockArchive.mockResolvedValue({});
    mockRestore.mockResolvedValue({});
  });

  it('renders admin page title and table row', () => {
    render(<AdminProtocols />);

    expect(screen.getByText('Protocolos')).toBeInTheDocument();
    expect(screen.getByText('Esfinge')).toBeInTheDocument();
  });

  it('toggles archived filter button label', async () => {
    render(<AdminProtocols />);

    const toggle = screen.getByRole('button', { name: 'Ver archivados' });
    await userEvent.click(toggle);

    expect(
      screen.getByRole('button', { name: 'Ocultar archivados' }),
    ).toBeInTheDocument();
  });

  it('opens create dialog and submits payload', async () => {
    render(<AdminProtocols />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Nuevo protocolo' }),
    );

    await userEvent.type(screen.getByLabelText('Título'), 'Nuevo protocolo');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(mockCreate).toHaveBeenCalled();
  });

  it('opens archive confirmation and calls archive', async () => {
    render(<AdminProtocols />);

    await userEvent.click(screen.getByRole('button', { name: 'Archivar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(mockArchive).toHaveBeenCalledWith('prot-1');
  });
});
