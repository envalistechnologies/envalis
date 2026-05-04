import transporter from "../config/email.js";
import EmailLog from "../models/EmailLog.js";
import EmailTemplate from "../models/EmailTemplate.js";
import { compileTemplate } from "../utils/templateCompiler.js";

export const emailAppUrls = {
    admin: process.env.ADMIN_URL || "http://localhost:5174",
    webapp: process.env.WEBAPP_URL || "http://localhost:5173",
};

const getAppUrl = (app) => emailAppUrls[app] || emailAppUrls.webapp;

export const sendEmail = async ({ to, subject, html, text, cc, bcc, attachments, category, type, sentBy, templateId, templateName }) => {
    const mailOptions = {
        from: `"Enovalis" <${process.env.GMAIL_USER}>`,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        html,
        ...(text && { text }),
        ...(cc && { cc: Array.isArray(cc) ? cc.join(", ") : cc }),
        ...(bcc && { bcc: Array.isArray(bcc) ? bcc.join(", ") : bcc }),
        ...(attachments && { attachments }),
    };

    const logEntry = await EmailLog.create({
        subject,
        from: process.env.GMAIL_USER,
        to: Array.isArray(to) ? to : [to],
        cc: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
        bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
        body: html,
        template: templateId,
        templateName,
        category: category || "other",
        type: type || "individual",
        status: "queued",
        sentBy: sentBy?._id,
        sentByName: sentBy ? `${sentBy.firstName} ${sentBy.lastName}` : "System",
        recipientCount: Array.isArray(to) ? to.length : 1,
    });

    try {
        await transporter.sendMail(mailOptions);
        await EmailLog.findByIdAndUpdate(logEntry._id, { status: "sent", sentAt: new Date() });
        return { success: true, logId: logEntry._id };
    } catch (error) {
        await EmailLog.findByIdAndUpdate(logEntry._id, { status: "failed", failedReason: error.message });
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

export const sendBulkEmail = async ({ employees, subject, html, text, category, sentBy, templateId, templateName }) => {
    const toEmails = employees.map((e) => e.email);
    return sendEmail({
        to: toEmails,
        subject,
        html,
        text,
        category,
        type: "bulk",
        sentBy,
        templateId,
        templateName,
    });
};

export const sendEmailFromTemplate = async ({ templateId, to, variables, sentBy, additionalTo, cc, bcc }) => {
    const template = await EmailTemplate.findById(templateId);
    if (!template) throw new Error("Email template not found");

    const templateVariables = {
        ...(variables || {}),
        adminUrl: getAppUrl("admin"),
        webappUrl: getAppUrl("webapp"),
    };

    const html = compileTemplate(template.htmlContent, templateVariables);
    const subject = compileTemplate(template.subject, templateVariables);

    const allTo = additionalTo ? [...(Array.isArray(to) ? to : [to]), ...additionalTo] : to;

    await EmailTemplate.findByIdAndUpdate(templateId, {
        $inc: { usageCount: 1 },
        lastUsedAt: new Date(),
    });

    return sendEmail({
        to: allTo,
        subject,
        html,
        cc,
        bcc,
        category: template.category,
        templateId: template._id,
        templateName: template.name,
        sentBy,
    });
};

export const sendPasswordResetEmail = async (admin, resetToken) => {
    const resetUrl = `${getAppUrl("admin")}/auth/reset-password/${resetToken}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Password Reset Request</h2>
      <p>Hello ${admin.firstName},</p>
      <p>You requested a password reset for your Enovalis Admin account.</p>
      <p>Click the button below to reset your password (expires in 10 minutes):</p>
      <a href="${resetUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">Reset Password</a>
      <p>If you didn't request this, please ignore this email or contact support immediately.</p>
      <p>Best regards,<br/>Enovalis Security Team</p>
    </div>
  `;
    return sendEmail({ to: admin.email, subject: "Password Reset - Enovalis Admin", html, category: "other" });
};

export const sendWelcomeAdminEmail = async (admin, tempPassword) => {
    const loginUrl = `${getAppUrl("admin")}/auth/login`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Welcome to Enovalis Admin Panel</h2>
      <p>Hello ${admin.firstName} ${admin.lastName},</p>
      <p>Your admin account has been created with the following credentials:</p>
      <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
        <p><strong>Email:</strong> ${admin.email}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p><strong>Role:</strong> ${admin.role}</p>
      </div>
      <p>Please log in and change your password immediately.</p>
      <a href="${loginUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Login Now</a>
      <p>Best regards,<br/>Enovalis Super Admin</p>
    </div>
  `;
    return sendEmail({ to: admin.email, subject: "Welcome to Enovalis Admin", html, category: "welcome" });
};