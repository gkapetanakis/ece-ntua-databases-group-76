import { Router } from "express";
import * as controller from "../controllers/admin.js";
import { execFetchQuery, execInsertQuery } from "../middleware/sql.js";

const router = Router();

router.get("/create_school", controller.getCreateSchool);
router.post("/create_school", controller.postCreateSchool, execInsertQuery);

router.get(
    "/unapproved_operators",
    controller.getUnapprovedOperators,
    execFetchQuery
);
router.post("/approve_operator", controller.postApproveOperator);

router.post("/create_backup", controller.postCreateBackup);
router.post("/restore_backup", controller.postRestoreBackup);

router.post("/3_1_1", controller.post311, execFetchQuery);
router.post("/3_1_2", controller.post312, execFetchQuery);
router.post("/3_1_3", controller.post313, execFetchQuery);
router.post("/3_1_4", controller.post314, execFetchQuery);
router.post("/3_1_5", controller.post315, execFetchQuery);
router.post("/3_1_6", controller.post316, execFetchQuery);
router.post("/3_1_7", controller.post317, execFetchQuery);

export default router;
