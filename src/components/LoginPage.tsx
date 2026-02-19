import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import api from "@/lib/api";

interface PanelUser {
  id: number;
  login: string;
  displayName: string;
  role: string;
}

interface LoginPageProps {
  onAuth: (token: string, user: PanelUser) => void;
}

const LoginPage = ({ onAuth }: LoginPageProps) => {
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    api.checkSetup().then((data) => {
      setIsSetup(data.hasOwner);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let result;
      if (!isSetup) {
        result = await api.registerOwner(login, password, name || login);
      } else {
        result = await api.login(login, password);
      }
      localStorage.setItem("panel_token", result.token);
      localStorage.setItem("panel_user", JSON.stringify(result.user));
      onAuth(result.token, result.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка авторизации");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl gradient-bg animate-pulse-glow flex items-center justify-center">
          <Icon name="Bot" size={20} className="text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md opacity-0 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Icon name="Bot" size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">TG Bot Panel</h1>
          <p className="text-muted-foreground mt-1">
            {isSetup ? "Войдите в панель управления" : "Создайте аккаунт владельца"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          {!isSetup && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Имя</label>
              <div className="relative">
                <Icon name="User" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--primary))] transition-colors text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Логин</label>
            <div className="relative">
              <Icon name="AtSign" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Введите логин"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--primary))] transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Пароль</label>
            <div className="relative">
              <Icon name="Lock" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSetup ? "Введите пароль" : "Минимум 6 символов"}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--primary))] transition-colors text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl gradient-bg text-white font-medium text-sm hover:shadow-lg hover:shadow-[hsl(250,90%,65%)]/20 transition-all duration-300 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Icon name="Loader2" size={16} className="animate-spin" />
                Подождите...
              </span>
            ) : isSetup ? "Войти" : "Создать аккаунт"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;