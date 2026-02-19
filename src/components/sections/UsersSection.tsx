import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { api } from "@/lib/api";

interface User {
  telegram_id: number;
  username?: string;
  first_name?: string;
  joined_at?: string;
  blocked?: boolean;
}

const UsersSection = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [blockingId, setBlockingId] = useState<number | null>(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api
      .getUsers(page, search)
      .then((data) => {
        setUsers(data.users || []);
        setTotalPages(data.total_pages || 1);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBlock = async (telegramId: number, block: boolean) => {
    setBlockingId(telegramId);
    try {
      await api.blockUser(telegramId, block);
      setUsers((prev) =>
        prev.map((u) =>
          u.telegram_id === telegramId ? { ...u, blocked: block } : u
        )
      );
    } catch {
      // ignore
    } finally {
      setBlockingId(null);
    }
  };

  return (
    <div className="space-y-6 opacity-0 animate-fade-in">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Пользователи
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Управление пользователями бота
            </p>
          </div>
          <Icon name="Users" size={20} className="text-muted-foreground" />
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени или ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:shadow-lg hover:shadow-[hsl(250,90%,65%)]/20 transition-all duration-300"
          >
            Найти
          </button>
        </form>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Загрузка...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Пользователи не найдены
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      Username
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      Имя
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      Telegram ID
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      Дата регистрации
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      Статус
                    </th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.telegram_id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4 text-foreground">
                        {user.username ? `@${user.username}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {user.first_name || "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                        {user.telegram_id}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {user.joined_at
                          ? new Date(user.joined_at).toLocaleDateString("ru-RU")
                          : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {user.blocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                            <Icon name="Ban" size={12} />
                            Заблокирован
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                            <Icon name="Check" size={12} />
                            Активен
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() =>
                            handleBlock(user.telegram_id, !user.blocked)
                          }
                          disabled={blockingId === user.telegram_id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                            user.blocked
                              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          } disabled:opacity-50`}
                        >
                          {blockingId === user.telegram_id
                            ? "..."
                            : user.blocked
                            ? "Разблокировать"
                            : "Заблокировать"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg glass glass-hover disabled:opacity-30"
                >
                  <Icon name="ChevronLeft" size={16} />
                </button>
                <span className="text-sm text-muted-foreground px-3">
                  Страница {page} из {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg glass glass-hover disabled:opacity-30"
                >
                  <Icon name="ChevronRight" size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersSection;
