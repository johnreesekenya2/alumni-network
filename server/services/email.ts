import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'fsocietycipherrevolt@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || 'aknz caun egok ihri',
  },
});

export async function sendVerificationEmail(email: string, code: string, name: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'fsocietycipherrevolt@gmail.com',
    to: email,
    subject: 'OLOF Alumni Community - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin-bottom: 10px;">OLOF Alumni Community</h1>
          <p style="color: #6b7280;">Welcome to Our Lady of Fatima Alumni Community</p>
        </div>
        
        <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #10b981; margin-bottom: 15px;">Hello ${name}!</h2>
          <p style="color: #d1d5db; line-height: 1.6;">
            Thank you for joining the OLOF Alumni Community! To complete your registration and verify your email address, please use the verification code below:
          </p>
          
          <div style="background: #2a2a2a; border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="color: #3b82f6; margin: 0 0 10px 0;">Verification Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 5px; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #d1d5db; font-size: 14px;">
            This code will expire in 24 hours. If you didn't request this verification, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #6b7280;">
          <p>Powered by John Reese</p>
          <p>©#OurLadyOfFatimaAlumni</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(email: string, code: string, name: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'fsocietycipherrevolt@gmail.com',
    to: email,
    subject: 'OLOF Alumni Community - Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin-bottom: 10px;">OLOF Alumni Community</h1>
          <p style="color: #6b7280;">Password Reset Request</p>
        </div>
        
        <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #f59e0b; margin-bottom: 15px;">Hello ${name}!</h2>
          <p style="color: #d1d5db; line-height: 1.6;">
            We received a request to reset your password. Use the code below to set a new password for your account:
          </p>
          
          <div style="background: #2a2a2a; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="color: #f59e0b; margin: 0 0 10px 0;">Reset Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 5px; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #d1d5db; font-size: 14px;">
            This code will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #6b7280;">
          <p>Powered by John Reese</p>
          <p>©#OurLadyOfFatimaAlumni</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
