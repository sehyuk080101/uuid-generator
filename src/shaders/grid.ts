export const vertexShader = /* glsl */ `
  uniform float uSize;
  uniform float uTime;
  uniform vec2  uMouse;

  attribute float aBaseX;
  attribute float aBaseY;

  varying float vAlpha;
  varying float vGlow;

  void main() {
    vec3 pos = position;

    // Wave
    float wave = sin(pos.x * 0.35 + uTime * 0.7)
               * cos(pos.y * 0.35 + uTime * 0.5);
    pos.z = wave * 1.2;

    // Mouse → world space
    // camera fov=55, dist=14 => half-height = 14*tan(27.5deg) ≈ 7.28
    float halfH = 7.28;
    float halfW = halfH * (80.0 / 50.0);
    vec2 mouseWorld = uMouse * vec2(halfW, halfH);

    float dist = length(pos.xy - mouseWorld);
    float influence = smoothstep(3.0, 0.0, dist);

    // Ripple emanating outward from cursor
    float ripple = sin(dist * 2.6 - uTime * 5.5) * influence * 0.4;
    pos.z += ripple;

    // Lateral push away from cursor
    if (dist < 3.0 && dist > 0.01) {
      vec2 dir = normalize(pos.xy - mouseWorld);
      pos.xy += dir * influence * 0.5;
    }

    vAlpha = clamp(0.16 + abs(wave) * 0.44 + influence * 0.50, 0.0, 0.95);
    vGlow  = influence;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position  = projectionMatrix * mv;
    gl_PointSize = uSize * (1.0 + abs(wave) * 0.65);
  }
`;

export const fragmentShader = /* glsl */ `
  varying float vAlpha;
  varying float vGlow;

  void main() {
    // Discard pixels outside the circle
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Soft edge
    float circle = 1.0 - smoothstep(0.32, 0.5, d);

    // Slightly warmer glow near cursor
    vec3 col = mix(vec3(0.78, 0.78, 0.80), vec3(1.0), vGlow * 0.65);
    gl_FragColor = vec4(col, circle * vAlpha);
  }
`;
