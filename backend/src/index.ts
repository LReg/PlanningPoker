import 'dotenv/config';
import express from 'express';
import sessionRouter from './routers/sessionRouter.js';
import { server, app }from './services/socketService.js';

const port = process.env.BACKEND_PORT;
export const debug = true;

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', `${process.env.PROTOCOL}://${process.env.DOMAIN}`);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization, content-type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
    next();
});

app.use(sessionRouter);

app.options('*', (req, res) => {
    res.sendStatus(200);
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
