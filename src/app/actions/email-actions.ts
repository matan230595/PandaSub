
'use server';

/**
 * @fileOverview Server actions for sending emails.
 * 
 * In a real production environment, you would use a service like Resend, SendGrid, or Mailgun.
 * You would need to add your API key to the environment variables (.env).
 */

interface SendEmailInput {
  email: string;
  userName: string;
  subscriptions: any[];
}

export async function sendWeeklyDigestAction(input: SendEmailInput) {
  const { email, userName, subscriptions } = input;

  console.log(`[Email Service] Preparing weekly digest for ${email}...`);

  try {
    // שלב 1: הכנת תוכן המייל
    const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
    const totalAmount = activeSubs.reduce((sum, s) => sum + s.amount, 0);
    
    const subsHtml = activeSubs.map(s => `
      <li><strong>${s.name}</strong>: ${s.amount}${s.currency} (חידוש ב-${s.renewalDate})</li>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; color: #333;">
        <h1 style="color: #1a73e8;">שלום ${userName}, זה סיכום המינויים שלך! 🐼</h1>
        <p>להלן המינויים הפעילים שלך השבוע:</p>
        <ul style="list-style-type: none; padding: 0;">
          ${subsHtml}
        </ul>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 18px;"><strong>סה"כ חודשי: ${totalAmount.toLocaleString()} ₪</strong></p>
        <p style="font-size: 12px; color: #888;">נשלח באמצעות PandaSub IL - ניהול מינויים חכם</p>
      </div>
    `;

    /**
     * דוגמה לחיבור ל-Resend (דורש התקנת 'resend' ו-API Key):
     * 
     * const { Resend } = await import('resend');
     * const resend = new Resend(process.env.RESEND_API_KEY);
     * 
     * await resend.emails.send({
     *   from: 'PandaSub <noreply@pandasub.il>',
     *   to: email,
     *   subject: 'סיכום המינויים השבועי שלך 🐼',
     *   html: htmlContent,
     * });
     */

    // סימולציה של הצלחה למטרת הפרוטוטיפ (או שימוש בשירות אמיתי אם מוגדר)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`[Email Service] Email successfully "sent" to ${email}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('[Email Service] Error sending email:', error);
    return { success: false, error: error.message };
  }
}
