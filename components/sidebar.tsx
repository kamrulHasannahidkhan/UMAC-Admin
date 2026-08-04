"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image as ImageIcon,
  FileText,
  BarChart3,
  Search,
  Layers,
  Building2,
  UserSquare2,
  Users,
  CalendarDays,
  Newspaper,
  MessageSquareQuote,
  Bell,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Hero Slides", href: "/hero-slides", icon: ImageIcon },
  { label: "About Section", href: "/about", icon: FileText },
  { label: "Stats Banner", href: "/stats", icon: BarChart3 },
  { label: "Department Search", href: "/department-search", icon: Search },
  { label: "Page Banner", href: "/page-banner", icon: Layers },
  { label: "Facilities", href: "/facilities", icon: Building2 },
  { label: "Principal Message", href: "/principal-message", icon: UserSquare2 },
  { label: "Campus Life", href: "/campus-life", icon: Users },
  { label: "Alumni Events", href: "/alumni-events", icon: CalendarDays },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Testimonials", href: "/testimonials", icon: MessageSquareQuote },
  { label: "Notice & Publication", href: "/notice-items", icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-2">
        <LayoutDashboard size={22} className="text-green-500" />
        <div>
          <p className="font-semibold text-white leading-tight">UAMC Admin</p>
          <p className="text-xs text-gray-500 leading-tight">Content management</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-500">
        Uttara Adhunik Medical College
      </div>
    </aside>
  );
}
