#!/usr/bin/env node
// Cloud-based Job Digest Sender with LIVE Adzuna API + Curated Company Links

const nodemailer = require('nodemailer');
const https = require('https');

// Adzuna API config
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const ADZUNA_COUNTRY = 'gb'; // UK (includes Ireland jobs)

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Curated company career pages (always included)
const curatedJobs = {
  '🏢 Target Companies': [
    { title: 'Careers at Meta', company: 'Meta', location: 'Dublin', link: 'https://www.metacareers.com/jobs/?offices[0]=Dublin%2C%20Ireland', posted: 'Multiple openings' },
    { title: 'Careers at Google', company: 'Google', location: 'Dublin', link: 'https://careers.google.com/jobs/results/?location=Dublin,%20Ireland', posted: 'Multiple openings' },
    { title: 'Careers at Salesforce', company: 'Salesforce', location: 'Dublin', link: 'https://careers.salesforce.com/en/jobs/?location=Dublin', posted: 'Multiple openings' },
    { title: 'Careers at Microsoft', company: 'Microsoft', location: 'Dublin', link: 'https://careers.microsoft.com/us/en/search-results?location=Dublin,%20Ireland', posted: 'Multiple openings' },
    { title: 'Careers at HubSpot', company: 'HubSpot', location: 'Dublin', link: 'https://www.hubspot.com/careers/jobs?page=1&locations=Dublin', posted: 'Multiple openings' },
    { title: 'Careers at WPP', company: 'WPP', location: 'Dublin', link: 'https://www.wpp.com/careers', posted: 'Multiple openings' },
    { title: 'Careers at Toast', company: 'Toast', location: 'Dublin', link: 'https://careers.toasttab.com/', posted: 'Check for Dublin roles' }
  ]
};

// Search Adzuna for jobs
function searchJobs(query, category = '') {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: 8,
      what: query,
      where: 'Dublin Ireland',
      sort_by: 'date',
      max_days_old: 14
    });
    
    const url = `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/1?${params}`;
    console.log(`  Searching: ${query}...`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`  Response status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`  Results count: ${json.count || 0}`);
          if (json.error) {
            console.log(`  ❌ API Error: ${json.error}`);
            resolve({ category, jobs: [] });
            return;
          }
          const jobs = (json.results || []).map(job => ({
            title: job.title,
            company: job.company?.display_name || 'Company',
            location: job.location?.display_name || 'Dublin',
            posted: new Date(job.created).toLocaleDateString('en-IE'),
            link: job.redirect_url,
            salary: job.salary_min ? `€${Math.round(job.salary_min/1000)}k - €${Math.round(job.salary_max/1000)}k` : null,
            isLive: true
          }));
          resolve({ category, jobs });
        } catch (e) {
          console.log(`  ❌ Parse error: ${e.message}`);
          resolve({ category, jobs: [] });
        }
      });
    }).on('error', (e) => {
      console.log(`  ❌ Network error: ${e.message}`);
      resolve({ category, jobs: [] });
    });
  });
}

async function sendJobDigest() {
  const today = new Date().toLocaleDateString('en-IE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  console.log('🔍 Searching for live jobs via Adzuna...');
  console.log(`  API ID: ${ADZUNA_APP_ID ? 'Set ✓' : 'MISSING ❌'}`);
  console.log(`  API Key: ${ADZUNA_API_KEY ? 'Set ✓' : 'MISSING ❌'}`);
  
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  
  // Search for each role category
  const searches = [];
  const queries = [
    ['Account Executive Dublin', '📊 Account Executive (Live)'],
    ['Sales Executive Dublin', '💼 Sales (Live)'],
    ['Digital Marketing Dublin', '📱 Digital Marketing (Live)'],
    ['Communications Dublin', '📢 Communications (Live)']
  ];
  
  for (const [query, category] of queries) {
    const result = await searchJobs(query, category);
    searches.push(result);
    await delay(1500);
  }

  // Build jobs by category
  const jobsByCategory = {};
  let totalLiveJobs = 0;
  
  for (const { category, jobs } of searches) {
    if (jobs.length > 0) {
      jobsByCategory[category] = jobs;
      totalLiveJobs += jobs.length;
      console.log(`  ✓ ${category}: ${jobs.length} jobs found`);
    } else {
      console.log(`  ✗ ${category}: No jobs found`);
    }
  }

  // Always add curated company links
  Object.assign(jobsByCategory, curatedJobs);
  
  console.log(`\n📊 Total live jobs: ${totalLiveJobs}`);
  console.log(`📊 Plus ${curatedJobs['🏢 Target Companies'].length} target company links`);

  // Quick search links
  const searchLinks = {
    'LinkedIn Account Exec': 'https://www.linkedin.com/jobs/search/?keywords=Account%20Executive&location=Dublin%2C%20Ireland&f_E=2%2C3',
    'LinkedIn Digital Marketing': 'https://www.linkedin.com/jobs/search/?keywords=Digital%20Marketing&location=Dublin%2C%20Ireland&f_E=2%2C3',
    'Indeed Ireland': 'https://ie.indeed.com/jobs?q=account+executive&l=Dublin',
    'IrishJobs.ie': 'https://www.irishjobs.ie/jobs/account-executive/in-dublin',
    'Glassdoor Dublin': 'https://www.glassdoor.ie/Job/dublin-account-executive-jobs-SRCH_IL.0,6_IC2739035_KO7,24.htm',
    'Jobs.ie': 'https://www.jobs.ie/jobs/dublin/sales/'
  };

  // Build HTML sections
  const sectionsHtml = Object.entries(jobsByCategory).map(([category, jobs]) => {
    const isLiveSection = category.includes('(Live)');
    const borderColor = isLiveSection ? '#10b981' : '#667eea';
    const bgColor = isLiveSection ? 'linear-gradient(90deg, #ecfdf5 0%, #f8f9fa 100%)' : 'linear-gradient(90deg, #f0f4ff 0%, #f8f9fa 100%)';
    
    const jobListHtml = jobs.map(job => `
      <tr>
        <td style="padding: 14px; border-bottom: 1px solid #eee;">
          <a href="${job.link}" style="color: #1a73e8; text-decoration: none; font-weight: 600; font-size: 15px;">${job.title}</a>
          ${job.isLive ? '<span style="background: #10b981; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">LIVE</span>' : ''}
          <br>
          <span style="color: #202124;">🏢 ${job.company}</span> · <span style="color: #5f6368;">📍 ${job.location}</span><br>
          <span style="color: #80868b; font-size: 12px;">📅 ${job.posted}</span>
          ${job.salary ? `<br><span style="color: #137333; font-size: 12px;">💰 ${job.salary}</span>` : ''}
        </td>
      </tr>
    `).join('');

    return `
      <div style="margin-bottom: 28px;">
        <h2 style="color: #202124; font-size: 16px; margin: 0 0 12px 0; padding: 10px 14px; background: ${bgColor}; border-radius: 8px; border-left: 4px solid ${borderColor};">${category}</h2>
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
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0 0; font-size: 14px;">
          ${totalLiveJobs > 0 ? `🟢 ${totalLiveJobs} live jobs` : '📋 Curated opportunities'} + ${curatedJobs['🏢 Target Companies'].length} target companies
        </p>
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
          🟢 <strong>LIVE</strong> = Real-time job listings from Adzuna<br>
          🏢 <strong>Target Companies</strong> = Direct links to company career pages<br>
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
