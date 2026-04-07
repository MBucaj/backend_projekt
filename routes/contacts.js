import express from "express";
import { ObjectId } from "mongodb";

function contactRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const contactsCollection = db.collection("contacts");
      const contacts = await contactsCollection
        .find({ userId: req.authorised_user.userId })
        .toArray();

      return res.status(200).json(contacts);
    } catch (error) {
      console.error("Greška u GET /contacts:", error);
      return res.status(500).json({ error: "Greška pri dohvaćanju kontakata" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { name, phone, email, role } = req.body;

      if (!name || !phone || !email || !role) {
        return res.status(400).json({ error: "Name, phone, email i role su obavezni." });
      }

      const contactsCollection = db.collection("contacts");
      const result = await contactsCollection.insertOne({
        name,
        phone,
        email,
        role,
        userId: req.authorised_user.userId,
      });

      return res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Greška u POST /contacts:", error);
      return res.status(500).json({ error: "Greška pri dodavanju kontakta" });
    }
  });

  router.patch("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { name, phone, email, role } = req.body;

      if (!name && !phone && !email && !role) {
        return res.status(400).json({ error: "Morate poslati barem jedno polje za ažuriranje." });
      }

      const podaciZaAzuriranje = {};
      if (name) podaciZaAzuriranje.name = name;
      if (phone) podaciZaAzuriranje.phone = phone;
      if (email) podaciZaAzuriranje.email = email;
      if (role) podaciZaAzuriranje.role = role;

      const contactsCollection = db.collection("contacts");
      const result = await contactsCollection.updateOne(
        { _id: new ObjectId(id), userId: req.authorised_user.userId },
        { $set: podaciZaAzuriranje }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Kontakt nije pronađen." });
      }

      return res.status(200).json({ message: "Kontakt je ažuriran." });
    } catch (error) {
      console.error("Greška u PATCH /contacts/:id:", error);
      return res.status(500).json({ error: "Greška pri ažuriranju kontakta." });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const contactsCollection = db.collection("contacts");
      const result = await contactsCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.authorised_user.userId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Kontakt nije pronađen." });
      }

      return res.status(200).json({ message: "Kontakt je obrisan." });
    } catch (error) {
      console.error("Greška u DELETE /contacts/:id:", error);
      return res.status(500).json({ error: "Greška pri brisanju kontakta." });
    }
  });

  return router;
}

export default contactRoutes;