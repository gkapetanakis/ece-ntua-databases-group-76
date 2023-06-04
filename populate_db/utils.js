import { faker } from "@faker-js/faker";

export function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomPastDate(maxDaysPast) {
    return faker.date.recent({ days: maxDaysPast }).toISOString().slice(0, 10);
}

export function getRandomFutureDate(maxDaysForward) {
    return faker.date.soon({ days: maxDaysForward }).toISOString().slice(0, 10);
}

export function generateInsertString(tableName, object) {
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(object)) {
        fields.push(key);
        values.push(val);
    }

    return generateInsertStringHelper(tableName, fields, values);
}

// INSERT INTO tableName (fieldName0, fieldName1, ...)
// VALUES ('value0', 'value1', ...)
function generateInsertStringHelper(tableName, fieldNames, values) {
    let insertString = `INSERT INTO ${tableName} (`;
    const lastFieldName = fieldNames.pop();
    for (const fieldName of fieldNames) {
        insertString += `${fieldName}, `;
    }
    insertString += `${lastFieldName})\nVALUES (`;
    let lastValue = values.pop();
    for (let value of values) {
        if (typeof value === "string") {
            value = value.replaceAll("'", "\\'");
            value = value.replaceAll('"', '\\"');
        }
        if (typeof value !== "boolean") value = `"${value}"`;
        insertString += `${value}, `;
    }
    if (typeof lastValue === "string") {
        lastValue = lastValue.replaceAll("'", "\\'");
        lastValue = lastValue.replaceAll('"', '\\"');
    }
    if (typeof lastValue !== "boolean") lastValue = `"${lastValue}"`;
    insertString += `${lastValue});`;
    return insertString;
}
