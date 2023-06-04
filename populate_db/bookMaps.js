import { bookAuthors, categories, keywords } from "./otherBookStuff.js";
import { books } from "./bookStuff.js";
import { schools } from "./schoolAPI.js";
import { getRandomElement } from "./utils.js";

const bookAuthorMap = [];
const bookCategoryMap = [];
const bookKeywordMap = [];
const bookBelongings = [];

function mapHelper(n, attrName) {
    const schoolNames = schools.map((s) => s.name);

    const isbns = books.map((book) => book.isbn);
    const authorIds = bookAuthors.map((author) => author.id);

    const mapTypes = {
        author_id: [bookAuthorMap, authorIds],
        category_name: [bookCategoryMap, categories],
        keyword_name: [bookKeywordMap, keywords],
        school_name: [bookBelongings, schoolNames],
    };

    const [thisMap, thisAttrArray] = mapTypes[attrName];

    for (let isbn of isbns) {
        for (let attribute of attributeHelper(thisAttrArray, n)) {
            const newMapItem = {};
            newMapItem.isbn = isbn;
            newMapItem[attrName] = attribute;

            if (attrName === "school_name") {
                newMapItem.total_copies_count =
                    1 + Math.floor(Math.random() * 16);
            }

            thisMap.push(newMapItem);
        }
    }

    // n is the max number of attributes the book with `isbn` will have
    function attributeHelper(attributeArray, n) {
        n = 1 + Math.floor(Math.random() * n);

        const attributes = [];

        while (n > 0) {
            const attr = getRandomElement(attributeArray);

            if (attributes.includes(attr)) continue;

            attributes.push(attr);
            --n;
        }
        return attributes;
    }
}

function generateBAM(n) {
    mapHelper(n, "author_id");
}

function generateBCM(n) {
    mapHelper(n, "category_name");
}

function generateBKM(n) {
    mapHelper(n, "keyword_name");
}

function generateBookBelongings() {
    mapHelper(schools.length, "school_name");
}

export {
    generateBAM,
    generateBCM,
    generateBKM,
    generateBookBelongings,
    bookAuthorMap,
    bookCategoryMap,
    bookKeywordMap,
    bookBelongings,
};
