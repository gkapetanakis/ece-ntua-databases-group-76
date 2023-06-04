import { Router } from "express";
import * as controller from "../controllers/operator.js";
import { execFetchQuery, execInsertQuery } from "../middleware/sql.js";

const router = Router();

router.get("/create_book", controller.getCreateBook);
router.post("/create_book", controller.postCreateBook, execInsertQuery);

router.post("/reservations", controller.getReservations, execFetchQuery);

router.post(
    "/approve_reservation",
    controller.postApproveReservation,
    execInsertQuery
);
router.post(
    "/reject_reservation",
    controller.postRejectReservation,
    execInsertQuery
);

router.post("/due_borrowings", controller.getDueBorrowings, execFetchQuery);

router.post(
    "/due_borrowing_return",
    controller.postDueBorrowingReturn,
    execInsertQuery
);

router.get(
    "/unapproved_teachers",
    controller.getUnapprovedTeachers,
    execFetchQuery
);
router.get(
    "/unapproved_students",
    controller.getUnapprovedStudents,
    execFetchQuery
);
router.post("/approve_teacher", controller.postApproveTeacher);
router.post("/approve_student", controller.postApproveStudent);

router.get("/school_members", controller.getSchoolMembers, execFetchQuery);
router.post(
    "/deactivate_member",
    controller.postDeactivateMember,
    execInsertQuery
);
router.post("/delete_member", controller.postDeleteMember, execInsertQuery);

router.post("/3_2_1", controller.post321, execFetchQuery);
router.post("/3_2_2", controller.post322, execFetchQuery);
router.post(
    "/overdue_borrowing_return",
    controller.postOverdueBorrowingReturn,
    execInsertQuery
);
router.post("/3_2_3", controller.post323, execFetchQuery);

router.get("/pending_reviews", controller.getPendingReviews, execFetchQuery);
router.post(
    "/pending_review_approve",
    controller.postPendingReviewApprove,
    execInsertQuery
);
router.post(
    "/pending_review_reject",
    controller.postPendingReviewReject,
    execInsertQuery
);

export default router;
