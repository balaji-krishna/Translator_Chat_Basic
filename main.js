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
    // Check if API key was properly injected
    if (GEMINI_API_KEY === '{{GEMINI_API_KEY}}') {
        return 'Error: API key not configured. Please check GitHub Secrets setup.';
    }
    
    let prompt = '';
    if (direction === 'en-ta') {
        prompt = `Translate the following English text to Tamil: "${text}". Provide only the translation, no explanations.`;
    } else {
        prompt = `Translate the following Tamil text to English: "${text}". Provide only the translation, no explanations.`;
    }
    
    const body = {
        contents: [{ 
            parts: [{ text: prompt }] 
        }]
    };
    
    try {
        console.log('Making API request to:', GEMINI_API_URL);
        console.log('Request body:', JSON.stringify(body, null, 2));
        
        const res = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Response data:', JSON.stringify(data, null, 2));
        
        if (!res.ok) {
            return `API Error ${res.status}: ${data.error?.message || 'Unknown error'}`;
        }
        
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text.trim();
        } else {
            return `No translation found. API response: ${JSON.stringify(data)}`;
        }
    } catch (err) {
        console.error('Fetch error:', err);
        return `Network error: ${err.message}`;
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
