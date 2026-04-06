// js/animations.js

document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // -----------------------------------------
    // Setup: Mobile vs Desktop Optimization
    // -----------------------------------------
    // Use matchMedia to disable heavy animations on mobile (to preserve battery & performance)
    let mm = gsap.matchMedia();

    // Desktop Only Animations (min-width: 768px)
    mm.add("(min-width: 768px)", () => {
        
        // --- Task 2: Hero Entrance Sequence ---
        const heroSection = document.querySelector('section.relative.min-h-screen');
        if (heroSection) {
            const tl = gsap.timeline();
            
            // Targets
            const logoContainer = document.querySelector('nav .flex-shrink-0');
            const heading = heroSection.querySelector('h1');
            const subtitle = heroSection.querySelector('p');
            const buttons = heroSection.querySelectorAll('.flex-col.sm\\:flex-row > a');
            const ambientGlow = heroSection.querySelector('.ambient-glow, .bg-silat-gold\\/10.blur-\\[100px\\]');
            
            // Advanced Text Handling: We avoid string splitting which breaks existing HTML spans
            // Instead, we will animate the heading as a single block for safety, 
            // or animate its child nodes if we want a slight stagger.
            // For stability without premium SplitText, we animate the entire heading container.

            // 1. Logo Sequence
            tl.fromTo(logoContainer, 
                { scale: 0.8, opacity: 0 }, 
                { scale: 1, opacity: 1, duration: 1.5, ease: "power2.inOut" }
            )
            // 2. Heading Sequence (Uses ease-in-out for consistency with hover)
            .fromTo(heading, 
                { y: 30, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.8, ease: "power2.inOut" },
                "-=1.0" // overlap with the logo animation
            )
            // 3. Subtitle and Buttons Sequence
            .fromTo([subtitle, buttons], 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" },
                "+=0.5" // 0.5s delay after the heading finishes
            );

            // --- Task 4: Subtle Background Parallax & Pulse ---
            if (ambientGlow) {
                // Pulsating gold glow (infinite loop)
                gsap.to(ambientGlow, {
                    scale: 1.5,
                    opacity: 0.3,
                    duration: 5,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                });

                // Parallax effect tied to scroll speed
                gsap.to(ambientGlow, {
                    yPercent: 60,
                    ease: "none", // important for smooth linear scroll scrubbing
                    scrollTrigger: {
                        trigger: heroSection,
                        start: "top top",
                        end: "bottom top",
                        scrub: 1 // smooth scrubbing (takes 1s to catch up to scroll)
                    }
                });
            }
        }

        // --- Task 3: Staggered ScrollTriggered Luxury Cards ---
        const luxurySection = document.querySelector('.bg-gradient-to-b.from-transparent.to-black\\/30'); // The Phase 4 section
        const luxuryCards = document.querySelectorAll('.luxury-card');

        if (luxurySection && luxuryCards.length > 0) {
            
            // Hijack the CSS-based reveal properties and let GSAP take control
            gsap.set(luxuryCards, { 
                opacity: 0, 
                y: 50,
                clearProps: "transition" // Remove conflicting CSS transitions
            });

            gsap.to(luxuryCards, {
                scrollTrigger: {
                    trigger: luxurySection,
                    start: "top 70%", // Trigger when section is 30% into view
                    toggleActions: "play none none reverse"
                },
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.2, // Left (0), Center (0.2s), Right (0.4s)
                ease: "power2.out"
            });
        }

    });

    // --- New Section: Authority Counter Entrance & Running Numbers (RUNS ON ALL SCREEN SIZES) ---
    const counterSection = document.getElementById('authority-counter-section');
    const counterItems = document.querySelectorAll('.authority-counter-item');
    
    if (counterSection && counterItems.length > 0) {
        // First, Card Entrance Animation
        gsap.set(counterItems, { opacity: 0, y: 40 });
        gsap.to(counterItems, {
            scrollTrigger: {
                trigger: counterSection,
                start: "top 85%", // Trigger right before it enters completely
                toggleActions: "play none none reverse"
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.2)"
        });

        // Second, Running Numbers Animation (Triggers ONLY ONCE)
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            let targetVal = parseInt(stat.getAttribute('data-target'));
            gsap.to({ val: 0 }, {
                scrollTrigger: {
                    trigger: counterSection,
                    start: "top 85%",
                    once: true // Safety constraint: animate only once
                },
                val: targetVal,
                duration: 1.5,
                ease: "power1.inOut",
                onUpdate: function() {
                    stat.innerText = Math.round(this.targets()[0].val);
                }
            });
        });
    }

    // --- New Section: Infinite Logo Scroll (RUNS ON ALL SCREEN SIZES) ---
    const scrollTracks = document.querySelectorAll('.partner-scroll-track');
    if (scrollTracks.length > 0) {
        gsap.to(scrollTracks, {
            xPercent: -100,
            repeat: -1,
            duration: 25,
            ease: "linear"
        });
    }

    // Mobile Specific Fallbacks (max-width: 767px)
    mm.add("(max-width: 767px)", () => {
        // Enforce visibility without heavy animations for performance
        const luxuryCards = document.querySelectorAll('.luxury-card');
        const heading = document.querySelector('section.relative.min-h-screen h1');
        
        // Remove GSAP inline hidden states
        if (luxuryCards.length > 0) gsap.set(luxuryCards, { clearProps: "all" });
        if (heading) {
           const spans = heading.querySelectorAll('span');
           if (spans.length > 0) gsap.set(spans, { clearProps: "all" });
        }
    });

});
