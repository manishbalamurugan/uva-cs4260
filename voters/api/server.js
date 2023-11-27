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
        const candidates = await db.collection("candidates").find().toArray();
        console.log(candidates);
        res.end(JSON.stringify(candidates));
    } catch (error) {
        res.status(500).json({success: false, error:'Internal server error'});
    }
})

app.get('/candidates/ballots', async (req, res) => {
    try{
        const candidates = await db.collection("candidates").find().toArray();
        const voters = await db.collection("voters").find().toArray();

        let currResults = {};
        let pending = 0;

        candidates.forEach((c) => {
           const name = c.name;
            currResults[name] = 0;
        });

        voters.forEach((v) => {
            const ballot = v.ballot.candidate;
            if(ballot == null){
                pending++;
                currResults["Pending"] = pending;
            } else{
                if(currResults[ballot]){
                    currResults[ballot]++;
                } else{
                    currResults[ballot] = 1;
                }
            }
        });
        res.json(currResults);
        
    } catch (error) {
        res.status(500).json({success: false, error:'Internal server error'});
    }
})

// GET all voters
app.get('/voter', async (req, res) => {
    try {
      const voters = await db.collection('voters').find().toArray();
      res.json(voters);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // GET a specific voter by id
  app.get('/voter/:id', async (req, res) => {
    try {
      const voter = await db.collection('voters').findOne({ _id: mongodb.ObjectId(req.params.id) });
      if (voter) {
        res.json(voter);
      } else {
        res.status(404).json({ error: 'Voter not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // POST a new voter
  app.post('/voter', async (req, res) => {
    try {
      const newVoter = req.body;
      const result = await db.collection('voters').insertOne(newVoter);
      res.json(result.ops[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // PUT (update) a specific voter by id
  app.put('/voter/:id', async (req, res) => {
    try {
      const updatedVoter = req.body;
      const result = await db.collection('voters').updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: updatedVoter });
      if (result.modifiedCount === 1) {
        res.json(updatedVoter);
      } else {
        res.status(404).json({ error: 'Voter not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // DELETE a specific voter by id
  app.delete('/voter/:id', async (req, res) => {
    try {
      const result = await db.collection('voters').deleteOne({ _id: mongodb.ObjectId(req.params.id) });
      if (result.deletedCount === 1) {
        res.json({ message: 'Voter deleted successfully' });
      } else {
        res.status(404).json({ error: 'Voter not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // GET a specific voter's ballot by voter id
  app.get('/voter/:id/ballot', async (req, res) => {
    try {
      const voter = await db.collection('voters').findOne({ _id: mongodb.ObjectId(req.params.id) });
      if (voter) {
        res.json(voter.ballot);
      } else {
        res.status(404).json({ error: 'Voter not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // PUT (update) a specific voter's ballot by voter id
  app.put('/voter/:id/ballot', async (req, res) => {
    try {
      const updatedBallot = req.body;
      const result = await db.collection('voters').updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: { ballot: updatedBallot } });
      if (result.modifiedCount === 1) {
        res.json(updatedBallot);
      } else {
        res.status(404).json({ error: 'Voter not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
