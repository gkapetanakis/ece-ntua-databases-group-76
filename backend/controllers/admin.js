import { existsSync, mkdirSync } from "fs";
import { exec } from "child_process";
import { pool, codes } from "../app.js";

export function getCreateSchool(_req, res) {
    return res.status(codes.OK).render("create_school");
}

export async function postCreateSchool(req, res, next) {
    const name = req.body.name;
    const streetName = req.body.streetName;
    const streetNumber = req.body.streetNumber;
    const postalCode = req.body.postalCode;
    const city = req.body.city;
    const principalFirstName = req.body.principalFirstName;
    const principalLastName = req.body.principalLastName;

    res.locals.queryOptions =
        "INSERT INTO school \
         (name, street_name, street_number, postal_code, city, principal_first_name, principal_last_name) \
         VALUES (?, ?, ?, ?, ?, ?, ?)";
    res.locals.queryValues = [
        name,
        streetName,
        streetNumber,
        postalCode,
        city,
        principalFirstName,
        principalLastName,
    ];

    res.locals.successMessage = "School created successfully";
    res.locals.failureMessage = "School could not created";
    res.locals.backUrl = "/admin/create_school";

    return next();
}

export function getUnapprovedOperators(_req, res, next) {
    res.locals.queryOptions =
        "SELECT username, first_name, last_name, operating_school_name FROM user_operator_pending_approval";
    res.locals.cols = [
        "Username",
        "First Name",
        "Last Name",
        "Operating School Name",
    ];

    res.locals.lastColBtns = 1;
    res.locals.lastColBtnText = ["Approve"];
    res.locals.lastColBtnAction = ["/admin/approve_operator"];
    res.locals.lastColFieldName = [["username"]];

    return next();
}

export async function postApproveOperator(req, res, next) {
    try {
        const conn = await pool.getConnection();
        await conn.beginTransaction();
        const result = (
            await conn.execute(
                "SELECT username, password, first_name, last_name, operating_school_name \
                 FROM user_operator_pending_approval \
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
            "INSERT INTO user_operator (username, operating_school_name) \
             VALUES (?, ?);",
            [result[0], result[4]]
        );
        await conn.commit();
        await conn.release();

        res.locals.successMessage = "Operator approved successfully";
        res.locals.backUrl = "/admin/unapproved_operators";

        return res.status(codes.OK).render("success");
    } catch (err) {
        return next(err);
    }
}

export function postCreateBackup(req, res, next) {
    const backupName = req.body.backupName;
    const backupsFolder = "../database/backups";

    if (!existsSync(backupsFolder)) mkdirSync(backupsFolder);

    exec(
        `mariadb-dump \
            --user=${process.env.DB_USER} \
            --password=${process.env.DB_PASS} \
            ${process.env.DB_NAME || "slms"} \
        > ${backupsFolder + "/" + backupName}`,
        (err) => {
            if (err) {
                res.locals.failureMessage = "Database backup failed";
                return next(err);
            } else {
                res.locals.successMessage =
                    "Database backup created successfully";
                res.locals.backUrl = "/";
                return res.status(codes.CREATED).render("success");
            }
        }
    );
}

export function postRestoreBackup(req, res, next) {
    const backupName = req.body.backupName;

    const backupsFolder = "../database/backups";
    exec(
        `mariadb-dump \
            --user=${process.env.DB_USER} \
            --password=${process.env.DB_PASS} \
            ${process.env.DB_NAME || "slms"} \
        < ${backupsFolder + "/" + backupName}`,
        (err) => {
            if (err) {
                res.locals.failureMessage = "Backup restore failed";
                return next(err);
            } else {
                res.locals.successMessage = "Backup restore successful";
                res.locals.backUrl = "/";
                return res.status(codes.CREATED).render("success");
            }
        }
    );
}

export function post311(req, res, next) {
    /* View all borrowings per school */
    const startDate = req.body.startDate || "1970-01-01";
    const endDate = req.body.endDate || new Date().toISOString().slice(0, 10);

    res.locals.queryOptions = "CALL lendings_per_school(?, ?);";
    res.locals.queryValues = [startDate, endDate];
    res.locals.cols = ["School Names", "Total Borrowings"];

    return next();
}

export function post312(req, res, next) {
    /* View all authors of a category and all teachers who borrowed a book of this category the past year */
    const category = req.body.category;

    res.locals.queryOptions = "CALL author_teacher_by_category(?);";
    res.locals.queryValues = [category];
    res.locals.cols = [
        "ID or Username",
        "First Name",
        "Last Name",
        "Occupation",
    ];

    return next();
}

export function post313(_req, res, next) {
    /* View all teachers less than 40 years old who have borrowed the most books, and the number of books they have borrowed */

    res.locals.queryOptions = "CALL find_young_teachers(40);";
    res.locals.cols = [
        "Username",
        "First Name",
        "Last Name",
        "Total Borrowings",
    ];

    return next();
}

export function post314(_req, res, next) {
    /* View all authors whose books have never been borrowed */

    res.locals.queryOptions = "CALL find_unpopular_authors();";
    res.locals.cols = ["ID", "First Name", "Last Name"];

    return next();
}

export function post315(_req, res, next) {
    /* View all operators with more than 20 approvals that have approved the same number of borrowings in the past year */
    const year = new Date().getFullYear();

    res.locals.queryOptions = "CALL find_high_value_operators(?);";
    res.locals.queryValues = [year];
    res.locals.cols = ["Username", "Total Approvals"];

    return next();
}

export function post316(_req, res, next) {
    /* View the top 3 most common genre pairs in borrowings */

    res.locals.queryOptions = "CALL find_most_popular_category_pairs(3);";
    res.locals.cols = ["Category 1", "Category 2", "Borrowings Count"];

    return next();
}

export function post317(_req, res, next) {
    /* View all authors who have written at least 5 books less than the author with the most books written */

    res.locals.queryOptions = "CALL authors_with_some_books_less_than_top(5);";
    res.locals.cols = ["ID", "First Name", "Last Name", "Books Written"];

    return next();
}
