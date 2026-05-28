import {
  ArrowRight, Cloud, Eye, Search, Upload, Shield, LayoutGrid,
  FileImage, FileVideo, FileAudio, FileType2, ScrollText,
  FileSpreadsheet, FileText, File,
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
}

const features = [
  {
    icon: Eye,
    title: 'Instant Previews',
    desc: 'View images, video, audio, PDFs, Word documents, and spreadsheets inline — no downloading required.',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
  {
    icon: Upload,
    title: 'Drag & Drop Upload',
    desc: 'Drop any file onto the upload zone and it goes straight to the cloud — no config, no fuss.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Search,
    title: 'Smart Search & Sort',
    desc: 'Find files instantly with real-time search. Sort by name, size, file type, or upload date.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Cloud,
    title: 'Secure Cloud Storage',
    desc: 'Files stored on Backblaze B2 with presigned URLs for secure, time-limited access links.',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  {
    icon: Shield,
    title: 'Full File Control',
    desc: 'Update or replace files in place. Delete what you no longer need. You stay in charge.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: LayoutGrid,
    title: 'Grid & List Views',
    desc: 'Switch between a visual card grid and a compact list view to match how you work.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
];

const fileTypes = [
  { Icon: FileImage,      label: 'Images',       exts: 'JPG, PNG, GIF, WebP', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { Icon: FileVideo,      label: 'Video',         exts: 'MP4, MOV, WebM, AVI', color: 'text-violet-500',  bg: 'bg-violet-50'  },
  { Icon: FileAudio,      label: 'Audio',         exts: 'MP3, WAV, FLAC, AAC', color: 'text-amber-500',   bg: 'bg-amber-50'   },
  { Icon: FileType2,      label: 'PDF',           exts: 'Rendered inline',     color: 'text-red-500',     bg: 'bg-red-50'     },
  { Icon: ScrollText,     label: 'Documents',     exts: 'DOCX, DOC, ODT',      color: 'text-blue-500',    bg: 'bg-blue-50'    },
  { Icon: FileSpreadsheet,label: 'Spreadsheets',  exts: 'CSV as live table',   color: 'text-green-600',   bg: 'bg-green-50'   },
  { Icon: FileText,       label: 'Text',          exts: 'TXT, MD, LOG',        color: 'text-sky-500',     bg: 'bg-sky-50'     },
  { Icon: File,           label: 'Any File',      exts: 'Store anything',      color: 'text-slate-400',   bg: 'bg-slate-100'  },
];

const steps = [
  { n: '01', title: 'Upload', desc: 'Drag files into the upload zone or click to browse.' },
  { n: '02', title: 'Preview', desc: 'Click any file to preview it inline — no new tab needed.' },
  { n: '03', title: 'Manage', desc: 'Search, sort, update, or delete files at any time.' },
];

export default function LandingPage({ onGetStarted }: Props) {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Cloud size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-base tracking-tight">filesewa</span>
          </div>
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Open App <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 pt-16">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 -right-32 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-3xl" />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Powered by Backblaze B2 Cloud Storage
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-bold text-white tracking-tight leading-[1.08] mb-6">
            Your files,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-400">
              beautifully
            </span>{' '}
            managed
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload anything. Preview everything — images, videos, PDFs, Word docs,
            spreadsheets. Search, sort, and manage your entire storage in one clean UI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="group flex items-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 bg-white/8 hover:bg-white/12 text-white text-base font-medium rounded-xl transition-all border border-white/10"
            >
              See Features
            </a>
          </div>

          {/* Extension pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {['jpg', 'mp4', 'pdf', 'docx', 'mp3', 'csv', 'txt', 'png', 'gif', 'wav'].map(ext => (
              <span
                key={ext}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/50 text-xs font-mono rounded-lg"
              >
                .{ext}
              </span>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 0 480 60 720 40C960 20 1200 50 1440 30V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3 block">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Three steps, zero friction</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

            {steps.map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 mb-5">
                  {n}
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[220px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3 block">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Everything you need</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              A complete file management system built for simplicity and power.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── File Types ─────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3 block">Format support</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Every format, fully previewed</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              From images to spreadsheets — view any file directly in your browser, rendered beautifully.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {fileTypes.map(({ Icon, label, exts, color, bg }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${bg}`}>
                  <Icon size={26} className={color} />
                </div>
                <p className="font-semibold text-slate-800 text-sm mb-1">{label}</p>
                <p className="text-xs text-slate-400">{exts}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-[350px] h-[350px] rounded-full bg-indigo-400/10 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">
            Open the file manager and start uploading. No account required, no setup needed.
          </p>
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2.5 px-10 py-4 bg-white text-blue-700 text-base font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-0.5"
          >
            Open File Manager
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="py-8 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Cloud size={13} className="text-white" />
            </div>
            <span className="font-semibold text-white text-sm">filesewa</span>
          </div>
          <p className="text-sm text-slate-500">Simple, fast, and beautiful file management.</p>
        </div>
      </footer>
    </div>
  );
}
