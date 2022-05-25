const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middle Ware
app.use(cors());
app.use(express.json());
// p 3EmyINqgmIuxsZJc   nortexTools
// Root end point
app.get("/", async (req, res) => {
  res.send("Server is connect");
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://nortexTools:<password>@cluster0.vrkwl.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    console.log("Connect");
  } finally {
  }
};
run().catch(console.dir);
// Port
app.listen(port, () => {
  console.log("Server is running on port", port);
});
