"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import { useState, useEffect } from "react";

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

  Phone,

  Mail,

  GraduationCap,

  Briefcase,

  Calendar,

  ChevronDown,

  GalleryHorizontalEnd,

  ClipboardList,

  School,

  FlaskConical,

  LucideIcon,

  ShieldCheck,

} from "lucide-react";



type ChildNavItem = {

  label: string;

  href: string;

  icon: LucideIcon;

};



type NavItem = {

  label: string;

  href?: string;

  icon: LucideIcon;

  children?: ChildNavItem[];

};



const navItems: NavItem[] = [

  { label: "Dashboard", href: "/", icon: LayoutDashboard },

  { label: "Hero Slides", href: "/hero-slides", icon: ImageIcon },

  { label: "About Section", href: "/about", icon: FileText },

  {

    label: "About Page",

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

  {

    label: "Facilities",

    icon: Building2,

    children: [

      { label: "Facility Banner", href: "/facility-banner", icon: PanelTop },

      { label: "Departments", href: "/facility-departments", icon: School },

      { label: "Publications", href: "/facility-publications", icon: FileText },

      { label: "Seminar / Lab / Hostel", href: "/facility-accordion", icon: FlaskConical },

    ],

  },

  { label: "Principal Message", href: "/principal-message", icon: UserSquare2 },

  { label: "Campus Life", href: "/campus-life", icon: Users },

  { label: "Alumni Events", href: "/alumni-events", icon: CalendarDays },

  { label: "News", href: "/news", icon: Newspaper },

  { label: "Testimonials", href: "/testimonials", icon: MessageSquareQuote },

  {

    label: "Notice & Media",

    icon: Bell,

    children: [

      { label: "Notice Items", href: "/notice-items", icon: Bell },

      { label: "Notice Banner", href: "/notice-banner", icon: PanelTop },

      { label: "Event Gallery", href: "/gallery", icon: GalleryHorizontalEnd },

    ],

  },

  {

    label: "Admission",

    icon: ClipboardList,

    children: [

      { label: "Admission Docs", href: "/admission-documents", icon: ClipboardList },

      { label: "Admission Banner", href: "/admission-banner", icon: PanelTop },

    ],

  },

  {

    label: "Contact Us",

    icon: Phone,

    children: [

      { label: "Contact Banner", href: "/contact-banner", icon: PanelTop },

      { label: "Contact Info", href: "/contact-info", icon: Phone },

    ],

  },

  { label: "Newsletter", href: "/newsletter", icon: Mail },

  { label: "Alumni", href: "/alumni", icon: GraduationCap },

  { label: "Career Postings", href: "/career-posts", icon: Briefcase },

  { label: "Page Banners", href: "/page-banners", icon: PanelTop },

  { label: "Events", href: "/event-posts", icon: Calendar },

  { label: "Student Results", href: "/student-results", icon: GraduationCap },

  { label: "Student Portal Posts", href: "/student-portal-posts", icon: Newspaper },

];



export default function Sidebar() {

  const pathname = usePathname();



  // Find initial open accordion group based on current URL path

  const [openGroup, setOpenGroup] = useState<string | null>(null);



  useEffect(() => {

    const activeGroup = navItems.find((item) =>

      item.children?.some((c) => c.href === pathname)

    );

    if (activeGroup) {

      setOpenGroup(activeGroup.label);

    }

  }, [pathname]);



  const toggleGroup = (label: string) => {

    setOpenGroup((prev) => (prev === label ? null : label));

  };



  return (

    <aside

      className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 shadow-2xl z-50 select-none"

      style={{ backgroundColor: "#090d16" }}

    >

      {/* Sidebar Header Branding */}

      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center gap-3 shrink-0">

        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">

          <ShieldCheck size={20} />

        </div>

        <div className="overflow-hidden">

          <h2 className="font-bold text-white text-sm tracking-tight truncate">UAMC Admin</h2>

          <p className="text-[11px] font-medium text-slate-400 truncate">Content Management System</p>

        </div>

      </div>



      {/* Navigation Links Area */}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">

        {navItems.map((item) => {

          const Icon = item.icon;

          const hasChildren = Boolean(item.children && item.children.length > 0);

         

          const isDirectActive = item.href ? pathname === item.href : false;

          const isChildActive = hasChildren && item.children?.some((c) => c.href === pathname);

          const isGroupOpen = openGroup === item.label;



          return (

            <div key={item.label} className="w-full">

              {hasChildren ? (

                /* Accordion Parent Item Button */

                <button

                  type="button"

                  onClick={() => toggleGroup(item.label)}

                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${

                    isChildActive

                      ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/40"

                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"

                  }`}

                >

                  <div className="flex items-center gap-3">

                    <Icon size={18} className={isChildActive ? "text-emerald-400" : "text-slate-400"} />

                    <span>{item.label}</span>

                  </div>

                  <ChevronDown

                    size={15}

                    className={`transition-transform duration-200 text-slate-500 ${

                      isGroupOpen ? "rotate-180 text-emerald-400" : ""

                    }`}

                  />

                </button>

              ) : (

                /* Standard Single Link Item */

                <Link

                  href={item.href || "#"}

                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${

                    isDirectActive

                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"

                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"

                  }`}

                >

                  <Icon size={18} className={isDirectActive ? "text-white" : "text-slate-400"} />

                  <span>{item.label}</span>

                </Link>

              )}



              {/* Collapsible Sub-menu Items */}

              {hasChildren && isGroupOpen && (

                <div className="ml-4 mt-1 space-y-1 border-l border-slate-800/80 pl-3 py-1">

                  {item.children!.map((child) => {

                    const ChildIcon = child.icon;

                    const childActive = pathname === child.href;

                    return (

                      <Link

                        key={child.href}

                        href={child.href}

                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${

                          childActive

                            ? "bg-emerald-600/90 text-white shadow-xs"

                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"

                        }`}

                      >

                        <ChildIcon size={15} className={childActive ? "text-white" : "text-slate-400"} />

                        <span>{child.label}</span>

                      </Link>

                    );

                  })}

                </div>

              )}

            </div>

          );

        })}

      </nav>



      {/* Sidebar Footer */}

      <div className="px-6 py-4 border-t border-slate-800/80 shrink-0 bg-slate-950/50">

        <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Uttara Adhunik</p>

        <p className="text-[10px] text-slate-400">Medical College Portal</p>

      </div>

    </aside>

  );

}