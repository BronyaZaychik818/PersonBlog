const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '..', 'blog.db'))

db.pragma('journal_mode = DELETE')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    username TEXT NOT NULL DEFAULT 'Xiaodu',
    email TEXT DEFAULT '',
    avatar TEXT DEFAULT '/avatar.jpeg',
    banner TEXT DEFAULT '',
    github TEXT DEFAULT '',
    bilibili TEXT DEFAULT '',
    gitee TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    published INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    password_hash TEXT NOT NULL
  );
`)

// Ensure profile row exists
const profileRow = db.prepare('SELECT id FROM profile WHERE id = 1').get()
if (!profileRow) {
  db.prepare(`INSERT INTO profile (id) VALUES (1)`).run()
}

module.exports = db
module.exports.close = () => db.close()
