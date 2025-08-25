const express = require('express');
const cors = require('cors'); //allow frontend to call backend
const { Pool } = require('pg'); //manage multiple database connections 
require('dotenv').config();

const app = express();
app.use(cors({
    origin: "https://famous-sunflower-444d55.netlify.app/"
})); //cross orign request
app.use(express.json()); //parses incoming request

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});



app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


//get all recipes (api 1)

app.get('/api/recipes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const recipes = await pool.query(
      `SELECT id, title, cuisine, rating, prep_time, cook_time, total_time, description, nutrients, serves
       FROM recipes
       ORDER BY rating DESC NULLS LAST
       OFFSET $1 LIMIT $2`,
      [offset, limit]
    );

    const total = await pool.query(`SELECT COUNT(*) FROM recipes`);

    res.json({
      page,
      limit,
      total: parseInt(total.rows[0].count),
      data: recipes.rows
    });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


//search recipes (api 2)

    app.get('/api/recipes/search', async (req, res) => {
    try {
        const { title, cuisine, total_time, rating, calories } = req.query;

        let conditions = [];
        let values = [];
        let idx = 1;

        if (title) {
            conditions.push(`title ILIKE $${idx++}`);
            values.push(`%${title}%`);
        }

            if (cuisine) {
                conditions.push(`cuisine ILIKE $${idx++}`);
                values.push(`%${cuisine}%`);
            }
            if (total_time) {
                conditions.push(`total_time <= $${idx++}`);
                values.push(parseInt(total_time));
            }
            if (rating) {
                conditions.push(`rating >= $${idx++}`);
                values.push(parseFloat(rating));
            }
            if (calories) {
                conditions.push(`CAST(NULLIF(regexp_replace(nutrients->>'calories','[^0-9.]','','g'),'') AS float) <= $${idx++}`);
                values.push(parseFloat(calories));
            }
            
            const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

            const query = 
            `SELECT id, title, cuisine, rating, prep_time, cook_time, total_time, description, nutrients, serves
            FROM recipes ${where}
            ORDER BY rating DESC NULLS LAST`;

            const results = await pool.query(query, values);
                res.json({ data: results.rows });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Server error' });
            }
        });


const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));










