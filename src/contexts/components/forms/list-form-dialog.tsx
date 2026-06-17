import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { ListFormValues } from "@/types/forms"
import { listFormSchema } from "@/types/forms"
import type { List, TypeList } from "@/types/mtg"

export function ListFormDialog({
  open,
  onOpenChange,
  typeLists,
  initial,
  onSubmit,
  allowPrivateField = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  typeLists: TypeList[]
  initial?: List | null
  onSubmit: (values: ListFormValues) => Promise<void> | void
  allowPrivateField?: boolean
}) {
  const title = initial ? "Editar lista" : "Nova lista"
  const key = `${initial?.id ?? "new"}-${open ? "1" : "0"}-${typeLists[0]?.id ?? "none"}`

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Crie uma lista para um grimório ou uma lista livre de interesse.</DialogDescription>
        </DialogHeader>
        <ListFormDialogBody
          key={key}
          typeLists={typeLists}
          initial={initial ?? null}
          allowPrivateField={allowPrivateField}
          onCancel={() => onOpenChange(false)}
          onSubmit={async (values) => {
            await onSubmit(values)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </DialogRoot>
  )
}

function ListFormDialogBody({
  typeLists,
  initial,
  onSubmit,
  onCancel,
  allowPrivateField,
}: {
  typeLists: TypeList[]
  initial: List | null
  onSubmit: (values: ListFormValues) => Promise<void>
  onCancel: () => void
  allowPrivateField: boolean
}) {
  const form = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema),
    defaultValues: initial
      ? {
        type_id: initial.type_id,
        name_list: initial.name_list,
        name_grimoire: initial.name_grimoire,
        description: initial.description,
        private: initial.private,
      }
      : {
        type_id: typeLists[0]?.id ?? "",
        name_list: "",
        name_grimoire: null,
        description: null,
        private: false,
      },
  })

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values)
  })
  const isSubmitting = form.formState.isSubmitting

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={submit}>
      <div className="flex flex-col gap-2">
        <Label>Tipo</Label>
        <SelectRoot
          value={form.watch("type_id")}
          onValueChange={(v) => form.setValue("type_id", v, { shouldValidate: true })}
          disabled={isSubmitting}
        >
          <SelectTrigger disabled={isSubmitting}>
            <SelectValue placeholder="Selecione um tipo" />
          </SelectTrigger>
          <SelectContent>
            {typeLists.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
        {form.formState.errors.type_id ? <p className="text-xs text-destructive">{form.formState.errors.type_id.message}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Nome da lista</Label>
        <Input {...form.register("name_list")} placeholder="Ex.: Cartas para comprar" disabled={isSubmitting} />
        {form.formState.errors.name_list ? <p className="text-xs text-destructive">{form.formState.errors.name_list.message}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Nome do grimório (opcional)</Label>
        <Input {...form.register("name_grimoire")} placeholder="Ex.: Dimir Control" disabled={isSubmitting} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Descrição (opcional)</Label>
        <Textarea {...form.register("description")} placeholder="Observações, notas de compra, prioridades..." disabled={isSubmitting} />
      </div>

      {allowPrivateField ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/60 px-4 py-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="private-list">Lista privada</Label>
            <p className="text-xs text-muted-foreground">Quando ativo, apenas você poderá visualizar essa lista na sua área privada.</p>
          </div>
          <Switch
            id="private-list"
            checked={form.watch("private")}
            onCheckedChange={(checked) => form.setValue("private", checked, { shouldValidate: true })}
            disabled={isSubmitting}
          />
        </div>
      ) : null}

      <DialogFooter className="mt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
