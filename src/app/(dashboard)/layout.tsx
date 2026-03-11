import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-zinc-950 min-h-screen text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* A subtle top border glow or top bar could go here */}
                <div className="flex-1 overflow-y-auto bg-zinc-900/30 rounded-tl-2xl border-t border-l border-white/5">
                    {children}
                </div>
            </main>
        </div>
    );
}
