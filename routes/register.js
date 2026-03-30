import express from "express";
import { hashPassword } from "../auth.js";

export default function registerRoute(db) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Sva polja su obavezna." });
    }

    const existing = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });

    if (existing) {
      return res.status(409).json({ error: "Korisnik s tim korisničkim imenom ili emailom već postoji." });
    }

    const hashedPassword = await hashPassword(password);

    await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Korisnik registriran" });
  });

  return router;
}
