import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { RiskLevel } from '../types/agent';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

const CONFIG: Record<RiskLevel, { icon: typeof Shield; bg: string; text: string; border: string; label: string }> = {
  'Low': {
    icon: ShieldCheck,
    bg: 'bg-emerald-900/30',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    label: 'Low Risk',
  },
  'Moderate': {
    icon: Shield,
    bg: 'bg-amber-900/30',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    label: 'Moderate Risk',
  },
  'High': {
    icon: ShieldAlert,
    bg: 'bg-orange-900/30',
    text: 'text-orange-300',
    border: 'border-orange-500/40',
    label: 'High Risk',
  },
  'Critical review priority': {
    icon: AlertTriangle,
    bg: 'bg-red-900/30',
    text: 'text-red-300',
    border: 'border-red-500/40',
    label: 'Critical Review Priority',
  },
};

const SIZE_CLASSES = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

const ICON_SIZES = { sm: 14, md: 16, lg: 20 };

export default function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const c = CONFIG[level];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${c.bg} ${c.text} ${c.border} ${SIZE_CLASSES[size]}`}
      role="status"
      aria-label={`Risk level: ${c.label}`}
    >
      <Icon size={ICON_SIZES[size]} aria-hidden="true" />
      {c.label}
    </span>
  );
}
