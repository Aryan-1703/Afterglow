/* Afterglow Spa — hero "afterglow" shader. Raw WebGL (~4 KB) instead of a 3D
   library to keep the page fast for Core Web Vitals. Falls back to CSS gradients. */
(function () {
  'use strict';

  var RENDER_SCALE = 0.5;       // soft gradients upscale invisibly; saves GPU
  var MAX_DPR = 1.5;
  var MOUSE_EASE = 0.035;
  var STILL_FRAME_TIME = 24.0;  // time used when reduced motion is on

  var VERTEX_SRC = [
    'attribute vec2 a_pos;',
    'void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }',
  ].join('\n');

  var FRAGMENT_SRC = [
    'precision mediump float;',
    'uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;',
    'float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }',
    'float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);',
    '  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }',
    'float fbm(vec2 p){ float v=0.0; float a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);',
    '  for(int i=0;i<5;i++){ v+=a*noise(p); p=m*p; a*=0.5; } return v; }',
    'void main(){',
    '  vec2 p = (gl_FragCoord.xy - 0.5*u_res) / u_res.y;',
    '  float aspect = u_res.x / u_res.y;',
    '  float portrait = aspect < 1.0 ? 1.0 : 0.0;',
    '  float t = u_time * 0.035;',
    '  vec2 n = p * mix(1.0, 1.7, portrait);', // sample more noise on narrow screens
    '  vec2 q = vec2(fbm(n*1.4 + t), fbm(n*1.4 - t + 3.1));',
    '  vec2 r = vec2(fbm(n*1.2 + 2.0*q + vec2(1.7,9.2) + t*1.5), fbm(n*1.2 + 2.0*q + vec2(8.3,2.8) - t));',
    '  float f = fbm(n*1.1 + 2.2*r);',
    '  vec2 focus = vec2(min(0.45, 0.5*aspect - 0.05), aspect < 1.0 ? 0.28 : 0.12) + u_mouse*0.08;',
    '  float glow = smoothstep(1.3, 0.0, length(p - focus));',
    '  vec3 ink = vec3(0.071,0.043,0.059); vec3 wine = vec3(0.45,0.13,0.26);',
    '  vec3 rose = vec3(0.82,0.43,0.53); vec3 ember = vec3(0.96,0.56,0.36); vec3 gold = vec3(0.99,0.80,0.57);',
    '  vec3 col = mix(ink, wine, smoothstep(0.2, 0.75, f));',
    '  col = mix(col, rose, smoothstep(0.45, 0.9, f) * 0.8);',
    '  col = mix(col, ember, smoothstep(0.5, 1.0, f + length(q)*0.3) * glow);',
    '  col = mix(col, gold, pow(smoothstep(0.7, 1.15, f + r.x*0.4), 2.0) * glow * 0.75);',
    '  col *= 0.3 + 0.9*glow;',
    '  float shade = smoothstep(-0.3, 0.9, p.x/max(aspect,0.6) + 0.35);',
    '  float shadeAmt = mix(0.78, 0.5, portrait);', // text spans full width on phones
    '  col = mix(ink, col, (1.0 - shadeAmt) + shadeAmt*shade);',
    '  gl_FragColor = vec4(col, 1.0);',
    '}',
  ].join('\n');

  function compile(gl, type, src) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Shader compile failed: ' + log);
    }
    return shader;
  }

  function createProgram(gl) {
    var program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SRC));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Program link failed: ' + gl.getProgramInfoLog(program));
    }
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);
    return {
      res: gl.getUniformLocation(program, 'u_res'),
      time: gl.getUniformLocation(program, 'u_time'),
      mouse: gl.getUniformLocation(program, 'u_mouse'),
    };
  }

  function resize(canvas, gl) {
    var scale = Math.min(window.devicePixelRatio || 1, MAX_DPR) * RENDER_SCALE;
    var w = Math.max(1, Math.round(canvas.clientWidth * scale));
    var h = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function start(canvas) {
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return; // CSS fallback gradient stays visible
    var u = createProgram(gl);
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var state = { running: false, visible: true, mx: 0, my: 0, tx: 0, ty: 0, raf: 0 };

    function draw(now) {
      resize(canvas, gl);
      state.mx += (state.tx - state.mx) * MOUSE_EASE;
      state.my += (state.ty - state.my) * MOUSE_EASE;
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, still ? STILL_FRAME_TIME : now / 1000);
      gl.uniform2f(u.mouse, state.mx, state.my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add('is-live');
    }
    function loop(now) {
      draw(now);
      state.raf = state.running ? requestAnimationFrame(loop) : 0;
    }
    function setRunning(run) {
      var shouldRun = run && !still;
      if (shouldRun === state.running) return;
      state.running = shouldRun;
      if (shouldRun && !state.raf) state.raf = requestAnimationFrame(loop);
    }

    draw(performance.now());
    bindEvents(canvas, state, setRunning, draw);
    setRunning(true);
  }

  function bindEvents(canvas, state, setRunning, draw) {
    new IntersectionObserver(function (entries) {
      state.visible = entries[0].isIntersecting;
      setRunning(state.visible && !document.hidden);
    }).observe(canvas);
    document.addEventListener('visibilitychange', function () {
      setRunning(state.visible && !document.hidden);
    });
    window.addEventListener('pointermove', function (e) {
      state.tx = (e.clientX / window.innerWidth) * 2 - 1;
      state.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });
    window.addEventListener('resize', function () { draw(performance.now()); }, { passive: true });
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      setRunning(false);
      canvas.classList.remove('is-live');
    });
  }

  var canvas = document.querySelector('[data-glow]');
  if (!canvas) return;
  try {
    start(canvas);
  } catch (err) {
    console.warn('Afterglow: hero shader unavailable, using CSS fallback.', err);
  }
})();
