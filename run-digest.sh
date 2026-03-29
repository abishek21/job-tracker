#!/bin/bash
# Job Digest Runner - calls the Node.js email script
# Runs at 8am and 6pm Dublin time

cd /Users/abishek/.openclaw/workspace/job-tracker

# Run the job search and email
node -e "
const { sendJobDigest } = require('./send-email.js');

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

sendJobDigest(jobsByCategory, searchLinks)
  .then(() => console.log('Job digest sent successfully'))
  .catch(err => console.error('Failed to send:', err.message));
"
