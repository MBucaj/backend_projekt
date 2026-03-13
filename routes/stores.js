const express = require('express');
const router = express.Router();

let stores = [
  { id: 1, name: "Konzum", city: "Pula" },
  { id: 2, name: "Plodine", city: "Rovinj" }
];

router.get('/', (req, res) => {
  res.json(stores);
});

router.post('/', (req, res) => {
  const newStore = {
    id: stores.length + 1,
    name: req.body.name,
    city: req.body.city
  };

  stores.push(newStore);
  res.status(201).json(newStore);
});

module.exports = router;