#!/usr/bin/env node
// Cloud-based Job Digest Sender (GitHub Actions)

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

async function sendJobDigest() {
  const today = new Date().toLocaleDateString('en-IE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const jobsByCategory = {
    '📊 Account Executive / Media': [
      { title: 'Account Manager, SMB, UKI', company: 'Meta', location: 'Dublin', posted: 'Recent', link: 'https://www.metacareers.com/jobs/?q=account%20manager&location=Dublin' },
      { title: 'Account Executive', company: 'WPP Media', location: 'Dublin', posted: 'Recent', link: 'https://www.wpp.com/careers' },
      { title: 'Account Executive - Small Business', company: 'HubSpot', location: 'Dublin (Hybrid)', posted: 'Recent', link: 'https://www.hubspot.com/careers/jobs?page=1&locations=Dublin' },
      { title: 'Account Executive', company: 'Docusign', location: 'Dublin', posted: 'Recent', link: 'https://careers.docusign.com/jobs?location=Dublin' },
      { title: 'Account Executive, Uber Eats', company: 'Uber', location: 'Dublin', posted: 'Recent', link: 'https://www.uber.com/us/en/careers/list/?location=IRL-Dublin' }
    ],
    '💻 Software Sales': [
      { title: 'Account Manager, Shopping Solutions', company: 'Google', location: 'Dublin', posted: 'Recent', link: 'https://careers.google.com/jobs/results/?location=Dublin,%20Ireland&q=Account%20Manager' },
      { title: 'Account Executive', company: 'Salesforce', location: 'Dublin', posted: 'Multiple', link: 'https://careers.salesforce.com/en/jobs/?search=account+executive&location=Dublin' },
      { title: 'Sales Development Rep', company: 'Microsoft', location: 'Dublin', posted: 'Multiple', link: 'https://careers.microsoft.com/us/en/search-results?keywords=sales&location=Dublin,%20Ireland' },
      { title: 'Account Executive', company: 'Zendesk', location: 'Dublin', posted: 'Recent', link: 'https://jobs.zendesk.com/us/en/search-results?keywords=account%20executive&location=Dublin' },
      { title: 'Account Executive', company: 'Toast', location: 'Dublin', posted: 'Recent', link: 'https://careers.toasttab.com/jobs?location=Dublin' }
    ],
    '📱 Digital Marketing': [
      { title: 'Digital Marketing Executive', company: 'Various', location: 'Dublin', posted: 'Recent', link: 'https://www.linkedin.com/jobs/search/?keywords=Digital%20Marketing%20Executive&location=Dublin' },
      { title: 'Social Media Manager', company: 'Various', location: 'Dublin', posted: 'Recent', link: 'https://ie.indeed.com/jobs?q=social+media+manager&l=Dublin' },
      { title: 'Marketing Associate', company: 'Various', location: 'Dublin', posted: 'Recent', link: 'https://ie.indeed.com/jobs?q=marketing+entry+level&l=Dublin' }
    ],
    '📢 Communications': [
      { title: 'Communications Executive', company: 'Various', location: 'Dublin', posted: 'Recent', link: 'https://www.linkedin.com/jobs/search/?keywords=Communications%20Executive&location=Dublin' },
      { title: 'PR & Comms Coordinator', company: 'Various', location: 'Dublin', posted: 'Recent', link: 'https://ie.indeed.com/jobs?q=communications+coordinator&l=Dublin' }
    ]
  };

  const searchLinks = {
    'LinkedIn Account Exec': 'https://www.linkedin.com/jobs/search/?keywords=Account%20Executive&location=Dublin%2C%20Ireland&f_E=2%2C3',
    'LinkedIn Software Sales': 'https://www.linkedin.com/jobs/search/?keywords=Software%20Sales&location=Dublin%2C%20Ireland',
    'LinkedIn Digital Marketing': 'https://www.linkedin.com/jobs/search/?keywords=Digital%20Marketing&location=Dublin%2C%20Ireland',
    'Indeed Dublin': 'https://ie.indeed.com/jobs?q=account+executive&l=Dublin',
    'Salesforce Careers': 'https://careers.salesforce.com/en/jobs/?location=Dublin',
    'Microsoft Careers': 'https://careers.microsoft.com/us/en/search-results?location=Dublin',
    'Meta Careers': 'https://www.metacareers.com/jobs/?offices[0]=Dublin%2C%20Ireland',
    'Google Careers': 'https://careers.google.com/jobs/results/?location=Dublin,%20Ireland'
  };

  // Build HTML
  const sectionsHtml = Object.entries(jobsByCategory).map(([category, jobs]) => {
    const jobListHtml = jobs.map(job => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <a href="${job.link}" style="color: #1a73e8; text-decoration: none; font-weight: 600; font-size: 15px;">${job.title}</a><br>
          <span style="color: #202124;">🏢 ${job.company}</span> · <span style="color: #5f6368;">📍 ${job.location}</span><br>
          <span style="color: #80868b; font-size: 12px;">⏰ ${job.posted}</span>
        </td>
      </tr>
    `).join('');

    return `
      <div style="margin-bottom: 24px;">
        <h2 style="color: #202124; font-size: 16px; margin: 0 0 12px 0; padding: 8px 12px; background: #f8f9fa; border-radius: 8px;">${category}</h2>
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
      </div>
      
      <div style="background: white; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
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
          Sent with ❤️ by Abishek's AI Assistant<br>
          <em>Target: Dublin | Entry & Mid Level | Remote/Hybrid OK</em>
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
