import { verifyJWT } from "./auth.js";

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Nedostaje Authorization header.",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Neispravan format Authorization headera.",
      });
    }

    const token = parts[1];
    const decoded = await verifyJWT(token);

    if (!decoded) {
      return res.status(401).json({
        error: "Nevažeći ili istekli token.",
      });
    }

    req.authorised_user = decoded;
    next();
  } catch (error) {
    console.error("Greška u auth middlewareu:", error);
    return res.status(500).json({
      error: "Greška pri autorizaciji.",
    });
  }
}
