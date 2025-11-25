let currentSlide = 0;

function updateCarousel() {
  const items = document.querySelectorAll('.carousel-item');
  const dots = document.querySelectorAll('.carousel-indicators span');

  items.forEach((item, i) => {
    item.style.transform = `translateX(${(i - currentSlide) * 100}%)`;
    item.classList.toggle("active", i === currentSlide);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });
}

function moveSlide(dir) {
  const total = document.querySelectorAll('.carousel-item').length;
  currentSlide = (currentSlide + dir + total) % total;
  updateCarousel();
}

function goToSlide(n) {
  currentSlide = n;
  updateCarousel();
}

updateCarousel();