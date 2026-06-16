import { ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { HoverCardContent, HoverCardRoot, HoverCardTrigger } from "@/components/ui/hover-card"

export function CardImageTrigger({
  name,
  url,
  onOpen,
}: {
  name: string
  url: string
  onOpen: () => void
}) {
  return (
    <>
      <HoverCardRoot openDelay={140}>
        <HoverCardTrigger asChild>
          <Button
            size="icon-sm"
            variant="outline"
            className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline-flex"
            onClick={onOpen}
          >
            <ImageIcon className="size-4" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent side="right" align="start" sideOffset={12} className="w-[260px] p-2">
          <img src={url} alt={name} className="w-full rounded-xl border border-border/70" />
        </HoverCardContent>
      </HoverCardRoot>

      <Button
        size="icon-sm"
        variant="outline"
        className="inline-flex [@media(hover:hover)_and_(pointer:fine)]:hidden"
        onClick={onOpen}
      >
        <ImageIcon className="size-4" />
      </Button>
    </>
  )
}
