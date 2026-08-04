import Link from "next/link";
import {
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
  ArrowRight,
} from "lucide-react";

const sections = [
  { label: "Hero Slides", href: "/hero-slides", icon: ImageIcon, desc: "Homepage hero slider — title, badge, background images" },
  { label: "About Section", href: "/about", icon: FileText, desc: "About UAMC block with two images and mission/vision" },
  { label: "Stats Banner", href: "/stats", icon: BarChart3, desc: "Background image with repeatable number + label stats" },
  { label: "Department Search", href: "/department-search", icon: Search, desc: "Search box, popular searches, and the one Popular Program" },
  { label: "Page Banner", href: "/page-banner", icon: Layers, desc: "Reusable page header banner, e.g. Admission page" },
  { label: "Facilities", href: "/facilities", icon: Building2, desc: "Repeatable facility list with image, title, and description" },
  { label: "Principal Message", href: "/principal-message", icon: UserSquare2, desc: "Principal's photo, signature, and welcome message" },
  { label: "Campus Life", href: "/campus-life", icon: Users, desc: "Heading, description, and repeatable image cards" },
  { label: "Alumni Events", href: "/alumni-events", icon: CalendarDays, desc: "Repeatable event list with date, time, location" },
  { label: "News", href: "/news", icon: Newspaper, desc: "Latest news heading and repeatable blog-style posts" },
  { label: "Testimonials", href: "/testimonials", icon: MessageSquareQuote, desc: "Student feedback cards with rating, quote, avatar" },
  { label: "Notice & Publication", href: "/notice-items", icon: Bell, desc: "Two tabbed, scrollable boards — Notice Board and Publication" },
];

export default function DashboardPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-2">UAMC Content Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage everything shown on the public site from here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-start gap-4 bg-white border border-gray-200 rounded-lg p-5 hover:border-green-400 hover:shadow-sm transition-all group"
            >
              <div className="bg-green-50 text-green-600 rounded-lg p-3 shrink-0">
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">{s.label}</p>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-green-600 shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
