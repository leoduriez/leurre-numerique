"use strict";

// Désactiver les écouteurs d'événements 'unload' et 'beforeunload' pour éviter les avertissements de dépréciation
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'unload' || type === 'beforeunload') {
        // Ne pas ajouter l'écouteur d'événement déprécié
        return;
    }
    return originalAddEventListener.call(this, type, listener, options);
};

document.addEventListener('DOMContentLoaded', function() {
    
    // Éléments du DOM
    const nav = document.querySelector('.nav-container');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const parallaxSection = document.querySelector('.parallax-section');
    const parallaxBg = document.querySelector('.parallax-bg');
    const faqItems = document.querySelectorAll('.faq-item');
    const logoBg = document.querySelector('.logo-bg-image');
    const floatingBinaries = document.querySelectorAll('.floating-binary');

    // Gestion de la FAQ
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Ferme toutes les réponses
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    otherAnswer.style.maxHeight = null;
                }
            });

            // Toggle la réponse actuelle
            item.classList.toggle('active');
            if (!isActive) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = null;
            }
        });
    });

    // Variables pour le scroll
    let lastScroll = 0;
    let scrollTimer = null;
    let isScrolling = false;
    let lastScrollTop = 0;
    let ticking = false;

    // Gestion du menu mobile
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Fermer le menu mobile lors du clic sur un lien
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // Fonction principale de gestion du scroll
    function handleScroll() {
        const currentScroll = window.pageYOffset;
        
        if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(() => {
                // Gestion de la navigation
                if (currentScroll > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }

                // Effet parallaxe pour le logo en fond (sans zoom)
                if (logoBg) {
                    const scrollRate = currentScroll * 0.03;
                    logoBg.style.transform = `translate3d(0, ${scrollRate}px, 0)`;
                }
                
                // Effet parallaxe
                if (parallaxSection && parallaxBg) {
                    const rate = currentScroll * 0.5;
                    parallaxBg.style.transform = `translate3d(0, ${rate}px, 0)`;
                }

                lastScroll = currentScroll;
                isScrolling = false;
            });
        }
    }

    // Optimisation des performances avec throttling
    function throttleScroll() {
        if (scrollTimer === null) {
            scrollTimer = setTimeout(() => {
                handleScroll();
                scrollTimer = null;
            }, 10);
        }
    }

    // Écouteurs d'événements
    window.addEventListener('scroll', throttleScroll, { passive: true });
    
    // Effet de parallaxe pour le logo et les chiffres binaires basé sur la position de la souris
    document.addEventListener('mousemove', function(e) {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                // Calculer le déplacement de la souris par rapport au centre
                const mouseX = e.clientX - window.innerWidth / 2;
                const mouseY = e.clientY - window.innerHeight / 2;
                
                // Normaliser les valeurs (entre -1 et 1)
                const normalizedX = mouseX / (window.innerWidth / 2);
                const normalizedY = mouseY / (window.innerHeight / 2);
                
                // Effet de parallaxe pour le logo
                if (logoBg) {
                    // Appliquer un effet de parallaxe subtil au logo
                    const moveX = normalizedX * -15; // Mouvement horizontal inversé
                    const moveY = normalizedY * -10; // Mouvement vertical inversé
                    
                    // Combiner avec le défilement vertical
                    const scrollOffset = window.pageYOffset * 0.03;
                    
                    // Appliquer la transformation avec will-change pour la performance (sans zoom)
                    logoBg.style.transform = `translate3d(${moveX}px, ${moveY + scrollOffset}px, 0)`;
                }
                
                // Effet de parallaxe pour les chiffres binaires
                if (floatingBinaries.length > 0) {
                    floatingBinaries.forEach((binary, index) => {
                        // Déterminer la classe de l'élément pour ajuster les effets en fonction de la taille
                        const isSmall = binary.classList.contains('floating-binary-small');
                        const isMedium = binary.classList.contains('floating-binary-medium');
                        const isLarge = binary.classList.contains('floating-binary-large');
                        
                        // Ajuster les facteurs en fonction de la taille
                        let sizeFactor = 1;
                        if (isSmall) sizeFactor = 1.5; // Plus réactif pour les petits éléments
                        if (isMedium) sizeFactor = 1;
                        if (isLarge) sizeFactor = 0.7; // Moins réactif pour les grands éléments
                        
                        // Calculer le mouvement en fonction de la position de la souris
                        const moveX = normalizedX * -8 * sizeFactor;
                        const moveY = normalizedY * -5 * sizeFactor;
                        
                        // Récupérer la position initiale depuis le style inline
                        const style = window.getComputedStyle(binary);
                        const left = parseFloat(binary.style.left) || 0;
                        const top = parseFloat(binary.style.top) || 0;
                        
                        // Appliquer la transformation avec une légère rotation
                        const rotation = (normalizedX * normalizedY) * 5 * sizeFactor;
                        binary.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotate(${rotation}deg)`;
                    });
                }
                
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Défilement fluide pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = nav.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: targetPosition - navHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Gestion du redimensionnement de la fenêtre
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }, 250);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('scroll', function() {
      const scrollPosition = window.pageYOffset;
      
      // Sélectionnez votre élément parallaxe
      const parallaxElement = document.querySelector('.parallax-container');
      
      // Calculez la position de l'image de fond basée sur le défilement
      // La valeur 0.5 détermine la vitesse de l'effet (plus petit = plus lent)
      if (parallaxElement) {
        parallaxElement.style.backgroundPositionY = (scrollPosition * 0.5) + 'px';
      }
    });
  });
  

function scrollToVideoSection() {
    const videoSection = document.getElementById('video-section');
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
// Animation de la barre de navigation
let lastScroll = 0;
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        nav.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !nav.classList.contains('scroll-down')) {
        // Scroll Down
        nav.classList.remove('scroll-up');
        nav.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && nav.classList.contains('scroll-down')) {
        // Scroll Up
        nav.classList.remove('scroll-down');
        nav.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Gestion des animations au scroll - désactivée
function handleScrollAnimations() {
    // Animation désactivée - les sections sont immédiatement visibles
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        // Ne pas ajouter la classe fade-in-section
        // Ajouter directement is-visible pour que tout soit visible immédiatement
        section.classList.add('is-visible');
    });
    // Ne pas utiliser IntersectionObserver pour les animations au scroll
}

// Initialisation du site sans animations d'apparition
document.addEventListener('DOMContentLoaded', function() {
    // Rendre toutes les sections immédiatement visibles
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('is-visible');
    });
});

// La fonction de carrousel a été supprimée car nous utilisons maintenant une grille pour afficher les shorts

// Gestion du bouton de retour en haut de page
document.addEventListener('DOMContentLoaded', () => {
    const backToTopBtn = document.getElementById('back-to-top');
    const nav = document.querySelector('nav');
    let lastScrollTop = 0;
    let navVisible = true;
    
    // Fonction pour faire défiler la page vers le haut
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    // Ajouter un écouteur d'événement au bouton
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
        // Rendre le bouton visible immédiatement
        backToTopBtn.classList.remove('hidden');
        backToTopBtn.classList.add('visible');
    }
    
    // Fonction pour gérer l'affichage de la barre de navigation en fonction du défilement
    const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Détecter si l'utilisateur défile vers le bas et a dépassé 200px
        if (scrollTop > 200) {
            // Détecter si la navigation est visible ou non
            if (scrollTop > lastScrollTop && navVisible) {
                // Défilement vers le bas, masquer la navigation
                nav.style.transform = 'translateY(-100%)';
                navVisible = false;
            } else if (scrollTop < lastScrollTop && !navVisible) {
                // Défilement vers le haut, afficher la navigation
                nav.style.transform = 'translateY(0)';
                navVisible = true;
            }
        } else {
            // S'assurer que la navigation est visible
            nav.style.transform = 'translateY(0)';
            navVisible = true;
        }
        
        lastScrollTop = scrollTop;
    };
    
    // Ajouter un écouteur d'événement pour le défilement
    window.addEventListener('scroll', handleScroll);
});

// Gestion du curseur personnalisé
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);

    // Variables pour stocker la position de la souris
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let ringX = 0;
    let ringY = 0;
    
    // Utilisation de requestAnimationFrame pour une animation plus fluide
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Détection de la position dans la navigation
    function isInNavigation(y) {
        const navHeight = 64; // Hauteur approximative de la barre de navigation
        return y <= navHeight;
    }
    
    // Animation fluide du curseur
    function animateCursor() {
        // Vérifier si le curseur est dans la zone de navigation
        const inNav = isInNavigation(mouseY);
        
        // Interpolation pour le curseur principal (plus rapide dans la navigation)
        const cursorSpeed = inNav ? 0.9 : 0.8;
        cursorX += (mouseX - cursorX) * cursorSpeed;
        cursorY += (mouseY - cursorY) * cursorSpeed;
        
        // Interpolation pour l'anneau (plus rapide dans la navigation)
        const ringSpeed = inNav ? 0.7 : 0.5;
        ringX += (mouseX - ringX) * ringSpeed;
        ringY += (mouseY - ringY) * ringSpeed;
        
        // Application des positions
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    // Lancement de l'animation
    animateCursor();

    // Ajouter la classe hover sur les éléments interactifs (en excluant le logo)
    const interactiveElements = document.querySelectorAll('a:not(.nav-logo), button, .nav-link, .video-redirect-btn, .faq-item');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            ring.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            ring.classList.remove('hover');
        });
    });
});

// Gestion du menu mobile
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});





// ANIMATION PARALLAX AVANCÉE
document.addEventListener('DOMContentLoaded', function() {
    // Sélectionner les couches parallax
    const parallaxLayers = {
        bg: document.querySelector('.layer-bg'),
        mid: document.querySelector('.layer-mid'),
        front: document.querySelector('.layer-front'),
        closest: document.querySelector('.layer-closest'),
        stars: document.querySelector('.stars-bg'),
        floatingElements: document.querySelectorAll('.floating-binary')
    };
    
    // Coefficients de vitesse pour chaque couche (plus le nombre est grand, plus le mouvement est important)
    const speedFactors = {
        bg: 0.05,      // Très lent (arrière-plan)
        mid: 0.1,      // Lent (milieu)
        front: 0.2,    // Moyen (avant-plan)
        closest: 0.3,  // Rapide (premier plan)
        stars: 0.03,   // Extrêmement lent (fond étoilé)
        floatingMin: 0.15, // Vitesse minimale pour les éléments flottants
        floatingMax: 0.25  // Vitesse maximale pour les éléments flottants
    };
    
    // Variables pour le suivi du défilement et du mouvement de la souris
    let lastScrollY = window.scrollY;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let ticking = false;
    let scrollTicking = false;
    let lastTime = Date.now();
    let deltaTime = 0;
    
    // Fonction pour calculer le temps écoulé entre les frames pour des animations fluides
    function updateDeltaTime() {
        const now = Date.now();
        deltaTime = (now - lastTime) / 1000; // Convertir en secondes
        lastTime = now;
        return deltaTime;
    }
    
    // Fonction pour mettre à jour les transformations des couches parallax
    function updateParallaxLayers() {
        // Calculer la différence de défilement
        const scrollDiff = window.scrollY - lastScrollY;
        const scrollDirection = Math.sign(scrollDiff); // 1 pour descendre, -1 pour monter
        const scrollAmount = Math.abs(scrollDiff); // Quantité de défilement
        
        // Facteur de lissage amélioré pour rendre le mouvement plus fluide
        const smoothingFactor = 0.15; // Augmenté pour plus de fluidité
        
        // Utiliser requestAnimationFrame pour optimiser les performances
        // Mettre à jour chaque couche avec un effet de parallaxe
        if (parallaxLayers.bg) {
            // La couche d'arrière-plan se déplace lentement dans la direction opposée au défilement
            const currentTransform = getTransformValues(parallaxLayers.bg);
            // Appliquer un easing pour un mouvement plus naturel
            const targetY = currentTransform.y - (scrollDiff * speedFactors.bg);
            const newY = currentTransform.y + (targetY - currentTransform.y) * smoothingFactor;
            // Utiliser translate3d pour forcer l'accélération matérielle
            parallaxLayers.bg.style.transform = `translate3d(0, ${newY}px, 0)`;
            // Ajouter will-change pour optimiser les performances
            parallaxLayers.bg.style.willChange = 'transform';
        }
        
        if (parallaxLayers.mid) {
            // La couche du milieu se déplace plus rapidement
            const currentTransform = getTransformValues(parallaxLayers.mid);
            const targetY = currentTransform.y - (scrollDiff * speedFactors.mid);
            const newY = currentTransform.y + (targetY - currentTransform.y) * smoothingFactor;
            parallaxLayers.mid.style.transform = `translate3d(0, ${newY}px, 0)`;
            parallaxLayers.mid.style.willChange = 'transform';
        }
        
        if (parallaxLayers.front) {
            // La couche d'avant-plan se déplace encore plus rapidement
            const currentTransform = getTransformValues(parallaxLayers.front);
            const targetY = currentTransform.y - (scrollDiff * speedFactors.front);
            const newY = currentTransform.y + (targetY - currentTransform.y) * smoothingFactor;
            parallaxLayers.front.style.transform = `translate3d(0, ${newY}px, 0)`;
            parallaxLayers.front.style.willChange = 'transform';
        }
        
        if (parallaxLayers.closest) {
            // La couche la plus proche se déplace très rapidement
            const currentTransform = getTransformValues(parallaxLayers.closest);
            const targetY = currentTransform.y - (scrollDiff * speedFactors.closest);
            const newY = currentTransform.y + (targetY - currentTransform.y) * smoothingFactor;
            parallaxLayers.closest.style.transform = `translate3d(0, ${newY}px, 0)`;
            parallaxLayers.closest.style.willChange = 'transform';
        }
        
        if (parallaxLayers.stars) {
            // Le fond étoilé se déplace très lentement
            const currentTransform = getTransformValues(parallaxLayers.stars);
            const targetY = currentTransform.y - (scrollDiff * speedFactors.stars);
            const newY = currentTransform.y + (targetY - currentTransform.y) * smoothingFactor;
            parallaxLayers.stars.style.transform = `translate3d(0, ${newY}px, 0)`;
            parallaxLayers.stars.style.willChange = 'transform';
        }
        
        // Mettre à jour les éléments flottants avec des vitesses variables et des effets améliorés
        if (parallaxLayers.floatingElements) {
            parallaxLayers.floatingElements.forEach((element, index) => {
                // Déterminer la classe de l'élément pour ajuster les effets en fonction de la taille
                const isSmall = element.classList.contains('floating-binary-small');
                const isMedium = element.classList.contains('floating-binary-medium');
                const isLarge = element.classList.contains('floating-binary-large');
                
                // Ajuster les facteurs en fonction de la taille
                let sizeFactor = 1;
                if (isSmall) sizeFactor = 1.2; // Plus rapide pour les petits éléments
                if (isMedium) sizeFactor = 1;
                if (isLarge) sizeFactor = 0.8; // Plus lent pour les grands éléments
                
                // Chaque élément a une vitesse légèrement différente
                const elementSpeed = (speedFactors.floatingMin + 
                    (index / parallaxLayers.floatingElements.length) * 
                    (speedFactors.floatingMax - speedFactors.floatingMin)) * sizeFactor;
                
                // Récupérer la transformation actuelle
                const currentTransform = getTransformValues(element);
                
                // Calculer la nouvelle position Y avec un mouvement plus fluide en utilisant easing
                const targetY = currentTransform.y - (scrollDiff * elementSpeed);
                const newY = currentTransform.y + (targetY - currentTransform.y) * easeInOutCubic(smoothingFactor);
                
                // Appliquer une légère rotation en fonction du défilement avec easing
                const baseRotation = scrollDiff * 0.01 * (index % 2 === 0 ? 1 : -1);
                const currentRotation = currentTransform.rotation || 0;
                const targetRotation = currentRotation + baseRotation;
                const newRotation = currentRotation + (targetRotation - currentRotation) * easeOutQuad(smoothingFactor);
                
                // Ajouter un léger mouvement horizontal sinusoïdal pour plus de dynamisme
                const time = Date.now() * 0.001; // Temps en secondes
                const horizontalOffset = Math.sin(time * 0.5 + index) * 2 * sizeFactor;
                
                // Appliquer la nouvelle transformation avec rotation et décalage horizontal
                element.style.transform = `translate3d(${horizontalOffset}px, ${newY}px, 0) rotate(${newRotation}deg)`;
                element.style.willChange = 'transform, opacity';
                
                // Ajuster l'opacité en fonction de la position de défilement avec transition douce
                const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
                const targetOpacity = Math.max(0.3, 1 - scrollPercent * 0.5);
                const currentOpacity = parseFloat(element.style.opacity || 0.6);
                const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * smoothingFactor;
                element.style.opacity = newOpacity;
                
                // Ajouter un effet de flou progressif avec transition douce
                const targetBlur = Math.min(3, scrollPercent * 5);
                const currentBlur = parseFloat((element.style.filter || 'blur(0px)').replace(/[^\d.]/g, '') || 0);
                const newBlur = currentBlur + (targetBlur - currentBlur) * smoothingFactor;
                element.style.filter = `blur(${newBlur}px)`;
            });
        }
        
        // Mettre à jour la position de défilement
        lastScrollY = window.scrollY;
        ticking = false;
    }
    
    // Fonction optimisée pour extraire les valeurs de transformation actuelles
    function getTransformValues(element) {
        const transform = element.style.transform;
        let x = 0, y = 0, z = 0, rotation = 0;
        
        if (transform && transform !== 'none') {
            const matches = transform.match(/translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
            if (matches) {
                x = parseFloat(matches[1]);
                y = parseFloat(matches[2]);
                z = parseFloat(matches[3]);
            } else {
                const translateYMatch = transform.match(/translateY\(([^)]+)\)/);
                if (translateYMatch) {
                    y = parseFloat(translateYMatch[1]);
                }
            }
            
            // Extraire également la rotation si présente
            const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
            if (rotateMatch) {
                rotation = parseFloat(rotateMatch[1]);
            }
        }
        
        return { x, y, z, rotation };
    }
    
    // Fonctions d'easing pour des transitions plus fluides
    function easeOutQuad(t) {
        return t * (2 - t);
    }
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // Fonction optimisée pour ajouter un effet de parallaxe basé sur la position de la souris
    function handleMouseMove(e) {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                // Calculer le déplacement de la souris par rapport au centre
                const mouseX = e.clientX - window.innerWidth / 2;
                const mouseY = e.clientY - window.innerHeight / 2;
                
                // Normaliser les valeurs (entre -1 et 1)
                const normalizedX = mouseX / (window.innerWidth / 2);
                const normalizedY = mouseY / (window.innerHeight / 2);
                
                // Stocker les dernières positions de la souris pour les transitions fluides
                const mouseXDiff = normalizedX - lastMouseX;
                const mouseYDiff = normalizedY - lastMouseY;
                lastMouseX = normalizedX;
                lastMouseY = normalizedY;
                
                // Appliquer un effet de parallaxe amélioré basé sur la position de la souris
                if (parallaxLayers.floatingElements) {
                    parallaxLayers.floatingElements.forEach((element, index) => {
                        // Déterminer la classe de l'élément pour ajuster les effets en fonction de la taille
                        const isSmall = element.classList.contains('floating-binary-small');
                        const isMedium = element.classList.contains('floating-binary-medium');
                        const isLarge = element.classList.contains('floating-binary-large');
                        
                        // Ajuster les facteurs en fonction de la taille
                        let sizeFactor = 1;
                        let responsiveness = 0.1; // Facteur de réactivité (plus petit = plus fluide)
                        
                        if (isSmall) {
                            sizeFactor = 1.5; // Plus réactif pour les petits éléments
                            responsiveness = 0.15;
                        } else if (isMedium) {
                            sizeFactor = 1;
                            responsiveness = 0.1;
                        } else if (isLarge) {
                            sizeFactor = 0.7; // Moins réactif pour les grands éléments
                            responsiveness = 0.05;
                        }
                        
                        const depth = (0.5 + (index / parallaxLayers.floatingElements.length) * 2) * sizeFactor;
                        
                        // Récupérer la transformation actuelle
                        const currentTransform = getTransformValues(element);
                        
                        // Calculer le mouvement cible avec un facteur d'amortissement pour plus de fluidité
                        const targetX = normalizedX * depth * 8; // Amplifier le mouvement horizontal
                        const targetY = normalizedY * depth * 4; // Mouvement vertical plus subtil
                        
                        // Appliquer une transition fluide en utilisant easing
                        const currentX = currentTransform.x || 0;
                        const newX = currentX + (targetX - currentX) * easeOutQuad(responsiveness);
                        
                        // Ajouter une légère rotation basée sur la position de la souris et sa vitesse
                        const rotateZ = (normalizedX * normalizedY) * 2 + (mouseXDiff * mouseYDiff) * 10;
                        const currentRotation = currentTransform.rotation || 0;
                        const targetRotation = rotateZ * sizeFactor;
                        const newRotation = currentRotation + (targetRotation - currentRotation) * easeOutQuad(responsiveness);
                        
                        // Combiner le mouvement de défilement avec le mouvement de la souris
                        // Utiliser translate3d pour forcer l'accélération matérielle
                        element.style.transform = `translate3d(${newX}px, ${currentTransform.y}px, 0) rotate(${newRotation}deg)`;
                        
                        // Ajouter un effet de profondeur en ajustant l'échelle en fonction de la position de la souris
                        const scaleEffect = 1 + (Math.abs(normalizedX) + Math.abs(normalizedY)) * 0.05 * sizeFactor;
                        element.style.transform = `translate3d(${newX}px, ${currentTransform.y}px, 0) rotate(${newRotation}deg) scale(${scaleEffect})`;
                    });
                }
                
                ticking = false;
            });
            
            ticking = true;
        }
    }
    
    // Optimiser les performances en limitant les appels d'animation lors du défilement
    window.addEventListener('scroll', function() {
        if (!scrollTicking) {
            window.requestAnimationFrame(function() {
                updateDeltaTime(); // Mettre à jour le temps entre les frames
                updateParallaxLayers();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });
    
    // Ajouter l'effet de parallaxe basé sur la position de la souris avec throttling pour de meilleures performances
    let lastMouseMoveTime = 0;
    const mouseMoveThrottleInterval = 16; // Environ 60fps
    
    document.addEventListener('mousemove', function(e) {
        const now = Date.now();
        if (now - lastMouseMoveTime > mouseMoveThrottleInterval) {
            handleMouseMove(e);
            lastMouseMoveTime = now;
        }
    }, { passive: true });
    
    // Initialiser les positions
    updateDeltaTime();
    updateParallaxLayers();
    
    // Utiliser requestAnimationFrame pour des animations continues et fluides
    function animateBackground() {
        updateDeltaTime();
        
        // Animer subtilement les éléments flottants même sans interaction
        if (parallaxLayers.floatingElements && !scrollTicking) {
            const time = Date.now() * 0.001; // Temps en secondes
            
            parallaxLayers.floatingElements.forEach((element, index) => {
                // Animation subtile continue pour plus de fluidité
                const currentTransform = getTransformValues(element);
                const waveFactor = Math.sin(time * 0.5 + index * 0.2) * 0.5;
                const horizontalWave = Math.sin(time * 0.3 + index * 0.5) * 1;
                
                // Combiner avec la position actuelle pour un mouvement fluide
                const x = currentTransform.x || 0;
                const y = currentTransform.y || 0;
                const rotation = currentTransform.rotation || 0;
                
                // Appliquer un mouvement subtil
                element.style.transform = `translate3d(${x + horizontalWave}px, ${y + waveFactor}px, 0) rotate(${rotation + waveFactor * 0.2}deg)`;
            });
        }
        
        // Continuer l'animation
        requestAnimationFrame(animateBackground);
    }
    
    // Démarrer l'animation continue
    requestAnimationFrame(animateBackground);
});


function sendEmail(event) {
    event.preventDefault();
    
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Ici, vous pouvez ajouter le code pour envoyer l'email
    // Par exemple, en utilisant EmailJS ou en faisant une requête à votre backend
    
    // Exemple d'alerte de confirmation (à remplacer par votre logique d'envoi d'email)
    alert('Merci ' + firstname + ' ' + lastname + ' ! Votre message a été envoyé avec succès. Nous vous répondrons prochainement à ' + email);
    
    // Réinitialiser le formulaire
    document.getElementById('contactForm').reset();
}



// Ajouter ce code à votre fichier script.js existant

// Fonction pour gérer l'accordéon des mentions légales
document.addEventListener('DOMContentLoaded', function() {
    const mentionsBtn = document.getElementById('mentions-legales-btn');
    const mentionsContent = document.getElementById('mentions-legales-content');
    const mentionsArrow = mentionsBtn.querySelector('svg');
    
    if (mentionsBtn && mentionsContent) {
        mentionsBtn.addEventListener('click', function() {
            // Toggle l'état de l'accordéon
            const isOpen = mentionsContent.classList.contains('active');
            
            if (isOpen) {
                // Fermer l'accordéon
                mentionsContent.style.maxHeight = '0';
                mentionsContent.classList.remove('active');
                mentionsArrow.classList.remove('rotate-180');
            } else {
                // Ouvrir l'accordéon
                mentionsContent.classList.add('active');
                mentionsContent.style.maxHeight = mentionsContent.scrollHeight + 'px';
                mentionsArrow.classList.add('rotate-180');
            }
        });
    }
});

// Animation des nombres binaires suivant le défilement (scroll)
document.addEventListener('DOMContentLoaded', function() {
    const floatingBinaries = document.querySelectorAll('.floating-binary');
    if (floatingBinaries.length === 0) return;
    
    // Configuration des paramètres d'animation
    const config = {
        scrollFactor: 0.1,         // Vitesse de suivi du scroll (plus petit = plus lent)
        scrollSmoothing: 0.05,     // Lissage du mouvement (plus petit = plus fluide)
        baseOscillation: 5,        // Amplitude de l'oscillation autonome
        oscillationSpeed: 0.5,     // Vitesse de l'oscillation autonome
        rotationFactor: 0.02,      // Facteur de rotation lors du défilement
        minOpacity: 0.7,           // Opacité minimale des éléments en défilement
        maxOpacity: 1,             // Opacité maximale
        scaleRange: 0.1            // Variation d'échelle en fonction du défilement
    };
    
    // Enregistrer la position initiale et état de chaque élément binaire
    const elements = Array.from(floatingBinaries).map((el, index) => {
        // Déterminer le facteur de taille selon la classe
        const isSmall = el.classList.contains('floating-binary-small');
        const isMedium = el.classList.contains('floating-binary-medium');
        const isLarge = el.classList.contains('floating-binary-large');
        
        // Calculer les facteurs en fonction de la taille
        let sizeFactor = 1;
        let scrollResponse = config.scrollFactor;
        
        if (isSmall) {
            sizeFactor = 1.3;
            scrollResponse = config.scrollFactor * 1.2;  // Les petits éléments réagissent plus vite
        } else if (isMedium) {
            sizeFactor = 1;
            scrollResponse = config.scrollFactor;
        } else if (isLarge) {
            sizeFactor = 0.7;
            scrollResponse = config.scrollFactor * 0.8;  // Les grands éléments sont plus lents
        }
        
        // Paramètres uniques pour chaque élément
        const phaseX = Math.random() * Math.PI * 2;
        const phaseY = Math.random() * Math.PI * 2;
        const phaseRotation = Math.random() * Math.PI * 2;
        
        // Position initiale
        const rect = el.getBoundingClientRect();
        const initialY = rect.top + window.scrollY;
        
        return {
            element: el,
            sizeFactor,
            scrollResponse,
            phaseX,
            phaseY,
            phaseRotation,
            initialY,
            targetY: initialY,
            currentY: initialY,
            baseX: parseFloat(el.style.left || 0),
            currentX: 0,
            currentRotation: 0,
            direction: index % 2 === 0 ? 1 : -1  // Alterner la direction pour plus de variété
        };
    });
    
    // Variable pour suivre la position de défilement
    let lastScrollY = window.scrollY;
    let scrollDirection = 0;
    let scrollSpeed = 0;
    let scrollAcceleration = 0;
    let lastScrollTime = Date.now();
    
    // Fonction pour calculer la vitesse et direction du défilement
    function updateScrollMetrics() {
        const now = Date.now();
        const elapsed = (now - lastScrollTime) / 1000; // en secondes
        lastScrollTime = now;
        
        const currentScrollY = window.scrollY;
        const scrollDiff = currentScrollY - lastScrollY;
        
        // Calcul de la direction (-1: vers le haut, 1: vers le bas)
        scrollDirection = Math.sign(scrollDiff);
        
        // Calcul de la vitesse de défilement (pixels par seconde)
        scrollSpeed = Math.abs(scrollDiff) / Math.max(0.016, elapsed);
        
        // Limiter la vitesse pour éviter les sauts trop brusques
        scrollSpeed = Math.min(1000, scrollSpeed);
        
        // Mise à jour de la dernière position
        lastScrollY = currentScrollY;
    }
    
    // Fonction pour animer les éléments binaires
    function animateBinariesOnScroll() {
        const time = Date.now() * 0.001; // Temps en secondes
        const scrollY = window.scrollY;
        
        // Facteur de parallaxe basé sur la position de défilement
        const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);
        
        elements.forEach(item => {
            // Calculer la nouvelle position verticale cible par rapport au défilement
            // On ajoute un décalage basé sur le défilement pour suivre l'utilisateur
            item.targetY = item.initialY + (scrollY * item.scrollResponse * item.direction);
            
            // Appliquer un mouvement fluide avec interpolation
            item.currentY += (item.targetY - item.currentY) * config.scrollSmoothing;
            
            // Ajouter des oscillations autonomes pour plus de dynamisme
            const oscillationX = Math.sin(time * config.oscillationSpeed + item.phaseX) * 
                                config.baseOscillation * item.sizeFactor;
            
            const oscillationY = Math.sin(time * config.oscillationSpeed * 0.7 + item.phaseY) * 
                                config.baseOscillation * item.sizeFactor;
            
            // Rotation modulée par la vitesse de défilement et l'oscillation
            const rotationAmount = (scrollSpeed * config.rotationFactor * scrollDirection * item.direction) + 
                                 (Math.sin(time * 0.3 + item.phaseRotation) * 2 * item.sizeFactor);
            
            item.currentRotation += (rotationAmount - item.currentRotation) * 0.05;
            
            // Calculer l'opacité basée sur la vitesse de défilement (plus rapide = plus transparent)
            const normalizedSpeed = Math.min(1, scrollSpeed / 500);
            const targetOpacity = config.maxOpacity - (normalizedSpeed * (config.maxOpacity - config.minOpacity));
            
            // Calculer l'échelle basée sur la direction et vitesse de défilement
            const scaleModifier = 1 + (scrollDirection * normalizedSpeed * config.scaleRange);
            
            // Appliquer la transformation
            const transformY = item.currentY - window.scrollY; // Ajuster selon la position de viewport
            item.element.style.transform = `translate3d(${item.baseX + oscillationX}px, ${transformY + oscillationY}px, 0) 
                                           rotate(${item.currentRotation}deg) 
                                           scale(${scaleModifier * item.sizeFactor})`;
            
            // Ajuster l'opacité
            item.element.style.opacity = targetOpacity;
        });
        
        // Continuer l'animation
        requestAnimationFrame(animateBinariesOnScroll);
    }
    
    // Écouteur d'événement pour le défilement
    window.addEventListener('scroll', updateScrollMetrics, { passive: true });
    
    // Initialiser les métriques de défilement
    updateScrollMetrics();
    
    // Démarrer l'animation
    animateBinariesOnScroll();
});

// Animation des nombres binaires avec traitement spécial pour les éléments bleus
document.addEventListener('DOMContentLoaded', function() {
    const floatingBinaries = document.querySelectorAll('.floating-binary');
    if (floatingBinaries.length === 0) return;
    
    // Configuration générale
    const config = {
        // Paramètres généraux
        scrollSmoothing: 0.05,     // Lissage du mouvement (plus petit = plus fluide)
        baseOscillation: 5,        // Amplitude de l'oscillation autonome
        oscillationSpeed: 0.5,     // Vitesse de l'oscillation autonome
        rotationFactor: 0.02,      // Facteur de rotation lors du défilement
        minOpacity: 0.7,           // Opacité minimale des éléments en défilement
        maxOpacity: 1,             // Opacité maximale
        scaleRange: 0.1,           // Variation d'échelle en fonction du défilement
        
        // Paramètres spécifiques pour les éléments bleus
        blueScrollFactor: 0.2,     // Les éléments bleus suivent plus fortement le scroll (2x standard)
        blueScrollDirection: -1,   // Direction inverse pour les bleus (-1 = opposé au scroll)
        blueAmplitudeBoost: 1.5,   // Amplitude d'oscillation amplifiée pour les bleus
        blueRotationBoost: 1.5,    // Rotation amplifiée pour les éléments bleus
        
        // Paramètres standard pour les autres éléments
        defaultScrollFactor: 0.1   // Vitesse standard de suivi du scroll
    };
    
    // Enregistrer la position initiale et état de chaque élément binaire
    const elements = Array.from(floatingBinaries).map((el, index) => {
        // Déterminer la taille de l'élément
        const isSmall = el.classList.contains('floating-binary-small');
        const isMedium = el.classList.contains('floating-binary-medium');
        const isLarge = el.classList.contains('floating-binary-large');
        
        // Déterminer si l'élément est bleu (en inspectant la couleur de l'élément)
        const style = window.getComputedStyle(el);
        const color = style.color || style.fill || '';
        const isBlue = color.includes('rgb(0, 0, 255)') || 
                     color.includes('rgb(0,0,255)') || 
                     color.includes('blue') || 
                     el.classList.contains('blue') ||
                     el.classList.contains('floating-binary-blue');
        
        // Calculer les facteurs en fonction de la taille et de la couleur
        let sizeFactor = 1;
        let scrollResponse;
        
        // Ajuster le facteur de taille selon la classe
        if (isSmall) sizeFactor = 1.3;
        else if (isMedium) sizeFactor = 1;
        else if (isLarge) sizeFactor = 0.7;
        
        // Appliquer un comportement différent pour les éléments bleus
        if (isBlue) {
            scrollResponse = config.blueScrollFactor * (isSmall ? 1.2 : isLarge ? 0.8 : 1);
        } else {
            scrollResponse = config.defaultScrollFactor * (isSmall ? 1.2 : isLarge ? 0.8 : 1);
        }
        
        // Paramètres uniques pour chaque élément
        const phaseX = Math.random() * Math.PI * 2;
        const phaseY = Math.random() * Math.PI * 2;
        const phaseRotation = Math.random() * Math.PI * 2;
        
        // Position initiale
        const rect = el.getBoundingClientRect();
        const initialY = rect.top + window.scrollY;
        const initialX = rect.left;
        
        return {
            element: el,
            isBlue,
            sizeFactor,
            scrollResponse,
            phaseX,
            phaseY,
            phaseRotation,
            initialY,
            initialX,
            targetY: initialY,
            currentY: initialY,
            baseX: parseFloat(el.style.left || initialX || 0),
            currentX: 0,
            currentRotation: 0,
            direction: isBlue ? 
                      config.blueScrollDirection : // Direction spéciale pour les bleus
                      (index % 2 === 0 ? 1 : -1)   // Alternance pour les non-bleus
        };
    });
    
    // Variables pour le suivi du défilement
    let lastScrollY = window.scrollY;
    let scrollDirection = 0;
    let scrollSpeed = 0;
    let lastScrollTime = Date.now();
    
    // Fonction pour calculer les métriques de défilement
    function updateScrollMetrics() {
        const now = Date.now();
        const elapsed = (now - lastScrollTime) / 1000; // en secondes
        lastScrollTime = now;
        
        const currentScrollY = window.scrollY;
        const scrollDiff = currentScrollY - lastScrollY;
        
        // Calcul de la direction (-1: vers le haut, 1: vers le bas)
        scrollDirection = Math.sign(scrollDiff);
        
        // Calcul de la vitesse de défilement (pixels par seconde)
        scrollSpeed = Math.abs(scrollDiff) / Math.max(0.016, elapsed);
        
        // Limiter la vitesse pour éviter les sauts trop brusques
        scrollSpeed = Math.min(1000, scrollSpeed);
        
        // Mise à jour de la dernière position
        lastScrollY = currentScrollY;
    }
    
    // Fonction principale d'animation
    function animateBinariesOnScroll() {
        const time = Date.now() * 0.001; // Temps en secondes
        const scrollY = window.scrollY;
        
        // Facteur de progression du scroll (0 à 1)
        const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);
        
        elements.forEach(item => {
            // Appliquer des effets différents selon la couleur
            const amplitudeMultiplier = item.isBlue ? config.blueAmplitudeBoost : 1;
            const rotationMultiplier = item.isBlue ? config.blueRotationBoost : 1;
            
            // Position verticale cible basée sur le défilement
            item.targetY = item.initialY + (scrollY * item.scrollResponse * item.direction);
            
            // Mouvement fluide avec interpolation
            item.currentY += (item.targetY - item.currentY) * config.scrollSmoothing;
            
            // Oscillations autonomes amplifiées pour les éléments bleus
            const oscillationX = Math.sin(time * config.oscillationSpeed + item.phaseX) * 
                                config.baseOscillation * item.sizeFactor * amplitudeMultiplier;
            
            const oscillationY = Math.sin(time * config.oscillationSpeed * 0.7 + item.phaseY) * 
                                config.baseOscillation * item.sizeFactor * amplitudeMultiplier;
            
            // Rotation avec effet amplifié pour les bleus
            const rotationAmount = (scrollSpeed * config.rotationFactor * scrollDirection * item.direction * rotationMultiplier) + 
                                 (Math.sin(time * 0.3 + item.phaseRotation) * 2 * item.sizeFactor);
            
            // Lissage de la rotation
            item.currentRotation += (rotationAmount - item.currentRotation) * 0.05;
            
            // Opacité basée sur la vitesse de défilement
            const normalizedSpeed = Math.min(1, scrollSpeed / 500);
            const targetOpacity = config.maxOpacity - (normalizedSpeed * (config.maxOpacity - config.minOpacity));
            
            // Échelle basée sur la direction et vitesse de défilement
            const scaleModifier = 1 + (scrollDirection * normalizedSpeed * config.scaleRange);
            
            // Appliquer la transformation
            // Pour les éléments bleus, on applique un effet plus marqué
            const transformY = item.currentY - window.scrollY; // Ajuster selon la position de viewport
            
            // Effet spécial pour les éléments bleus: déplacement vertical plus prononcé avec le scroll
            const blueBoost = item.isBlue ? (scrollY * 0.05 * item.direction) : 0;
            
            item.element.style.transform = `translate3d(${item.baseX + oscillationX}px, ${transformY + oscillationY + blueBoost}px, 0) 
                                           rotate(${item.currentRotation}deg) 
                                           scale(${scaleModifier * item.sizeFactor})`;
            
            // Ajuster l'opacité
            item.element.style.opacity = targetOpacity;
        });
        
        // Continuer l'animation
        requestAnimationFrame(animateBinariesOnScroll);
    }
    
    // Écouteur d'événement pour le défilement
    window.addEventListener('scroll', updateScrollMetrics, { passive: true });
    
    // Initialiser les métriques de défilement
    updateScrollMetrics();
    
    // Démarrer l'animation
    animateBinariesOnScroll();
});