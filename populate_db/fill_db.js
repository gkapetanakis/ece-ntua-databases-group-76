import fs from "fs";
import { generateInsertString } from "./utils.js";
import * as data from "./generator.js";

if (process.argv[2] === undefined) {
    console.log("Usage: node fill_db.js <output_name>");
    process.exit(0);
}

let outfile = process.argv[2];
if (!outfile.endsWith(".sql")) outfile += ".sql";

const inserts = [
    ["school", data.schools],
    ["school_email_address", data.schoolEmailAddresses],
    ["school_phone_number", data.schoolPhoneNumbers],

    ["app_user", data.appUsers],
    ["user_administrator", data.adminUsers],
    ["user_operator", data.operatorUsers],
    ["user_operator_pending_approval", data.unapprovedOperatorUsers],
    ["user_teacher", data.teacherUsers],
    ["user_teacher_pending_approval", data.unapprovedTeacherUsers],
    ["user_student", data.studentUsers],
    ["user_student_pending_approval", data.unapprovedStudentUsers],

    ["book", data.books],
    ["book_author", data.bookAuthors],
    ["book_category", data.bookCategories],
    ["book_keyword", data.bookKeywords],
    ["book_author_map", data.bookAuthorMap],
    ["book_category_map", data.bookCategoryMap],
    ["book_keyword_map", data.bookKeywordMap],
    ["book_belonging", data.bookBelongings],

    ["book_reservation", data.bookReservations],
    ["book_borrowing_active", data.bookBorrowingActives],
    ["book_borrowing_ended", data.bookBorrowingEndeds],

    ["book_review", data.bookReviews],
    ["book_review_pending_approval", data.bookReviewsPending],
];

data.generate();
data.saveTo(outfile, inserts);

if (false) {
    const fd = fs.openSync(`${outfile}`, "w");
    fs.writeSync(fd, "use slms;\n\n");
    for (const [tableName, objectArray] of inserts) {
        for (const object of objectArray)
            fs.writeSync(fd, generateInsertString(tableName, object) + "\n");
        fs.writeSync(fd, "\n");
    }
    fs.close(fd);
}
