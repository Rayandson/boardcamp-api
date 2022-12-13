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
        const queryRentals = await connectionDB.query("SELECT * FROM rentals;")
        const queryCustomers = await connectionDB.query("SELECT * FROM customers;")
        const queryGames = await connectionDB.query("SELECT * FROM games;")
        const queryCategories = await connectionDB.query("SELECT * FROM categories;")
        const rentals = queryRentals.rows;
        const customers = queryCustomers.rows;
        const games = queryGames.rows;
        const categories = queryCategories.rows;
        const arrayRentals = rentals.map((r) => {
            let rentalCustomer;
            let rentalGame;
            let rentalGameCategory;
            for(let i=0; i < customers.length; i++) {
                if(r.customerId === customers[i].id) { 
                    rentalCustomer = customers[i];
                }
            }

            for(let j=0; j < games.length; j++) {
                console.log(r.gameId)
                if(r.gameId === games[j].id) {
                    
                    rentalGame = games[j];
                    for(let k=0; k < categories.length; k++) {
                        if(rentalGame.categoryId === categories[k].id) {
                            rentalGameCategory = categories[k].name;
                            break;
                        }
                    }
                    break;
                }
            }

            const rentalObj =  {...r, customer:{id: rentalCustomer.id, name: rentalCustomer.name}, game: {id: rentalGame.id, name: rentalGame.name, categoryId: rentalGame.categoryId, categoryName: rentalGameCategory}}
            return rentalObj;
        })
        res.send(arrayRentals);
        // const rentals = await connectionDB.query('SELECT json_build_object("rentId", r.id, "customerId", r."customerId","gameId", r."gameId", "rentDate", r."rentDate", "daysRented", r."daysRented", "returnDate". r."returnDate", "originalPrice", r."originalPrice", "delayFee", r."delayFee", "customer", json_build_object("customerId", c.id, "name", c.name),"game", json_build_object("gameId", g.id, "name", g.name, "categoryId", g."categoryId", "categoryName", g."categoryName")) FROM rentals r INNER JOIN customers c on c.id = r."customerId" INNER JOIN games g on g.id = r."gameId"')
        // res.send(rentals.rows)
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