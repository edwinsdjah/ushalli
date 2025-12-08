// src/lib/time.js
import { zonedTimeToUtc } from "date-fns-tz";

export function timeStringToEpoch(
  dateStr /* YYYY-MM-DD */,
  timeStr /* HH:mm */,
  tz /* e.g. "Asia/Jakarta" */
) {
  // combine to local time string then convert zoned time to UTC epoch (ms)
  // example timeStr could be "05:12 (WIB)" — strip non-digit
  const match = timeStr.match(/(\d{1,2}:\d{2})/);
  if (!match) return null;
  const hhmm = match[1];
  const local = `${dateStr}T${hhmm}:00`; // treat as local
  const utcDate = zonedTimeToUtc(local, tz);
  return utcDate.getTime(); // ms
}
