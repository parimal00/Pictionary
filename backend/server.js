import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
// import { router } from "./router.js"
// import { logger } from "./logger.js"
import { SOCKET_EVENTS }  from "./src/socket/events.js"
import helmet from 'helmet';
import morgan from 'morgan';
import { registerRoomHandlers } from "./src/services/roomHandler.js"
import authRoutes from "./src/routes/authRoutes.ts"
import roomRoutes from "./src/routes/roomRoutes.ts"
dotenv.config()

const app = express()
const httpServer = createServer(app)

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));
app.use(authRoutes);
app.use(roomRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

io.on(SOCKET_EVENTS.CONNECT, (socket) => {
  console.log(`[Socket Connected]: ${socket.id}`);

  registerRoomHandlers(io, socket);
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    activeConnections: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Game server active on http://localhost:${PORT}`);
});