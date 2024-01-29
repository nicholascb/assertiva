const express = require("express");
const userRoute = require("./routes/users.js");
const filterRoute = require("./routes/filters.js");
require("dotenv").config();

const app = express();
const PORT = process.env.NODE_DOCKER_PORT || 8080;

app.use(express.json());

app.use("/user", userRoute);
app.use("/filters", filterRoute);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
