(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header menu, needed even on the static page ---------- */

  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

  function setMenu(open) {
    siteNav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  menuToggle.addEventListener("click", () => setMenu(!siteNav.classList.contains("is-open")));
  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  window.addEventListener("scroll", () => setMenu(false), { passive: true });

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    if (!reducedMotion) console.error("GSAP could not be loaded; showing the static banner.");
    root.classList.remove("js");
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const FRAME_COUNT = 300;
  const LAST_FRAME = FRAME_COUNT - 1;
  const FRAME_RATIO = 1146 / 2200;
  // The closed unit in the last frame, as 0–1 frame coordinates.
  const FINAL_UNIT = { left: 0.19, top: 0.256, right: 0.835, bottom: 0.715 };

  // Where the vent and the parts sit in each rendered frame, as 0–1 frame coordinates.
  // VENT: every 4 frames from 100, [left x, left y, right x, right y, flow x, flow y].
  // PARTS: every 4 frames from 180, [x, y] for the blower, motor, coil and control board.
  // CAMERA: every 4 frames from 150, [yaw, pitch, scale, explode] of the rendered camera.
  const VENT = [[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.285,0.621,0.772,0.693,0.123,0.335],[0.284,0.621,0.773,0.693,0.121,0.335],[0.281,0.622,0.775,0.692,0.119,0.335],[0.279,0.623,0.776,0.691,0.117,0.334],[0.276,0.623,0.777,0.691,0.115,0.334],[0.275,0.624,0.778,0.69,0.114,0.334],[0.274,0.624,0.778,0.69,0.113,0.334],[0.27,0.628,0.779,0.686,0.107,0.334],[0.264,0.633,0.78,0.679,0.096,0.334],[0.257,0.639,0.78,0.673,0.083,0.334],[0.252,0.645,0.779,0.666,0.069,0.335],[0.248,0.648,0.776,0.661,0.056,0.335],[0.246,0.651,0.774,0.658,0.045,0.335],[0.245,0.652,0.772,0.657,0.039,0.335],[0.245,0.652,0.771,0.656,0.038,0.335],[0.245,0.651,0.77,0.655,0.034,0.333],[0.244,0.65,0.768,0.654,0.028,0.33],[0.245,0.649,0.764,0.651,0.02,0.326],[0.245,0.647,0.76,0.649,0.012,0.322],[0.246,0.646,0.755,0.646,0.005,0.318],[0.248,0.645,0.752,0.644,-0.002,0.315],[0.249,0.644,0.749,0.643,-0.005,0.312],[0.249,0.644,0.748,0.643,-0.007,0.312],[0.248,0.644,0.748,0.643,-0.009,0.312],[0.246,0.645,0.747,0.642,-0.015,0.311],[0.244,0.645,0.746,0.641,-0.022,0.311],[0.243,0.647,0.744,0.639,-0.031,0.309],[0.242,0.648,0.742,0.637,-0.039,0.308],[0.241,0.65,0.739,0.634,-0.046,0.306],[0.241,0.651,0.737,0.631,-0.052,0.303],[0.241,0.652,0.736,0.628,-0.054,0.3],[0.24,0.654,0.735,0.626,-0.059,0.299],[0.239,0.66,0.73,0.623,-0.071,0.301],[0.239,0.667,0.723,0.619,-0.085,0.305],[0.24,0.673,0.716,0.617,-0.098,0.308],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31]];
  const PARTS = [[0.447,0.428,0.724,0.423,0.473,0.331,0.741,0.371],[0.442,0.428,0.729,0.422,0.473,0.322,0.746,0.361],[0.43,0.429,0.742,0.422,0.473,0.299,0.76,0.335],[0.412,0.43,0.759,0.42,0.473,0.267,0.778,0.296],[0.391,0.431,0.778,0.418,0.473,0.231,0.799,0.252],[0.367,0.433,0.796,0.416,0.474,0.195,0.819,0.206],[0.345,0.435,0.812,0.414,0.475,0.162,0.837,0.163],[0.327,0.437,0.823,0.412,0.476,0.136,0.85,0.128],[0.315,0.438,0.83,0.411,0.476,0.119,0.859,0.106],[0.312,0.438,0.832,0.411,0.477,0.115,0.861,0.101],[0.311,0.438,0.831,0.41,0.477,0.115,0.861,0.098],[0.311,0.438,0.829,0.407,0.477,0.117,0.858,0.098],[0.323,0.438,0.815,0.405,0.478,0.14,0.844,0.12],[0.345,0.437,0.793,0.403,0.479,0.178,0.819,0.163],[0.374,0.436,0.768,0.402,0.479,0.226,0.79,0.216],[0.403,0.436,0.744,0.403,0.478,0.274,0.761,0.272],[0.429,0.436,0.726,0.404,0.478,0.314,0.738,0.318],[0.444,0.435,0.715,0.405,0.478,0.339,0.725,0.346],[0.446,0.435,0.714,0.402,0.478,0.342,0.723,0.347]];
  const CAMERA = [[-0.5411,-0.1396,1.1,0],[-0.5261,-0.1359,1.0957,0],[-0.4865,-0.126,1.0844,0],[-0.4306,-0.112,1.0684,0],[-0.3665,-0.096,1.05,0],[-0.3024,-0.08,1.0316,0],[-0.2465,-0.066,1.0156,0],[-0.207,-0.0561,1.0043,0],[-0.192,-0.0524,1,0.0094],[-0.1828,-0.0524,0.9972,0.0781],[-0.1584,-0.0524,0.9897,0.1983],[-0.1238,-0.0524,0.979,0.352],[-0.0837,-0.0524,0.9666,0.5214],[-0.043,-0.0524,0.954,0.6886],[-0.0065,-0.0524,0.9428,0.8356],[0.0209,-0.0524,0.9343,0.9446],[0.0343,-0.0524,0.9302,0.9976],[0.0406,-0.0532,0.9307,1],[0.0632,-0.0565,0.9335,1],[0.0983,-0.0621,0.9378,0.9446],[0.1405,-0.0694,0.943,0.8017],[0.1846,-0.078,0.9484,0.6064],[0.2255,-0.0874,0.9534,0.3936],[0.258,-0.0972,0.9574,0.1983],[0.2767,-0.107,0.9597,0.0554],[0.2861,-0.1163,0.9617,0],[0.332,-0.1246,0.973,0],[0.4014,-0.1315,0.99,0],[0.4708,-0.1365,1.007,0],[0.5168,-0.1393,1.0183,0]];

  const header = document.querySelector(".site-header");
  const banner = document.querySelector(".banner");
  const finale = document.querySelector(".finale");
  const product = document.querySelector(".product");
  const frameCanvas = document.querySelector(".frames");
  const frameContext = frameCanvas.getContext("2d");
  const airCanvas = document.querySelector(".air");
  const airContext = airCanvas.getContext("2d");

  const isPhone = () => window.matchMedia("(max-width: 760px)").matches;
  const PORTRAIT_QUERY = "(max-aspect-ratio: 11/10)";
  const LANDSCAPE_QUERY = "(min-aspect-ratio: 11/10)";
  const isPortrait = () => window.matchMedia(PORTRAIT_QUERY).matches;

  const state = { frame: 0, wind: 0, copy: 0, live: 0 };
  const camera = { scale: 1, x: 0, y: 0 };

  /* ---------- Frames ---------- */

  const frames = new Array(FRAME_COUNT);
  let drawnImage = null;

  function framePath(index) {
    return `img/${isPhone() ? "ac3d-mobile" : "ac3d"}/${String(index).padStart(3, "0")}.webp`;
  }

  function loadFrame(index) {
    return new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        const store = () => {
          frames[index] = image;
          resolve();
        };
        image.decode().then(store, store);
      };
      // A missing frame is covered by its nearest neighbour.
      image.onerror = () => {
        console.warn(`Could not load frame ${index}.`);
        resolve();
      };
      image.src = framePath(index);
    });
  }

  async function loadFrames() {
    // Phones keep every second frame: decoded images are heavy and the motion looks the same.
    const step = isPhone() ? 2 : 1;
    const all = Array.from({ length: Math.ceil(FRAME_COUNT / step) }, (_, index) => index * step);
    const keyframes = all.filter((_, position) => position % 4 === 0);
    const inBetween = all.filter((_, position) => position % 4 !== 0);
    const queue = navigator.connection?.saveData ? keyframes : [...keyframes, ...inBetween];
    const worker = async () => {
      while (queue.length) await loadFrame(queue.shift());
    };
    await Promise.all(Array.from({ length: 6 }, worker));
    drawnImage = null;
  }

  function nearestFrame(index) {
    for (let offset = 0; offset < FRAME_COUNT; offset += 1) {
      const image = frames[index - offset] || frames[index + offset];
      if (image) return image;
    }
    return null;
  }

  function drawFrame() {
    const image = nearestFrame(Math.round(state.frame));
    if (!image || image === drawnImage) return;
    drawnImage = image;
    frameContext.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
    frameContext.drawImage(image, 0, 0, frameCanvas.width, frameCanvas.height);
  }

  // Maps a position in the frame (0–1) to the banner, through the camera.
  function frameToScreen(x, y) {
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = product;
    return {
      x: offsetLeft + offsetWidth * (0.5 + (x - 0.5) * camera.scale) + camera.x * airWidth,
      y: offsetTop + offsetHeight * (0.5 + (y - 0.5) * camera.scale) + camera.y * airHeight,
    };
  }

  function anchorAt(table, firstFrame, step, frame) {
    const position = gsap.utils.clamp(0, table.length - 1, (frame - firstFrame) / step);
    const index = Math.min(Math.floor(position), table.length - 2);
    return table[index].map((value, slot) => value + (table[index + 1][slot] - value) * (position - index));
  }

  /* ---------- Airflow: glowing streams of cold air leaving the vent ---------- */

  const AIRFLOW_SHADER = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2 uRes, uLeft, uRight, uFlow;
    uniform float uTime, uStrength, uClip;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float value = 0.0, amplitude = 0.5;
      for (int i = 0; i < 3; i++) {
        value += amplitude * noise(p);
        p = p * 2.1 + vec2(3.1, 1.7);
        amplitude *= 0.5;
      }
      return value / 0.875;
    }
    void main() {
      vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
      vec2 along = uRight - uLeft, offset = p - uLeft;
      float det = along.x * uFlow.y - along.y * uFlow.x;
      float u = (offset.x * uFlow.y - offset.y * uFlow.x) / det;
      float v = (along.x * offset.y - along.y * offset.x) / det;
      float reach = max(v, 0.0);

      // Streams fan out from the vent and sway as they travel.
      float s = (u - 0.5) / (1.0 + reach * 1.2) + 0.5;
      s += sin(reach * 5.0 - uTime * 1.5 + s * 11.0) * 0.016 * reach;
      s += sin(reach * 9.0 - uTime * 2.2 + s * 23.0) * 0.008 * reach;

      float bands = fbm(vec2(s * 15.0, reach * 0.9 - uTime * 0.55));
      float fine = fbm(vec2(s * 46.0, reach * 1.6 - uTime * 0.9));
      float streak = smoothstep(0.3, 0.78, bands * 0.75 + fine * 0.35);
      float hair = pow(1.0 - abs(2.0 * noise(vec2(s * 90.0, reach * 1.2 - uTime * 0.8)) - 1.0), 6.0);
      float sides = smoothstep(0.0, 0.07, s) * smoothstep(1.0, 0.93, s);
      float fade = smoothstep(-0.02, 0.05, v) * exp(-reach * 2.1);
      float light = (0.28 + streak * 1.25 + hair * 0.2) * sides * fade;
      float lip = exp(-abs(v - 0.015) * 38.0) * sides;

      // Sampled from the reference: #077de7 at the edges, #33bafe in the core, #7edffe at the vent.
      vec3 color = mix(vec3(0.03, 0.49, 0.91), vec3(0.2, 0.73, 1.0), smoothstep(0.15, 0.6, light));
      color = mix(color, vec3(0.62, 0.92, 1.0), smoothstep(0.6, 1.25, light));
      color = color * light + vec3(0.49, 0.87, 1.0) * lip * 0.7;
      color *= uStrength * smoothstep(uClip, uClip + uRes.x * 0.07, p.x);
      gl_FragColor = vec4(color, clamp(max(color.r, max(color.g, color.b)), 0.0, 1.0));
    }
  `;

  function createAirflow() {
    const canvas = document.querySelector(".flow");
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    if (!gl) {
      canvas.remove();
      return null;
    }
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, "attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }"));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, AIRFLOW_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.remove();
      return null;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniform = {};
    ["uRes", "uLeft", "uRight", "uFlow", "uTime", "uStrength", "uClip"].forEach((name) => {
      uniform[name] = gl.getUniformLocation(program, name);
    });
    gl.clearColor(0, 0, 0, 0);

    let scale = 1;
    let clean = true;
    canvas.addEventListener("webglcontextlost", () => canvas.remove());

    return {
      get alive() {
        return canvas.isConnected;
      },
      size() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        scale = dpr * (isPhone() ? 0.6 : 0.75);
        canvas.width = Math.max(2, Math.round(banner.clientWidth * scale));
        canvas.height = Math.max(2, Math.round(banner.clientHeight * scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
      },
      clear() {
        if (clean) return;
        gl.clear(gl.COLOR_BUFFER_BIT);
        clean = true;
      },
      render(time, vent, clip) {
        clean = false;
        gl.uniform2f(uniform.uRes, canvas.width, canvas.height);
        gl.uniform2f(uniform.uLeft, vent.left.x * scale, vent.left.y * scale);
        gl.uniform2f(uniform.uRight, (vent.left.x + vent.span.x) * scale, (vent.left.y + vent.span.y) * scale);
        gl.uniform2f(uniform.uFlow, vent.flow.x * scale * 1.7, vent.flow.y * scale * 1.7);
        gl.uniform1f(uniform.uTime, time);
        gl.uniform1f(uniform.uStrength, state.wind);
        gl.uniform1f(uniform.uClip, clip * scale);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
    };
  }

  /* ---------- Live parts: the unit keeps running while it is opened up ---------- */

  const liveCanvas = document.querySelector(".live");
  const live = liveCanvas.getContext("2d");
  let liveClear = true;
  let icePoint;
  let greenPoint;
  let copperGlow;

  const BLOWER = { x: -0.17, y: -0.03, z: 0.03, ex: -0.42, ey: -0.02, ez: 0.24 };
  const MOTOR = { x: 0.7, y: -0.03, z: 0.03, ex: 0.36, ey: 0, ez: 0.26 };
  const COIL = { x: -0.08, y: 0.07, z: -0.02, ex: 0, ey: 0.4, ez: -0.05 };
  const BOARD = { x: 0.74, y: 0.11, z: 0.08, ex: 0.42, ey: 0.44, ez: 0.16 };
  const COIL_TILT = { cos: Math.cos(0.42), sin: Math.sin(0.42) };
  const COIL_ROWS = [-0.144, -0.096, -0.048, 0, 0.048, 0.096, 0.144];
  const BOARD_TRACES = [
    [[-0.12, -0.07], [-0.02, -0.07], [-0.02, -0.005], [0.09, -0.005], [0.09, 0.075]],
    [[-0.12, 0.08], [-0.1, -0.02], [0.05, -0.02], [0.115, -0.075]],
    [[0.02, 0.08], [0.02, 0.03], [0.115, 0.03]],
  ];
  const BOARD_LEDS = [[-0.115, 0.078, 2.6], [-0.092, 0.078, 3.7], [-0.069, 0.078, 5.1], [0.112, -0.076, 1.9]];
  const COIL_SPARKS = Array.from({ length: 18 }, () => ({
    row: Math.floor(Math.random() * COIL_ROWS.length),
    x: (Math.random() - 0.5) * 1.66,
    phase: Math.random() * Math.PI * 2,
    rate: 1.4 + Math.random() * 2.4,
  }));

  function createLive() {
    icePoint = radialSprite(32, "rgba(200, 244, 255, 1)", "rgba(60, 170, 255, 0)");
    greenPoint = radialSprite(32, "rgba(190, 255, 220, 1)", "rgba(40, 230, 150, 0)");
    copperGlow = radialSprite(64, "rgba(255, 176, 96, 0.9)", "rgba(255, 120, 40, 0)");
  }

  function makeCamera(frame) {
    const [yaw, pitch, scale, explode] = anchorAt(CAMERA, 150, 4, frame);
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const nearPlane = 8.79;
    const halfWidth = 1.49;
    const aspect = 2200 / 1146;
    return {
      place(part) {
        return { x: part.x + part.ex * explode, y: part.y + part.ey * explode, z: part.z + part.ez * explode };
      },
      // Projects a point of the 3D model, exactly as the frames were rendered.
      project(x, y, z) {
        const turnedX = cosYaw * x - sinYaw * z;
        const turnedZ = sinYaw * x + cosYaw * z;
        const liftedY = cosPitch * y - sinPitch * turnedZ;
        const liftedZ = sinPitch * y + cosPitch * turnedZ;
        const depth = (nearPlane * scale) / (9 - liftedZ) / halfWidth;
        return frameToScreen((turnedX * depth + 1) / 2, (1 - liftedY * depth * aspect) / 2);
      },
    };
  }

  function strokeBetween(from, to, width, style) {
    live.lineWidth = width;
    live.strokeStyle = style;
    live.beginPath();
    live.moveTo(from.x, from.y);
    live.lineTo(to.x, to.y);
    live.stroke();
  }

  function drawPoint(sprite, point, size, alpha) {
    live.globalAlpha = alpha * state.live;
    live.drawImage(sprite, point.x - size, point.y - size, size * 2, size * 2);
    live.globalAlpha = 1;
  }

  function fillShape(corners, style) {
    live.fillStyle = style;
    live.beginPath();
    corners.forEach((corner, index) => (index ? live.lineTo(corner.x, corner.y) : live.moveTo(corner.x, corner.y)));
    live.closePath();
    live.fill();
  }

  // Blades or bars passing the front of a turning cylinder, each with a short motion trail.
  function drawSpin(view, centre, from, to, radius, count, speed, time, color, width) {
    for (let index = 0; index < count; index += 1) {
      for (let trail = 0; trail < 3; trail += 1) {
        const angle = (index / count) * Math.PI * 2 + time * speed - trail * 0.055;
        const facing = Math.sin(angle);
        if (facing < 0.08) continue;
        const y = centre.y + Math.cos(angle) * radius;
        const z = centre.z + facing * radius;
        strokeBetween(
          view.project(centre.x + from, y, z),
          view.project(centre.x + to, y, z),
          width,
          `rgba(${color}, ${0.8 * facing * (1 - trail / 3) * state.live})`,
        );
      }
    }
  }

  function drawBlower(view, time, unit) {
    const centre = view.place(BLOWER);
    const corners = [[-0.72, 0.13], [0.72, 0.13], [0.72, -0.13], [-0.72, -0.13]]
      .map(([x, y]) => view.project(centre.x + x, centre.y + y, centre.z + 0.05));
    live.globalCompositeOperation = "source-over";
    fillShape(corners, `rgba(8, 28, 70, ${0.42 * state.live})`);
    live.globalCompositeOperation = "lighter";
    drawSpin(view, centre, -0.72, 0.72, 0.13, 30, 6.5, time, "226, 240, 255", 1.6 * unit);
  }

  function drawMotor(view, time, unit) {
    const centre = view.place(MOTOR);
    live.globalCompositeOperation = "lighter";
    const middle = view.project(centre.x, centre.y, centre.z + 0.1);
    const edge = view.project(centre.x, centre.y + 0.15, centre.z + 0.1);
    drawPoint(copperGlow, middle, Math.abs(edge.y - middle.y) * 1.5, 0.2 + 0.1 * Math.sin(time * 16));
    drawSpin(view, centre, -0.112, 0.112, 0.152, 8, 11, time, "255, 236, 214", 2 * unit);
    drawSpin(view, centre, -0.36, -0.03, 0.02, 4, 11, time, "235, 245, 255", 1.6 * unit);
  }

  function drawCoil(view, time, unit) {
    const base = view.place(COIL);
    const point = (x, row) => {
      const y = COIL_TILT.cos * row - COIL_TILT.sin * 0.016;
      const z = COIL_TILT.sin * row + COIL_TILT.cos * 0.016;
      return view.project(base.x + x, base.y + y, base.z + 0.12 + z);
    };
    live.globalCompositeOperation = "lighter";

    // A band of cold sweeping the fins.
    const sweep = -0.9 + ((time * 0.34) % 1) * 1.8;
    const band = [[sweep - 0.09, COIL_ROWS[6] + 0.02], [sweep + 0.09, COIL_ROWS[6] + 0.02], [sweep + 0.09, COIL_ROWS[0] - 0.02], [sweep - 0.09, COIL_ROWS[0] - 0.02]]
      .map(([x, row]) => point(gsap.utils.clamp(-0.86, 0.86, x), row));
    fillShape(band, `rgba(90, 190, 255, ${0.16 * state.live})`);

    // Refrigerant running along the tubes, each row the opposite way to the last.
    COIL_ROWS.forEach((row, rowIndex) => {
      const direction = rowIndex % 2 ? -1 : 1;
      for (let comet = 0; comet < 3; comet += 1) {
        const travel = ((time * 0.3 + comet / 3 + rowIndex * 0.13) % 1) * 1.72;
        const head = direction * (travel - 0.86);
        for (let piece = 0; piece < 4; piece += 1) {
          const start = gsap.utils.clamp(-0.86, 0.86, head - direction * piece * 0.05);
          const end = gsap.utils.clamp(-0.86, 0.86, head - direction * (piece + 1) * 0.05);
          strokeBetween(point(start, row), point(end, row), 2.2 * unit, `rgba(140, 228, 255, ${(0.95 - piece * 0.22) * state.live})`);
        }
        drawPoint(icePoint, point(head, row), 7 * unit, 0.95);
      }
    });

    // Points of frost catching the light.
    for (const spark of COIL_SPARKS) {
      const blink = Math.pow(Math.max(0, Math.sin(time * spark.rate + spark.phase)), 6);
      if (blink > 0.02) drawPoint(icePoint, point(spark.x, COIL_ROWS[spark.row]), 9 * unit, blink);
    }
  }

  function drawBoard(view, time, unit) {
    const base = view.place(BOARD);
    const point = (x, y) => view.project(base.x + x, base.y + y, base.z + 0.002);
    live.globalCompositeOperation = "lighter";

    BOARD_TRACES.forEach((trace, traceIndex) => {
      const pieces = trace.slice(1).map((end, index) => [point(...trace[index]), point(...end)]);
      pieces.forEach(([from, to]) => strokeBetween(from, to, 1.2 * unit, `rgba(120, 225, 255, ${0.38 * state.live})`));
      const lengths = pieces.map(([from, to]) => Math.hypot(to.x - from.x, to.y - from.y));
      const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
      let distance = ((time * 0.55 + traceIndex * 0.31) % 1) * total;
      for (let index = 0; index < pieces.length; index += 1) {
        if (distance <= lengths[index]) {
          const [from, to] = pieces[index];
          const share = distance / (lengths[index] || 1);
          drawPoint(icePoint, { x: from.x + (to.x - from.x) * share, y: from.y + (to.y - from.y) * share }, 6 * unit, 1);
          break;
        }
        distance -= lengths[index];
      }
    });

    BOARD_LEDS.forEach(([x, y, rate]) => {
      const on = Math.sin(time * rate + x * 40) > 0 ? 1 : 0.14;
      drawPoint(greenPoint, point(x, y), 6 * unit, on);
    });
    drawPoint(icePoint, point(-0.06, 0.03), 20 * unit, 0.16 + 0.1 * Math.sin(time * 4.4));
  }

  // Power leaving the board along the cable to the motor.
  function drawCable(view, time, unit) {
    const motor = view.place(MOTOR);
    const board = view.place(BOARD);
    const start = { x: board.x - 0.1, y: board.y - 0.09, z: board.z - 0.01 };
    const end = { x: motor.x + 0.05, y: motor.y + 0.11, z: motor.z - 0.02 };
    const bend = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2 - 0.03,
      z: (start.z + end.z) / 2 - 0.05,
    };
    live.globalCompositeOperation = "lighter";
    for (let pulse = 0; pulse < 4; pulse += 1) {
      const t = (time * 0.8 + pulse / 4) % 1;
      const mix = (key) => (1 - t) * (1 - t) * start[key] + 2 * (1 - t) * t * bend[key] + t * t * end[key];
      drawPoint(icePoint, view.project(mix("x"), mix("y"), mix("z")), 7 * unit, 1);
    }
  }

  function drawLive(time) {
    if (state.live < 0.01) {
      if (!liveClear) live.clearRect(0, 0, airWidth, airHeight);
      liveClear = true;
      return;
    }
    liveClear = false;
    const unit = gsap.utils.clamp(0.6, 1.3, (product.offsetWidth * camera.scale) / 1200);
    const view = makeCamera(state.frame);
    live.clearRect(0, 0, airWidth, airHeight);
    live.lineCap = "round";
    drawBlower(view, time, unit);
    drawCoil(view, time, unit);
    drawBoard(view, time, unit);
    drawCable(view, time, unit);
    drawMotor(view, time, unit);
  }

  /* ---------- Snow, with mist as the fallback where WebGL is missing ---------- */

  const flakes = [];
  const puffs = [];
  let airWidth = 0;
  let airHeight = 0;
  let airClear = true;
  let softSprite;
  let clumpSprites;
  let mistSprite;

  function makeSprite(size, paint) {
    const sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;
    paint(sprite.getContext("2d"), size / 2);
    return sprite;
  }

  function radialSprite(size, inner, outer) {
    return makeSprite(size, (context, centre) => {
      const gradient = context.createRadialGradient(centre, centre, 0, centre, centre, centre);
      gradient.addColorStop(0, inner);
      gradient.addColorStop(1, outer);
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
    });
  }

  function createAir() {
    softSprite = radialSprite(64, "rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0)");
    mistSprite = makeSprite(128, (context, centre) => {
      const gradient = context.createRadialGradient(centre, centre, 0, centre, centre, centre);
      [[0, 0.8], [0.25, 0.56], [0.5, 0.24], [0.75, 0.06], [1, 0]].forEach(([stop, alpha]) => {
        gradient.addColorStop(stop, `rgba(130, 195, 255, ${alpha})`);
      });
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
    });
    // Real flakes read as soft, uneven clumps at this distance, not six-armed crystals.
    clumpSprites = [0, 1, 2].map(() => makeSprite(64, (context, centre) => {
      for (let dot = 0; dot < 9; dot += 1) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * centre * 0.5;
        const radius = centre * (0.2 + Math.random() * 0.26);
        const x = centre + Math.cos(angle) * distance;
        const y = centre + Math.sin(angle) * distance;
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.85)");
        gradient.addColorStop(1, "rgba(235, 247, 255, 0)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, centre * 2, centre * 2);
      }
    }));

    const portrait = isPortrait();
    for (let index = 0; index < (portrait ? 90 : 190); index += 1) {
      const pick = Math.random();
      const layer = pick < 0.5 ? "far" : pick < 0.94 ? "mid" : "near";
      const [depth, minSize, maxSize, opacity] = {
        far: [0.3, 1.2, 2.6, 0.45 + Math.random() * 0.35],
        mid: [0.65, 6, 13, 0.75 + Math.random() * 0.25],
        near: [1, 12, 20, 0.1 + Math.random() * 0.08],
      }[layer];
      flakes.push({
        layer,
        depth,
        opacity,
        size: minSize + Math.random() * (maxSize - minSize),
        phase: Math.random() * Math.PI * 2,
        sway: 0.2 + Math.random() * 0.5,
        rate: 0.6 + Math.random() * 1.1,
        spin: (Math.random() - 0.5) * 0.03,
        angle: Math.random() * Math.PI,
        clump: Math.floor(Math.random() * clumpSprites.length),
      });
    }
    flakes.sort((first, second) => first.depth - second.depth);

    for (let index = 0; index < (portrait ? 18 : 34); index += 1) {
      puffs.push({
        along: Math.random(),
        age: Math.random(),
        rate: 0.0045 + Math.random() * 0.004,
        reach: 0.55 + Math.random() * 0.5,
        size: 0.9 + Math.random() * 0.8,
      });
    }
  }

  // Snow leaves the vent on the moving air, then slows and drifts down; some falls across the whole room.
  function resetFlake(flake, vent, unit, seeding) {
    flake.age = 0;
    if (Math.random() < 0.74) {
      const along = Math.random();
      const lead = 0.1 + Math.random() * 0.08;
      const launch = (2 + Math.random() * 2.6) * unit;
      flake.x = vent.left.x + vent.span.x * along + vent.flow.x * lead;
      flake.y = vent.left.y + vent.span.y * along + vent.flow.y * lead;
      flake.vx = vent.direction.x * launch;
      flake.vy = vent.direction.y * launch;
      flake.wait = seeding ? Math.random() * 170 : 0;
    } else {
      flake.x = Math.random() * airWidth;
      flake.y = seeding ? Math.random() * airHeight : -30;
      flake.vx = 0;
      flake.vy = 0;
      flake.wait = 0;
    }
  }

  function drawMist(vent) {
    airContext.globalCompositeOperation = "screen";
    const angle = Math.atan2(vent.flow.y, vent.flow.x);
    for (const puff of puffs) {
      const x = vent.left.x + vent.span.x * puff.along + vent.flow.x * Math.pow(puff.age, 0.8) * puff.reach;
      const y = vent.left.y + vent.span.y * puff.along + vent.flow.y * Math.pow(puff.age, 0.8) * puff.reach;
      const size = vent.length * (0.16 + puff.age * 0.34) * puff.size;
      airContext.globalAlpha = 0.16 * Math.sin(puff.age * Math.PI) * state.wind;
      airContext.save();
      airContext.translate(x, y);
      airContext.rotate(angle);
      airContext.drawImage(mistSprite, -size, -size * 0.6, size * 2, size * 1.2);
      airContext.restore();
    }
  }

  // Keeps the finale's text and buttons clear of falling snow.
  function clearOfCopy(x, y, portrait) {
    if (state.copy < 0.01) return 1;
    const open = portrait
      ? gsap.utils.clamp(0, 1, (y - (finale.offsetTop + finale.offsetHeight)) / (airHeight * 0.06))
      : gsap.utils.clamp(0, 1, (x - (finale.offsetLeft + finale.offsetWidth)) / (airWidth * 0.05));
    return 1 - state.copy * (1 - open);
  }

  function drawSnow(time, ratio, vent, unit) {
    airContext.globalCompositeOperation = "source-over";
    const portrait = isPortrait();
    const gust = Math.sin(time * 0.31) * 0.32 + Math.sin(time * 0.83) * 0.14;
    for (const flake of flakes) {
      if (flake.wait > 0) {
        flake.wait -= ratio;
        continue;
      }
      const fall = (0.32 + flake.depth * 1.05) * unit;
      const breeze = (gust + vent.direction.x * 0.22) * unit * (0.5 + flake.depth);
      flake.vx += (breeze - flake.vx) * 0.024 * ratio;
      flake.vy += (fall - flake.vy) * 0.024 * ratio;
      flake.x += (flake.vx + Math.sin(time * flake.rate + flake.phase) * flake.sway * unit) * ratio;
      flake.y += flake.vy * ratio;
      flake.angle += flake.spin * ratio;
      flake.age += ratio;

      const melt = gsap.utils.clamp(0, 1, (airHeight - flake.y) / (airHeight * 0.16));
      airContext.globalAlpha = flake.opacity * Math.min(flake.age / 26, 1) * melt * state.wind * clearOfCopy(flake.x, flake.y, portrait);
      const size = flake.size * unit;
      if (flake.layer === "mid") {
        airContext.save();
        airContext.translate(flake.x, flake.y);
        airContext.rotate(flake.angle);
        airContext.drawImage(clumpSprites[flake.clump], -size / 2, -size / 2, size, size);
        airContext.restore();
      } else {
        airContext.drawImage(softSprite, flake.x - size, flake.y - size, size * 2, size * 2);
      }

      if (flake.y > airHeight + 30 || flake.x < -50 || flake.x > airWidth + 50) resetFlake(flake, vent, unit, false);
    }
  }

  function drawAir(time, deltaRatio) {
    if (state.wind < 0.01) {
      if (!airClear) airContext.clearRect(0, 0, airWidth, airHeight);
      airflow?.clear();
      airClear = true;
      return;
    }

    const ratio = Math.min(deltaRatio, 3);
    const unit = gsap.utils.clamp(0.65, 1.25, airWidth / 1440);
    const [leftX, leftY, rightX, rightY, flowX, flowY] = anchorAt(VENT, 100, 4, state.frame);
    const left = frameToScreen(leftX, leftY);
    const right = frameToScreen(rightX, rightY);
    const span = { x: right.x - left.x, y: right.y - left.y };
    const flow = { x: flowX * product.offsetWidth * camera.scale, y: flowY * product.offsetHeight * camera.scale };
    const reach = Math.hypot(flow.x, flow.y) || 1;
    const vent = { left, span, flow, length: Math.hypot(span.x, span.y), direction: { x: flow.x / reach, y: flow.y / reach } };

    if (airClear) flakes.forEach((flake) => resetFlake(flake, vent, unit, true));
    airClear = false;

    airContext.clearRect(0, 0, airWidth, airHeight);
    for (const puff of puffs) {
      puff.age += puff.rate * ratio;
      if (puff.age > 1) {
        puff.age = 0;
        puff.along = Math.random();
      }
    }
    if (airflow?.alive) {
      const copyEdge = isPortrait() ? -1e4 : (finale.offsetLeft + finale.offsetWidth) * state.copy - 1e4 * (1 - state.copy);
      airflow.render(time, vent, copyEdge);
    } else {
      drawMist(vent);
    }
    drawSnow(time, ratio, vent, unit);
    airContext.globalAlpha = 1;
  }

  /* ---------- Sizing ---------- */

  let layoutWidth = 0;
  let airflow = null;

  function layout() {
    const width = product.offsetWidth;
    if (width !== layoutWidth) {
      layoutWidth = width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      frameCanvas.width = Math.round(Math.min(width * dpr, isPhone() ? 1100 : 2200));
      frameCanvas.height = Math.round(frameCanvas.width * FRAME_RATIO);
      frameContext.imageSmoothingQuality = "high";
      drawnImage = null;
    }
    if (banner.clientWidth === airWidth && banner.clientHeight === airHeight) return;
    airWidth = banner.clientWidth;
    airHeight = banner.clientHeight;
    const airDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    airCanvas.width = airWidth * airDpr;
    airCanvas.height = airHeight * airDpr;
    airContext.setTransform(airDpr, 0, 0, airDpr, 0, 0);
    liveCanvas.width = airWidth * airDpr;
    liveCanvas.height = airHeight * airDpr;
    live.setTransform(airDpr, 0, 0, airDpr, 0, 0);
    airflow?.size();
  }

  /* ---------- The scroll story ---------- */

  let storyTrigger;

  function caption(timeline, name, from, to) {
    const element = `[data-caption="${name}"]`;
    timeline.fromTo(element,
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 2, ease: "power2.out" },
      from);
    timeline.to(element, { autoAlpha: 0, y: -20, duration: 1.6, ease: "power1.in" }, to - 1.6);
  }

  function playFrames(timeline, from, to, start, end, ease = "none") {
    timeline.fromTo(state, { frame: from }, { frame: to, duration: end - start, ease, immediateRender: false }, start);
  }

  // Sits the finished unit in the right-hand column, level with the copy on the left.
  function finalPose() {
    const width = product.offsetWidth;
    const height = product.offsetHeight;
    const left = finale.offsetLeft + finale.offsetWidth + gsap.utils.clamp(20, 72, window.innerWidth * 0.05);
    const right = banner.clientWidth - finale.offsetLeft;
    const scale = Math.min(0.96, (right - left) / ((FINAL_UNIT.right - FINAL_UNIT.left) * width));
    const unitWidth = (FINAL_UNIT.right - FINAL_UNIT.left) * width * scale;
    const unitCentreX = (FINAL_UNIT.left + FINAL_UNIT.right) / 2 - 0.5;
    const unitCentreY = (FINAL_UNIT.top + FINAL_UNIT.bottom) / 2 - 0.5;
    return {
      scale,
      x: (right - unitWidth / 2 - (product.offsetLeft + width / 2 + unitCentreX * width * scale)) / banner.clientWidth,
      y: (banner.clientHeight * 0.47 - (product.offsetTop + height / 2 + unitCentreY * height * scale)) / banner.clientHeight,
    };
  }

  function buildStory(portrait) {
    const brand = document.querySelector(".brand");
    const progressFill = document.querySelector(".progress-fill");
    const skip = document.querySelector(".skip");
    Object.assign(state, { frame: 0, wind: 0, copy: 0, live: 0 });
    Object.assign(camera, { scale: 1, x: 0, y: 0 });

    gsap.set(frameCanvas, { autoAlpha: 0 });
    gsap.set([".part-label", ".bracket", ".finale-item"], { autoAlpha: 0 });

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: banner,
        start: () => `top ${header.offsetHeight}px`,
        end: () => `+=${Math.round(window.innerHeight * (isPortrait() ? 7 : 8))}`,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (trigger) => {
          progressFill.style.transform = `scaleX(${trigger.progress})`;
          skip.style.visibility = trigger.progress > 0.9 ? "hidden" : "visible";
        },
      },
    });
    storyTrigger = timeline.scrollTrigger;

    // Hero: the intro clears, the logo settles in the corner, the unit rises.
    timeline.addLabel("hero", 0);
    timeline.to(".intro-copy", { autoAlpha: 0, y: -44, duration: 5, ease: "power1.in" }, 1);
    timeline.to(".scroll-cue", { autoAlpha: 0, duration: 2 }, 0.5);
    timeline.to(".brand-halo", { autoAlpha: 0, duration: 3 }, 1);
    timeline.to(brand, { y: () => -(brand.offsetTop + brand.offsetHeight + 24), autoAlpha: 0, duration: 7, ease: "power2.in" }, 1);
    timeline.to([frameCanvas, ".halo"], { autoAlpha: 1, duration: 3 }, 6);
    playFrames(timeline, 0, 36, 6, 15, "power1.out");
    playFrames(timeline, 36, 46, 15, 23);
    caption(timeline, "hero", 14, 24);

    // Reveal: three-quarter turn inside the cyan brackets.
    timeline.addLabel("reveal", 23);
    playFrames(timeline, 46, 100, 23, 36);
    caption(timeline, "form", 25, 37);
    timeline.fromTo(".bracket",
      { autoAlpha: 0, scale: 1.3 },
      { autoAlpha: 1, scale: 1, duration: 2.5, ease: "power2.out", stagger: 0.25 },
      27);

    // Cooling: the flap opens and cold mist and snow pour out.
    timeline.addLabel("cooling", 36);
    playFrames(timeline, 100, 150, 36, 48);
    caption(timeline, "flow", 38, 48);
    timeline.to(state, { wind: 1, duration: 4 }, 39);
    timeline.to(state, { wind: 0, duration: 2.5 }, 46);
    timeline.to(".bracket", { autoAlpha: 0, duration: 2 }, 47);

    // Technology: the casing turns to glass, then the parts come apart.
    timeline.addLabel("technology", 48);
    playFrames(timeline, 150, 182, 48, 57);
    playFrames(timeline, 182, 222, 57, 66);
    timeline.to(".shade", { opacity: 0.6, duration: 5 }, 49);
    timeline.to(state, { live: 1, duration: 3 }, 52);
    timeline.to(state, { live: 0, duration: 3.5 }, 68.5);
    timeline.to(".halo", { autoAlpha: 0, duration: 4 }, 49);
    caption(timeline, "core", 51, 70);
    timeline.to('[data-caption="core"] p', { autoAlpha: 0, duration: 1.5 }, 58.5);
    timeline.to(".part-label", { autoAlpha: 1, duration: 1.5, stagger: 0.5 }, 60);
    timeline.to(".part-label", { autoAlpha: 0, duration: 1.2 }, 67.5);
    if (portrait) {
      timeline.fromTo(camera, { scale: 1 }, { scale: 0.7, duration: 7, ease: "power1.inOut", immediateRender: false }, 55);
      timeline.fromTo(camera, { scale: 0.7 }, { scale: 1, duration: 6, ease: "power1.inOut", immediateRender: false }, 69);
    }

    // Reassembly: everything closes and the unit turns towards the content.
    timeline.addLabel("reassembly", 66);
    playFrames(timeline, 222, 268, 66, 78);
    timeline.to(".shade", { opacity: 0, duration: 6 }, 70);
    timeline.to(".halo", { autoAlpha: 1, duration: 5 }, 71);

    // Showcase: the unit moves right, the content arrives on the left.
    timeline.addLabel("showcase", 78);
    playFrames(timeline, 268, 299, 78, 91);
    if (portrait) {
      timeline.fromTo(camera, { y: 0 }, { y: 0.14, duration: 8, ease: "power2.inOut", immediateRender: false }, 77);
    } else {
      timeline.fromTo(camera,
        { scale: 1, x: 0, y: 0 },
        { scale: () => finalPose().scale, x: () => finalPose().x, y: () => finalPose().y, duration: 10, ease: "power2.inOut", immediateRender: false },
        76);
    }
    timeline.to(finale, { autoAlpha: 1, duration: 0.1 }, 81.9);
    timeline.fromTo(".finale-item",
      { autoAlpha: 0, y: 30 },
      { autoAlpha: 1, y: 0, duration: 2.5, ease: "power2.out", stagger: 0.7 },
      82);
    timeline.to(state, { wind: 1, duration: 5 }, 87);
    timeline.to(state, { copy: 1, duration: 3 }, 82);

    // Pads the timeline to 100 so the last scene holds.
    timeline.set({}, {}, 100);
  }

  // The three brands take turns: the logo flips and its copy follows. Pauses once the story starts.
  function cycleBrands() {
    const logos = gsap.utils.toArray(".brand-logo");
    const slides = gsap.utils.toArray(".intro-slide");
    let current = 0;
    gsap.set(logos.slice(1), { autoAlpha: 0, rotationY: 90 });

    function next() {
      gsap.delayedCall(4, next);
      if (document.hidden || storyTrigger.progress > 0.01) return;
      const coming = (current + 1) % logos.length;
      gsap.timeline()
        .to(logos[current], { rotationY: -90, autoAlpha: 0, duration: 0.45, ease: "power2.in" })
        .to(slides[current], { autoAlpha: 0, y: -16, duration: 0.45, ease: "power2.in" }, 0)
        .fromTo(logos[coming], { rotationY: 90, autoAlpha: 0 }, { rotationY: 0, autoAlpha: 1, duration: 0.6, ease: "back.out(1.5)" }, 0.45)
        .fromTo(slides[coming], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.5);
      current = coming;
    }
    gsap.delayedCall(4.5, next);
  }

  function playIntro() {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".brand", { scale: 0.7, autoAlpha: 0, duration: 0.9, ease: "back.out(1.7)" }, 0.1)
      .fromTo(".brand-halo ellipse", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, 0.1)
      .from(".brand-shine", { autoAlpha: 0, duration: 0.4 }, 0.8)
      .from(".reveal", { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 0.5);
  }

  function bindPointer() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const turnY = gsap.quickTo(product, "rotationY", { duration: 1, ease: "power3.out" });
    const turnX = gsap.quickTo(product, "rotationX", { duration: 1, ease: "power3.out" });
    let lastX = 0;
    let lastY = 0;
    let flat = false;
    const tilt = () => {
      flat = state.live > 0.01;
      turnY(flat ? 0 : lastX * 6);
      turnX(flat ? 0 : lastY * -4);
    };
    window.addEventListener("pointermove", (event) => {
      lastX = event.clientX / window.innerWidth - 0.5;
      lastY = event.clientY / window.innerHeight - 0.5;
      tilt();
    }, { passive: true });
    // Holds the unit square while the live parts are drawn over it.
    gsap.ticker.add(() => {
      if (flat !== state.live > 0.01) tilt();
    });
  }

  function bindButtons() {
    document.querySelectorAll("[data-top]").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
    document.querySelector(".skip").addEventListener("click", () => {
      window.scrollTo({ top: storyTrigger.end, behavior: "smooth" });
    });
  }

  /* ---------- Start ---------- */

  function start() {
    window.scrollTo(0, 0);
    airflow = createAirflow();
    layout();
    createAir();
    createLive();
    const labels = [...document.querySelectorAll(".part-label")];
    // Rebuilds the whole story when the layout flips, such as when a phone is rotated.
    gsap.matchMedia().add({ portrait: PORTRAIT_QUERY, landscape: LANDSCAPE_QUERY }, (context) => {
      buildStory(context.conditions.portrait);
    });
    bindPointer();
    bindButtons();
    playIntro();
    cycleBrands();
    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    if (document.readyState === "complete") loadFrames();
    else window.addEventListener("load", loadFrames, { once: true });

    let onScreen = true;
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    }).observe(banner);

    const placed = { scale: 1, x: 0, y: 0, width: 0, height: 0 };
    gsap.ticker.add((time) => {
      if (!onScreen) return;
      drawFrame();
      if (camera.scale !== placed.scale || camera.x !== placed.x || camera.y !== placed.y || airWidth !== placed.width || airHeight !== placed.height) {
        Object.assign(placed, camera, { width: airWidth, height: airHeight });
        gsap.set(product, { scale: camera.scale, x: camera.x * airWidth, y: camera.y * airHeight });
      }
      if (state.frame >= 180 && state.frame <= 252) {
        const points = anchorAt(PARTS, 180, 4, state.frame);
        labels.forEach((element, index) => {
          const point = frameToScreen(points[index * 2], points[index * 2 + 1]);
          gsap.set(element, { x: point.x, y: point.y });
        });
      }
      drawLive(time);
      drawAir(time, gsap.ticker.deltaRatio(60));
    });

    // Watches the banner, not the window: a scrollbar appearing narrows it without any resize event.
    new ResizeObserver(layout).observe(banner);
  }

  start();
})();
