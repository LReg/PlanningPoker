import express from "express";
import {veryImportantMessage} from "../services/logger.js";

const router = express.Router();

let locked = false;

/**
 * headers: none
 * params: none
 * querry: none
 * body: {
 *     title: string;
 *     text: string;
 * }
 */
router.post('/changerequest', (req, res) => {
    const allowed = checkLockAndLock();
    if (!allowed) {
        res.sendStatus(429);
        return;
    }

    const title = req.body.title;
    const text = req.body.text;

    if (!title || title == '' || !text || text == '') {
        res.status(400).send('provide title and text');
        return;
    }

    veryImportantMessage(`Changerequest\n${title}\n${text}`);
    res.send('OK')
});

/**
 * headers: none
 * params: none
 * querry: none
 * body: {
 *     title: string;
 *     text: string;
 * }
 */
router.post('/bugreport', (req, res) => {
    const allowed = checkLockAndLock();
    if (!allowed) {
        res.sendStatus(429);
        return;
    }

    const title = req.body.title;
    const text = req.body.text;

    if (!title || title == '' || !text || text == '') {
        res.status(400).send('provide title and text');
        return;
    }

    veryImportantMessage(`Bugreport\n${title}\n${text}`)
    res.send('OK')
});


function checkLockAndLock(): boolean {
    if (locked) {
        return false;
    } else {
        locked = true;
        setTimeout(() => {
            locked = false;
        }, 1000);
        return true;
    }
}

export const userRequestRouter = router;
