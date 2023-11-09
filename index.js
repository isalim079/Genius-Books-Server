const express = require("express");
const cors = require("cors");

const app = express();
require("dotenv").config();
const port = process.env.PORT || 2500;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sja1kis.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // creating database
        const homePageData = client
            .db("geniusBooksDB")
            .collection("booksOfTheMonth");
        const libraryEventsData = client
            .db("geniusBooksDB")
            .collection("libraryEventsAndFeatures");
        const booksCategoryData = client
            .db("geniusBooksDB")
            .collection("booksCategories");
        const addBooksData = client
            .db("geniusBooksDB")
            .collection("allBooksDetails");
        const geniusBooksUserData = client
            .db("geniusBooksDB")
            .collection("geniusBooksUsers");
        const borrowedBooksData = client
            .db("geniusBooksDB")
            .collection("borrowedBooks");

        // get data for books of the month section
        app.get("/booksOfTheMonth", async (req, res) => {
            const cursor = homePageData.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // get data for library event and features
        app.get("/libraryEventsAndFeatures", async (req, res) => {
            const cursor = libraryEventsData.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // get data for Books Category
        app.get("/booksCategories", async (req, res) => {
            const cursor = booksCategoryData.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // getting all books data for category
        app.get("/category", async (req, res) => {
            const cursor = addBooksData.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // getting all books data
        app.get("/allBooks", verifyToken, async (req, res) => {
            console.log("all books cookies", req.cookies);

            // console.log("query mail", req.query.email);
            // console.log("user mail", req.user.email);
            // console.log("token owner", req.user)
            if (req.user.email !== req.query.email) {
                return res.status(403).send({ message: "forbidden access" });
            }
            const cursor = addBooksData.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // getting specific books category data
        app.get("/category/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const bookCategory = await addBooksData.findOne(query);
            res.send(bookCategory);
        });

        //update quantity
        app.patch("/category/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateQuantity = req.body;
            console.log(updateQuantity);
            const updatedQuantity = {
                $set: {
                    bookQuantity: updateQuantity.bookQuantity,
                },
            };
            const result = await addBooksData.updateOne(
                filter,
                updatedQuantity
            );
            res.send(result);
        });

        // Update full book data
        app.put("/category/:id", async (req, res) => {
            const id = req.params.id;
            const booksData = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateUser = {
                $set: {
                    name: booksData.name,
                    bookQuantity: booksData.bookQuantity,
                    image: booksData.image,
                    bookCategory: booksData.bookCategory,
                    description: booksData.description,
                    author: booksData.author,
                    ratingDetails: booksData.ratingDetails,
                },
            };
            const result = await addBooksData.updateOne(
                filter,
                updateUser,
                options
            );
            res.send(result);
        });

        // getting genius books user data
        app.get("/geniusBooksUsers", async (req, res) => {
            const cursor = geniusBooksUserData.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // getting borrowed books data
        app.get("/borrowedBooks", async (req, res) => {
            const cursor = borrowedBooksData.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // post add books data
        app.post("/allBooksDetails", async (req, res) => {
            const allBooksData = req.body;
            const result = await addBooksData.insertOne(allBooksData);
            res.send(result);
        });

        // post user info
        app.post("/geniusBooksUsers", async (req, res) => {
            const usersData = req.body;
            const result = await geniusBooksUserData.insertOne(usersData);
            res.send(result);
        });

        // post borrowed books data
        app.post("/borrowedBooks", async (req, res) => {
            const borrowBooksData = req.body;
            const result = await borrowedBooksData.insertOne(borrowBooksData);
            res.send(result);
        });

        // return borrowed books
        app.delete("/borrowedBooks/:id", async (req, res) => {
            const id = req.params.id;
            const query = { id: id };
            const result = await borrowedBooksData.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
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
