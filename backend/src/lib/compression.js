const ffmpeg = require('fluent-ffmpeg');

function compressVideo(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset fast',
        '-crf 28',
        '-movflags faststart'
      ])
      .on('error', (err) => {
        console.error('Compression error:', err);
        reject(err);
      })
      .on('end', () => {
        resolve(outputFilePath);
      })
      .save(outputFilePath);
  });
}

module.exports = { compressVideo };
