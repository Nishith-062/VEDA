const path = require('path');
const { compressVideo } = require('./src/lib/compression'); // Adjust path if needed
    const fs = require('fs');
const inputFile = path.join(__dirname, 'input_test.mp4');
const outputFile = path.join(__dirname, 'output_test_compressed.mp4');

compressVideo(inputFile, outputFile)
  .then(() => {
    console.log('Compression finished! Output saved at:', outputFile);


const originalSize = fs.statSync('input_test.mp4').size;
const compressedSize = fs.statSync('output_test_compressed.mp4').size;

console.log(`Original: ${originalSize} bytes`);
console.log(`Compressed: ${compressedSize} bytes`);

  })
  .catch((err) => {
    console.error('Compression failed:', err);
  });
