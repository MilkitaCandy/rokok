// 1. AGE GATE MODAL
function verifyAge(isAdult) {
  const ageModal = document.getElementById("age-modal");
  if (isAdult) {
    if (ageModal) ageModal.style.display = "none";
    document.body.style.overflow = "auto";
  } else {
    alert("Akses ditolak. Anda harus berusia 18+.");
    window.location.href = "https://www.google.com";
  }
}

// OPTIMASI: cek modal sebelum 'load' (pakai DOMContentLoaded) supaya body
// langsung terkunci scroll-nya tanpa nunggu semua asset (gambar/video) selesai load.
// Ini juga menghindari kemungkinan "flash of scrollable content" sesaat.
document.addEventListener("DOMContentLoaded", function () {
  const ageModal = document.getElementById("age-modal");
  if (ageModal && ageModal.style.display !== "none") {
    document.body.style.overflow = "hidden";
  }
});

// 2 & 5. NAVBAR SCROLL EFFECT + SCROLL REVEAL
// OPTIMASI UTAMA: sebelumnya ada 2 listener 'scroll' terpisah (navbar & reveal),
// masing-masing jalan di setiap event scroll tanpa throttle -> bisa nembak
// puluhan kali per detik dan tiap kali reveal() juga looping semua .reveal
// element + getBoundingClientRect (paksa reflow). Digabung jadi satu listener
// dengan requestAnimationFrame throttle supaya kerja beratnya cuma sekali
// per frame render, bukan sekali per event.
const navbar = document.getElementById("navbar");
const revealElements = document.querySelectorAll(".reveal");

// OPTIMASI: pakai IntersectionObserver untuk reveal, jauh lebih murah
// daripada hitung getBoundingClientRect() tiap elemen di setiap scroll event.
// Browser yang urus deteksi visibility-nya, bukan JS kita yang polling terus.
if ("IntersectionObserver" in window && revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          obs.unobserve(entry.target); // sekali reveal, gak perlu dipantau lagi
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -100px 0px" } // ~mirip elementVisible=100 di versi lama
  );
  revealElements.forEach((el) => revealObserver.observe(el));
}

let scrollTicking = false;
function onScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    if (navbar) {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    }
    scrollTicking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });

// 3. HAMBURGER MENU MOBILE
const mobileMenu = document.getElementById("mobile-menu");
const navLinks = document.getElementById("nav-links");
const navItems = document.querySelectorAll(".nav-links a");

if (mobileMenu && navLinks) {
  mobileMenu.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });
}

// 4. SMOOTH SCROLLING
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  });
});


/* =========================================
   6. VIDEO COVERFLOW SLIDER (EFEK ZOOM TENGAH)
   -- Versi dioptimasi: hindari layout thrashing --
========================================= */
const container = document.getElementById('sliderContainer');
const track = document.getElementById('videoTrack');

if (container && track) {
  const wrappers = Array.from(track.querySelectorAll('.video-wrapper'));
  // OPTIMASI: cache elemen video sekali di awal, jangan querySelector('video')
  // berulang-ulang tiap kali dibutuhkan.
  const videos = wrappers.map((w) => w.querySelector('video'));

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;
  let currentIndex = 0;
  let dragLocked = null;
  let dragMoved = false;
  let hasUserInteracted = false;

  // OPTIMASI: cache step width & container width, cuma dihitung ulang saat
  // resize/orientation change, bukan tiap frame animasi (getBoundingClientRect
  // & offsetWidth memaksa browser reflow kalau dipanggil terus-menerus).
  let cachedStepWidth = 0;
  let cachedContainerWidth = 0;

  function recalcDimensions() {
    cachedContainerWidth = container.offsetWidth;
    if (wrappers.length) {
      const wrapper = wrappers[0];
      const styles = window.getComputedStyle(wrapper);
      const marginLeft = parseFloat(styles.marginLeft) || 0;
      const marginRight = parseFloat(styles.marginRight) || 0;
      cachedStepWidth = wrapper.offsetWidth + marginLeft + marginRight;
    }
  }

  track.style.touchAction = 'pan-y';

  function getSlideTranslate(index) {
    return (cachedContainerWidth / 2) - (cachedStepWidth * index) - (cachedStepWidth / 2);
  }

  function centerSlide(index, animated = false) {
    const targetWrapper = wrappers[index];
    if (!targetWrapper) return;

    currentIndex = index;
    currentTranslate = getSlideTranslate(index);
    prevTranslate = currentTranslate;

    track.style.transition = animated
      ? 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)'
      : 'transform 0s ease';

    setSliderPosition();
    updateActiveClass();

    if (animated) {
      setTimeout(() => {
        track.style.transition = 'transform 0s ease';
      }, 450);
    }
  }

  function setInitialPosition() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        recalcDimensions();
        centerSlide(currentIndex, false);
      });
    });
  }

  track.addEventListener('mousedown', dragStart);
  track.addEventListener('touchstart', dragStart, { passive: true });
  track.addEventListener('mouseup', dragEnd);
  track.addEventListener('touchend', dragEnd);
  track.addEventListener('mouseleave', dragEnd);
  track.addEventListener('mousemove', dragAction);
  track.addEventListener('touchmove', dragAction, { passive: false });

  const imgElement = track.querySelector('img');
  if (imgElement) imgElement.addEventListener('dragstart', (e) => e.preventDefault());

  function playVideo(video, unmuted) {
    if (!video) return;
    if (unmuted) video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  }

  wrappers.forEach((wrapper, index) => {
    wrapper.addEventListener('click', () => {
      if (dragMoved) {
        dragMoved = false;
        return;
      }

      hasUserInteracted = true;
      const video = videos[index];

      if (index !== currentIndex) {
        currentIndex = index;
        centerSlide(currentIndex, true);
        playVideo(video, true);
      } else if (video) {
        if (video.paused) {
          playVideo(video, true);
        } else {
          video.pause();
        }
      }
    });
  });

  function dragStart(e) {
    isDragging = true;
    dragLocked = null;
    dragMoved = false;
    hasUserInteracted = true;
    startX = getPositionX(e);
    startY = getPositionY(e);
    animationID = requestAnimationFrame(animation);
    track.classList.add('grabbing');
  }

  // OPTIMASI: dulu dragEnd mencari closestIndex dengan getBoundingClientRect()
  // per wrapper (forced reflow x jumlah video). Sekarang dihitung murni dari
  // currentTranslate/stepWidth yang sudah kita cache -> tanpa reflow sama sekali.
  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    dragLocked = null;
    cancelAnimationFrame(animationID);

    const rawIndex = ((cachedContainerWidth / 2) - currentTranslate - (cachedStepWidth / 2)) / cachedStepWidth;
    const closestIndex = Math.min(
      wrappers.length - 1,
      Math.max(0, Math.round(rawIndex))
    );

    currentIndex = closestIndex;
    snapToCurrentSlide();
    track.classList.remove('grabbing');
  }

  function dragAction(e) {
    if (!isDragging) return;

    const currentX = getPositionX(e);
    const currentY = getPositionY(e);
    const diffX = currentX - startX;
    const diffY = currentY - startY;

    if (dragLocked === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
      dragLocked = Math.abs(diffX) > Math.abs(diffY);
    }

    if (dragLocked) {
      if (e.cancelable) e.preventDefault();
      currentTranslate = prevTranslate + diffX;
      if (Math.abs(diffX) > 8) dragMoved = true;
    } else if (dragLocked === false) {
      isDragging = false;
      cancelAnimationFrame(animationID);
      track.classList.remove('grabbing');
    }
  }

  function getPositionX(e) {
    return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  }

  function getPositionY(e) {
    return e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
  }

  function animation() {
    setSliderPosition();
    updateActiveClass();
    if (isDragging) requestAnimationFrame(animation);
  }

  function setSliderPosition() {
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function snapToCurrentSlide() {
    centerSlide(currentIndex, true);
  }

  // OPTIMASI: index "active" dihitung langsung dari currentTranslate/stepWidth
  // (matematika murni), bukan dengan getBoundingClientRect() tiap wrapper di
  // tiap animation frame. Ini penghematan terbesar karena fungsi ini dipanggil
  // terus-menerus selama drag & animasi snap.
  let lastActiveIndex = -1;
  function updateActiveClass() {
    if (!cachedStepWidth) return;
    const rawIndex = ((cachedContainerWidth / 2) - currentTranslate - (cachedStepWidth / 2)) / cachedStepWidth;
    const nearestIndex = Math.min(
      wrappers.length - 1,
      Math.max(0, Math.round(rawIndex))
    );

    if (nearestIndex === lastActiveIndex) return; // gak ada perubahan, skip semua DOM write
    lastActiveIndex = nearestIndex;

    wrappers.forEach((wrapper, i) => {
      const video = videos[i];
      if (i === nearestIndex) {
        if (!wrapper.classList.contains('active')) {
          wrapper.classList.add('active');
          if (video) {
            if (hasUserInteracted) video.muted = false;
            playVideo(video, false);
          }
        }
      } else if (wrapper.classList.contains('active')) {
        wrapper.classList.remove('active');
        if (video) {
          video.pause();
          video.currentTime = 0;
          video.muted = true;
        }
      }
    });
  }

  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      recalcDimensions();
      centerSlide(currentIndex, false);
    }, 120);
  }

  window.addEventListener('load', setInitialPosition);
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      recalcDimensions();
      centerSlide(currentIndex, false);
    }, 200);
  });

  videos.forEach((video, i) => {
    const wrapper = wrappers[i];
    if (video) {
      video.addEventListener('loadedmetadata', () => {
        recalcDimensions();
        centerSlide(currentIndex, false);
        if (video.currentTime === 0) {
          video.currentTime = 0.01;
        }
      }, { once: true });

      wrapper.classList.add('is-paused');
      video.addEventListener('play', () => wrapper.classList.remove('is-paused'));
      video.addEventListener('pause', () => wrapper.classList.add('is-paused'));
    }
  });

  if ('IntersectionObserver' in window) {
    const scrollPauseObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const activeIndex = wrappers.findIndex((w) => w.classList.contains('active'));
        if (activeIndex === -1) return;
        const video = videos[activeIndex];
        if (!video) return;

        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.25 });

    scrollPauseObserver.observe(container);
  }
}

