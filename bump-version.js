const fs = require('fs');

const VERSION = process.env.VERSION;

console.log("Bumping to " + VERSION);

function withJsonFile(name, callback) {
    const text = fs.readFileSync(name);
    const json = JSON.parse(text);
    callback(json)
    fs.writeFileSync(name, JSON.stringify(json, null, "  "))
}

withJsonFile("./json-form/package.json", j => {
    j.version = VERSION;
});

withJsonFile("./sandbox/package.json", j => {
    j.dependencies['@diesel-parser/json-form'] = '^' + VERSION;
});

