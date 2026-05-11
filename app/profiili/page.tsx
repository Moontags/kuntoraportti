import BottomNav from "@/components/ui/BottomNav";
import Header from "@/components/ui/Header";

export default function ProfiiliPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-16 sm:pb-0">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-semibold text-slate-900">Profiili</h1>
        <p className="mt-2 text-sm text-slate-600">Profiilin muokkaus lisataan tulevassa vaiheessa.</p>
      </main>
      <BottomNav />
    </div>
  );
}
