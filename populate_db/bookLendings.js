import { getRandomPastDate, getRandomFutureDate } from "./utils.js";
import {
    operatorUsers,
    schoolUsers,
    studentUsers,
    teacherUsers,
} from "./userAPI.js";
import { bookBelongings } from "./bookMaps.js";
import { getRandomElement } from "./utils.js";

const bookReservations = [];
const bookBorrowingActives = [];
const bookBorrowingEndeds = [];

let initializedAvailableBooks = false;
let initializedBorrowingCapacity = false;
const availableBooks = {};
const availableBorrowings = {};

function initializeAvailableBooks() {
    for (const belonging of bookBelongings) {
        const schoolName = belonging.school_name;
        const isbn = belonging.isbn;
        const totalCopies = belonging.total_copies_count;

        if (!availableBooks[schoolName]) availableBooks[schoolName] = {};

        availableBooks[schoolName][isbn] = totalCopies;
    }
    initializedAvailableBooks = true;
}

function initializeBorrowingCapacity() {
    for (let student of studentUsers) {
        const username = student.username;
        availableBorrowings[username] = 2;
    }
    for (let teacher of teacherUsers) {
        const username = teacher.username;
        availableBorrowings[username] = 1;
    }
    initializedBorrowingCapacity = true;
}

function lendHelper(n, attrName) {
    const lendTypes = {
        reservation: bookReservations,
        "b-active": bookBorrowingActives,
        "b-ended": bookBorrowingEndeds,
    };

    const thisMap = lendTypes[attrName];

    const buffer = [];
    let maxIter = 2 * n;
    while (n > 0 && maxIter-- > 0) {
        const user = getRandomElement(schoolUsers);

        const bbs = bookBelongings
            .filter((bb) => bb.school_name === user.belonging_school_name)
            .map((bb) => bb.isbn);

        const isbn = getRandomElement(bbs);

        let checkValue = `${isbn}_${user.username}`;

        let borrowingDate;
        let operatorUsr;
        if (attrName !== "reservation") {
            borrowingDate = getRandomPastDate(80);

            operatorUsr = operatorUsers.filter(
                (person) =>
                    person.operating_school_name === user.belonging_school_name
            );
            if (operatorUsr.length < 1) continue;
            operatorUsr = operatorUsr[0].username;
        }
        if (attrName === "b-ended") {
            checkValue += `_${borrowingDate}`;
        }

        if (buffer.includes(checkValue)) {
            continue;
        }

        let newItem;
        switch (attrName) {
            case "reservation":
                if (availableBorrowings[user.username]-- <= 0) {
                    continue;
                }
                newItem = {
                    isbn,
                    username: user.username,
                    school_name: user.belonging_school_name,
                    expiry_date: getRandomPastDate(20),
                };
                break;
            case "b-active":
                if (availableBorrowings[user.username]-- <= 0) {
                    continue;
                }
                if (availableBooks[user.belonging_school_name][isbn]-- <= 0) {
                    continue;
                }
                newItem = {
                    isbn,
                    username: user.username,
                    operator_approver: operatorUsr,
                    school_name: user.belonging_school_name,
                    borrowing_date: borrowingDate,
                    due_date: getRandomFutureDate(20),
                };
                break;
            case "b-ended":
                newItem = {
                    isbn,
                    username: user.username,
                    operator_approver: operatorUsr,
                    school_name: user.belonging_school_name,
                    borrowing_date: borrowingDate,
                };
                break;
            default:
        }
        buffer.push(checkValue);
        thisMap.push(newItem);
        --n;
    }
}

function generateBookReservations(n) {
    if (!initializedBorrowingCapacity) initializeBorrowingCapacity();
    lendHelper(n, "reservation");
}

function generateBookBorrowingsActive(n) {
    if (!initializedAvailableBooks) initializeAvailableBooks();
    lendHelper(n, "b-active");
}

function generateBookBorrowingsEnded(n) {
    lendHelper(n, "b-ended");
}

export {
    bookReservations,
    bookBorrowingActives,
    bookBorrowingEndeds,
    generateBookReservations,
    generateBookBorrowingsActive,
    generateBookBorrowingsEnded,
};
