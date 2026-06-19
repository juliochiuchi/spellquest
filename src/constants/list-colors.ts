export const LIST_COLOR_VALUES = ["branco", "azul", "preto", "verde", "vermelho"] as const

export type ListColor = (typeof LIST_COLOR_VALUES)[number]

export const LIST_COLOR_LABELS: Record<ListColor, string> = {
  branco: "Branco",
  azul: "Azul",
  preto: "Preto",
  verde: "Verde",
  vermelho: "Vermelho",
}

export const LIST_COLOR_OPTIONS = LIST_COLOR_VALUES.map((value) => ({
  value,
  label: LIST_COLOR_LABELS[value],
}))
