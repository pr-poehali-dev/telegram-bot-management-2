import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { api } from "@/lib/api";

interface LogEntry {
  id?: number;
  time?: string;
  user?: string;
  direction?: "in" | "out";
  text?: string;
}

const LogsSection = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLogs()
      .then((data) => setLogs(data.logs || data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    api
      .getLogs()
      .then((data) => setLogs(data.logs || data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6 opacity-0 animate-fade-in">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Логи</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Журнал сообщений бота
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass glass-hover text-sm text-foreground"
          >
            <Icon name="RefreshCw" size={14} />
            Обновить
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Загрузка логов...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Логи пусты
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    Время
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    Пользователь
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    Направление
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    Сообщение
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr
                    key={log.id || i}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">
                      {log.time
                        ? new Date(log.time).toLocaleString("ru-RU")
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {log.user || "—"}
                    </td>
                    <td className="py-3 px-4">
                      {log.direction === "in" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                          <Icon name="ArrowDownLeft" size={12} />
                          Входящее
                        </span>
                      ) : log.direction === "out" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                          <Icon name="ArrowUpRight" size={12} />
                          Исходящее
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-foreground max-w-xs truncate">
                      {log.text || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsSection;
