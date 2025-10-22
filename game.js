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
            gravity: { y: 800 },
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
    egoDissove: { unlocked: false, cooldown: 0, maxCooldown: 10000 },
    mirrorSight: { unlocked: false, cooldown: 0, maxCooldown: 8000 },
    breathOfCalm: { unlocked: false, cooldown: 0, maxCooldown: 12000 },
    fractalLeap: { unlocked: false, cooldown: 0, maxCooldown: 6000 }
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
        space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
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
    
    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
        player.flipX = true;
        player.alpha = Math.min(1, player.alpha + 0.01);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
        player.flipX = false;
        player.alpha = Math.min(1, player.alpha + 0.01);
    } else {
        player.setVelocityX(0);
    }
    
    // Jump
    if ((cursors.up.isDown || keys.space.isDown) && player.body.touching.down) {
        player.setVelocityY(-400);
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
    
    // Check level completion
    checkLevelCompletion(this);
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
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
    player.setDepth(10);
    player.alpha = 0.7 + enlightenmentLevel * 0.003;
    
    // Add glow effect
    player.postFX = scene.add.pointlight(player.x, player.y, 0x00ffff, 50, 0.3);
}

function updatePlayerEnlightenment() {
    if (!player) return;
    
    // Become more luminous with enlightenment
    const enlightenmentFactor = enlightenmentLevel / 100;
    player.alpha = 0.7 + enlightenmentFactor * 0.3;
    player.setTint(Phaser.Display.Color.GetColor(
        255,
        255 - enlightenmentFactor * 100,
        255
    ));
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
    
    positions.forEach(pos => {
        const bloom = collectibles.create(pos[0], pos[1], 'bloom');
        bloom.setBounce(0.5);
        
        // Add glow animation
        scene.tweens.add({
            targets: bloom,
            scale: { from: 1, to: 1.3 },
            alpha: { from: 0.7, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    });
}

function collectMindBloom(player, bloom) {
    bloom.destroy();
    
    enlightenmentLevel += 5;
    fearLevel = Math.max(0, fearLevel - 10);
    
    // Unlock power if this is the level's power
    if (levelData.unlockPower) {
        const powerKey = levelData.unlockPower;
        if (!mindBlooms[powerKey].unlocked) {
            mindBlooms[powerKey].unlocked = true;
            showGuideDialogue(
                `You've unlocked ${powerKey}! Press the key to activate.`,
                levelData.guide.name
            );
        }
    }
    
    // Visual effect
    const emitter = this.add.particles(bloom.x, bloom.y, 'bloom', {
        speed: { min: 100, max: 200 },
        scale: { start: 0.5, end: 0 },
        lifespan: 1000,
        quantity: 20,
        tint: 0xffff00
    });
    emitter.explode();
    
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
    
    // Chase player
    if (distanceToPlayer > 100) {
        const speed = 80;
        if (villain.sprite.x < player.x) {
            villain.sprite.setVelocityX(speed);
        } else {
            villain.sprite.setVelocityX(-speed);
        }
    } else {
        villain.sprite.setVelocityX(0);
    }
    
    // Pulsing effect
    villain.movementPhase += 0.05;
    const scale = 1 + Math.sin(villain.movementPhase) * 0.1;
    villain.sprite.setScale(scale);
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
            
            setTimeout(() => {
                villain.sprite.clearTint();
            }, 5000);
        }
    });
    
    // Visual effect
    const circle = scene.add.circle(player.x, player.y, 200, 0x00ffff, 0.3);
    scene.tweens.add({
        targets: circle,
        scale: 2,
        alpha: 0,
        duration: 1000,
        onComplete: () => circle.destroy()
    });
}

function activateMirrorSight(scene) {
    // Reveal hidden elements and damage villains
    villains.forEach(villain => {
        if (!villain.defeated) {
            villain.health -= 30;
            villain.sprite.setTint(0xff00ff);
            
            if (villain.health <= 0) {
                villain.defeated = true;
                villain.sprite.setVelocity(0, 0);
                villain.sprite.setTint(0x888888);
                showGuideDialogue("Press E to integrate this shadow.", "Guide");
            }
            
            setTimeout(() => {
                if (villain.health > 0) {
                    villain.sprite.clearTint();
                }
            }, 2000);
        }
    });
    
    // Flash effect
    scene.cameras.main.flash(500, 255, 0, 255);
}

function activateBreathOfCalm(scene) {
    // Slow down time
    scene.physics.world.timeScale = 0.5;
    scene.time.timeScale = 0.5;
    
    fearLevel = Math.max(0, fearLevel - 20);
    
    scene.cameras.main.setTint(0x00ffff);
    
    setTimeout(() => {
        scene.physics.world.timeScale = 1;
        scene.time.timeScale = 1;
        scene.cameras.main.clearTintEffect();
    }, 5000);
    
    updateHUD();
}

function activateFractalLeap(scene) {
    // Teleport through obstacles
    const targetX = player.flipX ? player.x - 300 : player.x + 300;
    const targetY = player.y;
    
    // Trail effect
    const trail = scene.add.particles(player.x, player.y, 'player', {
        speed: 0,
        scale: { start: 1, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 500,
        quantity: 10
    });
    trail.explode();
    
    player.setPosition(
        Phaser.Math.Clamp(targetX, 50, 1150),
        targetY
    );
    
    scene.cameras.main.flash(200, 255, 255, 0);
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

