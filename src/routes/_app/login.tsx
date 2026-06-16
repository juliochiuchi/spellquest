import { zodResolver } from "@hookform/resolvers/zod"
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, LoaderCircle, LockKeyhole, ShieldCheck, UserPlus, UserRound } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"

import * as authController from "@/controllers/authController"
import { getErrorMessage } from "@/controllers/errorController"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { PageShell } from "@/contexts/components/page-shell"
import type { LoginFormValues, RegisterFormValues } from "@/types/forms"
import { loginFormSchema, registerFormSchema } from "@/types/forms"

export const Route = createFileRoute('/_app/login')({
  beforeLoad: () => {
    if (authController.getAuthUser()) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const [mode, setMode] = React.useState<"login" | "register">("login")

  return (
    <PageShell
      title="Entrar"
      description="Entre com sua conta ou crie um novo acesso para abrir a dashboard protegida."
      actions={
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
      }
      className="max-w-4xl"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/80 bg-card/85 shadow-xl shadow-black/10">
          <CardHeader className="space-y-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <LockKeyhole className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>Autenticação</CardTitle>
              <CardDescription>
                Informe seus dados para <span className="font-medium text-foreground">login</span>.
              </CardDescription>
            </div>
            <AuthModeSwitch mode={mode} onModeChange={setMode} />
          </CardHeader>
          <CardContent>
            {mode === "login" ? <LoginForm /> : <RegisterForm />}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80 shadow-lg shadow-black/10">
          <CardHeader>
            <div className="flex size-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle>Rotas protegidas</CardTitle>
            <CardDescription>
              Tenha acesso PRO para criar, editar e visualizar listas <span className="font-medium text-foreground">disponíveis</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-xl border border-border/70 bg-background/60 p-4">
              Use a aba <span className="font-medium text-foreground">Entrar</span> para acessar com e-mail ou nickname e senha.
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-4">
              Use a aba <span className="font-medium text-foreground">Criar conta</span> para cadastrar nome, e-mail, nickname e senha.
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-4">
              Depois do login ou do cadastro, o usuário segue direto para a dashboard privada. Sem sessão, o redirecionamento volta para esta tela.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

function AuthModeSwitch({
  mode,
  onModeChange,
}: {
  mode: "login" | "register"
  onModeChange: (mode: "login" | "register") => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/80 bg-background/60 p-1">
      <Button
        type="button"
        size="sm"
        variant={mode === "login" ? "default" : "ghost"}
        className="rounded-xl"
        onClick={() => onModeChange("login")}
      >
        <UserRound className="size-4" />
        Entrar
      </Button>
      <Button
        type="button"
        size="sm"
        variant={mode === "register" ? "default" : "ghost"}
        className="rounded-xl"
        onClick={() => onModeChange("register")}
      >
        <UserPlus className="size-4" />
        Criar conta
      </Button>
    </div>
  )
}

function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  })

  const submit = form.handleSubmit(async (values) => {
    setSubmitError(null)

    try {
      const user = await login(values)
      toast({
        title: "Login realizado",
        description: `Bem-vindo, ${user.nickname}.`,
        variant: "success",
      })
      await navigate({ to: "/dashboard" })
    } catch (error) {
      const message = getErrorMessage(error, "Não foi possível entrar")
      setSubmitError(message)
      toast({
        title: "Erro ao entrar",
        description: message,
        variant: "destructive",
      })
    }
  })

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-identifier">E-mail/Nickname</Label>
        <Input
          id="login-identifier"
          maxLength={30}
          autoComplete="username"
          placeholder="você@email.com ou nickname"
          {...form.register("identifier")}
        />
        {form.formState.errors.identifier ? <ErrorText message={form.formState.errors.identifier.message} /> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          type="password"
          maxLength={30}
          autoComplete="current-password"
          placeholder="Sua senha"
          {...form.register("password")}
        />
        {form.formState.errors.password ? <ErrorText message={form.formState.errors.password.message} /> : null}
      </div>

      {submitError ? <FormAlert message={submitError} /> : null}

      <Button type="submit" className="mt-2" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
        Acessar dashboard
      </Button>
    </form>
  )
}

function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      nickname: "",
      password: "",
      confirmPassword: "",
    },
  })

  const submit = form.handleSubmit(async (values) => {
    setSubmitError(null)

    try {
      const user = await register(values)
      toast({
        title: "Conta criada",
        description: `Sua conta já está pronta, ${user.nickname}.`,
        variant: "success",
      })
      await navigate({ to: "/dashboard" })
    } catch (error) {
      const message = getErrorMessage(error, "Não foi possível criar sua conta")
      setSubmitError(message)
      toast({
        title: "Erro ao criar conta",
        description: message,
        variant: "destructive",
      })
    }
  })

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldBlock label="Nome" htmlFor="register-name" error={form.formState.errors.name?.message}>
          <Input
            id="register-name"
            maxLength={30}
            autoComplete="name"
            placeholder="Seu nome"
            {...form.register("name")}
          />
        </FieldBlock>

        <FieldBlock label="Nickname" htmlFor="register-nickname" error={form.formState.errors.nickname?.message}>
          <Input
            id="register-nickname"
            maxLength={30}
            autoComplete="nickname"
            placeholder="Seu nickname"
            {...form.register("nickname")}
          />
        </FieldBlock>
      </div>

      <FieldBlock label="E-mail" htmlFor="register-email" error={form.formState.errors.email?.message}>
        <Input
          id="register-email"
          type="email"
          maxLength={30}
          autoComplete="email"
          placeholder="você@email.com"
          {...form.register("email")}
        />
      </FieldBlock>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldBlock label="Senha" htmlFor="register-password" error={form.formState.errors.password?.message}>
          <Input
            id="register-password"
            type="password"
            maxLength={30}
            autoComplete="new-password"
            placeholder="Crie uma senha"
            {...form.register("password")}
          />
        </FieldBlock>

        <FieldBlock label="Repita a senha" htmlFor="register-confirm-password" error={form.formState.errors.confirmPassword?.message}>
          <Input
            id="register-confirm-password"
            type="password"
            maxLength={30}
            autoComplete="new-password"
            placeholder="Repita a senha"
            {...form.register("confirmPassword")}
          />
        </FieldBlock>
      </div>

      {submitError ? <FormAlert message={submitError} /> : null}

      <Button type="submit" className="mt-2" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        Criar conta e entrar
      </Button>
    </form>
  )
}

function FieldBlock({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <ErrorText message={error} /> : null}
    </div>
  )
}

function ErrorText({ message }: { message?: string }) {
  return <p className="text-xs text-destructive">{message}</p>
}

function FormAlert({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </div>
  )
}
