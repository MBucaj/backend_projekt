import express from 'express';

function storeRoutes(db) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        console.log('GET /stores ušao u rutu');

        try {
            const storesCollection = db.collection('stores');
            const stores = await storesCollection.find({}).toArray();

            console.log('Dohvaćene trgovine:', stores);
            return res.status(200).json(stores);
        } catch (error) {
            console.error('Greška u GET /stores:', error);
            return res.status(500).json({ error: 'Greška pri dohvaćanju trgovina' });
        }
    });

    router.post('/', async (req, res) => {
        console.log('POST /stores ušao u rutu');
        console.log('Body:', req.body);

        try {
            const novaTrgovina = req.body;
            const storesCollection = db.collection('stores');
            const result = await storesCollection.insertOne(novaTrgovina);

            console.log('Upisano:', result.insertedId);
            return res.status(201).json({ insertedId: result.insertedId });
        } catch (error) {
            console.error('Greška u POST /stores:', error);
            return res.status(500).json({ error: 'Greška pri dodavanju trgovine' });
        }
    });

    return router;
}

export default storeRoutes;