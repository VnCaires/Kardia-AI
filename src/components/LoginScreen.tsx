import React, { useState } from "react";
import { AlertCircle, BrainCircuit, Eye, EyeOff, Sparkles } from "lucide-react";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (name: string, email: string, password: string) => Promise<boolean>;
}

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "register") {
      const ok = await onRegister(name, email, password);
      if (!ok) {
        setError("Não foi possível concluir o cadastro. Verifique os dados e tente novamente.");
      } else {
        setSuccess("Cadastro concluído com sucesso. Você já pode entrar.");
      }
    } else {
      const ok = await onLogin(email, password);
      if (!ok) {
        setError("E-mail ou senha incorretos. Tente novamente.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.16),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="flex items-center justify-center mb-6">
          <div className="rounded-2xl bg-slate-950 p-3 text-indigo-300 shadow-lg">
            <BrainCircuit className="h-8 w-8" />
          </div>
        </div>

        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            Kardia AI
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">{mode === "login" ? "Acesse o seu ambiente" : "Crie sua conta"}</h1>
          <p className="text-sm text-slate-500">{mode === "login" ? "Entre com seu e-mail para continuar estudando com foco e clareza." : "Cadastre-se para começar a organizar estudos e decks de forma simples."}</p>
        </div>

        <div className="mb-6 flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            Cadastrar
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
                placeholder="Seu nome"
                required
              />
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
                placeholder="Digite sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (mode === "register" ? "Cadastrando..." : "Entrando...") : mode === "register" ? "Cadastrar" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-700">Conta administrativa</p>
          <p className="mt-1">O acesso admin continua disponível, mas agora você pode criar um usuário comum para usar o app sem expor as credenciais na tela.</p>
        </div>
      </div>
    </div>
  );
}
