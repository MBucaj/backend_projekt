import express from 'express';
import storeRoutes from './routes/stores.js';
import visitRoutes from './routes/visits.js';
import { connectToDatabase } from './db.js';


const app = express(); 

let db = await connectToDatabase();

const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('SalesTrack backend radi');
});

app.use('/stores', storeRoutes);
app.use('/visits', visitRoutes);

app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`);
});