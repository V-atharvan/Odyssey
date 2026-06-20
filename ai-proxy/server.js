/**
 * Odyssey AI Proxy Server
 * -----------------------
 * Lightweight Express server that proxies resume API calls to Google Gemini.
 * The API key NEVER reaches the browser - all calls are server-side only.
 *
 * Endpoints:
 *   POST /api/resume/questions  → Generate strategic resume questions
 *   POST /api/resume/generate   → Generate full ATS-optimized resume (Markdown)
 *   POST /api/resume/analyze    → ATS score + keyword gap analysis
 *   GET  /actuator/health       → Health check (for frontend compatibility)
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Config ────────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY environment variable is not defined!');
    console.error('   Please define it in your environment before running the AI Proxy.');
    process.exit(1);
}
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '2mb' }));

// HTTP Security Headers
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none';");
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.removeHeader('X-Powered-By');
    next();
});

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Sliding Window Rate Limiter (10 requests per minute)
const rateLimits = new Map();
const rateLimiter = (limit, windowMs) => {
    return (req, res, next) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const now = Date.now();
        
        if (!rateLimits.has(ip)) {
            rateLimits.set(ip, []);
        }
        
        let requests = rateLimits.get(ip);
        requests = requests.filter(timestamp => now - timestamp < windowMs);
        
        if (requests.length >= limit) {
            const retryAfterSec = Math.ceil((requests[0] + windowMs - now) / 1000);
            res.set('Retry-After', String(retryAfterSec));
            return res.status(429).json({
                success: false,
                message: `Too many requests. Please try again in ${retryAfterSec} seconds.`,
                data: null
            });
        }
        
        requests.push(now);
        rateLimits.set(ip, requests);
        next();
    };
};

app.use('/api/resume', rateLimiter(10, 60 * 1000));

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Call Gemini and return the raw text response */
async function callGemini(prompt, temperature = 0.7) {
    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: 8192, topP: 0.95 },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
    };

    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned no content (may have been blocked)');
    return text;
}

/** Safely extract a JSON substring from raw LLM output */
function extractJson(raw, start, end) {
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const s = cleaned.indexOf(start);
    const e = cleaned.lastIndexOf(end);
    if (s === -1 || e === -1 || e <= s) throw new Error('No valid JSON found in response');
    return cleaned.substring(s, e + 1);
}

/** Wrap in Odyssey's standard ApiResponse shape */
const ok = (data, msg = 'Success') => ({ success: true, message: msg, data });
const err = (msg, code = 400) => ({ success: false, message: msg, data: null });

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get('/actuator/health', (_, res) => res.json({ status: 'UP', service: 'ai-proxy' }));

// ─── POST /api/resume/questions ───────────────────────────────────────────────
app.post('/api/resume/questions', async (req, res) => {
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.length < 50)
        return res.status(400).json(err('Job description must be at least 50 characters'));

    const prompt = `You are an expert career coach and ATS-savvy resume writer.

Given the job description below, generate exactly 10 strategic questions to help the candidate write a compelling, ATS-optimized resume.

Rules:
- Questions must extract specific, quantifiable information (numbers, metrics, technologies, outcomes)
- Cover: experience, skills, achievements, projects, education, leadership
- Each question must help uncover content that matches the job description keywords

Job Description:
${jobDescription}

Return ONLY a valid JSON array with NO additional text, markdown, or code blocks:
[
  {
    "id": "q1",
    "category": "Experience",
    "question": "Describe your most relevant work experience for this role.",
    "hint": "Include company name, duration, and key responsibilities."
  }
]

Categories must be one of: Experience, Skills, Achievements, Projects, Education, Leadership, Technical`;

    try {
        const raw = await callGemini(prompt);
        const json = extractJson(raw, '[', ']');
        const questions = JSON.parse(json);
        console.log(`✅ Generated ${questions.length} questions`);
        return res.json(ok({ questions }));
    } catch (e) {
        console.error('❌ Questions error:', e.message);
        return res.status(500).json(err('Failed to generate questions: ' + e.message));
    }
});

// ─── POST /api/resume/generate ────────────────────────────────────────────────
app.post('/api/resume/generate', async (req, res) => {
    const { jobDescription, answers } = req.body;
    if (!jobDescription || !answers?.length)
        return res.status(400).json(err('jobDescription and answers are required'));

    const qaPart = answers
        .map(a => `Q: ${a.question}\nA: ${a.answer}`)
        .join('\n\n');

    const prompt = `You are a world-class resume writer and ATS optimization expert.

Create a professional, ATS-optimized resume in Markdown format based on the candidate's answers.

CRITICAL RULES:
1. Use ONLY information provided in the answers — do NOT fabricate details
2. Incorporate keywords from the job description naturally
3. Write bullet points starting with strong action verbs (Developed, Led, Increased, Designed...)
4. Include measurable metrics wherever the candidate mentioned numbers
5. Format must be clean Markdown that renders well

Job Description:
${jobDescription}

Candidate's Q&A:
${qaPart}

Generate the resume in this Markdown template (fill all sections with real information from Q&A):

# [Full Name]
[email] | [phone] | [location] | [LinkedIn URL] | [GitHub URL]

## Professional Summary
[2–3 powerful sentences tailored to the job]

## Technical Skills
**Languages:** ...
**Frameworks:** ...
**Tools & Platforms:** ...

## Professional Experience
### [Job Title] — [Company Name] | [Start Date] – [End Date]
- [Action verb] [task/project] resulting in [measurable outcome]

## Projects
### [Project Name] | [Tech Stack]
- [Description with impact]

## Education
### [Degree] | [Institution] | [Year]

## Certifications
- [Name] — [Issuing Body] ([Year])`;

    try {
        const content = await callGemini(prompt, 0.6);
        console.log(`✅ Resume generated (${content.length} chars)`);
        return res.status(201).json(ok({
            id: Date.now(),
            content: content.trim(),
            jobDescription,
            createdAt: new Date().toISOString(),
        }, 'Resume generated successfully'));
    } catch (e) {
        console.error('❌ Generate error:', e.message);
        return res.status(500).json(err('Failed to generate resume: ' + e.message));
    }
});

// ─── POST /api/resume/analyze ─────────────────────────────────────────────────
app.post('/api/resume/analyze', async (req, res) => {
    const { jobDescription, resumeContent } = req.body;
    if (!jobDescription || !resumeContent)
        return res.status(400).json(err('jobDescription and resumeContent are required'));

    const prompt = `You are an expert ATS (Applicant Tracking System) analyst and resume coach.

Analyze the resume against the job description with precision.

SCORING CRITERIA (be strict and realistic):
- overallScore: weighted average of all sub-scores (0-100)
- keywordScore: % of important JD keywords present in resume (0-100)
- formatScore: ATS compatibility, structure, section order (0-100)
- contentScore: relevance, clarity, impact of bullet points (0-100)

Job Description:
${jobDescription}

Resume Content:
${resumeContent}

Return ONLY a valid JSON object with NO markdown, no code blocks, no additional text:
{
  "overallScore": 76,
  "keywordScore": 70,
  "formatScore": 85,
  "contentScore": 73,
  "presentKeywords": ["Java", "Spring Boot", "REST API"],
  "missingKeywords": ["Docker", "Kubernetes", "CI/CD"],
  "improvements": [
    {
      "section": "Professional Summary",
      "suggestion": "Add specific technologies from the JD."
    }
  ],
  "optimizedBullets": [
    {
      "original": "Worked on backend APIs",
      "optimized": "Designed and implemented 15+ RESTful APIs using Spring Boot, reducing average response time by 35%%."
    }
  ],
  "summary": "Your overall assessment here."
}`;

    try {
        const raw = await callGemini(prompt, 0.3);
        const json = extractJson(raw, '{', '}');
        const data = JSON.parse(json);
        console.log(`✅ ATS analysis complete. Score: ${data.overallScore}`);
        return res.json(ok({
            ...data,
            id: Date.now(),
            analyzedAt: new Date().toISOString(),
        }, 'Analysis complete'));
    } catch (e) {
        console.error('❌ Analyze error:', e.message);
        return res.status(500).json(err('Failed to analyze resume: ' + e.message));
    }
});

// 404 catch-all
app.use((req, res) => {
    res.status(404).json(err(`Route not found: ${req.method} ${req.path}`, 404));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Odyssey AI Proxy running!');
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/actuator/health`);
    console.log('');
    console.log('   Endpoints:');
    console.log(`   POST http://localhost:${PORT}/api/resume/questions`);
    console.log(`   POST http://localhost:${PORT}/api/resume/generate`);
    console.log(`   POST http://localhost:${PORT}/api/resume/analyze`);
    console.log('');
    console.log('   🔑 Gemini API key loaded ✓');
    console.log('');
});
