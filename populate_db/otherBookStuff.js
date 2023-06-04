import { faker } from "@faker-js/faker";

let authorId = 1;
const bookAuthors = [];
const bookCategories = [];
const bookKeywords = [];

const categories = [
    "fiction",
    "nonfiction",
    "mystery",
    "thriller",
    "romance",
    "fantasy",
    "science fiction",
    "horror",
    "historical fiction",
    "biography",
    "autobiography",
    "travel",
    "cookbooks",
    "poetry",
    "drama",
    "comedy",
    "history",
    "science",
    "philosophy",
    "religion",
    "art",
    "music",
    "business",
    "finance",
    "technology",
    "psychology",
    "education",
    "sports",
    "children",
    "young adult",
];
const keywords = [
    "chosen one",
    "love triangle",
    "fish out of water",
    "dystopian society",
    "quest for revenge",
    "forbidden love",
    "coming of age",
    "hero's journey",
    "magical realism",
    "time travel",
    "parallel universes",
    "underdog story",
    "femme fatale",
    "rags to riches",
    "redemption arc",
    "villain protagonist",
    "hidden identity",
    "political intrigue",
    "family curse",
    "amnesia",
    "unreliable narrator",
    "artificial intelligence",
    "apocalyptic event",
    "supernatural powers",
    "haunted house",
    "epic battle",
    "lost civilization",
    "immortality",
    "space exploration",
    "betrayal",
];

function generateAuthors(n) {
    while (n-- > 0) {
        bookAuthors.push({
            id: authorId++,
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
        });
    }
}

function generateHelper(n, outPut, buffer) {
    while (n < buffer.length) buffer.pop();
    const initLen = buffer.length;

    while (n > 0) {
        const temp = faker.lorem.words({ min: 1, max: 3 });

        if (n > initLen) {
            if (buffer.includes(temp)) continue;
            buffer.push(temp);
        }

        outPut.push({ name: n <= initLen ? buffer[initLen - n] : temp });
        --n;
    }
}

function generateCategories(n) {
    generateHelper(n, bookCategories, categories);
}

function generateKeywords(n) {
    generateHelper(n, bookKeywords, keywords);
}

export {
    generateAuthors,
    generateCategories,
    generateKeywords,
    bookAuthors,
    bookCategories,
    bookKeywords,
    categories,
    keywords,
};
