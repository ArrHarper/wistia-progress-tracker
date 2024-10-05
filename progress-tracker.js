// progress-tracker.js

function createProgressTracker(video) {
  console.log("Creating progress tracker for video:", video.hashedId());

  // Find the container using the hashed ID
  const wistiaContainer = document.querySelector(`.wistia_embed.wistia_async_${video.hashedId()}`);
  
  if (!wistiaContainer) {
    console.error("Unable to find video container for", video.hashedId());
    return null;
  }

  // Create progress bar elements
  const progressContainer = document.createElement('div');
  progressContainer.className = 'wistia-progress-container';
  progressContainer.style.width = wistiaContainer.style.width;
  progressContainer.style.backgroundColor = '#f0f0f0';
  progressContainer.style.marginTop = '10px';

  const progressBar = document.createElement('div');
  progressBar.className = 'wistia-progress-bar';
  progressBar.style.width = '0%';
  progressBar.style.height = '5px';
  progressBar.style.backgroundColor = '#4caf50';

  const percentageText = document.createElement('div');
  percentageText.className = 'wistia-progress-percentage';
  percentageText.style.marginTop = '5px';

  progressContainer.appendChild(progressBar);
  progressContainer.appendChild(percentageText);

  // Insert the progress bar after the Wistia container
  wistiaContainer.insertAdjacentElement('afterend', progressContainer);

  let uniqueSecondsWatched;
  let lastReportedProgress = 0;
  let totalTime;
  let intervalId;

  function updateProgress() {
    if (!totalTime) {
      totalTime = Math.floor(video.duration());
    }
    
    const secondsWatched = video.secondsWatchedVector();

    if (!uniqueSecondsWatched || uniqueSecondsWatched.length !== totalTime) {
      uniqueSecondsWatched = new Array(totalTime).fill(0);
    }

    // Update uniqueSecondsWatched
    for (let i = 0; i < secondsWatched.length; i++) {
      if (secondsWatched[i] > 0 && uniqueSecondsWatched[i] === 0) {
        uniqueSecondsWatched[i] = 1;
      }
    }

    const uniqueWatchedCount = uniqueSecondsWatched.reduce((acc, sec) => acc + sec, 0);
    const percentageWatched = Math.min((uniqueWatchedCount / totalTime) * 100, 100);
    
    // Only update if the progress has changed
    if (percentageWatched !== lastReportedProgress) {
      progressBar.style.width = `${percentageWatched}%`;
      percentageText.textContent = `Progress: ${Math.floor(percentageWatched)}%`;
      console.log("Progress updated:", Math.floor(percentageWatched) + "%");
      lastReportedProgress = percentageWatched;

      // // Save progress in localStorage
      // localStorage.setItem(`videoProgress_${video.hashedId()}`, percentageWatched);

      // If progress reaches 100%, stop tracking and log final progress
      if (percentageWatched === 100) {
        clearInterval(intervalId);
        console.log("Video progress complete, final progress: 100%");
      }
    }
  }

  return {
    init: function() {
      console.log("Initializing progress tracker for", video.hashedId());
      // Update progress every second
      intervalId = setInterval(updateProgress, 1000);
    }
  };
}

// Wait for Wistia library to be available
function initWistiaProgressTracker() {
  console.log("Initializing Wistia Progress Tracker");
  if (window.Wistia) {
    console.log("Wistia library found");
    window._wq = window._wq || [];
    window._wq.push({ 
      id: '_all', 
      onReady: function(video) {
        console.log("Wistia video ready:", video.hashedId());
        const tracker = createProgressTracker(video);
        if (tracker) {
          tracker.init();
        } else {
          console.error("Failed to create progress tracker for video:", video.hashedId());
        }
      }
    });
  } else {
    console.log("Wistia library not found, retrying...");
    setTimeout(initWistiaProgressTracker, 100);
  }
}

// Start the initialization process
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, starting Wistia Progress Tracker initialization");
  initWistiaProgressTracker();
});