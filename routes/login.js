import express from "express";
import { checkPassword, generateJWT } from "../auth.js";

export default function loginRoute(db) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const { username, password } = req.body;

    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Neispravni podaci" });
    }

    const valid = await checkPassword(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: "Neispravni podaci" });
    }

    const token = await generateJWT({
      userId: user._id,
      username: user.username,
      email: user.email,
    });

    res.json({ token });
  });

  return router;
}
