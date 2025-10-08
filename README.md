# Stream Studio

A lightweight, browser-based streaming and recording application designed for simplicity and power. Capture your screen, overlay your webcam, add graphics, and record your final composition directly in your browser. No installation required.

![Stream Studio Screenshot](https://i.imgur.com/your-screenshot-url.png) <!-- It's a good idea to add a screenshot of the app in action -->

## Key Features

- **Screen & Audio Sharing**: Capture any window, tab, or your entire screen, with optional system audio.
- **Live Compositing**: What you see is what you get. All overlays are rendered in real-time on top of your screen share.
- **Draggable & Resizable Overlays**: Full control over the position and size of every element in your scene.
- **Multi-Source Overlays**:
  - **Webcam**: Add your camera feed.
  - **Media**: Upload multiple images and videos, then cycle through them within a single overlay.
  - **Graphics**: Add static images like logos, watermarks, or lower thirds.
  - **Drawing Tool**: Sketch diagrams or add hand-drawn annotations with an Excalidraw-style canvas.
- **Advanced Customization**: Add customizable borders (color, width, style, rounded corners) to any overlay.
- **In-Browser Recording**: Record your final composited scene to a high-quality `.mp4` or `.webm` file.
- **100% Private**: All video processing, compositing, and recording happens locally on your computer. No data is ever uploaded.

---

## How to Use: A Step-by-Step Guide

### Step 1: Start Sharing Your Screen

The foundation of your stream is the screen share.

1.  Click the **Screen** button in the toolbar.
2.  Your browser will prompt you to choose what to share (a Chrome Tab, a Window, or your Entire Screen).
3.  **Important**: If you want to record audio from a game or application, make sure to enable the "Share system audio" (or similar) option in the prompt.
4.  Once you start sharing, a live preview will appear. To avoid a "hall of mirrors" effect, the preview will automatically hide if you are viewing the Stream Studio tab itself. You can toggle the preview manually with the **Preview (Eye)** button.

### Step 2: Add and Manage Overlays

Bring your scene to life by adding different types of overlays.

- **Webcam**: Click the **Webcam** button. This opens a menu to select your camera. Once selected, your webcam feed will appear as an overlay.
- **Media (Images & Videos)**: Click the **Media** button to upload multiple image and video files. The first one will be added as an overlay. You can use the arrow icons on the overlay to cycle through all the media you've uploaded.
- **Graphics**: Click the **Graphic** button to upload a single, static image. This is ideal for logos, frames, or watermarks that shouldn't be part of the media cycle.
- **Draw**: Click the **Draw** button to open a full-screen drawing canvas. Use the tools to sketch, select a color, and undo. When you click "Done," your drawing is saved as a new graphic overlay.

### Step 3: Arrange and Customize Your Scene

You have full control over the layout.

- **Move & Resize**: Click and drag any overlay to move it. To resize, drag the circular handles at the corners.
- **Bring to Front**: Clicking on any overlay will automatically bring it to the front of all other overlays.
- **Overlay Controls**: Hover your mouse over an overlay to reveal a set of controls:
  - **Arrow Icons (⇦ ⇨)**: On Webcam, Media, and Video overlays, these cycle through available sources (e.g., switch cameras, or show the next image/video in your library).
  - **Settings Icon (⚙️)**: Opens the **Border Settings** panel where you can adjust the color, width, style (solid/dashed), and corner radius.
  - **Fullscreen Icon**: On the webcam, this toggles it to fill the entire screen.
  - **Close Icon (X)**: Removes the overlay from your scene.

### Step 4: Record Your Final Output

Once your scene is set up, you're ready to record.

1.  **Select a Format**: Use the dropdown menu next to the Record button to choose your output format.
    - **MP4**: Recommended. Uses FFmpeg for in-browser transcoding to create a highly compatible file with reliable audio.
    - **WebM**: The browser's native format. Faster processing, but may have less compatibility with video editors.
2.  **Start/Stop Recording**: Click the **Record** button to start. The button will turn red and pulse. Click it again to stop.
3.  **Processing**: If you chose MP4, a "Processing Video..." overlay will appear while FFmpeg transcodes your file. Please wait for this to complete.
4.  **Download**: Once finished, your browser will automatically prompt you to save the video file.

---

## Browser Compatibility

Stream Studio uses advanced browser APIs. For the best experience, use a modern, Chromium-based browser:

- **Recommended**: Google Chrome, Microsoft Edge, Brave.
- **Good Support**: Firefox.
- **Limited Support**: Safari may have limitations with screen sharing, audio capture, and recording features.

*Tip: Screen sharing with system audio is best supported in Chrome and Edge on Windows and Linux.*

## Privacy

Your privacy is paramount. **All operations are performed locally in your browser.** This includes:
- Camera and screen capture.
- Video and audio compositing.
- Recording and transcoding with FFmpeg.

No data, video, or audio is ever sent to a server. Your content stays on your machine.
