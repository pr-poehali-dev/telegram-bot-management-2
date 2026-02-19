import Icon from "@/components/ui/icon";

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
  sectionTitle: string;
}

const roleTitles: Record<string, string> = {
  owner: "Владелец",
  admin: "Администратор",
};

const DashboardHeader = ({ userName, userRole, sectionTitle }: DashboardHeaderProps) => {
  return (
    <header className="flex items-center justify-between mb-8 opacity-0 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{sectionTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Добро пожаловать, {userName}!
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative glass glass-hover rounded-xl p-2.5 group">
          <Icon name="Bell" size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--destructive))]" />
        </button>

        <div className="flex items-center gap-3 glass rounded-xl px-4 py-2.5">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <span className="text-white text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-[11px] text-muted-foreground">{roleTitles[userRole] || userRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
