import { Home, Users, Settings, Bell, MessageCircle, Heart, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
  const navItems = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/timeline", icon: Users, label: "Friends" },
    { to: "/mood", icon: Heart, label: "Mood" },
    { to: "/journal", icon: BookOpen, label: "Dagboek" },
    { to: "/settings", icon: Settings, label: "Instellingen" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 px-2 sm:px-4 py-2 safe-area-pb z-50 shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-1 sm:p-2 rounded-xl transition-all duration-200 min-w-0 ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`
            }
          >
            <Icon size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-xs font-medium truncate max-w-[60px] sm:max-w-none">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;