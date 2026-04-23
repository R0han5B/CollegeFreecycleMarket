# Email Setup Guide for OTP Verification

This guide will help you configure email sending for the OTP verification feature in your College Freecycling Market application.

## Prerequisites

You need a Gmail account to send OTP emails.

## Step 1: Enable 2-Step Verification on Your Gmail Account

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Sign in to your Gmail account
3. Find "2-Step Verification" and enable it
4. Follow the on-screen instructions to complete setup

## Step 2: Create an App Password

1. After enabling 2-Step Verification, go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sign in if prompted
3. Click "Select app" → choose "Mail" or "Other (Custom name)"
4. Enter a name like "College Freecycling Market"
5. Click "Generate"
6. Copy the 16-character password (this is your app password, NOT your regular Gmail password)

## Step 3: Configure Environment Variables

Create or update the `.env` file in your project root:

```bash
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here
EMAIL_FROM=College Freecycling Market <noreply@rknec.edu>

# Database
DATABASE_URL="file:./db/custom.db"
```

Replace:
- `your_email@gmail.com` with your Gmail address
- `your_gmail_app_password_here` with the 16-character app password you generated in Step 2

## Step 4: Restart the Development Server

After adding the environment variables, restart your dev server:

```bash
bun run dev
```

This project's `dev` script uses webpack mode for Next.js to avoid a Turbopack crash in the current local Windows setup.

## Step 5: Test OTP Sending

1. Go to your signup page
2. Enter a valid @rknec.edu email address
3. Click "Send OTP"
4. Check your email (including spam folder)
5. You should receive an email with a 6-digit OTP code
6. Enter the OTP to verify and complete signup

## Troubleshooting

### Issue: "Failed to send OTP email"

**Possible causes:**
1. Wrong email or password
2. 2-Step Verification not enabled
3. App password not generated
4. Network/firewall blocking SMTP

**Solutions:**
1. Double-check your EMAIL_USER and EMAIL_PASSWORD in .env
2. Ensure 2-Step Verification is enabled on your Gmail account
3. Generate a new app password and update .env
4. Try using a different network or check firewall settings

### Issue: OTP not received

**Possible causes:**
1. Email in spam folder
2. Wrong email address entered
3. Email delivery delay

**Solutions:**
1. Check spam/junk folder
2. Verify the email address is correct (@rknec.edu only)
3. Wait a few minutes and try again
4. Click "Resend" after the 60-second countdown

### Issue: "Invalid credentials" error

**Solution:**
- Make sure you're using the **App Password**, not your regular Gmail password
- Regenerate the app password if needed

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit .env file to version control** - it contains sensitive credentials
2. **Use a dedicated email account** for sending OTPs, not your personal Gmail
3. **App passwords are sensitive** - keep them secure and don't share them
4. **Regularly rotate app passwords** for better security

## Alternative Email Providers

If you prefer not to use Gmail, you can use other email providers. Update the transporter configuration in `src/app/api/send-otp/route.ts`:

```typescript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

Update your `.env` file with the appropriate SMTP settings for your provider.

## Production Deployment

When deploying to production:

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Use a transactional email service like SendGrid, Mailgun, or AWS SES for better reliability
3. Monitor email deliverability and set up proper SPF/DKIM records

## Testing

To test email sending without affecting real users:

1. Create a test Gmail account
2. Use it for EMAIL_USER during development
3. Monitor all OTPs sent during testing
4. Clean up test data before going live

## Support

If you encounter any issues:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your email provider allows SMTP access
4. Review Gmail's security settings for any blocks
