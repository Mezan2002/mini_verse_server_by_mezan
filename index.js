// require start
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// require end

// middle wares use start
app.use(cors());
app.use(express.json());
// middle wares use end

// initial setup start
app.get("/", (req, res) => {
  res.send("Mini Verse Server is Running!!!");
});

app.listen(port, () => {
  console.log(`Mini Verse Server is Running on Port ${port}`);
});

// initial setup end
