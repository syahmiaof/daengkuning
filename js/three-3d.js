/**
 * Isolation Protocol: 3D Scroll Background Logic
 * Uses Three.js for rendering and GSAP ScrollTrigger for scroll-bound animation.
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    // Position camera back slightly to view the object
    camera.position.set(0, 0, 15);

    // 3. Renderer Setup
    // alpha: true allows the canvas background to remain transparent
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 5. Create Target Object (Placeholder Cylinder for Keris)
    // CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
    const geometry = new THREE.CylinderGeometry(0.5, 0.1, 7, 32);

    // Jewelry-Dojo Gold Material (#C5A059)
    const material = new THREE.MeshStandardMaterial({
        color: 0xC5A059,
        metalness: 0.9,
        roughness: 0.15,
    });

    const targetMeshes = new THREE.Group(); // We group to easily center or handle complex objects
    const kerisPlaceholder = new THREE.Mesh(geometry, material);
    kerisPlaceholder.rotation.z = Math.PI / 8; // Slant it aesthetically

    targetMeshes.add(kerisPlaceholder);
    scene.add(targetMeshes);

    // 6. GSAP ScrollTrigger Animation (Scroll-bound Rotation)
    // This scales the rotation linearly as the user scrolls from top of page to bottom.
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(targetMeshes.rotation, {
        y: Math.PI * 2, // 360 degrees
        ease: "none", // Linear rotation
        scrollTrigger: {
            trigger: document.body,
            start: "top top", // Start animation when top of body hits top of viewport
            end: "bottom bottom", // End when bottom of body hits bottom of viewport
            scrub: 1 // 1-second smoothing effect catching up to scroll position
        }
    });

    // 7. Base Animation Loop (requestAnimationFrame)
    // Only renders the scene; GSAP handles the object rotation coordinates.
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        // Optional idle floating effect (commented out to stay strictly scroll-bound based on specs)
        // const t = clock.getElapsedTime();
        // targetMeshes.position.y = Math.sin(t) * 0.5;

        renderer.render(scene, camera);
    }
    animate();

    // 8. Responsive Window Resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
