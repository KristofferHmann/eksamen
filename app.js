// Importerer express biblioteket, som bruges til at bygge webserveren
import express from 'express';
// Importerer express-session biblioteket, som bruges til at håndtere sessions
import session from 'express-session';

// Importerer morgan biblioteket, som bruges til at logge HTTP requests
import morgan from 'morgan';

// Importerer ruterne for items fra items.js filen
import items from './items.js';

// Definerer portnummeret, som serveren skal lytte på
const port = 3000;

// Opretter en ny express applikation
const app = express();

// Tilføjer morgan middleware til applikationen, så alle HTTP requests bliver logget
app.use(morgan())

// Tilføjer session middleware til applikationen med konfigurationsobjektet
app.use(session({
    name: 'mySessionId', // Navnet på session ID cookie
    secret: 'secret', // Hemmeligheden bruges til at signere session ID cookie
    resave: true, // Tvinger sessionen til at blive gemt tilbage i session store
    saveUninitialized: true // Tvinger en session, der er "uninitialized", til at blive gemt i session store
}));

// Tilføjer middleware til at parse JSON bodies fra HTTP requests
app.use(express.json());

// Serverer statiske filer fra 'public' mappen, når der laves en request til '/public' stien
app.use('/public', express.static('public'))

// Tilføjer items ruterne til applikationen, så de bliver håndteret under '/items' stien
app.use('/items', items);

// Starter serveren og får den til at lytte på det definerede portnummer
app.listen(port, () => {
    // Logger en besked til konsollen, når serveren er startet
    console.log(`Server started on port ${port}`);
});