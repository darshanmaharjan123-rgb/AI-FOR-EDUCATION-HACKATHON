# AI-FOR-EDUCATION-HACKATHON

# 🎙️ ClarityAI — Voice-First AI Tutor for Sight-Impaired Learners

> An audio-driven learning platform that transforms visual educational content—diagrams, complex equations, and articles—into vivid, spatial, and natural-language audio descriptions, backed by real-time voice interaction and accessible comprehension analytics.

---

## 📌 Project Overview

Traditional e-learning platforms rely heavily on visual graphics, graphs, and written text, creating significant accessibility barriers for visually impaired students. **ClarityAI** bridges this gap by acting as a voice-first educational companion.

### Core Features
- **Vivid Image & Diagram Audio Description:** Uses multimodal LLMs to convert charts, diagrams, and mathematical formulas into clear, spatial audio descriptions.
- **Hands-Free Voice Interaction:** Full speech-to-speech conversational interface powered by Web Speech / Whisper APIs and natural text-to-speech synthesis.
- **Accessible Analytics Dashboard:** High-contrast, screen-reader-optimized, and voice-navigable performance dashboard tracking comprehension levels, vocal sentiment, and subject engagement.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React.js / Next.js, Tailwind CSS, Web Speech API / ElevenLabs SDK, ARIA / Screen Reader Standards
- **Backend:** Node.js (Express) or Python (FastAPI), OpenAI GPT-4o / Gemini API (Multimodal Analysis), Whisper API
- **Database:** PostgreSQL / Supabase or MongoDB (Session logs, User Analytics, Quiz History)

---

## 👥 Team Roles & Git Branch Workflow

We operate across 3 dedicated feature branches to ensure zero merge friction during the hackathon sprint:
                        ┌─────────────────────────┐
                        │      main / master      │
                        └────────────▲────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
 ┌─────────┴─────────┐     ┌─────────┴─────────┐     ┌─────────┴─────────┐
 │  feature/frontend │     │  feature/backend  │     │  feature/database │
 │  (Member 1: UI)   │     │  (Member 2: AI)   │     │  (Member 3: Data) │
 └───────────────────┘     └───────────────────┘     └───────────────────┘

 ---

## 🚀 Branch Breakdowns & Task Assignments

### 1. `feature/frontend` — Frontend & Accessibility Engineer
**Focus:** Voice-driven user interface, WCAG compliance, screen-reader optimization, and dashboard UI.

* **Key Deliverables:**
  * [ ] Build accessible UI components with full ARIA landmarks, high-contrast modes, and keyboard navigation.
  * [ ] Implement voice-input trigger system (push-to-talk and voice activation commands).
  * [ ] Integrate text-to-speech audio stream playback and loading indicators.
  * [ ] Build the **Voice Engagement & Analytics Dashboard** using Accessible Chart components (Highcharts Accessibility or Chart.js with high contrast).

---

### 2. `feature/backend` — Backend & AI Pipeline Lead
**Focus:** Multimodal image processing, LLM audio-description prompts, Speech API orchestration, and core endpoints.

* **Key Deliverables:**
  * [ ] Set up REST / WebSocket server (FastAPI or Node.js).
  * [ ] Create `/api/describe-visual` endpoint: Accepts image/PDF uploads and generates spatial audio descriptions using multimodal prompts.
  * [ ] Create `/api/socratic-voice` endpoint: Manages natural voice-turn conversations and returns streaming response payloads.
  * [ ] Create `/api/analyze-comprehension` endpoint: Analyzes student voice responses to score comprehension and identify knowledge gaps.

---

### 3. `feature/database` — Data Architect & Analytics Lead
**Focus:** Data models, event logging schema, test dataset preparation, and analytics aggregation.

* **Key Deliverables:**
  * [ ] Design database schemas for `users`, `learning_sessions`, `audio_logs`, and `comprehension_scores`.
  * [ ] Build aggregation functions to compute real-time metrics (e.g., Audio Retention Rate, Voice Confidence Index, Knowledge Gap Areas).
  * [ ] Pre-populate realistic seed data (2 weeks of simulated study logs) so the Analytics Dashboard looks fully populated during judges' evaluation.
  * [ ] Connect backend API routes to the database layer.

---

## 📊 Database Schema Summary

| Table | Core Attributes |
| :--- | :--- |
| `users` | `id`, `name`, `accessibility_mode`, `created_at` |
| `sessions` | `id`, `user_id`, `topic`, `duration_seconds`, `timestamp` |
| `comprehension_logs` | `id`, `session_id`, `sub_topic`, `confidence_score` (0–100), `detected_gap` |
| `analytics_summary` | `user_id`, `total_listening_hours`, `top_mastered_topics`, `weak_topics` |

---

## ⚡ Quickstart Guide

```bash
# 1. Clone the repository
git clone [https://github.com/your-org/clarity-ai.git](https://github.com/your-org/clarity-ai.git)
cd clarity-ai

# 2. Checkout your specific task branch
git checkout feature/frontend   # Or feature/backend / feature/database

# 3. Install dependencies
npm install  # or pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env

# 5. Run local development server
npm run dev

---

## 🌿 Git Command Cheat Sheet for Your Team

To create and set up these 3 branches in your repository, run these commands:

```bash
# Member 1: Set up Frontend Branch
git checkout -b feature/frontend
git push -u origin feature/frontend

# Member 2: Set up Backend Branch
git checkout -b feature/backend
git push -u origin feature/backend

# Member 3: Set up Database Branch
git checkout -b feature/database
git push -u origin feature/database

## gi🎨 UI & Design System: Claymorphism for Accessibility

**ClarityAI** uses a **Claymorphism** design aesthetic—combining tactile, rounded 3D soft-clay elements with high contrast and distinct spatial separation. 

Claymorphism provides tangible, touch-friendly UI boundaries that benefit low-vision users using screen magnifiers, offering depth without the busy clutter of traditional skeuomorphism.

### 1. Core Visual Principles
- **Soft 3D Depth:** Dual outer directional shadows paired with inner inset lighting create a friendly, floating "clay" look.
- **Micro-Interactions on Focus:** Claymorphic buttons physically depress (`transform: translateY(2px)`) on keyboard focus or click, providing clear tactile visual feedback.
- **High Contrast & Accessible Palettes:** All clay cards maintain a strict contrast ratio of **4.5:1 (WCAG AA standard)** against text and background layers.

---

### 2. Claymorphism CSS Architecture

```css
/* Core Claymorphic Surface Class */
.clay-card {
  background: #f0f4f8;
  border-radius: 24px;
  box-shadow: 
    /* Outer soft clay drop shadows */
    8px 8px 16px #d1d9e6,
    -8px -8px 16px #ffffff,
    /* Inner soft top light highlight */
    inset -4px -4px 8px rgba(0, 0, 0, 0.05),
    inset 4px 4px 8px rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease-in-out;
}

/* Claymorphic Button Hover/Focus State */
.clay-button {
  background: #4a90e2;
  color: #ffffff;
  border-radius: 16px;
  box-shadow: 
    6px 6px 12px rgba(74, 144, 226, 0.4),
    -6px -6px 12px #ffffff,
    inset -2px -2px 4px rgba(0, 0, 0, 0.2),
    inset 2px 2px 4px rgba(255, 255, 255, 0.4);
}

.clay-button:focus, .clay-button:active {
  transform: translateY(2px);
  box-shadow: 
    2px 2px 4px rgba(74, 144, 226, 0.4),
    inset -1px -1px 2px rgba(0, 0, 0, 0.3);
}

3. Tailwind CSS Config Integration (tailwind.config.js)

If using Tailwind CSS on feature/frontend, extend your utility classes for instant clay styling:
JavaScript

module.exports = {
  theme: {
    extend: {
      borderRadius: {
        'clay': '24px',
      },
      boxShadow: {
        'clay-card': '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff, inset -4px -4px 8px rgba(0,0,0,0.05), inset 4px 4px 8px rgba(255,255,255,0.9)',
        'clay-btn': '6px 6px 12px rgba(74, 144, 226, 0.35), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.4)',
        'clay-pressed': 'inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.7)',
      }
    }
  }
}

4. Clay Components Checklist

    [ ] Clay Voice Orb: Animated pulsing clay bubble indicating AI listening/speaking states.

    [ ] Clay Analytics Cards: Soft 3D container widgets for the Radar & Heatmap charts.

    [ ] High-Contrast Focus Rings: Thick 3px outline around active clay elements for keyboard-only navigation.


---

<ElicitationsGroup message="Would you like code snippets for any specific Claymorphic UI components?">
  <Elicitation label="Get a Claymorphic Voice Orb Component in React" query="Write a React component with Tailwind CSS for a Claymorphic animated voice mic button that reacts when the user speaks."/>
  <Elicitation label="Get Claymorphic Dashboard Card Components" query="Provide React Tailwind code for Claymorphic analytics cards to display the Voice Engagement metrics."/>
</ElicitationsGroup>

