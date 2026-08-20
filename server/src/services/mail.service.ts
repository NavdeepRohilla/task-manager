/**
 * Minimal mail abstraction. Every call site depends only on this function's
 * signature, so swapping the body for a real provider (Resend, SendGrid,
 * Nodemailer + SMTP, SES...) later is a one-file change — nothing in
 * auth.service.ts needs to know or care.
 */
export const mailService = {
  sendPasswordResetEmail: async (to: string, resetUrl: string): Promise<void> => {
    console.log(`[mail:dev] Password reset link for ${to}: ${resetUrl}`);
  },
};
