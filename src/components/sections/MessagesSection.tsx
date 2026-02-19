import { useState } from "react";
import Icon from "@/components/ui/icon";
import { api } from "@/lib/api";

const MessagesSection = () => {
  const [chatId, setChatId] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const handleSend = async () => {
    if (!chatId.trim() || !text.trim()) return;

    const numericId = Number(chatId.trim());
    if (isNaN(numericId)) {
      setMessage("Chat ID должен быть числом");
      setMessageType("error");
      return;
    }

    setSending(true);
    setMessage("");
    try {
      const result = await api.sendMessage(numericId, text.trim());
      setMessage(result.message || "Сообщение отправлено");
      setMessageType("success");
      setText("");
    } catch {
      setMessage("Ошибка при отправке сообщения");
      setMessageType("error");
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
              Отправить сообщение
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Отправка сообщения конкретному пользователю
            </p>
          </div>
          <Icon
            name="MessageCircle"
            size={20}
            className="text-muted-foreground"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Chat ID пользователя
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Например: 123456789"
              className="w-full px-4 py-2.5 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Текст сообщения
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Введите текст сообщения..."
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {text.length} символов
            </span>
            <button
              onClick={handleSend}
              disabled={sending || !chatId.trim() || !text.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:shadow-lg hover:shadow-[hsl(250,90%,65%)]/20 transition-all duration-300 disabled:opacity-50"
            >
              <Icon name="Send" size={14} />
              {sending ? "Отправка..." : "Отправить"}
            </button>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-sm ${
                messageType === "success"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesSection;
