import * as React from "react"

import { ScreenLoading } from "@/components/ui/screen-loading"
import { Toaster } from "@/components/ui/toaster"
import { MtgProvider, useMtg } from "@/contexts/mtg-context"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MtgProvider>
      {children}
      <BootLoadingOverlay />
      <Toaster />
    </MtgProvider>
  )
}

function BootLoadingOverlay() {
  const { isLoadingLists, isLoadingTypes, lists, typeLists } = useMtg()

  const show =
    (isLoadingTypes && typeLists.length === 0) ||
    (isLoadingLists && lists.length === 0)

  return <ScreenLoading show={show} label="Abrindo o grimório..." />
}
