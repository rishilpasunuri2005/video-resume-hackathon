# 🚀 Quick Start Guide - VidHire

## ⚡ 30-Second Setup

```bash
# 1. Start the server
npm start

# 2. Open browser
http://localhost:5174

# 3. Done! No installation needed.
```

## 🎮 Test Accounts

### Candidate Account
```
Email: candidate@demo.com
Password: demo123
Role: Candidate
```

### Recruiter Account
```
Email: recruiter@demo.com
Password: demo123
Role: Recruiter
```

### Or Create New Account
- Any email works (demo mode)
- Any password works
- Choose your role

## 🎯 5-Minute Test Flow

### As Candidate (2 minutes)

1. **Sign up** → Use any email + "Candidate" role
2. **My Profile** → Fill in details, add skills
3. **Upload/Record Video** → Try browser recording!
4. **Jobs** → Browse and apply to "Full Stack Developer"
5. **Applications** → See your application status
6. **Messages** → Check recruiter conversation

### As Recruiter (2 minutes)

1. **Logout** → Click logout button
2. **Login** → Use `recruiter@demo.com` / `demo123`
3. **Dashboard** → See AI-matched candidates
4. **Recruiter** → View candidates sorted by match %
5. **Click "View Profile"** → Watch video resume
6. **Pipeline** → Move candidates through stages
7. **Messages** → Chat with candidates

### Test AI Features (1 minute)

1. Go to **My Profile** (as candidate)
2. Enter resume text in "Resume summary"
3. Click **"Parse Skills"** → Watch AI extract skills
4. See **AI-generated summary** in preview
5. As recruiter, see **match scores** and **interview questions**

## 🎬 Video Features to Test

### Upload Video
1. Go to "My Profile"
2. Click "Choose File" under "Video resume"
3. Select any video file (MP4, WebM, etc.)
4. See preview on right side

### Record Video
1. Go to "My Profile"
2. Click **"Record"** button
3. Allow camera access
4. See live preview
5. Click **"Stop"** when done
6. Video saved automatically!

## 📱 Key Features to Explore

### ✅ Must-Try Features

- [ ] **Sign up with different roles** (Candidate vs Recruiter)
- [ ] **Record a video** using browser
- [ ] **Apply to a job** and see instant status
- [ ] **Send a message** in chat
- [ ] **View AI match scores** (percentage on each candidate)
- [ ] **Move candidate in pipeline** (drag through stages)
- [ ] **Parse skills** from resume text
- [ ] **Search jobs** by keyword
- [ ] **Schedule interview** from candidate profile

### 🎨 UI Elements to Notice

- **Role-based navigation** - Different menus for candidates/recruiters
- **Status pills** - Color-coded application states
- **Match percentages** - AI scoring on every candidate
- **Video previews** - Inline playback
- **Real-time updates** - Messages appear instantly
- **Kanban board** - Visual pipeline management

## 🔧 Troubleshooting

### Server won't start?
```bash
# Kill existing process
Get-Process -Name node | Stop-Process -Force

# Start again
npm start
```

### Camera not working?
- Check browser permissions
- Use Chrome/Edge (best support)
- Or just upload a video file instead

### Data looks weird?
```bash
# Reset to fresh state
# In browser: Click "Reset" button on dashboard
# Or delete data/db.json and restart server
```

### Port 5174 in use?
```bash
# Change port in server.js
const PORT = 5175;  # Use different port
```

## 📊 Sample Data Included

### 3 Candidates
- Aarav Mehta (Frontend Developer) - Shortlisted
- Maya Nair (Full Stack Developer) - Applied
- Rhea Kapoor (Product Designer) - Interview

### 3 Jobs
- Frontend Developer Intern @ NovaHire Labs
- Full Stack Developer @ TechVentures Inc
- UI/UX Designer @ DesignHub

### Try These Scenarios

1. **Apply as new candidate** → See match score
2. **Search for "React"** → Find matching candidates
3. **Move candidate to "Offer"** → See pipeline update
4. **Chat with recruiter** → Test messaging
5. **Schedule interview** → See calendar entry

## 🎯 What to Look For

### Technical Excellence
- ✅ Clean, professional UI
- ✅ Smooth navigation
- ✅ No errors in console
- ✅ Fast load times
- ✅ Responsive interactions

### Feature Completeness
- ✅ End-to-end candidate journey
- ✅ End-to-end recruiter journey
- ✅ Video upload AND recording
- ✅ Real-time messaging
- ✅ AI-powered matching

### Innovation
- ✅ Video-first approach (not just an add-on)
- ✅ Browser-based recording (no external tools)
- ✅ Explainable AI (shows WHY candidates match)
- ✅ Complete ecosystem (not just one feature)

## 📝 Evaluation Criteria

### Problem Solving (25 points)
- Does it solve the stated problem?
- Is the solution practical?
- Does it address recruiter AND candidate pain points?

### Technical Implementation (25 points)
- Does everything work?
- Is the code clean?
- Are there any bugs?

### User Experience (25 points)
- Is it intuitive?
- Is it visually appealing?
- Is the flow logical?

### Innovation (25 points)
- Is it unique?
- Does it use technology creatively?
- Is there a "wow" factor?

## 🏆 Scoring Guide

### Excellent (90-100)
- All features work flawlessly
- Professional UI/UX
- Clear innovation
- Complete user journeys

### Good (75-89)
- Most features work
- Clean interface
- Solves the problem
- Some rough edges

### Average (60-74)
- Basic features work
- Functional but not polished
- Incomplete flows

### Needs Work (<60)
- Major bugs
- Incomplete features
- Poor UX

## 💡 Pro Tips for Reviewers

1. **Test both roles** - Candidate AND Recruiter experiences
2. **Try the video recording** - It's the coolest feature!
3. **Check the AI matching** - See how scores are calculated
4. **Send a message** - Test real-time chat
5. **Look at the code** - Clean, well-structured
6. **Read the README** - Comprehensive documentation

## 📞 Support

### If something breaks:
1. Check browser console for errors
2. Refresh the page
3. Click "Reset" button to restore demo data
4. Restart the server

### For questions:
- Check README.md for detailed docs
- Check DEMO_GUIDE.md for presentation flow
- Check FEATURES_CHECKLIST.md for implementation status

## ⏱️ Time Estimates

- **Quick test**: 5 minutes
- **Thorough review**: 15 minutes
- **Full evaluation**: 30 minutes
- **Code review**: 45 minutes

## 🎬 Ready to Start?

```bash
npm start
```

Then open: **http://localhost:5174**

**Enjoy exploring VidHire!** 🚀

---

**Questions?** Check the other documentation files or just explore - it's intuitive! 😊
