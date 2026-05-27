import {
  FileImage, FileVideo, FileAudio, FileText, File, FileType2, FileSpreadsheet, ScrollText,
} from 'lucide-react';
import { getFileCategory } from '../utils/format';

interface Props {
  contentType: string;
  size?: number;
  className?: string;
}

export default function FileIcon({ contentType, size = 20, className = '' }: Props) {
  const cat = getFileCategory(contentType);
  const props = { size, className };
  switch (cat) {
    case 'image': return <FileImage {...props} />;
    case 'video': return <FileVideo {...props} />;
    case 'audio': return <FileAudio {...props} />;
    case 'pdf':   return <FileType2 {...props} />;
    case 'csv':   return <FileSpreadsheet {...props} />;
    case 'doc':   return <ScrollText {...props} />;
    case 'text':  return <FileText {...props} />;
    default:      return <File {...props} />;
  }
}

export function iconColor(contentType: string): string {
  switch (getFileCategory(contentType)) {
    case 'image': return 'text-emerald-500';
    case 'video': return 'text-violet-500';
    case 'audio': return 'text-amber-500';
    case 'pdf':   return 'text-red-500';
    case 'csv':   return 'text-green-600';
    case 'doc':   return 'text-blue-500';
    case 'text':  return 'text-sky-500';
    default:      return 'text-slate-400';
  }
}

export function iconBg(contentType: string): string {
  switch (getFileCategory(contentType)) {
    case 'image': return 'bg-emerald-50';
    case 'video': return 'bg-violet-50';
    case 'audio': return 'bg-amber-50';
    case 'pdf':   return 'bg-red-50';
    case 'csv':   return 'bg-green-50';
    case 'doc':   return 'bg-blue-50';
    case 'text':  return 'bg-sky-50';
    default:      return 'bg-slate-100';
  }
}
