const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");
const redis = require("ioredis");
const cors = require('cors');
let RedisStore = require("connect-redis")(session);

const { 
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
 } = require('./config/config');

let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

const connectWithRetry = () => {
  mongoose
    .connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`)
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
}

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}));
app.use(session({
  store: new RedisStore({ client: redisClient}),
  secret: SESSION_SECRET,
  cookie: {
    secure: false,
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    maxAge: 600000,
  }
}))
app.use(express.json());
/*mongoose
   .connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`)
   .then(() => console.log("Connected to MongoDB..."))
   .catch((e) => console.log(e));*/

app.get('/api/v1', (req, res) => {
    res.send('<h2>Hello World!!!!!</h2>');
    console.log('Someone made a request to the root route');
})

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => 
  console.log(`Server is up on port ${port}`));