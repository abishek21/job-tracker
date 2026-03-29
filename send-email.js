#!/usr/bin/env node
// Job Digest Email Sender - Sectioned by Role

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'email-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: config.smtp.auth
});

async function sendJobDigest(jobsByCategory, searchLinks) {
  const today = new Date().toLocaleDateString('en-IE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Build sections for each category
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
    from: config.from,
    to: config.to,
    subject: `${config.subject_prefix} — ${today}`,
    html: html
  });

  console.log('Email sent:', info.messageId);
  return info;
}

module.exports = { sendJobDigest };
