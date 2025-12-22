// SCROLL HEADER - Comportement sticky avec reduction au scroll

var lastScrollTop = 0;
var scrollThreshold = 50; // Seuil de scroll pour déclencher la réduction

function initScrollHeader() {
    var header = document.querySelector('.header-fr');
    var navigation = document.querySelector('.navigation');

    if (!header || !navigation) return;

    window.addEventListener('scroll', function() {
        var currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // Ajouter la classe "scrolled" si on a scrollé au-delà du seuil
        if (currentScroll > scrollThreshold) {
            header.classList.add('scrolled');
            navigation.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
            navigation.classList.remove('scrolled');
        }

        lastScrollTop = currentScroll;
    });
}

// Initialiser après le rendu
window.initScrollHeader = initScrollHeader;
