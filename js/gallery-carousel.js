/**
 * TikTok Trend Carousel Slider Card Expansion
 * Magic Logic: Simple DOM Reordering triggers complex CSS nth-child transitions.
 */
document.addEventListener('DOMContentLoaded', () => {
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');
    const slide = document.getElementById('carousel-slide');

    // Proceed to next slide by pushing the first element to the end of the NodeList
    nextBtn.addEventListener('click', () => {
        let items = document.querySelectorAll('.item');
        slide.appendChild(items[0]); // DOM auto-updates triggering nth-child CSS shifts!
    });

    // Go to previous slide by pushing the last element to the beginning of the NodeList
    prevBtn.addEventListener('click', () => {
        let items = document.querySelectorAll('.item');
        slide.prepend(items[items.length - 1]); // DOM auto-updates backwards
    });
});
