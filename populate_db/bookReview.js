import { faker } from "@faker-js/faker";
import { books } from "./bookStuff.js";
import { schoolUsers } from "./userAPI.js";
import { getRandomElement } from "./utils.js";

const bookReviews = [];
const bookReviewsPending = [];

function reviewHelper(n) {
    const isbns = books.map((book) => book.isbn);
    const usernames = schoolUsers.map((usr) => usr.username);

    const returnArray = [];
    const buffer = [];
    while (n > 0) {
        const isbn = getRandomElement(isbns);
        const username = getRandomElement(usernames);

        const checkValue = `${isbn}_${username}`;
        if (buffer.includes(checkValue)) {
            continue;
        }

        buffer.push(checkValue);
        const newReview = {
            isbn,
            username,
            text: faker.lorem.paragraph(),
            likert_rating: Math.ceil(Math.random() * 5),
        };
        returnArray.push(newReview);
        --n;
    }

    return returnArray;
}

function generateBookReviews(n) {
    for (let r of reviewHelper(n)) {
        bookReviews.push(r);
    }
}

function generateBookReviewsPending(n) {
    for (let r of reviewHelper(n)) {
        bookReviewsPending.push(r);
    }
}

export {
    generateBookReviews,
    generateBookReviewsPending,
    bookReviews,
    bookReviewsPending,
};
