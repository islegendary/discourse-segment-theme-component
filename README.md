# Discourse Segment Tracking Theme Component

Allows you to send page view and event data from your Discourse site to Segment using device mode tracking for real-time analytics.

### Installation

See [How do I install a Theme or Theme Component?](https://meta.discourse.org/t/how-do-i-install-a-theme-or-theme-component/63682)

### Modern Discourse Theme JS

**As of 2025, all JavaScript for this theme component is located in:**
```
javascripts/discourse/api-initializers/init-theme.js
```
This follows the [latest Discourse theme best practices](https://meta.discourse.org/t/modernizing-inline-script-tags-for-templates-js-api/366482). The old `<script type='text/discourse-plugin'>` block is no longer used and has been removed.

### Configuration

1. Go to **Admin > Customize > Themes > [Your Theme] > Components > discourse-segment-theme-component > Settings**.
2. Enter your **Segment Write Key** in the `segment_write_key` field.
3. Choose your **User ID Strategy** from the dropdown:
   - `email` - Use user email as UserID (recommended)
   - `external_id` - Use SSO external_id (if SSO enabled)
   - `anonymous_id` - Use anonymous ID only
   - `discourse_id` - Use internal Discourse user ID
4. Configure tracking options:
   - `include_user_email` - Include user email in identify payload
   - `track_users` - Track user logins, refreshes, and sign-ups
   - `track_page` - Track page visits with descriptive page names
   - `track_topic_creation` - Track topic creation and tag changes
   - `track_post_creation` - Track post creation
   - `track_likes` - Track post likes
   - `track_flags` - Track post and topic flags
   - `track_bookmarks` - Track post and topic bookmarks

### User ID Strategy

Choose how users are identified in Segment:

| Option | Description | Use Case |
|--------|-------------|----------|
| `email` | User's email address | Most common, works with most tools |
| `external_id` | SSO external ID | When using SSO and want consistent IDs |
| `anonymous_id` | Use anonymous ID only | Privacy-focused, cross-session tracking |
| `discourse_id` | Internal Discourse ID | Simple numeric IDs, least privacy-friendly |

**Note:** The `external_id` option requires SSO to be enabled. If SSO is disabled, it will fall back to `discourse_id`.

**Anonymous ID:** Uses a deterministic anonymous ID format (`{discourse_id}-dc-{encoded_username}`) that remains consistent across sessions without requiring personal information. Perfect for privacy-conscious implementations while maintaining user journey tracking.

**Tip:** To carry your anonymousId from your site, use the [Querystring API](https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/querystring/).

### Tracked Events

#### User Events
- **`identify`** - User identification with flexible ID strategy
- **`track("Signed Up")`** - New user registration

#### Content Events
- **`track("Topic Created")`** - New topic creation with category and tag data
- **`track("Post Created")`** - New post creation with topic context
- **`track("Topic Tag Created")`** - When tags are added to topics

#### Engagement Events
- **`track("Post Liked")`** - Post likes with full context
- **`track("Post Bookmarked")`** / **`track("Topic Bookmarked")`** - Bookmark actions
- **`track("Post Flagged")`** / **`track("Topic Flagged")`** - Flag actions with reasons

#### Page Tracking
- **`page("Latest Topics")`** - Homepage visits
- **`page("All Categories")`** - Category listing
- **`page("Category: [Name]")`** - Individual category pages
- **`page("Topic Viewed")`** - Topic viewing with title and ID
- **`page("User Profile")`** - User profile pages
- **`page("Admin Dashboard")`** - Admin interface
- **`page("Tag: [Name]")`** - Tag pages

### Event Properties

All events include consistent base properties for device mode tracking:
- `platform` - Device platform (Web, iOS, Android)
- `timestamp` - ISO timestamp of the event
- `discourse_user_id` - Current user ID
- `location` - Current page context
- `context.traits.email` - User email (when available) for better merging

Additional properties vary by event type and include relevant IDs, names, slugs, and metadata.

### Security & CSP

The component automatically configures Content Security Policy (CSP) to allow Segment's CDN:
- **Domain:** `https://cdn.segment.com/analytics.js`
- **Covers:** All Segment write keys and analytics.min.js files
- **Security:** Maintains Discourse's security while enabling tracking

### Segment Snippet

The Segment analytics.js snippet is dynamically loaded using your configured write key. No API keys are hardcoded in the component.

### Device Mode Benefits - No Plugin Required

- **Real-time tracking** - Events fire immediately without server round-trips
- **No server dependencies** - Works independently of Discourse backend
- **Rich context** - Full browser and user context available
- **Immediate feedback** - See events in Segment debugger instantly
- **Better merging** - Email in context.traits helps merge user profiles across sessions

### Usage

- Make changes to your settings as needed.
- The component supports calling `segment.identify` when a user first logs on to the site.
- Tracks comprehensive user engagement across all major Discourse activities.
- Provides detailed analytics for content creation, engagement, and user behavior.

---

**Note:** For development, use the Discourse Ember CLI server (`http://localhost:4200`) for hot reloading and best results.

**Compatibility:** This component provides the same comprehensive tracking as the [discourse-segment-CDP plugin](https://github.com/islegendary/discourse-segment-CDP) but uses frontend device mode tracking instead of backend Ruby tracking.