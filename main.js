// API key will be injected during build
const GEMINI_API_KEY = '{{GEMINI_API_KEY}}';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY;

const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const directionSelect = document.getElementById('direction');

function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.className = 'chat-message';
    div.innerHTML = `<span class="${sender}">${sender === 'user' ? 'You' : 'Bot'}:</span> ${text}`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
}

async function translateWithGemini(text, direction) {
    let prompt = '';
    if (direction === 'en-ta') {
        prompt = `Translate the following English text to Tamil: "${text}"`;
    } else {
        prompt = `Translate the following Tamil text to English: "${text}"`;
    }
    const body = {
        contents: [{ parts: [{ text: prompt }] }]
    };
    try {
        const res = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return 'Sorry, I could not translate that.';
        }
    } catch (err) {
        return 'Error contacting Gemini API.';
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    const direction = directionSelect.value;
    if (!text) return;
    appendMessage('user', text);
    userInput.value = '';
    appendMessage('bot', 'Translating...');
    const translation = await translateWithGemini(text, direction);
    // Remove the 'Translating...' message
    chatLog.lastChild.remove();
    appendMessage('bot', translation);
});
