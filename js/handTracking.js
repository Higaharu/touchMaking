class HandTracker {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.handResults = null;
        this.isHandVisible = false;
        this.handLandmarks = [];
        this.gestureType = 'none';
        this.gestureCallbacks = {};
        this.handOverlayCanvas = document.getElementById('hand-overlay');
        this.handOverlayCtx = this.handOverlayCanvas ? this.handOverlayCanvas.getContext('2d') : null;
        
        // 複数の手の情報を格納する配列
        this.detectedHands = [];
        
        // デバッグモード
        this.debugMode = true;
        
        // エラーカウンター
        this.errorCount = 0;
        this.maxErrors = 10;

        // カメラ初期化の遅延を設定
        setTimeout(() => {
            this.setupHandTracking();
        }, 1000);
    }

    setupHandTracking() {
        console.log("Setting up hand tracking...");
        
        try {
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });
    
            this.hands.setOptions({
                maxNumHands: 2, // 両手追跡のために2に変更
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
    
            this.hands.onResults((results) => {
                try {
                    this.onHandResults(results);
                } catch (error) {
                    this.handleError("Error in onHandResults", error);
                }
            });
    
            const video = document.getElementById('webcam');
            
            // カメラ初期化前にビデオ要素のサイズを設定
            if (video) {
                video.width = 640;
                video.height = 480;
            }
            
            // カメラ初期化の前にログを出力
            console.log("Initializing camera...");
            console.log("Video element:", video);
            
            try {
                this.camera = new Camera(video, {
                    onFrame: async () => {
                        try {
                            if (this.hands) {
                                await this.hands.send({ image: video });
                            }
                        } catch (error) {
                            this.handleError("Error in hand tracking onFrame", error);
                        }
                    },
                    width: 640,
                    height: 480
                });
    
                // Debug info about starting the camera
                console.log('Starting camera...');
                
                this.camera.start()
                    .then(() => {
                        console.log('Camera started successfully');
                    })
                    .catch(error => {
                        this.handleError("Error starting camera", error);
                        alert('カメラの起動に失敗しました。ブラウザの設定を確認してください。');
                    });
            } catch (e) {
                this.handleError("Camera initialization error", e);
                alert('カメラの初期化中にエラーが発生しました: ' + e.message);
            }
        } catch (error) {
            this.handleError("Error in setupHandTracking", error);
        }
    }
    
    // エラーハンドリング用のメソッド
    handleError(context, error) {
        this.errorCount++;
        
        // エラーメッセージをコンソールに出力
        console.error(`${context}: ${error.message || error}`, error);
        
        // エラーが多すぎる場合はアラートを表示
        if (this.errorCount > this.maxErrors) {
            console.warn("Too many errors in hand tracking. Consider reloading the page.");
        }
    }

    onHandResults(results) {
        try {
            this.handResults = results;
            this.isHandVisible = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
            
            // 検出された手の情報をクリア
            this.detectedHands = [];
            
            if (this.isHandVisible) {
                // 複数の手を処理
                for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                    const landmarks = results.multiHandLandmarks[i];
                    const handedness = results.multiHandedness[i].label; // 'Left' or 'Right'
                    
                    // 最初の手の情報を後方互換性のために保存
                    if (i === 0) {
                        this.handLandmarks = landmarks;
                        this.gestureType = this.detectGestureForLandmarks(landmarks);
                    }
                    
                    // 各手の情報を格納
                    this.detectedHands.push({
                        landmarks: landmarks,
                        handedness: handedness,
                        gestureType: this.detectGestureForLandmarks(landmarks),
                        palmPosition: this.getPalmPositionFromLandmarks(landmarks),
                        fingerPositions: this.getFingerPositionsFromLandmarks(landmarks)
                    });
                }
                
                // 手のジェスチャーを検出し、コールバックをトリガー
                this.detectGesture();
                
                // 手のランドマークを描画
                this.drawHandLandmarks();
                
                // デバッグ情報を表示
                if (this.debugMode) {
                    console.log(`Hands detected: ${this.detectedHands.length}, Gesture: ${this.gestureType}`);
                }
            } else {
                this.gestureType = 'none';
                // 手が見えない場合はオーバーレイをクリア
                if (this.handOverlayCtx) {
                    this.handOverlayCtx.clearRect(0, 0, this.handOverlayCanvas.width, this.handOverlayCanvas.height);
                }
            }
        } catch (error) {
            this.handleError("Error processing hand results", error);
        }
    }

    updateHandPosition() {
        // Empty method - no hand position dot needed
    }

    drawHandLandmarks() {
        if (!this.isHandVisible || !this.handOverlayCtx || !this.handOverlayCanvas) return;
        
        try {
            const ctx = this.handOverlayCtx;
            const width = this.handOverlayCanvas.width;
            const height = this.handOverlayCanvas.height;
            
            // キャンバスをクリア
            ctx.clearRect(0, 0, width, height);
            
            // 指の接続関係を定義
            const connections = [
                // 親指
                [0, 1], [1, 2], [2, 3], [3, 4],
                // 人差し指
                [0, 5], [5, 6], [6, 7], [7, 8],
                // 中指
                [0, 9], [9, 10], [10, 11], [11, 12],
                // 薬指
                [0, 13], [13, 14], [14, 15], [15, 16],
                // 小指
                [0, 17], [17, 18], [18, 19], [19, 20],
                // 手のひら
                [0, 5], [5, 9], [9, 13], [13, 17]
            ];
            
            // 検出された各手を描画
            this.detectedHands.forEach((hand, index) => {
                const landmarks = hand.landmarks;
                const gestureType = hand.gestureType;
                
                // 現在のジェスチャーに基づいて色を設定
                let color;
                switch (gestureType) {
                    case 'grab':
                        color = 'rgba(255, 0, 0, 0.7)'; // 赤
                        break;
                    case 'push':
                        color = 'rgba(0, 0, 255, 0.7)'; // 青
                        break;
                    case 'spread':
                        color = 'rgba(0, 255, 0, 0.7)'; // 緑
                        break;
                    case 'wave':
                        color = 'rgba(255, 255, 0, 0.7)'; // 黄
                        break;
                    default:
                        color = 'rgba(255, 255, 255, 0.7)'; // 白
                }
                
                // 左右の手で色合いを少し変える
                if (hand.handedness === 'Left') {
                    color = color.replace('0.7', '0.8'); // 左手は少し濃く
                }
                
                // 線を描画
                ctx.lineWidth = 3;
                ctx.strokeStyle = color;
                ctx.fillStyle = color;
                
                // 接続線を描画
                connections.forEach(([i, j]) => {
                    const start = landmarks[i];
                    const end = landmarks[j];
                    
                    ctx.beginPath();
                    ctx.moveTo(start.x * width, start.y * height);
                    ctx.lineTo(end.x * width, end.y * height);
                    ctx.stroke();
                });
                
                // ランドマークポイントを描画
                landmarks.forEach(point => {
                    ctx.beginPath();
                    ctx.arc(point.x * width, point.y * height, 5, 0, 2 * Math.PI);
                    ctx.fill();
                });
                
                // 手の種類を表示（左右）
                const palmPos = landmarks[0];
                ctx.font = '16px Arial';
                ctx.fillStyle = 'white';
                // MediaPipeの検出では、「Left」はユーザーの右手、「Right」はユーザーの左手
                // ウェブカメラの映像は反転しているため、正しく表示するには逆にする
                const displayHandedness = hand.handedness === 'Left' ? '右手' : '左手';
                ctx.fillText(displayHandedness, palmPos.x * width - 20, palmPos.y * height - 20);
            });
        } catch (error) {
            this.handleError("Error drawing hand landmarks", error);
        }
    }

    detectGestureForLandmarks(landmarks) {
        // 指が伸びているかどうかを確認
        const thumbExtended = this.isFingerExtended(landmarks, 1, 2, 3, 4);
        const indexExtended = this.isFingerExtended(landmarks, 5, 6, 7, 8);
        const middleExtended = this.isFingerExtended(landmarks, 9, 10, 11, 12);
        const ringExtended = this.isFingerExtended(landmarks, 13, 14, 15, 16);
        const pinkyExtended = this.isFingerExtended(landmarks, 17, 18, 19, 20);
        
        // 伸びている指の数をカウント
        const extendedFingers = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended];
        const extendedCount = extendedFingers.filter(extended => extended).length;
        
        // 異なるジェスチャータイプを検出
        if (extendedCount === 0 || extendedCount === 1) {
            // 拳のジェスチャー（つかむ）
            return 'grab';
        } else if (extendedCount === 1 && indexExtended) {
            // 指差しジェスチャー（押す）
            return 'push';
        } else if (extendedCount >= 4) {
            // 開いた手のひら（広げる）
            return 'spread';
        } else {
            // 振る動作やその他のジェスチャー
            return 'wave';
        }
    }

    detectGesture() {
        if (!this.isHandVisible) return;
        
        try {
            // 後方互換性のために最初の手のジェスチャーを検出
            const landmarks = this.handLandmarks;
            let previousGesture = this.gestureType;
            
            this.gestureType = this.detectGestureForLandmarks(landmarks);
            
            // ジェスチャーが変わった場合、コールバックをトリガー
            if (previousGesture !== this.gestureType) {
                this.triggerGestureCallback(this.gestureType);
            } else {
                // ジェスチャーが変わっていなくても定期的にコールバックをトリガー
                this.triggerGestureCallback(this.gestureType);
            }
        } catch (error) {
            this.handleError("Error detecting gesture", error);
        }
    }
    
    isFingerExtended(landmarks, base, joint1, joint2, tip) {
        // Calculate the distance between base and tip
        const baseToTipDist = this.distance3D(landmarks[base-1], landmarks[tip-1]);
        
        // Calculate other joint distances
        const baseToJoint1Dist = this.distance3D(landmarks[base-1], landmarks[joint1-1]);
        const joint1ToJoint2Dist = this.distance3D(landmarks[joint1-1], landmarks[joint2-1]);
        const joint2ToTipDist = this.distance3D(landmarks[joint2-1], landmarks[tip-1]);
        
        // If the base-to-tip distance is close to the sum of the joint distances, the finger is extended
        const sumJointDistances = baseToJoint1Dist + joint1ToJoint2Dist + joint2ToTipDist;
        return baseToTipDist > sumJointDistances * 0.7;
    }
    
    distance3D(point1, point2) {
        return Math.sqrt(
            Math.pow(point1.x - point2.x, 2) +
            Math.pow(point1.y - point2.y, 2) +
            Math.pow(point1.z - point2.z, 2)
        );
    }

    getPalmPositionFromLandmarks(landmarks) {
        // ランドマーク0は手のひらの中心
        const palmPosition = landmarks[0];
        return {
            x: palmPosition.x,
            y: palmPosition.y,
            z: palmPosition.z
        };
    }

    getFingerPositionsFromLandmarks(landmarks) {
        // 指先の位置を返す（ランドマーク4, 8, 12, 16, 20）
        return [
            {
                finger: 'thumb',
                position: {
                    x: landmarks[4].x,
                    y: landmarks[4].y,
                    z: landmarks[4].z
                }
            },
            {
                finger: 'index',
                position: {
                    x: landmarks[8].x,
                    y: landmarks[8].y,
                    z: landmarks[8].z
                }
            },
            {
                finger: 'middle',
                position: {
                    x: landmarks[12].x,
                    y: landmarks[12].y,
                    z: landmarks[12].z
                }
            },
            {
                finger: 'ring',
                position: {
                    x: landmarks[16].x,
                    y: landmarks[16].y,
                    z: landmarks[16].z
                }
            },
            {
                finger: 'pinky',
                position: {
                    x: landmarks[20].x,
                    y: landmarks[20].y,
                    z: landmarks[20].z
                }
            }
        ];
    }

    getPalmPosition() {
        if (!this.isHandVisible) return null;
        
        // Use the palm position (landmark 0)
        const palmPosition = this.handLandmarks[0];
        return {
            x: palmPosition.x,
            y: palmPosition.y,
            z: palmPosition.z
        };
    }

    getFingerPositions() {
        if (!this.isHandVisible) return null;
        
        // Return positions of fingertips (landmarks 4, 8, 12, 16, 20)
        return [
            {
                finger: 'thumb',
                position: {
                    x: this.handLandmarks[4].x,
                    y: this.handLandmarks[4].y,
                    z: this.handLandmarks[4].z
                }
            },
            {
                finger: 'index',
                position: {
                    x: this.handLandmarks[8].x,
                    y: this.handLandmarks[8].y,
                    z: this.handLandmarks[8].z
                }
            },
            {
                finger: 'middle',
                position: {
                    x: this.handLandmarks[12].x,
                    y: this.handLandmarks[12].y,
                    z: this.handLandmarks[12].z
                }
            },
            {
                finger: 'ring',
                position: {
                    x: this.handLandmarks[16].x,
                    y: this.handLandmarks[16].y,
                    z: this.handLandmarks[16].z
                }
            },
            {
                finger: 'pinky',
                position: {
                    x: this.handLandmarks[20].x,
                    y: this.handLandmarks[20].y,
                    z: this.handLandmarks[20].z
                }
            }
        ];
    }

    getCurrentGesture() {
        return this.gestureType;
    }

    isVisible() {
        return this.isHandVisible;
    }
    
    // 検出された全ての手の情報を取得
    getAllDetectedHands() {
        return this.detectedHands;
    }

    onGesture(gestureType, callback) {
        this.gestureCallbacks[gestureType] = callback;
    }

    triggerGestureCallback(gestureType) {
        if (this.gestureCallbacks[gestureType]) {
            this.gestureCallbacks[gestureType](this.getPalmPosition(), this.getFingerPositions());
        }
        
        // Also trigger "any" gesture callback if defined
        if (this.gestureCallbacks['any']) {
            this.gestureCallbacks['any'](gestureType, this.getPalmPosition(), this.getFingerPositions());
        }
    }
} 