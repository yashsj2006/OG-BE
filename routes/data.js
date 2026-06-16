const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');
const { db } = require('../database');

const parser = new Parser();

router.get('/budget', (req, res) => {
  db.all('SELECT * FROM budget ORDER BY allocation_crores DESC', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

router.get('/legislation', (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM legislation';
  let params = [];

  if (search) {
    query += ' WHERE title LIKE ? OR summary LIKE ?';
    params = [`%${search}%`, `%${search}%`];
  }

  query += ' ORDER BY date_introduced DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

// New RSS route
router.get('/news', async (req, res) => {
  try {
    // Fetching national news from The Hindu RSS feed
    const feed = await parser.parseURL('https://www.thehindu.com/news/national/feeder/default.rss');
    
    const newsItems = feed.items.slice(0, 5).map(item => ({
      id: item.guid || item.link,
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: 'The Hindu',
    }));
    
    res.json(newsItems);
  } catch (error) {
    console.error('RSS Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});

module.exports = router;
