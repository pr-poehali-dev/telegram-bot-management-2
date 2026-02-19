import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { api } from "@/lib/api";

interface BotInfo {
  bot_name?: string;
  username?: string;
  status?: string;
  uptime?: string;
  response_time?: string;
  cpu_load?: string;
  ram_used?: string;
  ram_total?: string;
  channel_id?: string;
  group_id?: string;
}

const BotStatus = () => {
  const [info, setInfo] = useState<BotInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getBotInfo()
      .then((data) => setInfo(data))
      .catch(() => setInfo({}))
      .finally(() => setLoading(false));
  }, []);

  const isOnline = info.status === "online" || info.status === undefined;
  const ramUsed = parseInt(info.ram_used || "0", 10);
  const ramTotal = parseInt(info.ram_total || "1", 10);
  const ramPercent = ramTotal > 0 ? (ramUsed / ramTotal) * 100 : 0;

  return (
    <div className="glass rounded-2xl p-6 opacity-0 animate-fade-in stagger-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground">Статус бота</h3>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-xs text-muted-foreground">Загрузка...</span>
          ) : (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isOnline ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isOnline ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
              </span>
              <span
                className={`text-xs font-medium ${
                  isOnline ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isOnline ? "Онлайн" : "Офлайн"}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {info.bot_name && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Bot" size={14} />
              <span>Имя бота</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {info.bot_name}
            </span>
          </div>
        )}

        {info.username && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="AtSign" size={14} />
              <span>Username</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              @{info.username}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>Аптайм</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {info.uptime || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Zap" size={14} />
            <span>Время ответа</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {info.response_time || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Server" size={14} />
            <span>Нагрузка CPU</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {info.cpu_load || "—"}
          </span>
        </div>

        {(info.ram_used || info.ram_total) && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                RAM использовано
              </span>
              <span className="text-xs font-medium text-foreground">
                {info.ram_used || "0"} / {info.ram_total || "0"} MB
              </span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full gradient-bg rounded-full transition-all duration-1000"
                style={{ width: `${ramPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotStatus;
