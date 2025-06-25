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
3. Choose what you would like to track using the available settings:
   - `track_users`: Track user logins, refreshes, and sign-ups
   - `track_by_external_id`: Use SSO external_id as UserID (if SSO is enabled)
   - `track_by_email`: Use user email as UserID (new!)
   - `include_user_email`: Include user email in the identify payload
   - `track_page`: Track page visits with descriptive page names
   - `track_topic_creation`: Track topic creation and tag changes
   - `track_post_creation`: Track post creation
   - `track_likes`: Track post likes
   - `track_flags`: Track post and topic flags
   - `track_bookmarks`: Track post and topic bookmarks

### How UserID is Chosen

- If `track_by_email` is enabled, the user's email address is used as the UserID.
- Else if SSO is enabled and `track_by_external_id` is enabled, the SSO external_id is used.
- Otherwise, the Discourse user ID is used.

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
- **`page("Topic View")`** - Topic viewing with title and ID
- **`page("User Profile")`** - User profile pages
- **`page("Admin Dashboard")`** - Admin interface
- **`page("Tag: [Name]")`** - Tag pages

### Event Properties

All events include consistent base properties for device mode tracking:
- `platform` - Device platform (Web, iOS, Android)
- `timestamp` - ISO timestamp of the event
- `discourse_user_id` - Current user ID
- `location` - Current page context

Additional properties vary by event type and include relevant IDs, names, slugs, and metadata.

### Segment Snippet

The Segment analytics.js snippet is dynamically loaded using your configured write key. No API keys are hardcoded in the component.

### Device Mode Benefits

- **Real-time tracking** - Events fire immediately without server round-trips
- **No server dependencies** - Works independently of Discourse backend
- **Rich context** - Full browser and user context available
- **Immediate feedback** - See events in Segment debugger instantly

### Usage

- Make changes to your settings as needed.
- The component supports calling `segment.identify` when a user first logs on to the site.
- Tracks comprehensive user engagement across all major Discourse activities.
- Provides detailed analytics for content creation, engagement, and user behavior.

---

**Note:** For development, use the Discourse Ember CLI server (`http://localhost:4200`) for hot reloading and best results.

**Compatibility:** This component provides the same comprehensive tracking as the [discourse-segment-CDP plugin](https://github.com/islegendary/discourse-segment-CDP) but uses frontend device mode tracking instead of backend Ruby tracking.