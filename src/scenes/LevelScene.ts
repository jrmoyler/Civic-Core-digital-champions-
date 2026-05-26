// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Level Scene
// Physics: Phaser Matter.js — rigid-body + sensor collision system
// Visuals: Three.js 3D parallax background + Phaser FX pipeline
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS, DEPTH, COLORS, COLLISION_CATEGORIES } from '../game/constants';
import { GameState } from '../game/state/GameState';
import { InputSystem } from '../systems/InputSystem';
import { EffectsSystem } from '../systems/EffectsSystem';
import { CollisionDebug } from '../systems/CollisionDebug';
import { AudioSystem } from '../systems/AudioSystem';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Collectible } from '../entities/Collectible';
import { Checkpoint } from '../entities/Checkpoint';
import { ExitBeacon } from '../entities/ExitBeacon';
import { Projectile } from '../entities/Projectile';
import { TouchControls } from '../ui/TouchControls';
import { DialogueBox } from '../ui/DialogueBox';
import { getLevelData } from '../data/levels';
import { getHeroData } from '../data/heroes';
import { getEnemyData, getBossData } from '../data/enemies';
import { getCollectibleData } from '../data/collectibles';
import { BackgroundRenderer } from '../three/BackgroundRenderer';
import type { LevelData, ZoneId } from '../game/types';

export class LevelScene extends Phaser.Scene {
  // Core systems
  private inputSys!: InputSystem;
  private effects!: EffectsSystem;
  private collisionDebug!: CollisionDebug;
  private touchControls!: TouchControls;
  private dialogue!: DialogueBox;

  // State
  private gameState!: GameState;
  private levelData!: LevelData;
  private zoneId!: ZoneId;
  private levelComplete: boolean = false;
  private gameOver: boolean = false;

  // Entities
  private player!: Player;
  private enemies: Enemy[] = [];
  private boss: Boss | null = null;
  private collectibles: Collectible[] = [];
  private checkpoint!: Checkpoint;
  private exitBeacon!: ExitBeacon;

  // Projectile lists (plain arrays — no Arcade groups needed)
  private playerProjectiles: Projectile[] = [];
  private enemyProjectiles: Projectile[] = [];

  // Background
  private bgImage!: Phaser.GameObjects.Image;

  // Boss arena trigger
  private bossTriggered: boolean = false;
  private bossArenaX: number = 0;

  // HUD tracking
  private lastHp: number = 0;
  private lastTokens: number = 0;

  // Three.js background renderer
  private bgRenderer: BackgroundRenderer | null = null;

  constructor() {
    super({ key: SCENE_KEYS.LEVEL });
  }

  init(data: { zoneId?: ZoneId }): void {
    this.zoneId = data.zoneId ?? 'zone1';
    this.levelComplete = false;
    this.gameOver = false;
    this.bossTriggered = false;
    this.enemies = [];
    this.boss = null;
    this.collectibles = [];
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
  }

  create(): void {
    this.gameState = GameState.getInstance();
    const ld = getLevelData(this.zoneId);
    if (!ld) {
      console.error('[LevelScene] No level data for:', this.zoneId);
      this.scene.start(SCENE_KEYS.WORLD_MAP);
      return;
    }
    this.levelData = ld;

    // ── Physics world bounds ──────────────────────────────────
    // Create explicit boundary walls with PLATFORM category so entity
    // collision masks (which include PLATFORM) block at world edges.
    this.buildWorldBounds(ld.worldWidth, ld.worldHeight);

    // ── Camera ───────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, ld.worldWidth, ld.worldHeight);
    this.cameras.main.setBackgroundColor(ld.bgColor);

    // Phaser FX: camera vignette for depth/atmosphere (WebGL only)
    if (this.game.renderer.type === Phaser.WEBGL) {
      this.cameras.main.postFX.addVignette(0.5, 0.5, 0.28, 0.65);
    }

    // ── Build level ──────────────────────────────────────────
    this.initThreeBackground();
    this.buildBackground();
    this.buildPlatforms();
    this.spawnPlayer();
    this.spawnEnemies();
    this.spawnCollectibles();
    this.spawnCheckpoint();
    this.spawnBoss();
    this.spawnExitBeacon();

    // ── Systems ──────────────────────────────────────────────
    this.inputSys = new InputSystem(this);
    this.effects = new EffectsSystem(this);
    this.collisionDebug = new CollisionDebug(this);
    this.collisionDebug.setup(ld.platforms);

    this.touchControls = new TouchControls(this, this.inputSys);
    const isMobile = !this.sys.game.device.os.desktop;
    this.touchControls.setVisible(isMobile);

    this.dialogue = new DialogueBox(this);

    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setFollowOffset(0, -60);

    // ── Matter collision events ───────────────────────────────
    this.setupMatterCollisions();

    // ── HUD ──────────────────────────────────────────────────
    this.scene.launch(SCENE_KEYS.HUD, { zoneId: this.zoneId });
    this.scene.bringToTop(SCENE_KEYS.HUD);

    this.bossArenaX = this.levelData.boss.x - 400;

    this.time.delayedCall(500, () => {
      this.effects.spawnBanner(
        `ZONE ${['zone1', 'zone2', 'zone3'].indexOf(this.zoneId) + 1}: ${ld.name.toUpperCase()}`,
        '#F5A623',
        2500,
      );
    });

    this.input_keyboard_debug();
    this.input_keyboard_pause();
    this.updateHUD();

    // Pause/hide Three.js when leaving this scene
    this.events.once('shutdown', () => this.bgRenderer?.hide());
    this.events.once('destroy',  () => this.bgRenderer?.destroy());
  }

  // ── Three.js 3D parallax background ─────────────────────────
  private initThreeBackground(): void {
    try {
      this.bgRenderer = BackgroundRenderer.getInstance();
      this.bgRenderer.setupZone(this.zoneId);
      this.bgRenderer.show();
    } catch (e) {
      console.warn('[LevelScene] Three.js background unavailable:', e);
      this.bgRenderer = null;
    }
  }

  private buildBackground(): void {
    const ld = this.levelData;
    const key = ld.backgroundKey;

    if (this.textures.exists(key)) {
      this.bgImage = this.add.image(ld.worldWidth / 2, ld.worldHeight / 2, key);
      this.bgImage.setDisplaySize(ld.worldWidth, ld.worldHeight);
      this.bgImage.setDepth(DEPTH.BG);
    } else {
      const gfx = this.add.graphics();
      gfx.fillStyle(ld.bgColor, 1);
      gfx.fillRect(0, 0, ld.worldWidth, ld.worldHeight);
      gfx.setDepth(DEPTH.BG);
    }

    const atmo = this.add.graphics();
    atmo.fillStyle(ld.ambientColor, 0.12);
    atmo.fillRect(0, 0, ld.worldWidth, ld.worldHeight);
    atmo.setDepth(DEPTH.PARALLAX);
  }

  // ── Platform creation (Matter static bodies) ─────────────────
  private buildPlatforms(): void {
    for (const plat of this.levelData.platforms) {
      const cx = plat.x + plat.width / 2;
      const cy = plat.y + plat.height / 2;
      const label = plat.oneWay ? 'oneWayPlatform' : 'platform';
      const category = plat.oneWay
        ? COLLISION_CATEGORIES.ONE_WAY_PLATFORM
        : COLLISION_CATEGORIES.PLATFORM;

      this.matter.add.rectangle(cx, cy, plat.width, plat.height, {
        isStatic: true,
        label,
        friction: 0.1,
        collisionFilter: {
          category,
          mask: COLLISION_CATEGORIES.PLAYER
               | COLLISION_CATEGORIES.ENEMY
               | COLLISION_CATEGORIES.BOSS,
        },
      });
    }
  }

  // ── Player spawn ──────────────────────────────────────────────
  private spawnPlayer(): void {
    const hero = getHeroData(this.gameState.selectedHero);
    let { x: spawnX, y: spawnY } = this.levelData.spawn;

    if (this.gameState.lastCheckpoint?.zoneId === this.zoneId) {
      spawnX = this.gameState.lastCheckpoint.x;
      spawnY = this.gameState.lastCheckpoint.y - 60;
      this.gameState.tokensCollected = this.gameState.lastCheckpoint.tokensCollected;
    }

    this.player = new Player(this, spawnX, spawnY, hero);
    this.lastHp = this.player.hp;
    this.lastTokens = 0;
  }

  private spawnEnemies(): void {
    for (const spawn of this.levelData.enemies) {
      const data = getEnemyData(spawn.type);
      const enemy = new Enemy(this, spawn.x, spawn.y, data, this.enemyProjectiles);
      enemy.setPlayerRef(this.player);
      this.enemies.push(enemy);
    }
  }

  private spawnCollectibles(): void {
    for (const spawn of this.levelData.collectibles) {
      this.collectibles.push(new Collectible(this, spawn.x, spawn.y, spawn.type));
    }
  }

  private spawnCheckpoint(): void {
    const cp = this.levelData.checkpoint;
    this.checkpoint = new Checkpoint(this, cp.x, cp.y);
  }

  private spawnBoss(): void {
    const bossSpawn = this.levelData.boss;
    const bossData = getBossData(bossSpawn.type);
    this.boss = new Boss(this, bossSpawn.x, bossSpawn.y, bossData, this.enemyProjectiles);
    this.boss.setPlayerRef(this.player);
  }

  private spawnExitBeacon(): void {
    const exit = this.levelData.exit;
    this.exitBeacon = new ExitBeacon(this, exit.x, exit.y);
  }

  // ── World boundary walls (explicit static bodies with PLATFORM category) ──
  // This ensures entities whose masks include PLATFORM collide with the world edges.
  private buildWorldBounds(w: number, h: number): void {
    const wallOpts = (label: string) => ({
      isStatic: true,
      label,
      collisionFilter: {
        category: COLLISION_CATEGORIES.PLATFORM,
        mask: COLLISION_CATEGORIES.PLAYER
             | COLLISION_CATEGORIES.ENEMY
             | COLLISION_CATEGORIES.BOSS,
      },
    });
    const T = 32; // wall thickness
    this.matter.add.rectangle(w / 2,  -T / 2,   w,   T, wallOpts('platform')); // ceiling
    this.matter.add.rectangle(w / 2, h + T / 2,  w,   T, wallOpts('platform')); // floor
    this.matter.add.rectangle(-T / 2, h / 2,     T,   h, wallOpts('platform')); // left
    this.matter.add.rectangle(w + T / 2, h / 2,  T,   h, wallOpts('platform')); // right
  }

  // ── Matter collision event handler ────────────────────────────
  private setupMatterCollisions(): void {
    // --- Ground contact tracking (player isGrounded) ---
    this.matter.world.on('collisionstart', (event: any) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;

        // Player ↔ platform ground contacts
        if (this.isPlayerBody(bodyA) && this.isPlatformBody(bodyB)) {
          this.player.groundContacts++;
        } else if (this.isPlayerBody(bodyB) && this.isPlatformBody(bodyA)) {
          this.player.groundContacts++;
        }

        // Sensor overlaps ──────────────────────────────────────
        this.handleSensorOverlap(bodyA, bodyB);
        this.handleSensorOverlap(bodyB, bodyA);
      }
    });

    this.matter.world.on('collisionend', (event: any) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        if (this.isPlayerBody(bodyA) && this.isPlatformBody(bodyB)) {
          this.player.groundContacts = Math.max(0, this.player.groundContacts - 1);
        } else if (this.isPlayerBody(bodyB) && this.isPlatformBody(bodyA)) {
          this.player.groundContacts = Math.max(0, this.player.groundContacts - 1);
        }
      }
    });
  }

  private isPlayerBody(b: any): boolean {
    return b.label === 'player';
  }

  private isPlatformBody(b: any): boolean {
    return b.label === 'platform' || b.label === 'oneWayPlatform';
  }

  // Sensor overlap dispatcher — called for BOTH body orderings
  private handleSensorOverlap(sensorBody: any, otherBody: any): void {
    if (!sensorBody.isSensor) return;

    switch (sensorBody.label) {
      case 'playerProjectile': {
        const proj = sensorBody.gameObject as Projectile | undefined;
        if (!proj || !proj.active) return;

        if (otherBody.label === 'enemy') {
          const enemy = otherBody.gameObject as Enemy | undefined;
          if (enemy && !enemy.isDead) {
            this.handleProjectileHitEnemy(proj.damage, enemy, proj.x, proj.y);
            proj.destroy();
          }
        } else if (otherBody.label === 'boss') {
          if (this.boss && !this.boss.isDefeated) {
            this.handleProjectileHitBoss(proj.damage, proj.x, proj.y);
            proj.destroy();
          }
        }
        break;
      }

      case 'enemyProjectile': {
        const proj = sensorBody.gameObject as Projectile | undefined;
        if (!proj || !proj.active) return;

        if (otherBody.label === 'player' && !this.player.isInvuln) {
          const dir = proj.x < this.player.x ? 1 : -1;
          const died = this.player.takeDamage(proj.damage, dir);
          this.effects.spawnDamageText(this.player.x, this.player.y - 40, proj.damage, 'normal');
          proj.destroy();
          if (died) this.handlePlayerDeath();
        }
        break;
      }

      case 'collectible': {
        if (otherBody.label !== 'player') return;
        const coll = sensorBody.gameObject as Collectible | undefined;
        if (coll && !coll.collected) this.collectItem(coll);
        break;
      }

      case 'checkpoint': {
        if (otherBody.label !== 'player') return;
        if (!this.checkpoint.activated) {
          this.checkpoint.activate();
          this.gameState.setCheckpoint(this.zoneId, this.checkpoint.x, this.checkpoint.y);
          AudioSystem.playCheckpoint();
          this.effects.spawnBanner('✓ CHECKPOINT RESTORED', '#00ffcc');
          this.effects.spawnRingPulse(this.checkpoint.x, this.checkpoint.y, COLORS.CHECKPOINT_COLOR, 60);
        }
        break;
      }

      case 'exitBeacon': {
        if (otherBody.label !== 'player') return;
        if (this.exitBeacon.active_beacon && !this.levelComplete) {
          this.completeLevel();
        }
        break;
      }
    }
  }

  // ── Keyboard shortcut handlers ────────────────────────────────
  private input_keyboard_debug(): void {
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.G)
      .on('down', () => {
        this.collisionDebug.toggle();
        const state = this.collisionDebug.isVisible();
        this.effects.spawnBanner(
          state ? '🔲 COLLISION DEBUG: ON' : '🔲 COLLISION DEBUG: OFF',
          '#00FFCC',
          1200,
        );
      });
  }

  private input_keyboard_pause(): void {
    this.events.on('pause', () => {});
  }

  // ── Main update loop ──────────────────────────────────────────
  update(_time: number, delta: number): void {
    if (this.levelComplete || this.gameOver) return;

    const inputState = this.inputSys.read();

    if (inputState.pause) {
      AudioSystem.playMenuSelect();
      this.scene.pause();
      this.scene.launch(SCENE_KEYS.PAUSE, { zoneId: this.zoneId });
      return;
    }

    if (inputState.map) {
      this.scene.stop(SCENE_KEYS.HUD);
      this.scene.start(SCENE_KEYS.WORLD_MAP);
      return;
    }

    if (inputState.restart) {
      this.restartLevel();
      return;
    }

    // Update player
    this.player.update(inputState, delta);

    // Melee hit detection
    if (this.player.isAttacking()) this.checkMeleeHits();

    // Ability hit detection
    if (this.player.isAbilityActive) this.checkAbilityHits();

    // Enemy contact damage (manual overlap check — no Arcade overlap needed)
    this.checkEnemyContactDamage();

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.active) { this.enemies.splice(i, 1); continue; }
      enemy.update(delta);
    }

    // Clean up inactive projectiles from our tracking arrays
    this.cleanProjectiles(this.playerProjectiles);
    this.cleanProjectiles(this.enemyProjectiles);

    // Boss trigger
    if (this.boss && !this.boss.isDefeated && !this.bossTriggered) {
      if (this.player.x > this.bossArenaX) {
        this.bossTriggered = true;
        this.boss.activate();
        this.effects.spawnBanner(`⚠ ${this.boss.bossData.name.toUpperCase()}!`, '#FF4444', 2000);
        this.cameras.main.stopFollow();
        this.time.delayedCall(800, () => {
          if (this.boss && !this.boss.isDefeated) {
            this.cameras.main.startFollow(this.player, true, 0.06, 0.06);
          }
        });
      }
    }

    // Update boss
    if (this.boss && !this.boss.isDefeated) {
      this.boss.update(delta);
    } else if (this.boss?.isDefeated && !this.exitBeacon.active_beacon) {
      this.time.delayedCall(1500, () => {
        this.exitBeacon.activateBeacon();
        this.effects.spawnBanner('⬢ EXIT BEACON ACTIVATED — Reach the Beacon!', '#FFFFAA', 2500);
      });
      this.boss = null;
    }

    // Update collectibles
    for (const c of this.collectibles) {
      if (c.active) c.update(delta);
    }

    // Update exit beacon
    this.exitBeacon.update(delta);

    // Update Three.js background (sync to Phaser camera scroll)
    if (this.bgRenderer) {
      this.bgRenderer.update(this.cameras.main.scrollX, delta);
    }

    this.updateHUD();
  }

  private cleanProjectiles(list: Projectile[]): void {
    for (let i = list.length - 1; i >= 0; i--) {
      if (!list[i].active) list.splice(i, 1);
    }
  }

  // ── Hit detection ─────────────────────────────────────────────
  private checkMeleeHits(): void {
    const attackBox = this.player.getAttackHitbox();
    const hero = this.player.heroData;

    for (const enemy of this.enemies) {
      if (enemy.isDead || !enemy.active) continue;
      const eb = new Phaser.Geom.Rectangle(
        enemy.x - enemy.enemyData.width / 2,
        enemy.y - enemy.enemyData.height / 2,
        enemy.enemyData.width,
        enemy.enemyData.height,
      );
      if (Phaser.Geom.Intersects.RectangleToRectangle(attackBox, eb)) {
        const isCrit = Math.random() < 0.15;
        const dmg = isCrit ? Math.floor(hero.attackDamage * 1.5) : hero.attackDamage;
        const killed = enemy.takeDamage(dmg);
        this.effects.spawnDamageText(enemy.x, enemy.y - 30, dmg, isCrit ? 'crit' : 'normal');
        this.effects.spawnHitParticles(enemy.x, enemy.y, 0xFFFFFF, 5);
        if (killed) this.gameState.addTokens(Math.ceil(enemy.enemyData.points / 10));
      }
    }

    if (this.boss && !this.boss.isDefeated) {
      const bossBounds = new Phaser.Geom.Rectangle(
        this.boss.x - this.boss.bossData.width / 2,
        this.boss.y - this.boss.bossData.height / 2,
        this.boss.bossData.width * 1.4,
        this.boss.bossData.height * 1.4,
      );
      if (Phaser.Geom.Intersects.RectangleToRectangle(attackBox, bossBounds)) {
        const defeated = this.boss.takeDamage(hero.attackDamage);
        this.effects.spawnDamageText(this.boss.x, this.boss.y - 50, hero.attackDamage, 'normal');
        if (defeated) this.handleBossDefeated();
      }
    }
  }

  private checkAbilityHits(): void {
    const abilityBox = this.player.getAbilityHitbox();
    const hero = this.player.heroData;

    for (const enemy of this.enemies) {
      if (enemy.isDead || !enemy.active) continue;
      const eb = new Phaser.Geom.Rectangle(
        enemy.x - enemy.enemyData.width / 2,
        enemy.y - enemy.enemyData.height / 2,
        enemy.enemyData.width,
        enemy.enemyData.height,
      );
      if (Phaser.Geom.Intersects.RectangleToRectangle(abilityBox, eb)) {
        const killed = enemy.takeDamage(hero.abilityDamage);
        this.effects.spawnDamageText(enemy.x, enemy.y - 30, hero.abilityDamage, 'ability');
        this.effects.spawnHitParticles(enemy.x, enemy.y, hero.primaryColor, 6);
        if (killed) this.gameState.addTokens(Math.ceil(enemy.enemyData.points / 10));
      }
    }

    if (this.boss && !this.boss.isDefeated) {
      const defeated = this.boss.takeDamage(hero.abilityDamage);
      this.effects.spawnDamageText(this.boss.x, this.boss.y - 50, hero.abilityDamage, 'ability');
      if (defeated) this.handleBossDefeated();
    }
  }

  /** Manual enemy-touch-damage check (no Arcade overlap needed) */
  private checkEnemyContactDamage(): void {
    if (this.player.isInvuln) return;
    const px = this.player.x;
    const py = this.player.y;
    const TOUCH_DIST = 50; // px — broad contact threshold

    for (const enemy of this.enemies) {
      if (enemy.isDead || !enemy.active) continue;
      const dx = enemy.x - px;
      const dy = enemy.y - py;
      if (Math.sqrt(dx * dx + dy * dy) < TOUCH_DIST) {
        const dir = enemy.x < px ? 1 : -1;
        const died = this.player.takeDamage(enemy.enemyData.damage, dir);
        this.effects.spawnDamageText(px, py - 40, enemy.enemyData.damage, 'normal');
        if (died) { this.handlePlayerDeath(); return; }
      }
    }

    if (this.boss && !this.boss.isDefeated) {
      const dx = this.boss.x - px;
      const dy = this.boss.y - py;
      if (Math.sqrt(dx * dx + dy * dy) < 70) {
        const dir = this.boss.x < px ? 1 : -1;
        const died = this.player.takeDamage(this.boss.bossData.damage, dir);
        this.effects.spawnDamageText(px, py - 40, this.boss.bossData.damage, 'normal');
        if (died) this.handlePlayerDeath();
      }
    }
  }

  private handleProjectileHitEnemy(damage: number, enemy: Enemy, hx: number, hy: number): void {
    if (enemy.isDead) return;
    const killed = enemy.takeDamage(damage);
    this.effects.spawnDamageText(hx, hy - 20, damage, 'normal');
    this.effects.spawnHitParticles(hx, hy, 0xFFFFFF, 4);
    if (killed) this.gameState.addTokens(Math.ceil(enemy.enemyData.points / 10));
  }

  private handleProjectileHitBoss(damage: number, hx: number, hy: number): void {
    if (!this.boss || this.boss.isDefeated) return;
    const defeated = this.boss.takeDamage(damage);
    this.effects.spawnDamageText(hx, hy - 20, damage, 'normal');
    if (defeated) this.handleBossDefeated();
  }

  private handleBossDefeated(): void {
    this.effects.spawnBanner(`✓ ${this.boss?.bossData.name ?? 'BOSS'} DEFEATED!`, '#00FFCC', 3000);
    this.effects.shakeCamera(0.02, 1200);
    AudioSystem.playVictory();
    this.gameState.addTokens(20);
  }

  private collectItem(c: Collectible): void {
    c.collect();
    AudioSystem.playCollectToken();
    const data = getCollectibleData(c.collectibleType);
    this.effects.spawnCollectEffect(c.x, c.y, data.color);

    switch (c.collectibleType) {
      case 'accessToken':
        this.gameState.addTokens(1);
        this.effects.spawnDamageText(c.x, c.y - 20, 1, 'crit');
        break;
      case 'healthPack':
        this.player.heal(30);
        this.effects.spawnBanner('+ HEALTH PACK', '#00FF88', 1200);
        AudioSystem.playCollectItem();
        break;
      case 'aiLiteracyScroll':
        this.gameState.scrollsCollected++;
        this.gameState.addTokens(3);
        this.effects.spawnBanner('📜 AI LITERACY SCROLL', '#AADDFF', 1500);
        AudioSystem.playCollectItem();
        break;
      case 'patchBattery':
        this.player.refillAbility();
        this.effects.spawnBanner('⚡ ABILITY RECHARGED!', '#00CC66', 1200);
        AudioSystem.playCollectItem();
        break;
      case 'signalShield':
        this.gameState.hasSignalShield = true;
        this.effects.spawnBanner('🛡 SIGNAL SHIELD ACTIVE', '#4488FF', 1400);
        AudioSystem.playCollectItem();
        break;
      case 'empowermentShard':
        this.gameState.addTokens(5);
        this.gameState.empowermentShards++;
        this.effects.spawnBanner('⬡ EMPOWERMENT SHARD +5', '#FF88FF', 1200);
        AudioSystem.playCollectItem();
        break;
      case 'extraLife':
        this.gameState.hasExtraLife = true;
        this.effects.spawnBanner('♥ EXTRA LIFE GRANTED', '#FF4444', 1400);
        AudioSystem.playCollectItem();
        break;
      case 'hiddenLorePage': {
        const loreIds = ['zone1_history', 'zone2_history', 'zone3_history', 'ai_literacy_1'];
        const id = loreIds[Math.floor(Math.random() * loreIds.length)];
        this.gameState.unlockLore(id);
        this.effects.spawnBanner('📖 LORE PAGE UNLOCKED', '#FFDD88', 1500);
        AudioSystem.playCollectItem();
        break;
      }
      case 'challengeRoomKey':
        this.gameState.addTokens(3);
        this.effects.spawnBanner('🔑 CHALLENGE ROOM KEY', '#FFAA44', 1200);
        AudioSystem.playCollectItem();
        break;
    }

    const idx = this.collectibles.indexOf(c);
    if (idx > -1) this.collectibles.splice(idx, 1);
  }

  private handlePlayerDeath(): void {
    if (this.gameOver) return;

    if (this.gameState.hasExtraLife) {
      this.gameState.hasExtraLife = false;
      this.effects.spawnBanner('♥ EXTRA LIFE USED!', '#FF4444', 2000);
      this.effects.flashCamera(0xFF4444, 300);
      this.time.delayedCall(1000, () => {
        this.player.hp = this.player.maxHp;
        this.player.playerState = 'idle';
        this.player.isInvuln = false;
        const cp = this.gameState.lastCheckpoint;
        if (cp && cp.zoneId === this.zoneId) {
          this.player.setPosition(cp.x, cp.y - 60);
        }
      });
      return;
    }

    this.gameOver = true;
    AudioSystem.playGameOver();
    this.effects.flashCamera(0xFF0000, 600);
    this.time.delayedCall(1800, () => {
      this.scene.stop(SCENE_KEYS.HUD);
      this.scene.start(SCENE_KEYS.GAME_OVER, { zoneId: this.zoneId });
    });
  }

  private completeLevel(): void {
    if (this.levelComplete) return;
    this.levelComplete = true;

    this.gameState.completeZone(this.zoneId);
    AudioSystem.playVictory();
    this.effects.flashCamera(0xFFFFAA, 400);
    this.effects.spawnBanner('⬡ ZONE COMPLETE!', '#FFFFAA', 3000);
    this.cameras.main.shake(800, 0.01);

    this.time.delayedCall(2500, () => {
      this.scene.stop(SCENE_KEYS.HUD);
      const isLastZone = this.zoneId === 'zone3';
      if (isLastZone) {
        this.scene.start(SCENE_KEYS.VICTORY, {
          tokens: this.gameState.tokensCollected,
          scrolls: this.gameState.scrollsCollected,
        });
      } else {
        this.scene.start(SCENE_KEYS.WORLD_MAP);
      }
    });
  }

  private restartLevel(): void {
    this.gameState.lastCheckpoint = null;
    this.scene.stop(SCENE_KEYS.HUD);
    this.scene.start(SCENE_KEYS.LEVEL, { zoneId: this.zoneId });
  }

  private updateHUD(): void {
    if (!this.scene.isActive(SCENE_KEYS.HUD)) return;
    const hudScene = this.scene.get(SCENE_KEYS.HUD) as unknown as {
      updatePlayerHP?: (hp: number, max: number) => void;
      updateTokens?: (count: number) => void;
      updateAbilityCooldown?: (fraction: number) => void;
    };
    if (!hudScene) return;

    if (this.lastHp !== this.player.hp) {
      this.lastHp = this.player.hp;
      hudScene.updatePlayerHP?.(this.player.hp, this.player.maxHp);
    }
    if (this.lastTokens !== this.gameState.tokensCollected) {
      this.lastTokens = this.gameState.tokensCollected;
      hudScene.updateTokens?.(this.gameState.tokensCollected);
    }
    hudScene.updateAbilityCooldown?.(this.player.abilityCooldownFraction);
  }
}
