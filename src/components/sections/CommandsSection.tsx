import Icon from "@/components/ui/icon";

interface Command {
  name: string;
  count: number;
  percentage: number;
}

interface CommandsSectionProps {
  commands: Command[];
}

const CommandsSection = ({ commands }: CommandsSectionProps) => {
  const totalCalls = commands.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-6 opacity-0 animate-fade-in">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Команды</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Статистика использования команд бота
            </p>
          </div>
          <Icon name="Terminal" size={20} className="text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-2xl font-bold text-foreground">
              {totalCalls.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Всего вызовов
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-2xl font-bold text-foreground">
              {commands.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Уникальных команд
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-2xl font-bold text-foreground">
              {commands.length > 0 ? commands[0].name : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Самая популярная
            </p>
          </div>
        </div>

        {commands.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Нет данных о командах
          </div>
        ) : (
          <div className="space-y-3">
            {commands.map((cmd, i) => (
              <div
                key={cmd.name}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors group"
              >
                <span className="text-lg font-bold text-muted-foreground w-8 text-center">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-medium text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 px-2 py-0.5 rounded-md">
                      {cmd.name}
                    </code>
                    <span className="text-sm text-muted-foreground">
                      {cmd.count.toLocaleString()} вызовов
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-bg transition-all duration-700 group-hover:shadow-sm group-hover:shadow-[hsl(250,90%,65%)]/30"
                      style={{
                        width: `${cmd.percentage}%`,
                        transitionDelay: `${i * 0.1}s`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandsSection;
