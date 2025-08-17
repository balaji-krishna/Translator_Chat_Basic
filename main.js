// Set your deployed backend URL once and commit (or enter it in the input box):
// Example: const BACKEND = "https://en-ta-translator.onrender.com";
let BACKEND = "https://translator-chat-basic.onrender.com"; // leave blank to use the input field

const directionEl = document.getElementById("direction");
const inputEl = document.getElementById("user-input");
const btn = document.getElementById("translate-btn");
const output = document.getElementById("output");
const backendInput = document.getElementById("backend-url");

btn.addEventListener("click", async () => {
  const text = inputEl.value.trim();
  const direction = directionEl.value;
  const baseUrl = BACKEND || backendInput.value.trim();

  if (!text) return setOut("Please enter text.");
  if (!baseUrl) return setOut("Please provide the backend URL.");

  setOut("Translating…");

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/,'')}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, direction })
    });
    const data = await res.json();
    if (!res.ok) {
      setOut(`Error ${res.status}: ${data.detail || JSON.stringify(data)}`);
      return;
    }
    setOut(data.translation);
  } catch (e) {
    setOut(`Network error: ${e.message}`);
  }
});

function setOut(msg) {
  output.textContent = msg;
}
