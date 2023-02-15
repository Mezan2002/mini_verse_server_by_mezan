// require start
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// require end

// middle wares use start
app.use(cors());
app.use(express.json());
// middle wares use end

// connect with MongoDB start
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2ahck7i.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// connect with MongoDB end

// collections start

const postsCollection = client.db("miniVerseDB").collection("posts");
const commentsCollection = client.db("miniVerseDB").collection("comments");

// collections end

// CRUD run function start
const run = async () => {
  try {
    // new post API start
    app.post("/newPost", async (req, res) => {
      const postedData = req.body;
      const result = await postsCollection.insertOne(postedData);
      res.send(result);
    });
    // new post API end

    // get all posts API start
    app.get("/posts", async (req, res) => {
      const query = {};
      const result = await postsCollection.find(query).toArray();
      res.send(result);
    });
    // get all posts API end

    // like in a post API start
    app.put("/liked/:id", async (req, res) => {
      const id = req.params.id;
      const updatedLike = req.body;
      console.log(updatedLike);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          likes: updatedLike.likes,
          liked: updatedLike.liked,
        },
      };
      const result = await postsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    // like in a post API end

    // add comment on a single post API start
    app.post("/addComments", async (req, res) => {
      const comment = req.body;
      const result = await commentsCollection.insertOne(comment);
      res.send(result);
    });
    // add comment on a single post API end
  } finally {
    // console.log();
  }
};
run().catch((err) => console.log(err));
// CRUD run function end

// initial setup start
app.get("/", (req, res) => {
  res.send("Mini Verse Server is Running!!!");
});

app.listen(port, () => {
  console.log(`Mini Verse Server is Running on Port ${port}`);
});

// initial setup end
