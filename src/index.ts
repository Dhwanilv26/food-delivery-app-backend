import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import myUserRoute from './routes/MyUserRoutes';
import { v2 as cloudinary } from 'cloudinary';
import myRestaurantRoute from './routes/MyRestaurantRoute';
import restaurantRoute from './routes/RestaurantRoute';
import orderRoute from './routes/OrderRoute';

import { type Express } from 'express';

import express, { Request, Response } from 'express';
const app: Express = express();

if (!process.env.MONGODB_CONNECTION_STRING) {
  throw new Error('MONGODB_CONNECTION_STRING environment variable is not defined');
}

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());

app.use('/api/order/checkout/webhook', express.raw({ type: '*/*' }));

app.use(express.json());

app.get('/health', async (req: Request, res: Response) => {
  res.send({ message: 'health OK!' });
});

app.get('/', (req: Request, res: Response) => {
  res.end('Welcome to my backend server!');
});

app.use('/api/my/user', myUserRoute);
app.use('/api/my/restaurant', myRestaurantRoute);
app.use('/api/restaurant', restaurantRoute);
app.use('/api/order', orderRoute);

app.listen(7000, () => {
  console.log('server started on localhost :7000');
});
