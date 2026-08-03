import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
// import { router } from "./router.js"
// import { logger } from "./logger.js"
import { SOCKET_EVENTS }  from "./src/sockets/events.js"
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from "./src/routes/authRoutes.ts"
import roomRoutes from "./src/routes/roomRoutes.ts"
import { globalErrorHandler } from './src/middlewares/errorHandler.ts';
import { connectDB } from "./config/dbconnection.ts"
import { registerRoomHandlers } from "./src/sockets/roomSocket.ts"

dotenv.config()

const app = express()

connectDB()
const httpServer = createServer(app)


app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5174' }));
app.use(express.json());
app.use(morgan('dev'));
app.use(authRoutes);
app.use(roomRoutes);

const CLIENT_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5174';

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

io.on(SOCKET_EVENTS.CONNECT, (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  registerRoomHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    activeConnections: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
  });
});
app.use(globalErrorHandler);
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Game server active on http://localhost:${PORT}`);
});