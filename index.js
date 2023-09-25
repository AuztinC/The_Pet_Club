const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_pet_club_db');
const express = require('express');
const app = express();
const path = require('path');

app.use(express.json())

const homePage = path.join(__dirname, 'index.html');
app.get('/', (req, res)=> res.sendFile(homePage));

const reactApp = path.join(__dirname, 'dist/main.js');
app.get('/dist/main.js', (req, res)=> res.sendFile(reactApp));

const reactSourceMap = path.join(__dirname, 'dist/main.js.map');
app.get('/dist/main.js.map', (req, res)=> res.sendFile(reactSourceMap));

const styleSheet = path.join(__dirname, 'styles.css');
app.get('/styles.css', (req, res)=> res.sendFile(styleSheet));

app.get('/api/owners', async(req,res,next)=>{
  try {
    const response = await client.query(`SELECT * FROM owners ORDER BY id;`)
    res.send(response.rows)
  } catch (error) {
    next(error)
  }
})

app.get('/api/pets', async(req,res,next)=>{
  try {
    const response = await client.query(`SELECT * FROM pets ORDER BY id;`)
    res.send(response.rows)
  } catch (error) {
    next(error)
  }
})

app.put('/api/pets/:id', async(req,res,next)=>{
  try {
    const SQL = `
    UPDATE pets
    SET name = $1, owner_id = $2
    WHERE id = $3
    RETURNING *
    `;
    const response = await client.query(SQL, [req.body.name, req.body.owner_id, req.params.id])
    res.send(response.rows[0])
  } catch (error) {
    next(error)
  }
})

const init = async()=> {
  await client.connect();
  console.log('connected to database');
  const SQL = `
    DROP TABLE IF EXISTS owners;
    DROP TABLE IF EXISTS pets;
    CREATE TABLE owners(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20)
    );
    CREATE TABLE pets(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20),
      owner_id INT
    );
    INSERT INTO owners (name) VALUES ('janyce');
    INSERT INTO owners (name) VALUES ('muarice');
    INSERT INTO owners (name) VALUES ('clyde');

    INSERT INTO pets (name, owner_id) VALUES ('lucky', 2);
    INSERT INTO pets (name, owner_id) VALUES ('chuck', 2);
    INSERT INTO pets (name) VALUES ('precious');
    INSERT INTO pets (name) VALUES ('hank');
  `;
  await client.query(SQL)
  console.log('create your tables and seed data');

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> {
    console.log(`listening on port ${port}`);
  });
}

init();