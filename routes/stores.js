import express from "express";
import { ObjectId } from "mongodb";

function storeRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    console.log("GET /stores ušao u rutu");

    try {
      const storesCollection = db.collection("stores");
      const stores = await storesCollection
        .find({ userId: req.authorised_user.userId })
        .toArray();

      console.log("Dohvaćene trgovine:", stores);
      return res.status(200).json(stores);
    } catch (error) {
      console.error("Greška u GET /stores:", error);
      return res.status(500).json({ error: "Greška pri dohvaćanju trgovina" });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const storesCollection = db.collection("stores");
      const store = await storesCollection.findOne({
        _id: new ObjectId(id),
        userId: req.authorised_user.userId,
      });

      if (!store) {
        return res.status(404).json({ error: "Trgovina nije pronađena." });
      }

      return res.status(200).json(store);
    } catch (error) {
      console.error("Greška u GET /stores/:id:", error);
      return res.status(500).json({ error: "Greška pri dohvaćanju trgovine." });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const storesCollection = db.collection("stores");
      const result = await storesCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.authorised_user.userId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Trgovina nije pronađena." });
      }

      return res.status(200).json({ message: "Trgovina je obrisana." });
    } catch (error) {
      console.error("Greška u DELETE /stores/:id:", error);
      return res.status(500).json({ error: "Greška pri brisanju trgovine." });
    }
  });

  router.patch("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const podaciZaAzuriranje = req.body;

      if (
        podaciZaAzuriranje.name === undefined &&
        podaciZaAzuriranje.city === undefined
      ) {
        return res
          .status(400)
          .json({ error: "Morate poslati name ili city za ažuriranje." });
      }

      const storesCollection = db.collection("stores");

      const result = await storesCollection.updateOne(
        { _id: new ObjectId(id), userId: req.authorised_user.userId },
        { $set: podaciZaAzuriranje },
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Trgovina nije pronađena." });
      }

      return res.status(200).json({ message: "Trgovina je ažurirana." });
    } catch (error) {
      console.error("Greška u PATCH /stores/:id:", error);
      return res.status(500).json({ error: "Greška pri ažuriranju trgovine." });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const novaTrgovina = req.body;

      if (!novaTrgovina.name || !novaTrgovina.city) {
        return res.status(400).json({ error: "Name i city su obavezni." });
      }

      const novaTrgovinaZaBazu = {
        name: novaTrgovina.name,
        city: novaTrgovina.city,
        userId: req.authorised_user.userId,
      };

      const storesCollection = db.collection("stores");
      const result = await storesCollection.insertOne(novaTrgovinaZaBazu);

      return res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Greška u POST /stores:", error);
      return res.status(500).json({ error: "Greška pri dodavanju trgovine" });
    }
  });

  return router;
}

export default storeRoutes;
