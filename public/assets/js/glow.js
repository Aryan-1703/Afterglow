/* Afterglow Spa — hero "afterglow" shader. Raw WebGL (~4 KB) instead of a 3D
   library to keep the page fast for Core Web Vitals. Falls back to CSS gradients.

   Performance budget (this was the main source of scroll jank):
   - renders at ≤ 0.45× CSS pixels — soft gradients upscale invisibly;
   - capped at 30 fps — the drift is slow enough that 60 fps looks identical;
   - 4 noise octaves instead of 5;
   - canvas size is cached via ResizeObserver, so the loop never reads layout;
   - paused while off-screen, while the tab is hidden and until the age gate is passed. */
(function () {
  'use strict';

  var RENDER_SCALE = 0.3;
  var MAX_DPR = 1.5;
  var FRAME_INTERVAL_MS = 1000 / 30;
  var FRAME_SLACK_MS = 2;         // rAF timestamps jitter; without slack a 30 fps cap degrades to ~20 fps
  var MOUSE_EASE = 0.06;          // per rendered frame (30 fps)
  var TIME_OFFSET = 24.0;         // seconds; a pleasing starting point in the noise field
  var STILL_FRAME_TIME = TIME_OFFSET; // time used when reduced motion is on
  var AGE_CONFIRMED_EVENT = 'afterglow:age-confirmed';

  var VERTEX_SRC = [
    'attribute vec2 a_pos;',
    'void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }',
  ].join('\n');

  var FRAGMENT_SRC = [
    // mediump is fp16 on many phones: the hash and a growing time value would band and stutter.
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;',
    'float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }',
    'float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);',
    '  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }',
    'float fbm(vec2 p){ float v=0.0; float a=0.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);',
    '  for(int i=0;i<4;i++){ v+=a*noise(p); p=m*p; a*=0.5; } return v; }',
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
    // Midnight Velvet palette — matches the CSS tokens.
    '  vec3 ink = vec3(0.051,0.031,0.071); vec3 plum = vec3(0.36,0.11,0.40);',
    '  vec3 orchid = vec3(0.86,0.38,0.62); vec3 amber = vec3(1.0,0.58,0.40); vec3 champagne = vec3(1.0,0.84,0.62);',
    '  vec3 col = mix(ink, plum, smoothstep(0.2, 0.75, f));',
    '  col = mix(col, orchid, smoothstep(0.45, 0.9, f) * 0.75);',
    '  col = mix(col, amber, smoothstep(0.5, 1.0, f + length(q)*0.3) * glow);',
    '  col = mix(col, champagne, pow(smoothstep(0.7, 1.15, f + r.x*0.4), 2.0) * glow * 0.7);',
    '  col *= 0.3 + 0.85*glow;',
    '  float shade = smoothstep(-0.3, 0.9, p.x/max(aspect,0.6) + 0.35);',
    '  float shadeAmt = mix(0.8, 0.5, portrait);', // text spans full width on phones
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

  /** Resizes the drawing buffer from cached CSS size — never reads layout inside the loop. */
  function applySize(canvas, gl, cssWidth, cssHeight) {
    var scale = Math.min(window.devicePixelRatio || 1, MAX_DPR) * RENDER_SCALE;
    var w = Math.max(1, Math.round(cssWidth * scale));
    var h = Math.max(1, Math.round(cssHeight * scale));
    if (canvas.width === w && canvas.height === h) return false;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    return true;
  }

  function start(canvas) {
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
    if (!gl) return; // CSS fallback gradient stays visible
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var root = document.documentElement;
    var state = {
      u: createProgram(gl), t0: performance.now(),
      visible: true, unlocked: root.classList.contains('age-ok'), lost: false,
      running: false, raf: 0, last: 0, live: false,
      mx: 0, my: 0, tx: 0, ty: 0,
    };

    function draw(now) {
      state.mx += (state.tx - state.mx) * MOUSE_EASE;
      state.my += (state.ty - state.my) * MOUSE_EASE;
      gl.uniform2f(state.u.res, canvas.width, canvas.height);
      // Time counts from page start (kept small for float precision), not from navigation start.
      gl.uniform1f(state.u.time, still ? STILL_FRAME_TIME : TIME_OFFSET + (now - state.t0) / 1000);
      gl.uniform2f(state.u.mouse, state.mx, state.my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!state.live) {
        state.live = true;
        canvas.classList.add('is-live');
      }
    }
    function loop(now) {
      state.raf = 0;
      if (!state.running) return;
      var elapsed = now - state.last;
      if (state.last === 0 || elapsed >= FRAME_INTERVAL_MS - FRAME_SLACK_MS) {
        // Drift-corrected: carry the remainder so frames land on an even 30 fps cadence.
        state.last = state.last === 0 ? now : now - (elapsed % FRAME_INTERVAL_MS);
        draw(now);
      }
      state.raf = requestAnimationFrame(loop);
    }
    function sync() {
      var shouldRun = !still && !state.lost && state.unlocked && state.visible && !document.hidden;
      if (shouldRun && !state.running) state.last = 0; // resume on the next frame, no catch-up
      state.running = shouldRun;
      if (shouldRun && !state.raf) state.raf = requestAnimationFrame(loop);
    }

    var rect = canvas.getBoundingClientRect();
    applySize(canvas, gl, rect.width, rect.height);
    draw(performance.now()); // one still frame right away (also shown behind the age gate)
    bindEvents(canvas, gl, state, sync, draw);
    sync();
  }

  function bindEvents(canvas, gl, state, sync, draw) {
    new IntersectionObserver(function (entries) {
      state.visible = entries[0].isIntersecting;
      sync();
    }).observe(canvas);
    new ResizeObserver(function (entries) {
      var box = entries[0].contentRect;
      // Resizing clears the buffer: redraw at once so there is never a blank frame.
      if (applySize(canvas, gl, box.width, box.height) && !state.lost) draw(performance.now());
    }).observe(canvas);
    document.addEventListener('visibilitychange', sync);
    document.addEventListener(AGE_CONFIRMED_EVENT, function () {
      state.unlocked = true;
      sync();
    });
    window.addEventListener('pointermove', function (e) {
      state.tx = (e.clientX / window.innerWidth) * 2 - 1;
      state.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault(); // allows the browser to restore the context later
      state.lost = true;
      state.live = false;
      sync();
      canvas.classList.remove('is-live');
    });
    canvas.addEventListener('webglcontextrestored', function () {
      try {
        state.u = createProgram(gl);
      } catch (err) {
        console.warn('Afterglow: could not restore the hero shader; keeping the CSS fallback.', err);
        return;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      state.lost = false;
      draw(performance.now());
      sync();
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
