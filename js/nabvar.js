
/*-------- FUNCION PARA TOGGLE MENU --------*/
    const navbarToggler = document.getElementById('navbarToggler');
    const navbarLinks = document.getElementById('navbarLinks');

    navbarToggler.addEventListener('click', () => {
        navbarToggler.classList.toggle('opened');
        navbarLinks.classList.toggle('active');
});

/*-------- ACTIVAR LINEA DECORATIVA --------*/
const links = document.querySelectorAll('.navbar-links a');

links.forEach(link => {
  link.addEventListener('click', function () {
    links.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

/*-------- CAMBIAR COLOR NAVBAR AL HACER SCROLL --------*/
const header = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});
