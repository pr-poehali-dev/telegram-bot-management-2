import Icon from "@/components/ui/icon";

const DashboardHeader = () => {
  return (
    <header className="flex items-center justify-between mb-8 opacity-0 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Панель управления
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Добро пожаловать! Вот обзор вашего бота на сегодня.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative glass glass-hover rounded-xl p-2.5 group">
          <Icon name="Bell" size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--destructive))]" />
        </button>

        <button className="flex items-center gap-3 glass glass-hover rounded-xl px-4 py-2.5">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <span className="text-white text-sm font-semibold">A</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Админ</p>
            <p className="text-[11px] text-muted-foreground">Владелец</p>
          </div>
          <Icon name="ChevronDown" size={14} className="text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
