export type IconName = "grid" | "diary" | "chart" | "lab" | "users" | "food" | "activity" | "settings" | "arrow" | "plus" | "menu" | "close" | "logout" | "book" | "check" | "download" | "refresh" | "shield";
const paths: Record<IconName, string> = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  diary: "M4 4h16v17H4z M8 2v4 M16 2v4 M8 11h8 M8 15h5",
  chart: "M4 3v17h17 M8 15v-4 M13 15V7 M18 15V4",
  lab: "M9 3h6 M10 3v6l-6 10a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3 M8 14h8",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  food: "M12 21C3 20 2 11 5 7c2-2 5-1 7 0 2-1 5-2 7 0 3 4 2 13-7 14 M12 7V3 M12 5c3 0 5-2 5-3",
  activity: "M2 12h5l3-8 4 16 3-8h5",
  settings: "M4 6h16 M4 12h16 M4 18h16 M8 3v6 M16 9v6 M10 15v6",
  arrow: "M5 12h14 M14 7l5 5-5 5", plus: "M12 5v14 M5 12h14",
  menu: "M4 6h16 M4 12h16 M4 18h16", close: "M6 6l12 12 M6 18L18 6",
  logout: "M9 4H4v16h5 M10 12h11 M17 8l4 4-4 4",
  book: "M12 5c-3-2-6-2-10 0v15c4-2 7-2 10 0 3-2 6-2 10 0V5c-4-2-7-2-10 0z M12 5v15",
  check: "M5 12l4 4L19 6", download: "M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5",
  refresh: "M20 7V3l-4 4 M20 7a8 8 0 1 0 0 10", shield: "M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6z M8 12l3 3 5-6",
};
export default function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
