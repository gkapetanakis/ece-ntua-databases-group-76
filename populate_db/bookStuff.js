import { faker } from "@faker-js/faker";
import { getRandomElement } from "./utils.js";

const books = [];
const bookIsbns = [];

const publishers = [
    "Penguin Random House",
    "HarperCollins",
    "Hachette Book Group",
    "Simon & Schuster",
    "Macmillan Publishers",
    "Scholastic Corporation",
    "Bloomsbury Publishing",
    "Oxford University Press",
    "Cambridge University Press",
    "Wiley",
    "Elsevier",
    "Penguin Books",
    "Vintage Books",
    "Faber & Faber",
    "Little, Brown and Company",
    "Abrams Books",
    "Beacon Press",
    "University of Chicago Press",
    "Grove Atlantic",
    "Knopf Doubleday Publishing Group",
    "University of California Press",
    "MIT Press",
    "Princeton University Press",
    "Random House",
    "Candlewick Press",
    "Chronicle Books",
    "Harlequin",
    "W.W. Norton & Company",
    "Penguin Classics",
    "Bloomsbury Academic",
];

const languages = [
    "greek",
    "english",
    "french",
    "german",
    "russian",
    "japanese",
];

function generateBooks(n) {
    const genBooks = [];
    for (let i = 0; i < n; ++i) {
        const newIsbn = faker.string.numeric(13);
        if (bookIsbns.includes(newIsbn)) continue;
        bookIsbns.push(newIsbn);

        const newBook = {
            isbn: newIsbn,
            title: faker.lorem.words({ min: 1, max: 5 }),
            publisher: getRandomElement(publishers),
            page_count: Math.floor(20 + Math.random() * 500),
            summary: faker.lorem.paragraph({ min: 2, max: 4 }),
            language: getRandomElement(languages),
        };

        genBooks.push(newBook);
    }

    for (const book of genBooks) {
        books.push(book);
    }
}

export { generateBooks, books };
