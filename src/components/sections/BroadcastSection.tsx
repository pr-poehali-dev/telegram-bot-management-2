import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { api } from "@/lib/api";

interface Broadcast {
  id?: number;
  text: string;
  sent_at?: string;
  recipients_count?: number;
  status?: string;
}

const BroadcastSection = () => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    api
      .getBroadcasts()
      .then((data) => setBroadcasts(data.broadcasts || data || []))
      .catch(() => setBroadcasts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    setSuccessMsg("");
    try {
      const result = await api.sendBroadcast(text.trim());
      setSuccessMsg(
        result.message || `Рассылка отправлена: ${result.recipients_count || 0} получателей`
      );
      setText("");
      // Refresh list
      const data = await api.getBroadcasts();
      setBroadcasts(data.broadcasts || data || []);
    } catch {
      setSuccessMsg("Ошибка при отправке рассылки");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 opacity-0 animate-fade-in">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Новая рассылка
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Отправить сообщение всем пользователям
            </p>
          </div>
          <Icon name="Send" size={20} className="text-muted-foreground" />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите текст рассылки..."
          rows={5}
          className="w-full p-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">
            {text.length} символов
          </span>
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:shadow-lg hover:shadow-[hsl(250,90%,65%)]/20 transition-all duration-300 disabled:opacity-50"
          >
            <Icon name="Send" size={14} />
            {sending ? "Отправка..." : "Отправить рассылку"}
          </button>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm">
            {successMsg}
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-foreground">
            История рассылок
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Последние отправленные рассылки
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Загрузка...
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Рассылок пока нет
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((bc, i) => (
              <div
                key={bc.id || i}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {bc.sent_at
                      ? new Date(bc.sent_at).toLocaleString("ru-RU")
                      : "—"}
                  </span>
                  {bc.recipients_count !== undefined && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Icon name="Users" size={12} />
                      {bc.recipients_count} получателей
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {bc.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BroadcastSection;
