import express from "express";
import { ObjectId } from "mongodb";

function orderRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const ordersCollection = db.collection("orders");
      const orders = await ordersCollection
        .find({ userId: req.authorised_user.userId })
        .toArray();

      return res.status(200).json(orders);
    } catch (error) {
      console.error("Greška u GET /orders:", error);
      return res.status(500).json({ error: "Greška pri dohvaćanju narudžbi" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { visitId, items } = req.body;

      if (!visitId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "visitId i items (array) su obavezni." });
      }

      const visitsCollection = db.collection("visits");
      const visit = await visitsCollection.findOne({
        _id: new ObjectId(visitId),
        userId: req.authorised_user.userId,
      });

      if (!visit) {
        return res.status(404).json({ error: "Posjet nije pronađen." });
      }

      const productsCollection = db.collection("products");
      const validatedItems = [];

      for (const item of items) {
        if (!item.productId || item.quantity === undefined) {
          return res.status(400).json({ error: "Svaki item mora imati productId i quantity." });
        }

        const product = await productsCollection.findOne({
          _id: new ObjectId(item.productId),
          userId: req.authorised_user.userId,
        });

        if (!product) {
          return res.status(404).json({ error: `Proizvod ${item.productId} nije pronađen.` });
        }

        validatedItems.push({
          productId: new ObjectId(item.productId),
          quantity: item.quantity,
        });
      }

      const ordersCollection = db.collection("orders");
      const result = await ordersCollection.insertOne({
        visitId: new ObjectId(visitId),
        items: validatedItems,
        userId: req.authorised_user.userId,
      });

      return res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Greška u POST /orders:", error);
      return res.status(500).json({ error: "Greška pri dodavanju narudžbe" });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const ordersCollection = db.collection("orders");
      const result = await ordersCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.authorised_user.userId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Narudžba nije pronađena." });
      }

      return res.status(200).json({ message: "Narudžba je obrisana." });
    } catch (error) {
      console.error("Greška u DELETE /orders/:id:", error);
      return res.status(500).json({ error: "Greška pri brisanju narudžbe." });
    }
  });

  return router;
}

export default orderRoutes;
