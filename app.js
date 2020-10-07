import express from 'express';
import mongoose from 'mongoose';
import { accountsRouter } from './routes/accountsRouter.js';

const app = express();
//base of our api
//creating mongoDB connection by mongoose
(async () => {
  try {
    await mongoose.connect("mongodb+srv://igti:igti@bootcamp.rpzp5.mongodb.net/bank?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log("mongo is UP");
  } catch (err) {
  console.log("mongo is down");
  }
})();




app.use(express.json());
app.use('/account', accountsRouter);


app.listen(3000, () => console.log('API is UP'))