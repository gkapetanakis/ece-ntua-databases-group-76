import { Router } from "express";
import * as controller from "../controllers/user.js";
import { execFetchQuery, execInsertQuery } from "../middleware/sql.js";

const router = Router();

router.get("/create_review", controller.getCreateReview);
router.post("/create_review", controller.postCreateReview, execInsertQuery);

router.get("/reservations", controller.getReservations, execFetchQuery);
router.post(
    "/delete_reservation",
    controller.postDeleteReservation,
    execInsertQuery
);

router.post("/reserve_book", controller.postReserveBook, execInsertQuery);
router.post("/3_3_1", controller.post331, execFetchQuery);
router.post("/3_3_2", controller.post332, execFetchQuery);

export default router;
