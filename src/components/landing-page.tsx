import dynamic from "next/dynamic";
import {
  Github,
  HardDrive,
  FolderOpen,
  Upload,
  Search,
  Star,
  Trash2,
  Eye,
  Lock,
  Smartphone,
  Palette,
  Clock,
  ArrowRight,
  FileCode2,
  FileImage,
  FileVideo,
  FileText,
  Keyboard,
  Layers,
} from "lucide-react";
import { AppLogo, AppLogoMinimal } from "@/components/ui/app-logo";
import { signIn } from "@/lib/auth";

const HeroScene = dynamic(
  () => import("@/components/hero-scene").then((m) => m.HeroScene),
  { ssr: false }
);

const features = [
  {
    icon: HardDrive,
    title: "GitHub como Backend",
    description:
      "Os teus repositórios GitHub servem como armazenamento. Sem servidores extra, sem custos adicionais.",
  },
  {
    icon: FolderOpen,
    title: "Gestão de Ficheiros",
    description:
      "Cria pastas, renomeia, move e organiza ficheiros com drag-and-drop intuitivo.",
  },
  {
    icon: Upload,
    title: "Upload Simples",
    description:
      "Arrasta e larga ficheiros diretamente no browser. Suporte para uploads em massa.",
  },
  {
    icon: Eye,
    title: "Preview Integrado",
    description:
      "Pré-visualiza imagens, vídeos, áudio, PDFs, markdown e código com syntax highlighting.",
  },
  {
    icon: Search,
    title: "Pesquisa Rápida",
    description:
      "Encontra qualquer ficheiro instantaneamente com pesquisa full-text no repositório.",
  },
  {
    icon: Star,
    title: "Favoritos & Recentes",
    description:
      "Marca ficheiros como favoritos e acede rapidamente aos mais recentes.",
  },
  {
    icon: Trash2,
    title: "Lixeira Segura",
    description:
      "Ficheiros eliminados ficam na lixeira 30 dias antes de serem removidos permanentemente.",
  },
  {
    icon: Palette,
    title: "Pastas Coloridas",
    description:
      "Personaliza as cores das pastas com 10 opções para melhor organização visual.",
  },
  {
    icon: Keyboard,
    title: "Atalhos de Teclado",
    description:
      "Navegação rápida com atalhos — copiar, colar, mover, eliminar e mais.",
  },
  {
    icon: Clock,
    title: "Histórico de Versões",
    description:
      "Acede ao histórico completo de alterações de cada ficheiro via Git.",
  },
  {
    icon: Lock,
    title: "Seguro & Privado",
    description:
      "Os dados ficam na tua conta GitHub. Sem servidores intermédios a guardar ficheiros.",
  },
  {
    icon: Smartphone,
    title: "PWA & Responsivo",
    description:
      "Instala como app nativa no telemóvel. Interface adaptada a qualquer ecrã.",
  },
];

const previewTypes = [
  { icon: FileImage, label: "Imagens", ext: "PNG, JPG, SVG, GIF, WebP" },
  { icon: FileVideo, label: "Vídeo & Áudio", ext: "MP4, WebM, MP3, WAV" },
  { icon: FileText, label: "Documentos", ext: "PDF, Markdown, TXT" },
  { icon: FileCode2, label: "Código", ext: "JS, TS, Python, Go, Rust..." },
];

const techStack = [
  { name: "Next.js 14", description: "App Router, Server Actions, SSR" },
  { name: "React 18", description: "Server & Client Components" },
  { name: "TypeScript", description: "Tipagem estrita end-to-end" },
  { name: "Tailwind CSS", description: "Design system Adwaita dark/light" },
  { name: "Radix UI", description: "Componentes acessíveis e compostos" },
  { name: "NextAuth.js", description: "Autenticação OAuth com GitHub" },
  { name: "TanStack Query", description: "Cache, sync & data fetching" },
  { name: "Octokit", description: "GitHub REST API client" },
  { name: "Lucide", description: "Iconografia consistente" },
  { name: "Sonner", description: "Notificações toast elegantes" },
  { name: "JSZip", description: "Compressão & extração de ZIPs" },
  { name: "Prism", description: "Syntax highlighting para código" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-foreground/[0.08] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <AppLogoMinimal className="h-6 w-6" />
            <span className="text-base font-bold tracking-tight">
              Git<span className="text-[#ff7800]">Drive</span>
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-[13px] text-muted-foreground sm:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Funcionalidades
            </a>
            <a href="#preview" className="transition-colors hover:text-foreground">
              Preview
            </a>
            <a href="#stack" className="transition-colors hover:text-foreground">
              Stack
            </a>
          </nav>
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/drive" });
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#ff7800] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#e66100]"
            >
              <Github className="h-4 w-4" />
              Entrar
            </button>
          </form>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* 3D background */}
        <HeroScene />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background pointer-events-none" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Logo with glow */}
            <div className="relative mx-auto mb-10 flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
              <div className="absolute inset-0 rounded-3xl bg-[#ff7800]/20 blur-2xl" />
              <AppLogo className="relative h-28 w-28 sm:h-32 sm:w-32 drop-shadow-2xl" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Os teus ficheiros.
              <br />
              <span className="bg-gradient-to-r from-[#ff7800] via-[#e66100] to-[#c64600] bg-clip-text text-transparent">
                O teu GitHub.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Transforma qualquer repositório GitHub numa drive pessoal.
              Upload, organiza e pré-visualiza ficheiros — direto no browser.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/drive" });
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-2.5 rounded-lg bg-[#ff7800] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#ff7800]/25 transition-all hover:bg-[#e66100] hover:shadow-xl hover:shadow-[#e66100]/30"
                >
                  <Github className="h-5 w-5" />
                  Começar com GitHub
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#ff7800]/20 px-7 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:border-[#ff7800]/40 hover:text-foreground"
              >
                Ver no GitHub
              </a>
            </div>
            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground/50">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                Dados no teu GitHub
              </span>
              <span className="hidden sm:inline text-foreground/10">|</span>
              <span className="flex items-center gap-1.5">
                <Github className="h-3 w-3" />
                Open source
              </span>
              <span className="hidden sm:inline text-foreground/10">|</span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="h-3 w-3" />
                PWA ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-foreground/[0.06] bg-[hsl(var(--view))]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Tudo o que precisas numa drive
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Funcionalidades pensadas para gerir ficheiros de forma rápida e intuitiva.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-foreground/[0.06] bg-card p-5 transition-colors hover:border-foreground/[0.12]"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff7800]/10">
                  <feature.icon className="h-[18px] w-[18px] text-[#ff7800]" />
                </div>
                <h3 className="text-[13px] font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Types */}
      <section id="preview" className="border-t border-foreground/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Preview de qualquer ficheiro
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Pré-visualiza diretamente no browser sem fazer download.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {previewTypes.map((type) => (
              <div
                key={type.label}
                className="flex flex-col items-center rounded-xl border border-foreground/[0.06] bg-card p-6 text-center"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff7800]/10">
                  <type.icon className="h-6 w-6 text-[#ff7800]" />
                </div>
                <h3 className="text-sm font-semibold">{type.label}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {type.ext}
                </p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="mt-20 mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Como funciona</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Três passos para começar a usar.
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Autentica com GitHub",
                description:
                  "Faz login com a tua conta GitHub via OAuth. Permissão de leitura e escrita nos repositórios.",
              },
              {
                step: "02",
                title: "Escolhe um repositório",
                description:
                  "Seleciona o repositório que queres usar como drive. Pode ser novo ou existente.",
              },
              {
                step: "03",
                title: "Gere os teus ficheiros",
                description:
                  "Upload, organiza, pré-visualiza e partilha ficheiros como numa drive normal.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#ff7800] text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="stack" className="border-t border-foreground/[0.06] bg-[hsl(var(--view))]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff7800]/10">
              <Layers className="h-[18px] w-[18px] text-[#ff7800]" />
            </div>
            <h2 className="text-2xl font-bold sm:text-3xl">Tech Stack</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Construído com tecnologias modernas e open source.
            </p>
          </div>
          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-start gap-3 rounded-lg border border-foreground/[0.06] bg-card px-4 py-3"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#ff7800]" />
                <div>
                  <span className="text-[13px] font-semibold">{tech.name}</span>
                  <p className="text-[12px] text-muted-foreground">
                    {tech.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-foreground/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-xl text-center">
            <AppLogo className="mx-auto h-14 w-14" />
            <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
              Pronto para começar?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Cria a tua drive pessoal em segundos. Basta autenticar com GitHub.
            </p>
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/drive" });
              }}
              className="mt-8"
            >
              <button
                type="submit"
                className="inline-flex items-center gap-2.5 rounded-lg bg-[#ff7800] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff7800]/25 transition-all hover:bg-[#e66100] hover:shadow-xl hover:shadow-[#e66100]/30"
              >
                <Github className="h-5 w-5" />
                Começar com GitHub
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/[0.06] bg-[hsl(var(--view))]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <AppLogo className="h-5 w-5" />
            <span>GitDrive</span>
          </div>
          <p className="text-[12px] text-muted-foreground/60">
            Open source · Os teus dados, o teu GitHub.
          </p>
        </div>
      </footer>
    </div>
  );
}
