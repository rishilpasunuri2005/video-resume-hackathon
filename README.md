# VidHire - Video Resume Hiring Platform

**Hackathon Project - Code #03**

A comprehensive video-first hiring platform that solves the problem of traditional resumes failing to represent communication skills, confidence, personality, and practical abilities of candidates.

## 🎯 Problem Statement

Traditional resumes fail to represent communication skills, confidence, personality, and practical abilities of candidates. Recruiters spend significant time screening profiles with limited context, increasing hiring effort and reducing matching quality. Candidates also struggle to differentiate themselves in competitive job markets. A video-first hiring ecosystem can improve candidate visibility and recruiter efficiency.

## ✨ Key Features Implemented

### 🔐 **Authentication System**
- **Login/Signup** with role-based access (Candidate/Recruiter)
- Separate dashboards for candidates and recruiters
- Session management with localStorage
- Demo accounts for quick testing

### 👤 **For Candidates**

#### Profile Builder
- Personal information (name, role, experience, location)
- **Education details**
- **Work experience timeline**
- Skills portfolio with tags
- Portfolio links (GitHub, personal website)
- Resume text summary
- **PDF resume upload**
- **Video resume upload** or **browser-based recording**

#### Job Discovery
- Browse all open positions
- Search jobs by title, company, or skills
- View job descriptions and required skills
- **Apply to jobs with one click**
- Track application status

#### Application Tracking
- View all submitted applications
- See current status (Applied, Shortlisted, Interview, Offer)
- Application timeline with dates
- Quick access to recruiter conversations

#### Messaging System
- **Real-time chat** with recruiters
- Conversation history
- Automatic welcome messages on application
- Message timestamps

### 🏢 **For Recruiters**

#### Job Posting
- Create job listings with title, company, skills
- Detailed job descriptions
- Automatic candidate matching

#### Candidate Search
- **AI-powered match scoring** (improved algorithm)
- Search by skills, role, or name
- View candidate profiles with video resumes
- Match percentage for each candidate

#### Candidate Review
- Detailed profile view with video playback
- AI-generated fit summary
- **Suggested interview questions** based on profile
- Skills visualization

#### Hiring Pipeline
- Kanban-style board (Applied → Shortlisted → Interview → Offer)
- Drag candidates through stages
- Interview scheduling
- Pipeline analytics

#### Messaging System
- Chat with candidates
- Manage multiple conversations
- Quick responses

### 🤖 **AI Features**

1. **Smart Skill Extraction**
   - Parse resume text to extract skills
   - Merge with manually entered skills
   - Keyword-based matching

2. **Candidate Summarization**
   - Auto-generate profile summaries
   - Highlight key strengths
   - Experience-based insights

3. **Match Scoring Algorithm**
   - Skill overlap calculation (70% weight)
   - Video resume bonus (+12 points)
   - Profile completeness bonus (+11 points)
   - Portfolio bonus (+7 points)
   - Maximum score: 98%

4. **Interview Question Generation**
   - Role-specific questions
   - Skill-based inquiries
   - Communication assessment prompts

### 📹 **Video Features**

- **Upload video files** (MP4, WebM, etc.)
- **Browser-based recording** using MediaRecorder API
- Live camera preview during recording
- Video playback in candidate profiles
- Temporary blob storage for demo

## 🚀 What's New (Hackathon Additions)

✅ **Authentication & Authorization** - Role-based access control  
✅ **Job Discovery** - Candidates can browse and search jobs  
✅ **Application System** - One-click apply with tracking  
✅ **Enhanced Profile** - Education and work experience fields  
✅ **Messaging System** - Real-time candidate-recruiter chat  
✅ **Better AI Matching** - Improved scoring algorithm  
✅ **Application Tracking** - Candidate-side status view  
✅ **Multiple Jobs** - 3 sample jobs for demo  

## 📊 Demo Flow

### As a Candidate:
1. **Sign up** as a candidate
2. **Complete your profile** with skills, education, experience
3. **Upload or record** a video resume
4. **Browse jobs** and apply to positions
5. **Track applications** and see status updates
6. **Chat with recruiters** about opportunities

### As a Recruiter:
1. **Sign up** as a recruiter
2. **Post a job** with required skills
3. **Review candidates** sorted by AI match score
4. **Watch video resumes** to assess communication
5. **Shortlist candidates** and move through pipeline
6. **Schedule interviews** and chat with candidates

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js (built-in HTTP server)
- **Storage**: JSON file + localStorage
- **Video**: MediaRecorder API, Blob URLs
- **No external dependencies** - Pure Node.js

## 📦 Installation & Setup

```bash
# No installation required!
# Just start the server:
npm start

# Open in browser:
http://localhost:5174
```

## 🎮 Demo Accounts

**Candidate:**
- Email: `candidate@demo.com`
- Password: `demo123`

**Recruiter:**
- Email: `recruiter@demo.com`  
- Password: `demo123`

**Or create any account** - all credentials work for demo!

## 📁 Project Structure

```
video-resume-hackathon/
├── index.html          # Main UI with all views
├── styles.css          # Complete styling
├── app.js              # Frontend logic (auth, jobs, chat, etc.)
├── server.js           # Backend API
├── data/
│   └── db.json         # Persistent storage
└── package.json        # Project metadata
```

## 🔌 API Endpoints

```
GET    /api/health              # Health check
GET    /api/state               # Get all data
PUT    /api/state               # Update all data
POST   /api/reset               # Reset to seed data
POST   /api/candidates          # Create candidate
POST   /api/jobs                # Create job
POST   /api/interviews          # Schedule interview
PATCH  /api/candidates/:id/stage # Update candidate stage
POST   /api/parse-skills        # Extract skills from text
```

## 🎨 Key UI Components

- **Login Screen** - Tabbed login/signup interface
- **Dashboard** - Metrics and top matches
- **Jobs Grid** - Card-based job listings
- **Applications List** - Status tracking
- **Messages** - Split-pane chat interface
- **Pipeline Board** - Kanban-style hiring stages
- **Profile Dialog** - Modal with video playback

## 🔮 Future Enhancements

### High Priority
- [ ] Real KYC/Identity verification (Aadhaar, PAN)
- [ ] Cloud video storage (AWS S3, Cloudinary)
- [ ] Real PDF parsing (extract structured data)
- [ ] Real AI integration (OpenAI, Anthropic)
- [ ] Virtual interview rooms (Zoom, Google Meet)
- [ ] Email notifications (SendGrid)

### Medium Priority
- [ ] Calendar integration (Google Calendar)
- [ ] Advanced search filters
- [ ] Skill endorsements
- [ ] Company verification
- [ ] Analytics dashboard
- [ ] Mobile responsive design

### Nice to Have
- [ ] Video transcription (speech-to-text)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export reports
- [ ] Bulk operations

## 🏆 Hackathon Highlights

1. **Complete Authentication** - Secure role-based access
2. **Full Candidate Journey** - Profile → Browse → Apply → Track → Chat
3. **Full Recruiter Journey** - Post → Search → Review → Pipeline → Chat
4. **Real-time Messaging** - Bidirectional communication
5. **Smart Matching** - AI-powered candidate scoring
6. **Video Integration** - Upload + Record capabilities
7. **Clean UI/UX** - Professional, intuitive interface
8. **Zero Dependencies** - Pure Node.js backend

## 📝 Notes

- **Video storage**: Currently uses blob URLs (temporary). In production, integrate cloud storage.
- **AI features**: Currently simulated. In production, integrate real AI APIs.
- **Authentication**: Demo mode accepts any credentials. In production, add proper password hashing and JWT.
- **Database**: Uses JSON file. In production, migrate to PostgreSQL/MongoDB.

## 🤝 Contributing

This is a hackathon project. For production use, implement:
- Proper authentication (bcrypt, JWT)
- Database (PostgreSQL, MongoDB)
- Cloud storage (AWS S3)
- Real AI APIs
- Security best practices

## 📄 License

MIT License - Hackathon Project

---

**Built for Hackathon Code #03**  
*Improving candidate visibility and recruiter efficiency through rich media context*
