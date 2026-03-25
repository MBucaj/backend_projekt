import express from "express";
import { hashPassword } from "../auth.js";

export default function registerRoute(db) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const { username, email, password } = req.body;

    const hashedPassword = await hashPassword(password);

    await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
    });

    res.json({ message: "Korisnik registriran" });
  });

  return router;
}
