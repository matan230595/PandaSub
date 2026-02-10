# **App Name**: PandaSub IL

## Core Features:

- Subscription Management: Comprehensive management of personal subscriptions with category support.
- Smart Date System: Tracking renewal, expiration, trial period end, and automatic cancellation dates.
- Automatic Reminders: Personalized reminders with priority settings for trial periods, annual renewals, and inactive subscriptions.
- Smart Notifications: Alerts for expiring subscriptions, cancellations, new subscriptions, price increases, and unused subscriptions.
- Dashboard with Statistics: Professional dashboard with statistics, graphs, monthly/annual expense tracking, trend analysis, and a 'Subscriptions at Risk' widget.
- Voice-Based Subscription Creation: AI-powered voice module for two-way conversation, automatic transcription, and subscription card generation from speech with category detection, leveraging an OpenAI tool to help decide what pieces of information to incorporate.
- AI Recommendations: AI recommendation system for identifying duplicate/redundant subscriptions, cheaper alternatives, and analyzing usage patterns, leveraging an OpenAI tool to help decide what pieces of information to incorporate.

## Style Guidelines:

- Primary color: Strong reddish-pink (#E91E63), inspired by the user's mention of Google Calendar. In this case, pink aligns well with calendar app theming and the reminders functionality that the app provides, while steering clear of cliches such as money apps using green. It creates good contrast in both dark and light schemes.
- Background color: Desaturated light-pink (#F8E8EC).
- Accent color: Analogous bright-purple (#9C27B0). Significantly different from the primary in brightness and saturation to create contrast.
- Body and headline font: 'Rubik', a sans-serif font.
- Note: currently only Google Fonts are supported.
- Use colorful icons for each subscription category (streaming, fitness, insurance, etc.), visually distinct based on the background and primary colors. These are to resemble the Google Calendar event icons, mentioned by the user.
- Full RTL support with layouts adapted from right to left. Use CSS logical properties where possible for margin, padding and borders, using properties such as margin-inline-start and padding-inline-end. Menus open from right, icons are aligned to the right, and animations are adapted to RTL.
- Responsive design for all devices, with breakpoints for small smartphones (320px-479px), large smartphones (480px-767px), portrait tablets (768px-1024px), landscape tablets/small desktops (1025px-1439px), and large desktops (1440px+). Use CSS Grid and Flexbox for flexible layouts and relative units (%, vw, vh, rem). Ensure large, touch-friendly buttons.
- Smooth transitions and hover effects throughout the application.