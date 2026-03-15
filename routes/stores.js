import express from 'express';

function storeRoutes(db) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        try {
            let stores_collection = db.collection('stores');
            let stores = await stores_collection.find().toArray();
            res.status(200).json(stores);
        } catch (error) {
            res.status(500).json({ error: 'Greška pri dohvaćanju trgovina' });
        }
    });

    router.post('/', async (req, res) => {
        let novaTrgovina = req.body;

        try {
            let stores_collection = db.collection('stores');
            let result = await stores_collection.insertOne(novaTrgovina);
            res.status(201).json({ insertedId: result.insertedId });
        } catch (error) {
            res.status(400).json({ error: 'Greška pri dodavanju trgovine' });
        }
    });

    return router;
}

export default storeRoutes;