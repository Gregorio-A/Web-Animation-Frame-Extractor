const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

// Main capture configuration
const CONFIG = {
    inputFile: 'index.html',
    framesFolder: 'frames_temp',
    targetElement: '.wavy-text',
    width: 1920,
    height: 1080,
    durationSeconds: 20,
    fps: 30,
    transparentBackground: false
};

(async () => {
    // Prepare temporary folder
    if (fs.existsSync(CONFIG.framesFolder)) {
        fs.rmSync(CONFIG.framesFolder, { recursive: true, force: true });
    }
    fs.mkdirSync(CONFIG.framesFolder);

    console.log('Starting Puppeteer...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: CONFIG.width, height: CONFIG.height });

    const url = `file://${path.join(__dirname, CONFIG.inputFile)}`;
    await page.goto(url, { waitUntil: 'networkidle0' });

    const element = await page.$(CONFIG.targetElement);
    if (!element) {
        console.error(`Error: Element "${CONFIG.targetElement}" not found.`);
        await browser.close();
        return;
    }

    // Adjust viewport to element size
    const boundingBox = await element.boundingBox();
    await page.setViewport({
        width: Math.ceil(boundingBox.width),
        height: Math.ceil(boundingBox.height)
    });

    const totalFrames = CONFIG.durationSeconds * CONFIG.fps;
    console.log(`Generating ${totalFrames} PNG images...`);

    // Capture frames
    for (let i = 0; i < totalFrames; i++) {
        const currentTimeInMilliseconds = (i / CONFIG.fps) * 1000;

        await page.evaluate((time) => {
            document.getAnimations().forEach(anim => {
                anim.pause();
                anim.currentTime = time;
            });
        }, currentTimeInMilliseconds);

        const frameNumber = String(i + 1).padStart(4, '0');
        await element.screenshot({
            path: `${CONFIG.framesFolder}/frame_${frameNumber}.png`,
            omitBackground: CONFIG.transparentBackground
        });

        process.stdout.write('.');
    }

    await browser.close();
    
    console.log('\n\nImages generated! Run the command below in the terminal:');
    console.log('-------------------------------------------------------');
    console.log(`ffmpeg -f image2 -framerate ${CONFIG.fps} -i ${CONFIG.framesFolder}/frame_%04d.png -filter_complex "[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse" final-animation.gif`);
    console.log('-------------------------------------------------------');
})();
