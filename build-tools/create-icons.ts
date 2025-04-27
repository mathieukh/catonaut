// This file is used to create icons for the manifest.json file.
// Place an image in the public/assets/images folder and run: `bun run icons` from the root directory.
// Make sure to change the filename variable to the name of your image.

import path from 'path';
import Sharp from 'sharp';

const root = path.join(import.meta.dirname, `../public/assets/images/`);
const filename = 'example.png';

/**
 * Creates icons from an image for the manifest.
 * Sizes: 16, 32, 48, 128
 */
async function createIcons() {
  for (let size of [16, 32, 48, 128]) {
    await Sharp(`${root}${filename}`).resize({width: size, height: size})
    .toFormat('png')
    .toFile(`${root}icon${size}.png`);
    console.log(`resized ${filename} to ${size}x${size}`);
  }
}

createIcons();
