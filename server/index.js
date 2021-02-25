const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Post Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
   user: keys.pgUser,
   host: keys.pgHost,
   database: keys.pgDatabase,
   password: keys.pgPassword,
   port: keys.pgPort
});

pgClient.on('connect', () => {
    pgClient
      .query('CREATE TABLE IF NOT EXISTS values (number INT)')
      .catch((err) => console.log(err));
});

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
   res.send('Hi');
});

app.get('/values/all', async(req, res)=>{
 const values = await pgClient.query('SELECT * from values');
 
 res.send(values.rows);
});

app.get('/values/current', async(req, res) =>{
   redisClient.hgetall('values', (err, values) => {
      res.send(values);
   });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  console.group('Index ='+ index);

  if (parseInt(index) > 40) {
    return  res.status(422).send('Index too high');
  }

redisClient.hset('values', index, 'Noting yet!');
redisPublisher.publish('insert', index);
const erg = pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
console.group('afterInsert "'+erg.pgPort+'"');

res.send({ working: true });
});


app.post('/values/clear', async (req, res) => {
 console.group('beim löschen');
 redisClient.flushall();
 const erg = pgClient.query('DELETE FROM values WHERE true'); 
 console.group('gelöscht '+ erg);
 res.send({ working: true });
 });



app.listen(5000, err =>{
  console.group('Listening');
});