// Lazy load videos when they enter the viewport
document.addEventListener("DOMContentLoaded", function() {
  const lazyVideos = [].slice.call(document.querySelectorAll("video.lazy-video"));
  console.log("Found lazy videos:", lazyVideos.length);

  if ("IntersectionObserver" in window) {
    let lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(videoEntry) {
        if (videoEntry.isIntersecting) {
          let video = videoEntry.target;
          // Only add source if not already present
          if (!video.querySelector('source') && video.dataset.src) {
            let source = document.createElement('source');
            source.src = video.dataset.src;
            source.type = "video/mp4";
            video.appendChild(source);
            video.load();
            console.log("Source added and video.load() called");
          }
          lazyVideoObserver.unobserve(video);
        }
      });
    });

    lazyVideos.forEach(function(lazyVideo) {
      lazyVideoObserver.observe(lazyVideo);
    });
  } else {
    // Fallback: load all videos immediately if IntersectionObserver is not supported
    lazyVideos.forEach(function(video) {
      if (!video.querySelector('source') && video.dataset.src) {
        let source = document.createElement('source');
        source.src = video.dataset.src;
        source.type = "video/mp4";
        video.appendChild(source);
        video.load();
        console.log("Fallback: Source added and video.load() called");
      }
    });
  }
});

// Hide spinner when video is ready
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('.video-wrapper').forEach(function(wrapper) {
    var video = wrapper.querySelector('video');
    var spinner = wrapper.querySelector('.video-spinner');
    if (video && spinner) {
      // Hide spinner when video can play
      video.addEventListener('canplay', function() {
        spinner.style.display = 'none';
      });
      // Optionally, show spinner again if video is waiting/buffering
      video.addEventListener('waiting', function() {
        spinner.style.display = '';
      });
      video.addEventListener('playing', function() {
        spinner.style.display = 'none';
      });
    }
  });
});

// Function to load video source for a specific slide element
function loadVideoForSlide(slideElement) {
  // Find the video wrapper within the slide
  const videoWrapper = slideElement.querySelector('.video-wrapper');
  if (!videoWrapper) return;

  const video = videoWrapper.querySelector('video.lazy-video');
  const spinner = videoWrapper.querySelector('.video-spinner');

  // Only load if video exists, has data-src, and has no source yet
  if (video && video.dataset.src && !video.querySelector('source')) {
    console.log("Loading video for active slide:", video.dataset.src);
    let source = document.createElement('source');
    source.src = video.dataset.src;
    source.type = "video/mp4";
    video.appendChild(source);
    video.load(); // Important: tell the video to load the new source

    // Handle spinner visibility
    if (spinner) {
      spinner.style.display = ''; // Show spinner initially
      video.addEventListener('canplay', () => spinner.style.display = 'none', { once: true }); // Hide when ready
      video.addEventListener('error', () => spinner.style.display = 'none', { once: true }); // Hide on error too
      // Optional: Show spinner on waiting/buffering (can be noisy)
      // video.addEventListener('waiting', () => spinner.style.display = '');
      // video.addEventListener('playing', () => spinner.style.display = 'none');
    }
  } else if (video && video.querySelector('source') && spinner) {
      // If source already exists (e.g., navigating back), ensure spinner is hidden if video is playable
      if (!video.paused || video.readyState >= 3) { // readyState 3 (HAVE_FUTURE_DATA) or 4 (HAVE_ENOUGH_DATA)
          spinner.style.display = 'none';
      }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // --- Bulma Carousel Initialization and Event Handling ---
  // Make sure you target the correct carousel container for your videos
  // Use the ID or a specific class if you have multiple carousels
  const videoCarousels = bulmaCarousel.attach('#diffusion-trajectory-carousel', { // <-- Make sure this ID matches your video carousel container
    slidesToScroll: 1,
    slidesToShow: 1,
    infinite: true,
    // Add other options as needed
  });

  videoCarousels.forEach(carousel => {
    // Load video for the initial active slide
    const initialSlideIndex = carousel.state.index;
    const initialSlideElement = carousel.slides[initialSlideIndex];
     if (initialSlideElement) {
        loadVideoForSlide(initialSlideElement);
     }


    // Listen for slide changes using the 'after' event
    carousel.on('carousel:slide:after', (event) => {
      // event.detail contains info like the Carousel instance, new index, and the slide element
      const slideElement = event.detail.element; // Get the actual slide DOM element
       if (slideElement) {
          loadVideoForSlide(slideElement);
       }
    });
  });
  // --- End Bulma Carousel Specific Code ---

  // Keep the original spinner hiding logic for videos OUTSIDE carousels if needed
  // Or integrate spinner logic fully into loadVideoForSlide as shown above
  /*
  document.querySelectorAll('.video-wrapper:not(.carousel-item .video-wrapper)').forEach(function(wrapper) {
     // ... original spinner logic ...
  });
  */
});
