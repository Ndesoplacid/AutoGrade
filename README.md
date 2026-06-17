# AutoGrade — Automated MCQ Grading and Assessment System

AutoGrade is a production-ready, full-stack web application designed for automated MCQ grading. Teachers can create exams, define correct answer keys, and view class reports, while students can take exams online or upload CSV sheets to get instant grades and question-by-question feedback.

---

## 🚀 Live Demo URLs
*   **Frontend (Vercel)**: `https://autograde-client-three.vercel.app` *(Example placeholder — update with your deployed URL)*
*   **Backend API (Render)**: `https://autograde-server-api.onrender.com` *(Example placeholder — update with your deployed URL)*

### 👥 Seeded Demo Accounts
*   **Teacher Account**:
    *   **Email**: `teacher@autograde.com`
    *   **Password**: `password123`
*   **Student Account**:
    *   **Email**: `student@autograde.com`
    *   **Password**: `password123`

---

## 🛠️ Tech Stack
*   **Frontend**: React (Vite) + Tailwind CSS (v3) + Lucide Icons + React Router DOM
*   **Backend**: Node.js + Express (ES Modules)
*   **Database**: MongoDB (Mongoose)
*   **Authentication**: JSON Web Tokens (JWT) + BcryptJS password hashing
*   **File Uploads**: Multer + CSV-Parser (for student CSV submissions)

---

## 📂 Project Structure
```
/client
  ├── vercel.json           # Vercel configuration for SPA URL rewrites
  ├── tailwind.config.js    # Tailwind theme specifications
  ├── index.html            # Main HTML with SEO meta tags
  └── src
      ├── main.jsx          # DOM rendering entry point
      ├── index.css         # Styling utilities & custom animations
      ├── App.jsx           # React client routing configurations
      ├── components
      │   ├── Navbar.jsx    # Sticky navigation bar
      │   └── ProtectedRoute.jsx # Route guarding checks
      ├── context
      │   └── AuthContext.jsx    # React context state for JWT sessions
      └── pages
          ├── Login.jsx     # User authentication Login
          ├── Register.jsx  # User account sign-up
          ├── Dashboard.jsx # Dynamic stats cards & exam lists
          ├── CreateExam.jsx# Answer Key creation & CSV input
          ├── TakeExam.jsx  # MCQ sheet form & CSV upload grader
          ├── ResultDetail.jsx   # Graded sheet feedback & PDF printing
          └── ExamSubmissions.jsx# Class-wide grading summaries
/server
  ├── server.js             # Main API express configurations
  ├── package.json          # Server dependencies
  ├── seed.js               # Database population script
  ├── test.js               # Grading engine validation suite
  ├── middleware
  │   └── auth.js           # Express JWT checking middleware
  ├── models
  │   ├── User.js           # User schema model
  │   ├── Exam.js           # Exam schema model
  │   └── Submission.js     # Graded submission schema model
  └── routes
      ├── auth.js           # Registration & login routers
      ├── exams.js          # Exam configurations & dashboard routers
      └── submissions.js    # Grading engine & report exporting routes
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB running locally or a MongoDB Atlas Connection String

### 1. Backend Setup
1. Navigate to the `/server` directory:
   ```bash
   cd server
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the template:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=supersecretjwtkey12345
   ```
4. Run the seed script to populate demo accounts and tests:
   ```bash
   npm run seed
   ```
5. Start the backend developer environment:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `/client` directory:
   ```bash
   cd ../client
   ```
2. Install packages:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

---

## ⚙️ Grading Engine Calculations

The grading logic computes student performance metrics instantly upon submission:
1. **Unanswered**: A question is marked skipped if no choice is submitted.
2. **Correct**: Matches the correct answer key option (A, B, C, D).
3. **Score Calculation**: `Score = CorrectCount * MarksPerQuestion`.
4. **Percentage**: `Percentage = (Score / MaxPossibleScore) * 100`.
5. **Grade Mapping**:
    *   `>= 90%` ➔ **A**
    *   `>= 80%` ➔ **B**
    *   `>= 70%` ➔ **C**
    *   `>= 60%` ➔ **D**
    *   `< 60%` ➔ **F**

---

## 🚀 Deployment Instructions

### Frontend (Vercel)
1. Link your repository or drag-and-drop the `/client` folder onto the [Vercel Dashboard](https://vercel.com).
2. Set the **Framework Preset** to `Vite`.
3. Set the **Root Directory** to `client`.
4. Add the following **Environment Variable**:
   *   `VITE_API_URL` = `https://your-backend-api-url.onrender.com/api`

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com) and link your repository.
2. Set the **Root Directory** to `server`.
3. Set the **Build Command** to `npm install`.
4. Set the **Start Command** to `npm start`.
5. Add the following **Environment Variables**:
   *   `MONGODB_URI` = `mongodb+srv://...` (Your MongoDB Atlas connection string)
   *   `JWT_SECRET` = `some_long_jwt_security_token`
