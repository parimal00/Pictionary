import { Router } from "express";
import { roomService } from "../services/roomService";
import { createRoomSchema } from "../validators/roomValidator";
import { validate } from "../middlewares/validate";

const router = Router()

router.post('/rooms/create',validate(createRoomSchema), roomService.createRoom)