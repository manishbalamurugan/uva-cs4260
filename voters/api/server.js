const cors = require('cors');
const express = require('express');
const mongodb = require('mongodb');

const app = express();

// Express + MongoDB Setup
const uri = "mongodb+srv://manish:Voters4260@voters.eucgeq2.mongodb.net/?retryWrites=true&w=majority";
const db = "Voters"

const port = process.env.PORT || 4200;

const client = new mongodb.MongoClient(uri);

app.use(cors());
app.use(express.json());

// Connect to MongoDB
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

app.use(express.json());