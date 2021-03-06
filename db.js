import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

const handleMongo = () => {
  console.log("Mongo is connected");
};

const handleError = (error) => {
  console.log(`You got mongo ${error}`);
};

db.on("error", handleError);

db.once("open", handleMongo);
