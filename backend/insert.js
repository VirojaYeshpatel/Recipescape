const fs = require('fs');
const {Client} = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function insertRecipes() {
    try{
        await client.connect();
        const rawData = fs.readFileSync('US_recipes.json');
        const recipesObject = JSON.parse(rawData);

        const recipes = Object.values(recipesObject); //object to array


        for (const recipe of recipes) {
            recipe.rating = isNaN(recipe.rating) ? null : recipe.rating;
            recipe.prep_time = isNaN(recipe.prep_time) ? null : recipe.prep_time;
            recipe.cook_time = isNaN(recipe.cook_time) ? null : recipe.cook_time;
            recipe.total_time = isNaN(recipe.total_time) ? null : recipe.total_time;

            await client.query(
            `INSERT INTO recipes 
            (cuisine, title, rating, prep_time, cook_time, total_time, description, nutrients, serves) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
                [
                    recipe.cuisine,
                    recipe.title,
                    recipe.rating,
                    recipe.prep_time,
                    recipe.cook_time,
                    recipe.total_time,
                    recipe.description,
                    recipe.nutrients,
                    recipe.serves
                ]
            );
        }
        console.log("Data inserted successfully!");
        } catch (err) {
            console.error("Error inserting data:", err);
        } finally {
            await client.end();
        }
    }
insertRecipes();
