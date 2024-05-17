import express from "express";
import cors from "cors";
import db from "./modules/db.js";
import bodyParser from "body-parser";
import * as url from 'url';
import clientRoutes from './modules/clientroutes.js';
import apiRoutes from './modules/apiroutes.js';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// EJS view template location
app.set("view engine", "ejs");
app.set("views", url.fileURLToPath(new URL('./views', import.meta.url)));

// Serve static files
// app.use('/public', express.static(url.fileURLToPath(new URL('./public', import.meta.url))));
app.use('/css', express.static(url.fileURLToPath(new URL('./css', import.meta.url))));
app.use('/js', express.static(url.fileURLToPath(new URL('./clientjs', import.meta.url))));

// Serve API endpoints
app.use('/api', apiRoutes);

// Serve client pages
app.use('/', clientRoutes);

// General error handler
app.use((err, req, res, next) => {
    console.log("ERROR: ", err);
    res.status(500);
    res.json({ error: err.message });
})

// Start the server on port 3000
const server = app.listen(3000, () => {
    console.log("Running node server. View page at: http://localhost:3000/");
});
