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
========================================= */
const container = document.getElementById('sliderContainer');
const track = document.getElementById('videoTrack');

// Cek apakah element slider ada di halaman ini (biar gak error di page lain)
if (container && track) {
  const wrappers = Array.from(track.querySelectorAll('.video-wrapper'));

  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;
  let currentIndex = 0;

  function setInitialPosition() {
      const containerWidth = container.offsetWidth;
      const wrapperWidth = wrappers[0].offsetWidth + 30; // Lebar + Margin
      currentTranslate = (containerWidth / 2) - (wrapperWidth / 2) - 15; 
      prevTranslate = currentTranslate;
      setSliderPosition();
      updateActiveClass();
  }

  // Event Listeners buat Drag/Swipe
  track.addEventListener('mousedown', dragStart);
  track.addEventListener('touchstart', dragStart, {passive: true});
  track.addEventListener('mouseup', dragEnd);
  track.addEventListener('touchend', dragEnd);
  track.addEventListener('mouseleave', dragEnd);
  track.addEventListener('mousemove', dragAction);
  track.addEventListener('touchmove', dragAction, {passive: true});

  // Cegah default drag gambar
  const imgElement = track.querySelector('img');
  if (imgElement) imgElement.addEventListener('dragstart', (e) => e.preventDefault());

  function dragStart(e) {
      isDragging = true;
      startX = getPositionX(e);
      animationID = requestAnimationFrame(animation);
      track.classList.add('grabbing');
  }

  function dragEnd() {
      isDragging = false;
      cancelAnimationFrame(animationID);
      
      const containerWidth = container.offsetWidth;
      const centerPoint = containerWidth / 2;

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
      if (isDragging) {
          const currentX = getPositionX(e);
          const currentMv = currentX - startX;
          currentTranslate = prevTranslate + currentMv;
      }
  }

  function getPositionX(e) {
      return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
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
      const containerWidth = container.offsetWidth;
      const wrapperWidth = wrappers[0].offsetWidth + 30;
      currentTranslate = (containerWidth / 2) - (wrapperWidth * currentIndex) - (wrapperWidth / 2);
      prevTranslate = currentTranslate;
      
      track.style.transition = 'transform 0.5s ease-out';
      setSliderPosition();
      updateActiveClass();
      
      setTimeout(() => {
          track.style.transition = 'transform 0s ease';
      }, 500);
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
                  if (video) video.play().catch(() => {});
              }
          } else {
              if (wrapper.classList.contains('active')) {
                  wrapper.classList.remove('active');
                  if (video) {
                      video.pause();
                      video.currentTime = 0; 
                      video.muted = true;
                      const btn = wrapper.querySelector('.unmute-btn');
                      if (btn) btn.innerText = "Suara Mati";
                  }
              }
          }
      });
  }

  window.addEventListener('load', setInitialPosition);
  window.addEventListener('resize', setInitialPosition);
}


/* =========================================
   7. FUNGSI CUSTOM UNMUTE VIDEO (UPDATED)
========================================= */
function toggleMute(btn) {
  const wrapper = btn.closest('.video-wrapper');
  
  // Mencegah error kalau misal klik mute tapi bukan video yang di tengah (active)
  if(!wrapper || !wrapper.classList.contains('active')) return;

  const video = wrapper.querySelector('video');
  if(video) {
      if (video.muted) {
        video.muted = false; 
        btn.innerHTML = "Suara Nyala"; // Update teks tombol
      } else {
        video.muted = true; 
        btn.innerHTML = "Suara Mati"; // Update teks tombol
      }
  }
}