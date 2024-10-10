document.querySelector('.btn-primary').addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('#demo').scrollIntoView({ behavior: 'smooth' });
});

document.addEventListener('DOMContentLoaded', function () {
    const swiper = new Swiper('.swiper-container', {
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
});


let currentSlide = 0;

function showSlide(slideIndex) {
    const slides = document.querySelectorAll('.testimonial-item');
    if (slideIndex >= slides.length) {
        currentSlide = 0;
    } else if (slideIndex < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = slideIndex;
    }
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
}

document.querySelector('.prev').addEventListener('click', () => {
    showSlide(currentSlide - 1);
});

document.querySelector('.next').addEventListener('click', () => {
    showSlide(currentSlide + 1);
});

document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            if (!item.classList.contains('active')) {
                faqItems.forEach(el => el.classList.remove('active'));
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });
});

