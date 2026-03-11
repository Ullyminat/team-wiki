export default function DashboardLoading() {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full animate-pulse">
            <div className="flex justify-between items-center mb-10">
                <div className="space-y-3">
                    <div className="h-9 w-64 bg-white/5 rounded-lg"></div>
                    <div className="h-4 w-48 bg-white/5 rounded-lg"></div>
                </div>
                <div className="h-10 w-32 bg-white/5 rounded-xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl"></div>
                ))}
            </div>
        </div>
    );
}
