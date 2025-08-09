# Jarvis Assistant

A desktop AI assistant built with Electron that provides voice-activated command execution and natural language processing capabilities.

## Features

- **Voice Activation**: Porcupine wake word detection ("Jarvis")
- **Speech Recognition**: OpenAI Whisper integration for audio transcription
- **AI Command Processing**: GPT-4 powered command interpretation
- **Command Execution**: Run system commands via voice
- **YouTube Integration**: Voice-activated YouTube search and playback
- **Drive Management**: System drive detection and access
- **Text-to-Speech**: Audio responses
- **System Tray**: Minimizes to tray for background operation

## Prerequisites

- Node.js (v14 or higher)
- OpenAI API key
- YouTube Data API key (optional, for YouTube features)
- Picovoice access key (for wake word detection)
- SoX (Sound eXchange) for audio recording

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd jarvis-assistant
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your API keys:

```
OPENAI_API_KEY=your_openai_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
PICOVOICE_ACCESS_KEY=your_picovoice_access_key_here
```

4. Install SoX for audio recording:
   - Windows: Download from http://sox.sourceforge.net/
   - Add SoX to your system PATH

## Usage

1. Start the application:

```bash
npm start
```

2. The app will minimize to the system tray
3. Say "Jarvis" to activate voice commands
4. Speak your command within 5 seconds
5. Jarvis will process and execute the command

## Project Structure

- `main.js` - Main Electron process and application logic
- `whisper.js` - OpenAI Whisper speech-to-text integration
- `gpt.js` - GPT-4 command interpretation
- `executor.js` - System command execution
- `tts.js` - Text-to-speech functionality
- `wake-word.js` - Porcupine wake word detection
- `youtube.js` - YouTube API integration for video search
- `drives.js` - System drive detection utilities
- `renderer.js` - Frontend rendering logic
- `preload.js` - Electron preload script
- `assets/` - Static assets including wake word models and tray icon

## Configuration

The assistant is configured for:

- English and Tagalog language support
- Windows development environment
- Philippines timezone
- 5-second recording window after wake word
- Continuous wake word detection using Porcupine
- YouTube video search and direct playback
- System drive enumeration and access

## License

MIT
