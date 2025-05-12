class ParticleSystem {
    constructor(canvas, materialType = 'sand') {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.particles = [];
        this.maxParticles = 2000;
        this.materialType = materialType;
        this.handDepthMap = null; // 手の深度マップ
        this.lastHandPosition = null; // 前回の手の位置
        this.handVelocity = { x: 0, y: 0 }; // 手の速度
        this.hands = []; // 複数の手の情報を格納
        
        // Material-specific properties
        this.materials = {
            sand: {
                color: '#E2C078',
                gravity: 0.0, // 重力を0に設定
                friction: 0.9,
                repulsion: 0.05,
                cohesion: 0.01,
                particleSize: 3,
                spread: 0.8,
                randomness: 0.3,
                blendMode: 'source-over',
                shadowColor: 'rgba(0,0,0,0.3)',
                interactionStrength: 1.0
            },
            water: {
                color: '#5DA2D5',
                gravity: 0.0, // 重力を0に設定
                friction: 0.95,
                repulsion: 0.02,
                cohesion: 0.05,
                particleSize: 4,
                spread: 1.2,
                randomness: 0.4,
                blendMode: 'screen',
                shadowColor: 'rgba(0,100,255,0.2)',
                interactionStrength: 1.2
            },
            clay: {
                color: '#8D6E63',
                gravity: 0.0, // 重力を0に設定
                friction: 0.7,
                repulsion: 0.08,
                cohesion: 0.15,
                particleSize: 5,
                spread: 0.5,
                randomness: 0.1,
                blendMode: 'source-over',
                shadowColor: 'rgba(50,20,0,0.4)',
                interactionStrength: 1.5
            },
            slime: {
                color: '#76FF03',
                gravity: 0.0, // 重力を0に設定
                friction: 0.8,
                repulsion: 0.03,
                cohesion: 0.3,
                particleSize: 6,
                spread: 0.3,
                randomness: 0.05,
                blendMode: 'screen',
                shadowColor: 'rgba(50,200,0,0.3)',
                interactionStrength: 0.8
            },
            light: {
                color: '#FFEB3B',
                gravity: 0.0, // 重力を0に設定
                friction: 0.98,
                repulsion: 0.01,
                cohesion: 0.0,
                particleSize: 2,
                spread: 1.5,
                randomness: 0.6,
                blendMode: 'lighter',
                shadowColor: 'rgba(255,255,100,0.3)',
                interactionStrength: 0.7
            }
        };
        
        // Initialize the particles
        this.initParticles();
        
        // Start animation loop
        this.animate();
    }
    
    initParticles() {
        this.particles = [];
        
        // Different initial distribution based on material type
        switch (this.materialType) {
            case 'sand':
                this.createSandPile();
                break;
            case 'water':
                this.createWaterPool();
                break;
            case 'clay':
                this.createClayBall();
                break;
            case 'slime':
                this.createSlimeMass();
                break;
            case 'light':
                this.createLightField();
                break;
            default:
                this.createSandPile();
        }
    }
    
    createSandPile() {
        // 上から見た視点で砂を分布
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        for (let i = 0; i < this.maxParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (this.width / 4);
            
            this.particles.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                color: this.getParticleColor('sand'),
                size: this.materials.sand.particleSize * (0.8 + Math.random() * 0.4),
                mass: 1.0,
                fixed: false
            });
        }
    }
    
    createWaterPool() {
        // 上から見た視点で水を分布
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const poolWidth = this.width / 2.5;
        const poolHeight = this.height / 2.5;
        
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                x: centerX - poolWidth/2 + Math.random() * poolWidth,
                y: centerY - poolHeight/2 + Math.random() * poolHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                color: this.getParticleColor('water'),
                size: this.materials.water.particleSize * (0.8 + Math.random() * 0.4),
                mass: 0.8,
                fixed: false
            });
        }
    }
    
    createClayBall() {
        // 上から見た視点で粘土を分布
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = this.width / 8;
        
        for (let i = 0; i < this.maxParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.pow(Math.random(), 0.5) * radius; // More concentrated in the center
            
            this.particles.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r,
                vx: 0,
                vy: 0,
                color: this.getParticleColor('clay'),
                size: this.materials.clay.particleSize * (0.8 + Math.random() * 0.4),
                mass: 1.2,
                fixed: false
            });
        }
    }
    
    createSlimeMass() {
        // 上から見た視点でスライムを分布
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = this.width / 6;
        
        for (let i = 0; i < this.maxParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.pow(Math.random(), 0.6) * radius;
            
            this.particles.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r,
                vx: 0,
                vy: 0,
                color: this.getParticleColor('slime'),
                size: this.materials.slime.particleSize * (0.8 + Math.random() * 0.4),
                mass: 0.9,
                fixed: false
            });
        }
    }
    
    createLightField() {
        // 上から見た視点で光の粒子を分布
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                color: this.getParticleColor('light'),
                size: this.materials.light.particleSize * (0.7 + Math.random() * 0.6),
                mass: 0.5,
                fixed: false
            });
        }
    }
    
    getParticleColor(materialType) {
        const baseColor = this.materials[materialType].color;
        const variation = 20;
        
        // Parse base color to RGB
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        
        // Add slight variations
        const newR = Math.min(255, Math.max(0, r + (Math.random() - 0.5) * variation));
        const newG = Math.min(255, Math.max(0, g + (Math.random() - 0.5) * variation));
        const newB = Math.min(255, Math.max(0, b + (Math.random() - 0.5) * variation));
        
        // Convert back to hex
        return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
    }
    
    changeParticleType(newType) {
        if (!this.materials[newType]) return;
        
        this.materialType = newType;
        this.initParticles();
    }
    
    // 複数の手の情報を更新
    updateHands(handsData) {
        try {
            // 手のデータを保存する前に、X座標を反転させる（ウェブカメラの表示と一致させるため）
            this.hands = handsData ? handsData.map(hand => {
                // 手の位置情報をディープコピー
                const handCopy = JSON.parse(JSON.stringify(hand));
                
                // 手のひらの位置を変換
                if (handCopy.palmPosition) {
                    handCopy.palmPosition = {
                        x: 1.0 - handCopy.palmPosition.x, // X座標を反転
                        y: handCopy.palmPosition.y,
                        z: handCopy.palmPosition.z
                    };
                }
                
                // 指の位置も変換
                if (handCopy.fingerPositions) {
                    handCopy.fingerPositions = handCopy.fingerPositions.map(finger => ({
                        finger: finger.finger,
                        position: {
                            x: 1.0 - finger.position.x, // X座標を反転
                            y: finger.position.y,
                            z: finger.position.z
                        }
                    }));
                }
                
                // 前回の位置があれば変換
                if (handCopy.previousPosition) {
                    handCopy.previousPosition = {
                        x: 1.0 - handCopy.previousPosition.x, // X座標を反転
                        y: handCopy.previousPosition.y
                    };
                }
                
                return handCopy;
            }) : [];
            
            // 最初の手の情報を使って速度を計算（後方互換性のため）
            if (this.hands.length > 0) {
                const firstHand = this.hands[0];
                this.updateHandVelocity(firstHand.palmPosition);
            }
            
            // 手の情報が更新されたら即座に効果を適用
            this.applyMultiHandEffects();
        } catch (error) {
            console.error("Error updating hands:", error);
        }
    }
    
    updateHandDepthMap(fingerPositions) {
        if (!fingerPositions) return;
        
        // 手の深度マップを更新（指の位置を使用）
        this.handDepthMap = fingerPositions.map(finger => {
            return {
                x: finger.position.x * this.width,
                y: finger.position.y * this.height,
                z: finger.position.z
            };
        });
    }
    
    updateHandVelocity(position) {
        if (!position || !this.lastHandPosition) {
            this.lastHandPosition = position;
            return;
        }
        
        // 手の速度を計算
        const x = position.x * this.width;
        const y = position.y * this.height;
        const lastX = this.lastHandPosition.x * this.width;
        const lastY = this.lastHandPosition.y * this.height;
        
        this.handVelocity = {
            x: (x - lastX) * 0.5, // 速度を調整
            y: (y - lastY) * 0.5
        };
        
        this.lastHandPosition = position;
    }
    
    // 手のジェスチャーに応じた効果を適用（複数の手に対応）
    applyGestureEffect(gestureType, position, fingerPositions) {
        try {
            if (!position) return;
            
            // 座標を反転して処理（ウェブカメラの表示と一致させる）
            const mirroredPosition = {
                x: 1.0 - position.x, // X座標を反転
                y: position.y,
                z: position.z
            };
            
            // 指の位置も反転
            const mirroredFingerPositions = fingerPositions ? fingerPositions.map(finger => ({
                finger: finger.finger,
                position: {
                    x: 1.0 - finger.position.x, // X座標を反転
                    y: finger.position.y,
                    z: finger.position.z
                }
            })) : null;
            
            // デバッグ情報
            console.log("Original position:", position.x, position.y);
            console.log("Mirrored position:", mirroredPosition.x, mirroredPosition.y);
            
            // 手の深度マップと速度を更新
            this.updateHandDepthMap(mirroredFingerPositions);
            this.updateHandVelocity(mirroredPosition);
            
            const x = mirroredPosition.x * this.width;
            const y = mirroredPosition.y * this.height;
            const radius = this.width * 0.12; // 影響半径を少し大きく
            
            // 動きの大きさを計算
            const movementMagnitude = Math.sqrt(
                this.handVelocity.x * this.handVelocity.x + 
                this.handVelocity.y * this.handVelocity.y
            );
            
            // 速度に応じたスケーリング（速いほど効果が強くなる）
            // 閾値を下げて、小さな動きでも反応するようにする
            const movementThreshold = 1.0;
            let movementScale = 1.0;
            
            if (movementMagnitude < movementThreshold) {
                // 小さな動きは効果を弱める
                movementScale = 0.3 + (movementMagnitude / movementThreshold) * 0.7;
            } else {
                // 大きな動きは効果を強める（最大3倍まで）
                movementScale = 1.0 + Math.min(2.0, (movementMagnitude - movementThreshold) / 10);
            }
            
            switch (gestureType) {
                case 'grab':
                    this.applyGrabEffect(x, y, radius, movementScale);
                    break;
                case 'push':
                    this.applyPushEffect(x, y, radius, movementScale);
                    break;
                case 'spread':
                    this.applySpreadEffect(x, y, radius, movementScale);
                    break;
                case 'wave':
                    this.applyWaveEffect(x, y, radius, movementScale);
                    break;
            }
            
            // 指の形状に基づいた変形効果を適用
            if (mirroredFingerPositions) {
                this.applyFingerShapeEffect(mirroredFingerPositions, movementScale);
            }
            
            // 手の速度による影響を追加
            this.applyHandVelocityEffect(movementScale);
        } catch (error) {
            console.error("Error applying gesture effect:", error);
        }
    }
    
    // 複数の手に対応した効果適用
    applyMultiHandEffects() {
        if (!this.hands || this.hands.length === 0) return;
        
        // 各手に対して効果を適用
        this.hands.forEach(hand => {
            if (!hand.palmPosition || !hand.gestureType) return;
            
            const x = hand.palmPosition.x * this.width;
            const y = hand.palmPosition.y * this.height;
            const radius = this.width * 0.12;
            
            // 手の速度を計算（前回の位置がある場合）
            let handVelocity = { x: 0, y: 0 };
            let movementScale = 0.5; // デフォルトで少し弱める
            
            if (hand.previousPosition) {
                const dx = (hand.palmPosition.x - hand.previousPosition.x) * this.width;
                const dy = (hand.palmPosition.y - hand.previousPosition.y) * this.height;
                const movementMagnitude = Math.sqrt(dx * dx + dy * dy);
                
                // 速度に応じたスケーリング
                if (movementMagnitude < 1.0) {
                    // 小さな動きは効果を弱める
                    movementScale = 0.3 + (movementMagnitude / 1.0) * 0.7;
                } else {
                    // 大きな動きは効果を強める（最大3倍まで）
                    movementScale = 1.0 + Math.min(2.0, (movementMagnitude - 1.0) / 10);
                }
                
                // 速度情報を保存
                handVelocity = { x: dx, y: dy };
            }
            
            // 現在の位置を保存して次回の速度計算に使用
            hand.previousPosition = { 
                x: hand.palmPosition.x, 
                y: hand.palmPosition.y 
            };
            
            switch (hand.gestureType) {
                case 'grab':
                    this.applyGrabEffect(x, y, radius, movementScale);
                    break;
                case 'push':
                    this.applyPushEffect(x, y, radius, movementScale);
                    break;
                case 'spread':
                    this.applySpreadEffect(x, y, radius, movementScale);
                    break;
                case 'wave':
                    this.applyWaveEffect(x, y, radius, movementScale);
                    break;
            }
            
            // 指の形に合わせた変形を適用
            if (hand.fingerPositions) {
                this.applyFingerShapeEffect(hand.fingerPositions, movementScale);
            }
            
            // 手の速度に応じた効果を適用
            this.applyVelocityEffect(x, y, radius, handVelocity, movementScale);
        });
    }
    
    // 手の速度に応じた効果を適用する新しいメソッド
    applyVelocityEffect(x, y, radius, velocity, movementScale) {
        if (!velocity) return;
        
        const material = this.materials[this.materialType];
        const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        
        // 速度が小さい場合は効果を適用しない
        if (velocityMagnitude < 0.5) return;
        
        // 速度の方向を正規化
        const dirX = velocity.x / velocityMagnitude;
        const dirY = velocity.y / velocityMagnitude;
        
        // 速度に応じた効果の強さ
        const strength = Math.min(3.0, velocityMagnitude / 5) * movementScale * material.interactionStrength;
        
        // 材質に応じた効果の調整
        let effectRadius = radius;
        let effectStrength = strength;
        let spreadFactor = 0.3;
        
        switch (this.materialType) {
            case 'sand':
                // 砂は散らばりやすく、影響範囲が広い
                effectRadius *= 1.5;
                spreadFactor = 0.5;
                break;
            case 'water':
                // 水は流れやすく、影響範囲が広い
                effectRadius *= 1.8;
                spreadFactor = 0.6;
                break;
            case 'clay':
                // 粘土は動きにくく、影響範囲が狭い
                effectRadius *= 0.8;
                effectStrength *= 0.7;
                spreadFactor = 0.2;
                break;
            case 'slime':
                // スライムは伸びやすく、影響範囲が中程度
                effectRadius *= 1.2;
                effectStrength *= 0.8;
                spreadFactor = 0.4;
                break;
            case 'light':
                // 光の粒子は散らばりやすく、影響範囲が広い
                effectRadius *= 2.0;
                spreadFactor = 0.7;
                break;
        }
        
        // 粒子に効果を適用
        this.particles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < effectRadius) {
                // 距離に応じた効果の強さ
                const force = (1 - distance / effectRadius) * effectStrength;
                
                // 速度の方向に粒子を押し出す
                particle.vx += dirX * force;
                particle.vy += dirY * force;
                
                // 散らばり効果（速度の垂直方向にランダムに散らばる）
                const perpX = -dirY;
                const perpY = dirX;
                const spreadAmount = (Math.random() - 0.5) * force * spreadFactor * velocityMagnitude;
                
                particle.vx += perpX * spreadAmount;
                particle.vy += perpY * spreadAmount;
                
                // 速い動きで固定を解除
                if (velocityMagnitude > 5) {
                    particle.fixed = false;
                }
            }
        });
    }
    
    // 指の形に合わせた変形効果 - 強化版
    applyFingerShapeEffect(fingerPositions, movementScale = 1.0) {
        if (!fingerPositions) return;
        
        // movementScaleが指定されていない場合はデフォルト値を使用
        movementScale = movementScale || 0.8;
        
        // 手の形状に基づいた変形マップを作成
        const handShape = this.createHandShapeMap(fingerPositions);
        
        // 各指に対して効果を適用
        fingerPositions.forEach(finger => {
            const x = finger.position.x * this.width;
            const y = finger.position.y * this.height;
            const radius = this.width * 0.05; // 指ごとの影響半径を増加
            
            // 指の種類に応じた効果の強さを調整
            let strengthMultiplier = 1.0;
            switch (finger.finger) {
                case 'thumb':
                    strengthMultiplier = 1.5; // 親指は強め
                    break;
                case 'index':
                    strengthMultiplier = 1.3; // 人差し指
                    break;
                case 'middle':
                    strengthMultiplier = 1.2; // 中指
                    break;
                case 'ring':
                    strengthMultiplier = 1.0; // 薬指
                    break;
                case 'pinky':
                    strengthMultiplier = 0.8; // 小指は弱め
                    break;
            }
            
            // 指の位置に応じて粒子を押し出す
            this.particles.forEach(particle => {
                const dx = particle.x - x;
                const dy = particle.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius) {
                    // 相互作用の強さを素材に応じて調整（弱くする）
                    const adjustedStrength = this.materials[this.materialType].interactionStrength * 0.7;
                    const force = (1 - distance / radius) * 0.3 * adjustedStrength * strengthMultiplier * movementScale;
                    const angle = Math.atan2(dy, dx);
                    
                    // 指から粒子を押し出す（力を弱める）
                    particle.vx += Math.cos(angle) * force * 0.7;
                    particle.vy += Math.sin(angle) * force * 0.7;
                    
                    // 粒子を指の動きに追従させる（力を弱める）
                    if (distance < radius * 0.5) {
                        particle.vx += this.handVelocity.x * 0.2;
                        particle.vy += this.handVelocity.y * 0.2;
                    }
                    
                    // 物質の特性に応じた追加効果
                    if (this.materialType === 'clay') {
                        // 粘土は指の形に沿って変形
                        if (distance < radius * 0.4) {
                            // 指に近い粒子は指の動きに追従
                            particle.vx -= dx * force * 0.5;
                            particle.vy -= dy * force * 0.5;
                            // 一部の粒子を固定して形状を保持（確率を下げる）
                            particle.fixed = Math.random() > 0.7;
                        } else {
                            // 少し離れた粒子は緩やかに動く
                            particle.vx -= dx * force * 0.2;
                            particle.vy -= dy * force * 0.2;
                        }
                    } else if (this.materialType === 'slime') {
                        // スライムは指の形に沿って変形
                        if (distance < radius * 0.3) {
                            // スライムが手にくっつく効果を強化
                            particle.fixed = Math.random() > 0.3;
                        } else {
                            // 遠い粒子は緩やかに引っ張られる
                            particle.vx += dx * force * 0.1;
                            particle.vy += dy * force * 0.1;
                        }
                    } else if (this.materialType === 'water') {
                        // 水は指の動きに流れやすく
                        particle.vx += this.handVelocity.x * 0.2;
                        particle.vy += this.handVelocity.y * 0.2;
                    }
                }
            });
        });
        
        // 手の形状全体に対する効果を適用
        this.applyHandShapeEffect(handShape, movementScale);
    }
    
    // 手の形状全体のマップを作成
    createHandShapeMap(fingerPositions) {
        if (!fingerPositions || fingerPositions.length === 0) return null;
        
        // 手のひらの中心を計算
        let centerX = 0;
        let centerY = 0;
        
        fingerPositions.forEach(finger => {
            centerX += finger.position.x;
            centerY += finger.position.y;
        });
        
        centerX = (centerX / fingerPositions.length) * this.width;
        centerY = (centerY / fingerPositions.length) * this.height;
        
        // 指の位置を配列に格納
        const points = fingerPositions.map(finger => ({
            x: finger.position.x * this.width,
            y: finger.position.y * this.height
        }));
        
        // 手のひらの中心を追加
        points.push({ x: centerX, y: centerY });
        
        return {
            center: { x: centerX, y: centerY },
            points: points,
            radius: this.width * 0.15 // 手全体の影響半径
        };
    }
    
    // 手の形状全体に対する効果
    applyHandShapeEffect(handShape, movementScale = 1.0) {
        if (!handShape) return;
        
        const { center, points, radius } = handShape;
        
        // 材質に応じた効果の強さを調整
        const material = this.materials[this.materialType];
        const strength = material.interactionStrength * 1.5 * movementScale;
        
        this.particles.forEach(particle => {
            // 手のひらの中心からの距離
            const dx = particle.x - center.x;
            const dy = particle.y - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                // 最も近い指の位置を見つける
                let minDistance = Infinity;
                let closestPoint = null;
                
                points.forEach(point => {
                    const pointDx = particle.x - point.x;
                    const pointDy = particle.y - point.y;
                    const pointDistance = Math.sqrt(pointDx * pointDx + pointDy * pointDy);
                    
                    if (pointDistance < minDistance) {
                        minDistance = pointDistance;
                        closestPoint = point;
                    }
                });
                
                if (closestPoint) {
                    const pointDx = particle.x - closestPoint.x;
                    const pointDy = particle.y - closestPoint.y;
                    const pointDistance = Math.sqrt(pointDx * pointDx + pointDy * pointDy);
                    
                    // 指に近い粒子ほど強く影響を受ける
                    if (pointDistance < radius * 0.5) {
                        const force = (1 - pointDistance / (radius * 0.5)) * 0.2 * strength;
                        
                        // 材質に応じた効果
                        switch (this.materialType) {
                            case 'sand':
                                // 砂は押し出される
                                particle.vx += pointDx * force * 0.5;
                                particle.vy += pointDy * force * 0.5;
                                break;
                            case 'water':
                                // 水は手の動きに流される
                                particle.vx += this.handVelocity.x * force * 1.5;
                                particle.vy += this.handVelocity.y * force * 1.5;
                                break;
                            case 'clay':
                                // 粘土は手の形に沿う
                                particle.vx -= pointDx * force * 0.8;
                                particle.vy -= pointDy * force * 0.8;
                                if (pointDistance < radius * 0.2) {
                                    particle.fixed = Math.random() > 0.5;
                                }
                                break;
                            case 'slime':
                                // スライムは粘着性がある
                                if (pointDistance < radius * 0.3) {
                                    particle.vx -= pointDx * force * 0.6;
                                    particle.vy -= pointDy * force * 0.6;
                                    // スライムが手にくっつく効果を強化
                                    particle.fixed = Math.random() > 0.3;
                                } else {
                                    // 遠い粒子は緩やかに引っ張られる
                                    particle.vx += pointDx * force * 0.1;
                                    particle.vy += pointDy * force * 0.1;
                                }
                                break;
                            case 'light':
                                // 光の粒子は手の動きで舞い上がる
                                const angle = Math.atan2(pointDy, pointDx) + Math.random() * Math.PI;
                                particle.vx += Math.cos(angle) * force * 2.0;
                                particle.vy += Math.sin(angle) * force * 2.0;
                                break;
                        }
                    }
                }
            }
        });
    }
    
    applyHandVelocityEffect(movementScale = 1.0) {
        if (!this.handVelocity || !this.lastHandPosition) return;
        
        const x = this.lastHandPosition.x * this.width;
        const y = this.lastHandPosition.y * this.height;
        const radius = this.width * 0.15;
        const material = this.materials[this.materialType];
        const velocityFactor = material.interactionStrength * 0.3;
        
        this.particles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                const force = (1 - distance / radius) * velocityFactor * movementScale;
                
                // 手の動きに引きずられる効果
                particle.vx += this.handVelocity.x * force;
                particle.vy += this.handVelocity.y * force;
            }
        });
    }
    
    applyGrabEffect(x, y, radius, movementScale = 1.0) {
        const material = this.materials[this.materialType];
        const strength = material.interactionStrength;
        
        // スライムの場合は特別な処理
        if (this.materialType === 'slime') {
            // スライムを握った時の特殊効果
            this.particles.forEach(particle => {
                const dx = particle.x - x;
                const dy = particle.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius * 1.5) { // より広い範囲に影響
                    // 距離に応じた力の計算
                    let force;
                    
                    if (distance < radius * 0.4) {
                        // 中心に近い粒子は強く引き寄せられる
                        force = (1 - distance / (radius * 0.4)) * 0.3 * strength;
                        particle.vx += -dx * force;
                        particle.vy += -dy * force;
                        
                        // 中心の粒子は高確率で固定（形状保持）
                        if (Math.random() > 0.3) {
                            particle.fixed = true;
                        }
                    } else {
                        // 外側の粒子は中心方向に緩やかに引っ張られる
                        force = (1 - distance / (radius * 1.5)) * 0.1 * strength;
                        particle.vx += -dx * force;
                        particle.vy += -dy * force;
                        
                        // スライムの粘性を表現（近くの粒子同士が引き合う）
                        this.applyLocalCohesion(particle, radius * 0.8);
                    }
                } else {
                    // 範囲外の粒子は固定解除
                    particle.fixed = false;
                }
            });
            return;
        }
        
        // 他の素材の通常の処理
        this.particles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                const force = (1 - distance / radius) * 0.2 * strength * movementScale;
                
                // Pull the particle towards the center of the grab
                particle.vx += -dx * force;
                particle.vy += -dy * force;
                
                // 粘土やスライムの場合は、一部の粒子を固定して形状を保持
                if (this.materialType === 'clay' && distance < radius * 0.3) {
                    particle.fixed = Math.random() > 0.7;
                }
            } else {
                particle.fixed = false;
            }
        });
    }
    
    // スライムの粘性を表現する補助メソッド
    applyLocalCohesion(targetParticle, radius) {
        // 近くの粒子を見つけて引き合う力を適用
        const nearbyParticles = this.particles.filter(p => {
            if (p === targetParticle) return false;
            
            const dx = p.x - targetParticle.x;
            const dy = p.y - targetParticle.y;
            const distSq = dx * dx + dy * dy;
            
            return distSq < radius * radius;
        });
        
        // 近くの粒子がなければ何もしない
        if (nearbyParticles.length === 0) return;
        
        // 近くの粒子との間に粘着力を適用
        nearbyParticles.forEach(p => {
            const dx = p.x - targetParticle.x;
            const dy = p.y - targetParticle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                // 最適な距離（これより近いと反発、遠いと引き合う）
                const optimalDist = (p.size + targetParticle.size) * 1.2;
                const cohesionForce = 0.03 * (dist - optimalDist) / dist;
                
                // 引力を適用
                if (!targetParticle.fixed) {
                    targetParticle.vx += dx * cohesionForce;
                    targetParticle.vy += dy * cohesionForce;
                }
            }
        });
    }
    
    applyPushEffect(x, y, radius, movementScale = 1.0) {
        const material = this.materials[this.materialType];
        const strength = material.interactionStrength;
        
        this.particles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                const force = (1 - distance / radius) * 0.5 * strength * movementScale;
                
                // Push the particle away from the point
                particle.vx += dx * force;
                particle.vy += dy * force;
                
                // 固定解除
                particle.fixed = false;
            }
        });
    }
    
    applySpreadEffect(x, y, radius, movementScale = 1.0) {
        const material = this.materials[this.materialType];
        const spread = material.spread;
        const strength = material.interactionStrength;
        
        // スライムの場合は特別な処理
        if (this.materialType === 'slime') {
            // スライムを広げる特殊効果（粘性を保ちながら広がる）
            // 中心からの距離に基づいて粒子をグループ化
            const particleGroups = {};
            const groupSize = radius / 4;
            
            // 粒子を距離に基づいてグループ化
            this.particles.forEach(particle => {
                const dx = particle.x - x;
                const dy = particle.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius * 1.5) {
                    // 距離に基づいてグループインデックスを計算
                    const groupIndex = Math.floor(distance / groupSize);
                    if (!particleGroups[groupIndex]) {
                        particleGroups[groupIndex] = [];
                    }
                    particleGroups[groupIndex].push(particle);
                    
                    // 固定を解除
                    particle.fixed = false;
                }
            });
            
            // 各グループに対して処理
            Object.keys(particleGroups).forEach(groupIndex => {
                const group = particleGroups[groupIndex];
                const groupDistance = groupIndex * groupSize;
                
                // グループ内の粒子に力を適用
                group.forEach(particle => {
                    const dx = particle.x - x;
                    const dy = particle.y - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0) {
                        // 中心からの方向
                        const dirX = dx / distance;
                        const dirY = dy / distance;
                        
                        // 距離に応じた力の強さ（近いほど弱く、遠いほど強い）
                        const force = (groupDistance / radius) * 0.2 * spread * strength * movementScale;
                        
                        // 外側に向かって広がる力
                        particle.vx += dirX * force;
                        particle.vy += dirY * force;
                        
                        // 同じグループ内の粒子同士の結合力を維持
                        this.applyLocalCohesion(particle, groupSize * 1.5);
                    }
                });
            });
            
            return;
        }
        
        // 他の素材の通常の処理
        this.particles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                const force = (1 - distance / radius) * 0.3 * spread * strength * movementScale;
                const angle = Math.atan2(dy, dx);
                
                // Spread particles outward in a circular pattern
                particle.vx += Math.cos(angle) * force;
                particle.vy += Math.sin(angle) * force;
                
                // 固定解除
                particle.fixed = false;
            }
        });
    }
    
    applyWaveEffect(x, y, radius, movementScale = 1.0) {
        const material = this.materials[this.materialType];
        const time = Date.now() / 200;
        const strength = material.interactionStrength;
        
        this.particles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius) {
                const force = (1 - distance / radius) * 0.2 * strength * movementScale;
                const angle = Math.atan2(dy, dx) + Math.sin(time) * 2;
                
                // Create a wave-like motion
                particle.vx += Math.cos(angle) * force;
                particle.vy += Math.sin(angle) * force;
                
                // 固定解除
                particle.fixed = false;
            }
        });
    }
    
    updateParticles() {
        const material = this.materials[this.materialType];
        
        // 複数の手の効果を適用
        this.applyMultiHandEffects();
        
        this.particles.forEach(particle => {
            // 固定された粒子はスキップ
            if (particle.fixed) return;
            
            // 重力は適用しない（上から見る視点）
            // particle.vy += material.gravity * particle.mass;
            
            // Apply friction
            particle.vx *= material.friction;
            particle.vy *= material.friction;
            
            // Apply randomness
            if (Math.random() < material.randomness) {
                particle.vx += (Math.random() - 0.5) * 0.2;
                particle.vy += (Math.random() - 0.5) * 0.2;
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Boundary conditions
            if (particle.x < 0) {
                particle.x = 0;
                particle.vx *= -0.5;
            } else if (particle.x > this.width) {
                particle.x = this.width;
                particle.vx *= -0.5;
            }
            
            if (particle.y < 0) {
                particle.y = 0;
                particle.vy *= -0.5;
            } else if (particle.y > this.height) {
                particle.y = this.height;
                particle.vy *= -0.5;
            }
        });
        
        // Apply particle interactions based on material properties
        this.applyParticleInteractions();
    }
    
    applyParticleInteractions() {
        const material = this.materials[this.materialType];
        
        // Skip for performance if too many particles
        if (this.particles.length > 1000) {
            this.applyGridBasedInteractions();
            return;
        }
        
        // Direct particle-to-particle interactions (for smaller particle counts)
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];
            
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const distSq = dx * dx + dy * dy;
                
                if (distSq < 100) { // Only interact with close neighbors
                    const dist = Math.sqrt(distSq);
                    const force = 1 / (dist + 0.1);
                    
                    // Repulsion
                    const repulsionForce = material.repulsion * force;
                    if (!p1.fixed) {
                        p1.vx -= dx * repulsionForce;
                        p1.vy -= dy * repulsionForce;
                    }
                    if (!p2.fixed) {
                        p2.vx += dx * repulsionForce;
                        p2.vy += dy * repulsionForce;
                    }
                    
                    // Cohesion for liquids and clay
                    if (this.materialType === 'water' || this.materialType === 'clay' || this.materialType === 'slime') {
                        const optimalDist = (p1.size + p2.size) * 0.75;
                        if (dist > optimalDist) {
                            const cohesionForce = material.cohesion * (dist - optimalDist) / dist;
                            if (!p1.fixed) {
                                p1.vx += dx * cohesionForce;
                                p1.vy += dy * cohesionForce;
                            }
                            if (!p2.fixed) {
                                p2.vx -= dx * cohesionForce;
                                p2.vy -= dy * cohesionForce;
                            }
                        }
                    }
                }
            }
        }
    }
    
    applyGridBasedInteractions() {
        // Simplified grid-based approach for many particles
        // This is a performance optimization
        const gridSize = 20;
        const grid = {};
        
        // Assign particles to grid cells
        this.particles.forEach(particle => {
            const cellX = Math.floor(particle.x / gridSize);
            const cellY = Math.floor(particle.y / gridSize);
            const cellKey = `${cellX},${cellY}`;
            
            if (!grid[cellKey]) grid[cellKey] = [];
            grid[cellKey].push(particle);
        });
        
        // Apply interactions only within each cell and neighboring cells
        const material = this.materials[this.materialType];
        
        Object.keys(grid).forEach(cellKey => {
            const [cellX, cellY] = cellKey.split(',').map(Number);
            
            // Neighboring cells
            for (let nx = cellX - 1; nx <= cellX + 1; nx++) {
                for (let ny = cellY - 1; ny <= cellY + 1; ny++) {
                    const neighborKey = `${nx},${ny}`;
                    
                    if (grid[neighborKey]) {
                        // Apply interactions between cells
                        grid[cellKey].forEach(p1 => {
                            grid[neighborKey].forEach(p2 => {
                                if (p1 !== p2) {
                                    const dx = p2.x - p1.x;
                                    const dy = p2.y - p1.y;
                                    const distSq = dx * dx + dy * dy;
                                    
                                    if (distSq < 100) {
                                        const dist = Math.sqrt(distSq);
                                        const force = 1 / (dist + 0.1);
                                        
                                        // Repulsion
                                        const repulsionForce = material.repulsion * force * 0.5;
                                        if (!p1.fixed) {
                                            p1.vx -= dx * repulsionForce;
                                            p1.vy -= dy * repulsionForce;
                                        }
                                        
                                        // Cohesion
                                        if (this.materialType === 'water' || this.materialType === 'clay' || this.materialType === 'slime') {
                                            const optimalDist = (p1.size + p2.size) * 0.75;
                                            if (dist > optimalDist) {
                                                const cohesionForce = material.cohesion * (dist - optimalDist) / dist * 0.5;
                                                if (!p1.fixed) {
                                                    p1.vx += dx * cohesionForce;
                                                    p1.vy += dy * cohesionForce;
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        });
                    }
                }
            }
        });
    }
    
    render() {
        // Clear the canvas with slight transparency to create trail effect
        this.context.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.context.fillRect(0, 0, this.width, this.height);
        
        // Set global composite operation for better blending
        this.context.globalCompositeOperation = this.materials[this.materialType].blendMode;
        
        // Draw each particle with shadow for depth effect
        this.particles.forEach(particle => {
            // Draw shadow
            this.context.beginPath();
            this.context.arc(particle.x + 2, particle.y + 2, particle.size * 1.2, 0, Math.PI * 2);
            this.context.fillStyle = this.materials[this.materialType].shadowColor;
            this.context.fill();
            
            // Draw particle
            this.context.beginPath();
            this.context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.context.fillStyle = particle.color;
            this.context.fill();
            
            // 固定された粒子は輪郭を表示
            if (particle.fixed) {
                this.context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.context.lineWidth = 1;
                this.context.stroke();
            }
        });
        
        // Reset composite operation
        this.context.globalCompositeOperation = 'source-over';
    }
    
    animate() {
        // Update the canvas size if needed
        if (this.canvas.width !== this.canvas.offsetWidth || 
            this.canvas.height !== this.canvas.offsetHeight) {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }
        
        // Update and render particles
        this.updateParticles();
        this.render();
        
        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }
} 