import Link from "next/link";

const nav = [
  { href: "/", label: "Feeds", short: "Feeds" },
  { href: "/add", label: "Add Feed", short: "Add" },
  { href: "/settings", label: "Settings", short: "Settings" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="Facebook Feed Aggregator"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-white">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M13.5 21v-7.5h2.55l.4-3H13.5V8.55c0-.87.24-1.46 1.49-1.46h1.6V4.4a21.4 21.4 0 0 0-2.34-.12c-2.32 0-3.9 1.42-3.9 4v2.22H7.8v3h2.55V21h3.15Z" />
            </svg>
          </span>
          <span className="hidden truncate text-[15px] font-semibold tracking-tight text-ink-900 sm:inline">
            Facebook Feed Aggregator
          </span>
          <span className="truncate text-[15px] font-semibold tracking-tight text-ink-900 sm:hidden">
            FB Feeds
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-[44px] items-center rounded-md px-2.5 text-sm font-medium text-ink-500 transition hover:bg-surface-subtle hover:text-ink-900 sm:min-h-[36px] sm:px-3 sm:py-1.5"
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.short}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
