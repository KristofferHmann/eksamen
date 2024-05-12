// Importerer dotenv biblioteket, som bruges til at håndtere miljøvariabler.
import * as dotenv from 'dotenv';

// Konfigurerer dotenv til at læse miljøvariabler fra `.env` filen. 
// `debug: true` betyder, at det vil logge en fejl, hvis det ikke kan finde `.env` filen.
dotenv.config({ path: `.env`, debug: true });

// Læser servernavnet fra miljøvariablerne.
const server = process.env.AZURE_SQL_SERVER;

// Læser databasenavnet fra miljøvariablerne.
const database = process.env.AZURE_SQL_DATABASE;

// Læser portnummeret fra miljøvariablerne og konverterer det til et tal med parseInt.
const port = parseInt(process.env.AZURE_SQL_PORT);

// Læser brugernavnet fra miljøvariablerne.
const user = process.env.AZURE_SQL_USER;

// Læser adgangskoden fra miljøvariablerne.
const password = process.env.AZURE_SQL_PASSWORD;

// Læser JWT hemmeligheden fra miljøvariablerne.
const jwtSecret = process.env.JWT_SECRET;

// Logger servernavnet til konsollen.
console.log(server);

// Eksporterer en konfigurationsobjekt, der indeholder alle de læste miljøvariabler.
// `options: { encrypt: true }` betyder, at forbindelsen til databasen vil være krypteret.
export const config = {
    server,
    port,
    database,
    user,
    password,
    jwtSecret,
    options: {
        encrypt: true
    }
};