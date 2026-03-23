import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Funkcija za hashiranje lozinke koja koristi bcrypt paket:
export async function hashPassword(plainPassword, saltRounds = 10) {
  try {
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    return hash;
  } catch (err) {
    console.error("Greška prilikom hashiranja lozinke:", err);
    return null;
  }
}

// Funkcija za provjeru podudaranja lozinke i hash vrijednosti:
export async function checkPassword(plainPassword, hashedPassword) {
  try {
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    return result;
  } catch (err) {
    console.error("Greška prilikom provjere lozinke:", err);
    return false;
  }
}
