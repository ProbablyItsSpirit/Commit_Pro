// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000; // You can change this

// Middleware to parse JSON and allow requests from your extension
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use a fast model

// Your main analysis endpoint
app.post('/analyze-commit', async (req, res) => {
    try {
        const { commitMessage, commitDiff, author } = req.body;

        // Craft the perfect prompt for Gemini
        const prompt = `
        You are Commit Pro, an expert software engineer. Analyze this GitHub commit and provide a concise, insightful summary.

        AUTHOR: ${author}
        COMMIT MESSAGE: "${commitMessage}"

        CODE CHANGES (DIFF):
        ${commitDiff}

        Provide your analysis in the following structured format:
        1. **SUMMARY**: One sentence explaining the main purpose.
        2. **CHANGES**: Bullet points listing the key technical modifications (e.g., "Fixed null check in login()", "Refactored data fetching logic").
        3. **IMPACT**: Who or what part of the project this affects (e.g., "Frontend users", "API response time").
        4. **TYPE**: [Bug Fix / Feature / Refactoring / Chore / Documentation]

        Keep it professional, clear, and under 200 words.
        `;

        // Get analysis from Gemini
        const result = await model.generateContent(prompt);
        const analysis = result.response.text();

        // Send the analysis back to the extension
        res.json({ analysis });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

app.listen(port, () => {
    console.log(`Commit Pro backend listening on http://localhost:${port}`);
});