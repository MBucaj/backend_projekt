import express from "express";
import { connectToDatabase } from "./db.js";
import storeRoutes from "./routes/stores.js";
import visitRoutes from "./routes/visits.js";
import cors from "cors";
import loginRoute from "./routes/login.js";
import registerRoute from "./routes/register.js";
import { authMiddleware } from "./authMiddleware.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const db = await connectToDatabase();

app.get("/", (req, res) => {
  return res.send("SalesTrack backend radi");
});

app.use("/stores", authMiddleware, storeRoutes(db));
app.use("/visits", authMiddleware, visitRoutes(db));
app.use("/login", loginRoute(db));
app.use("/register", registerRoute(db));

app.listen(PORT, (error) => {
  if (error) {
    console.log("Greška prilikom pokretanja servera", error);
  } else {
    console.log(`Server radi na http://localhost:${PORT}`);
  }
});
