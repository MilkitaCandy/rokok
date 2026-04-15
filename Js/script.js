
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

// 4. SMOOTH SCROLLING
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    const headerOffset = 80;
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
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
