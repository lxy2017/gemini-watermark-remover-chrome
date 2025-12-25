/**
 * Build script - generates content.js with embedded base64 images
 * Usage: node build.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function imageToDataURL(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    return `data:image/png;base64,${base64}`;
}

function build() {
    const templatePath = path.join(__dirname, 'src', 'content.template.js');
    const outputPath = path.join(__dirname, 'content.js');

    const bg48DataUrl = imageToDataURL(path.join(__dirname, 'assets', 'bg_48.png'));
    const bg96DataUrl = imageToDataURL(path.join(__dirname, 'assets', 'bg_96.png'));

    let content = fs.readFileSync(templatePath, 'utf-8');
    content = content.replace("'{{BG_48_DATA}}'", `'${bg48DataUrl}'`);
    content = content.replace("'{{BG_96_DATA}}'", `'${bg96DataUrl}'`);

    fs.writeFileSync(outputPath, content);
    console.log('✅ Built content.js with embedded assets');
}

build();
