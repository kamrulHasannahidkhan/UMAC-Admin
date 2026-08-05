"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  BookOpenCheck,
  PanelTop,
  HandCoins,
  Leaf,
  ChevronDown,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: any;
  children?: { label: string; href: string; icon: any }[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Hero Slides", href: "/hero-slides", icon: ImageIcon },
  { label: "About Section", href: "/about", icon: FileText },
  {
    label: "About Page",
    href: "/about-page",
    icon: BookOpenCheck,
    children: [
      { label: "About Banner", href: "/about-banner", icon: PanelTop },
      { label: "Admission & Aid", href: "/admission-aid", icon: HandCoins },
      { label: "Sustainability", href: "/sustainability", icon: Leaf },
    ],
  },
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
  const [openGroup, setOpenGroup] = useState<string | null>(
    navItems.find((item) => item.children?.some((c) => c.href === pathname))?.label ?? null
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-2">
        <LayoutDashboard size={22} className="text-green-500" />
        <div>
          <p className="font-semibold text-white leading-tight">UAMC Admin</p>
          <p className="text-xs text-gray-500 leading-tight">Content management</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const hasChildren = !!item.children?.length;
          const isGroupOpen = openGroup === item.label;

          return (
            <div key={item.href}>
              <div className="flex items-center">
                <Link
                  href={item.href}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-green-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
                {hasChildren && (
                  <button onClick={() => setOpenGroup(isGroupOpen ? null : item.label)} className="px-2 py-2.5 text-gray-500 hover:text-white">
                    <ChevronDown size={16} className={`transition-transform ${isGroupOpen ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>

              {hasChildren && isGroupOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gray-800 pl-3">
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          childActive ? "bg-green-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <ChildIcon size={16} />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-500">
        Uttara Adhunik Medical College
      </div>
    </aside>
  );
}
