import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const feeds = pgTable(
  "feeds",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    username: text("username"),
    rssUrl: text("rss_url").notNull(),
    messengerUrl: text("messenger_url"),
    lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    rssUrlIdx: uniqueIndex("feeds_rss_url_idx").on(t.rssUrl),
  }),
);

export const items = pgTable(
  "items",
  {
    id: serial("id").primaryKey(),
    feedId: integer("feed_id")
      .notNull()
      .references(() => feeds.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    link: text("link").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    feedLinkIdx: uniqueIndex("items_feed_link_idx").on(t.feedId, t.link),
    publishedIdx: index("items_published_idx").on(t.publishedAt),
  }),
);

export type Feed = typeof feeds.$inferSelect;
export type NewFeed = typeof feeds.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
