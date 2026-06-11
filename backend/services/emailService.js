const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email templates mapping
const templates = {
    'Applied': {
        subject: 'Application Received – OppHub',
        message: 'Your application has been received successfully.'
    },
    'Under Review': {
        subject: 'Application Under Review – OppHub',
        message: 'Your application is currently being reviewed by the organization.'
    },
    'Shortlisted': {
        subject: 'You Have Been Shortlisted – OppHub',
        message: 'Congratulations! You have been shortlisted for the next stage.'
    },
    'Interview Scheduled': {
        subject: 'Interview Scheduled – OppHub',
        message: 'Your interview has been scheduled. Further details will be shared soon.'
    },
    'Accepted': {
        subject: 'Application Accepted – OppHub',
        message: 'Congratulations! Your application has been accepted.'
    },
    'Rejected': {
        subject: 'Application Update – OppHub',
        message: 'We appreciate your interest. Unfortunately, you were not selected this time.'
    }
};

/**
 * Send automatic status update email
 * @param {Object} data - applicant data
 */
const sendStatusEmail = async ({ to, applicantName, opportunityTitle, organizationName, status }) => {
    try {
        const template = templates[status];
        if (!template) {
            console.warn(`⚠️ No email template found for status: ${status}`);
            return;
        }

        const mailOptions = {
            from: `"OppHub" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: template.subject,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #e0e0e0;">
                    <div style="background-color: #10a37f; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">✨ OppHub</h1>
                    </div>
                    <div style="padding: 30px; background-color: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <p style="font-size: 16px; color: #333;">Hi <strong>${applicantName}</strong>,</p>
                        <p style="font-size: 16px; color: #555; line-height: 1.6;">
                            There is an update on your application for <strong>${opportunityTitle}</strong> at <strong>${organizationName}</strong>.
                        </p>
                        <div style="margin: 25px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #10a37f; border-radius: 4px;">
                            <p style="margin: 0; font-size: 18px; color: #10a37f; font-weight: bold;">${status}</p>
                            <p style="margin: 5px 0 0; color: #666;">${template.message}</p>
                        </div>
                        <p style="font-size: 14px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            You can track your real-time progress on the OppHub dashboard.
                        </p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5500'}" style="background-color: #10a37f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>&copy; 2026 OppHub Opportunity Management. All rights reserved.</p>
                        <p>This is an automated notification. Please do not reply to this email.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('❌ Email notification failed:', error.message);
        return false;
    }
};

module.exports = { sendStatusEmail };
