import pg from "pg";
import dotenv from "dotenv"
dotenv.config();

const {Pool} = pg;

export const connectionDB = new Pool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: "postgres",
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})

// export const connectionDB = new Pool({
//     connectionString: process.env.DATABASE_URL,
//   }); 
 
