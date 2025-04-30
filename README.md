# 💬 Dev Overflow

A full-stack Q&A platform inspired by Stack Overflow, built to facilitate knowledge sharing, developer collaboration, and community interaction. Dev Overflow enables users to ask technical questions, provide answers, vote, save content, and even get AI-generated solutions — all in a modern, responsive, and theme-switchable UI.

---

## 🖼️ Project Structure

- **Root Layout**
  - 🔍 **Navbar** – Global search bar at the top
  - 📦 **Container**
    - 📚 **Left Sidebar** – Page navigation
    - 📄 **Main Section** – Displays the selected page's content
    - ⭐ **Right Sidebar** – Shows top questions and popular tags

---

## 🚀 Features

- 🔐 **Authentication**
  - Email/password login
  - Social login via Google & GitHub
- 🌐 **Global & Local Search**
  - Smart search across questions, answers, tags, and users
- 🏠 **Home Page**
  - Filterable question cards with local search
- ❓ **Ask a Question**
  - Form to post questions with tag support
- 💬 **Answer Submission**
  - Answer form with OpenAI integration
- 🔼🔽 **Voting System**
  - Upvote/downvote with user-specific coloring
- 🧾 **Question Details**
  - View counts, answers, vote stats, user info
- 🧠 **AI Answers**
  - Auto-generate suggested answers via OpenAI
- 🧑‍🤝‍🧑 **Community Page**
  - Lists all registered users
- 📁 **Collections**
  - View saved questions
- 🏷️ **Tags Page**
  - Explore tags and the questions associated with it
- 🧑 **User Profile**
  - View/edit/delete questions and answers
  - Reputation & recommendation system with badges
- 💼 **Find Jobs**
  - Jobs pulled from Arbetsförmedlingen API
- 🎨 **Theme Support**
  - Light / Dark / System-based theming
- 📄 **Pagination & Filters**
  - Implemented across all data views
- 🏆 **Top Results**
  - Displays top 5 questions by views and votes
  - Displays top 5 popular tags

---

## 🛠️ Tech Stack

### 🧩 Frontend

- **React.js**
- **Next.js**
- **TailwindCSS**
- **TypeScript**

### ⚙️ Backend

- **MongoDB**
- **NextAuth.js**
- 🔧 **Server Actions** (for interacting with MongoDB)
- 🔗 **API Routes** (user/account endpoints)
- 🛠️ **Error & Log Handlers**

### 🧠 AI Integration

- **OpenAI API**

---

## 🔗 Live Demo

👉 [Click here to view Dev Overflow live](https://nextjs-devflow-nu.vercel.app/)
