<p align="center">
  <img src="https://img.shields.io/badge/Platform-OppHub-10a37f?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="OppHub Badge"/>
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"/>
</p>

<h1 align="center">✨ OppHub — Scholarship & Opportunity Aggregator</h1>

<p align="center">
  <strong>Discover scholarships, internships, fellowships, grants, competitions, and training programs — all in one place.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-api-overview">API</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 📖 Overview

**OppHub** is a full-stack web-based platform that aggregates educational and career opportunities for students. Instead of searching dozens of websites, students can discover, filter, track, and apply to scholarships, internships, fellowships, grants, competitions, freelancing gigs, and training programs from a single, unified dashboard.

The platform features AI-powered personalized recommendations using Google Gemini, real-time application tracking with email notifications, and a powerful admin panel for managing opportunities at scale.

---

## 🚀 Features

### 👤 User Features
- **User Authentication** — Secure registration & login with JWT-based sessions
- **Personalized Dashboard** — View stats, bookmarks, and recent activity at a glance
- **Opportunity Discovery** — Browse, search, and filter opportunities by category, location, and deadline
- **Detailed Opportunity Pages** — View full descriptions, eligibility, benefits, and application links
- **Application Tracking** — Track application status from "Applied" through "Accepted/Rejected"
- **Bookmarks** — Save opportunities for later reference
- **Preference Settings** — Set your interests, course, category, and income for tailored results
- **AI Recommendations** — Get personalized opportunity suggestions powered by Google Gemini AI
- **Profile Management** — Complete and update your student profile
- **Email Notifications** — Receive automatic status update emails when applications progress

### 🛡️ Admin Features
- **Admin Dashboard** — View platform-wide statistics and analytics
- **Opportunity Management** — Add, edit, and delete opportunities with a rich form
- **Application Management** — Review and update applicant statuses
- **Category-Specific Forms** — Dynamic form fields for Scholarships, Internships, Fellowships, Grants, Competitions, Training Programs, and Freelancing

### 🔐 Security
- Password hashing with **bcrypt**
- JWT-based authentication
- Rate limiting & input sanitization
- CORS protection
- Helmet security headers
- XSS protection

---

## 🛠️ Tech Stack

| Layer        | Technology                                                                 |
|-------------|---------------------------------------------------------------------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript                                           |
| **Backend**  | Node.js, Express.js                                                       |
| **Database** | MongoDB (Atlas)                                                           |
| **AI**       | Google Gemini API (`@google/generative-ai`)                               |
| **Auth**     | JSON Web Tokens (JWT), bcryptjs                                           |
| **Email**    | Nodemailer (Gmail SMTP)                                                   |
| **Upload**   | Multer (resume uploads)                                                   |
| **Security** | Helmet, express-rate-limit, express-mongo-sanitize, xss-clean             |

---

## 📸 Screenshots

> Add your screenshots here after deployment.

| Page | Screenshot |
|------|-----------|
| Landing Page | _Coming soon_ |
| Dashboard | _Coming soon_ |
| Opportunities | _Coming soon_ |
| Admin Panel | _Coming soon_ |

---

## ⚡ Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- Gmail account with [App Password](https://support.google.com/accounts/answer/185833) for email notifications

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/OppHub.git
cd OppHub
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/opportunityDB
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here
FRONTEND_URL=http://localhost:5500
```

### 4. Start the Backend Server

```bash
npm run dev
```

The API server will start at `http://localhost:5000`.

### 5. Start the Frontend

Open the project root in VS Code, then use the **Live Server** extension to serve `index.html` on port **5500**.

> Alternatively, use any static file server:
> ```bash
> npx serve . -l 5500
> ```

---

## 📁 Folder Structure

```
OppHub/
├── index.html                    # Landing page
├── about.html                    # About page
├── careers.html                  # Careers page
├── contact.html                  # Contact page
├── privacy.html                  # Privacy policy
├── terms.html                    # Terms of service
├── LICENSE                       # MIT License
├── .gitignore                    # Git exclusions
│
├── pages/                        # Frontend pages
│   ├── auth/
│   │   ├── login.html
│   │   └── signup.html
│   ├── dashboard/
│   │   └── dashboard.html
│   ├── opportunities/
│   │   ├── opportunities.html
│   │   └── opportunity-details.html
│   ├── applications/
│   │   └── applications.html
│   ├── profile/
│   │   └── profile.html
│   ├── preferences/
│   │   └── preferences.html
│   └── admin/
│       ├── admin-login.html
│       ├── admin-dashboard.html
│       ├── add-opportunity.html
│       └── manage-opportunities.html
│
├── scripts/                      # Frontend JavaScript
│   ├── api.js                    # Centralized API client & token management
│   ├── script.js                 # Landing page scripts
│   ├── login.js
│   ├── signup.js
│   ├── dashboard.js
│   ├── opportunities.js
│   ├── opportunity-details.js
│   ├── applications.js
│   ├── profile.js
│   ├── preferences.js
│   ├── auth-guard.js
│   ├── admin-login.js
│   ├── admin-dashboard.js
│   ├── add-opportunity.js
│   └── manage-opportunities.js
│
├── styles/                       # CSS Stylesheets
│   ├── style.css                 # Main stylesheet
│   ├── admin.css                 # Admin panel styles
│   └── preferences.css           # Preferences page styles
│
└── backend/                      # Express.js API Server
    ├── server.js                 # Entry point
    ├── package.json
    ├── .env.example              # Environment variable template
    ├── config/
    │   └── db.js                 # MongoDB connection
    ├── models/
    │   ├── User.js
    │   ├── Opportunity.js
    │   └── Application.js
    ├── controllers/
    │   ├── authController.js
    │   ├── opportunityController.js
    │   └── applicationController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── opportunityRoutes.js
    │   ├── applicationRoutes.js
    │   └── aiRoutes.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── uploadMiddleware.js
    ├── services/
    │   ├── aiService.js                    # Gemini AI integration
    │   ├── emailService.js                 # Email notifications
    │   └── localRecommendationEngine.js    # Fallback recommendation engine
    └── uploads/                  # User-uploaded files (gitignored)
        └── resumes/
```

---

## 🔌 API Overview

All API endpoints are prefixed with `/api`.

### Authentication (`/api/auth`)
| Method | Endpoint              | Description                | Auth |
|--------|-----------------------|----------------------------|------|
| POST   | `/register`           | Register a new user        | ❌   |
| POST   | `/login`              | Login user                 | ❌   |
| GET    | `/me`                 | Get current user profile   | ✅   |
| PUT    | `/profile`            | Update user profile        | ✅   |
| PUT    | `/preferences`        | Update user preferences    | ✅   |
| POST   | `/bookmarks`          | Toggle bookmark            | ✅   |
| GET    | `/bookmarks`          | Get bookmarked opportunities | ✅ |
| GET    | `/dashboard-stats`    | Get dashboard statistics   | ✅   |

### Opportunities (`/api/opportunities`)
| Method | Endpoint       | Description                   | Auth    |
|--------|----------------|-------------------------------|---------|
| GET    | `/`            | Get all opportunities         | ❌      |
| GET    | `/:id`         | Get opportunity by ID         | ❌      |
| POST   | `/`            | Create opportunity            | ✅ Admin |
| PUT    | `/:id`         | Update opportunity            | ✅ Admin |
| DELETE | `/:id`         | Delete opportunity            | ✅ Admin |

### Applications (`/api/applications`)
| Method | Endpoint       | Description                   | Auth    |
|--------|----------------|-------------------------------|---------|
| POST   | `/`            | Submit an application         | ✅      |
| GET    | `/`            | Get user's applications       | ✅      |
| GET    | `/all`         | Get all applications (admin)  | ✅ Admin |
| PUT    | `/:id/status`  | Update application status     | ✅ Admin |

### AI Recommendations (`/api/ai`)
| Method | Endpoint              | Description                   | Auth |
|--------|-----------------------|-------------------------------|------|
| GET    | `/recommendations`    | Get AI-powered recommendations| ✅   |

---

## 🧪 Usage

1. **Register** a new account at `/pages/auth/signup.html`
2. **Set Preferences** at `/pages/preferences/preferences.html` to personalize your feed
3. **Browse Opportunities** at `/pages/opportunities/opportunities.html`
4. **Apply** to opportunities and track your applications
5. **Admin Access** — Login at `/pages/admin/admin-login.html` with an admin account

---

## 🔮 Future Enhancements

- [ ] **Deployment** — Deploy to Vercel (frontend) + Render/Railway (backend)
- [ ] **OAuth Integration** — Google / GitHub social login
- [ ] **Push Notifications** — Browser push notifications for deadline reminders
- [ ] **Advanced Search** — Full-text search with Elasticsearch
- [ ] **Analytics Dashboard** — User engagement and opportunity click analytics
- [ ] **Mobile App** — React Native companion app
- [ ] **Multi-language Support** — Internationalization (i18n)
- [ ] **PDF Resume Builder** — Built-in resume generation tool
- [ ] **Community Forum** — Discussion board for applicants

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Guidelines
- Follow existing code style and conventions
- Write descriptive commit messages
- Test your changes thoroughly before submitting
- Update documentation if you change APIs or add features

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for students worldwide
</p>
