# Revathi's Job Hunt

## 📁 Folder Structure

```
job-tracker/
├── README.md           ← You are here
├── config.json         ← Target roles, companies, schedule
├── email-config.json   ← Gmail SMTP settings (don't share!)
├── send-email.js       ← Email sender script
├── run-digest.sh       ← Cron job runner
│
├── revathi/            ← Revathi's profile & documents
│   ├── PROFILE.md      ← Skills, experience, preferences
│   ├── RESUME.md       ← Resume content (for AI to reference)
│   └── COVER_LETTER.md ← Cover letter template
│
└── companies/          ← Company-specific notes
    ├── _TEMPLATE.md    ← Template for new companies
    ├── salesforce.md
    ├── microsoft.md
    ├── meta.md
    └── ... (add more!)
```

## 🎯 Target Roles
- Media Account Executive
- Software Sales Specialist
- Communications Account Executive
- Digital Marketing

## 📍 Location
Dublin, Ireland (Remote/Hybrid OK)

## 📅 Schedule
- **8:00 AM** — Morning digest email
- **6:00 PM** — Evening digest email

## ✏️ How to Edit

1. **Open in VS Code:**
   ```bash
   code /Users/abishek/.openclaw/workspace/job-tracker
   ```

2. **Add Revathi's info:** Edit files in `revathi/` folder

3. **Add companies:** Create new `.md` files in `companies/` folder

4. **Update config:** Edit `config.json` to add career URLs

The AI assistant reads these files and can use them for personalized job matching!
