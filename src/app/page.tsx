import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 font-sans text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <main className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300 backdrop-blur-md">
          <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
          Версия 1.0 в разработке
        </div>

        <h1 className="mb-6 max-w-4xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          Единая база знаний для вашей команды
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-zinc-400 sm:text-xl">
          Создавайте, организуйте и обсуждайте документацию в одном месте.
          Быстрый поиск, версионирование и удобный Markdown-редактор.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            className="flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 font-medium text-white transition-all hover:scale-105 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            href="/login"
          >
            Войти / Начать
          </Link>
          <Link
            className="flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-8 font-medium text-white backdrop-blur-md transition-all hover:bg-white/10"
            href="/dashboard"
          >
            Документация
          </Link>
        </div>
      </main>

      {/* Feature cards placeholders */}
      <div className="relative z-10 mt-16 grid w-full max-w-5xl grid-cols-1 gap-6 px-6 sm:grid-cols-3">
        {[
          { title: "Структура", desc: "Удобная иерархия страниц и категорий для быстрого доступа" },
          { title: "Совместная работа", desc: "Оставляйте комментарии, упоминания и обсуждайте изменения" },
          { title: "Мгновенный поиск", desc: "Находите нужную информацию за миллисекунды по всем проектам" },
        ].map((feature, i) => (
          <div key={i} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10">
            <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
            <p className="text-zinc-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
