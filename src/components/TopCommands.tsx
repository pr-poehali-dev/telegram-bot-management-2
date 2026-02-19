import Icon from "@/components/ui/icon";

const commands = [
  { name: "/start", count: 1247, percentage: 85 },
  { name: "/help", count: 893, percentage: 61 },
  { name: "/menu", count: 654, percentage: 45 },
  { name: "/settings", count: 342, percentage: 23 },
  { name: "/feedback", count: 178, percentage: 12 },
];

const TopCommands = () => {
  return (
    <div className="glass rounded-2xl p-6 opacity-0 animate-fade-in stagger-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Топ команд</h3>
          <p className="text-sm text-muted-foreground mt-0.5">За последние 7 дней</p>
        </div>
        <Icon name="Terminal" size={18} className="text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {commands.map((cmd, i) => (
          <div key={cmd.name} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <code className="text-sm font-medium text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 px-2 py-0.5 rounded-md">
                  {cmd.name}
                </code>
              </div>
              <span className="text-xs text-muted-foreground">
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
        ))}
      </div>
    </div>
  );
};

export default TopCommands;
