import {connectionDB} from "../database/db.js"
import dayjs from "dayjs";

export async function create(req, res) {
    const {customerId, gameId, daysRented} = req.body;
    const dayJsObject = dayjs();
    const rentDate = dayJsObject.format("YYYY/MM/DD")
    let originalPrice;
    try {
        const price = await connectionDB.query('SELECT "pricePerDay" FROM games WHERE id=$1;', [gameId])
        originalPrice = price.rows[0].pricePerDay*daysRented;
        console.log(originalPrice)
        await connectionDB.query('INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);', [customerId, gameId, rentDate, daysRented, null, originalPrice, null])
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
} 

export async function findAll(req, res) {
    try {
        const rentals = await connectionDB.query(`SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer, json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals JOIN customers on customers.id = rentals."customerId" JOIN games on games.id = rentals."gameId" JOIN categories on categories.id = games."categoryId";`)
        res.send(rentals.rows)
    } catch (err) {
        res.status(500).send(err.message); 
    }
}

export async function update(req, res) {
    const { id } = req.params;
    const dayJsObject = dayjs();
    const returnedDate = dayJsObject.format("YYYY/MM/DD")
    const example = dayjs('2022-12-25')
    let delay;
    let delayFee = null;
    try {
        const rental = await connectionDB.query('SELECT * FROM rentals WHERE id=$1;', [id])
        if(!rental) {
            return res.sendStatus(404)
        }

        if(rental.rows[0].returnDate !== null) {
            return res.status(400).send("O aluguel já foi finalizado.")
        }

        const rentDate = dayjs(rental.rows[0].rentDate.toISOString())
        delay = dayjs(returnedDate).diff(rentDate, 'day')

        if(delay > rental.rows[0].daysRented) {
            delayFee = (delay-rental.rows[0].daysRented)*rental.rows[0].originalPrice;
        }
        await connectionDB.query('UPDATE rentals SET "returnDate"=$1, "delayFee"=$2 WHERE id = $3;', [returnedDate, delayFee, id])
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
} 

export async function remove(req, res) {
    const { id } = req.params;
    const dayJsObject = dayjs();
    
    try {
        const rental = await connectionDB.query('SELECT * FROM rentals WHERE id=$1;', [id])
        if(!rental) {
            return res.sendStatus(404)
        }

        if(rental.rows[0].returnDate === null) {
            return res.status(400).send("O aluguel ainda não foi finalizado.")
        }

        await connectionDB.query('DELETE FROM rentals WHERE id = $1;', [id])
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
} 