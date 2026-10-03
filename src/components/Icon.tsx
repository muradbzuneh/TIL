import {
  ChartNoAxesColumn,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  LockKeyhole,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Timer,
  Trash,
  TriangleAlert,
} from 'lucide-react-native';

import type { LucideIcon } from 'lucide-react-native';

/**
 * TASK 21 — one icon per meaning.
 *
 * Icons are used on navigation, actions and statuses
 * only, never beside every line of text.
 */
const ICONS = {
  dashboard: LayoutDashboard,
  apps: Smartphone,
  add: Plus,
  timer: Timer,
  limit: Clock3,
  warning: TriangleAlert,
  reached: LockKeyhole,
  permission: ShieldCheck,
  settings: Settings,
  privacy: Shield,
  delete: Trash,
  refresh: RefreshCw,
  back: ChevronLeft,
  details: ChevronRight,
  usage: ChartNoAxesColumn,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {

  const Component = ICONS[name];

  return (
    <Component
      size={size}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}
