import { faker } from "@faker-js/faker";
import { getRandomElement } from "./utils.js";

const schoolNames = [
    "National Technical University of Athens",
    "Athens University of Economics and Business",
    "University of Piraeus",
    "University of West Attica",
    "National and Kapodistrian University of Athens",
    "Aristotle University of Thessaloniki",
    "University Of Patras",
    "University of Crete",
];
const schoolEmails = [];
const schoolPhones = [];

// ----- API ----- //

function generateSchools(n = 8) {
    while (n < schoolNames.length) schoolNames.pop();
    const initLen = schoolNames.length;
    const genSchools = [];

    let maxLoops = 1.5 * n;
    while (n > 0 && maxLoops--) {
        const newSchoolName = faker.lorem.words({ min: 4, max: 8 });
        if (n > initLen) {
            if (schoolNames.includes(newSchoolName)) continue;
            schoolNames.push(newSchoolName);
        }

        genSchools.push({
            name: n <= initLen ? schoolNames[initLen - n] : newSchoolName,
            street_name: faker.location.street(),
            street_number: faker.location.buildingNumber(),
            postal_code: generateZipCode(),
            city: faker.location.city(),
            principal_first_name: faker.person.firstName(),
            principal_last_name: faker.person.lastName(),
        });
        --n;
    }

    for (const school of genSchools) {
        schools.push(school);
    }

    function generateZipCode() {
        let zC = faker.location.zipCode("#####");
        while (zC.startsWith("0")) {
            zC = faker.location.zipCode("#####");
        }
        return zC;
    }
}

function generateEmailAddresses(n) {
    if (schoolNames.length < 1)
        throw new Error("Create at least one school first");

    const genEmails = [];

    let maxLoops = 1.5 * n;
    while (n > 0 && maxLoops--) {
        const newAddress = faker.internet.email();
        if (schoolEmails.includes(newAddress)) continue;
        schoolEmails.push(newAddress);

        genEmails.push({
            address: newAddress,
            school_name: getRandomElement(schoolNames),
        });
        --n;
    }

    for (const email of genEmails) {
        schoolEmailAddresses.push(email);
    }
}

function generatePhoneNumbers(n) {
    if (schoolNames.length < 1)
        throw new Error("Create at least one school first");

    const genPhones = [];

    let maxLoops = 1.5 * n;
    while (n > 0 && maxLoops--) {
        const newNumber = faker.phone.number("##########");
        if (schoolPhones.includes(newNumber)) continue;
        schoolPhones.push(newNumber);

        genPhones.push({
            number: newNumber,
            school_name: getRandomElement(schoolNames),
        });
        --n;
    }

    for (const phone of genPhones) {
        schoolPhoneNumbers.push(phone);
    }
}

const schools = [];
const schoolEmailAddresses = [];
const schoolPhoneNumbers = [];

export {
    generateSchools,
    generateEmailAddresses,
    generatePhoneNumbers,
    schools,
    schoolEmailAddresses,
    schoolPhoneNumbers,
};
