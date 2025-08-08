# Jarvis Assistant

A desktop AI assistant built with Electron that provides voice-activated command execution and natural language processing capabilities.

## Features

- **Voice Activation**: Wake word detection ("Jarvis")
- **Speech Recognition**: OpenAI Whisper integration for audio transcription
- **AI Command Processing**: GPT-4 powered command interpretation
- **Command Execution**: Run system commands via voice
- **Text-to-Speech**: Audio responses
- **System Tray**: Minimizes to tray for background operation

## Prerequisites

- Node.js (v14 or higher)
- OpenAI API key
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

3. Create a `.env` file with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
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
- `wake-word.js` - Wake word detection simulation
- `renderer.js` - Frontend rendering logic
- `preload.js` - Electron preload script

## Configuration

The assistant is configured for:

- English and Tagalog language support
- Windows development environment
- Philippines timezone
- 5-second recording window after wake word
- 30-second wake word detection interval

## License

MIT
