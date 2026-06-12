import * as React from "react"

export type ToastVariant = "default" | "success" | "destructive"

export type ToastInput = {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  duration?: number
}

type ToastState = {
  toasts: ToastItem[]
}

type ToastItem = ToastInput & {
  id: string
  open: boolean
}

type Action =
  | { type: "ADD_TOAST"; toast: ToastItem }
  | { type: "UPDATE_TOAST"; toast: Partial<ToastItem> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 200

function genId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2)
}

function reducer(state: ToastState, action: Action): ToastState {
  switch (action.type) {
    case "ADD_TOAST": {
      const next = [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      return { ...state, toasts: next }
    }
    case "UPDATE_TOAST": {
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }
    }
    case "DISMISS_TOAST": {
      const toastId = action.toastId
      return {
        ...state,
        toasts: state.toasts.map((t) => {
          if (toastId && t.id !== toastId) return t
          return { ...t, open: false }
        }),
      }
    }
    case "REMOVE_TOAST": {
      const toastId = action.toastId
      if (!toastId) return { ...state, toasts: [] }
      return { ...state, toasts: state.toasts.filter((t) => t.id !== toastId) }
    }
    default: {
      return state
    }
  }
}

let memoryState: ToastState = { toasts: [] }
const listeners = new Set<(state: ToastState) => void>()
const removeTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const dismissTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

function addToRemoveQueue(toastId: string) {
  if (removeTimeouts.has(toastId)) return
  const timeout = setTimeout(() => {
    removeTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, TOAST_REMOVE_DELAY)
  removeTimeouts.set(toastId, timeout)
}

export function toast(input: ToastInput) {
  const id = genId()
  const duration = input.duration ?? 4000

  dispatch({
    type: "ADD_TOAST",
    toast: { ...input, id, open: true },
  })

  const dismissTimeout = setTimeout(() => {
    dispatch({ type: "DISMISS_TOAST", toastId: id })
  }, duration)

  dismissTimeouts.set(id, dismissTimeout)

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    update: (next: ToastInput) => dispatch({ type: "UPDATE_TOAST", toast: { ...next, id } }),
  }
}

export function dismiss(toastId?: string) {
  dispatch({ type: "DISMISS_TOAST", toastId })

  const ids = toastId ? [toastId] : memoryState.toasts.map((t) => t.id)
  ids.forEach((id) => {
    const dismissTimeout = dismissTimeouts.get(id)
    if (dismissTimeout) {
      clearTimeout(dismissTimeout)
      dismissTimeouts.delete(id)
    }
    addToRemoveQueue(id)
  })
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss,
  }
}
