const express = require('express');
const app = express();

const storeRoutes = require('./routes/stores');
const visitRoutes = require('./routes/visits');

const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send("SalesTrack backend radi");
});

app.use('/stores', storeRoutes);
app.use('/visits', visitRoutes);

app.listen(PORT, () => {
  console.log(`Server radi na http://localhost:${PORT}`);
});