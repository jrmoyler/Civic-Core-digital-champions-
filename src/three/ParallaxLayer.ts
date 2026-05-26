// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Three.js Parallax Layer
// A single full-screen WebGL plane rendered at a given depth
// with zone-specific GLSL shaders.
// ============================================================

import * as THREE from 'three';
import type { LayerShaderConfig } from './ZoneShaders';

export class ParallaxLayer {
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private readonly parallaxFactor: number;

  /**
   * @param scene          Three.js scene to attach to
   * @param width          Plane width in game units
   * @param height         Plane height in game units
   * @param z              Z depth (negative = further away)
   * @param parallaxFactor Fraction of camera scroll to apply (0 = fixed, 1 = 1:1)
   * @param shaderConfig   GLSL vertex + fragment shaders
   */
  constructor(
    scene: THREE.Scene,
    width: number,
    height: number,
    z: number,
    parallaxFactor: number,
    shaderConfig: LayerShaderConfig,
  ) {
    this.parallaxFactor = parallaxFactor;

    const geometry = new THREE.PlaneGeometry(width, height);

    this.material = new THREE.ShaderMaterial({
      vertexShader: shaderConfig.vertexShader,
      fragmentShader: shaderConfig.fragmentShader,
      uniforms: {
        time: { value: 0 },
        scrollOffset: { value: 0 },
        resolution: { value: new THREE.Vector2(width, height) },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.z = z;
    // Disable frustum culling so layer is always rendered regardless of camera position
    this.mesh.frustumCulled = false;

    scene.add(this.mesh);
  }

  update(cameraScrollX: number, time: number): void {
    // Shift layer position by a fraction of the camera scroll for parallax
    this.mesh.position.x = -cameraScrollX * this.parallaxFactor;
    this.material.uniforms.time.value = time;
    this.material.uniforms.scrollOffset.value = cameraScrollX;
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
    (this.mesh.geometry as THREE.BufferGeometry).dispose();
    this.material.dispose();
  }
}
