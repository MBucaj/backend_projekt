import express from 'express';
import { connectToDatabase } from './db.js';
import storeRoutes from './routes/stores.js';
import visitRoutes from './routes/visits.js';

const app = express();
const PORT = 3000;

app.use(express.json());

const db = await connectToDatabase();

app.get('/', (req, res) => {
    return res.send('SalesTrack backend radi');
});

app.use('/stores', storeRoutes(db));
app.use('/visits', visitRoutes(db));

app.listen(PORT, (error) => {
    if (error) {
        console.log('Greška prilikom pokretanja servera', error);
    } else {
        console.log(`Server radi na http://localhost:${PORT}`);
    }
});