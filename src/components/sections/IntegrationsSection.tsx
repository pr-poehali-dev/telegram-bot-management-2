import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { api } from "@/lib/api";

interface BotInfo {
  bot_name?: string;
  username?: string;
  channel_id?: string;
  group_id?: string;
  status?: string;
}

const IntegrationsSection = () => {
  const [info, setInfo] = useState<BotInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getBotInfo()
      .then((data) => setInfo(data))
      .catch(() => setInfo({}))
      .finally(() => setLoading(false));
  }, []);

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
              Интеграции
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Подключенные сервисы и каналы
            </p>
          </div>
          <Icon name="Plug" size={20} className="text-muted-foreground" />
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Icon name="Bot" size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Telegram бот
                </p>
                <p className="text-xs text-muted-foreground">
                  Основное подключение
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  Подключен
                </span>
              </div>
            </div>
            <div className="space-y-2 pl-[52px]">
              {info.bot_name && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Имя бота</span>
                  <span className="text-foreground font-medium">
                    {info.bot_name}
                  </span>
                </div>
              )}
              {info.username && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Username</span>
                  <span className="text-foreground font-medium">
                    @{info.username}
                  </span>
                </div>
              )}
            </div>
          </div>

          {info.channel_id && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Icon name="Megaphone" size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Канал</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {info.channel_id}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">
                    Подключен
                  </span>
                </div>
              </div>
            </div>
          )}

          {info.group_id && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Icon
                    name="MessagesSquare"
                    size={20}
                    className="text-purple-400"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Группа</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {info.group_id}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">
                    Подключена
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl border border-dashed border-white/[0.12] text-center">
            <Icon
              name="Plus"
              size={24}
              className="text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">
              Дополнительные интеграции скоро будут доступны
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSection;
