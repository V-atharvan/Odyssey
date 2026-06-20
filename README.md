# 🚀 Odyssey – College-to-Company Talent Platform

> A production-ready full-stack platform connecting college students with real-world company projects, with built-in payments, portfolio generation, and performance scoring.

---

## 🏗️ Architecture

```
odyssey/
├── backend/          # Spring Boot REST API (Java 17)
├── frontend/         # React + Vite + Tailwind CSS
└── docker-compose.yml
```

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, JPA/Hibernate |
| Database | PostgreSQL 16 |
| Auth | JWT (HS256) + BCrypt |
| Frontend | React 18, Vite, Tailwind CSS |
| HTTP Client | Axios |
| Payments | Razorpay |
| Docs | Swagger (SpringDoc OpenAPI 2.x) |
| Deploy | Docker + docker-compose |

---

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Manage all users, view analytics, verify organizations |
| **College Admin** | Register college, verify students, view performance |
| **Company** | Post projects, review applicants, assign tasks, release payments |
| **Student** | Apply to projects, track earnings, build portfolio |

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and start everything
git clone <repo-url>
cd odyssey

# Add your Razorpay keys (optional for testing)
echo "RAZORPAY_KEY_ID=rzp_test_xxx" > .env
echo "RAZORPAY_KEY_SECRET=xxx" >> .env

docker-compose up --build
```

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html

---

### Option 2: Manual Setup

#### Prerequisites
- Java 17+ (JDK)
- Maven 3.8+
- Node.js 20+
- PostgreSQL 16+

#### Database Setup
```sql
CREATE DATABASE odyssey_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE odyssey_db TO postgres;
```

#### Backend
```bash
cd backend

# Edit src/main/resources/application.properties
# Set your DB credentials, JWT secret, Razorpay keys

mvn clean spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## ⚙️ Configuration

### Backend (`application.properties`)

| Property | Description |
|----------|------------|
| `spring.datasource.url` | PostgreSQL connection URL |
| `spring.datasource.username` | DB username |
| `spring.datasource.password` | DB password |
| `jwt.secret` | JWT signing secret (min 256 bits) |
| `jwt.expiration` | Token TTL in ms (86400000 = 24h) |
| `razorpay.key.id` | Razorpay test/live key ID |
| `razorpay.key.secret` | Razorpay secret key |
| `spring.mail.*` | Gmail SMTP settings |

### Frontend (`.env`)

```
VITE_API_URL=http://localhost:8080/api
```

---

## 🔐 Authentication Flow

1. **Register**: `POST /api/auth/register` → creates User + role profile atomically
2. **Login**: `POST /api/auth/login` → returns JWT token + user info
3. All subsequent requests: attach `Authorization: Bearer <token>` header

### Register Payload
```json
{
  "fullName": "Riya Sharma",
  "email": "riya@college.edu",
  "password": "secure123",
  "role": "STUDENT",
  "organizationName": "",
  "collegeCode": ""
}
```

For `COLLEGE_ADMIN` and `COMPANY` roles, `organizationName` is required.

---

## 📡 Key API Endpoints

### Auth
```
POST /api/auth/register   Register a user
POST /api/auth/login      Login and get JWT
```

### Student
```
GET  /api/students/profile          Get own profile
PUT  /api/students/profile          Update profile
GET  /api/students/projects         Get matched projects (smart ranked)
GET  /api/students/applications     List own applications
GET  /api/students/portfolio/{id}   View public portfolio
```

### Projects
```
POST /api/projects                    Create project (COMPANY)
GET  /api/projects                    List open projects (paginated)
GET  /api/projects/{id}              Get project details
POST /api/projects/{id}/apply        Apply to project (STUDENT)
GET  /api/projects/{id}/applicants   View applicants (COMPANY)
PUT  /api/projects/{id}/assign/{sid} Assign student (COMPANY)
PUT  /api/projects/{id}/status       Update status (COMPANY)
```

### College Admin
```
GET /api/colleges/students                   List students
PUT /api/colleges/students/{id}/verify       Verify/reject student
GET /api/colleges/dashboard                  Dashboard stats
```

### Payments
```
POST /api/payments/create-order/{projectId}  Create Razorpay order
POST /api/payments/verify                    Verify payment
POST /api/payments/release/{applicationId}   Release to student
GET  /api/payments/project/{projectId}       Payment status
```

### Admin
```
GET /api/admin/users                    All users (paginated)
PUT /api/admin/users/{id}/toggle-status Enable/disable user
GET /api/admin/analytics                Platform analytics
PUT /api/admin/companies/{id}/verify    Verify company
PUT /api/admin/colleges/{id}/verify     Verify college
```

Full interactive docs: **http://localhost:8080/swagger-ui.html**

---

## 💳 Payment Flow (Razorpay Escrow)

```
Company → POST /payments/create-order  → Razorpay Order created
        → (Frontend: Razorpay Checkout)
        → POST /payments/verify        → Payment verified, funds escrowed
        → (After task completion)
        → POST /payments/release/{appId} → Payment released to student
```

To use real payments, replace mock Razorpay code in `PaymentService.java` with:
```java
RazorpayClient client = new RazorpayClient(keyId, keySecret);
// See Razorpay Java SDK docs
```

---

## 🧠 Matching Algorithm

Students see projects **ranked by match score** (0–100%):
- **60%** weighted on skill overlap (student skills ∩ project required skills)
- **40%** weighted on experience level match

```java
// StudentService.java – calculateMatchScore()
score = 0.6 * (matchedSkills / totalProjectSkills)
      + 0.4 * (experienceLevel == required ? 1 : 0)
```

---

## 🗄️ Database Schema

```
users (id, email, password, full_name, role, active, email_verified)
student_profiles (id, user_id→users, college_id→colleges, skills, bio, performance_score, total_earnings)
colleges (id, user_id→users, college_name, college_code, verification_status)
companies (id, user_id→users, company_name, industry, verification_status)
projects (id, company_id→companies, title, description, required_skills, budget, status)
applications (id, project_id→projects, student_id→student_profiles, status, cover_letter)
payments (id, project_id→projects, student_id→student_profiles, razorpay_order_id, amount, status)
reviews (id, company_id→companies, student_id→student_profiles, project_id→projects, rating, comment)
```

---

## 📦 Building for Production

```bash
# Backend JAR
cd backend && mvn clean package -DskipTests
java -jar target/odyssey-backend-1.0.0.jar

# Frontend build
cd frontend && npm run build
# Serve dist/ with Nginx or any static server
```

---

## ☁️ AWS Deployment

| Service | Usage |
|---------|-------|
| EC2 / ECS | Spring Boot backend |
| RDS (PostgreSQL) | Database |
| S3 + CloudFront | React frontend |
| ALB | Load balancing |
| Secrets Manager | JWT secret, Razorpay keys |

Set environment variables in ECS task definition or EC2 `application.properties`.

---

## 🔮 Bonus Features Roadmap

- [ ] Email notifications (Spring Mail – config ready)
- [ ] AI-enhanced matching using OpenAI embeddings
- [ ] Real-time notifications (WebSockets)
- [ ] Student skill assessment tests
- [ ] Multi-file resume upload (S3)
- [ ] Company dashboard analytics charts
- [ ] College bulk student import (CSV)

---

## 📄 License

MIT License – Built with ❤️ for the future of student employment.
