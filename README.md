# Discourse Segment Tracking Theme Component

Allows you to send page view and event data from your Discourse
site to Segment.

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
   - `track_users`: Track user logins and refreshes
   - `track_by_external_id`: Use SSO external_id as UserID (if SSO is enabled)
   - `track_by_email`: Use user email as UserID (new!)
   - `include_user_email`: Include user email in the identify payload
   - `track_page`: Track page visits by page type
   - `track_topic_creation`: Track topic creation
   - `track_post_creation`: Track post creation
   - `track_likes`: Track likes
   - `track_flags`: Track flags
   - `track_bookmarks`: Track bookmarks

### How UserID is Chosen

- If `track_by_email` is enabled, the user's email address is used as the UserID.
- Else if SSO is enabled and `track_by_external_id` is enabled, the SSO external_id is used.
- Otherwise, the Discourse user ID is used.

### Segment Snippet

The Segment analytics.js snippet is dynamically loaded using your configured write key. No API keys are hardcoded in the component.

### Usage

- Make changes to your settings as needed.
- The component supports calling `segment.identify` when a user first logs on to the site.
- Tracks views of the Discourse latest, categories, category, tag, and topic pages.
- Tracks topic and post creation, likes, flags, and bookmarks.

---

**Note:** For development, use the Discourse Ember CLI server (`http://localhost:4200`) for hot reloading and best results.