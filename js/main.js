document.addEventListener('DOMContentLoaded', () => {
    // Initialize canvas
    const canvas = document.getElementById('output-canvas');
    const video = document.getElementById('webcam');
    const handOverlay = document.getElementById('hand-overlay');
    const appContainer = document.querySelector('.app-container');
    const cameraStatus = document.getElementById('camera-status');
    
    // Set initial canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // ハンドオーバーレイのサイズも設定
    if (handOverlay) {
        handOverlay.width = canvas.width;
        handOverlay.height = canvas.height;
    }
    
    // Initialize hand tracking (グローバルスコープに保存)
    window.handTracker = new HandTracker();
    
    // Initialize particle system with 'sand' as the default material
    const particleSystem = new ParticleSystem(canvas, 'sand');
    
    // Set initial material attribute
    appContainer.setAttribute('data-material', 'sand');
    
    // Register gesture callbacks with simplified coordinate handling
    window.handTracker.onGesture('any', (gestureType, palmPosition, fingerPositions) => {
        try {
            // デバッグ情報を出力
            console.log("Gesture callback triggered:", gestureType);
            if (palmPosition) {
                console.log("Palm position:", palmPosition.x, palmPosition.y);
            }
            
            // 単純に現在のジェスチャーを粒子システムに渡す
            particleSystem.applyGestureEffect(gestureType, palmPosition, fingerPositions);
        } catch (error) {
            console.error("Error in gesture callback:", error);
        }
    });
    
    // 定期的に両手の情報を粒子システムに渡す
    setInterval(() => {
        try {
            if (window.handTracker) {
                const detectedHands = window.handTracker.getAllDetectedHands();
                if (detectedHands && detectedHands.length > 0) {
                    // デバッグ情報を出力
                    console.log("Hands detected:", detectedHands.length);
                    
                    // 単純に検出された手の情報を粒子システムに渡す
                    particleSystem.updateHands(detectedHands);
                }
            }
        } catch (error) {
            console.error("Error updating hands:", error);
        }
    }, 30); // 30msごとに更新
    
    // Set up stage selector buttons
    const stageButtons = document.querySelectorAll('.stage-btn');
    
    stageButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            stageButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Change particle type based on button data
            const materialType = button.getAttribute('data-stage');
            particleSystem.changeParticleType(materialType);
            
            // Update app container data attribute for material-specific styles
            appContainer.setAttribute('data-material', materialType);
            
            // Update status message
            updateStatusMessage(materialType);
        });
    });
    
    function updateStatusMessage(materialType) {
        const statusMessage = document.querySelector('.status-message');
        const mrHint = document.querySelector('.mr-hint');
        
        // 物質ごとのヒントメッセージ
        const hints = {
            sand: '砂は重力に従って落ちていきます。手のひらで砂を受け止めたり、指で砂山を作ったりしてみましょう！',
            water: '水は流れるように動きます。手で水をすくったり、指で波紋を作ったりしてみましょう！',
            clay: '粘土は形を保持します。握って形を作り、手のひらを開いて形を広げてみましょう！',
            slime: 'スライムはねばねばと伸びます。手で引っ張ったり、指でつついたりしてみましょう！',
            light: '光の粒子は軽やかに浮かびます。手の動きに合わせて光の流れを作ってみましょう！'
        };
        
        mrHint.textContent = hints[materialType] || '画面に映った自分の手と仮想物質が同じ空間にあるように操作してみましょう！';
    }
    
    // カメラの初期化状態を監視
    let cameraInitCheckInterval = setInterval(() => {
        if (window.handTracker && window.handTracker.isVisible()) {
            // カメラが正常に動作している
            if (cameraStatus) {
                cameraStatus.textContent = 'カメラ初期化完了！';
                setTimeout(() => {
                    cameraStatus.style.display = 'none';
                }, 1500);
            }
            clearInterval(cameraInitCheckInterval);
        }
    }, 1000);
    
    // 30秒後にもカメラが初期化されていなければ再試行を促す
    setTimeout(() => {
        if (cameraStatus && cameraStatus.style.display !== 'none') {
            cameraStatus.textContent = 'カメラの初期化に時間がかかっています。「カメラを再初期化」ボタンを押してみてください。';
        }
    }, 30000);
    
    // Request camera permission and handle errors
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            } 
        })
            .then(stream => {
                console.log('Camera access granted');
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play()
                        .then(() => {
                            console.log('Video playback started');
                            // カメラが許可されたときにもう一度ハンドトラッキングを初期化
                            setTimeout(() => {
                                window.handTracker.setupHandTracking();
                                // 初期状態のヒントメッセージを更新
                                updateStatusMessage('sand');
                            }, 1000);
                        })
                        .catch(err => {
                            console.error('Error playing video:', err);
                        });
                };
            })
            .catch(error => {
                console.error('Camera access denied or error:', error);
                showCameraError();
            });
    } else {
        console.error('getUserMedia is not supported in this browser');
        showCameraError();
    }
    
    function showCameraError() {
        // Display camera error message
        const canvasContainer = document.querySelector('.canvas-container');
        
        // Create error message
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.innerHTML = `
            <h3>カメラへのアクセスができません</h3>
            <p>このアプリケーションを使用するには、カメラへのアクセスを許可してください。</p>
            <p>ブラウザの設定でカメラへのアクセスを許可するか、デスクトップブラウザを使用してください。</p>
            <button id="retry-camera-error" class="retry-button">カメラを再初期化</button>
        `;
        
        // Clear and append error
        canvasContainer.innerHTML = '';
        canvasContainer.appendChild(errorMessage);
        
        // Add retry button event listener
        const retryButton = document.getElementById('retry-camera-error');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }
    
    // Handle window resize events
    window.addEventListener('resize', () => {
        // Canvas size is updated automatically in the particle system's animate method
        console.log('Window resized');
        
        // ハンドオーバーレイのサイズも更新
        if (handOverlay) {
            handOverlay.width = canvas.offsetWidth;
            handOverlay.height = canvas.offsetHeight;
        }
    });
    
    // Add audio feedback for gestures
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let lastGestureType = 'none';
    
    // Function to create sound based on gesture type and material
    function playGestureSound(gestureType, materialType) {
        if (!audioContext) return;
        
        // Only play sound if gesture changed
        if (gestureType === lastGestureType) return;
        lastGestureType = gestureType;
        
        // Create oscillator
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Material-specific sounds
        let frequency = 440;
        let type = 'sine';
        let duration = 0.1;
        
        switch (materialType) {
            case 'sand':
                // Scratchy sound for sand
                type = 'sawtooth';
                frequency = 100 + Math.random() * 100;
                duration = 0.05 + Math.random() * 0.05;
                break;
            case 'water':
                // Bubbly sound for water
                type = 'sine';
                frequency = 300 + Math.random() * 200;
                duration = 0.1 + Math.random() * 0.1;
                break;
            case 'clay':
                // Dull sound for clay
                type = 'triangle';
                frequency = 150 + Math.random() * 50;
                duration = 0.2;
                break;
            case 'slime':
                // Squishy sound for slime
                type = 'triangle';
                frequency = 200 + Math.random() * 100;
                duration = 0.15 + Math.random() * 0.15;
                break;
            case 'light':
                // Bright sound for light particles
                type = 'sine';
                frequency = 500 + Math.random() * 300;
                duration = 0.05 + Math.random() * 0.1;
                break;
        }
        
        // Gesture-specific variations
        switch (gestureType) {
            case 'grab':
                frequency *= 0.8;
                break;
            case 'push':
                frequency *= 1.2;
                break;
            case 'spread':
                duration *= 1.5;
                break;
            case 'wave':
                // Modulation for wave gesture
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(frequency * 1.5, audioContext.currentTime + duration);
                break;
        }
        
        // Configure oscillator
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        // Configure gain (volume)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // Add gesture sound to the callback
    window.handTracker.onGesture('any', (gestureType, palmPosition, fingerPositions) => {
        if (gestureType !== 'none') {
            playGestureSound(gestureType, particleSystem.materialType);
        }
    });
    
    // Add debug info (can be removed or toggled in production)
    const debugInfo = document.createElement('div');
    debugInfo.id = 'debug-info';
    debugInfo.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 100;
        display: block;
    `;
    document.querySelector('.canvas-container').appendChild(debugInfo);
    
    // Update debug info
    function updateDebugInfo() {
        const gesture = window.handTracker.getCurrentGesture();
        const isVisible = window.handTracker.isVisible();
        const handsCount = window.handTracker.getAllDetectedHands().length;
        
        debugInfo.innerHTML = `
            <div>Hands detected: ${handsCount}</div>
            <div>Hand visible: ${isVisible ? 'Yes' : 'No'}</div>
            <div>Current gesture: ${gesture}</div>
            <div>Material: ${particleSystem.materialType}</div>
            <div>Particles: ${particleSystem.particles.length}</div>
        `;
        
        requestAnimationFrame(updateDebugInfo);
    }
    
    // Enable debug info by default
    updateDebugInfo();
    
    // Toggle debug info with keyboard shortcut (press 'd')
    document.addEventListener('keydown', (event) => {
        if (event.key === 'd') {
            debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
        }
    });
}); 