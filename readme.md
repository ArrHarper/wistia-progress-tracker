# Wistia Player Progress Tracker

The Player Progress Tracker is a prototype example of tracking a viewer's _unique video progress_ in realtime using the [Wistia Player API](https://docs.wistia.com/docs/javascript-player-api).

This is useful for any situation where you need to monitor viewer progress on a per-video basis and display that progress to the user or to a manager/admin. Some example use-cases:

- LMS platforms that need to reliably track learner progress
- Compliance courses where viewers are required to watch the full videos
- Academy-style sites where users receive badges or certifications based on video progress

# What it Does

When the page loads, `progress-tracker.js` injects a progress tracker bar beneath each Wistia embed on the page. When the viewer clicks play, the green _progress bar_ and _percentage watched_ continuously update until the viewer reaches 100%.

This is designed to only track _unique progress_, e.g. if the viewer watches the first 25%, then restarts the video and watches that same 25% again, the progress bar should only show 25% watched.

# How It Works

The progress tracker utilizes several Player API methods:

[video.duration()](https://docs.wistia.com/docs/javascript-player-api#duration): Gets the total length of the video.
[video.secondsWatchedVector()](https://docs.wistia.com/docs/javascript-player-api#secondswatchedvector): Retrieves an array representing which seconds of the video have been watched.
[video.hashedId()](https://docs.wistia.com/docs/javascript-player-api#hashedid): Identifies each unique video on the page.

The most important method is `secondsWatchedVector()` which returns an array containing each unique second of the video, which is how we can both track progress and distinguish _unique progress_ on the video from segments being re-watched. Each item in the array represents 1 second in the video, and the value of each item represents how many times that unique second has been watched in the current session:

```Example
[0, 0, 0, 0, 0] represents a 5 second video, in which no seconds have been watched.
[1, 1, 1, 0, 0] represents a 5 second video, in which 3 seconds have been watched.
[2, 2, 1, 1, 0] represents a 5 second video, in which 4 seconds have been watched, and the first 2 seconds have been watched twice in the same session.
```

# Using the Player API vs the Stats API

The reason we recommend this Player API technique, rather than pulling viewer progress from the Stats API, is because the Stats API doesn't track total viewer progress on a per-video basis. Wistia stats are session-based, and progress is only calculated _per viewing session_, not per video. So in order to calculate whether a viewer _has watched the entire video_, you'd have to potentially cross-reference multiple viewing sessions, and possibly even sessions from multiple 'visitors' (same user on different devices/browsers).
