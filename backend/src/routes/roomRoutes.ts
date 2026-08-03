import { Router } from "express";
import { createRoom, joinRoom } from "../controllers/roomController.ts";
import { createRoomSchema } from "../validators/roomValidator.ts";
import { validate } from "../middlewares/validate.ts";

const router = Router();

router.post("/rooms/create", validate(createRoomSchema), createRoom);
router.post('/rooms/join', joinRoom);

export default router;