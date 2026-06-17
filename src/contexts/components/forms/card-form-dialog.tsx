import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { type Resolver, useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { CardFormValues } from "@/types/forms"
import { cardFormSchema } from "@/types/forms"
import type { Card } from "@/types/mtg"

export function CardFormDialog({
  open,
  onOpenChange,
  initial,
  editionSuggestions,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: Card | null
  editionSuggestions: string[]
  onSubmit: (values: CardFormValues) => Promise<void> | void
}) {
  const title = initial ? "Editar carta" : "Nova carta"
  const key = `${initial?.id ?? "new"}-${open ? "1" : "0"}-${editionSuggestions.length}`

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Cadastre edição, quantidade e URL da imagem para pré-visualização.</DialogDescription>
        </DialogHeader>
        <CardFormDialogBody
          key={key}
          initial={initial ?? null}
          editionSuggestions={editionSuggestions}
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

function CardFormDialogBody({
  initial,
  editionSuggestions,
  onSubmit,
  onCancel,
}: {
  initial: Card | null
  editionSuggestions: string[]
  onSubmit: (values: CardFormValues) => Promise<void>
  onCancel: () => void
}) {
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema) as unknown as Resolver<CardFormValues>,
    defaultValues: initial
      ? {
        name: initial.name,
        edition: initial.edition,
        quantity: initial.quantity,
        is_purchased: initial.is_purchased,
        url_image: initial.url_image,
      }
      : {
        name: "",
        edition: editionSuggestions[0] ?? "",
        quantity: 1,
        is_purchased: false,
        url_image: null,
      },
  })

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values)
  })
  const isSubmitting = form.formState.isSubmitting

  const datalistId = React.useId()
  const isPurchased = useWatch({ control: form.control, name: "is_purchased" }) ?? false

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={submit}>
      <div className="flex flex-col gap-2">
        <Label>Nome</Label>
        <Input {...form.register("name")} placeholder="Ex.: Sol Ring" disabled={isSubmitting} />
        {form.formState.errors.name ? <p className="text-xs text-destructive">{form.formState.errors.name.message}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Edição</Label>
        <Input list={datalistId} {...form.register("edition")} placeholder="Ex.: Commander Masters" disabled={isSubmitting} />
        <datalist id={datalistId}>
          {editionSuggestions.map((e) => (
            <option key={e} value={e} />
          ))}
        </datalist>
        {form.formState.errors.edition ? <p className="text-xs text-destructive">{form.formState.errors.edition.message}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Quantidade</Label>
        <Input type="number" min={1} step={1} inputMode="numeric" {...form.register("quantity")} disabled={isSubmitting} />
        {form.formState.errors.quantity ? <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p> : null}
      </div>

      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="is_purchased">Carta comprada</Label>
          <p className="text-xs text-muted-foreground">Ative se essa carta ja foi comprada.</p>
        </div>
        <Switch
          id="is_purchased"
          checked={isPurchased}
          onCheckedChange={(checked) => form.setValue("is_purchased", Boolean(checked), { shouldDirty: true })}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>URL da imagem (opcional)</Label>
        <Textarea {...form.register("url_image")} placeholder="Cole a URL da imagem da carta" disabled={isSubmitting} />
      </div>

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
