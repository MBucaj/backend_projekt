import express from "express";
import { ObjectId } from "mongodb";
import { checkPassword, hashPassword, generateJWT } from "../auth.js";

export default function profileRoute(db) {
  const router = express.Router();

  router.put("/username", async (req, res) => {
    try {
      const { username, currentPassword } = req.body;

      if (!username || !currentPassword) {
        return res.status(400).json({ error: "Sva polja su obavezna." });
      }

      const userId = req.authorised_user.userId;
      const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: "Korisnik nije pronađen." });
      }

      const valid = await checkPassword(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Neispravna trenutna lozinka." });
      }

      const existing = await db.collection("users").findOne({
        username,
        _id: { $ne: new ObjectId(userId) },
      });

      if (existing) {
        return res.status(409).json({ error: "Korisničko ime je već zauzeto." });
      }

      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { username } }
      );

      const token = await generateJWT({
        userId,
        username,
        email: user.email,
      });

      return res.json({ message: "Korisničko ime uspješno promijenjeno.", token });
    } catch (error) {
      console.error("Greška u PUT /profile/username:", error);
      return res.status(500).json({ error: "Greška pri promjeni korisničkog imena." });
    }
  });

  router.put("/email", async (req, res) => {
    try {
      const { email, currentPassword } = req.body;

      if (!email || !currentPassword) {
        return res.status(400).json({ error: "Sva polja su obavezna." });
      }

      const userId = req.authorised_user.userId;
      const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: "Korisnik nije pronađen." });
      }

      const valid = await checkPassword(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Neispravna trenutna lozinka." });
      }

      const existing = await db.collection("users").findOne({
        email,
        _id: { $ne: new ObjectId(userId) },
      });

      if (existing) {
        return res.status(409).json({ error: "Email je već zauzet." });
      }

      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { email } }
      );

      const token = await generateJWT({
        userId,
        username: user.username,
        email,
      });

      return res.json({ message: "Email uspješno promijenjen.", token });
    } catch (error) {
      console.error("Greška u PUT /profile/email:", error);
      return res.status(500).json({ error: "Greška pri promjeni emaila." });
    }
  });

  router.put("/password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Sva polja su obavezna." });
      }

      const userId = req.authorised_user.userId;
      const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: "Korisnik nije pronađen." });
      }

      const valid = await checkPassword(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Neispravna trenutna lozinka." });
      }

      const hashed = await hashPassword(newPassword);
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: hashed } }
      );

      return res.json({ message: "Lozinka uspješno promijenjena." });
    } catch (error) {
      console.error("Greška u PUT /profile/password:", error);
      return res.status(500).json({ error: "Greška pri promjeni lozinke." });
    }
  });

  return router;
}
