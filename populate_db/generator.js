import fs from "fs";
import {
    generateSchools,
    generateEmailAddresses,
    generatePhoneNumbers,
    schools,
    schoolEmailAddresses,
    schoolPhoneNumbers,
} from "./schoolAPI.js";
import {
    generateAdministrators,
    generateOperators,
    generateTeachers,
    generateStudents,
    appUsers,
    adminUsers,
    operatorUsers,
    teacherUsers,
    studentUsers,
    schoolUsers,
    unapprovedOperatorUsers,
    unapprovedTeacherUsers,
    unapprovedStudentUsers,
} from "./userAPI.js";
import { generateBooks, books } from "./bookStuff.js";
import {
    generateAuthors,
    generateCategories,
    generateKeywords,
    bookAuthors,
    bookCategories,
    bookKeywords,
} from "./otherBookStuff.js";
import {
    generateBAM,
    generateBCM,
    generateBKM,
    generateBookBelongings,
    bookAuthorMap,
    bookCategoryMap,
    bookKeywordMap,
    bookBelongings,
} from "./bookMaps.js";
import {
    bookReservations,
    bookBorrowingActives,
    bookBorrowingEndeds,
    generateBookReservations,
    generateBookBorrowingsActive,
    generateBookBorrowingsEnded,
} from "./bookLendings.js";
import {
    generateBookReviews,
    generateBookReviewsPending,
    bookReviews,
    bookReviewsPending,
} from "./bookReview.js";

export function generate() {
    generateSchools();
    generateEmailAddresses(schools.length * 2);
    generatePhoneNumbers(schools.length * 2);

    generateAdministrators(8);
    generateOperators(
        Math.floor(schools.length * 0.3),
        schools.map((s) => s.name)
    );
    generateTeachers(
        20,
        28,
        66,
        6,
        schools.map((s) => s.name)
    );
    generateStudents(
        50,
        7,
        18,
        12,
        schools.map((s) => s.name)
    );

    generateBooks(120);
    generateAuthors(80);
    generateCategories(30);
    generateKeywords(30);
    generateBAM(3); // author maps
    generateBCM(4); // category maps
    generateBKM(4); // keyword maps
    generateBookBelongings();

    generateBookReservations(50);
    generateBookBorrowingsActive(60);
    generateBookBorrowingsEnded(30);

    generateBookReviews(30);
    generateBookReviewsPending(15);
}

export function saveTo(outfile, inserts) {
    const fd = fs.openSync(`${outfile}`, "w");
    fs.writeSync(fd, "use slms;\n\n");

    // ["user", [{ username: "", password: "", ... }]]
    for (let i = 0; i < inserts.length; ++i) {
        let [tableName, tableRows] = inserts[i];

        let insertString = `insert into ${tableName} (`;

        const fieldNames = Object.keys(tableRows[0]);
        for (let j = 0; j < fieldNames.length; ++j) {
            const fieldName = fieldNames[j];

            insertString +=
                fieldName +
                (j + 1 !== fieldNames.length ? ", " : ")\nvalues\n");
        }

        for (let j = 0; j < tableRows.length; ++j) {
            const tableRow = tableRows[j];

            insertString += "    (";
            const fieldValues = Object.values(tableRow);
            for (let k = 0; k < fieldValues.length; ++k) {
                let fieldValue = fieldValues[k];

                if (typeof fieldValue === "string") {
                    fieldValue = fieldValue.replaceAll("'", "\\'");
                    fieldValue = fieldValue.replaceAll('"', '\\"');
                }

                if (typeof fieldValue !== "boolean") {
                    fieldValue = `'${fieldValue}'`;
                }

                insertString +=
                    fieldValue +
                    (k + 1 !== fieldValues.length
                        ? ", "
                        : j + 1 !== tableRows.length
                        ? "),\n"
                        : ");\n\n");
            }
        }

        fs.writeSync(fd, insertString);
    }
    fs.close(fd);
}

export {
    schools,
    schoolEmailAddresses,
    schoolPhoneNumbers,
    appUsers,
    adminUsers,
    operatorUsers,
    teacherUsers,
    studentUsers,
    unapprovedOperatorUsers,
    unapprovedTeacherUsers,
    unapprovedStudentUsers,
    books,
    bookAuthors,
    bookCategories,
    bookKeywords,
    bookAuthorMap,
    bookCategoryMap,
    bookKeywordMap,
    bookBelongings,
    bookReservations,
    bookBorrowingActives,
    bookBorrowingEndeds,
    bookReviews,
    bookReviewsPending,
};
