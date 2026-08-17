# SkillBridge 🚀

**Community Skill Exchange Platform**

SkillBridge is a full-stack web application that connects local skill providers (tutors, electricians, designers) with service seekers. Built with React.js, Node.js, PostgreSQL, and AI-powered search using TF-IDF + Cosine Similarity.

---

## ✨ Features

### 👤 Authentication & Users
- User Registration & Login with JWT
- 3 User Roles: **Admin**, **Skill Provider**, **Service Seeker**
- Role-based access control

### 📚 Skill Management
- Providers can **Add**, **View**, and **Delete** skills
- Filter skills by category
- Skill tags for better discovery

### 🤖 AI-Powered Search
- TF-IDF + Cosine Similarity algorithm
- Intelligent skill recommendations
- Python Flask microservice

### 📋 Request Management
- Seekers can **send** service requests
- Providers can **Accept** or **Reject** requests
- Real-time request status tracking (pending/accepted/rejected)

### 💬 Chat System
- Real-time messaging after request acceptance
- Unread message count
- Chat inbox with all conversations

### 🛠️ Admin Panel
- Manage users, skills, and requests
- Platform statistics dashboard

### 📊 Dashboard
- Role-based dashboard for Provider and Seeker
- Analytics charts (User Growth, Skills by Category, Monthly Requests)
- Recent activity feed

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express.js, JWT, bcrypt |
| **Database** | PostgreSQL |
| **AI Service** | Python Flask, scikit-learn |
| **HTTP Client** | Axios |

---
