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

const usersCollection = client.db("miniVerseDB").collection("users");
const postsCollection = client.db("miniVerseDB").collection("posts");

// collections end

// CRUD run function start
const run = async () => {
  try {
    // sign up user and post user API start
    app.post("/signUp", async (req, res) => {
      const userData = req.body;
      const result = await usersCollection.insertOne(userData);
      res.send(result);
    });
    // sign up user and post user API end

    // get a single users data API start
    app.get("/usersData", async (req, res) => {
      const userCode = req.query.userCode;
      const query = { userCode: userCode };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    // get a single users data API end

    // get user data for showing profile API start
    app.get("/data/:userId", async (req, res) => {
      const userId = req.params.userId;
      const query = { _id: ObjectId(userId) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    // get user data for showing profile API end

    // get user posts data API start
    app.get("/userPosts/:userCode", async (req, res) => {
      const userCode = req.params.userCode;
      const query = { "postedBy.userCode": userCode };
      const result = await postsCollection
        .find(query)
        .sort({ postedAt: -1 })
        .toArray();
      res.send(result);
    });
    // get user posts data API end

    // Login User API Start
    app.get("/login", async (req, res) => {
      const email = req.query.email;
      const password = req.query.password;
      const query = {
        "basicInfo.email": email,
        "basicInfo.password": password,
      };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    // Login User API End

    // Check User Email API Start
    app.get("/checkEmail/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        "basicInfo.email": email,
      };
      const result = await usersCollection.findOne(query);
      if (!result) {
        res.send({ isEmailExist: false });
      } else {
        res.send({ isEmailExist: true });
      }
    });
    // Check User Email API End

    // Check User Name API Start
    app.get("/checkUserName/:userName", async (req, res) => {
      const userName = req.params.userName;
      const query = {
        "basicInfo.userName": userName,
      };
      const result = await usersCollection.findOne(query);
      if (!result) {
        res.send({ isEmailExist: false });
      } else {
        res.send({ isEmailExist: true });
      }
    });
    // Check User Name API End

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
      const result = await postsCollection
        .find(query)
        .sort({ postedAt: -1 })
        .toArray();
      res.send(result);
    });
    // get all posts API end

    /* // like in a post API start
    app.put("/liked/:id", async (req, res) => {
      const id = req.params.id;
      const updatedLike = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          likes: updatedLike.likes,
          postLikedBy: updatedLike.postLikedBy,
        },
      };
      const result = await postsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    // like in a post API end */

    // update a post data API start
    app.put("/updatedPost/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body.editedPostText;
      console.log(updatedData);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          postedText: updatedData,
        },
      };
      const result = await postsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    // update a post data API end

    // update a post image API start
    app.put("/updateImage/:id", async (req, res) => {
      const id = req.params.id;
      const updatedText = req.body.editedPostText;
      const updatedImage = req.body.updatedImage;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          postedText: updatedText,
          postedImage: updatedImage,
        },
      };
      const result = await postsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    // update a post image API end

    // delete a post API start
    app.delete("/deletePost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await postsCollection.deleteOne(query);
      res.send(result);
    });
    // delete a post API end

    // create a new comment API start
    app.put("/postComment/:id", async (req, res) => {
      const id = req.params.id;
      const comment = req.body;
      const filter = { _id: ObjectId(id) };
      const post = await postsCollection.findOne(filter);
      if (!post) {
        return res.status(404).send("Post not found");
      }
      const options = { upsert: true };
      const updatedComments = [...post.comments, comment];
      const updatedDoc = {
        $set: {
          comments: updatedComments,
        },
      };
      const result = await postsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    // create a new comment API end

    // reply a comment API start
    app.put("/posts/:postId/comments/:commentId", async (req, res) => {
      const postId = req.params.postId;
      const commentId = req.params.commentId;
      const postedReplyComment = req.body;
      const findPost = { _id: ObjectId(postId) };
      const post = await postsCollection.findOne(findPost);
      const comments = post.comments;
      const selectedComment = comments.find(
        (comment) => comment.commentId == commentId
      );
      selectedComment.replyComments.push(postedReplyComment);
      const result = await postsCollection.updateOne(findPost, {
        $set: { comments },
      });
      res.send(result);
    });
    // reply a comment API end

    // edit a comment API start
    app.put("/posts/:postId/updateComment/:commentId", async (req, res) => {
      const postId = req.params.postId;
      const commentId = req.params.commentId;
      const updatedComment = req.body.editedComment;
      const filter = {
        _id: ObjectId(postId),
        "comments.commentId": parseInt(commentId),
      };
      const updatedDoc = {
        $set: {
          "comments.$.comment": updatedComment,
        },
      };
      // const findPost = await postsCollection.findOne(filter);
      const result = await postsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // edit a comment API end

    // delete a comment API start
    app.delete("/post/:postId/deleteComment/:commentId", async (req, res) => {
      const postId = req.params.postId;
      const commentId = req.params.commentId;
      try {
        const findPost = { _id: ObjectId(postId) };
        const updateQuery = {
          $pull: { comments: { commentId: parseInt(commentId) } },
        };
        const result = await postsCollection.updateOne(findPost, updateQuery);

        if (result.modifiedCount === 0) {
          return res
            .status(404)
            .json({ message: "Post or comment not found", isDeleted: false });
        }

        res.json({ message: "Comment deleted successfully", isDeleted: true });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", isDeleted: false });
      }
    });
    // delete a comment API end

    // delete a replied comment API start
    app.delete(
      "/posts/:postId/comments/:commentId/replies/:replyCommentId",
      async (req, res) => {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const replyCommentId = req.params.replyCommentId;
        try {
          const filter = {
            _id: ObjectId(postId),
            "comments.commentId": parseInt(commentId),
          };
          const update = {
            $pull: {
              "comments.$.replyComments": {
                replyCommentId: parseInt(replyCommentId),
              },
            },
          };
          const result = await postsCollection.updateOne(filter, update);

          if (result.modifiedCount === 0) {
            return res.status(404).json({
              message: "Post, comment or reply not found",
              isDeleted: false,
            });
          }

          res.json({
            message: "Reply comment deleted successfully",
            isDeleted: true,
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Server error", isDeleted: false });
        }
      }
    );

    // delete a replied comment API end
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
