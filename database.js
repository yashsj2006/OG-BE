const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'opengov.db');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`);

    // Budget table
    db.run(`CREATE TABLE IF NOT EXISTS budget (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sector TEXT NOT NULL,
      allocation_crores REAL NOT NULL,
      year TEXT NOT NULL
    )`);

    // Legislation table
    db.run(`CREATE TABLE IF NOT EXISTS legislation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      status TEXT NOT NULL,
      date_introduced TEXT NOT NULL,
      house TEXT NOT NULL
    )`);

    // Add source columns if they don't exist
    db.all("PRAGMA table_info(budget)", (err, columns) => {
      if (!columns.some(col => col.name === 'source_name')) {
        db.run('ALTER TABLE budget ADD COLUMN source_name TEXT DEFAULT "Ministry of Finance, Govt of India"');
        db.run('ALTER TABLE budget ADD COLUMN source_url TEXT DEFAULT "https://www.indiabudget.gov.in/"');
      }
    });

    db.all("PRAGMA table_info(legislation)", (err, columns) => {
      if (!columns.some(col => col.name === 'source_name')) {
        db.run('ALTER TABLE legislation ADD COLUMN source_name TEXT DEFAULT "PRS Legislative Research / Lok Sabha"');
        db.run('ALTER TABLE legislation ADD COLUMN source_url TEXT DEFAULT "https://prsindia.org/billtrack"');
      }
    });

    // Seed Data
    db.get('SELECT count(*) as count FROM budget', (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare('INSERT INTO budget (sector, allocation_crores, year, source_name, source_url) VALUES (?, ?, ?, ?, ?)');
        const sName = "Ministry of Finance, Govt of India";
        const sUrl = "https://www.indiabudget.gov.in/";
        stmt.run('Defence', 621540, '2024-25', sName, sUrl);
        stmt.run('Road Transport & Highways', 278000, '2024-25', sName, sUrl);
        stmt.run('Railways', 255393, '2024-25', sName, sUrl);
        stmt.run('Consumer Affairs, Food & Public Distribution', 213323, '2024-25', sName, sUrl);
        stmt.run('Home Affairs', 202868, '2024-25', sName, sUrl);
        stmt.run('Rural Development', 177566, '2024-25', sName, sUrl);
        stmt.run('Agriculture and Farmers Welfare', 127469, '2024-25', sName, sUrl);
        stmt.run('Education', 120627, '2024-25', sName, sUrl);
        stmt.finalize();
      }
    });

    db.get('SELECT count(*) as count FROM legislation', (err, row) => {
      if (row.count === 0) {
        const stmt = db.prepare('INSERT INTO legislation (title, summary, status, date_introduced, house, source_name, source_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
        const sName = "PRS Legislative Research / Lok Sabha";
        const sUrl = "https://prsindia.org/billtrack";
        stmt.run('The Digital Personal Data Protection Bill, 2023', 'Provides for the processing of digital personal data in a manner that recognizes both the right of individuals to protect their personal data and the need to process such personal data for lawful purposes.', 'Passed', '2023-08-03', 'Lok Sabha', sName, sUrl);
        stmt.run('The Bharatiya Nyaya Sanhita, 2023', 'Replaces the Indian Penal Code, 1860, consolidating and amending the provisions relating to criminal offenses.', 'Passed', '2023-12-12', 'Lok Sabha', sName, sUrl);
        stmt.run('The Telecommunications Bill, 2023', 'Seeks to amend and consolidate the law relating to development, expansion and operation of telecommunication services and networks.', 'Passed', '2023-12-18', 'Lok Sabha', sName, sUrl);
        stmt.run('The Women\'s Reservation Bill, 2023 (Nari Shakti Vandan Adhiniyam)', 'Seeks to reserve one-third of the total number of seats in Lok Sabha and State Legislative Assemblies for women.', 'Passed', '2023-09-19', 'Lok Sabha', sName, sUrl);
        stmt.run('The Public Examinations (Prevention of Unfair Means) Bill, 2024', 'Aims to prevent unfair means in public examinations and maintain transparency and fairness.', 'Passed', '2024-02-05', 'Lok Sabha', sName, sUrl);
        stmt.finalize();
      }
    });
  });
};

module.exports = { db, initDb };
