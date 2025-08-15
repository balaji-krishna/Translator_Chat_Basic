# AI Agent Chatbot - English/Tamil Translator

A simple AI-powered chatbot that translates text between English and Tamil using Google's Gemini API.

## Features
- Real-time translation between English and Tamil
- Clean and responsive chat interface
- Powered by Google Gemini AI

## Setup for GitHub Pages

1. **Create a GitHub repository** and push these files
2. **Add your Gemini API key as a GitHub Secret**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GEMINI_API_KEY`
   - Value: Your actual Gemini API key
3. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: GitHub Actions
4. **Push to main branch** - the workflow will automatically deploy your site

## How it works
- The GitHub Action replaces the placeholder `{{GEMINI_API_KEY}}` with your secret during build
- Your API key never appears in your public repository
- The built site is deployed to GitHub Pages with the API key embedded

## Local Development
To run locally with your API key:
1. Replace `{{GEMINI_API_KEY}}` in `main.js` with your actual API key
2. Open `index.html` in your browser

## Security Note
Never commit your actual API key to the repository. Always use GitHub Secrets for production deployment.
