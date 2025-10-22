# 🛠️ Developer Guide

A technical guide for understanding and modifying **Shroom Odyssey**.

---

## Project Structure

```
/shrooms/
├── index.html              # Main HTML structure
├── styles.css              # Base styling and layout
├── enhanced-effects.css    # Psychedelic visual effects
├── game.js                 # Core game engine (Phaser 3)
├── package.json           # Project metadata
├── README.md              # User-facing documentation
├── QUICKSTART.md          # Quick start guide
├── DESIGN_PHILOSOPHY.md   # Design thinking & psychology
├── CREDITS.md             # Acknowledgments
└── DEVELOPER_GUIDE.md     # This file
```

---

## Technology Stack

### Core
- **Phaser 3.60.0** - Game framework (loaded via CDN)
- **HTML5 Canvas** - Rendering target
- **Vanilla JavaScript ES6+** - Game logic
- **CSS3** - UI and effects

### No Build Process Required
This is a pure client-side application. No webpack, no npm dependencies. Just open and play.

---

## Code Architecture

### Main Game Loop (`game.js`)

```javascript
// Phaser lifecycle
preload()  → create()  → update(time, delta)
    ↓           ↓              ↓
  Assets    Setup Scene    Game Loop
```

### Key Systems

#### 1. Game State Management
```javascript
// Global state
let currentLevel = 0;
let fearLevel = 50;
let enlightenmentLevel = 0;
let mindBlooms = { /* power data */ };
let villains = [];
let integratedVillains = [];
```

#### 2. Level System
```javascript
const LEVELS = [
  {
    name: "Level Name",
    fear: "Fear Type",
    villain: { /* villain data */ },
    guide: { /* guide data */ },
    bg: { /* background config */ },
    unlockPower: 'powerName'
  }
];
```

Each level is a complete configuration object. To add a new level:
1. Add to `LEVELS` array
2. Define villain behavior
3. Set background colors
4. Link to a power unlock

#### 3. Entity System

**Player**
- Physics body with gravity
- Controlled by keyboard input
- Visual appearance changes with enlightenment

**Villains**
- AI-controlled sprites
- Health system
- State: active → defeated → integrated
- Each has unique dialogue

**Collectibles (Mind Blooms)**
- Physics bodies
- Animated (tweens)
- Increase enlightenment on collection

#### 4. Power System

Powers are implemented as functions with cooldown management:

```javascript
function usePower(powerKey, scene) {
  if (!power.unlocked || power.cooldown > 0) return;
  
  power.cooldown = power.maxCooldown;
  
  // Execute power effect
  activate[PowerName](scene);
}
```

Each power:
- Has a cooldown timer
- Requires unlock
- Affects game state
- Has visual feedback

---

## Adding New Features

### Add a New Level

```javascript
{
  name: "The Chasm of Shame",
  fear: "Fear of Exposure",
  villain: {
    name: "The Judge",
    type: "judge",
    color: 0x8b0000,
    dialogue: "Everyone sees your flaws...",
    defeatDialogue: "I was protecting you from criticism."
  },
  guide: {
    name: "The Healer",
    archetype: "acceptance",
    color: 0x98fb98,
    intro: "Shame dissolves in the light of compassion.",
    wisdom: "What you hide owns you. What you reveal frees you."
  },
  bg: { colors: [0x8b0000, 0x4b0000, 0x000000], speed: 0.4 },
  unlockPower: 'newPowerName'
}
```

Add to `LEVELS` array at appropriate position.

### Add a New Power

1. **Define in mindBlooms object:**
```javascript
let mindBlooms = {
  newPower: { 
    unlocked: false, 
    cooldown: 0, 
    maxCooldown: 10000 
  }
};
```

2. **Create activation function:**
```javascript
function activateNewPower(scene) {
  // Power logic here
  // Example: create visual effect
  scene.cameras.main.flash(500, 255, 255, 0);
  
  // Example: affect villains
  villains.forEach(v => {
    // Do something to villain
  });
}
```

3. **Add to usePower switch:**
```javascript
case 'newPower':
  activateNewPower(scene);
  break;
```

4. **Add UI in HTML:**
```html
<div class="power-slot" id="power-5">
  <span class="power-key">5</span>
  <span class="power-name">New Power</span>
  <div class="power-cooldown"></div>
</div>
```

### Add a New Villain Type

1. **Create behavior function:**
```javascript
function updateVillain(villain, time, scene) {
  if (villain.data.type === 'newType') {
    // Custom AI behavior
    // Example: teleport around
    if (Math.random() < 0.01) {
      villain.sprite.setPosition(
        Phaser.Math.Between(100, 1100),
        villain.sprite.y
      );
    }
  }
}
```

2. **Add to level definition** (see above)

### Add New Visual Effects

**Particle effects:**
```javascript
const emitter = scene.add.particles(x, y, 'textureKey', {
  speed: { min: 100, max: 200 },
  scale: { start: 1, end: 0 },
  lifespan: 1000,
  tint: [0xff00ff, 0x00ffff]
});
emitter.explode(20); // One-time burst
```

**Camera effects:**
```javascript
scene.cameras.main.shake(500, 0.01);      // Shake
scene.cameras.main.flash(500, 255, 0, 0);  // Flash red
scene.cameras.main.fade(1000, 0, 0, 0);    // Fade to black
```

**Tween animations:**
```javascript
scene.tweens.add({
  targets: sprite,
  alpha: 0,
  scale: 2,
  rotation: Math.PI * 2,
  duration: 2000,
  ease: 'Power2',
  onComplete: () => { /* callback */ }
});
```

---

## Styling & CSS

### Modifying Visual Theme

All colors are defined in CSS custom properties (you could add this):

```css
:root {
  --neon-pink: #ff00ff;
  --neon-cyan: #00ffff;
  --void-black: #000000;
  --enlightenment-white: #ffffff;
}
```

### Adding New Animations

```css
@keyframes myAnimation {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.my-element {
  animation: myAnimation 2s infinite;
}
```

---

## Game Balance

### Difficulty Tuning

**Player Stats:**
```javascript
player.setVelocityX(±200);  // Movement speed
player.setVelocityY(-400);  // Jump height
```

**Villain Stats:**
```javascript
villain.health = 100;        // HP
const speed = 80;            // Chase speed
```

**Fear/Enlightenment:**
```javascript
fearLevel += 2;              // Damage per collision
enlightenmentLevel += 5;     // Per Mind Bloom
enlightenmentLevel += 20;    // Per integration
```

**Power Cooldowns:**
```javascript
maxCooldown: 10000  // 10 seconds (in milliseconds)
```

### Level Completion Requirements

```javascript
const allIntegrated = villains.every(v => v.integrated);
const minEnlightenment = enlightenmentLevel >= 50;

if (allIntegrated && minEnlightenment) {
  advanceLevel();
}
```

Change `50` to adjust difficulty.

---

## Debugging

### Enable Phaser Debug Mode

In `gameConfig`:
```javascript
physics: {
  default: 'arcade',
  arcade: {
    gravity: { y: 800 },
    debug: true  // Shows collision boxes
  }
}
```

### Console Logging

Add strategic logs:
```javascript
console.log('Fear:', fearLevel);
console.log('Enlightenment:', enlightenmentLevel);
console.log('Villain health:', villain.health);
```

### Common Issues

**Powers not working:**
- Check if `unlocked: true`
- Check cooldown timer
- Verify key event listener

**Collision not detected:**
- Ensure physics bodies exist
- Check overlap/collider setup
- Verify depth/z-index

**Performance issues:**
- Reduce particle count
- Lower background effect complexity
- Disable some animations

---

## Performance Optimization

### Reduce Particle Effects

```javascript
// Instead of continuous emitter
particles.createEmitter({ frequency: 500 }); // Every 500ms

// Use one-time bursts
emitter.explode(10); // Only 10 particles
```

### Object Pooling

```javascript
// Reuse game objects instead of creating/destroying
const bloomPool = scene.add.group({
  classType: Phaser.GameObjects.Sprite,
  maxSize: 20,
  runChildUpdate: true
});
```

### Depth Management

Only render what's needed:
```javascript
sprite.setDepth(10);  // Higher = rendered on top
background.setDepth(-10); // Rendered first
```

---

## Testing Checklist

### Before Committing Changes

- [ ] Game starts without errors
- [ ] Player movement works (←, →, ↑/Space)
- [ ] Powers activate (1, 2, 3, 4)
- [ ] Integration works (E key)
- [ ] HUD updates correctly
- [ ] Level transitions work
- [ ] Victory screen appears
- [ ] Game over screen appears
- [ ] No console errors
- [ ] Responsive on mobile (if applicable)

### Browser Testing

Test in:
- Chrome/Edge (Chromium)
- Firefox
- Safari

### Performance Testing

Open DevTools:
- **Console**: Check for errors
- **Network**: Verify CDN loads (Phaser)
- **Performance**: FPS should be 60

---

## Extending the Experience

### Ideas for Expansion

**Gameplay:**
- Save system (localStorage)
- Multiple save slots
- Difficulty modes (Gentle, Heroic, Shadow)
- Time trial mode
- Collectible lore items

**Content:**
- More levels (anger, grief, shame, jealousy)
- Secret areas
- Optional bosses
- Multiple endings based on integration count

**Technical:**
- Mobile touch controls
- Gamepad support
- WebGL shaders for trippy effects
- Sound effects and music
- Procedural level generation

**Social:**
- Share integration count
- Journal system to record insights
- Screenshot mode

---

## Best Practices

### Code Style
- Use descriptive variable names
- Comment complex logic
- Keep functions focused and small
- Maintain consistent indentation

### Game Design
- Test with non-gamers
- Balance challenge and accessibility
- Respect the psychological themes
- Maintain coherent visual language

### Performance
- Destroy unused objects
- Use object pooling for frequent creates/destroys
- Limit particle counts
- Profile before optimizing

---

## Helpful Resources

### Phaser 3
- [Official Docs](https://photonstorm.github.io/phaser3-docs/)
- [Examples](https://phaser.io/examples)
- [Labs](https://labs.phaser.io/)

### Game Design
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [The Art of Game Design: A Book of Lenses](https://www.schellgames.com/art-of-game-design)

### Web Dev
- [MDN Web Docs](https://developer.mozilla.org/)
- [Can I Use](https://caniuse.com/) - Browser compatibility

---

## Contributing

If you improve this game:
1. Test thoroughly
2. Update documentation
3. Keep the philosophical core intact
4. Share your learnings

This game is a teaching tool. Let's keep it educational, accessible, and meaningful.

---

## Questions?

If you're stuck:
1. Check the console for errors
2. Review this guide
3. Read the Phaser docs
4. Comment out code sections to isolate issues
5. Start with a minimal example and rebuild

**Remember:** Every expert was once a beginner. Take your time.

---

*Happy developing! May your code be bug-free and your shadows integrated.* 🍄✨

