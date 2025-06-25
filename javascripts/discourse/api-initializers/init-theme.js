import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  // Segment snippet
  !function(){
    var i="analytics",analytics=window[i]=window[i]||[];
    if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");
    else{
      analytics.invoked=!0;
      analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","screen","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware","register"];
      analytics.factory=function(e){
        return function(){
          if(window[i].initialized)return window[i][e].apply(window[i],arguments);
          var n=Array.prototype.slice.call(arguments);
          if(["track","screen","alias","group","page","identify"].indexOf(e)>-1){
            var c=document.querySelector("link[rel='canonical']");
            n.push({__t:"bpc",c:c&&c.getAttribute("href")||void 0,p:location.pathname,u:location.href,s:location.search,t:document.title,r:document.referrer})
          }
          n.unshift(e);
          analytics.push(n);
          return analytics
        }
      };
      for(var n=0;n<analytics.methods.length;n++){
        var key=analytics.methods[n];
        analytics[key]=analytics.factory(key)
      }
      analytics.load=function(key,n){
        var t=document.createElement("script");
        t.type="text/javascript";
        t.async=!0;
        t.setAttribute("data-global-segment-analytics-key",i);
        t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";
        var r=document.getElementsByTagName("script")[0];
        r.parentNode.insertBefore(t,r);
        analytics._loadOptions=n
      };
      analytics._writeKey=settings.segment_write_key;
      analytics.SNIPPET_VERSION="5.2.0";
      analytics.load(settings.segment_write_key);
    }
  }();

  // Cache frequently used values
  const ssoEnabled = api.container.lookup('site-settings:main').enable_discourse_connect;
  const ua = navigator.userAgent;
  let platform = "Web";
  let userID = null;
  let hasIdentified = false;
  let currentUrl = window.location.href;
  let currentPage = null;

  // Determine platform once
  if (ua.match(/(iPhone|iPod|iPad)/)) {
    platform = "iOS";
  } else if (ua.match(/(Android)/)) {
    platform = "Android";
  }

  // Optimized identify function - prevents duplicate calls
  function identifyUser(user) {
    if (hasIdentified || !user) return;
    
    if (settings.track_by_email) {
      userID = user.email;
    } else if (ssoEnabled && settings.track_by_external_id) {
      userID = user.external_id;
    } else {
      userID = user.id;
    }
    
    if (settings.include_user_email) {
      analytics.identify(userID, {email: user.email});
    } else {
      analytics.identify(userID);
    }
    
    hasIdentified = true;
  }

  // Optimized page tracking function with better naming
  function page(title, opts = {}) {
    opts.platform = platform;
    currentPage = title;
    window.analytics.page(currentPage, opts);
  }

  // Optimized event tracking function with consistent properties
  function track(eventName, properties = {}) {
    const baseProperties = {
      platform,
      location: currentPage,
      timestamp: new Date().toISOString(),
      discourse_user_id: userID
    };
    
    window.analytics.track(eventName, { ...baseProperties, ...properties });
  }

  // Enhanced page change handler with better naming
  function pageChanged(container, details) {
    const routeName = details.currentRouteName;
    const route = container.lookup(`route:${routeName}`);
    const model = route?.currentModel;
    let pageTitle = null;
    let pageProperties = {};

    switch (routeName) {
      case "discovery.latest":
        pageTitle = "Latest Topics";
        break;
      case "discovery.categories":
        pageTitle = "All Categories";
        break;
      case "discovery.parentCategory":
      case "discovery.category":
        if (model?.category) {
          pageTitle = `Category: ${model.category.name}`;
          pageProperties = {
            category_id: model.category.id,
            category_name: model.category.name,
            category_slug: model.category.slug
          };
        }
        break;
      case "tags.show":
        if (model?.id) {
          pageTitle = `Tag: ${model.id}`;
          pageProperties = { tag_name: model.id };
        }
        break;
      case "tags.showCategory":
        if (model?.id) {
          pageTitle = `Category Tag: ${model.id}`;
          pageProperties = { tag_name: model.id };
        }
        break;
      case "topic.fromParams":
      case "topic.fromParamsNear":
        if (details.title) {
          pageTitle = `Topic Viewed`;
          pageProperties = {
            topic_title: details.title,
            topic_id: details.topicId
          };
        }
        break;
      case "user":
        pageTitle = "User Profile";
        pageProperties = { username: model?.username };
        break;
      case "admin":
        pageTitle = "Admin Dashboard";
        break;
    }

    if (pageTitle) {
      page(pageTitle, { referrer: currentUrl, ...pageProperties });
      currentUrl = window.location.href;
    }
  }

  // User identification - only run once per session
  if (settings.track_users) {
    const currentUser = api.getCurrentUser();
    if (currentUser && !hasIdentified) {
      api.container.lookup('store:main').find('user', currentUser.username).then(identifyUser);
    }
  }

  // Track user sign up (new user registration)
  if (settings.track_users) {
    api.onAppEvent("user:created", (user) => {
      if (user) {
        track("Signed Up", {
          user_id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        });
      }
    });
  }

  // Event listeners with optimized conditions
  if (settings.track_page) {
    api.onAppEvent("page:changed", details => {
      pageChanged(api.container, details);
    });
  }

  if (settings.track_topic_creation) {
    api.onAppEvent("topic:created", (post, composerModel) => {
      if (post) {
        track("Topic Created", {
          topic_id: post.topic_id,
          topic_title: post.title,
          category_id: composerModel?.get("category.id"),
          category_name: composerModel?.get("category.name"),
          category_slug: composerModel?.get("category.slug"),
          tags: composerModel?.get("tags") || []
        });
      }
    });
  }

  if (settings.track_post_creation) {
    api.onAppEvent("post:created", post => {
      if (post) {
        track("Post Created", {
          post_id: post.id,
          post_number: post.post_number,
          topic_id: post.get("topic.id"),
          topic_title: post.get("topic.title"),
          category_id: post.get("topic.category.id"),
          category_name: post.get("topic.category.name"),
          category_slug: post.get("topic.category.slug"),
          is_first_post: post.post_number === 1
        });
      }
    });
  }

  if (settings.track_likes) {
    api.onAppEvent("page:like-toggled", (post, likeAction) => {
      const topic = post?.topic;
      if (post && topic && likeAction?.acted) {
        track("Post Liked", {
          post_id: post.id,
          post_number: post.post_number,
          topic_id: topic.id,
          topic_title: topic.title,
          category_id: topic.get("category.id"),
          category_name: topic.get("category.name"),
          category_slug: topic.get("category.slug"),
          is_first_post: post.post_number === 1
        });
      }
    });
  }

  if (settings.track_bookmarks) {
    api.onAppEvent("page:bookmark-post-toggled", post => {
      const topic = post?.topic;
      if (post?.bookmarked && topic) {
        track(
          post.post_number === 1 ? "Topic Bookmarked" : "Post Bookmarked",
          {
            post_id: post.post_number === 1 ? null : post.id,
            post_number: post.post_number,
            topic_id: topic.id,
            topic_title: topic.title,
            category_id: topic.get("category.id"),
            category_name: topic.get("category.name"),
            category_slug: topic.get("category.slug"),
            is_first_post: post.post_number === 1
          }
        );
      }
    });
  }

  if (settings.track_flags) {
    api.onAppEvent("post:flag-created", (post, postAction) => {
      if (post && postAction) {
        track("Post Flagged", {
          post_id: post.id,
          post_number: post.post_number,
          topic_id: post.topic_id,
          topic_title: post.get("topic.title"),
          flag_type: postAction.get("actionType.name"),
          flag_reason: postAction.get("message")
        });
      }
    });

    api.onAppEvent("topic:flag-created", (post, postAction) => {
      if (post && postAction) {
        track("Topic Flagged", {
          topic_id: post.topic_id,
          topic_title: post.get("topic.title"),
          category_id: post.get("topic.category.id"),
          category_name: post.get("topic.category.name"),
          category_slug: post.get("topic.category.slug"),
          flag_type: postAction.get("actionType.name"),
          flag_reason: postAction.get("message")
        });
      }
    });
  }

  // Track topic tag creation (new event)
  if (settings.track_topic_creation) {
    api.onAppEvent("topic:tag-changed", (topic, tags) => {
      if (topic && tags && tags.length > 0) {
        track("Topic Tag Created", {
          topic_id: topic.id,
          topic_title: topic.title,
          category_id: topic.get("category.id"),
          category_name: topic.get("category.name"),
          category_slug: topic.get("category.slug"),
          tags: tags,
          tag_count: tags.length
        });
      }
    });
  }
}); 