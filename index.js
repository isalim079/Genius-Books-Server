const express = require('express')
const cors = require('cors')
const app = express()
require("dotenv").config()
const port = process.env.PORT || 2500;

// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sja1kis.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const homePageData = client.db("geniusBooksDB").collection("booksOfTheMonth")
    const libraryEventsData = client.db("geniusBooksDB").collection("libraryEventsAndFeatures")
    const booksCategoryData = client.db("geniusBooksDB").collection("booksCategories")

    // get data for books of the month section
    app.get("/booksOfTheMonth", async(req, res) => {
        const cursor = homePageData.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    // get data for library event and features
    app.get("/libraryEventsAndFeatures", async(req, res) => {
        const cursor = libraryEventsData.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    // get data for Books Category
    app.get("/libraryEventsAndFeatures", async(req, res) => {
        const cursor = booksCategoryData.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Genius Book is running");
});

app.listen(port, () => {
    console.log(`Genius Book Server is running on port ${port}`);
});
