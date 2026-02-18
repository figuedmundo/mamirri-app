import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useArchiveProtocol,
  useCategoriesQuery,
  useCreateProtocol,
  useProtocolsWithDeletedQuery,
  useRestoreProtocol,
  useUpdateProtocol,
} from '@/hooks/use-library';
import type { Protocol } from '@/types/library';

type FormState = {
  title: string;
  categoryId: string;
  definition: string;
  rationale: string;
  procedureText: string;
  tagsText: string;
  referenceIdsText: string;
};

const emptyForm: FormState = {
  title: '',
  categoryId: '',
  definition: '',
  rationale: '',
  procedureText: '',
  tagsText: '',
  referenceIdsText: '',
};

function protocolToForm(protocol: Protocol): FormState {
  return {
    title: protocol.title,
    categoryId: protocol.categoryId,
    definition: protocol.definition,
    rationale: protocol.rationale,
    procedureText: protocol.procedure.join('\n'),
    tagsText: protocol.tags.join(', '),
    referenceIdsText: protocol.references
      .map((item) => item.referenceId)
      .join(', '),
  };
}

export default function AdminProtocols() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [confirmProtocol, setConfirmProtocol] = useState<Protocol | null>(null);

  const { data: categories = [] } = useCategoriesQuery();
  const { data: protocols = [], isLoading } = useProtocolsWithDeletedQuery(
    categoryId,
    includeDeleted,
  );

  const createProtocol = useCreateProtocol();
  const updateProtocol = useUpdateProtocol();
  const archiveProtocol = useArchiveProtocol();
  const restoreProtocol = useRestoreProtocol();

  const filteredProtocols = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return protocols;
    }

    return protocols.filter((protocol) =>
      protocol.title.toLowerCase().includes(query),
    );
  }, [protocols, search]);

  const dialogTitle = editingProtocol ? 'Editar protocolo' : 'Nuevo protocolo';

  const openCreateDialog = () => {
    setEditingProtocol(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (protocol: Protocol) => {
    setEditingProtocol(protocol);
    setForm(protocolToForm(protocol));
    setIsDialogOpen(true);
  };

  const parseFormPayload = () => {
    const procedure = form.procedureText
      .split('\n')
      .map((step) => step.trim())
      .filter((step) => step.length > 0);

    const tags = form.tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const referenceIds = form.referenceIdsText
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    return {
      title: form.title.trim(),
      categoryId: form.categoryId,
      definition: form.definition.trim(),
      rationale: form.rationale.trim(),
      procedure,
      tags,
      referenceIds,
    };
  };

  const handleSave = async () => {
    const payload = parseFormPayload();

    if (editingProtocol) {
      await updateProtocol.mutateAsync({ id: editingProtocol.id, payload });
    } else {
      await createProtocol.mutateAsync(payload);
    }

    setIsDialogOpen(false);
    setEditingProtocol(null);
    setForm(emptyForm);
  };

  const handleArchiveOrRestore = async () => {
    if (!confirmProtocol) {
      return;
    }

    if (confirmProtocol.deletedAt) {
      await restoreProtocol.mutateAsync(confirmProtocol.id);
    } else {
      await archiveProtocol.mutateAsync(confirmProtocol.id);
    }

    setConfirmProtocol(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Administración de Protocolos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            CRUD de protocolos para usuarios con rol ADMIN.
          </p>
        </div>

        <Button onClick={openCreateDialog}>Nuevo protocolo</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Buscar por título..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Select
          value={categoryId ?? '__all__'}
          onValueChange={(value) =>
            setCategoryId(value === '__all__' ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={includeDeleted ? 'default' : 'outline'}
          onClick={() => setIncludeDeleted((prev) => !prev)}
        >
          {includeDeleted ? 'Ocultar archivados' : 'Ver archivados'}
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th className="text-left p-3 font-semibold">Título</th>
              <th className="text-left p-3 font-semibold">Categoría</th>
              <th className="text-left p-3 font-semibold">Estado</th>
              <th className="text-right p-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="p-4" colSpan={4}>
                  Cargando protocolos...
                </td>
              </tr>
            ) : filteredProtocols.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={4}>
                  No hay protocolos para mostrar.
                </td>
              </tr>
            ) : (
              filteredProtocols.map((protocol) => (
                <tr
                  key={protocol.id}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  <td className="p-3 font-medium">{protocol.title}</td>
                  <td className="p-3">{protocol.category?.name ?? '-'}</td>
                  <td className="p-3">
                    {protocol.deletedAt ? 'Archivado' : 'Activo'}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(protocol)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={protocol.deletedAt ? 'default' : 'destructive'}
                        onClick={() => setConfirmProtocol(protocol)}
                      >
                        {protocol.deletedAt ? 'Restaurar' : 'Archivar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Cambios aplican para sesiones futuras; el historial clínico no se
              reescribe.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={form.categoryId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, categoryId: value }))
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="definition">Definición</Label>
              <Textarea
                id="definition"
                value={form.definition}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    definition: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rationale">Justificación</Label>
              <Textarea
                id="rationale"
                value={form.rationale}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    rationale: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="procedure">
                Procedimiento (una línea por paso)
              </Label>
              <Textarea
                id="procedure"
                value={form.procedureText}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    procedureText: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (separados por coma)</Label>
              <Input
                id="tags"
                value={form.tagsText}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tagsText: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="referenceIds">
                Referencias (IDs separados por coma)
              </Label>
              <Input
                id="referenceIds"
                value={form.referenceIdsText}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    referenceIdsText: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={createProtocol.isPending || updateProtocol.isPending}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmProtocol}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmProtocol(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmProtocol?.deletedAt
                ? '¿Restaurar protocolo?'
                : '¿Archivar protocolo?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmProtocol?.deletedAt
                ? 'El protocolo volverá a estar disponible para terapeutas.'
                : 'El protocolo no se eliminará permanentemente; quedará archivado.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleArchiveOrRestore()}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
