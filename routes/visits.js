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
    try {
        const noviPosjet = req.body;

        if (!noviPosjet.store || !noviPosjet.date || noviPosjet.kilometers === undefined || !noviPosjet.note) {
            return res.status(400).json({ error: 'Store, date, kilometers i note su obavezni.' });
        }

        if (typeof noviPosjet.kilometers !== 'number' || noviPosjet.kilometers < 0) {
            return res.status(400).json({ error: 'Kilometers mora biti broj veći ili jednak 0.' });
        }

        const visitsCollection = db.collection('visits');
        const result = await visitsCollection.insertOne(noviPosjet);

        return res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
        console.error('Greška u POST /visits:', error);
        return res.status(500).json({ error: 'Greška pri dodavanju posjeta' });
    }
});

    return router;
}

export default visitRoutes;