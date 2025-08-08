document.addEventListener('DOMContentLoaded', () => {
  const log = document.getElementById('log');

  function addLog(text) {
    const p = document.createElement('p');
    p.textContent = text;
    log.appendChild(p);
  }

  const button = document.createElement('button');
  button.textContent = "🔊 Trigger Wake Word";
  button.onclick = () => {
    addLog("📣 Sending wake-word to main...");
    window.electronAPI.triggerWakeWord();
  };
  document.body.appendChild(button);
});