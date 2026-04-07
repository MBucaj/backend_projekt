import express from "express";
import { ObjectId } from "mongodb";

function categoryRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const categoriesCollection = db.collection("categories");
      const categories = await categoriesCollection
        .find({ userId: req.authorised_user.userId })
        .toArray();

      return res.status(200).json(categories);
    } catch (error) {
      console.error("Greška u GET /categories:", error);
      return res.status(500).json({ error: "Greška pri dohvaćanju kategorija" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name je obavezan." });
      }

      const categoriesCollection = db.collection("categories");
      const result = await categoriesCollection.insertOne({
        name,
        userId: req.authorised_user.userId,
      });

      return res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Greška u POST /categories:", error);
      return res.status(500).json({ error: "Greška pri dodavanju kategorije" });
    }
  });

  router.patch("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name je obavezan za ažuriranje." });
      }

      const categoriesCollection = db.collection("categories");
      const result = await categoriesCollection.updateOne(
        { _id: new ObjectId(id), userId: req.authorised_user.userId },
        { $set: { name } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Kategorija nije pronađena." });
      }

      return res.status(200).json({ message: "Kategorija je ažurirana." });
    } catch (error) {
      console.error("Greška u PATCH /categories/:id:", error);
      return res.status(500).json({ error: "Greška pri ažuriranju kategorije." });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const categoriesCollection = db.collection("categories");
      const result = await categoriesCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.authorised_user.userId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Kategorija nije pronađena." });
      }

      return res.status(200).json({ message: "Kategorija je obrisana." });
    } catch (error) {
      console.error("Greška u DELETE /categories/:id:", error);
      return res.status(500).json({ error: "Greška pri brisanju kategorije." });
    }
  });

  return router;
}

export default categoryRoutes;
