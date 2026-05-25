/**
 * Water – full-screen WebGL water-ripple background.
 *
 * API:
 *   const water = new Water(canvasEl, { baseA, baseB, accent });
 *   water.setColors({ accent: '#7B6CF6' });   // runtime retint
 *   water.destroy();                           // full cleanup
 *
 * Canvas should be pointer-events:none.
 * All input listeners attach to `window` so the page stays interactive.
 */
export class Water {
  constructor(canvas, colors = {}) {
    this.canvas = canvas;
    this.colors = {
      baseA:  colors.baseA  ?? '#02030A',
      baseB:  colors.baseB  ?? '#0A1228',
      accent: colors.accent ?? '#1a3a6a',
    };
    this._drops   = Array.from({ length: 16 }, () => ({ x: 0, y: 0, age: 9 }));
    this._dropIdx = 0;
    this._mouse   = { x: 0.5, y: 0.5 };
    this._press   = 0;
    this._start   = performance.now();
    this._last    = this._start;

    this._initGL();
    if (!this.gl) return;
    this._initListeners();
    this._raf = requestAnimationFrame(this._loop.bind(this));
  }

  /* ─── Public ─────────────────────────────────────── */
  setColors(next = {}) {
    Object.assign(this.colors, next);
    this._uploadColors();
  }

  destroy() {
    cancelAnimationFrame(this._raf);
    const evts = ['pointermove','pointerdown','pointerup','wheel',
                  'touchstart','touchmove','touchend','resize'];
    evts.forEach(ev => window.removeEventListener(ev, this['_ev_' + ev]));
    const gl = this.gl;
    if (gl && !gl.isContextLost()) {
      gl.deleteProgram(this._prog);
      gl.deleteBuffer(this._buf);
    }
  }

  /* ─── WebGL setup ─────────────────────────────────── */
  _initGL() {
    const gl = this.canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) { console.error('[Water] WebGL unavailable'); return; }
    this.gl = gl;

    /* ── Vertex shader ── */
    const vert = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }
    `;

    /* ── Fragment shader ── */
    const frag = `
precision highp float;
#define N 16

uniform float  uT;
uniform vec2   uRes;
uniform vec2   uMouse;
uniform float  uPress;
uniform vec3   uBaseA;
uniform vec3   uBaseB;
uniform vec3   uAccent;
uniform vec2   uDrops[N];
uniform float  uDropAge[N];

/* ── Noise ── */
float hash(vec2 p){ p=fract(p*vec2(127.1,311.7)); p+=dot(p,p+17.5); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0, a=0.52;
  for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(3.1,1.7);a*=0.5;}
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  /* aspect-correct centred coords */
  vec2 q  = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;

  float t  = uT * 0.14;
  float n  = fbm(uv*3.5 + vec2(t*.8, t));
  float n2 = fbm(uv*7.0 - vec2(t*.4, t*1.2));
  float vig = 1.0 - smoothstep(0.3, 1.2, length(q));

  vec3 col = mix(uBaseA, uBaseB, (n*0.55 + n2*0.3)*vig);

  /* ── Ripple rings ── */
  float disp = 0.0;
  for(int i=0;i<N;i++){
    float age = uDropAge[i];
    if(age > 1.5) continue;
    vec2 dc = uv - uDrops[i];
    dc.x *= uRes.x / uRes.y;
    float d   = length(dc);
    float r   = age * 0.5;
    float ring = exp(-pow((d-r)/0.013, 2.0)) * (1.0 - smoothstep(0.0,1.5,age));
    disp += ring;
  }
  col = mix(col, col + uAccent*disp, 0.8);

  /* ── Mouse glow ── */
  vec2 mc = uv - uMouse; mc.x *= uRes.x/uRes.y;
  float gl_val = exp(-length(mc)*9.0) * 0.14 * uPress;
  col += uBaseB * gl_val;

  /* ── Surface shimmer ── */
  float sh = sin(uv.x*45.0+t*9.0)*sin(uv.y*38.0-t*7.0)*0.018;
  col += vec3(sh*0.4, sh*0.6, sh);

  col *= 0.82 + 0.18*vig;
  gl_FragColor = vec4(clamp(col,0.0,1.0), 1.0);
}
    `;

    const compile = (src, type) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error('[Water shader]', gl.getShaderInfoLog(s));
      return s;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(vert, gl.VERTEX_SHADER));
    gl.attachShader(prog, compile(frag, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      console.error('[Water program]', gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    this._prog = prog;

    /* Fullscreen quad */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    this._buf = buf;
    const aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    /* Uniform locations */
    this._u = {
      T:      gl.getUniformLocation(prog, 'uT'),
      res:    gl.getUniformLocation(prog, 'uRes'),
      mouse:  gl.getUniformLocation(prog, 'uMouse'),
      press:  gl.getUniformLocation(prog, 'uPress'),
      baseA:  gl.getUniformLocation(prog, 'uBaseA'),
      baseB:  gl.getUniformLocation(prog, 'uBaseB'),
      accent: gl.getUniformLocation(prog, 'uAccent'),
      drops:  Array.from({length:16},(_,i)=>gl.getUniformLocation(prog,`uDrops[${i}]`)),
      ages:   Array.from({length:16},(_,i)=>gl.getUniformLocation(prog,`uDropAge[${i}]`)),
    };

    this._uploadColors();
    this._resize();
  }

  _hex3(hex) {
    return [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255);
  }
  _uploadColors() {
    const gl = this.gl; if (!gl) return;
    gl.uniform3fv(this._u.baseA,  this._hex3(this.colors.baseA));
    gl.uniform3fv(this._u.baseB,  this._hex3(this.colors.baseB));
    gl.uniform3fv(this._u.accent, this._hex3(this.colors.accent));
  }
  _resize() {
    const c = this.canvas;
    c.width  = Math.round(c.clientWidth  * Math.min(devicePixelRatio, 2));
    c.height = Math.round(c.clientHeight * Math.min(devicePixelRatio, 2));
    this.gl.viewport(0, 0, c.width, c.height);
    this.gl.uniform2f(this._u.res, c.width, c.height);
  }

  /* ─── Events ─────────────────────────────────────── */
  _initListeners() {
    const spawn = (cx, cy) => {
      const d = this._drops[this._dropIdx];
      d.x = cx / window.innerWidth;
      d.y = 1 - cy / window.innerHeight;
      d.age = 0;
      this._dropIdx = (this._dropIdx + 1) % 16;
    };

    this._ev_pointermove = e => {
      this._mouse.x = e.clientX / window.innerWidth;
      this._mouse.y = 1 - e.clientY / window.innerHeight;
    };
    this._ev_pointerdown = e => { spawn(e.clientX, e.clientY); this._press = 1; };
    this._ev_pointerup   = () => { this._press = 0; };
    this._ev_wheel       = e => { spawn(this._mouse.x * window.innerWidth, (1-this._mouse.y)*window.innerHeight); };
    this._ev_touchstart  = e => { const t=e.touches[0]; spawn(t.clientX,t.clientY); this._press=1; };
    this._ev_touchmove   = e => { const t=e.touches[0];
      this._mouse.x = t.clientX/window.innerWidth;
      this._mouse.y = 1-t.clientY/window.innerHeight;
    };
    this._ev_touchend    = () => { this._press = 0; };
    this._ev_resize      = () => this._resize();

    window.addEventListener('pointermove', this._ev_pointermove, { passive:true });
    window.addEventListener('pointerdown', this._ev_pointerdown, { passive:true });
    window.addEventListener('pointerup',   this._ev_pointerup,   { passive:true });
    window.addEventListener('wheel',       this._ev_wheel,       { passive:true });
    window.addEventListener('touchstart',  this._ev_touchstart,  { passive:true });
    window.addEventListener('touchmove',   this._ev_touchmove,   { passive:true });
    window.addEventListener('touchend',    this._ev_touchend,    { passive:true });
    window.addEventListener('resize',      this._ev_resize,      { passive:true });
  }

  /* ─── Render loop ─────────────────────────────────── */
  _loop(now) {
    this._raf = requestAnimationFrame(this._loop.bind(this));
    const dt = Math.min((now - this._last) / 1000, 0.05);
    this._last = now;
    const gl = this.gl;

    /* advance drop ages */
    this._drops.forEach(d => { if (d.age < 2) d.age += dt / 1.8; });
    /* decay press */
    this._press *= Math.pow(0.88, dt * 60);

    const elapsed = (now - this._start) / 1000;
    gl.uniform1f(this._u.T,     elapsed);
    gl.uniform2f(this._u.mouse, this._mouse.x, this._mouse.y);
    gl.uniform1f(this._u.press, this._press);

    this._drops.forEach((d, i) => {
      gl.uniform2f(this._u.drops[i], d.x, d.y);
      gl.uniform1f(this._u.ages[i],  d.age);
    });

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
