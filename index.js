import express from "express";
import { connectToDatabase } from "./db.js";
import storeRoutes from "./routes/stores.js";
import visitRoutes from "./routes/visits.js";
import cors from "cors";
import loginRoute from "./routes/login.js";
import registerRoute from "./routes/register.js";
import profileRoute from "./routes/profile.js";
import { authMiddleware } from "./authMiddleware.js";
import categoryRoute from "./routes/categories.js";
import productRoute from "./routes/products.js";
import contactRoute from "./routes/contacts.js";
import storeContactRoute from "./routes/storeContacts.js";
import orderRoute from "./routes/orders.js";
import routeRoute from "./routes/routes.js";




const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: ['https://salestrack0.netlify.app', 'http://localhost:5173', 'http://localhost:8080'],
}));

const db = await connectToDatabase();

app.get("/", (req, res) => {
  return res.send("SalesTrack backend radi");
});

app.use("/stores", authMiddleware, storeRoutes(db));
app.use("/visits", authMiddleware, visitRoutes(db));
app.use("/login", loginRoute(db));
app.use("/register", registerRoute(db));
app.use("/profile", authMiddleware, profileRoute(db));
app.use("/categories", authMiddleware, categoryRoute(db));
app.use("/products", authMiddleware, productRoute(db));
app.use("/contacts", authMiddleware, contactRoute(db));
app.use("/storecontacts", authMiddleware, storeContactRoute(db));
app.use("/orders", authMiddleware, orderRoute(db));
app.use("/routes", authMiddleware, routeRoute(db));



app.listen(PORT, (error) => {
  if (error) {
    console.log("Greška prilikom pokretanja servera", error);
  } else {
    console.log(`Server radi na http://localhost:${PORT}`);
  }
});
