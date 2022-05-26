const express = require("express");
const cors = require("cors");
require("dotenv").config();
var jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

// Middle Ware
app.use(cors());
app.use(express.json());

// Root end point
app.get("/", async (req, res) => {
  res.send("Server is connect");
});
const verifyJwt = (req, res, next) => {
  const authorizationToken = req.headers.authorization;

  if (!authorizationToken) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authorizationToken.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
};
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrkwl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    console.log("Connect");
    //Tools Collection
    const toolsCollection = client.db("nortexTools").collection("tools");
    // Bookings Collection
    const bookingsCollection = client.db("nortexTools").collection("bookings");
    const usersCollection = client.db("nortexTools").collection("users");
    // jwt token
    app.put("/singIn/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const option = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(filter, updateDoc, option);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      res.send({ result, token });
    });

    // Get all tools
    app.get("/tools", async (req, res) => {
      const tools = await toolsCollection.find({}).toArray();
      res.send(tools);
    });
    // Get single tools by id
    app.get("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const tool = await toolsCollection.findOne(query);
      res.send(tool);
    });
    // Book products
    app.post("/bookings", async (req, res) => {
      const bookingItem = req.body;
      const booked = await bookingsCollection.insertOne(bookingItem);
      res.send(booked);
    });

    // Get my booking products
    app.get("/myItems", verifyJwt, async (req, res) => {
      const decoEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decoEmail) {
        const orders = await bookingsCollection
          .find({ email: email })
          .toArray();
        res.send(orders);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });
  } finally {
  }
};
run().catch(console.dir);
// Port
app.listen(port, () => {
  console.log("Server is running on port", port);
});
