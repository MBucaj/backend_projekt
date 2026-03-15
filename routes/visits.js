import express from 'express';

function visitRoutes(db) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        try {
            let visits_collection = db.collection('visits');
            let visits = await visits_collection.find().toArray();
            res.status(200).json(visits);
        } catch (error) {
            res.status(500).json({ error: 'Greška pri dohvaćanju posjeta' });
        }
    });

    router.post('/', async (req, res) => {
        let noviPosjet = req.body;

        try {
            let visits_collection = db.collection('visits');
            let result = await visits_collection.insertOne(noviPosjet);
            res.status(201).json({ insertedId: result.insertedId });
        } catch (error) {
            res.status(400).json({ error: 'Greška pri dodavanju posjeta' });
        }
    });

    return router;
}

export default visitRoutes;