import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/authRoute.js';
import listRouter from './routes/listRoute.js';
import cookieParser from 'cookie-parser';
import path from 'path';
dotenv.config();

mongoose.connect(process.env.MONGODB).then(() =>{
  console.log('Connected to MongoDB!');
}).catch(err => {
  console.log(err);
});

const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.listen(3000, () => {
  console.log('Server running on port 3000!');
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listRouter);

app.use(express.static(path.join(__dirname, '/client/dist'))); 

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});