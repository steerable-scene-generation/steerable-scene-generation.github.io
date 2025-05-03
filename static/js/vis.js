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
  // Add warning overlay for diffusion videos section
  const diffusionSection = document.querySelector('#diffusion-videos-section');
  if (diffusionSection) {
    // Get the carousel container
    const carouselContainer = diffusionSection.querySelector('.carousel.results-carousel');
    
    if (carouselContainer) {
      // Initially hide the carousel
      carouselContainer.style.display = 'none';
      
      // Create warning button
      const warningBtn = document.createElement('div');
      warningBtn.className = 'warning-button has-text-centered';
      warningBtn.innerHTML = `
        <div class="notification is-warning">
          <p><strong>Warning:</strong> The following videos contain rapid flashing content which may not be suitable for photosensitive viewers.</p>
          <button class="button is-danger mt-3">Show Videos Anyway</button>
        </div>
      `;
      
      // Insert the warning button before the carousel
      carouselContainer.parentNode.insertBefore(warningBtn, carouselContainer);
      
      // Add click event to the warning button
      const showButton = warningBtn.querySelector('button');
      showButton.addEventListener('click', function() {
        // Show the carousel
        carouselContainer.style.display = 'block';
        // Remove the warning button
        warningBtn.remove();
        
        // Initialize the carousel if it hasn't been initialized yet
        if (!carouselContainer.classList.contains('carousel-initialized')) {
          initDiffusionCarousel();
          carouselContainer.classList.add('carousel-initialized');
        }
      });
    }
  }
  
  function initDiffusionCarousel() {
    // --- Bulma Carousel Initialization and Event Handling ---
    const videoCarousels = bulmaCarousel.attach('#diffusion-videos-section .carousel', {
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
  }
  
  // Initialize non-diffusion carousels immediately
  const otherCarousels = document.querySelectorAll('.carousel:not(#diffusion-videos-section .carousel)');
  if (otherCarousels.length) {
    bulmaCarousel.attach(otherCarousels, {
      slidesToScroll: 1,
      slidesToShow: 1,
      infinite: true,
      // Add other options as needed
    });
  }
});
