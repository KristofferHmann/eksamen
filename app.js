import express from 'express';
import { config } from './config.js';
import Database from './database.js';

import morgan from 'morgan';

// Import App routes
import items from './items.js';
const port = 3000;

const app = express();

app.use(morgan())

app.use('/public', express.static('public'))
// Connect App routes
//app.use('/api-docs', openapi);
app.use('/items', items);
app.use('/activitytracker', express.static("activitytracker"));

//app.use('*', (_, res) => {
//res.redirect('/api-docs');
//});

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
