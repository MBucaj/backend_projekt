const express = require('express');
const router = express.Router();

let visits = [];

router.get('/', (req, res) => {
  res.json(visits);
});

router.post('/', (req, res) => {

  const newVisit = {
    id: visits.length + 1,
    store: req.body.store,
    date: req.body.date,
    kilometers: req.body.kilometers,
    note: req.body.note
  };

  visits.push(newVisit);

  res.status(201).json(newVisit);
});

module.exports = router;