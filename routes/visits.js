import express from "express";
import { ObjectId } from "mongodb";

function visitRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const visitsCollection = db.collection("visits");
      const storesCollection = db.collection("stores");
      const routesCollection = db.collection("routes");

      const visits = await visitsCollection
        .find({ userId: req.authorised_user.userId })
        .toArray();

      const visitsSaTrgovinom = [];

      for (const visit of visits) {
        const store = await storesCollection.findOne({ _id: visit.storeId });

        let route = null;
        if (visit.routeId) {
          route = await routesCollection.findOne({ _id: visit.routeId });
        }

        visitsSaTrgovinom.push({
          ...visit,
          store: store || null,
          route: route ? { _id: route._id, name: route.name } : null,
        });
      }

      return res.status(200).json(visitsSaTrgovinom);
    } catch (error) {
      console.error("Greška u GET /visits:", error);
      return res.status(500).json({ error: "Greška pri dohvaćanju posjeta" });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const visitsCollection = db.collection("visits");
      const storesCollection = db.collection("stores");

      const visit = await visitsCollection.findOne({
        _id: new ObjectId(id),
        userId: req.authorised_user.userId,
      });

      if (!visit) {
        return res.status(404).json({ error: "Posjet nije pronađen." });
      }

      const store = await storesCollection.findOne({ _id: visit.storeId });

      const visitSaTrgovinom = {
        ...visit,
        store: store || null,
      };

      return res.status(200).json(visitSaTrgovinom);
    } catch (error) {
      console.error("Greška u GET /visits/:id:", error);
      return res.status(500).json({ error: "Greška pri dohvaćanju posjeta." });
    }
  });

  router.patch("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;

      if (
        !updateData.storeId &&
        !updateData.date &&
        updateData.kilometers === undefined &&
        !updateData.note
      ) {
        return res.status(400).json({ error: "Nema podataka za ažuriranje." });
      }

      if (updateData.kilometers !== undefined) {
        if (
          typeof updateData.kilometers !== "number" ||
          updateData.kilometers < 0
        ) {
          return res
            .status(400)
            .json({ error: "Kilometers mora biti broj veći ili jednak 0." });
        }
      }

      const visitsCollection = db.collection("visits");
      const storesCollection = db.collection("stores");

      const podaciZaUpdate = { ...updateData };

      if (updateData.storeId) {
        const postojecaTrgovina = await storesCollection.findOne({
          _id: new ObjectId(updateData.storeId),
        });

        if (!postojecaTrgovina) {
          return res
            .status(404)
            .json({ error: "Trgovina za zadani storeId ne postoji." });
        }

        podaciZaUpdate.storeId = new ObjectId(updateData.storeId);
      }

      const result = await visitsCollection.updateOne(
        { _id: new ObjectId(id), userId: req.authorised_user.userId },
        { $set: podaciZaUpdate },
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Posjet nije pronađen." });
      }

      return res.status(200).json({ message: "Posjet ažuriran." });
    } catch (error) {
      console.error("Greška u PATCH /visits/:id:", error);
      return res.status(500).json({ error: "Greška pri ažuriranju posjeta" });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const visitsCollection = db.collection("visits");
      const result = await visitsCollection.deleteOne({
        _id: new ObjectId(id),
        userId: req.authorised_user.userId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Posjet nije pronađen." });
      }

      return res.status(200).json({ message: "Posjet obrisan." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Greška pri brisanju posjeta" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const noviPosjet = req.body;

      if (
        !noviPosjet.storeId ||
        !noviPosjet.date ||
        noviPosjet.kilometers === undefined ||
        !noviPosjet.note
      ) {
        return res
          .status(400)
          .json({ error: "storeId, date, kilometers i note su obavezni." });
      }

      if (
        typeof noviPosjet.kilometers !== "number" ||
        noviPosjet.kilometers < 0
      ) {
        return res
          .status(400)
          .json({ error: "Kilometers mora biti broj veći ili jednak 0." });
      }

      const storesCollection = db.collection("stores");
      const postojecaTrgovina = await storesCollection.findOne({
        _id: new ObjectId(noviPosjet.storeId),
      });

      if (!postojecaTrgovina) {
        return res
          .status(404)
          .json({ error: "Trgovina za zadani storeId ne postoji." });
      }

      const visitsCollection = db.collection("visits");

      const visitZaSpremanje = {
        storeId: new ObjectId(noviPosjet.storeId),
        date: noviPosjet.date,
        kilometers: noviPosjet.kilometers,
        note: noviPosjet.note,
        userId: req.authorised_user.userId,
      };

      const result = await visitsCollection.insertOne(visitZaSpremanje);

      return res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Greška u POST /visits:", error);
      return res.status(500).json({ error: "Greška pri dodavanju posjeta" });
    }
  });

  return router;
}

export default visitRoutes;
