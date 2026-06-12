import type { Card } from "@/types/mtg"

export function formatCardForLigaMagic(card: Pick<Card, "name" | "edition" | "quantity">) {
  const name = card.name.trim()
  const edition = card.edition.trim()
  const quantity = Math.max(1, Math.trunc(card.quantity || 1))

  return `${quantity} ${name} [qualidade=nm][edicao=${edition}][idioma=pten]`
}

export function formatCardsForLigaMagic(cards: Array<Pick<Card, "name" | "edition" | "quantity">>) {
  return cards.map(formatCardForLigaMagic).join("\n")
}
