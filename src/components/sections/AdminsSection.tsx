import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import api from "@/lib/api";

interface Admin {
  id: number;
  login: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

const AdminsSection = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAdmins = async () => {
    try {
      const data = await api.listAdmins();
      setAdmins(data.admins);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.createAdmin(login, password, name || login);
      setSuccess(`Админ ${login} создан`);
      setLogin("");
      setPassword("");
      setName("");
      setShowForm(false);
      loadAdmins();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка создания");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (admin: Admin) => {
    try {
      await api.toggleAdmin(admin.id, !admin.isActive);
      loadAdmins();
    } catch {
      /* empty */
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-12 text-center animate-fade-in">
        <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Администраторы</h2>
          <p className="text-sm text-muted-foreground mt-1">Управление доступом к панели</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:shadow-lg hover:shadow-[hsl(250,90%,65%)]/20 transition-all"
        >
          <Icon name={showForm ? "X" : "UserPlus"} size={16} />
          {showForm ? "Отмена" : "Добавить админа"}
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm">
          <Icon name="Check" size={16} /> {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
          <Icon name="AlertCircle" size={16} /> {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="glass rounded-2xl p-6 space-y-4 animate-scale-in">
          <h3 className="text-base font-semibold text-foreground">Новый администратор</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Имя"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--primary))] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Логин *</label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Логин"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--primary))] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Пароль *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Мин. 6 символов"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[hsl(var(--primary))] text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Создание..." : "Создать"}
          </button>
        </form>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Пользователь</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Роль</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Статус</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Последний вход</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-semibold">
                      {admin.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{admin.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{admin.login}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    admin.role === "owner" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                  }`}>
                    {admin.role === "owner" ? "Владелец" : "Админ"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${admin.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="text-xs text-muted-foreground">{admin.isActive ? "Активен" : "Неактивен"}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString("ru") : "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  {admin.role !== "owner" && (
                    <button
                      onClick={() => handleToggle(admin)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        admin.isActive
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {admin.isActive ? "Деактивировать" : "Активировать"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminsSection;
