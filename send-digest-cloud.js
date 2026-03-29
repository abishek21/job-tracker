#!/usr/bin/env node
// Job Digest Sender - Curated + Live Jobs

const nodemailer = require('nodemailer');
const https = require('https');

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// ============================================
// CURATED JOBS - The good stuff you liked!
// ============================================
const curatedJobs = {
  '📊 Account Executive / Media': [
    { 
      title: 'Account Manager, SMB - UKI', 
      company: 'Meta', 
      location: 'Dublin', 
      link: 'https://www.metacareers.com/jobs/?q=account%20manager&location=Dublin',
      posted: 'Check latest'
    },
    { 
      title: 'Account Executive - Small Business', 
      company: 'HubSpot', 
      location: 'Dublin (Hybrid)', 
      link: 'https://www.hubspot.com/careers/jobs?page=1&locations=Dublin&teams=sales',
      posted: 'Check latest'
    },
    { 
      title: 'Account Executive', 
      company: 'Docusign', 
      location: 'Dublin', 
      link: 'https://careers.docusign.com/jobs?location=Dublin&department=Sales',
      posted: 'Check latest'
    },
    { 
      title: 'Account Executive, Uber Eats', 
      company: 'Uber', 
      location: 'Dublin', 
      link: 'https://www.uber.com/us/en/careers/list/?location=IRL-Dublin&department=Sales%20%26%20Account%20Management',
      posted: 'Check latest'
    },
    { 
      title: 'Media Account Executive', 
      company: 'WPP / GroupM', 
      location: 'Dublin', 
      link: 'https://www.wpp.com/careers?location=Dublin',
      posted: 'Check latest'
    }
  ],
  
  '💻 Software / Tech Sales': [
    { 
      title: 'Account Executive', 
      company: 'Salesforce', 
      location: 'Dublin', 
      link: 'https://careers.salesforce.com/en/jobs/?search=account+executive&location=Dublin&pagesize=20',
      posted: 'Multiple roles'
    },
    { 
      title: 'Account Manager, Shopping Solutions', 
      company: 'Google', 
      location: 'Dublin', 
      link: 'https://careers.google.com/jobs/results/?location=Dublin,%20Ireland&q=Account',
      posted: 'Check latest'
    },
    { 
      title: 'Sales Development Representative', 
      company: 'Microsoft', 
      location: 'Dublin', 
      link: 'https://careers.microsoft.com/us/en/search-results?keywords=sales&location=Dublin,%20Ireland',
      posted: 'Multiple roles'
    },
    { 
      title: 'Account Executive', 
      company: 'Zendesk', 
      location: 'Dublin', 
      link: 'https://jobs.zendesk.com/us/en/search-results?keywords=account%20executive&location=Dublin',
      posted: 'Check latest'
    },
    { 
      title: 'Sales Representative', 
      company: 'PandaDoc', 
      location: 'Dublin (Remote OK)', 
      link: 'https://www.pandadoc.com/careers/?department=sales',
      posted: 'Check latest'
    },
    { 
      title: 'Account Executive', 
      company: 'Sojern', 
      location: 'Dublin', 
      link: 'https://www.sojern.com/company/careers/',
      posted: 'Check latest'
    }
  ],
  
  '📱 Digital Marketing': [
    { 
      title: 'Digital Marketing Manager', 
      company: 'Various', 
      location: 'Dublin', 
      link: 'https://www.linkedin.com/jobs/search/?keywords=Digital%20Marketing%20Manager&location=Dublin%2C%20Ireland&f_E=2%2C3',
      posted: 'LinkedIn Search'
    },
    { 
      title: 'Social Media Manager', 
      company: 'Various', 
      location: 'Dublin', 
      link: 'https://ie.indeed.com/jobs?q=social+media+manager&l=Dublin',
      posted: 'Indeed Search'
    },
    { 
      title: 'Marketing Executive', 
      company: 'Various', 
      location: 'Dublin', 
      link: 'https://www.irishjobs.ie/jobs/marketing/in-dublin',
      posted: 'IrishJobs Search'
    },
    { 
      title: 'Performance Marketing', 
      company: 'Meta', 
      location: 'Dublin', 
      link: 'https://www.metacareers.com/jobs/?q=marketing&location=Dublin',
      posted: 'Check latest'
    },
    { 
      title: 'Marketing Roles', 
      company: 'HubSpot', 
      location: 'Dublin', 
      link: 'https://www.hubspot.com/careers/jobs?page=1&locations=Dublin&teams=marketing',
      posted: 'Check latest'
    }
  ],
  
  '📢 Communications / PR': [
    { 
      title: 'Communications Manager', 
      company: 'Various', 
      location: 'Dublin', 
      link: 'https://www.linkedin.com/jobs/search/?keywords=Communications%20Manager&location=Dublin%2C%20Ireland&f_E=2%2C3',
      posted: 'LinkedIn Search'
    },
    { 
      title: 'PR & Communications', 
      company: 'Various', 
      location: 'Dublin', 
      link: 'https://ie.indeed.com/jobs?q=communications+PR&l=Dublin',
      posted: 'Indeed Search'
    },
    { 
      title: 'Corporate Communications', 
      company: 'Google', 
      location: 'Dublin', 
      link: 'https://careers.google.com/jobs/results/?location=Dublin,%20Ireland&q=communications',
      posted: 'Check latest'
    },
    { 
      title: 'Communications Roles', 
      company: 'Meta', 
      location: 'Dublin', 
      link: 'https://www.metacareers.com/jobs/?q=communications&location=Dublin',
      posted: 'Check latest'
    }
  ]
};

// Quick search links
const searchLinks = {
  'LinkedIn Account Exec': 'https://www.linkedin.com/jobs/search/?keywords=Account%20Executive&location=Dublin%2C%20Ireland&f_E=2%2C3',
  'LinkedIn Software Sales': 'https://www.linkedin.com/jobs/search/?keywords=Software%20Sales&location=Dublin%2C%20Ireland&f_E=2%2C3',
  'LinkedIn Marketing': 'https://www.linkedin.com/jobs/search/?keywords=Digital%20Marketing&location=Dublin%2C%20Ireland&f_E=2%2C3',
  'Indeed Dublin': 'https://ie.indeed.com/jobs?q=account+executive&l=Dublin',
  'IrishJobs': 'https://www.irishjobs.ie/jobs/sales/in-dublin',
  'Glassdoor': 'https://www.glassdoor.ie/Job/dublin-account-executive-jobs-SRCH_IL.0,6_IC2739035_KO7,24.htm',
  'Jobs.ie': 'https://www.jobs.ie/jobs/dublin/sales/'
};

// Try Adzuna for bonus live jobs (optional)
function searchAdzuna(query) {
  return new Promise((resolve) => {
    if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
      resolve([]);
      return;
    }
    
    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: 5,
      what: query,
      where: 'Dublin',
      sort_by: 'date',
      max_days_old: 7
    });
    
    const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?${params}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const jobs = (json.results || []).map(job => ({
            title: job.title,
            company: job.company?.display_name || 'Company',
            location: job.location?.display_name || 'Dublin',
            posted: new Date(job.created).toLocaleDateString('en-IE'),
            link: job.redirect_url,
            salary: job.salary_min ? `€${Math.round(job.salary_min/1000)}k-${Math.round(job.salary_max/1000)}k` : null,
            isLive: true
          }));
          resolve(jobs);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function sendJobDigest() {
  const today = new Date().toLocaleDateString('en-IE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  console.log('🎯 Building job digest for Revathi...');
  
  // Try to get some live jobs from Adzuna (bonus)
  console.log('🔍 Checking Adzuna for live jobs...');
  const liveJobs = await searchAdzuna('Account Executive Sales Marketing');
  console.log(`  Found ${liveJobs.length} live jobs from Adzuna`);
  
  // Count total curated jobs
  const totalCurated = Object.values(curatedJobs).reduce((sum, jobs) => sum + jobs.length, 0);
  console.log(`📋 ${totalCurated} curated job links`);

  // Build HTML sections for curated jobs
  const sectionsHtml = Object.entries(curatedJobs).map(([category, jobs]) => {
    const jobListHtml = jobs.map(job => `
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #eee;">
          <a href="${job.link}" style="color: #1a73e8; text-decoration: none; font-weight: 600; font-size: 15px;">${job.title}</a><br>
          <span style="color: #202124;">🏢 ${job.company}</span> · <span style="color: #5f6368;">📍 ${job.location}</span><br>
          <span style="color: #80868b; font-size: 12px;">📅 ${job.posted}</span>
        </td>
      </tr>
    `).join('');

    return `
      <div style="margin-bottom: 28px;">
        <h2 style="color: #202124; font-size: 16px; margin: 0 0 12px 0; padding: 10px 14px; background: linear-gradient(90deg, #f0f4ff 0%, #f8f9fa 100%); border-radius: 8px; border-left: 4px solid #667eea;">${category}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${jobListHtml}
        </table>
      </div>
    `;
  }).join('');
  
  // Live jobs section (if any)
  let liveJobsHtml = '';
  if (liveJobs.length > 0) {
    const liveJobsList = liveJobs.map(job => `
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #eee;">
          <a href="${job.link}" style="color: #1a73e8; text-decoration: none; font-weight: 600; font-size: 15px;">${job.title}</a>
          <span style="background: #10b981; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">NEW</span><br>
          <span style="color: #202124;">🏢 ${job.company}</span> · <span style="color: #5f6368;">📍 ${job.location}</span><br>
          <span style="color: #80868b; font-size: 12px;">📅 Posted: ${job.posted}</span>
          ${job.salary ? ` · <span style="color: #137333; font-size: 12px;">💰 ${job.salary}</span>` : ''}
        </td>
      </tr>
    `).join('');
    
    liveJobsHtml = `
      <div style="margin-bottom: 28px;">
        <h2 style="color: #202124; font-size: 16px; margin: 0 0 12px 0; padding: 10px 14px; background: linear-gradient(90deg, #ecfdf5 0%, #f8f9fa 100%); border-radius: 8px; border-left: 4px solid #10b981;">🟢 Fresh This Week (Live)</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${liveJobsList}
        </table>
      </div>
    `;
  }

  const searchLinksHtml = Object.entries(searchLinks).map(([name, url]) => 
    `<a href="${url}" style="display: inline-block; margin: 4px 8px 4px 0; padding: 8px 16px; background: #e8f0fe; border-radius: 20px; color: #1a73e8; text-decoration: none; font-size: 13px;">${name}</a>`
  ).join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🎯 Job Digest for Revathi</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${today}</p>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0 0; font-size: 14px;">
          📋 ${totalCurated} opportunities across ${Object.keys(curatedJobs).length} categories
        </p>
      </div>
      
      <div style="background: white; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
        ${liveJobsHtml}
        ${sectionsHtml}
        
        <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #f1f3f4;">
          <h3 style="color: #202124; font-size: 14px; margin: 0 0 12px 0;">🔍 Quick Search Links</h3>
          <div>
            ${searchLinksHtml}
          </div>
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 16px 24px; border-radius: 0 0 12px 12px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="color: #5f6368; font-size: 12px; margin: 0;">
          💡 <strong>Tip:</strong> Click company links to see their latest Dublin openings<br>
          🎯 Target: Dublin | Entry & Mid Level | Remote/Hybrid OK<br>
          Sent with ❤️ by Abishek's AI Assistant
        </p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `Abishek <${process.env.GMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `🎯 Job Digest for Revathi — ${today}`,
    html: html
  });

  console.log('✅ Email sent:', info.messageId);
}

sendJobDigest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  });
