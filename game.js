// Game Configuration
const gameConfig = {
    type: Phaser.AUTO,
    width: 1200,
    height: 700,
    parent: 'game-canvas-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 700 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Game State
let game;
let player;
let cursors;
let keys;
let currentLevel = 0;
let fearLevel = 50;
let enlightenmentLevel = 0;
let mindBlooms = {
    egoDissove: { unlocked: true, cooldown: 0, maxCooldown: 10000 },
    mirrorSight: { unlocked: true, cooldown: 0, maxCooldown: 8000 },
    breathOfCalm: { unlocked: true, cooldown: 0, maxCooldown: 12000 },
    fractalLeap: { unlocked: true, cooldown: 0, maxCooldown: 6000 }
};
let villains = [];
let heroGuides = [];
let platforms;
let collectibles;
let particles;
let backgroundEffects = [];
let levelData;
let dialogueActive = false;
let integratedVillains = [];

// Level Definitions
const LEVELS = [
    {
        name: "The Hall of Mirrors",
        fear: "Fear of Rejection",
        villain: {
            name: "The Siren of Validation",
            type: "siren",
            color: 0xff1493,
            dialogue: "You seek my approval... but why? Without me, you are nothing.",
            defeatDialogue: "I am... your need to be seen. Integrate me."
        },
        guide: {
            name: "The Fool",
            archetype: "playfulness",
            color: 0xffff00,
            intro: "Why take it so seriously? Dance with rejection, my friend!",
            wisdom: "The Fool sees no failure, only lessons wrapped in laughter."
        },
        bg: { colors: [0xff1493, 0x9400d3, 0x000000], speed: 0.5 },
        unlockPower: 'egoDissove'
    },
    {
        name: "The Tower of Perfection",
        fear: "Fear of Failure",
        villain: {
            name: "The Overlord of Perfection",
            type: "overlord",
            color: 0xff0000,
            dialogue: "You will never be good enough. Every flaw proves your worthlessness.",
            defeatDialogue: "I pushed you... but I am the voice of your ambition gone toxic."
        },
        guide: {
            name: "The Warrior",
            archetype: "willpower",
            color: 0xff4500,
            intro: "Failure is the forge. Each fall makes you stronger.",
            wisdom: "The Warrior knows: perfection is the enemy of progress."
        },
        bg: { colors: [0xff0000, 0x8b0000, 0x000000], speed: 0.3 },
        unlockPower: 'breathOfCalm'
    },
    {
        name: "The Narcissist's Kingdom",
        fear: "Fear of Not Being Seen",
        villain: {
            name: "The Narcissist King",
            type: "narcissist",
            color: 0xffd700,
            dialogue: "Bow before me! I am everything you wish you could be!",
            defeatDialogue: "I... am your hunger for significance. Do you see me now?"
        },
        guide: {
            name: "The Sage",
            archetype: "clarity",
            color: 0x00ced1,
            intro: "To be unseen is to be free. The universe sees all.",
            wisdom: "The Sage whispers: You are not your audience."
        },
        bg: { colors: [0xffd700, 0xdaa520, 0x000000], speed: 0.4 },
        unlockPower: 'mirrorSight'
    },
    {
        name: "The Labyrinth of Isolation",
        fear: "Fear of Loneliness",
        villain: {
            name: "The Shadow of Solitude",
            type: "shadow",
            color: 0x4b0082,
            dialogue: "No one understands you. No one ever will. You are alone.",
            defeatDialogue: "I kept you safe... but also imprisoned. Integrate me gently."
        },
        guide: {
            name: "The Lover",
            archetype: "compassion",
            color: 0xff69b4,
            intro: "You are never alone when you love yourself first.",
            wisdom: "The Lover knows: Solitude is where you meet your true self."
        },
        bg: { colors: [0x4b0082, 0x2f1b4e, 0x000000], speed: 0.6 },
        unlockPower: 'fractalLeap'
    },
    {
        name: "The Abyss of the Void",
        fear: "Fear of Death / Nothingness",
        villain: {
            name: "The Void Beast",
            type: "void",
            color: 0x000000,
            dialogue: "All ends in nothing. Your light will fade. Embrace the darkness.",
            defeatDialogue: "I am the ultimate truth... and the ultimate liberation."
        },
        guide: {
            name: "All Guides United",
            archetype: "integration",
            color: 0xffffff,
            intro: "Death is not the end, but a transformation. We are with you.",
            wisdom: "In the void, you find everything."
        },
        bg: { colors: [0x0a0a0a, 0x1a0033, 0x000000], speed: 0.2 },
        unlockPower: null
    },
    {
        name: "The Garden of Ego Death",
        fear: "No Fear - Only Reflections",
        villain: null,
        guide: {
            name: "Your True Self",
            archetype: "unity",
            color: 0xffffff,
            intro: "There is no one to fight. Only yourself to embrace.",
            wisdom: "You are the journey. You are the destination."
        },
        bg: { colors: [0xffffff, 0x00ffff, 0xff00ff], speed: 1.0 },
        unlockPower: null,
        final: true
    }
];

// Initialize Game
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('title-screen').classList.remove('active');
    document.getElementById('hud').classList.remove('hidden');
    game = new Phaser.Game(gameConfig);
});

// Phaser Functions
function preload() {
    // Create placeholder graphics programmatically since we don't have image assets
    createPlaceholderAssets(this);
}

function create() {
    // Set up level
    levelData = LEVELS[currentLevel];
    
    // Background effects
    createPsychedelicBackground(this);
    
    // Create platforms
    platforms = this.physics.add.staticGroup();
    createPlatforms(this);
    
    // Create player
    createPlayer(this);
    
    // Create collectibles (Mind Blooms)
    collectibles = this.physics.add.group();
    createCollectibles(this);
    
    // Create villain if exists
    if (levelData.villain) {
        createVillain(this);
    }
    
    // Show guide introduction
    setTimeout(() => showGuideDialogue(levelData.guide.intro, levelData.guide.name), 1000);
    
    // Input
    cursors = this.input.keyboard.createCursorKeys();
    keys = {
        one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
        two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
        three: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
        four: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
        e: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    
    // Collisions
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(collectibles, platforms);
    this.physics.add.overlap(player, collectibles, collectMindBloom, null, this);
    
    if (levelData.villain) {
        villains.forEach(villain => {
            this.physics.add.collider(villain.sprite, platforms);
            this.physics.add.overlap(player, villain.sprite, handleVillainCollision, null, this);
        });
    }
    
    // Particle systems for effects
    particles = this.add.particles(0, 0);
    
    updateHUD();
}

function update(time, delta) {
    if (!player) return;
    
    // Smooth player movement with acceleration (Arrow Keys OR WASD)
    const acceleration = 15;
    const maxSpeed = 250;
    const friction = 0.85;
    
    if (cursors.left.isDown || keys.a.isDown) {
        player.setVelocityX(Math.max(player.body.velocity.x - acceleration, -maxSpeed));
        player.flipX = true;
        player.alpha = Math.min(1, player.alpha + 0.01);
        createMovementTrail(this, player);
    } else if (cursors.right.isDown || keys.d.isDown) {
        player.setVelocityX(Math.min(player.body.velocity.x + acceleration, maxSpeed));
        player.flipX = false;
        player.alpha = Math.min(1, player.alpha + 0.01);
        createMovementTrail(this, player);
    } else {
        // Smooth deceleration
        player.setVelocityX(player.body.velocity.x * friction);
    }
    
    // Jump with enhanced effect (Arrow Up OR W OR Space)
    if ((cursors.up.isDown || keys.w.isDown || keys.space.isDown) && player.body.touching.down) {
        player.setVelocityY(-550);
        createJumpEffect(this, player);
    }
    
    // Floating/drifting effect when in air
    if (!player.body.touching.down) {
        player.angle = Math.sin(time * 0.003) * 5; // Gentle rotation in air
    } else {
        player.angle = 0;
    }
    
    // Update player appearance based on enlightenment
    updatePlayerEnlightenment();
    
    // Power usage
    if (Phaser.Input.Keyboard.JustDown(keys.one)) usePower('egoDissove', this);
    if (Phaser.Input.Keyboard.JustDown(keys.two)) usePower('mirrorSight', this);
    if (Phaser.Input.Keyboard.JustDown(keys.three)) usePower('breathOfCalm', this);
    if (Phaser.Input.Keyboard.JustDown(keys.four)) usePower('fractalLeap', this);
    
    // Integration key
    if (Phaser.Input.Keyboard.JustDown(keys.e)) {
        checkVillainIntegration(this);
    }
    
    // Update villains
    villains.forEach(villain => {
        updateVillain(villain, time, this);
    });
    
    // Update cooldowns
    updateCooldowns(delta);
    
    // Update background effects
    updateBackgroundEffects(time);
    
    // Add screen distortion based on enlightenment
    applyPsychedelicEffects(this, time);
    
    // Check level completion
    checkLevelCompletion(this);
}

// Helper Functions for Smooth Effects
function createMovementTrail(scene, sprite) {
    // Create afterimage trail
    if (Math.random() < 0.3) {
        const trail = scene.add.sprite(sprite.x, sprite.y, 'player');
        trail.setTint(Phaser.Display.Color.GetColor(
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255
        ));
        trail.setAlpha(0.3);
        trail.setDepth(sprite.depth - 1);
        trail.flipX = sprite.flipX;
        
        scene.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 0.5,
            duration: 500,
            ease: 'Power2',
            onComplete: () => trail.destroy()
        });
    }
}

function createJumpEffect(scene, sprite) {
    // Particle burst on jump
    const jumpEmitter = scene.add.particles(sprite.x, sprite.y + 16, 'bloom', {
        speed: { min: 50, max: 150 },
        angle: { min: 60, max: 120 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 600,
        quantity: 15,
        tint: [0x00ffff, 0xff00ff],
        blendMode: 'ADD'
    });
    jumpEmitter.explode();
    
    // Screen shake
    scene.cameras.main.shake(100, 0.003);
}

function applyPsychedelicEffects(scene, time) {
    // Camera effects based on enlightenment
    const enlightenmentFactor = enlightenmentLevel / 100;
    
    // Subtle zoom pulsing
    const zoomPulse = 1 + Math.sin(time * 0.001) * 0.02 * enlightenmentFactor;
    scene.cameras.main.setZoom(zoomPulse);
    
    // Color shift
    if (enlightenmentFactor > 0.5) {
        const hue = (time * 0.05) % 360;
        const colorValue = Math.sin(time * 0.001) * 30;
        scene.cameras.main.setTint(
            Phaser.Display.Color.GetColor(
                255,
                255 - colorValue,
                255 - colorValue
            )
        );
    }
}

// Asset Creation
function createPlaceholderAssets(scene) {
    // Player
    const playerGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ffff, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // Platform
    const platformGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0xff00ff, 0.6);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.lineStyle(2, 0xffffff, 1);
    platformGraphics.strokeRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();
    
    // Mind Bloom
    const bloomGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
    bloomGraphics.fillStyle(0xffff00, 1);
    bloomGraphics.fillCircle(12, 12, 12);
    bloomGraphics.fillStyle(0xff00ff, 0.5);
    bloomGraphics.fillCircle(12, 12, 8);
    bloomGraphics.generateTexture('bloom', 24, 24);
    bloomGraphics.destroy();
}

// Background
function createPsychedelicBackground(scene) {
    const { colors } = levelData.bg;
    
    // Create gradient layers
    for (let i = 0; i < 5; i++) {
        const layer = scene.add.rectangle(
            600, 350, 1200, 700, 
            colors[i % colors.length], 
            0.2 - i * 0.03
        );
        layer.setDepth(-10 + i);
        backgroundEffects.push({ 
            obj: layer, 
            speed: levelData.bg.speed * (1 + i * 0.2),
            phase: i * Math.PI / 3
        });
    }
    
    // Add psychedelic particles
    const emitter = scene.add.particles(0, 0, 'bloom', {
        x: { min: 0, max: 1200 },
        y: { min: -50, max: 0 },
        lifespan: 8000,
        speedY: { min: 20, max: 60 },
        scale: { start: 0.1, end: 0 },
        alpha: { start: 0.4, end: 0 },
        tint: colors,
        frequency: 500
    });
    emitter.setDepth(-5);
}

function updateBackgroundEffects(time) {
    backgroundEffects.forEach(effect => {
        const pulse = Math.sin(time * 0.001 * effect.speed + effect.phase) * 0.1 + 0.9;
        effect.obj.setScale(pulse);
        effect.obj.alpha = 0.2 + Math.sin(time * 0.0005 * effect.speed) * 0.1;
    });
}

// Player
function createPlayer(scene) {
    player = scene.physics.add.sprite(100, 300, 'player');
    player.setBounce(0.15);
    player.setCollideWorldBounds(true);
    player.setDepth(10);
    player.alpha = 0.7 + enlightenmentLevel * 0.003;
    player.setDrag(100, 0); // Add drag for smoother feel
    
    // Add pulsing glow effect
    scene.tweens.add({
        targets: player,
        scaleX: { from: 1, to: 1.1 },
        scaleY: { from: 1, to: 1.1 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    // Continuous particle trail
    const trailEmitter = scene.add.particles(player.x, player.y, 'player', {
        speed: 50,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 800,
        frequency: 50,
        blendMode: 'ADD',
        tint: [0x00ffff, 0xff00ff, 0xffff00],
        follow: player
    });
    trailEmitter.setDepth(9);
}

function updatePlayerEnlightenment() {
    if (!player) return;
    
    // Become more luminous with enlightenment
    const enlightenmentFactor = enlightenmentLevel / 100;
    player.alpha = 0.7 + enlightenmentFactor * 0.3;
    
    // Rainbow color cycling with enlightenment
    const hue = (Date.now() * 0.1 * (1 + enlightenmentFactor)) % 360;
    const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.5, 1);
    player.setTint(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
}

// Platforms
function createPlatforms(scene) {
    // Ground
    for (let i = 0; i < 10; i++) {
        platforms.create(i * 120 + 100, 680, 'platform');
    }
    
    // Floating platforms
    const platformPositions = [
        [300, 550], [500, 450], [700, 350],
        [200, 400], [900, 500], [1000, 300]
    ];
    
    platformPositions.forEach(pos => {
        platforms.create(pos[0], pos[1], 'platform');
    });
}

// Collectibles
function createCollectibles(scene) {
    const positions = [
        [300, 500], [500, 400], [700, 300], [900, 450], [400, 250]
    ];
    
    positions.forEach((pos, index) => {
        const bloom = collectibles.create(pos[0], pos[1], 'bloom');
        bloom.setBounce(0.5);
        
        // Add complex animation
        scene.tweens.add({
            targets: bloom,
            scale: { from: 1, to: 1.5 },
            alpha: { from: 0.7, to: 1 },
            angle: 360,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: index * 200
        });
        
        // Floating motion
        scene.tweens.add({
            targets: bloom,
            y: bloom.y - 20,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: index * 300
        });
        
        // Particle aura
        const bloomEmitter = scene.add.particles(bloom.x, bloom.y, 'bloom', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 1500,
            frequency: 100,
            blendMode: 'ADD',
            tint: [0xffff00, 0xff00ff, 0x00ffff],
            follow: bloom
        });
        bloomEmitter.setDepth(8);
    });
}

function collectMindBloom(player, bloom) {
    const bloomX = bloom.x;
    const bloomY = bloom.y;
    bloom.destroy();
    
    enlightenmentLevel += 5;
    fearLevel = Math.max(0, fearLevel - 10);
    
    // All powers unlocked from start, just show collection message
    showGuideDialogue(
        `Mind Bloom collected! +5 Enlightenment`,
        levelData.guide.name
    );
    
    // Enhanced visual effect
    const emitter = this.add.particles(bloomX, bloomY, 'bloom', {
        speed: { min: 100, max: 300 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 2000,
        quantity: 40,
        tint: [0xffff00, 0xff00ff, 0x00ffff],
        blendMode: 'ADD'
    });
    emitter.explode();
    
    // Screen flash
    this.cameras.main.flash(300, 255, 255, 0, true);
    
    // Ripple effect
    const ripple = this.add.circle(bloomX, bloomY, 10, 0xffff00, 0.5);
    this.tweens.add({
        targets: ripple,
        radius: 200,
        alpha: 0,
        duration: 800,
        ease: 'Cubic.easeOut',
        onComplete: () => ripple.destroy()
    });
    
    updateHUD();
}

// Villains
function createVillain(scene) {
    const villainData = levelData.villain;
    
    // Create villain sprite
    const villainGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
    villainGraphics.fillStyle(villainData.color, 1);
    villainGraphics.fillRect(0, 0, 50, 70);
    villainGraphics.lineStyle(3, 0xffffff, 1);
    villainGraphics.strokeRect(0, 0, 50, 70);
    villainGraphics.generateTexture('villain_' + currentLevel, 50, 70);
    villainGraphics.destroy();
    
    const sprite = scene.physics.add.sprite(900, 300, 'villain_' + currentLevel);
    sprite.setBounce(0.1);
    sprite.setCollideWorldBounds(true);
    sprite.setDepth(10);
    
    const villain = {
        sprite: sprite,
        data: villainData,
        health: 100,
        defeated: false,
        integrated: false,
        attackCooldown: 0,
        movementPhase: 0
    };
    
    villains.push(villain);
    
    // Show villain dialogue
    setTimeout(() => showGuideDialogue(villainData.dialogue, villainData.name, 0xff0000), 3000);
}

function updateVillain(villain, time, scene) {
    if (villain.defeated || !villain.sprite.active) return;
    
    // AI Movement pattern based on villain type
    const distanceToPlayer = Phaser.Math.Distance.Between(
        villain.sprite.x, villain.sprite.y,
        player.x, player.y
    );
    
    // Chase player with smoother movement
    if (distanceToPlayer > 100) {
        const speed = 80;
        const targetVelocity = villain.sprite.x < player.x ? speed : -speed;
        villain.sprite.setVelocityX(
            villain.sprite.body.velocity.x * 0.9 + targetVelocity * 0.1
        );
    } else {
        villain.sprite.setVelocityX(villain.sprite.body.velocity.x * 0.9);
    }
    
    // Enhanced pulsing and floating effect
    villain.movementPhase += 0.05;
    const scale = 1 + Math.sin(villain.movementPhase) * 0.15;
    villain.sprite.setScale(scale);
    villain.sprite.angle = Math.sin(villain.movementPhase * 0.5) * 10;
    
    // Color cycling
    const hue = (time * 0.05 + villain.movementPhase * 10) % 360;
    const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 1);
    villain.sprite.setTint(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
    
    // Ominous particle trail
    if (Math.random() < 0.1) {
        const particle = scene.add.circle(
            villain.sprite.x + Phaser.Math.Between(-20, 20),
            villain.sprite.y + Phaser.Math.Between(-30, 30),
            Phaser.Math.Between(3, 8),
            villain.data.color,
            0.6
        );
        particle.setDepth(5);
        scene.tweens.add({
            targets: particle,
            alpha: 0,
            scale: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }
}

function handleVillainCollision(player, villainSprite) {
    const villain = villains.find(v => v.sprite === villainSprite);
    if (!villain || villain.defeated) return;
    
    // Player takes damage (increases fear)
    fearLevel = Math.min(100, fearLevel + 2);
    
    // Push player back
    const pushDirection = player.x < villainSprite.x ? -1 : 1;
    player.setVelocityX(pushDirection * 300);
    player.setVelocityY(-200);
    
    updateHUD();
    
    // Check game over
    if (fearLevel >= 100) {
        gameOver();
    }
}

function checkVillainIntegration(scene) {
    villains.forEach(villain => {
        if (!villain.defeated || villain.integrated) return;
        
        const distance = Phaser.Math.Distance.Between(
            villain.sprite.x, villain.sprite.y,
            player.x, player.y
        );
        
        if (distance < 100) {
            integrateVillain(villain, scene);
        }
    });
}

function integrateVillain(villain, scene) {
    villain.integrated = true;
    integratedVillains.push(villain.data.name);
    
    enlightenmentLevel += 20;
    fearLevel = Math.max(0, fearLevel - 30);
    
    showGuideDialogue(villain.data.defeatDialogue, villain.data.name, 0x00ff00);
    
    // Transform villain sprite
    scene.tweens.add({
        targets: villain.sprite,
        alpha: 0,
        scale: 2,
        duration: 2000,
        onComplete: () => {
            villain.sprite.destroy();
            showGuideDialogue(levelData.guide.wisdom, levelData.guide.name);
        }
    });
    
    updateHUD();
}

// Powers
function usePower(powerKey, scene) {
    const power = mindBlooms[powerKey];
    
    if (!power.unlocked || power.cooldown > 0) {
        return;
    }
    
    power.cooldown = power.maxCooldown;
    
    switch(powerKey) {
        case 'egoDissove':
            activateEgoDissolve(scene);
            break;
        case 'mirrorSight':
            activateMirrorSight(scene);
            break;
        case 'breathOfCalm':
            activateBreathOfCalm(scene);
            break;
        case 'fractalLeap':
            activateFractalLeap(scene);
            break;
    }
    
    updateHUD();
}

function activateEgoDissolve(scene) {
    // Freeze enemies temporarily
    villains.forEach(villain => {
        if (!villain.defeated) {
            villain.sprite.setTint(0x00ffff);
            villain.sprite.setVelocity(0, 0);
            
            // Freeze particles around villain
            const freezeEmitter = scene.add.particles(villain.sprite.x, villain.sprite.y, 'bloom', {
                speed: { min: 20, max: 50 },
                scale: { start: 0.3, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: 2000,
                frequency: 50,
                tint: [0x00ffff, 0xffffff],
                blendMode: 'ADD',
                follow: villain.sprite
            });
            
            setTimeout(() => {
                villain.sprite.clearTint();
                freezeEmitter.destroy();
            }, 5000);
        }
    });
    
    // Enhanced visual effect - multiple expanding circles
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const circle = scene.add.circle(player.x, player.y, 50, 0x00ffff, 0.4 - i * 0.1);
            scene.tweens.add({
                targets: circle,
                radius: 300,
                alpha: 0,
                duration: 1500,
                ease: 'Cubic.easeOut',
                onComplete: () => circle.destroy()
            });
        }, i * 200);
    }
    
    // Screen frost effect
    scene.cameras.main.flash(500, 0, 255, 255, true);
    
    // Spiral particles
    const spiralEmitter = scene.add.particles(player.x, player.y, 'bloom', {
        speed: { min: 100, max: 200 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 2000,
        quantity: 30,
        tint: [0x00ffff, 0xffffff, 0x00ccff],
        blendMode: 'ADD',
        emitting: false
    });
    spiralEmitter.explode();
}

function activateMirrorSight(scene) {
    // Reveal hidden elements and damage villains
    villains.forEach(villain => {
        if (!villain.defeated) {
            villain.health -= 30;
            villain.sprite.setTint(0xff00ff);
            
            // Damage explosion effect
            const damageEmitter = scene.add.particles(villain.sprite.x, villain.sprite.y, 'bloom', {
                speed: { min: 150, max: 300 },
                scale: { start: 0.8, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: 1000,
                quantity: 25,
                tint: [0xff00ff, 0xff0088, 0xff00ff],
                blendMode: 'ADD'
            });
            damageEmitter.explode();
            
            if (villain.health <= 0) {
                villain.defeated = true;
                villain.sprite.setVelocity(0, 0);
                villain.sprite.setTint(0x888888);
                
                // Victory particle burst
                const victoryEmitter = scene.add.particles(villain.sprite.x, villain.sprite.y, 'bloom', {
                    speed: { min: 50, max: 150 },
                    scale: { start: 1, end: 0 },
                    alpha: { start: 1, end: 0 },
                    lifespan: 2000,
                    quantity: 50,
                    tint: [0xffffff, 0x00ffff, 0xff00ff],
                    blendMode: 'ADD'
                });
                victoryEmitter.explode();
                
                showGuideDialogue("Press E to integrate this shadow.", "Guide");
            }
            
            setTimeout(() => {
                if (villain.health > 0) {
                    villain.sprite.clearTint();
                }
            }, 2000);
        }
    });
    
    // Enhanced flash effect with multiple colors
    scene.cameras.main.flash(300, 255, 0, 255);
    
    // Mirror shatter effect
    for (let i = 0; i < 20; i++) {
        const shard = scene.add.rectangle(
            player.x + Phaser.Math.Between(-50, 50),
            player.y + Phaser.Math.Between(-50, 50),
            Phaser.Math.Between(5, 15),
            Phaser.Math.Between(5, 15),
            0xff00ff,
            0.8
        );
        shard.setDepth(20);
        
        scene.tweens.add({
            targets: shard,
            x: shard.x + Phaser.Math.Between(-200, 200),
            y: shard.y + Phaser.Math.Between(-200, 200),
            angle: Phaser.Math.Between(0, 360),
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => shard.destroy()
        });
    }
}

function activateBreathOfCalm(scene) {
    // Slow down time
    scene.physics.world.timeScale = 0.5;
    scene.time.timeScale = 0.5;
    
    fearLevel = Math.max(0, fearLevel - 20);
    
    // Breathing effect - expanding and contracting circle
    const breathCircle = scene.add.circle(player.x, player.y, 50, 0x00ffff, 0.2);
    breathCircle.setDepth(15);
    
    scene.tweens.add({
        targets: breathCircle,
        radius: 400,
        alpha: 0,
        duration: 2000,
        repeat: 2,
        ease: 'Sine.easeInOut'
    });
    
    // Calm particles floating upward
    const calmEmitter = scene.add.particles(player.x, player.y, 'bloom', {
        speed: { min: 10, max: 30 },
        angle: { min: -100, max: -80 },
        scale: { start: 0.3, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 3000,
        frequency: 100,
        tint: [0x00ffff, 0xaaffff, 0xffffff],
        blendMode: 'ADD',
        gravityY: -50
    });
    
    // Tint with fade in/out
    scene.tweens.add({
        targets: scene.cameras.main,
        scrollX: scene.cameras.main.scrollX,
        duration: 500,
        onStart: () => scene.cameras.main.setTint(0xaaffff),
        yoyo: false
    });
    
    setTimeout(() => {
        scene.physics.world.timeScale = 1;
        scene.time.timeScale = 1;
        scene.cameras.main.clearTintEffect();
        calmEmitter.destroy();
        breathCircle.destroy();
    }, 5000);
    
    updateHUD();
}

function activateFractalLeap(scene) {
    // Store original position
    const startX = player.x;
    const startY = player.y;
    
    // Calculate target position
    const targetX = player.flipX ? player.x - 300 : player.x + 300;
    const targetY = player.y;
    const clampedX = Phaser.Math.Clamp(targetX, 50, 1150);
    
    // Create portal at start
    const portalStart = scene.add.circle(startX, startY, 20, 0xff00ff, 0.8);
    portalStart.setDepth(15);
    scene.tweens.add({
        targets: portalStart,
        radius: 80,
        alpha: 0,
        duration: 500,
        ease: 'Cubic.easeOut',
        onComplete: () => portalStart.destroy()
    });
    
    // Fractal trail between points
    const steps = 10;
    for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const x = startX + (clampedX - startX) * t;
        const y = startY + Math.sin(t * Math.PI * 2) * 30;
        
        setTimeout(() => {
            const fractal = scene.add.circle(x, y, 15, 0xff00ff, 0.6);
            fractal.setDepth(15);
            scene.tweens.add({
                targets: fractal,
                radius: 40,
                alpha: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => fractal.destroy()
            });
        }, i * 30);
    }
    
    // Particle trail
    const trail = scene.add.particles(startX, startY, 'bloom', {
        x: { start: startX, end: clampedX },
        y: { start: startY, end: targetY },
        speed: 0,
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 800,
        quantity: 50,
        tint: [0xff00ff, 0x00ffff, 0xffff00],
        blendMode: 'ADD'
    });
    trail.explode();
    
    // Create portal at destination
    const portalEnd = scene.add.circle(clampedX, targetY, 80, 0x00ffff, 0);
    portalEnd.setDepth(15);
    scene.tweens.add({
        targets: portalEnd,
        radius: 20,
        alpha: 0.8,
        duration: 300,
        ease: 'Cubic.easeIn',
        onComplete: () => {
            scene.tweens.add({
                targets: portalEnd,
                radius: 80,
                alpha: 0,
                duration: 500,
                onComplete: () => portalEnd.destroy()
            });
        }
    });
    
    // Teleport player
    player.setPosition(clampedX, targetY);
    
    // Screen effects
    scene.cameras.main.flash(200, 255, 0, 255);
    scene.cameras.main.shake(150, 0.005);
}

function updateCooldowns(delta) {
    Object.keys(mindBlooms).forEach(key => {
        const power = mindBlooms[key];
        if (power.cooldown > 0) {
            power.cooldown = Math.max(0, power.cooldown - delta);
        }
    });
    
    updatePowerCooldownUI();
}

// Level Management
function checkLevelCompletion(scene) {
    // Check if all villains are integrated
    const allIntegrated = villains.every(v => v.integrated || !v.data);
    const minEnlightenment = enlightenmentLevel >= 50;
    
    if (allIntegrated && minEnlightenment && !dialogueActive) {
        setTimeout(() => {
            advanceLevel(scene);
        }, 2000);
    }
}

function advanceLevel(scene) {
    currentLevel++;
    
    if (currentLevel >= LEVELS.length) {
        victoryScreen();
        return;
    }
    
    // Reset level
    villains = [];
    backgroundEffects = [];
    
    scene.scene.restart();
}

function gameOver() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    overlay.innerHTML = `
        <h1 style="color: #ff0066; font-size: 3rem; text-shadow: 0 0 20px #ff0066;">
            Fear Consumed You
        </h1>
        <p style="color: #fff; font-size: 1.2rem; margin-top: 2rem;">
            The shadows were too strong this time.
        </p>
        <button onclick="location.reload()" style="
            margin-top: 3rem;
            padding: 1rem 2rem;
            font-size: 1.2rem;
            background: transparent;
            color: #00ffff;
            border: 2px solid #00ffff;
            cursor: pointer;
            text-shadow: 0 0 10px #00ffff;
            box-shadow: 0 0 20px #00ffff;
        ">Try Again</button>
    `;
    document.body.appendChild(overlay);
}

function victoryScreen() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(ellipse at center, #ffffff 0%, #000000 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 2s;
    `;
    overlay.innerHTML = `
        <h1 style="color: #fff; font-size: 4rem; text-shadow: 0 0 30px #00ffff;">
            Ego Death Achieved
        </h1>
        <p style="color: #00ffff; font-size: 1.5rem; margin-top: 2rem; text-align: center; max-width: 600px;">
            You have integrated all your shadows.<br>
            There is no separation between self and other.<br>
            You are the infinite observer.
        </p>
        <p style="color: #ff00ff; font-size: 1.2rem; margin-top: 2rem;">
            Enlightenment: ${enlightenmentLevel}%
        </p>
        <p style="color: #fff; font-size: 1rem; margin-top: 1rem; font-style: italic;">
            "Descend into your fears. Rise through your mind."
        </p>
    `;
    document.body.appendChild(overlay);
}

// HUD Updates
function updateHUD() {
    document.getElementById('fear-bar').style.width = fearLevel + '%';
    document.getElementById('enlightenment-bar').style.width = enlightenmentLevel + '%';
    
    // Update power slots
    Object.keys(mindBlooms).forEach((key, index) => {
        const power = mindBlooms[key];
        const slot = document.getElementById(`power-${index + 1}`);
        
        if (power.unlocked) {
            slot.classList.remove('locked');
            if (power.cooldown === 0) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        } else {
            slot.classList.add('locked');
        }
    });
}

function updatePowerCooldownUI() {
    Object.keys(mindBlooms).forEach((key, index) => {
        const power = mindBlooms[key];
        const slot = document.getElementById(`power-${index + 1}`);
        const cooldownBar = slot.querySelector('.power-cooldown');
        
        if (power.cooldown > 0) {
            const percentage = (power.cooldown / power.maxCooldown) * 100;
            cooldownBar.style.height = percentage + '%';
        } else {
            cooldownBar.style.height = '0%';
        }
    });
}

function showGuideDialogue(text, name, color = null) {
    dialogueActive = true;
    const dialogueBox = document.getElementById('dialogue-box');
    const guideName = dialogueBox.querySelector('.guide-name');
    const dialogueText = dialogueBox.querySelector('.dialogue-text');
    
    guideName.textContent = name;
    dialogueText.textContent = text;
    
    if (color) {
        guideName.style.color = '#' + color.toString(16).padStart(6, '0');
    }
    
    dialogueBox.classList.remove('hidden');
    
    setTimeout(() => {
        dialogueBox.classList.add('hidden');
        dialogueActive = false;
    }, 5000);
}

