// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Player Entity
// ============================================================

import Phaser from 'phaser';
import type { HeroData, PlayerState } from '../game/types';
import { COYOTE_TIME, JUMP_BUFFER_TIME, PLAYER_INVULN_TIME, KNOCKBACK_FORCE, DEPTH, COLORS } from '../game/constants';
import type { InputState } from '../systems/InputSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { EffectsSystem } from '../systems/EffectsSystem';

export class Player extends Phaser.Physics.Arcade.Sprite {
  // Stats
  public readonly heroData: HeroData;
  public hp: number;
  public maxHp: number;
  public tokens: number = 0;

  // State
  public playerState: PlayerState = 'idle';
  private facingRight: boolean = true;

  // Jump tracking
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private isGrounded: boolean = false;
  private wasGrounded: boolean = false;
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

  // Ability cooldown accessor
  get abilityCooldown(): number { return this.abilityCooldownRemaining; }
  get abilityCooldownMax(): number { return this.heroData.abilityCooldown * 1000; }
  get abilityCooldownFraction(): number {
    return Math.max(0, 1 - this.abilityCooldownRemaining / (this.heroData.abilityCooldown * 1000));
  }

  constructor(scene: Phaser.Scene, x: number, y: number, heroData: HeroData) {
    // Use the spritesheet texture for animated hero; frame 0 is the first idle frame
    super(scene, x, y, `hero_${heroData.id}_idle`, 0);
    this.heroData = heroData;
    this.hp = heroData.hp;
    this.maxHp = heroData.hp;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.PLAYER);
    this.setCollideWorldBounds(true);

    // Physics body size adjusted for the larger spritesheet frames (104x120 idle)
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setSize(32, 90);
      (this.body as Phaser.Physics.Arcade.Body).setOffset(36, 10);
      (this.body as Phaser.Physics.Arcade.Body).setGravityY(0); // Scene handles gravity
    }

    this.effects = new EffectsSystem(scene);
  }

  /** Main update. Call every frame from LevelScene. */
  update(input: InputState, delta: number): void {
    if (this.playerState === 'dead') return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    this.wasGrounded = this.isGrounded;
    this.isGrounded = body.blocked.down;

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
    // Coyote time
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

    const speed = this.heroData.speed;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (input.left) {
      body.setVelocityX(-speed);
      this.setFlipX(true);
      this.facingRight = false;
    } else if (input.right) {
      body.setVelocityX(speed);
      this.setFlipX(false);
      this.facingRight = true;
    } else {
      // Friction deceleration
      body.setVelocityX(body.velocity.x * 0.7);
      if (Math.abs(body.velocity.x) < 5) body.setVelocityX(0);
    }
  }

  private handleJump(input: InputState): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const canJump = this.isGrounded || this.coyoteTimer > 0;

    // Buffer jump input
    if (input.jump) {
      this.jumpBufferTimer = JUMP_BUFFER_TIME;
    }

    // Execute jump
    if (this.jumpBufferTimer > 0 && canJump && this.playerState !== 'hurt') {
      body.setVelocityY(-this.heroData.jumpVelocity);
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.justJumped = true;
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
    const body = this.body as Phaser.Physics.Arcade.Body;
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
    } else if (Math.abs(body.velocity.x) > 20) {
      animSuffix = 'run';
    } else {
      animSuffix = 'idle';
    }

    const animKey = `${id}_${animSuffix}`;

    // Play spritesheet animation if available; otherwise fall back to static TextureFactory texture
    if (this.scene.anims.exists(animKey)) {
      this.anims.play(animKey, true);
    } else {
      // Fallback: use static TextureFactory texture key
      const fallbackKey = `${id}_${animSuffix}`;
      if (this.scene.textures.exists(fallbackKey)) {
        this.setTexture(fallbackKey);
      }
    }

    // Always keep flip direction correct
    this.setFlipX(!this.facingRight);
  }

  /** Called when player takes damage */
  takeDamage(amount: number, knockbackDir: number = 0): boolean {
    if (this.isInvuln || this.playerState === 'dead') return false;
    if (this.hp <= 0) return false;

    this.hp -= amount;
    this.isInvuln = true;
    this.invulnTimer = PLAYER_INVULN_TIME;
    AudioSystem.playHurt();

    // Knockback
    if (knockbackDir !== 0) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(knockbackDir * KNOCKBACK_FORCE);
      body.setVelocityY(-200);
    }

    // Visual flash
    this.effects.startInvulnFlicker(this, PLAYER_INVULN_TIME);
    this.effects.shakeCamera(0.006, 200);

    if (this.hp <= 0) {
      this.hp = 0;
      this.playerState = 'dead';
      AudioSystem.playDeath();
      return true; // died
    }

    this.playerState = 'hurt';
    this.scene.time.delayedCall(300, () => {
      if (this.playerState === 'hurt') this.playerState = 'idle';
    });

    return false;
  }

  /** Restore HP */
  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  /** Refill ability cooldown */
  refillAbility(): void {
    this.abilityCooldownRemaining = 0;
  }

  /** Check if currently in attack frame with hitbox active */
  isAttacking(): boolean {
    return this.playerState === 'attack' && this.attackTimer > this.ATTACK_DURATION * 0.3;
  }

  /** Get attack hitbox in world space */
  getAttackHitbox(): Phaser.Geom.Rectangle {
    const reach = 55;
    const offsetX = this.facingRight ? reach : -reach;
    return new Phaser.Geom.Rectangle(
      this.x + (this.facingRight ? 14 : -reach - 14),
      this.y - 25,
      reach,
      50
    );
  }

  /** Get ability hitbox (larger range) */
  getAbilityHitbox(): Phaser.Geom.Rectangle {
    const range = 100;
    return new Phaser.Geom.Rectangle(this.x - range, this.y - range, range * 2, range * 2);
  }

  isFacingRight(): boolean {
    return this.facingRight;
  }

  isDead(): boolean {
    return this.playerState === 'dead';
  }
}
