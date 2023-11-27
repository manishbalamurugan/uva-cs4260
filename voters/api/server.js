const cors = require('cors');
const express = require('express');
const mongodb = require('mongodb');

const app = express();

// Express + MongoDB Setup
const uri = "mongodb+srv://manish:Voters4260@voters.eucgeq2.mongodb.net/?retryWrites=true&w=majority";


const port = process.env.PORT || 4200;

const client = new mongodb.MongoClient(uri);

app.use(cors());
app.use(express.json());

app.listen(4200, () => {
    console.log('Server running on port 4200');
});

// Connect to MongoDB
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

const db = client.db("voting");

app.use(express.json());

app.get('/candidates',  async (req, res) => {
    try{
        const candidates = await db.collection("candidates").find().toArray()
        console.log(candidates);
        res.end(JSON.stringify(candidates));
    } catch (error) {
        res.status(500).json({success: false, error:'Internal server error'});
    }
})
