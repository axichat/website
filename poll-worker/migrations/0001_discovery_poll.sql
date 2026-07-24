CREATE TABLE IF NOT EXISTS discovery_poll_counts (
  source TEXT PRIMARY KEY,
  votes INTEGER NOT NULL DEFAULT 0 CHECK (votes >= 0)
);

INSERT OR IGNORE INTO discovery_poll_counts (source, votes) VALUES
  ('app_store', 1),
  ('play_store', 5),
  ('fdroid', 30),
  ('friends_family', 20),
  ('web_search', 1),
  ('social_media', 0),
  ('other', 0);
