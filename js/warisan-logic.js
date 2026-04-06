/**
 * Warisan 3D Scrollytelling Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('warisan-canvas');
    if (!canvas) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    // Atmospheric Fog matching background
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.05); 
    
    const cameraAspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, cameraAspect, 0.1, 1000);
    // Kamera diletakkan di posisi permulaan yang lebih jauh supaya nampak seluruh batu
    camera.position.set(0, 0, 25);
    
    const isMobile = window.innerWidth <= 768;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: !isMobile // Matikan pelicin (antialias) pada peranti mudah alih
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight); // Buka panggung skrin penuh!
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.25)); // Kuasa rendering terhad kepada 1.0 di telefon

    if (isMobile) {
        // Matikan sistem hujan bintang zarah belakang supaya Canvas kurang beban
        const particlesLayer = document.getElementById('particles-js');
        if (particlesLayer) particlesLayer.style.display = 'none';
    }

    // 2. Lighting Setup (Ditingkatkan kecerahan maksimum)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); // Kecerahan sekeliling dinaikkan
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffaa50, 1.5);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Lampu tambahan dari belakang (Fill Light)
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);
    
    // Lampu titik emas untuk kilauan dekat (Point Light)
    const pointLight = new THREE.PointLight(0xffd700, 2.0, 50); 
    pointLight.position.set(0, 2, 5);
    scene.add(pointLight);

    // 3. Object Creation / Loading
    // Kita sediakan group kosong supaya skrip GSAP animasi (ScrollTrigger) boleh pegang objek ni dari awal
    const keris = new THREE.Group();
    // Tiada lagi paksaan sendeng. Biar persekitaran (batu) duduk natural
    scene.add(keris);

    // Sistem Autocari Fail Model Sebenar
    const loader = new THREE.GLTFLoader();
    
    // Smart Asset Loading: Desktop(71MB) vs Mobile(4MB) 
    const modelTarget = isMobile ? 'assets/3d/keris2.glb' : 'assets/3d/keris3.glb';
    loader.load(
        modelTarget, 

        function(gltf) {
            const realKeris = gltf.scene;
            
            // 1. Dapatkan saiz asal model
            const box = new THREE.Box3().setFromObject(realKeris);
            const size = box.getSize(new THREE.Vector3());
            
            // 2. Skalakan model secara automatik supaya muat dalam skrin
            const maxDim = Math.max(size.x, size.y, size.z);
            const targetLength = 15.0; // Diperbesarkan kepada saiz environment penuh
            const scaleFactor = targetLength / maxDim;
            realKeris.scale.set(scaleFactor, scaleFactor, scaleFactor);
            
            // 3. Kita tak pusingkan paksi keris. Biarkan paksi asli fail tersebut supaya batu di bawahnya berada pada orientasi natural lantai 3D.
            // Memandangkan ia sebuah 'Environment', orientasi asalnya kebiasaannya adalah yang paling optimum untuk ditonton secara melintang.
            
            // 4. Tengahkan objek semula setelah diubahsuai
            const adjustedBox = new THREE.Box3().setFromObject(realKeris);
            const center = adjustedBox.getCenter(new THREE.Vector3());
            realKeris.position.sub(center);

            keris.add(realKeris);
            console.log("Sistem: Keris Surakarta Berjaya Digunakan dengan Saiz Ideal!");
            hideLoader();
        },
        undefined, // Loading progress
        function(error) {
            // Kalau gagal cari fail
            console.warn("Sistem: Fail assets/3d/keris_surakarta.glb belum wujud. Guna Keris Sementara.");
            buildPlaceholderKeris(keris);
            hideLoader();
        }
    );

    // Fungsi Padam Loader
    function hideLoader() {
        const loader = document.getElementById('loader-overlay');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 1000);
        }
    }

    // Fungsi membina "Keris Geometri Berlatih"
    function buildPlaceholderKeris(groupObj) {
        // Matamata Keris (Blade) - Warna besi/perak
        const bladeGeo = new THREE.BoxGeometry(0.5, 6.5, 0.05);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.1 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = 3.25;
        groupObj.add(blade);

        // Sampir / Silang Keris (Crossguard) - Warna Emas
        const guardGeo = new THREE.BoxGeometry(1.5, 0.4, 0.2);
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xC5A059, metalness: 1.0, roughness: 0.2 });
        const guard = new THREE.Mesh(guardGeo, goldMat);
        groupObj.add(guard);

        // Hulu Keris (Handle) - Warna Kayu Gelap
        const huluGeo = new THREE.BoxGeometry(0.3, 1.5, 0.3);
        const huluMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
        const hulu = new THREE.Mesh(huluGeo, huluMat);
        hulu.position.y = -0.9;
        
        // Lekukkan hulu sikit ke belakang supaya nampak macam pemegang keris tradisional
        hulu.rotation.x = Math.PI / 12; 
        hulu.position.z = 0.1;
        groupObj.add(hulu);
    }

    // 4. ScrollTriggers for Text Fade-Ins
    gsap.registerPlugin(ScrollTrigger);

    const checkpoints = gsap.utils.toArray('.checkpoint');
    checkpoints.forEach((section, index) => {
        gsap.to(section, {
            opacity: 1,
            y: 0, // Reset from its initial transform-y state
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 60%", 
                end: "bottom 20%",
                toggleActions: "play reverse play reverse"
            }
        });
    });

    // 5. Scrollytelling Timeline (3D Model Movement)
    // Create a timeline that spans the entire container's height
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".scrolly-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5 // Smooth catch-up delay
        }
    });

    // CP1 ke CP2 (Kamera terbang perlahan merayap ke kiri, serong pandang ke kanan merapat)
    tl.to(camera.position, { x: -8, z: 12, ease: "power1.inOut" }, 0)
      .to(camera.rotation, { y: -Math.PI / 8, ease: "power1.inOut" }, 0);
      
    // CP2 ke CP3 (Kamera menjunam pandang hulu keris - Extreme Closeup)
    tl.to(camera.position, { x: 5, y: 3, z: 6, ease: "power1.inOut" }, 1)
      .to(camera.rotation, { y: Math.PI / 6, x: -Math.PI / 12, ease: "power1.inOut" }, 1);
      
    // CP3 ke CP4 (Kamera terbang tinggi memandang keseluruhan persekitaran batu dari atas condong)
    tl.to(camera.position, { x: 0, y: 12, z: 15, ease: "power1.inOut" }, 2)
      .to(camera.rotation, { y: 0, x: -Math.PI / 6, ease: "power1.inOut" }, 2);

    // 6. Base Render Loop
    function animate() {
        requestAnimationFrame(animate);
        // Slowly float the object independent of scroll for a live feel
        const time = Date.now() * 0.001;
        keris.position.y = Math.sin(time) * 0.3;
        renderer.render(scene, camera);
    }
    animate();

    // 7. Resize Handler (Skrin Penuh Sahaja)
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.updateProjectionMatrix();
    });
});
