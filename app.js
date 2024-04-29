import express from 'express';
import session from 'express-session';

import morgan from 'morgan';

// Import App routes
import items from './items.js';
const port = 3000;

const app = express();

app.use(morgan())
app.use(session({
    name: 'mySessionId',
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());



app.use('/public', express.static('public'))

app.use('/items', items);



// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
