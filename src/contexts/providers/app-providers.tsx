import * as React from "react"

import { ScreenLoading } from "@/components/ui/screen-loading"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { MtgProvider } from "@/contexts/mtg-context"
import { useMtg } from "@/contexts/mtg-store"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MtgProvider>
        {children}
        <BootLoadingOverlay />
        <Toaster />
      </MtgProvider>
    </AuthProvider>
  )
}

function BootLoadingOverlay() {
  const { isLoadingLists, isLoadingTypes, lists, typeLists } = useMtg()

  const show =
    (isLoadingTypes && typeLists.length === 0) ||
    (isLoadingLists && lists.length === 0)

  return <ScreenLoading show={show} label="Abrindo o grimório..." />
}
