import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import { Camera, GalleryHorizontalEnd, LayoutDashboard, LogOut, PanelLeft, Settings, Sprout, Clock3 } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuItems = [{ icon: LayoutDashboard, label: "Overview", path: "/dashboard" }, { icon: Camera, label: "AI analysis", path: "/upload" }, { icon: Clock3, label: "History", path: "/history" }, { icon: GalleryHorizontalEnd, label: "Gallery", path: "/gallery" }, { icon: Settings, label: "Profile", path: "/profile" }];
const SIDEBAR_WIDTH_KEY = "sidebar-width";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => { try { return Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || 280; } catch { return 280; } });
  const { loading, user } = useAuth();
  useEffect(() => { try { localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()); } catch {} }, [sidebarWidth]);
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <div className="flex min-h-screen items-center justify-center bg-[#f8f8f2] p-6"><div className="w-full max-w-md rounded-[2rem] border border-[#dce7d9] bg-white p-8 text-center shadow-sm"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#d8ecce] text-[#1e6b3d]"><Sprout className="h-7 w-7" /></span><h1 className="mt-6 font-display text-2xl font-semibold text-[#234d31]">Sign in to continue</h1><p className="mt-3 text-sm leading-6 text-[#718071]">This workspace is private. Sign in to access your analyses, gallery, and profile.</p><Button onClick={() => { window.location.href = "/login"; }} size="lg" className="mt-7 w-full bg-[#1d6a3b] hover:bg-[#15562f]">Sign in</Button></div></div>;
  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent></SidebarProvider>;
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();
  useEffect(() => { if (isCollapsed) setIsResizing(false); }, [isCollapsed]);
  useEffect(() => { const move = (event: MouseEvent) => { if (!isResizing) return; const left = sidebarRef.current?.getBoundingClientRect().left ?? 0; const next = event.clientX - left; if (next >= 200 && next <= 480) setSidebarWidth(next); }; const up = () => setIsResizing(false); if (isResizing) { document.addEventListener("mousemove", move); document.addEventListener("mouseup", up); document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; } return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); document.body.style.cursor = ""; document.body.style.userSelect = ""; }; }, [isResizing, setSidebarWidth]);
  return <><div className="relative" ref={sidebarRef}><Sidebar collapsible="icon" className="border-r-0"><SidebarHeader className="h-16 justify-center"><div className="flex w-full items-center gap-3 px-2"><button onClick={toggleSidebar} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Toggle navigation"><PanelLeft className="h-4 w-4 text-[#4b8d5c]" /></button>{!isCollapsed && <div className="flex min-w-0 items-center gap-2"><Sprout className="h-4 w-4 text-[#3b8551]" /><span className="truncate font-display font-semibold tracking-tight">AgroSmart AI</span></div>}</div></SidebarHeader><SidebarContent className="gap-0"><SidebarMenu className="px-2 py-1">{menuItems.map((item) => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location === item.path} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-10 font-normal"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter className="p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[collapsible=icon]:justify-center"><Avatar className="h-9 w-9 border"><AvatarFallback className="text-xs font-medium">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-medium leading-none">{user?.name || "Farmer"}</p><p className="mt-1.5 truncate text-xs text-muted-foreground">{user?.email || "Connected account"}</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter></Sidebar><div className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/20 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => setIsResizing(true)} /></div><SidebarInset>{isMobile && <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-2 backdrop-blur"><div className="flex items-center gap-2"><SidebarTrigger className="h-9 w-9 rounded-lg bg-background" /><span className="text-sm font-semibold text-foreground">{activeMenuItem?.label ?? "Menu"}</span></div></div>}<main className="flex-1 p-4">{children}</main></SidebarInset></>;
}
