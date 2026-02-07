import { transporter } from "../../utils/mailer.js";

export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Zeera Project Management" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        console.log(`Email sent successfully to ${to}:`, info.messageId);
        return info;
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error.message);
        throw error; // Re-throw to let the worker handle retries
    }
};


        