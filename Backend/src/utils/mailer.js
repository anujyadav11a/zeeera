import nodemailer from 'nodemailer';

// Use Gmail service since it works better
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test the connection on startup
const testEmailConnection = async () => {
  try {
    console.log('Testing Gmail service connection...');
    await transporter.verify();
    console.log('✅ Gmail service is ready to send emails');
  } catch (error) {
    console.error('❌ Gmail service connection error:', error.message);
    console.log('💡 Please check your Gmail credentials');
  }
};

// Test connection when module loads
testEmailConnection();

export { transporter };