import { useState, useEffect } from "react";
import LoginPage from "@/components/LoginPage";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/StatCard";
import ActivityChart from "@/components/ActivityChart";
import RecentActivity from "@/components/RecentActivity";
import BotStatus from "@/components/BotStatus";
import TopCommands from "@/components/TopCommands";
import UsersSection from "@/components/sections/UsersSection";
import BroadcastSection from "@/components/sections/BroadcastSection";
import SettingsSection from "@/components/sections/SettingsSection";
import LogsSection from "@/components/sections/LogsSection";
import MessagesSection from "@/components/sections/MessagesSection";
import CommandsSection from "@/components/sections/CommandsSection";
import ModerationSection from "@/components/sections/ModerationSection";
import IntegrationsSection from "@/components/sections/IntegrationsSection";
import AdminsSection from "@/components/sections/AdminsSection";
import { api } from "@/lib/api";

interface PanelUser {
  id: number;
  login: string;
  displayName: string;
  role: string;
}

interface StatsData {
  totalUsers?: number;
  messagesToday?: number;
  commandsToday?: number;
  activeSessions?: number;
  usersChange?: string;
  messagesChange?: string;
  weeklyActivity?: { day: string; value: number }[];
  topCommands?: { name: string; count: number; percentage: number }[];
  blockedUsers?: number;
}

function parseChange(val?: string): { change: string; changeType: "up" | "down" | "neutral" } {
  if (!val) return { change: "0%", changeType: "neutral" };
  const num = parseFloat(val);
  if (num > 0) return { change: val.startsWith("+") ? val : `+${val}`, changeType: "up" };
  if (num < 0) return { change: val, changeType: "down" };
  return { change: val, changeType: "neutral" };
}

const defaultActivity = [
  { day: "Пн", value: 0 }, { day: "Вт", value: 0 }, { day: "Ср", value: 0 },
  { day: "Чт", value: 0 }, { day: "Пт", value: 0 }, { day: "Сб", value: 0 }, { day: "Вс", value: 0 },
];

const sectionTitles: Record<string, string> = {
  dashboard: "Панель управления",
  messages: "Сообщения",
  users: "Пользователи",
  commands: "Команды",
  broadcast: "Рассылка",
  moderation: "Модерация",
  integrations: "Интеграции",
  logs: "Логи",
  admins: "Администраторы",
  settings: "Настройки",
};

const Index = () => {
  const [user, setUser] = useState<PanelUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState<StatsData>({});
  const [logs, setLogs] = useState<Array<{
    id: number; telegramId: number; username: string; firstName: string;
    direction: string; text: string; createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("panel_token");
    const savedUser = localStorage.getItem("panel_user");
    if (token && savedUser) {
      api.getMe()
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem("panel_token");
          localStorage.removeItem("panel_user");
        })
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([api.getStats(), api.getLogs()])
      .then(([statsData, logsData]) => {
        setStats(statsData);
        setLogs(logsData.logs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleAuth = (_token: string, userData: PanelUser) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch { /* empty */ }
    localStorage.removeItem("panel_token");
    localStorage.removeItem("panel_user");
    setUser(null);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl gradient-bg animate-pulse-glow" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onAuth={handleAuth} />;
  }

  const usersChange = parseChange(stats.usersChange);
  const messagesChange = parseChange(stats.messagesChange);

  const statCards = [
    { title: "Пользователей", value: (stats.totalUsers || 0).toLocaleString(), ...usersChange, icon: "Users", gradient: true },
    { title: "Сообщений сегодня", value: (stats.messagesToday || 0).toLocaleString(), ...messagesChange, icon: "MessageCircle" },
    { title: "Команд обработано", value: (stats.commandsToday || 0).toLocaleString(), change: "+0%", changeType: "neutral" as const, icon: "Terminal" },
    { title: "Активных сессий", value: (stats.activeSessions || 0).toLocaleString(), change: "0%", changeType: "neutral" as const, icon: "Activity" },
  ];

  const activityData = stats.weeklyActivity || defaultActivity;
  const topCommands = stats.topCommands || [];

  const recentActivities = logs.slice(0, 5).map((log, i) => ({
    id: log.id || i,
    user: log.firstName || log.username || `ID ${log.telegramId}`,
    action: log.direction === "in" ? `отправил: ${(log.text || "").slice(0, 40)}` : `получил: ${(log.text || "").slice(0, 40)}`,
    time: new Date(log.createdAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
    icon: log.direction === "in" ? "MessageCircle" : "Send",
    color: log.direction === "in" ? "text-blue-400" : "text-emerald-400",
    bg: log.direction === "in" ? "bg-blue-400/10" : "bg-emerald-400/10",
  }));

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <StatCard key={stat.title} {...stat} delay={`stagger-${i + 1}`} />
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <ActivityChart data={activityData} />
              </div>
              <BotStatus />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RecentActivity activities={recentActivities} />
              <TopCommands commands={topCommands} />
            </div>
          </div>
        );
      case "users": return <UsersSection />;
      case "messages": return <MessagesSection />;
      case "broadcast": return <BroadcastSection />;
      case "settings": return <SettingsSection />;
      case "logs": return <LogsSection />;
      case "commands": return <CommandsSection commands={topCommands} />;
      case "moderation": return <ModerationSection />;
      case "integrations": return <IntegrationsSection />;
      case "admins": return <AdminsSection />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        userRole={user.role}
        onLogout={handleLogout}
      />
      <main className={`${collapsed ? "ml-[72px]" : "ml-[240px]"} p-8 transition-all duration-300`}>
        <DashboardHeader
          userName={user.displayName}
          userRole={user.role}
          sectionTitle={sectionTitles[activeSection] || "Панель управления"}
        />
        {loading && activeSection === "dashboard" ? (
          <div className="glass rounded-2xl p-12 text-center opacity-0 animate-fade-in">
            <p className="text-muted-foreground text-sm">Загрузка данных...</p>
          </div>
        ) : (
          renderSection()
        )}
      </main>
    </div>
  );
};

export default Index;
