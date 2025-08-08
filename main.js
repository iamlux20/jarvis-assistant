const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain
} = require('electron');
const path = require('path');
require('dotenv').config();

const {
  transcribeAudio
} = require('./whisper'); // ✅ make sure it's above the ipcMain.on block
const fs = require('fs');
const {
  record
} = require('node-record-lpcm16');
const {
  startWakeWordDetection
} = require('./wake-word');
const {
  interpretCommand
} = require('./gpt');
const {
  runCommand
} = require('./executor');
const {
  speak
} = require('./tts');

let win;
let tray = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false, // optional but recommended
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');

  win.on('minimize', function (event) {
    event.preventDefault();
    win.hide();
  });

  win.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }
    return false;
  });
}

app.whenReady().then(() => {
  createWindow();

  tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'));
  const contextMenu = Menu.buildFromTemplate([{
      label: 'Show Jarvis',
      click: () => win.show()
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('Jarvis Assistant');
  tray.setContextMenu(contextMenu);

  // 🔁 Simulate Wake Word Detection
  startWakeWordDetection(win);

  ipcMain.on('wake-word', async () => {
    console.log("🎙️ Wake word detected. Starting recording...");

    const filePath = path.join(__dirname, 'temp.wav');
    const fileStream = fs.createWriteStream(filePath);

    const sox = require('child_process').spawn('sox', [
      '-t', 'waveaudio', 'default',
      '-r', '16000',
      '-c', '1',
      '-b', '16',
      '-e', 'signed-integer',
      '-t', 'wav', '-'
    ]);

    sox.stdout.pipe(fileStream);

    sox.stderr.on('data', data => {
      console.error(`❌ STDERR: ${data}`);
    });

    sox.on('exit', async code => {
      console.log(`🛑 Recording stopped (code ${code})`);
      fileStream.end();

      try {
        const transcript = await transcribeAudio(filePath);
        console.log("🧠 Transcript:", transcript);

        const gptResponse = await interpretCommand(transcript);

        if (gptResponse.action === "runCommand" && gptResponse.command) {
          const result = runCommand(gptResponse.command);
          await speak(result.message);
        } else if (gptResponse.action === "speak") {
          await speak(gptResponse.message);
        } else {
          await speak("Sorry, I didn’t quite understand the command.");
        }
      } catch (err) {
        console.error("❌ Error during transcription or command handling:", err);
        await speak("There was an error processing your voice.");
      }
    });

    // Stop after 5 seconds
    setTimeout(() => {
      sox.kill(); // ⛔ Force-stop recording
    }, 5000);
  });


  ipcMain.on('voice-command', async (event, prompt) => {
    const gptResponse = await interpretCommand(prompt);

    if (gptResponse.action === "runCommand" && gptResponse.command) {
      const result = runCommand(gptResponse.command);
      await speak(result.message);
    } else if (gptResponse.action === "speak") {
      await speak(gptResponse.message);
    } else {
      await speak("Sorry, I didn't quite understand the command.");
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});