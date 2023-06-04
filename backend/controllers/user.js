import { pool, codes } from "../app.js";

export async function getCreateReview(_req, res, next) {
    try {
        const result = await pool.query(
            "SELECT isbn, title FROM book ORDER BY title ASC"
        ); // [["isbn1", "title1"], ["isbn2", "title2"], ...]
        res.locals.books = result.map(([isbn, title]) => `${title} | ${isbn}`); // ["title1 | isbn1", ...cd ba]
        res.locals.scale = [
            "strongly recommend",
            "recommend",
            "neutral",
            "do not recommend",
            "strongly do not recommend",
        ];

        return res.status(codes.OK).render("create_review");
    } catch (err) {
        return next(err);
    }
}

export function postCreateReview(req, res, next) {
    const username = res.locals.username;
    const isbn = req.body.titleIsbn.split(" | ")[1];
    const reviewText = req.body.reviewText;
    const rating = req.body.rating;

    const pendingApproval =
        res.locals.role === "student" ? "_pending_approval" : "";
    res.locals.queryOptions = `INSERT INTO book_review${pendingApproval} (isbn, username, text, likert_rating) \
                               VALUE (?, ?, ?, ?)`;
    res.locals.queryValues = [isbn, username, reviewText, rating];
    res.locals.successMessage = "Review submitted successfully.";
    if (res.locals.role === "student")
        res.locals.successMessage +=
            " An operator will have to approve your review before it becomes public.";
    res.locals.failureMessage = "Review submission failed";

    return next();
}

export function getReservations(_req, res, next) {
    const username = res.locals.username;

    res.locals.queryOptions = "CALL school_member_reservations_showcase(?);";
    res.locals.queryValues = [username];
    res.locals.cols = [
        "ISBN",
        "Title",
        "Publisher",
        "Page Count",
        "Summary",
        "Cover",
        "Language",
        "Expiry Date",
    ];
    res.locals.lastColBtns = 1;
    res.locals.lastColBtnText = ["Delete"];
    res.locals.lastColFieldName = [["isbn"]];
    res.locals.lastColBtnAction = ["/delete_reservation"];

    return next();
}

export function postDeleteReservation(req, res, next) {
    const username = res.locals.username;
    const isbn = req.body.isbn;

    res.locals.queryOptions =
        "DELETE FROM book_reservation WHERE username = ? AND isbn = ?";
    res.locals.queryValues = [username, isbn];
    res.locals.successMessage = "Reservation deleted successfully";
    res.locals.failureMessage = "Could not delete reservation";
    res.locals.backUrl = "/reservations";

    return next();
}

export function postReserveBook(req, res, next) {
    const username = res.locals.username;
    const isbn = req.body.isbn;

    res.locals.queryOptions =
        "INSERT INTO book_reservation (isbn, username) \
         VALUES (?, ?);";
    res.locals.queryValues = [isbn, username];
    res.locals.successMessage =
        "Reservation created successful.\n\
         When an operator approves it you will be able to borrow the book.";
    res.locals.failureMessage = "Reservation failed";

    return next();
}

export async function post331(req, res, next) {
    /* Browse all books available to the user */
    const username = res.locals.username;

    const title = req.body?.title || null;
    const author = req.body?.author || null;
    const category = req.body?.category || null;

    res.locals.queryOptions = "CALL school_member_present_books(?, ?, ?, ?);";
    res.locals.queryValues = [username, title, category, author];
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

    res.locals.lastColBtns = 1;
    res.locals.lastColBtnText = ["Reserve"];
    res.locals.lastColFieldName = [["isbn"]];
    res.locals.lastColBtnAction = ["/reserve_book"];

    return next();
}

export function post332(req, res, next) {
    /* View user's borrowing history */
    const username = res.locals.username;

    res.locals.queryOptions = "CALL school_member_borrowings_showcase(?);";
    res.locals.queryValues = [username];
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
        "Borrowing Date",
    ];

    return next();
}
