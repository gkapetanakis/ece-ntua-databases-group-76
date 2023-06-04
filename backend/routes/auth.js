import { Router } from "express";
import * as controller from "../controllers/auth.js";
import { execInsertQuery } from "../middleware/sql.js";

const router = Router();

router.get("/login", controller.getLogin);
router.get("/logout", controller.getLogout);
router.get("/register", controller.getRegister);

router.post("/login", controller.postLogin);
router.post("/register", controller.postRegister, execInsertQuery);
router.post("/change_data", controller.postChangeData);

export default router;
