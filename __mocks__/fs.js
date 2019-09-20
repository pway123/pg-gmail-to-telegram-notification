const fs = jest.genMockFromModule("fs");
const path = require("path");
let mockFiles = Object.create(null);
// example of newMockFiles
// { "./testFolder/file1.txt": "This is the file content" 
function __createMockFiles(newMockFiles) {
    mockFiles = Object.create(null);

    for (const file in newMockFiles) {

        const dir = path.join(__dirname, '..', 'src', file);
        if (!mockFiles[dir]) {
            mockFiles[dir] = [];
        }

        mockFiles[dir].push(path.basename(file));
        mockFiles[dir][path.basename(file)] = newMockFiles[file];
    }
}
function existsSync(pathToDirectory) {
    return mockFiles[pathToDirectory];
}

function readFileSync(pathToDirectory) {
    const dir = path.join(__dirname, '..', 'src', '/');
    const file = pathToDirectory.split(dir)[1];
    return mockFiles[pathToDirectory][file] ? mockFiles[pathToDirectory][file].toString() : mockFiles[pathToDirectory][file]
}

fs.existsSync = existsSync
fs.readFileSync = readFileSync
fs.__createMockFiles = __createMockFiles;
module.exports = fs;