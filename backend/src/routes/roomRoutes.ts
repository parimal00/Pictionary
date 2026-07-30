import { Router } from "express";
import { createRoom } from "../controllers/roomController.ts";
import { createRoomSchema } from "../validators/roomValidator.ts";
import { validate } from "../middlewares/validate.ts";

const router = Router();

router.post("/rooms/create", validate(createRoomSchema), createRoom);

export default router;