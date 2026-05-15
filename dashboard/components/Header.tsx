import Link from "next/link";

const nav = [
  { href: "/", label: "Feeds" },
  { href: "/add", label: "Add Feed" },
  { href: "/settings", label: "Settings" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M13.5 21v-7.5h2.55l.4-3H13.5V8.55c0-.87.24-1.46 1.49-1.46h1.6V4.4a21.4 21.4 0 0 0-2.34-.12c-2.32 0-3.9 1.42-3.9 4v2.22H7.8v3h2.55V21h3.15Z" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink-900">
            Facebook Feed Aggregator
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-500 transition hover:bg-surface-subtle hover:text-ink-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
