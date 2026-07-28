// 1. AGE GATE MODAL
function verifyAge(isAdult) {
  if (isAdult) {
    document.getElementById("age-modal").style.display = "none";
    document.body.style.overflow = "auto";
  } else {
    alert("Akses ditolak. Anda harus berusia 18+.");
    window.location.href = "https://www.google.com";
  }
}

// Gunakan addEventListener agar tidak menimpa event load lainnya
window.addEventListener("load", function () {
  // Kunci scroll hanya jika modal masih tampil
  const ageModal = document.getElementById("age-modal");
  if (ageModal && ageModal.style.display !== "none") {
    document.body.style.overflow = "hidden";
  }
});

// 2. NAVBAR SCROLL EFFECT
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

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

// 5. SCROLL REVEAL ANIMATION
function reveal() {
  var reveals = document.querySelectorAll(".reveal");
  for (var i = 0; i < reveals.length; i++) {
    var windowHeight = window.innerHeight;
    var elementTop = reveals[i].getBoundingClientRect().top;
    var elementVisible = 100;

    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    }
  }
}
window.addEventListener("scroll", reveal);
reveal();


/* =========================================
   6. VIDEO COVERFLOW SLIDER (EFEK ZOOM TENGAH)
   -- Versi diperbaiki: stabil & center di HP --
========================================= */
const container = document.getElementById('sliderContainer');
const track = document.getElementById('videoTrack');

// Cek apakah element slider ada di halaman ini (biar gak error di page lain)
if (container && track) {
  const wrappers = Array.from(track.querySelectorAll('.video-wrapper'));

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;
  let currentIndex = 0;
  let dragLocked = null; // null = belum ditentukan, true = horizontal drag, false = biarkan scroll vertikal
  let dragMoved = false; // true kalau gesture ini beneran geser (bukan cuma tap)
  let hasUserInteracted = false; // true setelah user pertama kali tap/drag slider

  // Biarkan browser HP tetap bisa scroll vertikal secara natural,
  // sementara drag horizontal kita handle manual lewat JS.
  track.style.touchAction = 'pan-y';

  function getWrapperStepWidth() {
      if (!wrappers.length) return 0;
      const wrapper = wrappers[0];
      const styles = window.getComputedStyle(wrapper);
      const marginLeft = parseFloat(styles.marginLeft) || 0;
      const marginRight = parseFloat(styles.marginRight) || 0;
      return wrapper.offsetWidth + marginLeft + marginRight;
  }

  function getSlideTranslate(index) {
      const containerWidth = container.offsetWidth;
      const stepWidth = getWrapperStepWidth();
      return (containerWidth / 2) - (stepWidth * index) - (stepWidth / 2);
  }

  function centerSlide(index, animated = false) {
      const targetWrapper = wrappers[index];
      if (!targetWrapper) return;

      currentIndex = index;
      currentTranslate = getSlideTranslate(index);
      prevTranslate = currentTranslate;

      if (animated) {
          track.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
      } else {
          track.style.transition = 'transform 0s ease';
      }

      setSliderPosition();
      updateActiveClass();

      if (animated) {
          setTimeout(() => {
              track.style.transition = 'transform 0s ease';
          }, 450);
      }
  }

  // Di HP, offsetWidth kadang masih 0 atau belum akurat saat 'load' baru saja
  // ditembak (address bar belum settle, font/video belum selesai layout).
  // requestAnimationFrame + sedikit delay memastikan ukuran sudah final.
  function setInitialPosition() {
      requestAnimationFrame(() => {
          requestAnimationFrame(() => {
              centerSlide(currentIndex, false);
          });
      });
  }

  // Event Listeners buat Drag/Swipe
  track.addEventListener('mousedown', dragStart);
  track.addEventListener('touchstart', dragStart, { passive: true });
  track.addEventListener('mouseup', dragEnd);
  track.addEventListener('touchend', dragEnd);
  track.addEventListener('mouseleave', dragEnd);
  track.addEventListener('mousemove', dragAction);
  track.addEventListener('touchmove', dragAction, { passive: false });

  // Cegah default drag gambar
  const imgElement = track.querySelector('img');
  if (imgElement) imgElement.addEventListener('dragstart', (e) => e.preventDefault());

  // TAP-TO-JUMP: pencet video yang belum aktif -> langsung pindah ke situ
  wrappers.forEach((wrapper, index) => {
      wrapper.addEventListener('click', (e) => {
          // Kalau ini akhir dari swipe/drag (bukan tap biasa), biarkan
          // dragEnd yang sudah handle snap-nya, jangan diproses dobel.
          if (dragMoved) {
              dragMoved = false;
              return;
          }

          hasUserInteracted = true;

          if (index !== currentIndex) {
              // Video lain diklik -> pindah & langsung mainkan dengan suara
              currentIndex = index;
              centerSlide(currentIndex, true);

              const video = wrapper.querySelector('video');
              if (video) {
                  video.muted = false;
                  video.play().catch(() => {
                      // Kalau browser tetap nolak unmuted play, fallback ke muted
                      video.muted = true;
                      video.play().catch(() => {});
                  });
              }
          } else {
              // Video yang sama (lagi aktif) diklik lagi -> toggle play/pause
              const video = wrapper.querySelector('video');
              if (video) {
                  if (video.paused) {
                      video.muted = false;
                      video.play().catch(() => {
                          video.muted = true;
                          video.play().catch(() => {});
                      });
                  } else {
                      video.pause();
                  }
              }
          }
      });
  });

  function dragStart(e) {
      isDragging = true;
      dragLocked = null;
      dragMoved = false;
      hasUserInteracted = true; // gesture user pertama, boleh mulai unmute otomatis
      startX = getPositionX(e);
      startY = getPositionY(e);
      animationID = requestAnimationFrame(animation);
      track.classList.add('grabbing');
  }

  function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      dragLocked = null;
      cancelAnimationFrame(animationID);

      const containerRect = container.getBoundingClientRect();
      const centerPoint = containerRect.left + (containerRect.width / 2);

      let closestIndex = 0;
      let minDistance = Infinity;

      wrappers.forEach((wrapper, index) => {
          const rect = wrapper.getBoundingClientRect();
          const wrapperCenter = rect.left + rect.width / 2;
          const distance = Math.abs(centerPoint - wrapperCenter);

          if (distance < minDistance) {
              minDistance = distance;
              closestIndex = index;
          }
      });

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

      // Tentukan sekali di awal gesture: ini geser horizontal (slider)
      // atau vertikal (scroll halaman)? Supaya tidak bentrok di HP.
      if (dragLocked === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
          dragLocked = Math.abs(diffX) > Math.abs(diffY);
      }

      if (dragLocked) {
          // Geser slider secara horizontal, cegah scroll halaman ikut jalan
          if (e.cancelable) e.preventDefault();
          currentTranslate = prevTranslate + diffX;
          if (Math.abs(diffX) > 8) dragMoved = true; // ini swipe, bukan tap biasa
      } else if (dragLocked === false) {
          // User sedang scroll vertikal halaman, batalkan drag slider
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

  function updateActiveClass() {
      const containerWidth = container.offsetWidth;
      const centerPoint = containerWidth / 2;

      wrappers.forEach((wrapper) => {
          const rect = wrapper.getBoundingClientRect();
          const wrapperCenter = rect.left + rect.width / 2;
          const video = wrapper.querySelector('video');

          if (Math.abs(centerPoint - wrapperCenter) < 70) {
              if (!wrapper.classList.contains('active')) {
                  wrapper.classList.add('active');
                  if (video) {
                      // Kalau user udah pernah interaksi (tap/swipe), langsung
                      // nyalain suara tanpa perlu pencet tombol unmute manual.
                      if (hasUserInteracted) {
                          video.muted = false;
                      }
                      video.play().catch(() => {
                          // Browser bisa aja tetap nolak unmuted autoplay,
                          // fallback ke muted play biar video tetap jalan.
                          video.muted = true;
                          video.play().catch(() => {});
                      });
                  }
              }
          } else {
              if (wrapper.classList.contains('active')) {
                  wrapper.classList.remove('active');
                  if (video) {
                      video.pause();
                      video.currentTime = 0;
                      video.muted = true;
                  }
              }
          }
      });
  }

  // Debounce resize: HP sering nembak event resize berkali-kali
  // (misal saat address bar Safari/Chrome collapse/expand) yang
  // sebelumnya bikin slider "loncat" tiap kali itu terjadi.
  let resizeTimeout;
  function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
          centerSlide(currentIndex, false);
      }, 120);
  }

  window.addEventListener('load', setInitialPosition);
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => {
      // Tunggu sebentar supaya browser HP selesai reflow sebelum re-center
      setTimeout(() => centerSlide(currentIndex, false), 200);
  });

  // Sebagian video baru punya ukuran pasti setelah metadata termuat,
  // jadi re-center juga di titik ini biar tetap presisi di tengah.
  wrappers.forEach((wrapper) => {
      const video = wrapper.querySelector('video');
      if (video) {
          video.addEventListener('loadedmetadata', () => {
              centerSlide(currentIndex, false);
          }, { once: true });
      }
  });

  // AUTO-PAUSE SAAT DI-SCROLL: kalau area slider keluar dari layar
  // (user scroll ke atas/bawah), video yang lagi aktif otomatis pause.
  // Begitu slider kelihatan lagi di layar, video lanjut main lagi.
  if ('IntersectionObserver' in window) {
      const scrollPauseObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
              const activeWrapper = wrappers.find((w) => w.classList.contains('active'));
              if (!activeWrapper) return;

              const video = activeWrapper.querySelector('video');
              if (!video) return;

              if (entry.isIntersecting) {
                  // Slider kelihatan lagi di layar -> lanjutkan video yang tadi aktif
                  video.play().catch(() => {});
              } else {
                  // Slider udah di-scroll keluar layar -> pause videonya
                  video.pause();
              }
          });
      }, { threshold: 0.25 }); // dianggap "keluar layar" kalau kelihatan kurang dari 25%

      scrollPauseObserver.observe(container);
  }
}