#!/usr/bin/env node
// Cloud-based Job Digest Sender with LIVE job search via Adzuna API

const nodemailer = require('nodemailer');
const https = require('https');

// Adzuna API config
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const ADZUNA_COUNTRY = 'ie'; // Ireland

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Search Adzuna for jobs
function searchJobs(query, category = '') {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: 10,
      what: query,
      where: 'Dublin',
      sort_by: 'date',
      max_days_old: 14
    });
    
    const url = `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/1?${params}`;
    
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
            salary: job.salary_min ? `€${Math.round(job.salary_min/1000)}k - €${Math.round(job.salary_max/1000)}k` : null
          }));
          resolve({ category, jobs });
        } catch (e) {
          resolve({ category, jobs: [] });
        }
      });
    }).on('error', () => resolve({ category, jobs: [] }));
  });
}

async function sendJobDigest() {
  const today = new Date().toLocaleDateString('en-IE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  console.log('🔍 Searching for live jobs...');
  
  // Search for each role category
  const searches = await Promise.all([
    searchJobs('Account Executive', '📊 Account Executive'),
    searchJobs('Media Account Manager', '📺 Media / Advertising'),
    searchJobs('Software Sales', '💻 Software Sales'),
    searchJobs('Digital Marketing', '📱 Digital Marketing'),
    searchJobs('Communications Executive', '📢 Communications')
  ]);

  // Build jobs by category (only include categories with results)
  const jobsByCategory = {};
  let totalJobs = 0;
  
  for (const { category, jobs } of searches) {
    if (jobs.length > 0) {
      jobsByCategory[category] = jobs;
      totalJobs += jobs.length;
      console.log(`  ✓ ${category}: ${jobs.length} jobs found`);
    } else {
      console.log(`  ✗ ${category}: No jobs found`);
    }
  }

  if (totalJobs === 0) {
    console.log('⚠️ No jobs found today. Skipping email.');
    return;
  }

  // Quick search links (these always work)
  const searchLinks = {
    'LinkedIn Dublin Jobs': 'https://www.linkedin.com/jobs/search/?keywords=Account%20Executive&location=Dublin%2C%20Ireland&f_E=2%2C3',
    'Indeed Ireland': 'https://ie.indeed.com/jobs?q=account+executive&l=Dublin',
    'IrishJobs.ie': 'https://www.irishjobs.ie/jobs/account-executive/in-dublin',
    'Glassdoor Dublin': 'https://www.glassdoor.ie/Job/dublin-account-executive-jobs-SRCH_IL.0,6_IC2739035_KO7,24.htm',
    'Jobs.ie': 'https://www.jobs.ie/jobs/dublin/sales/'
  };

  // Build HTML sections
  const sectionsHtml = Object.entries(jobsByCategory).map(([category, jobs]) => {
    const jobListHtml = jobs.map(job => `
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #eee;">
          <a href="${job.link}" style="color: #1a73e8; text-decoration: none; font-weight: 600; font-size: 15px;">${job.title}</a><br>
          <span style="color: #202124;">🏢 ${job.company}</span> · <span style="color: #5f6368;">📍 ${job.location}</span><br>
          <span style="color: #80868b; font-size: 12px;">📅 Posted: ${job.posted}</span>
          ${job.salary ? `<br><span style="color: #137333; font-size: 12px;">💰 ${job.salary}</span>` : ''}
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

  const searchLinksHtml = Object.entries(searchLinks).map(([name, url]) => 
    `<a href="${url}" style="display: inline-block; margin: 4px 8px 4px 0; padding: 8px 16px; background: #e8f0fe; border-radius: 20px; color: #1a73e8; text-decoration: none; font-size: 13px;">${name}</a>`
  ).join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🎯 Job Digest for Revathi</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${today}</p>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0 0; font-size: 14px;">📍 ${totalJobs} live jobs in Dublin</p>
      </div>
      
      <div style="background: white; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
        ${sectionsHtml}
        
        <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #f1f3f4;">
          <h3 style="color: #202124; font-size: 14px; margin: 0 0 12px 0;">🔍 Explore More Jobs</h3>
          <div>
            ${searchLinksHtml}
          </div>
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 16px 24px; border-radius: 0 0 12px 12px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="color: #5f6368; font-size: 12px; margin: 0;">
          ✨ These are <strong>real, live job listings</strong> from the past 14 days<br>
          Sent with ❤️ by Abishek's AI Assistant
        </p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `Abishek <${process.env.GMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `🎯 ${totalJobs} New Jobs for Revathi — ${today}`,
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
