import { pool, codes } from "../app.js";

export function getCreateBook(_req, res) {
    return res.status(codes.OK).render("create_book");
}

export async function postCreateBook(req, res, next) {
    const isbn = req.body.isbn;
    const title = req.body.title;
    const publisher = req.body.publisher;
    const pageCount = req.body.pageCount;
    const summary = req.body.summary;
    const cover = req.body?.cover || null;
    const language = req.body.language;
    const totalCopies = req.body?.totalCopies || null;
    const firstName = req.body.authorFirstName;
    const lastName = req.body.authorLastName;
    const category = req.body.category;
    const keyword = req.body.keyword;

    res.locals.queryOptions =
        "call create_book(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    res.locals.queryValues = [
        isbn,
        title,
        publisher,
        pageCount,
        summary,
        cover,
        language,
        firstName,
        lastName,
        category,
        keyword,
        totalCopies && totalCopies > 0 ? res.locals.username : null,
        totalCopies,
    ];
    res.locals.successMessage = "Book inserted into the database successfully";
    res.locals.backUrl = "/operator/create_book";

    return next();
}

export async function getReservations(req, res, next) {
    const opUsername = res.locals.username;
    const username = req.body?.username || null;

    const schoolName = (
        await pool.query(
            "SELECT operating_school_name \
             FROM user_operator \
             WHERE username = ?",
            [opUsername]
        )
    )[0][0];

    res.locals.queryOptions =
        "SELECT isbn, username, expiry_date FROM book_reservation WHERE school_name = ?";
    res.locals.queryValues = [schoolName];
    if (username) {
        res.locals.queryOptions += " AND username = ?";
        res.locals.queryValues.push(username);
    }
    res.locals.cols = ["ISBN", "Username", "Expiry Date"];

    res.locals.lastColBtns = 2;
    res.locals.nFields = [2, 2];
    res.locals.lastColBtnText = ["Approve", "Reject"];
    res.locals.lastColFieldName = [
        ["isbn", "username"],
        ["isbn", "username"],
    ];
    res.locals.lastColBtnAction = [
        "/operator/approve_reservation",
        "/operator/reject_reservation",
    ];

    return next();
}

export async function postApproveReservation(req, res, next) {
    const opUsername = res.locals.username;
    const isbn = req.body.isbn;
    const username = req.body.username;

    try {
        const schoolName = (
            await pool.query(
                "SELECT operating_school_name \
             FROM user_operator \
             WHERE username = ?",
                [opUsername]
            )
        )[0][0];

        res.locals.queryOptions =
            "INSERT INTO book_borrowing_active (isbn, username, operator_approver, school_name) \
             VALUES (?, ?, ?, ?)";
        res.locals.queryValues = [isbn, username, opUsername, schoolName];
        res.locals.successMessage = "Borrowing approved successfully";
        res.locals.failureMessage = "Borrowing could not be approved";

        return next();
    } catch (err) {
        return next(err);
    }
}

export async function postRejectReservation(req, res, next) {
    const isbn = req.body.isbn;
    const username = req.body.username;

    try {
        res.locals.queryOptions =
            "DELETE FROM book_reservation \
             WHERE isbn = ? AND username = ?";
        res.locals.queryValues = [isbn, username];
        res.locals.successMessage = "Reservation rejected successfully";
        res.locals.failureMessage = "Reservation could not be rejected";

        return next();
    } catch (err) {
        return next(err);
    }
}

export async function getDueBorrowings(req, res, next) {
    const opUsername = res.locals.username;
    const username = req.body?.username || null;

    const schoolName = (
        await pool.query(
            "SELECT operating_school_name FROM user_operator WHERE username = ?",
            [opUsername]
        )
    )[0][0];

    res.locals.queryOptions =
        "SELECT isbn, username, borrowing_date, due_date \
         FROM book_borrowing_active \
         WHERE school_name = ? AND due_date >= CURRENT_DATE()";
    res.locals.queryValues = [schoolName];
    if (username) {
        res.locals.queryOptions += " AND username = ?";
        res.locals.queryValues.push(username);
    }
    res.locals.cols = ["ISBN", "Username", "Borrowing Date", "Due Date"];

    res.locals.lastColBtns = 1;
    res.locals.nFields = [2];
    res.locals.lastColBtnText = ["Mark as returned"];
    res.locals.lastColBtnAction = ["/operator/due_borrowing_return"];
    res.locals.lastColFieldName = [["isbn", "username"]];

    return next();
}

export async function postDueBorrowingReturn(req, res, next) {
    const operatorUsr = res.locals.username;
    const isbn = req.body.isbn;
    const username = req.body.username;

    try {
        const [borrowingDate, schoolName] = (
            await pool.query(
                "SELECT borrowing_date, school_name \
                 FROM book_borrowing_active \
                 WHERE isbn = ? AND username = ?",
                [isbn, username]
            )
        )[0];

        res.locals.queryOptions =
            "INSERT INTO book_borrowing_ended (isbn, username, operator_approver, school_name, borrowing_date) \
             VALUES (?, ?, ?, ?, ?)";
        res.locals.queryValues = [
            isbn,
            username,
            operatorUsr,
            schoolName,
            borrowingDate,
        ];
        res.locals.successMessage = "Borrowed book returned successfully";
        res.locals.failureMessage = "Borrowed book could not be returned";

        return next();
    } catch (err) {
        return next(err);
    }
}

export async function getUnapprovedTeachers(_req, res, next) {
    try {
        const schoolName = (
            await pool.query(
                "SELECT operating_school_name FROM user_operator WHERE username = ?",
                [res.locals.username]
            )
        )[0][0];

        res.locals.queryOptions =
            "SELECT username, first_name, last_name FROM user_teacher_pending_approval WHERE belonging_school_name = ?";
        res.locals.queryValues = [schoolName];
        res.locals.cols = ["Username", "First Name", "Last Name"];

        res.locals.lastColBtns = 1;
        res.locals.lastColBtnText = ["Approve"];
        res.locals.lastColBtnAction = ["/operator/approve_teacher"];
        res.locals.lastColFieldName = [["username"]];

        return next();
    } catch (err) {
        return next(err);
    }
}

export async function getUnapprovedStudents(_req, res, next) {
    try {
        const schoolName = (
            await pool.query(
                "SELECT operating_school_name FROM user_operator WHERE username = ?",
                [res.locals.username]
            )
        )[0][0];

        res.locals.queryOptions =
            "SELECT username, first_name, last_name FROM user_student_pending_approval WHERE belonging_school_name = ?";
        res.locals.queryValues = [schoolName];
        res.locals.cols = ["Username", "First Name", "Last Name"];

        res.locals.lastColBtns = 1;
        res.locals.lastColBtnText = ["Approve"];
        res.locals.lastColBtnAction = ["/operator/approve_student"];
        res.locals.lastColFieldName = [["username"]];

        return next();
    } catch (err) {
        return next(err);
    }
}

export async function postApproveTeacher(req, res, next) {
    try {
        const conn = await pool.getConnection();
        await conn.beginTransaction();
        const result = (
            await conn.execute(
                "SELECT username, password, first_name, last_name, date_of_birth, belonging_school_name \
                 FROM user_teacher_pending_approval \
                 WHERE username = ?;",
                [req.body.username]
            )
        )[0];
        await conn.execute(
            "INSERT INTO app_user (username, password, first_name, last_name) \
             VALUES (?, ?, ?, ?);",
            result.slice(0, 4)
        );
        await conn.execute(
            "INSERT INTO user_teacher (username, date_of_birth, belonging_school_name) \
             VALUES (?, ?, ?);",
            [result[0], result[4], result[5]]
        );
        await conn.commit();
        await conn.release();

        res.locals.successMessage = "Teacher approved successfully";
        res.locals.backUrl = "/operator/unapproved_teachers";

        return res.status(codes.OK).render("success");
    } catch (err) {
        return next(err);
    }
}

export async function postApproveStudent(req, res, next) {
    try {
        const conn = await pool.getConnection();
        await conn.beginTransaction();
        const result = (
            await conn.execute(
                "SELECT username, password, first_name, last_name, date_of_birth, belonging_school_name \
                 FROM user_student_pending_approval \
                 WHERE username = ?;",
                [req.body.username]
            )
        )[0];
        await conn.execute(
            "INSERT INTO app_user (username, password, first_name, last_name) \
             VALUES (?, ?, ?, ?);",
            result.slice(0, 4)
        );
        await conn.execute(
            "INSERT INTO user_student (username, date_of_birth, belonging_school_name) \
             VALUES (?, ?, ?);",
            [result[0], result[4], result[5]]
        );
        await conn.commit();
        await conn.release();

        res.locals.successMessage = "Student approved successfully";
        res.locals.backUrl = "/operator/unapproved_students";

        return res.status(codes.OK).render("success");
    } catch (err) {
        return next(err);
    }
}

export function getSchoolMembers(req, res, next) {
    const opUsername = res.locals.username;

    res.locals.queryOptions = "CALL school_member_list(?)";
    res.locals.queryValues = [opUsername];
    res.locals.cols = ["Username", "Occupation", "First Name", "Last Name"];

    res.locals.lastColBtns = 2; // 2 buttons (with 1 field each by default)
    res.locals.nFields = [2, 2]; // 2 fields needed at each button
    res.locals.lastColBtnText = ["Deactivate", "Delete"]; // button labels
    res.locals.lastColFieldName = [
        ["username", "role"],
        ["username", "role"],
    ]; // form field names
    res.locals.lastColBtnAction = [
        "/operator/deactivate_member",
        "/operator/delete_member",
    ]; // form actions

    return next();
}

export async function postDeleteMember(req, res, next) {
    const username = req.body.username;

    try {
        res.locals.queryOptions = "DELETE FROM app_user WHERE username = ?";
        res.locals.queryValues = [username];
        res.locals.successMessage = "User account deleted successfully";
        res.locals.failureMessage = "User account could not be deleted";
        res.locals.backUrl = "/operator/school_members";

        return next();
    } catch (err) {
        return next(err);
    }
}

export async function postDeactivateMember(req, res, next) {
    const username = req.body.username;
    const role = req.body.role;

    try {
        res.locals.queryOptions = `UPDATE user_${role} SET deactivated = TRUE WHERE username = ?`;
        res.locals.queryValues = [username];
        res.locals.successMessage = "User account deactivated successfully";
        res.locals.failureMessage = "User account could not be deactivated";
        res.locals.backUrl = "/operator/school_members";

        return next();
    } catch (err) {
        return next(err);
    }
}

export async function postOverdueBorrowingReturn(req, res, next) {
    const operatorUsr = res.locals.username;
    const isbn = req.body.isbn;
    const username = req.body.username;

    try {
        const [borrowingDate, schoolName] = (
            await pool.query(
                "SELECT borrowing_date, school_name \
                 FROM book_borrowing_active \
                 WHERE isbn = ? AND username = ?",
                [isbn, username]
            )
        )[0];

        res.locals.queryOptions =
            "INSERT INTO book_borrowing_ended (isbn, username, operator_approver, school_name, borrowing_date) \
             VALUES (?, ?, ?, ?, ?)";
        res.locals.queryValues = [
            isbn,
            username,
            operatorUsr,
            schoolName,
            borrowingDate,
        ];
        res.locals.successMessage = "Borrowed book returned successfully";
        res.locals.failureMessage = "Borrowed book could not be returned";

        return next();
    } catch (err) {
        return next(err);
    }
}

export async function getPendingReviews(_req, res, next) {
    const opUsername = res.locals.username;

    res.locals.queryOptions = "CALL get_school_pending_reviews(?);";
    res.locals.queryValues = [opUsername];
    res.locals.cols = ["ISBN", "Username", "Text", "Rating"];

    res.locals.lastColBtns = 2;
    res.locals.nFields = [2, 2];
    res.locals.lastColBtnText = ["Approve", "Reject"];
    res.locals.lastColBtnAction = [
        "/operator/pending_review_approve",
        "/operator/pending_review_reject",
    ];
    res.locals.lastColFieldName = [
        ["isbn", "username"],
        ["isbn", "username"],
    ];

    return next();
}

export async function postPendingReviewApprove(req, res, next) {
    const isbn = req.body.isbn;
    const username = req.body.username;

    try {
        const [reviewText, likertRating] = (
            await pool.query(
                "SELECT text, likert_rating FROM book_review_pending_approval WHERE isbn = ? AND username = ?",
                [isbn, username]
            )
        )[0];

        res.locals.queryOptions =
            "INSERT INTO book_review (isbn, username, text, likert_rating) \
             VALUES (?, ?, ?, ?)";
        res.locals.queryValues = [isbn, username, reviewText, likertRating];
        res.locals.successMessage = "Review approved";
        res.locals.failureMessage = "Review could not be approved";
        res.locals.backUrl = "/operator/pending_reviews";

        return next();
    } catch (err) {
        return next(err);
    }
}

export function postPendingReviewReject(req, res, next) {
    const isbn = req.body.isbn;
    const username = req.body.username;

    res.locals.queryOptions =
        "DELETE FROM book_review_pending_approval WHERE isbn = ? AND username = ?";
    res.locals.queryValues = [isbn, username];
    res.locals.successMessage = "Review rejected";
    res.locals.failureMessage = "Review could not be rejected";
    res.locals.backUrl = "/operator/pending_reviews";

    return next();
}

export function post321(req, res, next) {
    /* Browse all books available to the operator */
    const title = req.body?.title || null;
    const author = req.body?.author || null;
    const category = req.body?.category || null;
    const copies = req.body?.copies || null;

    res.locals.queryOptions = "CALL operator_present_books(?, ?, ?, ?, ?)";
    res.locals.queryValues = [
        res.locals.username,
        title,
        category,
        author,
        copies,
    ];
    res.locals.cols = [
        "ISBN",
        "Title",
        "Publisher",
        "Page Count",
        "Summary",
        "Cover",
        "Language",
        "Authors",
        "Categories",
        "Available Copies Count",
    ];

    return next();
}

export function post322(req, res, next) {
    /* View all overdue borrowers */
    const username = res.locals.username;

    const firstName = req.body?.firstName || null;
    const lastName = req.body?.lastName || null;
    const daysOverdue = req.body?.daysOverdue || null;

    res.locals.queryOptions = "CALL find_overdue_borrowers(?, ?, ?, ?)";
    res.locals.queryValues = [username, firstName, lastName, daysOverdue];
    res.locals.cols = [
        "ISBN",
        "Username",
        "First Name",
        "Last Name",
        "Days Overdue",
    ];

    res.locals.lastColBtns = 1;
    res.locals.nFields = [2];
    res.locals.lastColBtnText = ["Mark as returned"];
    res.locals.lastColBtnAction = ["/operator/overdue_borrowing_return"];
    res.locals.lastColFieldName = [["isbn", "username"]];

    return next();
}

export function post323(req, res, next) {
    /* View the average review score per user and per category */
    const username = req.body?.username || null;
    const category = req.body?.category || null;

    res.locals.queryOptions = "CALL find_avg_review_score(?, ?)";
    res.locals.queryValues = [username, category];
    res.locals.cols = [
        "Username",
        "First Name",
        "Last Name",
        "Category Name",
        "Average Rating",
    ];

    return next();
}
