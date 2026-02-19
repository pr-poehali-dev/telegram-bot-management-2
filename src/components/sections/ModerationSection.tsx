import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { api } from "@/lib/api";

interface User {
  telegram_id: number;
  username?: string;
  first_name?: string;
  blocked?: boolean;
}

const ModerationSection = () => {
  const [moderationEnabled, setModerationEnabled] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([api.getSettings(), api.getUsers(1, "")])
      .then(([settings, usersData]) => {
        setModerationEnabled(
          settings.moderation_enabled === true ||
            settings.moderation_enabled === "true" ||
            settings.moderation_enabled === "1"
        );
        const allUsers: User[] = usersData.users || [];
        setBlockedUsers(allUsers.filter((u: User) => u.blocked));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleModeration = async () => {
    setSaving(true);
    const newValue = !moderationEnabled;
    try {
      await api.saveSettings({ moderation_enabled: String(newValue) });
      setModerationEnabled(newValue);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (telegramId: number) => {
    setUnblockingId(telegramId);
    try {
      await api.blockUser(telegramId, false);
      setBlockedUsers((prev) =>
        prev.filter((u) => u.telegram_id !== telegramId)
      );
    } catch {
      // ignore
    } finally {
      setUnblockingId(null);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-12 text-center opacity-0 animate-fade-in">
        <p className="text-muted-foreground text-sm">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-in">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Модерация
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Управление модерацией и заблокированными пользователями
            </p>
          </div>
          <Icon name="Shield" size={20} className="text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Ban" size={16} className="text-red-400" />
              <p className="text-2xl font-bold text-foreground">
                {blockedUsers.length}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Заблокированных пользователей
            </p>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div>
              <p className="text-sm font-medium text-foreground">
                Модерация
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {moderationEnabled ? "Включена" : "Выключена"}
              </p>
            </div>
            <button
              onClick={toggleModeration}
              disabled={saving}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                moderationEnabled
                  ? "bg-[hsl(var(--primary))]"
                  : "bg-white/[0.12]"
              } ${saving ? "opacity-50" : ""}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  moderationEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-foreground">
            Заблокированные пользователи
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Список заблокированных пользователей бота
          </p>
        </div>

        {blockedUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Нет заблокированных пользователей
          </div>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map((user) => (
              <div
                key={user.telegram_id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Icon name="User" size={16} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {user.first_name || user.username || "Пользователь"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {user.telegram_id}
                      {user.username ? ` | @${user.username}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(user.telegram_id)}
                  disabled={unblockingId === user.telegram_id}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                >
                  {unblockingId === user.telegram_id
                    ? "..."
                    : "Разблокировать"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationSection;
