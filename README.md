# Facebook Feed Aggregator

Self-hosted Facebook page reader with direct Messenger links.

## Quick Start

```
docker compose up -d
```

- **FreshRSS** (your reader): http://localhost:8080
- **RSS-Bridge** (feed generator): http://localhost:3000

## Setup

### 1. First Run
1. Open http://localhost:8080 and create your FreshRSS admin account.
2. Open http://localhost:3000 — this is your feed factory.

### 2. Add a Facebook Page
1. Go to RSS-Bridge at http://localhost:3000
2. Find "Facebook Bridge" (search or scroll)
3. Paste the Facebook page username (e.g. nytimes, BBCNews, NPR)
4. Click "Generate feed" — copy the RSS feed URL it produces
5. In FreshRSS, click the + (add subscription), paste the feed URL
6. Done. Repeat for every page you want.

### 3. Messenger Links
Facebook's direct message shortcut for any page:
```
https://m.me/PAGE_USERNAME
```

**Tip:** In FreshRSS, when you add a subscription, set the "Website" field to `https://m.me/PAGE_USERNAME`. Then clicking the site icon next to any feed opens Messenger for that page directly.

## Common Facebook News Pages

| Page | Username | Feed (paste in RSS-Bridge) | Message Link |
|------|----------|---------------------------|-------------|
| New York Times | nytimes | nytimes | https://m.me/nytimes |
| BBC News | BBCNews | BBCNews | https://m.me/BBCNews |
| NPR | NPR | NPR | https://m.me/NPR |
| Reuters | Reuters | Reuters | https://m.me/Reuters |
| Associated Press | APNews | APNews | https://m.me/APNews |
| CNN | CNN | CNN | https://m.me/CNN |
| The Guardian | theguardian | theguardian | https://m.me/theguardian |
| Washington Post | washingtonpost | washingtonpost | https://m.me/washingtonpost |
| Al Jazeera | aljazeera | aljazeera | https://m.me/aljazeera |
| ABC News | ABCNews | ABCNews | https://m.me/ABCNews |

## Refresh Rate
Feeds auto-refresh every 15 minutes (set by `CRON_MIN=*/15` in docker-compose.yml).
Change to `*/30` for every 30 min, `0` for hourly.

## Updating
```
docker compose pull
docker compose up -d
```

## Notes
- Only works with **public** Facebook pages.
- RSS-Bridge does the scraping — if Facebook changes their HTML, wait for an RSS-Bridge update.
- Your data stays on your machine. Nothing phones home.
