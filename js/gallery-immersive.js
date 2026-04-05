document.addEventListener('DOMContentLoaded', () => {
    // 1. Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const masonryItems = document.querySelectorAll('.masonry-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active', 'bg-silat-gold', 'text-black'));
            filterBtns.forEach(b => b.classList.add('bg-transparent', 'text-silat-gold'));
            btn.classList.add('active', 'bg-silat-gold', 'text-black');
            btn.classList.remove('bg-transparent');

            const filterType = btn.getAttribute('data-filter');

            // GSAP Logic to animate items hiding/showing
            masonryItems.forEach(item => {
                const itemType = item.querySelector('.gallery-card').getAttribute('data-type');
                
                if (filterType === 'all' || filterType === itemType) {
                    item.classList.remove('hidden');
                    gsap.to(item, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.4,
                        ease: "power2.out",
                        clearProps: "all"
                    });
                } else {
                    gsap.to(item, {
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: () => {
                            item.classList.add('hidden');
                        }
                    });
                }
            });
        });
    });

    // 2. Smart Modal GSAP Content Transition (FLIP-like manual)
    const galleryCards = document.querySelectorAll('.gallery-card');
    const modal = document.getElementById('gallery-modal');
    const closeBtn = document.getElementById('modal-close');
    const receptorContainer = document.getElementById('modal-receptor-container');
    
    let activeBounds = null;

    galleryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const isVideo = card.getAttribute('data-type') === 'video';
            const largeSrc = card.getAttribute('data-large-src');
            const innerMedia = card.querySelector('.masonry-media');
            
            // First: Record initial state bounds
            activeBounds = innerMedia.getBoundingClientRect();

            // Setup Receptor Element
            receptorContainer.innerHTML = ''; // Clear previous
            let receptorEl;

            if (isVideo) {
                receptorEl = document.createElement('video');
                receptorEl.src = largeSrc;
                receptorEl.autoplay = true;
                receptorEl.controls = true;
                receptorEl.className = 'w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain border border-silat-gold shadow-[0_0_30px_rgba(212,175,55,0.2)] rounded-lg';
            } else {
                receptorEl = document.createElement('img');
                receptorEl.src = largeSrc;
                receptorEl.className = 'w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain border border-silat-gold shadow-[0_0_30px_rgba(212,175,55,0.2)] rounded-lg';
            }

            receptorContainer.appendChild(receptorEl);

            // Open Modal Overlay
            document.body.style.overflow = 'hidden';
            modal.classList.remove('hidden');
            modal.classList.remove('pointer-events-none');
            
            gsap.to(modal, {
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            });

            // Last: Let browser compute receptor's natural bounds, then calculate difference
            // We use requestAnimationFrame to ensure the DOM is painted with final dimensions
            requestAnimationFrame(() => {
                const finalBounds = receptorEl.getBoundingClientRect();
                
                // Invert & Play (GSAP FLIP simulation)
                gsap.from(receptorEl, {
                    x: activeBounds.left - finalBounds.left,
                    y: activeBounds.top - finalBounds.top,
                    width: activeBounds.width,
                    height: activeBounds.height,
                    duration: 0.6,
                    ease: "power3.inOut" // Cinematic slow-in slow-out
                });
            });
        });
    });

    // Close Modal Logic
    const closeModal = () => {
        document.body.style.overflow = 'auto'; // Restore scroll
        const receptorEl = receptorContainer.children[0];

        // Animate modal out
        gsap.to(modal, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
                modal.classList.add('hidden');
                modal.classList.add('pointer-events-none');
                receptorContainer.innerHTML = '';
            }
        });

        // Optionally, animate the image back down
        if (receptorEl && activeBounds) {
            const currentBounds = receptorEl.getBoundingClientRect();
            gsap.to(receptorEl, {
                x: activeBounds.left - currentBounds.left,
                y: activeBounds.top - currentBounds.top,
                width: activeBounds.width,
                height: activeBounds.height,
                duration: 0.3,
                ease: "power2.inOut"
            });
        }
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        // Only close if clicking the backdrop, not the image itself
        if (e.target === modal || e.target === receptorContainer) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
});
