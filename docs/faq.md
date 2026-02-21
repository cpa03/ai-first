# IdeaFlow FAQ

**Last Updated**: February 21, 2026
**Version**: 1.0.0

---

## General Questions

### What is IdeaFlow?

IdeaFlow is an AI-powered project planning tool that transforms raw ideas into actionable plans. Enter your idea, answer clarifying questions, and receive a complete breakdown with deliverables, tasks, timeline, and exportable blueprints.

### Who is IdeaFlow for?

- **Founders & Entrepreneurs**: Quickly plan and validate new ventures
- **Makers & Hobbyists**: Organize personal projects and side hustles
- **Project Managers**: Streamline project planning and execution
- **Consultants & Agencies**: Create client proposals and timelines

### How does IdeaFlow work?

1. **Enter your idea** - Describe your project in plain language
2. **Clarify details** - AI asks targeted questions to refine your idea
3. **Get a breakdown** - Receive deliverables, tasks, and timeline
4. **Export or integrate** - Download as Markdown or export to your favorite tools

### Is IdeaFlow free?

IdeaFlow offers a free tier with 5 ideas per month. See [Pricing](#pricing) for plan details.

---

## Account & Authentication

### How do I create an account?

1. Click "Sign Up" on the homepage
2. Enter your email and create a password, OR
3. Sign up with Google or GitHub (OAuth)
4. Verify your email address

### Can I use Google or GitHub to sign in?

Yes! IdeaFlow supports OAuth authentication with:

- Google Account
- GitHub Account

### How do I reset my password?

1. Click "Forgot Password" on the login page
2. Enter your email address
3. Check your inbox for the reset link
4. Create a new password

### Can I change my email address?

Currently, email changes require contacting support. We're working on adding this feature to account settings.

### How do I delete my account?

1. Go to Account Settings
2. Scroll to "Danger Zone"
3. Click "Delete Account"
4. Confirm by entering your password

**Warning**: Account deletion is permanent and will remove all your ideas and data.

---

## Ideas & Planning

### How many ideas can I create?

| Plan | Ideas per Month |
| ---- | --------------- |
| Free | 5 ideas         |
| Pro  | Unlimited       |
| Team | Unlimited       |

### What happens to my ideas?

Your ideas are stored securely in our database and are only accessible by you. We use AI to analyze and break down your ideas, but we never share your data with third parties.

### Can I edit my idea after creating it?

Yes! You can edit your idea at any time:

1. Go to your Dashboard
2. Click on the idea
3. Make your changes
4. Save

Note: Major changes may trigger a new AI breakdown.

### Can I share my idea with others?

Currently, ideas are private by default. Team collaboration features are planned for Phase 2.

### How accurate is the AI breakdown?

The AI provides intelligent suggestions based on best practices and common patterns. However, all breakdowns should be reviewed and adjusted based on your specific context. You can always modify tasks, timelines, and deliverables.

### Can I regenerate the breakdown?

Yes! If you're not satisfied with the initial breakdown:

1. Open your idea
2. Click "Regenerate Breakdown"
3. The AI will create a new breakdown

---

## Exports & Integrations

### What export formats are available?

- **Markdown** - Download as a formatted .md file
- **Notion** - Export directly to Notion (coming soon)
- **Trello** - Create Trello boards (coming soon)
- **Google Tasks** - Sync with Google Tasks (coming soon)
- **GitHub Projects** - Create GitHub issues (coming soon)

### How do I export to Markdown?

1. Open your completed idea
2. Click "Export"
3. Select "Markdown"
4. Download the .md file

### When will Notion/Trello integrations be available?

Export connectors for Notion, Trello, Google Tasks, and GitHub Projects are planned for Phase 2 (Q2 2026). Sign up for our newsletter to be notified when they launch.

### Can I import ideas from other tools?

Import functionality is planned for Phase 2. We'll support imports from:

- Trello
- Notion
- Google Tasks
- GitHub Projects
- CSV/JSON files

---

## Pricing

### What are the pricing plans?

| Feature          | Free | Pro ($15/mo) | Team ($10/user/mo) |
| ---------------- | ---- | ------------ | ------------------ |
| Ideas per month  | 5    | Unlimited    | Unlimited          |
| AI Breakdowns    | 5    | Unlimited    | Unlimited          |
| Markdown Export  | Yes  | Yes          | Yes                |
| Integrations     | -    | All          | All                |
| Team features    | -    | -            | Yes                |
| Priority support | -    | Yes          | Yes                |

### Is there a free trial?

The Free tier is always available with 5 ideas per month. No credit card required.

### Can I upgrade or downgrade my plan?

Yes, you can change your plan at any time:

- **Upgrading**: Immediate access to new features
- **Downgrading**: Takes effect at the end of your billing cycle

### What payment methods do you accept?

- Credit/Debit cards (Visa, Mastercard, American Express)
- PayPal
- GitHub Sponsors (for Pro plan)

### Is there a refund policy?

We offer a 14-day money-back guarantee for paid plans. Contact support for refund requests.

---

## Technical Questions

### What browsers are supported?

IdeaFlow supports all modern browsers:

- Chrome (recommended)
- Firefox
- Safari
- Edge

We recommend using the latest version of your browser for the best experience.

### Is there a mobile app?

Not yet. A mobile-responsive web app is available now, with native iOS and Android apps planned for Phase 4 (Q4 2026).

### Can I use IdeaFlow offline?

IdeaFlow requires an internet connection as it relies on AI processing in the cloud. Offline support is being considered for future releases.

### What AI models does IdeaFlow use?

IdeaFlow uses advanced AI models from leading providers (OpenAI, Anthropic). We abstract the AI layer to provide consistent results and can switch models as technology improves.

### Is there an API?

Yes! IdeaFlow provides a REST API for developers. See our [API Documentation](./api.md) for details.

**API Features:**

- Create and manage ideas
- Trigger AI breakdowns
- Export blueprints
- Webhook support (coming soon)

---

## Privacy & Security

### How is my data protected?

- **Encryption**: All data is encrypted in transit (TLS 1.3) and at rest
- **Authentication**: Secure OAuth and password-based authentication
- **Access Control**: Row-level security ensures you only see your data
- **Audit Logging**: All actions are logged for security review

### Do you sell my data?

**Never.** We do not sell, share, or monetize your personal data or ideas.

### How do you use AI with my ideas?

AI is used to:

- Ask clarifying questions
- Generate task breakdowns
- Create timelines
- Suggest improvements

Your ideas are processed by AI but are not used to train models or shared with third parties.

### Can I export all my data?

Yes! You can request a full data export:

1. Go to Account Settings
2. Click "Export My Data"
3. Receive a ZIP file with all your ideas and data

### Is IdeaFlow GDPR compliant?

Yes, IdeaFlow is GDPR compliant. We provide:

- Data export (Article 20)
- Right to deletion (Article 17)
- Privacy policy
- Data processing agreements (for business users)

### Where is my data stored?

Data is stored securely on Supabase infrastructure with automatic backups. Data centers are located in the US with plans for EU data residency.

---

## Troubleshooting

### I didn't receive the verification email

1. Check your spam/junk folder
2. Add `noreply@ideaflow.app` to your contacts
3. Click "Resend Verification" on the login page
4. Contact support if issues persist

### The AI breakdown is taking too long

AI processing typically takes 10-30 seconds. If it's taking longer:

1. Check your internet connection
2. Refresh the page
3. Try again later (high traffic may cause delays)

### My idea isn't breaking down correctly

Try these tips:

1. Be more specific in your idea description
2. Answer all clarifying questions thoroughly
3. Use the "Regenerate" option
4. Break large ideas into smaller ones

### I found a bug

Please report bugs through:

1. [GitHub Issues](https://github.com/cpa03/ai-first/issues)
2. Email: support@ideaflow.app

Include:

- Description of the issue
- Steps to reproduce
- Browser and version
- Screenshots (if applicable)

---

## Getting Help

### How do I contact support?

- **Email**: support@ideaflow.app
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: [docs/](./)

### Is there a community?

Join our community:

- **GitHub Discussions**: For feature discussions
- **Newsletter**: For updates and tips (coming soon)

### How do I request a feature?

1. Check [GitHub Issues](https://github.com/cpa03/ai-first/issues) for existing requests
2. If not found, create a new issue with the "feature request" template
3. Describe your use case and expected behavior

---

## Glossary

| Term              | Definition                                                      |
| ----------------- | --------------------------------------------------------------- |
| **Idea**          | A raw project concept entered by the user                       |
| **Clarification** | AI-powered questions to refine an idea                          |
| **Breakdown**     | Structured decomposition of an idea into deliverables and tasks |
| **Deliverable**   | A major output or milestone in a project                        |
| **Task**          | A specific action item within a deliverable                     |
| **Blueprint**     | A complete, exportable plan document                            |
| **Timeline**      | Estimated schedule for project completion                       |

---

## Still Have Questions?

Can't find what you're looking for?

- **Email us**: support@ideaflow.app
- **Check documentation**: [docs/](./)
- **Report an issue**: [GitHub Issues](https://github.com/cpa03/ai-first/issues)

---

_Frequently Asked Questions maintained by Product Manager Specialist_
