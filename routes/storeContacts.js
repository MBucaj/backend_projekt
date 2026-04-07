import express from "express";
import { ObjectId } from "mongodb";

function storeContactRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const storeContactsCollection = db.collection("storecontacts");
      const storeContacts = await storeContactsCollection
        .find({ userId: req.authorised_user.userId })
        .toArray();

      return res.status(200).json(storeContacts);
    } catch (error) {
      console.error("Greška u GET /storecontacts:", error);
      return res.status(500).json({ error: "Greška pri dohvaćanju store kontakata" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { storeId, contactId } = req.body;

      if (!storeId || !contactId) {
        return res.status(400).json({ error: "storeId i contactId su obavezni." });
      }

      const storesCollection = db.collection("stores");
      const store = await storesCollection.findOne({
        _id: new ObjectId(storeId),
        userId: req.authorised_user.userId,
      });

      if (!store) {
        return res.status(404).json({ error: "Trgovina nije pronađena." });
      }

      const contactsCollection = db.collection("contacts");
      const contact = await contactsCollection.findOne({
        _id: new ObjectId(contactId),
        userId: req.authorised_user.userId,
      });

      if (!contact) {
        return res.status(404).json({ error: "Kontakt nije pronađen." });
      }

      const storeContactsCollection = db.collection("storecontacts");
      const result = await storeContactsCollection.insertOne({
        storeId: new ObjectId(storeId),
        contactId: new ObjectId(contactId),
        userId: req.authorised_user.userId,
      });

      return res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Greška u POST /storecontacts:", error);
      return res.status(500).json({ error: "Greška pri dodavanju store kontakta" });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const storeContactsCollection = db.collection("storecontacts");
      const result = await storeContactsCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.authorised_user.userId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Store kontakt nije pronađen." });
      }

      return res.status(200).json({ message: "Store kontakt je obrisan." });
    } catch (error) {
      console.error("Greška u DELETE /storecontacts/:id:", error);
      return res.status(500).json({ error: "Greška pri brisanju store kontakta." });
    }
  });

  return router;
}

export default storeContactRoutes;
