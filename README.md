# IgniteIdeas 🚀

**IgniteIdeas** is an AI-powered innovation management platform designed to streamline the capture, evaluation, and implementation of internal ideas. It leverages Generative AI to help users articulate their vision and provides organizations with automated, data-driven feasibility assessments.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-blue)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-green)
![Docker](https://img.shields.io/badge/deploy-Docker-2496ED)

## ✨ Key Features

### 🧠 AI-Powered Innovation
- **Clarion Generator:** Uses GenAI (GPT-3.5) to convert rough text into structured project proposals with auto-generated titles, descriptions, and DALL-E visualizations.
- **Astra Evaluator:** Automatically scores ideas based on Impact, Sustainability, Ease, and Cost using LLMs.
- **Implementation Roadmaps:** Generates estimated budgets, timelines, and resource requirements.
- **Aiden Assistant:** A context-aware chatbot that guides users based on their role and current page.

### 🛡️ Enterprise-Grade Security
- **Microsoft Entra ID (Azure AD):** Secure authentication integrated via MSAL (Microsoft Authentication Library).
- **Role-Based Access Control (RBAC):** Distinct workflows for **Administrators**, **Evaluators**, and **Standard Users**.
- **JWT Authentication:** Custom secure session management.

### ⚡ Modern Workflow
- **Interactive Dashboard:** Drag-and-drop interfaces and Kanban-style views.
- **Collaboration:** Community voting (up/down) and threaded comments.
- **Category Management:** Dynamic categorization managed by admins.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Axios, MSAL (Azure Auth).
- **Backend:** Python 3.11, FastAPI, SQLAlchemy, Alembic, Pydantic.
- **Database:** MySQL 8.0 (Containerized).
- **AI Integration:** OpenAI API (GPT-3.5-turbo, DALL-E).
- **Infrastructure:** Docker & Docker Compose.

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose installed.
- OpenAI API Key.
- Azure AD Client ID & Tenant ID (for MSAL auth).

### 1. Clone the Repository
```bash
git clone [https://github.com/tt703/IgniteIdeas.git](https://github.com/tt703/IgniteIdeas.git)
cd IgniteIdeas
