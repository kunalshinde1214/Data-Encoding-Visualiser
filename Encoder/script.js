        // DOM Elements
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.querySelector('#theme-toggle i');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navLinks = document.getElementById('nav-links');
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Encoder tab elements
        const binaryInput = document.getElementById('binary-input');
        const encodingType = document.getElementById('encoding-type');
        const clockRate = document.getElementById('clock-rate');
        const clockRateValue = document.getElementById('clock-rate-value');
        const showClock = document.getElementById('show-clock');
        const autoUpdate = document.getElementById('auto-update');
        const encodeBtn = document.getElementById('encode-btn');
        const randomBtn = document.getElementById('random-btn');
        const downloadBtn = document.getElementById('download-btn');
        const copyBtn = document.getElementById('copy-btn');
        const canvas = document.getElementById('signal-canvas');
        const ctx = canvas.getContext('2d');
        
        // Comparison tab elements
        const comparisonInput = document.getElementById('comparison-input');
        const compareBtn = document.getElementById('compare-btn');
        const compareRandomBtn = document.getElementById('compare-random-btn');
        const compareDownloadBtn = document.getElementById('compare-download-btn');
        const comparisonGrid = document.getElementById('comparison-grid');
        
        // Animation tab elements
        const animationInput = document.getElementById('animation-input');
        const animationType = document.getElementById('animation-type');
        const animationSpeed = document.getElementById('animation-speed');
        const animationSpeedValue = document.getElementById('animation-speed-value');
        const animateBtn = document.getElementById('animate-btn');
        const animationRandomBtn = document.getElementById('animation-random-btn');
        const animationResetBtn = document.getElementById('animation-reset-btn');
        const animationCanvas = document.getElementById('animation-canvas');
        const animationCtx = animationCanvas.getContext('2d');
        
        const toastContainer = document.getElementById('toast-container');
        const particlesContainer = document.getElementById('particles-container');
        const featuresDispersion = document.getElementById('features-dispersion');
        const simulatorDispersion = document.getElementById('simulator-dispersion');

        // State
        let isDarkMode = false;
        let encodedOutput = '';
        let isAnimating = false;
        let animationFrame = null;
        let animationProgress = 0;
        let mobileMenuOpen = false;

        // 4B/5B Encoding table
        const fourBFiveB = {
            '0000': '11110',
            '0001': '01001',
            '0010': '10100',
            '0011': '10101',
            '0100': '01010',
            '0101': '01011',
            '0110': '01110',
            '0111': '01111',
            '1000': '10010',
            '1001': '10011',
            '1010': '10110',
            '1011': '10111',
            '1100': '11010',
            '1101': '11011',
            '1110': '11100',
            '1111': '11101'
        };

        // Initialize
        function init() {
            // Set canvas size
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            // Check for saved theme preference
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                enableDarkMode();
            }

            // Create particles
            createParticles();
            createDispersionEffect(featuresDispersion);
            createDispersionEffect(simulatorDispersion);

            // Initial encoding
            encodeSignal();
            generateComparisonGrid();

            // Event listeners
            themeToggle.addEventListener('click', toggleTheme);
            mobileMenuBtn.addEventListener('click', toggleMobileMenu);
            
            // Close mobile menu when clicking a link
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    if (mobileMenuOpen) {
                        toggleMobileMenu();
                    }
                });
            });
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => switchTab(tab.dataset.tab));
            });
            
            // Encoder tab events
            binaryInput.addEventListener('input', () => {
                if (autoUpdate.checked) {
                    encodeSignal();
                }
            });
            encodingType.addEventListener('change', () => {
                if (autoUpdate.checked) {
                    encodeSignal();
                }
            });
            clockRate.addEventListener('input', () => {
                clockRateValue.textContent = clockRate.value;
                if (autoUpdate.checked) {
                    encodeSignal();
                }
            });
            showClock.addEventListener('change', () => {
                const nextSibling = showClock.parentElement.nextElementSibling;
                nextSibling.textContent = showClock.checked ? 'Enabled' : 'Disabled';
                if (autoUpdate.checked) {
                    encodeSignal();
                }
            });
            autoUpdate.addEventListener('change', () => {
                const nextSibling = autoUpdate.parentElement.nextElementSibling;
                nextSibling.textContent = autoUpdate.checked ? 'Enabled' : 'Disabled';
                if (autoUpdate.checked) {
                    encodeSignal();
                }
            });
            encodeBtn.addEventListener('click', encodeSignal);
            randomBtn.addEventListener('click', () => {
                generateRandomBinary(binaryInput);
                encodeSignal();
            });
            downloadBtn.addEventListener('click', () => downloadImage(canvas, 'encoding'));
            copyBtn.addEventListener('click', copyEncodedOutput);
            
            // Comparison tab events
            compareBtn.addEventListener('click', generateComparisonGrid);
            compareRandomBtn.addEventListener('click', () => {
                generateRandomBinary(comparisonInput);
                generateComparisonGrid();
            });
            compareDownloadBtn.addEventListener('click', downloadComparisonImage);
            
            // Animation tab events
            animationSpeed.addEventListener('input', () => {
                animationSpeedValue.textContent = animationSpeed.value;
            });
            animateBtn.addEventListener('click', toggleAnimation);
            animationRandomBtn.addEventListener('click', () => {
                generateRandomBinary(animationInput, 4, 8);
                resetAnimation();
            });
            animationResetBtn.addEventListener('click', resetAnimation);

            // Update toggle text
            showClock.parentElement.nextElementSibling.textContent = showClock.checked ? 'Enabled' : 'Disabled';
            autoUpdate.parentElement.nextElementSibling.textContent = autoUpdate.checked ? 'Enabled' : 'Disabled';
            
            // Scroll animations
            window.addEventListener('scroll', checkScrollAnimation);
            
            // Add scroll event to nav links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }

        // Theme functions
        function toggleTheme() {
            if (isDarkMode) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        }

        function enableDarkMode() {
            document.body.classList.add('dark');
            themeIcon.className = 'fas fa-sun';
            isDarkMode = true;
            localStorage.setItem('theme', 'dark');
            encodeSignal(); // Redraw with new colors
            if (isAnimating) {
                resetAnimation();
            }
            generateComparisonGrid();
        }

        function disableDarkMode() {
            document.body.classList.remove('dark');
            themeIcon.className = 'fas fa-moon';
            isDarkMode = false;
            localStorage.setItem('theme', 'light');
            encodeSignal(); // Redraw with new colors
            if (isAnimating) {
                resetAnimation();
            }
            generateComparisonGrid();
        }

        // Mobile menu
        function toggleMobileMenu() {
            navLinks.classList.toggle('active');
            mobileMenuOpen = !mobileMenuOpen;
            mobileMenuBtn.innerHTML = mobileMenuOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        }

        // Tab switching
        function switchTab(tabId) {
            tabs.forEach(tab => {
                if (tab.dataset.tab === tabId) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });

            tabContents.forEach(content => {
                if (content.id === tabId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            
            // Resize canvases when switching tabs
            if (tabId === 'encoder') {
                resizeCanvas();
                encodeSignal();
            } else if (tabId === 'comparison') {
                generateComparisonGrid();
            } else if (tabId === 'animation') {
                resizeAnimationCanvas();
                resetAnimation();
            }
        }

        // Canvas functions
        function resizeCanvas() {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            
            if (binaryInput.value) {
                encodeSignal();
            }
        }
        
        function resizeAnimationCanvas() {
            const container = animationCanvas.parentElement;
            animationCanvas.width = container.clientWidth;
            animationCanvas.height = container.clientHeight;
            
            if (isAnimating) {
                resetAnimation();
            } else {
                clearAnimationCanvas();
            }
        }

        // Encoding functions
        function encodeSignal() {
            const binary = binaryInput.value.trim();
            
            // Validate input
            if (!validateBinary(binary)) {
                showToast('Please enter valid binary data (only 0s and 1s)', 'error');
                return;
            }
            
            const type = encodingType.value;
            const rate = parseInt(clockRate.value);
            const showClockSignal = showClock.checked;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid
            drawGrid(ctx, canvas);
            
            // Encode based on selected type
            switch (type) {
                case 'manchester':
                    drawManchesterEncoding(binary, rate, showClockSignal);
                    break;
                case 'differential':
                    drawDifferentialManchesterEncoding(binary, rate, showClockSignal);
                    break;
                case 'nrz-l':
                    drawNRZLEncoding(binary, rate, showClockSignal);
                    break;
                case 'nrz-i':
                    drawNRZIEncoding(binary, rate, showClockSignal);
                    break;
                case 'rz':
                    drawRZEncoding(binary, rate, showClockSignal);
                    break;
                case 'ami':
                    drawAMIEncoding(binary, rate, showClockSignal);
                    break;
                case '4b5b':
                    draw4B5BEncoding(binary, rate, showClockSignal);
                    break;
            }
        }

        function validateBinary(binary) {
            return /^[01]+$/.test(binary);
        }

        function drawGrid(context, canvasElement) {
            const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border');
            
            context.strokeStyle = gridColor;
            context.lineWidth = 0.5;
            context.beginPath();
            
            // Vertical grid lines
            const verticalSpacing = canvasElement.width / 20;
            for (let x = 0; x <= canvasElement.width; x += verticalSpacing) {
                context.moveTo(x, 0);
                context.lineTo(x, canvasElement.height);
            }
            
            // Horizontal grid lines
            const horizontalSpacing = canvasElement.height / 10;
            for (let y = 0; y <= canvasElement.height; y += horizontalSpacing) {
                context.moveTo(0, y);
                context.lineTo(canvasElement.width, y);
            }
            
            context.stroke();
        }

        function drawManchesterEncoding(binary, rate, showClock) {
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text');
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
            
            const bitLength = binary.length;
            const timeScale = canvas.width / (bitLength + 1);
            const midHeight = canvas.height / 2;
            const amplitude = canvas.height / 4;
            
            // Draw bit labels
            ctx.font = '12px Inter';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            
            for (let i = 0; i < bitLength; i++) {
                const x = (i + 0.5) * timeScale;
                ctx.fillText(binary[i], x, canvas.height - 10);
            }
            
            // Draw clock signal if enabled
            if (showClock) {
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                const clockHeight = midHeight - amplitude * 1.5;
                
                for (let i = 0; i < bitLength; i++) {
                    const startX = i * timeScale;
                    const midX = (i + 0.5) * timeScale;
                    const endX = (i + 1) * timeScale;
                    
                    // First half of clock cycle (high)
                    ctx.moveTo(startX, clockHeight - amplitude / 2);
                    ctx.lineTo(midX, clockHeight - amplitude / 2);
                    
                    // Transition
                    ctx.lineTo(midX, clockHeight + amplitude / 2);
                    
                    // Second half of clock cycle (low)
                    ctx.lineTo(endX, clockHeight + amplitude / 2);
                }
                
                ctx.stroke();
                
                // Label the clock signal
                ctx.fillText("Clock", 30, clockHeight);
            }
            
            // Draw Manchester encoding
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            let lastLevel = binary[0] === '0' ? 1 : -1;
            
            for (let i = 0; i < bitLength; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const midX = (i + 0.5) * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (bit === '0') {
                    // 0 is high-to-low transition
                    ctx.moveTo(startX, midHeight - amplitude);
                    ctx.lineTo(midX, midHeight - amplitude);
                    ctx.lineTo(midX, midHeight + amplitude);
                    ctx.lineTo(endX, midHeight + amplitude);
                    lastLevel = 1;
                } else {
                    // 1 is low-to-high transition
                    ctx.moveTo(startX, midHeight + amplitude);
                    ctx.lineTo(midX, midHeight + amplitude);
                    ctx.lineTo(midX, midHeight - amplitude);
                    ctx.lineTo(endX, midHeight - amplitude);
                    lastLevel = -1;
                }
            }
            
            ctx.stroke();
            
            // Label the encoding
            ctx.fillText("Manchester", 50, midHeight - amplitude - 10);
            
            // Store encoded output
            encodedOutput = generateEncodedOutput(binary, 'manchester');
        }

        function drawDifferentialManchesterEncoding(binary, rate, showClock) {
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text');
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
            
            const bitLength = binary.length;
            const timeScale = canvas.width / (bitLength + 1);
            const midHeight = canvas.height / 2;
            const amplitude = canvas.height / 4;
            
            // Draw bit labels
            ctx.font = '12px Inter';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            
            for (let i = 0; i < bitLength; i++) {
                const x = (i + 0.5) * timeScale;
                ctx.fillText(binary[i], x, canvas.height - 10);
            }
            
            // Draw clock signal if enabled
            if (showClock) {
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                const clockHeight = midHeight - amplitude * 1.5;
                
                for (let i = 0; i < bitLength; i++) {
                    const startX = i * timeScale;
                    const midX = (i + 0.5) * timeScale;
                    const endX = (i + 1) * timeScale;
                    
                    // First half of clock cycle (high)
                    ctx.moveTo(startX, clockHeight - amplitude / 2);
                    ctx.lineTo(midX, clockHeight - amplitude / 2);
                    
                    // Transition
                    ctx.lineTo(midX, clockHeight + amplitude / 2);
                    
                    // Second half of clock cycle (low)
                    ctx.lineTo(endX, clockHeight + amplitude / 2);
                }
                
                ctx.stroke();
                
                // Label the clock signal
                ctx.fillText("Clock", 30, clockHeight);
            }
            
            // Draw Differential Manchester encoding
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            // Start with an arbitrary level (high)
            let currentLevel = -1; // -1 for high, 1 for low
            
            for (let i = 0; i < bitLength; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const midX = (i + 0.5) * timeScale;
                const endX = (i + 1) * timeScale;
                
                // In Differential Manchester:
                // - Always transition in the middle of the bit
                // - For 0, transition at the start of the bit
                // - For 1, no transition at the start of the bit
                
                if (i > 0 && bit === '0') {
                    // Transition at the start for 0
                    currentLevel = -currentLevel;
                }
                
                // Draw first half
                ctx.moveTo(startX, midHeight + currentLevel * amplitude);
                ctx.lineTo(midX, midHeight + currentLevel * amplitude);
                
                // Always transition in the middle
                currentLevel = -currentLevel;
                
                // Draw second half
                ctx.lineTo(midX, midHeight + currentLevel * amplitude);
                ctx.lineTo(endX, midHeight + currentLevel * amplitude);
            }
            
            ctx.stroke();
            
            // Label the encoding
            ctx.fillText("Differential Manchester", 80, midHeight - amplitude - 10);
            
            // Store encoded output
            encodedOutput = generateEncodedOutput(binary, 'differential');
        }

        function drawNRZLEncoding(binary, rate, showClock) {
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text');
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
            
            const bitLength = binary.length;
            const timeScale = canvas.width / (bitLength + 1);
            const midHeight = canvas.height / 2;
            const amplitude = canvas.height / 4;
            
            // Draw bit labels
            ctx.font = '12px Inter';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            
            for (let i = 0; i < bitLength; i++) {
                const x = (i + 0.5) * timeScale;
                ctx.fillText(binary[i], x, canvas.height - 10);
            }
            
            // Draw clock signal if enabled
            if (showClock) {
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                const clockHeight = midHeight - amplitude * 1.5;
                
                for (let i = 0; i < bitLength; i++) {
                    const startX = i * timeScale;
                    const midX = (i + 0.5) * timeScale;
                    const endX = (i + 1) * timeScale;
                    
                    // First half of clock cycle (high)
                    ctx.moveTo(startX, clockHeight - amplitude / 2);
                    ctx.lineTo(midX, clockHeight - amplitude / 2);
                    
                    // Transition
                    ctx.lineTo(midX, clockHeight + amplitude / 2);
                    
                    // Second half of clock cycle (low)
                    ctx.lineTo(endX, clockHeight + amplitude / 2);
                }
                
                ctx.stroke();
                
                // Label the clock signal
                ctx.fillText("Clock", 30, clockHeight);
            }
            
            // Draw NRZ-L encoding
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            for (let i = 0; i < bitLength; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const endX = (i + 1) * timeScale;
                
                // In NRZ-L:
                // - 0 is represented by low level
                // - 1 is represented by high level
                const level = bit === '1' ? -1 : 1; // -1 for high, 1 for low
                
                ctx.moveTo(startX, midHeight + level * amplitude);
                ctx.lineTo(endX, midHeight + level * amplitude);
                
                // If this is not the last bit and the next bit is different, draw the transition
                if (i < bitLength - 1 && binary[i] !== binary[i + 1]) {
                    ctx.moveTo(endX, midHeight + level * amplitude);
                    ctx.lineTo(endX, midHeight - level * amplitude);
                }
            }
            
            ctx.stroke();
            
            // Label the encoding
            ctx.fillText("NRZ-L", 30, midHeight - amplitude - 10);
            
            // Store encoded output
            encodedOutput = generateEncodedOutput(binary, 'nrz-l');
        }

        function drawNRZIEncoding(binary, rate, showClock) {
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text');
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
            
            const bitLength = binary.length;
            const timeScale = canvas.width / (bitLength + 1);
            const midHeight = canvas.height / 2;
            const amplitude = canvas.height / 4;
            
            // Draw bit labels
            ctx.font = '12px Inter';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            
            for (let i = 0; i < bitLength; i++) {
                const x = (i + 0.5) * timeScale;
                ctx.fillText(binary[i], x, canvas.height - 10);
            }
            
            // Draw clock signal if enabled
            if (showClock) {
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                const clockHeight = midHeight - amplitude * 1.5;
                
                for (let i = 0; i < bitLength; i++) {
                    const startX = i * timeScale;
                    const midX = (i + 0.5) * timeScale;
                    const endX = (i + 1) * timeScale;
                    
                    // First half of clock cycle (high)
                    ctx.moveTo(startX, clockHeight - amplitude / 2);
                    ctx.lineTo(midX, clockHeight - amplitude / 2);
                    
                    // Transition
                    ctx.lineTo(midX, clockHeight + amplitude / 2);
                    
                    // Second half of clock cycle (low)
                    ctx.lineTo(endX, clockHeight + amplitude / 2);
                }
                
                ctx.stroke();
                
                // Label the clock signal
                ctx.fillText("Clock", 30, clockHeight);
            }
            
            // Draw NRZ-I encoding
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            // Start with an arbitrary level (high)
            let currentLevel = -1; // -1 for high, 1 for low
            
            for (let i = 0; i < bitLength; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const endX = (i + 1) * timeScale;
                
                // In NRZ-I:
                // - 0 means no change in signal level
                // - 1 means a change in signal level
                
                if (i > 0 && bit === '1') {
                    // Transition for 1
                    currentLevel = -currentLevel;
                }
                
                ctx.moveTo(startX, midHeight + currentLevel * amplitude);
                ctx.lineTo(endX, midHeight + currentLevel * amplitude);
            }
            
            ctx.stroke();
            
            // Label the encoding
            ctx.fillText("NRZ-I", 30, midHeight - amplitude - 10);
            
            // Store encoded output
            encodedOutput = generateEncodedOutput(binary, 'nrz-i');
        }

        function drawRZEncoding(binary, rate, showClock) {
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text');
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
            
            const bitLength = binary.length;
            const timeScale = canvas.width / (bitLength + 1);
            const midHeight = canvas.height / 2;
            const amplitude = canvas.height / 4;
            
            // Draw bit labels
            ctx.font = '12px Inter';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            
            for (let i = 0; i < bitLength; i++) {
                const x = (i + 0.5) * timeScale;
                ctx.fillText(binary[i], x, canvas.height - 10);
            }
            
            // Draw clock signal if enabled
            if (showClock) {
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                const clockHeight = midHeight - amplitude * 1.5;
                
                for (let i = 0; i < bitLength; i++) {
                    const startX = i * timeScale;
                    const midX = (i + 0.5) * timeScale;
                    const endX = (i + 1) * timeScale;
                    
                    // First half of clock cycle (high)
                    ctx.moveTo(startX, clockHeight - amplitude / 2);
                    ctx.lineTo(midX, clockHeight - amplitude / 2);
                    
                    // Transition
                    ctx.lineTo(midX, clockHeight + amplitude / 2);
                    
                    // Second half of clock cycle (low)
                    ctx.lineTo(endX, clockHeight + amplitude / 2);
                }
                
                ctx.stroke();
                
                // Label the clock signal
                ctx.fillText("Clock", 30, clockHeight);
            }
            
            // Draw RZ encoding
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            for (let i = 0; i < bitLength; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const midX = (i + 0.5) * timeScale;
                const endX = (i + 1) * timeScale;
                
                // In RZ:
                // - 1 is represented by a positive pulse for half the bit period, then zero
                // - 0 is represented by a negative pulse for half the bit period, then zero
                
                if (bit === '1') {
                    // 1 is positive pulse then zero
                    ctx.moveTo(startX, midHeight);
                    ctx.lineTo(startX, midHeight - amplitude);
                    ctx.lineTo(midX, midHeight - amplitude);
                    ctx.lineTo(midX, midHeight);
                    ctx.lineTo(endX, midHeight);
                } else {
                    // 0 is negative pulse then zero
                    ctx.moveTo(startX, midHeight);
                    ctx.lineTo(startX, midHeight + amplitude);
                    ctx.lineTo(midX, midHeight + amplitude);
                    ctx.lineTo(midX, midHeight);
                    ctx.lineTo(endX, midHeight);
                }
            }
            
            ctx.stroke();
            
            // Label the encoding
            ctx.fillText("RZ", 20, midHeight - amplitude - 10);
            
            // Store encoded output
            encodedOutput = generateEncodedOutput(binary, 'rz');
        }

        function drawAMIEncoding(binary, rate, showClock) {
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text');
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
            
            const bitLength = binary.length;
            const timeScale = canvas.width / (bitLength + 1);
            const midHeight = canvas.height / 2;
            const amplitude = canvas.height / 4;
            
            // Draw bit labels
            ctx.font = '12px Inter';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            
            for (let i = 0; i < bitLength; i++) {
                const x = (i + 0.5) * timeScale;
                ctx.fillText(binary[i], x, canvas.height - 10);
            }
            
            // Draw clock signal if enabled
            if (showClock) {
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                const clockHeight = midHeight - amplitude * 1.5;
                
                for (let i = 0; i < bitLength; i++) {
                    const startX = i * timeScale;
                    const midX = (i + 0.5) * timeScale;
                    const endX = (i + 1) * timeScale;
                    
                    // First half of clock cycle (high)
                    ctx.moveTo(startX, clockHeight - amplitude / 2);
                    ctx.lineTo(midX, clockHeight - amplitude / 2);
                    
                    // Transition
                    ctx.lineTo(midX, clockHeight + amplitude / 2);
                    
                    // Second half of clock cycle (low)
                    ctx.lineTo(endX, clockHeight + amplitude / 2);
                }
                
                ctx.stroke();
                
                // Label the clock signal
                ctx.fillText("Clock", 30, clockHeight);
            }
            
            // Draw AMI encoding
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            // For AMI, we alternate between positive and negative for 1s
            let lastOnePolarity = -1; // Start with positive (will flip on first 1)
            
            for (let i = 0; i < bitLength; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (bit === '0') {
                    // 0 is represented by no line signal (zero voltage)
                    ctx.moveTo(startX, midHeight);
                    ctx.lineTo(endX, midHeight);
                } else {
                    // 1 is represented by alternating positive and negative pulses
                    lastOnePolarity = -lastOnePolarity;
                    
                    ctx.moveTo(startX, midHeight);
                    ctx.lineTo(startX, midHeight + lastOnePolarity * amplitude);
                    ctx.lineTo(endX, midHeight + lastOnePolarity * amplitude);
                    ctx.lineTo(endX, midHeight);
                }
            }
            
            ctx.stroke();
            
            // Label the encoding
            ctx.fillText("AMI", 20, midHeight - amplitude - 10);
            
            // Store encoded output
            encodedOutput = generateEncodedOutput(binary, 'ami');
        }

        function draw4B5BEncoding(binary, rate, showClock) {
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text');
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
            
            // Pad the binary input to a multiple of 4
            let paddedBinary = binary;
            while (paddedBinary.length % 4 !== 0) {
                paddedBinary = '0' + paddedBinary;
            }
            
            // Convert 4-bit groups to 5-bit codes
            let encodedBits = '';
            for (let i = 0; i < paddedBinary.length; i += 4) {
                const nibble = paddedBinary.substring(i, i + 4);
                encodedBits += fourBFiveB[nibble];
            }
            
            const bitLength = encodedBits.length;
            const timeScale = canvas.width / (bitLength + 1);
            const midHeight = canvas.height / 2;
            const amplitude = canvas.height / 4;
            
            // Draw original binary labels
            ctx.font = '12px Inter';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            
            // Draw 4B/5B mapping
            ctx.fillText("4B/5B Mapping:", canvas.width / 2, 20);
            
            let mappingText = '';
            for (let i = 0; i < paddedBinary.length; i += 4) {
                const nibble = paddedBinary.substring(i, i + 4);
                const code = fourBFiveB[nibble];
                mappingText += `${nibble} → ${code}  `;
            }
            
            ctx.fillText(mappingText, canvas.width / 2, 40);
            
            // Draw bit labels for encoded bits
            for (let i = 0; i < bitLength; i++) {
                const x = (i + 0.5) * timeScale;
                ctx.fillText(encodedBits[i], x, canvas.height - 10);
            }
            
            // Draw clock signal if enabled
            if (showClock) {
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                const clockHeight = midHeight - amplitude * 1.5;
                
                for (let i = 0; i < bitLength; i++) {
                    const startX = i * timeScale;
                    const midX = (i + 0.5) * timeScale;
                    const endX = (i + 1) * timeScale;
                    
                    // First half of clock cycle (high)
                    ctx.moveTo(startX, clockHeight - amplitude / 2);
                    ctx.lineTo(midX, clockHeight - amplitude / 2);
                    
                    // Transition
                    ctx.lineTo(midX, clockHeight + amplitude / 2);
                    
                    // Second half of clock cycle (low)
                    ctx.lineTo(endX, clockHeight + amplitude / 2);
                }
                
                ctx.stroke();
                
                // Label the clock signal
                ctx.fillText("Clock", 30, clockHeight);
            }
            
            // Draw NRZ-I encoding of the 5B codes (common implementation)
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            // Start with an arbitrary level (high)
            let currentLevel = -1; // -1 for high, 1 for low
            
            for (let i = 0; i < bitLength; i++) {
                const bit = encodedBits[i];
                const startX = i * timeScale;
                const endX = (i + 1) * timeScale;
                
                // Using NRZ-I for the encoded bits
                if (i > 0 && bit === '1') {
                    // Transition for 1
                    currentLevel = -currentLevel;
                }
                
                ctx.moveTo(startX, midHeight + currentLevel * amplitude);
                ctx.lineTo(endX, midHeight + currentLevel * amplitude);
            }
            
            ctx.stroke();
            
            // Label the encoding
            ctx.fillText("4B/5B with NRZ-I", 70, midHeight - amplitude - 10);
            
            // Store encoded output
            encodedOutput = encodedBits;
        }

        // Comparison functions
        function generateComparisonGrid() {
            const binary = comparisonInput.value.trim();
            
            // Validate input
            if (!validateBinary(binary)) {
                showToast('Please enter valid binary data (only 0s and 1s)', 'error');
                return;
            }
            
            // Clear the comparison grid
            comparisonGrid.innerHTML = '';
            
            // Define encoding types to compare
            const encodingTypes = [
                { id: 'manchester', name: 'Manchester' },
                { id: 'differential', name: 'Differential Manchester' },
                { id: 'nrz-l', name: 'NRZ-L' },
                { id: 'nrz-i', name: 'NRZ-I' },
                { id: 'rz', name: 'RZ' },
                { id: 'ami', name: 'AMI' },
                { id: '4b5b', name: '4B/5B' }
            ];
            
            // Create a comparison item for each encoding type
            encodingTypes.forEach(type => {
                const comparisonItem = document.createElement('div');
                comparisonItem.className = 'comparison-item';
                
                const header = document.createElement('div');
                header.className = 'comparison-header';
                header.textContent = type.name;
                
                const canvas = document.createElement('canvas');
                canvas.className = 'comparison-canvas';
                canvas.id = `comparison-${type.id}`;
                
                comparisonItem.appendChild(header);
                comparisonItem.appendChild(canvas);
                comparisonGrid.appendChild(comparisonItem);
                
                // Set canvas size
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = 150;
                
                // Draw the encoding
                const ctx = canvas.getContext('2d');
                drawGrid(ctx, canvas);
                
                // Draw the specific encoding
                drawComparisonEncoding(ctx, canvas, binary, type.id);
            });
        }
        
        function drawComparisonEncoding(ctx, canvas, binary, type) {
            const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text');
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            
            const bitLength = binary.length;
            const timeScale = canvas.width / (bitLength + 1);
            const midHeight = canvas.height / 2;
            const amplitude = canvas.height / 3;
            
            // Draw bit labels
            ctx.font = '10px Inter';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            
            for (let i = 0; i < bitLength; i++) {
                const x = (i + 0.5) * timeScale;
                ctx.fillText(binary[i], x, canvas.height - 5);
            }
            
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            switch (type) {
                case 'manchester':
                    for (let i = 0; i < bitLength; i++) {
                        const bit = binary[i];
                        const startX = i * timeScale;
                        const midX = (i + 0.5) * timeScale;
                        const endX = (i + 1) * timeScale;
                        
                        if (bit === '0') {
                            ctx.moveTo(startX, midHeight - amplitude);
                            ctx.lineTo(midX, midHeight - amplitude);
                            ctx.lineTo(midX, midHeight + amplitude);
                            ctx.lineTo(endX, midHeight + amplitude);
                        } else {
                            ctx.moveTo(startX, midHeight + amplitude);
                            ctx.lineTo(midX, midHeight + amplitude);
                            ctx.lineTo(midX, midHeight - amplitude);
                            ctx.lineTo(endX, midHeight - amplitude);
                        }
                    }
                    break;
                    
                case 'differential':
                    let currentLevel = -1;
                    
                    for (let i = 0; i < bitLength; i++) {
                        const bit = binary[i];
                        const startX = i * timeScale;
                        const midX = (i + 0.5) * timeScale;
                        const endX = (i + 1) * timeScale;
                        
                        if (i > 0 && bit === '0') {
                            currentLevel = -currentLevel;
                        }
                        
                        ctx.moveTo(startX, midHeight + currentLevel * amplitude);
                        ctx.lineTo(midX, midHeight + currentLevel * amplitude);
                        
                        currentLevel = -currentLevel;
                        
                        ctx.lineTo(midX, midHeight + currentLevel * amplitude);
                        ctx.lineTo(endX, midHeight + currentLevel * amplitude);
                    }
                    break;
                    
                case 'nrz-l':
                    for (let i = 0; i < bitLength; i++) {
                        const bit = binary[i];
                        const startX = i * timeScale;
                        const endX = (i + 1) * timeScale;
                        
                        const level = bit === '1' ? -1 : 1;
                        
                        ctx.moveTo(startX, midHeight + level * amplitude);
                        ctx.lineTo(endX, midHeight + level * amplitude);
                        
                        if (i < bitLength - 1 && binary[i] !== binary[i + 1]) {
                            ctx.moveTo(endX, midHeight + level * amplitude);
                            ctx.lineTo(endX, midHeight - level * amplitude);
                        }
                    }
                    break;
                    
                case 'nrz-i':
                    let nrziLevel = -1;
                    
                    for (let i = 0; i < bitLength; i++) {
                        const bit = binary[i];
                        const startX = i * timeScale;
                        const endX = (i + 1) * timeScale;
                        
                        if (i > 0 && bit === '1') {
                            nrziLevel = -nrziLevel;
                        }
                        
                        ctx.moveTo(startX, midHeight + nrziLevel * amplitude);
                        ctx.lineTo(endX, midHeight + nrziLevel * amplitude);
                    }
                    break;
                    
                case 'rz':
                    for (let i = 0; i < bitLength; i++) {
                        const bit = binary[i];
                        const startX = i * timeScale;
                        const midX = (i + 0.5) * timeScale;
                        const endX = (i + 1) * timeScale;
                        
                        if (bit === '1') {
                            ctx.moveTo(startX, midHeight);
                            ctx.lineTo(startX, midHeight - amplitude);
                            ctx.lineTo(midX, midHeight - amplitude);
                            ctx.lineTo(midX, midHeight);
                            ctx.lineTo(endX, midHeight);
                        } else {
                            ctx.moveTo(startX, midHeight);
                            ctx.lineTo(startX, midHeight + amplitude);
                            ctx.lineTo(midX, midHeight + amplitude);
                            ctx.lineTo(midX, midHeight);
                            ctx.lineTo(endX, midHeight);
                        }
                    }
                    break;
                    
                case 'ami':
                    let lastOnePolarity = -1;
                    
                    for (let i = 0; i < bitLength; i++) {
                        const bit = binary[i];
                        const startX = i * timeScale;
                        const endX = (i + 1) * timeScale;
                        
                        if (bit === '0') {
                            ctx.moveTo(startX, midHeight);
                            ctx.lineTo(endX, midHeight);
                        } else {
                            lastOnePolarity = -lastOnePolarity;
                            
                            ctx.moveTo(startX, midHeight);
                            ctx.lineTo(startX, midHeight + lastOnePolarity * amplitude);
                            ctx.lineTo(endX, midHeight + lastOnePolarity * amplitude);
                            ctx.lineTo(endX, midHeight);
                        }
                    }
                    break;
                    
                case '4b5b':
                    // Pad the binary input to a multiple of 4
                    let paddedBinary = binary;
                    while (paddedBinary.length % 4 !== 0) {
                        paddedBinary = '0' + paddedBinary;
                    }
                    
                    // Convert 4-bit groups to 5-bit codes
                    let encodedBits = '';
                    for (let i = 0; i < paddedBinary.length; i += 4) {
                        const nibble = paddedBinary.substring(i, i + 4);
                        encodedBits += fourBFiveB[nibble];
                    }
                    
                    // Draw 4B/5B mapping
                    ctx.fillText("4B → 5B", 30, 15);
                    
                    // Draw NRZ-I encoding of the 5B codes
                    let currentLevel4b5b = -1;
                    
                    for (let i = 0; i < encodedBits.length; i++) {
                        const bit = encodedBits[i];
                        const startX = i * (canvas.width / (encodedBits.length + 1));
                        const endX = (i + 1) * (canvas.width / (encodedBits.length + 1));
                        
                        if (i > 0 && bit === '1') {
                            currentLevel4b5b = -currentLevel4b5b;
                        }
                        
                        ctx.moveTo(startX, midHeight + currentLevel4b5b * amplitude);
                        ctx.lineTo(endX, midHeight + currentLevel4b5b * amplitude);
                    }
                    break;
            }
            
            ctx.stroke();
        }

        function downloadComparisonImage() {
            // Create a temporary canvas to combine all comparison canvases
            const tempCanvas = document.createElement('canvas');
            const comparisonItems = document.querySelectorAll('.comparison-item');
            
            // Set the size of the temporary canvas
            tempCanvas.width = comparisonGrid.clientWidth;
            tempCanvas.height = comparisonItems.length * 170; // 150px height + 20px padding
            
            const tempCtx = tempCanvas.getContext('2d');
            
            // Fill with background color
            tempCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background');
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Draw title
            tempCtx.font = 'bold 16px Inter';
            tempCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text');
            tempCtx.textAlign = 'center';
            tempCtx.fillText(`Encoding Comparison for Binary: ${comparisonInput.value}`, tempCanvas.width / 2, 30);
            
            // Draw each comparison canvas
            let yOffset = 60;
            comparisonItems.forEach(item => {
                const header = item.querySelector('.comparison-header').textContent;
                const canvas = item.querySelector('canvas');
                
                // Draw header
                tempCtx.font = 'bold 14px Inter';
                tempCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary');
                tempCtx.textAlign = 'left';
                tempCtx.fillText(header, 20, yOffset);
                
                // Draw canvas content
                tempCtx.drawImage(canvas, 0, yOffset + 10);
                
                yOffset += 170;
            });
            
            // Create download link
            const link = document.createElement('a');
            link.download = 'encoding-comparison.png';
            link.href = tempCanvas.toDataURL('image/png');
            link.click();
            
            showToast('Comparison image downloaded successfully', 'success');
        }

        // Animation functions
        function toggleAnimation() {
            if (isAnimating) {
                stopAnimation();
                animateBtn.innerHTML = '<i class="fas fa-play"></i> Start Animation';
            } else {
                startAnimation();
                animateBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Animation';
            }
        }
        
        function startAnimation() {
            const binary = animationInput.value.trim();
            
            // Validate input
            if (!validateBinary(binary)) {
                showToast('Please enter valid binary data (only 0s and 1s)', 'error');
                return;
            }
            
            isAnimating = true;
            animationProgress = 0;
            
            // Start the animation loop
            animateEncoding();
        }
        
        function stopAnimation() {
            isAnimating = false;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
        }
        
        function resetAnimation() {
            stopAnimation();
            clearAnimationCanvas();
            animateBtn.innerHTML = '<i class="fas fa-play"></i> Start Animation';
        }
        
        function clearAnimationCanvas() {
            animationCtx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
            drawGrid(animationCtx, animationCanvas);
        }
        
        function animateEncoding() {
            if (!isAnimating) return;
            
            const binary = animationInput.value.trim();
            const type = animationType.value;
            const speed = 11 - parseInt(animationSpeed.value); // Invert so higher value = faster
            
            // Clear canvas
            clearAnimationCanvas();
            
            // Calculate animation parameters
            const bitLength = binary.length;
            const timeScale = animationCanvas.width / (bitLength + 1);
            const midHeight = animationCanvas.height / 2;
            const amplitude = animationCanvas.height / 4;
            
            // Draw bit labels
            animationCtx.font = '12px Inter';
            animationCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text');
            animationCtx.textAlign = 'center';
            
            for (let i = 0; i < bitLength; i++) {
                const x = (i + 0.5) * timeScale;
                animationCtx.fillText(binary[i], x, animationCanvas.height - 10);
            }
            
            // Draw the signal up to the current progress
            animationCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            animationCtx.lineWidth = 3;
            animationCtx.beginPath();
            
            // Calculate how many bits to draw based on progress
            const progressBits = Math.min(bitLength, Math.floor(animationProgress * bitLength) + 1);
            const partialBit = (animationProgress * bitLength) % 1;
            
            switch (type) {
                case 'manchester':
                    drawAnimatedManchester(binary, progressBits, partialBit, timeScale, midHeight, amplitude);
                    break;
                case 'differential':
                    drawAnimatedDifferentialManchester(binary, progressBits, partialBit, timeScale, midHeight, amplitude);
                    break;
                case 'nrz-l':
                    drawAnimatedNRZL(binary, progressBits, partialBit, timeScale, midHeight, amplitude);
                    break;
                case 'nrz-i':
                    drawAnimatedNRZI(binary, progressBits, partialBit, timeScale, midHeight, amplitude);
                    break;
                case 'rz':
                    drawAnimatedRZ(binary, progressBits, partialBit, timeScale, midHeight, amplitude);
                    break;
                case 'ami':
                    drawAnimatedAMI(binary, progressBits, partialBit, timeScale, midHeight, amplitude);
                    break;
            }
            
            animationCtx.stroke();
            
            // Update progress
            animationProgress += 0.01 * speed;
            
            // If animation is complete, reset or stop
            if (animationProgress >= 1) {
                animationProgress = 0;
            }
            
            // Continue animation
            animationFrame = requestAnimationFrame(animateEncoding);
        }
        
        function drawAnimatedManchester(binary, progressBits, partialBit, timeScale, midHeight, amplitude) {
            for (let i = 0; i < progressBits - 1; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const midX = (i + 0.5) * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (bit === '0') {
                    animationCtx.moveTo(startX, midHeight - amplitude);
                    animationCtx.lineTo(midX, midHeight - amplitude);
                    animationCtx.lineTo(midX, midHeight + amplitude);
                    animationCtx.lineTo(endX, midHeight + amplitude);
                } else {
                    animationCtx.moveTo(startX, midHeight + amplitude);
                    animationCtx.lineTo(midX, midHeight + amplitude);
                    animationCtx.lineTo(midX, midHeight - amplitude);
                    animationCtx.lineTo(endX, midHeight - amplitude);
                }
            }
            
            // Draw partial last bit
            if (progressBits > 0 && progressBits <= binary.length) {
                const i = progressBits - 1;
                const bit = binary[i];
                const startX = i * timeScale;
                const midX = (i + 0.5) * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (bit === '0') {
                    animationCtx.moveTo(startX, midHeight - amplitude);
                    
                    if (partialBit < 0.5) {
                        // First half of the bit
                        const partialX = startX + partialBit * 2 * (midX - startX);
                        animationCtx.lineTo(partialX, midHeight - amplitude);
                    } else {
                        // Second half of the bit
                        animationCtx.lineTo(midX, midHeight - amplitude);
                        animationCtx.lineTo(midX, midHeight + amplitude);
                        
                        const partialX = midX + (partialBit - 0.5) * 2 * (endX - midX);
                        animationCtx.lineTo(partialX, midHeight + amplitude);
                    }
                } else {
                    animationCtx.moveTo(startX, midHeight + amplitude);
                    
                    if (partialBit < 0.5) {
                        // First half of the bit
                        const partialX = startX + partialBit * 2 * (midX - startX);
                        animationCtx.lineTo(partialX, midHeight + amplitude);
                    } else {
                        // Second half of the bit
                        animationCtx.lineTo(midX, midHeight + amplitude);
                        animationCtx.lineTo(midX, midHeight - amplitude);
                        
                        const partialX = midX + (partialBit - 0.5) * 2 * (endX - midX);
                        animationCtx.lineTo(partialX, midHeight - amplitude);
                    }
                }
            }
        }
        
        function drawAnimatedDifferentialManchester(binary, progressBits, partialBit, timeScale, midHeight, amplitude) {
            let currentLevel = -1;
            
            for (let i = 0; i < progressBits - 1; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const midX = (i + 0.5) * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (i > 0 && bit === '0') {
                    currentLevel = -currentLevel;
                }
                
                animationCtx.moveTo(startX, midHeight + currentLevel * amplitude);
                animationCtx.lineTo(midX, midHeight + currentLevel * amplitude);
                
                currentLevel = -currentLevel;
                
                animationCtx.lineTo(midX, midHeight + currentLevel * amplitude);
                animationCtx.lineTo(endX, midHeight + currentLevel * amplitude);
            }
            
            // Draw partial last bit
            if (progressBits > 0 && progressBits <= binary.length) {
                const i = progressBits - 1;
                const bit = binary[i];
                const startX = i * timeScale;
                const midX = (i + 0.5) * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (i > 0 && bit === '0') {
                    currentLevel = -currentLevel;
                }
                
                animationCtx.moveTo(startX, midHeight + currentLevel * amplitude);
                
                if (partialBit < 0.5) {
                    // First half of the bit
                    const partialX = startX + partialBit * 2 * (midX - startX);
                    animationCtx.lineTo(partialX, midHeight + currentLevel * amplitude);
                } else {
                    // Second half of the bit
                    animationCtx.lineTo(midX, midHeight + currentLevel * amplitude);
                    
                    currentLevel = -currentLevel;
                    
                    animationCtx.lineTo(midX, midHeight + currentLevel * amplitude);
                    
                    const partialX = midX + (partialBit - 0.5) * 2 * (endX - midX);
                    animationCtx.lineTo(partialX, midHeight + currentLevel * amplitude);
                }
            }
        }
        
        function drawAnimatedNRZL(binary, progressBits, partialBit, timeScale, midHeight, amplitude) {
            for (let i = 0; i < progressBits - 1; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const endX = (i + 1) * timeScale;
                
                const level = bit === '1' ? -1 : 1;
                
                animationCtx.moveTo(startX, midHeight + level * amplitude);
                animationCtx.lineTo(endX, midHeight + level * amplitude);
            }
            
            // Draw partial last bit
            if (progressBits > 0 && progressBits <= binary.length) {
                const i = progressBits - 1;
                const bit = binary[i];
                const startX = i * timeScale;
                const endX = (i + 1) * timeScale;
                
                const level = bit === '1' ? -1 : 1;
                
                animationCtx.moveTo(startX, midHeight + level * amplitude);
                
                const partialX = startX + partialBit * (endX - startX);
                animationCtx.lineTo(partialX, midHeight + level * amplitude);
            }
        }
        
        function drawAnimatedNRZI(binary, progressBits, partialBit, timeScale, midHeight, amplitude) {
            let currentLevel = -1;
            
            for (let i = 0; i < progressBits - 1; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (i > 0 && bit === '1') {
                    currentLevel = -currentLevel;
                }
                
                animationCtx.moveTo(startX, midHeight + currentLevel * amplitude);
                animationCtx.lineTo(endX, midHeight + currentLevel * amplitude);
            }
            
            // Draw partial last bit
            if (progressBits > 0 && progressBits <= binary.length) {
                const i = progressBits - 1;
                const bit = binary[i];
                const startX = i * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (i > 0 && bit === '1') {
                    currentLevel = -currentLevel;
                }
                
                animationCtx.moveTo(startX, midHeight + currentLevel * amplitude);
                
                const partialX = startX + partialBit * (endX - startX);
                animationCtx.lineTo(partialX, midHeight + currentLevel * amplitude);
            }
        }
        
        function drawAnimatedRZ(binary, progressBits, partialBit, timeScale, midHeight, amplitude) {
            for (let i = 0; i < progressBits - 1; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const midX = (i + 0.5) * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (bit === '1') {
                    animationCtx.moveTo(startX, midHeight);
                    animationCtx.lineTo(startX, midHeight - amplitude);
                    animationCtx.lineTo(midX, midHeight - amplitude);
                    animationCtx.lineTo(midX, midHeight);
                    animationCtx.lineTo(endX, midHeight);
                } else {
                    animationCtx.moveTo(startX, midHeight);
                    animationCtx.lineTo(startX, midHeight + amplitude);
                    animationCtx.lineTo(midX, midHeight + amplitude);
                    animationCtx.lineTo(midX, midHeight);
                    animationCtx.lineTo(endX, midHeight);
                }
            }
            
            // Draw partial last bit
            if (progressBits > 0 && progressBits <= binary.length) {
                const i = progressBits - 1;
                const bit = binary[i];
                const startX = i * timeScale;
                const midX = (i + 0.5) * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (bit === '1') {
                    animationCtx.moveTo(startX, midHeight);
                    
                    if (partialBit < 0.5) {
                        // First half of the bit (rising and high)
                        animationCtx.lineTo(startX, midHeight - amplitude);
                        
                        const partialX = startX + partialBit * 2 * (midX - startX);
                        animationCtx.lineTo(partialX, midHeight - amplitude);
                    } else {
                        // Second half of the bit (falling and zero)
                        animationCtx.lineTo(startX, midHeight - amplitude);
                        animationCtx.lineTo(midX, midHeight - amplitude);
                        animationCtx.lineTo(midX, midHeight);
                        
                        const partialX = midX + (partialBit - 0.5) * 2 * (endX - midX);
                        animationCtx.lineTo(partialX, midHeight);
                    }
                } else {
                    animationCtx.moveTo(startX, midHeight);
                    
                    if (partialBit < 0.5) {
                        // First half of the bit (falling and low)
                        animationCtx.lineTo(startX, midHeight + amplitude);
                        
                        const partialX = startX + partialBit * 2 * (midX - startX);
                        animationCtx.lineTo(partialX, midHeight + amplitude);
                    } else {
                        // Second half of the bit (rising and zero)
                        animationCtx.lineTo(startX, midHeight + amplitude);
                        animationCtx.lineTo(midX, midHeight + amplitude);
                        animationCtx.lineTo(midX, midHeight);
                        
                        const partialX = midX + (partialBit - 0.5) * 2 * (endX - midX);
                        animationCtx.lineTo(partialX, midHeight);
                    }
                }
            }
        }
        
        function drawAnimatedAMI(binary, progressBits, partialBit, timeScale, midHeight, amplitude) {
            let lastOnePolarity = -1;
            
            for (let i = 0; i < progressBits - 1; i++) {
                const bit = binary[i];
                const startX = i * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (bit === '0') {
                    animationCtx.moveTo(startX, midHeight);
                    animationCtx.lineTo(endX, midHeight);
                } else {
                    lastOnePolarity = -lastOnePolarity;
                    
                    animationCtx.moveTo(startX, midHeight);
                    animationCtx.lineTo(startX, midHeight + lastOnePolarity * amplitude);
                    animationCtx.lineTo(endX, midHeight + lastOnePolarity * amplitude);
                    animationCtx.lineTo(endX, midHeight);
                }
            }
            
            // Draw partial last bit
            if (progressBits > 0 && progressBits <= binary.length) {
                const i = progressBits - 1;
                const bit = binary[i];
                const startX = i * timeScale;
                const endX = (i + 1) * timeScale;
                
                if (bit === '0') {
                    animationCtx.moveTo(startX, midHeight);
                    
                    const partialX = startX + partialBit * (endX - startX);
                    animationCtx.lineTo(partialX, midHeight);
                } else {
                    lastOnePolarity = -lastOnePolarity;
                    
                    animationCtx.moveTo(startX, midHeight);
                    
                    if (partialBit < 0.33) {
                        // First third: going up/down
                        const partialY = midHeight + (partialBit * 3) * lastOnePolarity * amplitude;
                        animationCtx.lineTo(startX, partialY);
                    } else if (partialBit < 0.67) {
                        // Middle third: horizontal at peak
                        animationCtx.lineTo(startX, midHeight + lastOnePolarity * amplitude);
                        
                        const partialX = startX + (partialBit - 0.33) * 3 * (endX - startX);
                        animationCtx.lineTo(partialX, midHeight + lastOnePolarity * amplitude);
                    } else {
                        // Last third: going back to zero
                        animationCtx.lineTo(startX, midHeight + lastOnePolarity * amplitude);
                        animationCtx.lineTo(endX, midHeight + lastOnePolarity * amplitude);
                        
                        const partialY = midHeight + lastOnePolarity * amplitude * (1 - (partialBit - 0.67) * 3);
                        animationCtx.lineTo(endX, partialY);
                    }
                }
            }
        }

        // Utility functions
        function generateRandomBinary(inputElement, minLength = 8, maxLength = 16) {
            const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
            let binary = '';
            
            for (let i = 0; i < length; i++) {
                binary += Math.round(Math.random()).toString();
            }
            
            inputElement.value = binary;
            return binary;
        }

        function downloadImage(canvasElement, prefix) {
            const link = document.createElement('a');
            link.download = `${prefix}-${encodingType.value}-encoding.png`;
            link.href = canvasElement.toDataURL('image/png');
            link.click();
            
            showToast('Image downloaded successfully', 'success');
        }

        function generateEncodedOutput(binary, type) {
            let output = '';
            
            switch (type) {
                case 'manchester':
                    for (let i = 0; i < binary.length; i++) {
                        output += binary[i] === '0' ? '10' : '01';
                    }
                    break;
                case 'differential':
                    let lastBit = '0'; // Start with an arbitrary bit
                    for (let i = 0; i < binary.length; i++) {
                        if (binary[i] === '0') {
                            // Invert the last bit
                            output += lastBit === '0' ? '1' : '0';
                            lastBit = lastBit === '0' ? '1' : '0';
                        } else {
                            // Keep the same as the last bit
                            output += lastBit;
                        }
                        // Always transition in the middle
                        output += lastBit === '0' ? '1' : '0';
                        lastBit = lastBit === '0' ? '1' : '0';
                    }
                    break;
                case 'nrz-l':
                    for (let i = 0; i < binary.length; i++) {
                        output += binary[i] === '0' ? '0' : '1';
                    }
                    break;
                case 'nrz-i':
                    let level = '1'; // Start with an arbitrary level
                    for (let i = 0; i < binary.length; i++) {
                        if (binary[i] === '1') {
                            // Invert the level for 1
                            level = level === '0' ? '1' : '0';
                        }
                        output += level;
                    }
                    break;
                case 'rz':
                    for (let i = 0; i < binary.length; i++) {
                        output += binary[i] === '0' ? '-+' : '+-';
                    }
                    break;
                case 'ami':
                    let lastPolarity = '+';
                    for (let i = 0; i < binary.length; i++) {
                        if (binary[i] === '0') {
                            output += '0';
                        } else {
                            lastPolarity = lastPolarity === '+' ? '-' : '+';
                            output += lastPolarity;
                        }
                    }
                    break;
                case '4b5b':
                    // Pad the binary input to a multiple of 4
                    let paddedBinary = binary;
                    while (paddedBinary.length % 4 !== 0) {
                        paddedBinary = '0' + paddedBinary;
                    }
                    
                    // Convert 4-bit groups to 5-bit codes
                    for (let i = 0; i < paddedBinary.length; i += 4) {
                        const nibble = paddedBinary.substring(i, i + 4);
                        output += fourBFiveB[nibble];
                    }
                    break;
            }
            
            return output;
        }

        function copyEncodedOutput() {
            if (!encodedOutput) {
                showToast('No encoded output to copy', 'warning');
                return;
            }
            
            navigator.clipboard.writeText(encodedOutput)
                .then(() => {
                    showToast('Encoded output copied to clipboard', 'success');
                })
                .catch(() => {
                    showToast('Failed to copy to clipboard', 'error');
                });
        }

        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <span>${message}</span>
                <button class="toast-close">&times;</button>
            `;
            
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                toast.remove();
            });
            
            toastContainer.appendChild(toast);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 5000);
        }

        // Visual effects
        function createParticles() {
            particlesContainer.innerHTML = '';
            
            const particleCount = 30;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Random size between 2 and 8px
                const size = Math.random() * 6 + 2;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                // Random position
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                particle.style.left = `${posX}%`;
                particle.style.top = `${posY}%`;
                
                // Random animation
                const duration = Math.random() * 20 + 10;
                const delay = Math.random() * 5;
                particle.style.animation = `pulse ${duration}s ${delay}s infinite alternate`;
                
                particlesContainer.appendChild(particle);
            }
        }

        function createDispersionEffect(container) {
            container.innerHTML = '';
            
            const dotCount = 50;
            
            for (let i = 0; i < dotCount; i++) {
                const dot = document.createElement('div');
                dot.className = 'dispersion-dot';
                
                // Random size between 2 and 10px
                const size = Math.random() * 8 + 2;
                dot.style.width = `${size}px`;
                dot.style.height = `${size}px`;
                
                // Random position
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                dot.style.left = `${posX}%`;
                dot.style.top = `${posY}%`;
                
                container.appendChild(dot);
            }
        }

        function checkScrollAnimation() {
            const elements = document.querySelectorAll('.animate-slide-up, .animate-slide-in-right');
            
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementTop < windowHeight * 0.8) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        }

        // Initialize the application
        window.addEventListener('load', init);