import express from "express";
import { ObjectId } from "mongodb";

function routeRoutes(db) {
  const router = express.Router();

  // GET sve rute s embedded podacima o trgovinama
  router.get("/", async (req, res) => {
    try {
      const routesCollection = db.collection("routes");
      const storesCollection = db.collection("stores");

      const routes = await routesCollection
        .find({ userId: req.authorised_user.userId })
        .toArray();

      const routesWithStores = await Promise.all(
        routes.map(async (route) => {
          const stopsWithStore = await Promise.all(
            (route.stops || []).map(async (stop) => {
              const store = await storesCollection.findOne({ _id: new ObjectId(stop.storeId) });
              return { ...stop, store: store || null };
            })
          );
          return { ...route, stops: stopsWithStore };
        })
      );

      return res.status(200).json(routesWithStores);
    } catch (error) {
      console.error("Greška u GET /routes:", error);
      return res.status(500).json({ error: "Greška pri dohvaćanju ruta." });
    }
  });

  // POST nova ruta
  router.post("/", async (req, res) => {
    try {
      const { name, date, stops, note } = req.body;

      if (!name || !date || !Array.isArray(stops) || stops.length === 0) {
        return res.status(400).json({ error: "name, date i stops (array) su obavezni." });
      }

      const storesCollection = db.collection("stores");
      const validatedStops = [];

      for (const stop of stops) {
        if (!stop.storeId || stop.kilometers === undefined || Number(stop.kilometers) < 0) {
          return res.status(400).json({ error: "Svaka stanica mora imati storeId i km >= 0." });
        }

        const store = await storesCollection.findOne({
          _id: new ObjectId(stop.storeId),
          userId: req.authorised_user.userId,
        });

        if (!store) {
          return res.status(404).json({ error: "Jedna od odabranih trgovina nije pronađena." });
        }

        validatedStops.push({
          storeId: new ObjectId(stop.storeId),
          kilometers: Number(stop.kilometers),
        });
      }

      const routesCollection = db.collection("routes");
      const result = await routesCollection.insertOne({
        name,
        date,
        stops: validatedStops,
        note: note || "",
        status: "planirana",
        userId: req.authorised_user.userId,
      });

      return res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Greška u POST /routes:", error);
      return res.status(500).json({ error: "Greška pri kreiranju rute." });
    }
  });

  // PATCH uredi rutu
  router.patch("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { name, date, stops, note } = req.body;

      const podaciZaAzuriranje = {};
      if (name) podaciZaAzuriranje.name = name;
      if (date) podaciZaAzuriranje.date = date;
      if (note !== undefined) podaciZaAzuriranje.note = note;

      if (Array.isArray(stops) && stops.length > 0) {
        const storesCollection = db.collection("stores");
        const validatedStops = [];

        for (const stop of stops) {
          if (!stop.storeId || stop.kilometers === undefined || Number(stop.kilometers) < 0) {
            return res.status(400).json({ error: "Svaka stanica mora imati storeId i km >= 0." });
          }
          const store = await storesCollection.findOne({
            _id: new ObjectId(stop.storeId),
            userId: req.authorised_user.userId,
          });
          if (!store) {
            return res.status(404).json({ error: "Jedna od odabranih trgovina nije pronađena." });
          }
          validatedStops.push({
            storeId: new ObjectId(stop.storeId),
            kilometers: Number(stop.kilometers),
          });
        }
        podaciZaAzuriranje.stops = validatedStops;
      }

      if (Object.keys(podaciZaAzuriranje).length === 0) {
        return res.status(400).json({ error: "Nema podataka za ažuriranje." });
      }

      const routesCollection = db.collection("routes");
      const result = await routesCollection.updateOne(
        { _id: new ObjectId(id), userId: req.authorised_user.userId },
        { $set: podaciZaAzuriranje }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Ruta nije pronađena." });
      }

      return res.status(200).json({ message: "Ruta je ažurirana." });
    } catch (error) {
      console.error("Greška u PATCH /routes/:id:", error);
      return res.status(500).json({ error: "Greška pri ažuriranju rute." });
    }
  });

  // DELETE obriši rutu
  router.delete("/:id", async (req, res) => {
    try {
      const routesCollection = db.collection("routes");
      const result = await routesCollection.deleteOne({
        _id: new ObjectId(req.params.id),
        userId: req.authorised_user.userId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Ruta nije pronađena." });
      }

      return res.status(200).json({ message: "Ruta obrisana." });
    } catch (error) {
      console.error("Greška u DELETE /routes/:id:", error);
      return res.status(500).json({ error: "Greška pri brisanju rute." });
    }
  });

  // POST završi rutu — automatski kreira posjete za svaku stanicu
  router.post("/:id/complete", async (req, res) => {
    try {
      const id = req.params.id;

      const routesCollection = db.collection("routes");
      const route = await routesCollection.findOne({
        _id: new ObjectId(id),
        userId: req.authorised_user.userId,
      });

      if (!route) {
        return res.status(404).json({ error: "Ruta nije pronađena." });
      }

      if (route.status === "završena") {
        return res.status(400).json({ error: "Ruta je već završena." });
      }

      const visitsCollection = db.collection("visits");

      const visits = route.stops.map((stop) => ({
        storeId: new ObjectId(stop.storeId),
        date: route.date,
        kilometers: stop.kilometers,
        note: `Kreiran iz rute: ${route.name}`,
        userId: req.authorised_user.userId,
        source: 'ruta',
        routeId: new ObjectId(id),
      }));

      await visitsCollection.insertMany(visits);

      await routesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "završena" } }
      );

      return res.status(200).json({
        message: `Ruta završena. Kreirano ${visits.length} posjeta.`,
      });
    } catch (error) {
      console.error("Greška u POST /routes/:id/complete:", error);
      return res.status(500).json({ error: "Greška pri završavanju rute." });
    }
  });

  // POST kopiraj rutu
  router.post("/:id/copy", async (req, res) => {
    try {
      const id = req.params.id;

      const routesCollection = db.collection("routes");
      const route = await routesCollection.findOne({
        _id: new ObjectId(id),
        userId: req.authorised_user.userId,
      });

      if (!route) {
        return res.status(404).json({ error: "Ruta nije pronađena." });
      }

      const { _id, ...routeBezId } = route;

      const kopija = {
        ...routeBezId,
        name: `${route.name} (kopija)`,
        status: "planirana",
      };

      const result = await routesCollection.insertOne(kopija);

      return res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Greška u POST /routes/:id/copy:", error);
      return res.status(500).json({ error: "Greška pri kopiranju rute." });
    }
  });

  return router;
}

export default routeRoutes;
