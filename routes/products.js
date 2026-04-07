import express from "express";
import { ObjectId } from "mongodb";

function productRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const productsCollection = db.collection("products");
      const products = await productsCollection
        .find({ userId: req.authorised_user.userId })
        .toArray();

      return res.status(200).json(products);
    } catch (error) {
      console.error("Greška u GET /products:", error);
      return res.status(500).json({ error: "Greška pri dohvaćanju proizvoda" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { name, price, categoryId } = req.body;

      if (!name || price === undefined || !categoryId) {
        return res.status(400).json({ error: "Name, price i categoryId su obavezni." });
      }

      const categoriesCollection = db.collection("categories");
      const category = await categoriesCollection.findOne({
        _id: new ObjectId(categoryId),
        userId: req.authorised_user.userId,
      });

      if (!category) {
        return res.status(404).json({ error: "Kategorija nije pronađena." });
      }

      const productsCollection = db.collection("products");
      const result = await productsCollection.insertOne({
        name,
        price,
        categoryId: new ObjectId(categoryId),
        userId: req.authorised_user.userId,
      });

      return res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Greška u POST /products:", error);
      return res.status(500).json({ error: "Greška pri dodavanju proizvoda" });
    }
  });

  router.patch("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { name, price, categoryId } = req.body;

      if (name === undefined && price === undefined && !categoryId) {
        return res.status(400).json({ error: "Morate poslati name, price ili categoryId za ažuriranje." });
      }

      const podaciZaAzuriranje = {};
      if (name !== undefined) podaciZaAzuriranje.name = name;
      if (price !== undefined) podaciZaAzuriranje.price = price;
      if (categoryId) podaciZaAzuriranje.categoryId = new ObjectId(categoryId);

      const productsCollection = db.collection("products");
      const result = await productsCollection.updateOne(
        { _id: new ObjectId(id), userId: req.authorised_user.userId },
        { $set: podaciZaAzuriranje }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Proizvod nije pronađen." });
      }

      return res.status(200).json({ message: "Proizvod je ažuriran." });
    } catch (error) {
      console.error("Greška u PATCH /products/:id:", error);
      return res.status(500).json({ error: "Greška pri ažuriranju proizvoda." });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const productsCollection = db.collection("products");
      const result = await productsCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.authorised_user.userId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Proizvod nije pronađen." });
      }

      return res.status(200).json({ message: "Proizvod je obrisan." });
    } catch (error) {
      console.error("Greška u DELETE /products/:id:", error);
      return res.status(500).json({ error: "Greška pri brisanju proizvoda." });
    }
  });

  return router;
}

export default productRoutes;