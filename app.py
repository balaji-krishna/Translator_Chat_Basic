import os
import json
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

if not GEMINI_API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY environment variable")

app = FastAPI(title="EN↔TA Translator API")

# CORS: in production, set your exact GitHub Pages origin(s) instead of "*"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

class TranslateIn(BaseModel):
    text: str
    direction: str  # 'en-ta' or 'ta-en'

class TranslateOut(BaseModel):
    translation: str

@app.get("/")
def root():
    return {"ok": True, "service": "translator", "model": GEMINI_MODEL}

@app.post("/translate", response_model=TranslateOut)
async def translate(payload: TranslateIn):
    text = payload.text.strip()
    direction = payload.direction.strip().lower()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    if direction not in ("en-ta", "ta-en"):
        raise HTTPException(status_code=400, detail="direction must be 'en-ta' or 'ta-en'")

    if direction == "en-ta":
        prompt = f'Translate the following English text to Tamil: "{text}". Provide only the translation.'
    else:
        prompt = f'Translate the following Tamil text to English: "{text}". Provide only the translation.'

    body = {"contents": [{"parts": [{"text": prompt}]}]}

    timeout = httpx.Timeout(30.0, read=30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(GEMINI_URL, json=body, headers={"Content-Type": "application/json"})
        data = r.json()
        if r.status_code != 200:
            # bubble up Gemini error message if any
            msg = (data.get("error") or {}).get("message") or "Upstream error"
            raise HTTPException(status_code=r.status_code, detail=msg)

    # extract text
    try:
        translation = data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception:
        raise HTTPException(status_code=502, detail=f"Unexpected API response: {json.dumps(data)[:800]}")
    return {"translation": translation}

if __name__ == "__main__":
    # for local dev: uvicorn app:app --reload
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
