import express from "express";
import { ObjectId } from "mongodb";

export default function routeRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const routes = await db
        .collection("routes")
        .find({ userId: req.authorised_user.userId })
        .toArray();
      return res.status(200).json(routes);
    } catch (error) {
      console.error("Greška u GET /routes:", error);
      return res.status(500).json({ error: "Greška pri dohvaćanju ruta." });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { name, stops } = req.body;

      if (!name || !stops || stops.length === 0) {
        return res.status(400).json({ error: "Naziv i minimalno jedna stanica su obavezni." });
      }

      const storesCollection = db.collection("stores");
      const stopsZaBazu = [];

      for (const stop of stops) {
        if (!stop.storeId || stop.kilometers === undefined || Number(stop.kilometers) < 0) {
          return res.status(400).json({ error: "Svaka stanica mora imati storeId i km >= 0." });
        }

        const store = await storesCollection.findOne({ _id: new ObjectId(stop.storeId) });
        if (!store) {
          return res.status(404).json({ error: `Trgovina nije pronađena.` });
        }

        stopsZaBazu.push({
          storeId: new ObjectId(stop.storeId),
          kilometers: Number(stop.kilometers),
        });
      }

      const result = await db.collection("routes").insertOne({
        name,
        stops: stopsZaBazu,
        userId: req.authorised_user.userId,
      });

      return res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Greška u POST /routes:", error);
      return res.status(500).json({ error: "Greška pri kreiranju rute." });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const result = await db.collection("routes").deleteOne({
        _id: new ObjectId(req.params.id),
        userId: req.authorised_user.userId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Ruta nije pronađena." });
      }

      return res.status(200).json({ message: "Ruta obrisana." });
    } catch (error) {
      console.error("Greška u DELETE /routes/:id:", error);
      return res.status(500).json({ error: "Greška pri brisanju rute." });
    }
  });

  return router;
}
