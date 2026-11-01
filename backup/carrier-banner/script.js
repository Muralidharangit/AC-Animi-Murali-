(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // Where the vent and the parts sit in each rendered frame, as 0–1 frame coordinates.
  // VENT: every 4 frames from 100, [left x, left y, right x, right y, flow x, flow y].
  // PARTS: every 4 frames from 180, [x, y] for the blower, motor, coil and control board.
  const VENT = [[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.286,0.621,0.772,0.693,0.123,0.335],[0.285,0.621,0.772,0.693,0.123,0.335],[0.284,0.621,0.773,0.693,0.121,0.335],[0.281,0.622,0.775,0.692,0.119,0.335],[0.279,0.623,0.776,0.691,0.117,0.334],[0.276,0.623,0.777,0.691,0.115,0.334],[0.275,0.624,0.778,0.69,0.114,0.334],[0.274,0.624,0.778,0.69,0.113,0.334],[0.27,0.628,0.779,0.686,0.107,0.334],[0.264,0.633,0.78,0.679,0.096,0.334],[0.257,0.639,0.78,0.673,0.083,0.334],[0.252,0.645,0.779,0.666,0.069,0.335],[0.248,0.648,0.776,0.661,0.056,0.335],[0.246,0.651,0.774,0.658,0.045,0.335],[0.245,0.652,0.772,0.657,0.039,0.335],[0.245,0.652,0.771,0.656,0.038,0.335],[0.245,0.651,0.77,0.655,0.034,0.333],[0.244,0.65,0.768,0.654,0.028,0.33],[0.245,0.649,0.764,0.651,0.02,0.326],[0.245,0.647,0.76,0.649,0.012,0.322],[0.246,0.646,0.755,0.646,0.005,0.318],[0.248,0.645,0.752,0.644,-0.002,0.315],[0.249,0.644,0.749,0.643,-0.005,0.312],[0.249,0.644,0.748,0.643,-0.007,0.312],[0.248,0.644,0.748,0.643,-0.009,0.312],[0.246,0.645,0.747,0.642,-0.015,0.311],[0.244,0.645,0.746,0.641,-0.022,0.311],[0.243,0.647,0.744,0.639,-0.031,0.309],[0.242,0.648,0.742,0.637,-0.039,0.308],[0.241,0.65,0.739,0.634,-0.046,0.306],[0.241,0.651,0.737,0.631,-0.052,0.303],[0.241,0.652,0.736,0.628,-0.054,0.3],[0.24,0.654,0.735,0.626,-0.059,0.299],[0.239,0.66,0.73,0.623,-0.071,0.301],[0.239,0.667,0.723,0.619,-0.085,0.305],[0.24,0.673,0.716,0.617,-0.098,0.308],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31],[0.24,0.675,0.712,0.615,-0.102,0.31]];
  const PARTS = [[0.447,0.428,0.724,0.423,0.473,0.331,0.741,0.371],[0.442,0.428,0.729,0.422,0.473,0.322,0.746,0.361],[0.43,0.429,0.742,0.422,0.473,0.299,0.76,0.335],[0.412,0.43,0.759,0.42,0.473,0.267,0.778,0.296],[0.391,0.431,0.778,0.418,0.473,0.231,0.799,0.252],[0.367,0.433,0.796,0.416,0.474,0.195,0.819,0.206],[0.345,0.435,0.812,0.414,0.475,0.162,0.837,0.163],[0.327,0.437,0.823,0.412,0.476,0.136,0.85,0.128],[0.315,0.438,0.83,0.411,0.476,0.119,0.859,0.106],[0.312,0.438,0.832,0.411,0.477,0.115,0.861,0.101],[0.311,0.438,0.831,0.41,0.477,0.115,0.861,0.098],[0.311,0.438,0.829,0.407,0.477,0.117,0.858,0.098],[0.323,0.438,0.815,0.405,0.478,0.14,0.844,0.12],[0.345,0.437,0.793,0.403,0.479,0.178,0.819,0.163],[0.374,0.436,0.768,0.402,0.479,0.226,0.79,0.216],[0.403,0.436,0.744,0.403,0.478,0.274,0.761,0.272],[0.429,0.436,0.726,0.404,0.478,0.314,0.738,0.318],[0.444,0.435,0.715,0.405,0.478,0.339,0.725,0.346],[0.446,0.435,0.714,0.402,0.478,0.342,0.723,0.347]];

  const banner = document.querySelector(".banner");
  const product = document.querySelector(".product");
  const frameCanvas = document.querySelector(".frames");
  const frameContext = frameCanvas.getContext("2d");
  const airCanvas = document.querySelector(".air");
  const airContext = airCanvas.getContext("2d");

  const isPhone = () => window.matchMedia("(max-width: 760px)").matches;
  const PORTRAIT_QUERY = "(max-aspect-ratio: 11/10)";
  const LANDSCAPE_QUERY = "(min-aspect-ratio: 11/10)";
  const isPortrait = () => window.matchMedia(PORTRAIT_QUERY).matches;

  const state = { frame: 0, wind: 0, copy: 0 };
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
    const all = Array.from({ length: FRAME_COUNT }, (_, index) => index);
    const keyframes = all.filter((index) => index % 4 === 0);
    const inBetween = all.filter((index) => index % 4 !== 0);
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

  /* ---------- Cold mist and snow ---------- */

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
        gradient.addColorStop(stop, `rgba(205, 236, 255, ${alpha})`);
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
      airContext.globalAlpha = 0.13 * Math.sin(puff.age * Math.PI) * state.wind;
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
      ? gsap.utils.clamp(0, 1, (y / airHeight - 0.42) / 0.08)
      : gsap.utils.clamp(0, 1, (x / airWidth - 0.34) / 0.1);
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
    drawMist(vent);
    drawSnow(time, ratio, vent, unit);
    airContext.globalAlpha = 1;
  }

  /* ---------- Sizing ---------- */

  let layoutWidth = 0;

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
    airWidth = banner.clientWidth;
    airHeight = banner.clientHeight;
    const airDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    airCanvas.width = airWidth * airDpr;
    airCanvas.height = airHeight * airDpr;
    airContext.setTransform(airDpr, 0, 0, airDpr, 0, 0);
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

  function buildStory(portrait) {
    const brand = document.querySelector(".brand");
    const progressFill = document.querySelector(".progress-fill");
    const skip = document.querySelector(".skip");
    Object.assign(state, { frame: 0, wind: 0, copy: 0 });
    Object.assign(camera, { scale: 1, x: 0, y: 0 });
    const cornerWidth = () => gsap.utils.clamp(84, 110, window.innerWidth * 0.09);
    const cornerGutter = () => gsap.utils.clamp(20, 72, window.innerWidth * 0.046);

    gsap.set(frameCanvas, { autoAlpha: 0 });
    gsap.set([".part-label", ".bracket", ".finale-item"], { autoAlpha: 0 });

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: banner,
        start: "top top",
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
    timeline.to(".brand-halo", { autoAlpha: 0, duration: 3 }, 1);
    timeline.to(brand, {
      x: () => cornerGutter() - brand.offsetLeft,
      y: () => 18 - brand.offsetTop,
      scale: () => cornerWidth() / brand.offsetWidth,
      duration: 8,
      ease: "power2.inOut",
    }, 1);
    timeline.to(frameCanvas, { autoAlpha: 1, duration: 3 }, 6);
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
    timeline.to(".shade", { opacity: 1, duration: 5 }, 49);
    caption(timeline, "core", 51, 70);
    timeline.to(".part-label", { autoAlpha: 1, duration: 1.5, stagger: 0.5 }, 60);
    timeline.to(".part-label", { autoAlpha: 0, duration: 1.2 }, 67.5);
    if (portrait) {
      timeline.fromTo(camera, { scale: 1 }, { scale: 0.7, duration: 7, ease: "power1.inOut", immediateRender: false }, 55);
      timeline.fromTo(camera, { scale: 0.7 }, { scale: 1, duration: 6, ease: "power1.inOut", immediateRender: false }, 69);
    }

    // Reassembly: everything closes and the unit turns towards the content.
    timeline.addLabel("reassembly", 66);
    playFrames(timeline, 222, 268, 66, 78);
    timeline.to(".shade", { opacity: 0.35, duration: 6 }, 70);

    // Showcase: the unit moves right, the content arrives on the left.
    timeline.addLabel("showcase", 78);
    playFrames(timeline, 268, 299, 78, 91);
    if (portrait) {
      timeline.fromTo(camera, { y: 0 }, { y: 0.12, duration: 8, ease: "power2.inOut", immediateRender: false }, 77);
    } else {
      timeline.fromTo(camera, { scale: 1, x: 0 }, { scale: 0.86, x: () => Math.min(0.2, (product.offsetWidth * 0.24) / window.innerWidth), duration: 10, ease: "power2.inOut", immediateRender: false }, 76);
    }
    timeline.fromTo(".finale-item",
      { autoAlpha: 0, y: 30 },
      { autoAlpha: 1, y: 0, duration: 3, ease: "power2.out", stagger: 0.9 },
      82);
    timeline.to(state, { wind: 1, duration: 5 }, 87);
    timeline.to(state, { copy: 1, duration: 3 }, 82);

    // Pads the timeline to 100 so the last scene holds.
    timeline.set({}, {}, 100);
  }

  function playIntro() {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".brand img", { scale: 0.7, autoAlpha: 0, duration: 0.9, ease: "back.out(1.7)" }, 0.1)
      .fromTo(".brand-halo ellipse", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, 0.1)
      .from(".brand-shine", { autoAlpha: 0, duration: 0.4 }, 0.8)
      .from(".reveal", { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 0.5);
  }

  function bindPointer() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const turnY = gsap.quickTo(product, "rotationY", { duration: 1, ease: "power3.out" });
    const turnX = gsap.quickTo(product, "rotationX", { duration: 1, ease: "power3.out" });
    window.addEventListener("pointermove", (event) => {
      turnY((event.clientX / window.innerWidth - 0.5) * 6);
      turnX((event.clientY / window.innerHeight - 0.5) * -4);
    }, { passive: true });
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
    layout();
    createAir();
    const labels = [...document.querySelectorAll(".part-label")];
    // Rebuilds the whole story when the layout flips, such as when a phone is rotated.
    gsap.matchMedia().add({ portrait: PORTRAIT_QUERY, landscape: LANDSCAPE_QUERY }, (context) => {
      buildStory(context.conditions.portrait);
    });
    bindPointer();
    bindButtons();
    playIntro();
    ScrollTrigger.refresh();
    loadFrames();

    gsap.ticker.add((time) => {
      drawFrame();
      gsap.set(product, {
        scale: camera.scale,
        x: camera.x * airWidth,
        y: camera.y * airHeight,
      });
      if (state.frame >= 180 && state.frame <= 252) {
        const points = anchorAt(PARTS, 180, 4, state.frame);
        labels.forEach((element, index) => {
          const point = frameToScreen(points[index * 2], points[index * 2 + 1]);
          gsap.set(element, { x: point.x, y: point.y });
        });
      }
      drawAir(time, gsap.ticker.deltaRatio(60));
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(layout, 120);
    }, { passive: true });
  }

  start();
})();
