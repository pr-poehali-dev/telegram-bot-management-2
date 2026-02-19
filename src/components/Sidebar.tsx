import { useState } from "react";
import Icon from "@/components/ui/icon";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Статистика", icon: "BarChart3" },
  { id: "messages", label: "Сообщения", icon: "MessageCircle" },
  { id: "users", label: "Пользователи", icon: "Users" },
  { id: "commands", label: "Команды", icon: "Terminal" },
  { id: "broadcast", label: "Рассылка", icon: "Send" },
  { id: "moderation", label: "Модерация", icon: "Shield" },
  { id: "integrations", label: "Интеграции", icon: "Plug" },
  { id: "logs", label: "Логи", icon: "ScrollText" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[240px]"
      } bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]`}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[hsl(var(--sidebar-border))]">
        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shrink-0 animate-pulse-glow">
          <Icon name="Bot" size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <p className="font-semibold text-sm text-[hsl(var(--sidebar-accent-foreground))]">TG Bot Panel</p>
            <p className="text-[11px] text-[hsl(var(--sidebar-foreground))]">Управление ботом</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? "gradient-bg text-white shadow-lg shadow-[hsl(250,90%,65%)]/20"
                  : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                }`}
            >
              <Icon
                name={item.icon}
                size={18}
                className={`shrink-0 transition-transform duration-200 ${!isActive ? "group-hover:scale-110" : ""}`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-[hsl(var(--sidebar-border))]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] transition-all duration-200"
        >
          <Icon
            name={collapsed ? "PanelLeftOpen" : "PanelLeftClose"}
            size={18}
            className="transition-transform duration-300"
          />
          {!collapsed && <span>Свернуть</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
