import dotenv from 'dotenv';
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/apis';

dotenv.config({
    path: './.env'
})

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5173',
    // origin: 'https://to-do-six-omega.vercel.app',
    // credentials: true
}))
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.use(express.json()) // body parser
app.use(express.static('public'))
app.listen(process.env.PORT || 7231, () => console.log('Server started at: ', process.env.PORT))