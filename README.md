# Web Animation Frame Extractor

This tool uses **Puppeteer** to open a local HTML file in a background browser and capture high-quality frames from web animations (CSS or Web Animations API).

Instead of simply recording the screen (which can cause lag or dropped frames), this script uses a **deterministic approach**: it loops through a set duration and manually "steps" through the animation using the JavaScript Animation API. It saves the results as a sequence of PNG images and provides the **FFmpeg** command to stitch them into a high-quality GIF or video.

## 📋 Prerequisites

Before running this script, ensure you have the following installed:

1.  **Node.js**: (v14 or higher recommended).
2.  **FFmpeg**: Required to convert the captured images into a video or GIF.
    * **Mac:** `brew install ffmpeg`
    * **Windows:** Download from the [official site](https://ffmpeg.org/download.html) and add to your system PATH.
    * **Linux:** `sudo apt install ffmpeg`

## Setup

1.  **Initialize the project** (if you haven't already):
    ```bash
    npm init -y
    ```

2.  **Install dependencies**:
    This script requires Puppeteer to control the browser.
    ```bash
    npm install puppeteer
    ```

3.  **Prepare your HTML file**:
    Ensure you have an `index.html` file in the same directory. It must contain the element you want to capture (default class is `.wavy-text`).

## Configuration

Open the script file and modify the `CONFIG` object at the top to match your specific animation needs:

```javascript
const CONFIG = {
    inputFile: 'index.html',       // Your HTML file
    framesFolder: 'frames_temp',   // Output folder for images
    targetElement: '.wavy-text',   // CSS selector of the element to capture
    width: 1920,                   // Initial viewport width
    height: 1080,                  // Initial viewport height
    durationSeconds: 20,           // Duration of animation to capture
    fps: 30,                       // Frames Per Second (higher = smoother)
    transparentBackground: false   // Set to true for transparent PNGs
};
```
## Usage

1.  **Run the script:**
    ```bash
    node your_script_name.js
    ```

2.  **Wait for the process:**
    * The script will launch a hidden (headless) browser.
    * It will "step" through your animation frame by frame.
    * Progress will be indicated by dots (`.`) in the terminal.

3.  **Generate the GIF:**
    Once finished, the script will print a long command in your terminal. Copy and paste that command to generate your final GIF.

    *Example command output:*
    ```bash
    ffmpeg -f image2 -framerate 30 -i frames_temp/frame_%04d.png -filter_complex "[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse" final-animation.gif
    ```

## How It Works

Unlike screen recording software that just records the screen (and might lag), this script uses a precise **deterministic approach**:

* **Time Manipulation:** It uses the browser's `document.getAnimations()` API.
* **Frame Stepping:** Instead of letting the animation play in real-time, the script pauses it.
* **Seeking:** It calculates exactly where the animation should be at every frame (e.g., at 0.033s, 0.066s, etc.).
* **Snapshot:** It forces the browser to render that exact moment and takes a screenshot.

This guarantees that every frame is perfect, regardless of how fast or slow your computer is.
