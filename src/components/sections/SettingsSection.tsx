import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { api } from "@/lib/api";

interface Settings {
  bot_name: string;
  welcome_message: string;
  auto_approve: boolean;
  moderation_enabled: boolean;
  [key: string]: string | boolean;
}

const defaultSettings: Settings = {
  bot_name: "",
  welcome_message: "",
  auto_approve: false,
  moderation_enabled: false,
};

const SettingsSection = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .getSettings()
      .then((data) =>
        setSettings({
          ...defaultSettings,
          ...data,
          auto_approve:
            data.auto_approve === true ||
            data.auto_approve === "true" ||
            data.auto_approve === "1",
          moderation_enabled:
            data.moderation_enabled === true ||
            data.moderation_enabled === "true" ||
            data.moderation_enabled === "1",
        })
      )
      .catch(() => setSettings(defaultSettings))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.saveSettings({
        bot_name: settings.bot_name,
        welcome_message: settings.welcome_message,
        auto_approve: String(settings.auto_approve),
        moderation_enabled: String(settings.moderation_enabled),
      });
      setMessage("Настройки сохранены");
    } catch {
      setMessage("Ошибка сохранения настроек");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-12 text-center opacity-0 animate-fade-in">
        <p className="text-muted-foreground text-sm">Загрузка настроек...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 opacity-0 animate-fade-in">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Настройки</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Конфигурация бота
            </p>
          </div>
          <Icon name="Settings" size={20} className="text-muted-foreground" />
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Имя бота
            </label>
            <input
              type="text"
              value={settings.bot_name}
              onChange={(e) =>
                setSettings((s) => ({ ...s, bot_name: e.target.value }))
              }
              placeholder="Название бота"
              className="w-full px-4 py-2.5 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Приветственное сообщение
            </label>
            <textarea
              value={settings.welcome_message}
              onChange={(e) =>
                setSettings((s) => ({ ...s, welcome_message: e.target.value }))
              }
              placeholder="Текст приветствия для новых пользователей"
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div>
              <p className="text-sm font-medium text-foreground">
                Автоматическое одобрение
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Автоматически одобрять новых пользователей
              </p>
            </div>
            <button
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  auto_approve: !s.auto_approve,
                }))
              }
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                settings.auto_approve
                  ? "bg-[hsl(var(--primary))]"
                  : "bg-white/[0.12]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  settings.auto_approve ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div>
              <p className="text-sm font-medium text-foreground">Модерация</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Включить модерацию сообщений
              </p>
            </div>
            <button
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  moderation_enabled: !s.moderation_enabled,
                }))
              }
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                settings.moderation_enabled
                  ? "bg-[hsl(var(--primary))]"
                  : "bg-white/[0.12]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  settings.moderation_enabled
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          {message && (
            <span
              className={`text-sm ${
                message.includes("Ошибка") ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {message}
            </span>
          )}
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:shadow-lg hover:shadow-[hsl(250,90%,65%)]/20 transition-all duration-300 disabled:opacity-50"
          >
            <Icon name="Save" size={14} />
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
