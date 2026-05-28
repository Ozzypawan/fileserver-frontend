import { useState, useEffect } from 'react';
import { X, Download, RefreshCw, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPresignedUrl } from '../api/fileserver';
import type { FileItem } from '../types';
import { getFileCategory, formatBytes, formatDate, isUrlExpired } from '../utils/format';
import FileIcon, { iconColor, iconBg } from './FileIcon';
import toast from 'react-hot-toast';

// ── Loaders ────────────────────────────────────────────────────────────────

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-slate-400">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

// ── PDF ─────────────────────────────────────────────────────────────────────

function PdfPreview({ url }: { url: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string;
    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        setBlobUrl(objectUrl);
      })
      .catch(() => setError(true));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url]);

  if (error) return <ErrorState label="Could not load PDF." />;
  if (!blobUrl) return <Spinner label="Loading PDF…" />;
  return <iframe src={blobUrl} title="PDF preview" className="w-full h-full border-0" />;
}

// ── Plain text ───────────────────────────────────────────────────────────────

function TextPreview({ url }: { url: string }) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(url).then(r => r.text()).then(setText).catch(() => setError(true));
  }, [url]);

  if (error) return <ErrorState label="Could not load file content." />;
  if (text === null) return <Spinner label="Loading…" />;

  const lines = text.split('\n');
  return (
    <div className="w-full h-full flex bg-[#1e1e2e] overflow-auto">
      {/* Line numbers */}
      <div className="select-none shrink-0 text-right py-6 pl-4 pr-3 text-[#4a4a6a] font-mono text-sm leading-6 border-r border-[#2e2e4e]">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      {/* Content */}
      <pre className="flex-1 py-6 pl-5 pr-8 text-sm text-[#cdd6f4] font-mono leading-6 whitespace-pre overflow-x-auto">
        {text}
      </pre>
    </div>
  );
}

// ── CSV ──────────────────────────────────────────────────────────────────────

function parseCsv(raw: string): string[][] {
  return raw.trim().split('\n').map(row => {
    const cells: string[] = [];
    let cur = '', inQ = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (inQ && row[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === ',' && !inQ) { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    return cells;
  });
}

function CsvPreview({ url }: { url: string }) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(url).then(r => r.text()).then(t => setRows(parseCsv(t))).catch(() => setError(true));
  }, [url]);

  if (error) return <ErrorState label="Could not load CSV." />;
  if (!rows) return <Spinner label="Loading spreadsheet…" />;
  if (rows.length === 0) return <ErrorState label="Empty file." />;

  const [header, ...body] = rows;
  return (
    <div className="w-full h-full overflow-auto bg-white">
      <table className="text-sm border-collapse w-full min-w-max">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-100 shadow-sm">
            <th className="border border-slate-200 px-4 py-2.5 text-center font-semibold text-slate-500 w-10 text-xs">#</th>
            {header.map((cell, i) => (
              <th
                key={i}
                className="border border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-700 whitespace-nowrap bg-slate-100"
              >
                {cell || <span className="text-slate-300 italic">Column {i + 1}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr
              key={i}
              className="hover:bg-blue-50/40 transition-colors"
            >
              <td className="border border-slate-100 px-4 py-2 text-center text-xs text-slate-400 font-mono bg-slate-50/60">
                {i + 2}
              </td>
              {header.map((_, j) => (
                <td
                  key={j}
                  className="border border-slate-100 px-4 py-2 text-slate-700 max-w-[280px] truncate"
                  title={row[j]}
                >
                  {row[j] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Word / ODT ───────────────────────────────────────────────────────────────

function DocPreview({ url }: { url: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const buf = await fetch(url).then(r => r.arrayBuffer());
        const mammoth = await import('mammoth');
        const { value } = await mammoth.convertToHtml({ arrayBuffer: buf });
        setHtml(value);
      } catch {
        setError(true);
      }
    }
    load();
  }, [url]);

  if (error) return <ErrorState label="Could not render document." />;
  if (!html) return <Spinner label="Loading document…" />;

  return (
    <div className="w-full h-full overflow-auto bg-[#e8e8e8] flex justify-center py-6 sm:py-10 px-3 sm:px-4">
      {/* Paper page */}
      <div
        className="bg-white w-full max-w-[820px] shadow-2xl min-h-full px-5 sm:px-12 md:px-[72px] py-8 sm:py-14 md:py-[80px] text-[14px] sm:text-[15px] leading-7 text-slate-900"
        style={{ fontFamily: '"Georgia", "Times New Roman", serif' }}
      >
        <style>{`
          .doc-body h1 { font-size: 2rem; font-weight: 700; margin: 0 0 1rem; line-height: 1.2; }
          .doc-body h2 { font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 0.75rem; }
          .doc-body h3 { font-size: 1.2rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
          .doc-body p  { margin: 0 0 1rem; }
          .doc-body ul, .doc-body ol { padding-left: 1.75rem; margin: 0 0 1rem; }
          .doc-body li { margin-bottom: 0.25rem; }
          .doc-body b, .doc-body strong { font-weight: 700; }
          .doc-body i, .doc-body em { font-style: italic; }
          .doc-body u { text-decoration: underline; }
          .doc-body table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
          .doc-body td, .doc-body th { border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; vertical-align: top; }
          .doc-body th { background: #f8fafc; font-weight: 600; }
          .doc-body a { color: #2563eb; text-decoration: underline; }
          .doc-body hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
        `}</style>
        <div
          className="doc-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

// ── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ label }: { label: string }) {
  return <p className="text-sm text-slate-500">{label}</p>;
}

// ── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  item: FileItem;
  onClose: () => void;
  onUrlRefreshed: (path: string, url: string) => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function PreviewModal({ item, onClose, onUrlRefreshed, hasPrev, hasNext, onPrev, onNext }: Props) {
  const [url, setUrl] = useState(item.url);
  const [refreshing, setRefreshing] = useState(false);
  const category = getFileCategory(item.content_type);

  const isDocumentType = ['pdf', 'doc', 'text', 'csv'].includes(category);

  useEffect(() => {
    setUrl(item.url);
    // Auto-refresh if the stored URL is already expired on open
    if (isUrlExpired(item.url)) {
      getPresignedUrl(item.path)
        .then(fresh => { setUrl(fresh); onUrlRefreshed(item.path, fresh); })
        .catch(() => {});
    }
  }, [item.url, item.path, onUrlRefreshed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const fresh = await getPresignedUrl(item.path);
      setUrl(fresh);
      onUrlRefreshed(item.path, fresh);
      toast.success('URL refreshed');
    } catch {
      toast.error('Could not refresh URL');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all
          ${isDocumentType
            ? 'w-[96vw] h-[96vh]'
            : 'w-full max-w-3xl max-h-[90vh]'
          }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg(item.content_type)}`}>
              <FileIcon contentType={item.content_type} size={16} className={iconColor(item.content_type)} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 text-sm truncate leading-tight">{item.name}</p>
              <p className="text-xs text-slate-400 leading-tight">{formatBytes(item.size)} · {formatDate(item.uploadedAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-4">
            {(hasPrev || hasNext) && (
              <>
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  title="Previous file (←)"
                  className="p-2 rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 text-slate-500"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  title="Next file (→)"
                  className="p-2 rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 text-slate-500"
                >
                  <ChevronRight size={14} />
                </button>
                <div className="w-px h-5 bg-slate-200 mx-0.5" />
              </>
            )}
            <button
              onClick={handleRefresh}
              title="Refresh URL"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              title="Open in new tab"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
            <a
              href={url}
              download={item.name}
              title="Download"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <Download size={14} />
            </a>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Preview body ── */}
        <div className={`flex-1 min-h-0 overflow-hidden
          ${isDocumentType
            ? ''
            : 'flex items-center justify-center bg-slate-50 p-6'
          }`}
        >
          {category === 'image' && (
            <img src={url} alt={item.name} className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
          )}
          {category === 'video' && (
            <video src={url} controls className="max-w-full max-h-full rounded-lg shadow-sm" />
          )}
          {category === 'audio' && (
            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${iconBg(item.content_type)}`}>
                <FileIcon contentType={item.content_type} size={36} className={iconColor(item.content_type)} />
              </div>
              <audio src={url} controls className="w-full" />
            </div>
          )}
          {category === 'pdf'  && <PdfPreview url={url} />}
          {category === 'text' && <TextPreview url={url} />}
          {category === 'csv'  && <CsvPreview url={url} />}
          {category === 'doc'  && <DocPreview url={url} />}
          {category === 'other' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${iconBg(item.content_type)}`}>
                <FileIcon contentType={item.content_type} size={36} className={iconColor(item.content_type)} />
              </div>
              <p className="text-sm text-slate-500">Preview not available for this file type.</p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ExternalLink size={14} />
                Open file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
