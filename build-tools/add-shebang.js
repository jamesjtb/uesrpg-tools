// add-shebang.js
const fs = require('fs');
const path = require('path');

const jsFilePath = path.resolve(__dirname, "..", 'dist', 'uesrpg-generate.js'); // Adjust path as needed
const shebang = '#!/usr/bin/env node\n';

fs.readFile(jsFilePath, (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  const newContent = shebang + data;
  fs.writeFile(jsFilePath, newContent, (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Shebang added successfully!');
  });
});