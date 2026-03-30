/**
 * Email Service
 * 
 * This service handles sending emails using a third-party provider (e.g., Resend).
 * To use this in production, you must provide a RESEND_API_KEY in your .env file.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    console.warn('VITE_RESEND_API_KEY is not set. Email will not be sent in production.');
    console.log('Mock Email Sent:', options);
    return { success: true, mock: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'ServiceHub Pro <onboarding@resend.dev>', // Replace with your verified domain
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
