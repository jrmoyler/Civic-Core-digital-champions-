// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Player Entity
// Physics: Phaser.Physics.Matter.Sprite (rigid-body)
// ============================================================

import Phaser from 'phaser';
import type { HeroData, PlayerState } from '../game/types';
import {
  COYOTE_TIME, JUMP_BUFFER_TIME, PLAYER_INVULN_TIME,
  KNOCKBACK_FORCE, DEPTH, COLLISION_CATEGORIES, MATTER_VELOCITY_SCALE,
} from '../game/constants';
import type { InputState } from '../systems/InputSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { EffectsSystem } from '../systems/EffectsSystem';

export class Player extends Phaser.Physics.Matter.Sprite {
  // Stats
  public readonly heroData: HeroData;
  public hp: number;
  public maxHp: number;
  public tokens: number = 0;

  // State
  public playerState: PlayerState = 'idle';
  private facingRight: boolean = true;

  // Ground tracking (managed via Matter collision events in LevelScene)
  public groundContacts: number = 0;
  get isGrounded(): boolean { return this.groundContacts > 0; }
  private wasGrounded: boolean = false;

  // Jump tracking
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private justJumped: boolean = false;

  // Combat
  private attackTimer: number = 0;
  private readonly ATTACK_DURATION = 280;
  private abilityCooldownRemaining: number = 0;
  public isAbilityActive: boolean = false;
  private abilityTimer: number = 0;
  private readonly ABILITY_DURATION = 600;

  // Invuln
  private invulnTimer: number = 0;
  public isInvuln: boolean = false;

  // Effects
  private effects!: EffectsSystem;

  // Ability cooldown accessors
  get abilityCooldown(): number { return this.abilityCooldownRemaining; }
  get abilityCooldownMax(): number { return this.heroData.abilityCooldown * 1000; }
  get abilityCooldownFraction(): number {
    return Math.max(0, 1 - this.abilityCooldownRemaining / (this.heroData.abilityCooldown * 1000));
  }

  private static getInitialTexture(scene: Phaser.Scene, heroId: string): string {
    const spritesheetKey = `hero_${heroId}_idle`;
    return scene.textures.exists(spritesheetKey) ? spritesheetKey : `${heroId}_idle`;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, heroData: HeroData) {
    const textureKey = Player.getInitialTexture(scene, heroData.id);
    // Pass world + body config; body size adjusted below via setRectangle()
    super(scene.matter.world, x, y, textureKey, 0);
    this.heroData = heroData;
    this.hp = heroData.hp;
    this.maxHp = heroData.hp;

    scene.add.existing(this);
    this.setDepth(DEPTH.PLAYER);

    // Physics body: 32x90, centered within a 104px-wide idle frame.
    // Dynamically updated for wide frames (208px jump/hurt).
    if (this.body) {
      this.applyBodyForFrame('idle');
      (this.body as Phaser.Physics.Arcade.Body).setGravityY(0); // Scene handles gravity
    }
    // Compute body dimensions from the loaded frame
    const frame = (this.texture as Phaser.Textures.Texture).get(0) as Phaser.Textures.Frame;
    const frameW = (frame && frame.realWidth > 0) ? frame.realWidth : 104;
    const frameH = (frame && frame.realHeight > 0) ? frame.realHeight : 120;
    const bodyW = Math.max(24, Math.floor(frameW * 0.31));
    const bodyH = Math.max(48, Math.floor(frameH * 0.75));

    // Replace default body with a properly-sized rectangle
    this.setRectangle(bodyW, bodyH, {
      label: 'player',
      frictionAir: 0.04,    // slight air damping
      friction: 0.08,
      restitution: 0,        // no bounce
      collisionFilter: {
        category: COLLISION_CATEGORIES.PLAYER,
        mask: COLLISION_CATEGORIES.PLATFORM
             | COLLISION_CATEGORIES.ONE_WAY_PLATFORM
             | COLLISION_CATEGORIES.ENEMY_PROJ,
      },
    });

    // Prevent Matter from rotating the character sprite
    this.setFixedRotation();

    this.effects = new EffectsSystem(scene);
  }

  /**
   * Sets physics body size/offset to match the current animation frame width.
   * - Normal frames (idle/run/attack/ability): 104px wide → offset_x = 36
   * - Wide frames (jump/hurt): 208px wide → offset_x = 88
   * The 32px-wide body is centered in both cases.
   */
  private applyBodyForFrame(animSuffix: string): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    const isWideFrame = animSuffix === 'jump' || animSuffix === 'hurt';
    if (isWideFrame) {
      body.setSize(32, 72);
      body.setOffset(88, 5);   // center in 208-wide frame, 5px from top of 89px
    } else {
      body.setSize(32, 90);
      body.setOffset(36, 10);  // center in 104-wide frame, 10px from top of 120px
    }
  }

  /** Main update. Call every frame from LevelScene. */
  // ── Main update ─────────────────────────────────────────────
  update(input: InputState, delta: number): void {
    if (this.playerState === 'dead') return;

    // Dynamically toggle one-way platform collision based on Y velocity.
    // While jumping up (velocity.y < 0), exclude ONE_WAY_PLATFORM from mask
    // so the player passes through from below.
    this.updateOneWayMask();

    this.wasGrounded = this.isGrounded;

    // Landing sound
    if (this.isGrounded && !this.wasGrounded) {
      AudioSystem.playLand();
    }

    this.updateTimers(delta);
    this.handleMovement(input);
    this.handleJump(input);
    this.handleAttack(input);
    this.handleAbility(input);
    this.updateAnimation();
  }

  private updateTimers(delta: number): void {
    // Coyote time — brief grace period after walking off a ledge
    if (!this.isGrounded && this.wasGrounded && !this.justJumped) {
      this.coyoteTimer = COYOTE_TIME;
    }
    if (this.coyoteTimer > 0) this.coyoteTimer -= delta;

    // Jump buffer
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= delta;

    // Attack timer
    if (this.attackTimer > 0) {
      this.attackTimer -= delta;
      if (this.attackTimer <= 0 && this.playerState === 'attack') {
        this.playerState = 'idle';
      }
    }

    // Ability timer
    if (this.abilityTimer > 0) {
      this.abilityTimer -= delta;
      if (this.abilityTimer <= 0) {
        this.isAbilityActive = false;
        if (this.playerState === 'ability') this.playerState = 'idle';
      }
    }

    // Ability cooldown
    if (this.abilityCooldownRemaining > 0) {
      this.abilityCooldownRemaining -= delta;
      if (this.abilityCooldownRemaining < 0) this.abilityCooldownRemaining = 0;
    }

    // Invulnerability
    if (this.invulnTimer > 0) {
      this.invulnTimer -= delta;
      if (this.invulnTimer <= 0) {
        this.isInvuln = false;
        this.setAlpha(1);
      }
    }

    this.justJumped = false;
  }

  private handleMovement(input: InputState): void {
    if (this.playerState === 'hurt') return;

    // Scale Arcade px/s speed → Matter px/frame
    const speed = this.heroData.speed * MATTER_VELOCITY_SCALE;
    const body = this.body as MatterJS.BodyType;

    if (input.left) {
      this.setVelocityX(-speed);
      this.setFlipX(true);
      this.facingRight = false;
    } else if (input.right) {
      this.setVelocityX(speed);
      this.setFlipX(false);
      this.facingRight = true;
    } else {
      // Ground friction deceleration (same factor as before, now in px/frame)
      this.setVelocityX(body.velocity.x * 0.7);
      if (Math.abs(body.velocity.x) < 0.1) this.setVelocityX(0);
    }
  }

  private handleJump(input: InputState): void {
    const canJump = this.isGrounded || this.coyoteTimer > 0;

    if (input.jump) {
      this.jumpBufferTimer = JUMP_BUFFER_TIME;
    }

    if (this.jumpBufferTimer > 0 && canJump && this.playerState !== 'hurt') {
      // Scale Arcade jump velocity → Matter px/frame
      this.setVelocityY(-this.heroData.jumpVelocity * MATTER_VELOCITY_SCALE);
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.justJumped = true;
      // Immediately clear ground contact so coyote doesn't re-fire
      this.groundContacts = 0;
      if (this.playerState !== 'attack' && this.playerState !== 'ability') {
        this.playerState = 'jump';
      }
      AudioSystem.playJump();
    }
  }

  private handleAttack(input: InputState): void {
    if (input.attack && this.playerState !== 'hurt' && this.playerState !== 'dead') {
      if (this.attackTimer <= 0) {
        this.playerState = 'attack';
        this.attackTimer = this.ATTACK_DURATION;
        AudioSystem.playAttack();
        this.effects.shakeCamera(0.003, 80);
      }
    }
  }

  private handleAbility(input: InputState): void {
    if (input.ability && this.abilityCooldownRemaining <= 0 && this.playerState !== 'hurt') {
      this.playerState = 'ability';
      this.isAbilityActive = true;
      this.abilityTimer = this.ABILITY_DURATION;
      this.abilityCooldownRemaining = this.heroData.abilityCooldown * 1000;
      AudioSystem.playAbility();
      this.effects.spawnAbilityEffect(this.x, this.y, this.heroData.primaryColor, 80);
    }
  }

  private updateAnimation(): void {
    const body = this.body as MatterJS.BodyType;
    const id = this.heroData.id;
    let animSuffix = 'idle';

    if (this.playerState === 'dead' || this.playerState === 'hurt') {
      animSuffix = 'hurt';
    } else if (this.playerState === 'attack') {
      animSuffix = 'attack';
    } else if (this.playerState === 'ability') {
      animSuffix = 'ability';
    } else if (!this.isGrounded) {
      animSuffix = 'jump';
    } else if (Math.abs(body.velocity.x) > 0.3) {
      animSuffix = 'run';
    } else {
      animSuffix = 'idle';
    }

    // Adjust physics body offset for wide-frame animations (jump/hurt are 208px vs 104px)
    this.applyBodyForFrame(animSuffix);

    const animKey = `${id}_${animSuffix}`;

    if (this.scene.anims.exists(animKey)) {
      if (this.anims.currentAnim?.key !== animKey) {
        this.anims.play(animKey, true);
      }
    } else {
      // Fallback: use static TextureFactory texture key (short prefixes: idle, run1, run2, etc.)
      const fallbackSuffix = animSuffix === 'run' ? 'run1' : animSuffix;
      const fallbackKey = `${id}_${fallbackSuffix}`;
      if (this.scene.textures.exists(fallbackKey)) {
        this.setTexture(fallbackKey);
      }
    }

    this.setFlipX(!this.facingRight);
  }

  /** Toggle ONE_WAY_PLATFORM collision off while moving upward */
  private updateOneWayMask(): void {
    const body = this.body as MatterJS.BodyType;
    const movingUp = body.velocity.y < -0.3;
    const base = COLLISION_CATEGORIES.PLATFORM | COLLISION_CATEGORIES.ENEMY_PROJ;
    body.collisionFilter.mask = movingUp
      ? base
      : base | COLLISION_CATEGORIES.ONE_WAY_PLATFORM;
  }

  // ── Combat ───────────────────────────────────────────────────
  takeDamage(amount: number, knockbackDir: number = 0): boolean {
    if (this.isInvuln || this.playerState === 'dead') return false;
    if (this.hp <= 0) return false;

    this.hp -= amount;
    this.isInvuln = true;
    this.invulnTimer = PLAYER_INVULN_TIME;
    AudioSystem.playHurt();

    if (knockbackDir !== 0) {
      this.setVelocityX(knockbackDir * KNOCKBACK_FORCE * MATTER_VELOCITY_SCALE);
      this.setVelocityY(-200 * MATTER_VELOCITY_SCALE);
    }

    this.effects.startInvulnFlicker(this, PLAYER_INVULN_TIME);
    this.effects.shakeCamera(0.006, 200);
    this.effects.triggerDamageFX();

    if (this.hp <= 0) {
      this.hp = 0;
      this.playerState = 'dead';
      AudioSystem.playDeath();
      return true;
    }

    this.playerState = 'hurt';
    this.scene.time.delayedCall(300, () => {
      if (this.playerState === 'hurt') this.playerState = 'idle';
    });

    return false;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  refillAbility(): void {
    this.abilityCooldownRemaining = 0;
  }

  isAttacking(): boolean {
    return this.playerState === 'attack' && this.attackTimer > this.ATTACK_DURATION * 0.3;
  }

  getAttackHitbox(): Phaser.Geom.Rectangle {
    const reach = 55;
    return new Phaser.Geom.Rectangle(
      this.x + (this.facingRight ? 14 : -reach - 14),
      this.y - 25,
      reach,
      50,
    );
  }

  getAbilityHitbox(): Phaser.Geom.Rectangle {
    const range = 100;
    return new Phaser.Geom.Rectangle(this.x - range, this.y - range, range * 2, range * 2);
  }

  isFacingRight(): boolean { return this.facingRight; }
  isDead(): boolean { return this.playerState === 'dead'; }
}
