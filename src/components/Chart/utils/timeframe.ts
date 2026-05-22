import type { CustomTimeFrame, TimeFrameUnit } from '../../../types/chart';

const UNIT_SECONDS: Record<TimeFrameUnit, number> = {
  minutes: 60,
  hours: 3600,
  days: 86400,
  weeks: 86400 * 7,
  months: 86400 * 30,
};

export function timeframeToSeconds(tf: CustomTimeFrame): number {
  const base = UNIT_SECONDS[tf.unit];
  return Math.max(60, base * Math.max(1, Math.floor(tf.size)));
}

export function timeframeLabel(tf: CustomTimeFrame): string {
  const unitLabel: Record<TimeFrameUnit, string> = {
    minutes: 'Min',
    hours: 'Hour',
    days: 'Day',
    weeks: 'Week',
    months: 'Month',
  };
  return `${tf.size} ${unitLabel[tf.unit]}${tf.size > 1 ? 's' : ''}`;
}
