CREATE TABLE IF NOT EXISTS discovery_poll_counts (
  source TEXT PRIMARY KEY,
  votes INTEGER NOT NULL DEFAULT 0 CHECK (votes >= 0)
);

INSERT OR IGNORE INTO discovery_poll_counts (source, votes) VALUES
  ('app_store', 0),
  ('play_store', 0),
  ('fdroid', 0),
  ('friends_family', 0),
  ('web_search', 0),
  ('social_media', 0),
  ('other', 0);
