import Icon from "@/components/ui/icon";

const BotStatus = () => {
  return (
    <div className="glass rounded-2xl p-6 opacity-0 animate-fade-in stagger-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground">Статус бота</h3>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-400">Онлайн</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>Аптайм</span>
          </div>
          <span className="text-sm font-medium text-foreground">14д 7ч 32м</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Zap" size={14} />
            <span>Время ответа</span>
          </div>
          <span className="text-sm font-medium text-foreground">~120мс</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Server" size={14} />
            <span>Нагрузка CPU</span>
          </div>
          <span className="text-sm font-medium text-foreground">12%</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">RAM использовано</span>
            <span className="text-xs font-medium text-foreground">256 / 512 MB</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full w-1/2 gradient-bg rounded-full transition-all duration-1000" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:shadow-lg hover:shadow-[hsl(250,90%,65%)]/20 transition-all duration-300">
            <Icon name="RotateCcw" size={14} />
            Перезапуск
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl glass glass-hover text-foreground text-sm font-medium">
            <Icon name="Pause" size={14} />
            Остановить
          </button>
        </div>
      </div>
    </div>
  );
};

export default BotStatus;
