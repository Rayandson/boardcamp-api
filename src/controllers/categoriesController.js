import {connectionDB} from "../database/db.js"

export async function create(req, res) {
    const {name} = req.body;
    try {
        await connectionDB.query("INSERT INTO categories (name) VALUES ($1);", [name])
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
} 

export async function findAll(req, res) {
    try {
        const categories = await connectionDB.query("SELECT * FROM categories;")
        res.send(categories.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
}