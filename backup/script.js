(() => {
  const frameCount = 201;
  const firstFrameIndex = 0;
  const experience = document.querySelector(".ac-experience");
  const sequenceImage = document.querySelector(".frame-sequence");
  const loading = document.querySelector(".frame-loading");
  const loadingMessage = document.querySelector(".loading-message");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!window.gsap || !window.ScrollTrigger) {
    loadingMessage.textContent = "The animation library could not be loaded. Check your internet connection and reload.";
    console.error("GSAP and ScrollTrigger are required to run the scroll experience.");
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const frames = new Array(frameCount);
  let loadedFrames = 0;
  let frameIndex = 0;

  function showFrame(index) {
    const nextFrame = frames[Math.round(index)];
    if (nextFrame && sequenceImage.src !== nextFrame.src) {
      sequenceImage.src = nextFrame.src;
    }
  }

  function setImagePosition(progress) {
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const isCompactMobile = isMobile && window.innerHeight <= 700;
    const start = isMobile
      ? { left: 50, top: 52, width: 98, height: 62 }
      : { left: 50, top: 51, width: 82, height: 80 };
    const end = isMobile
      ? isCompactMobile
        ? { left: 50, top: 36, width: 98, height: 42 }
        : { left: 50, top: 38, width: 98, height: 48 }
      : { left: 71, top: 51, width: 56, height: 78 };
    const interpolate = (from, to) => `${from + (to - from) * progress}%`;

    gsap.set(sequenceImage, {
      left: interpolate(start.left, end.left),
      top: interpolate(start.top, end.top),
      width: interpolate(start.width, end.width),
      height: interpolate(start.height, end.height),
    });
  }

  function loadFrames() {
    const promises = Array.from({ length: frameCount }, (_, index) => new Promise((resolve, reject) => {
      const image = new Image();
      const frameNumber = String(index + 1).padStart(3, "0");
      image.decoding = "async";
      image.onload = () => {
        frames[index] = image;
        loadedFrames += 1;
        loadingMessage.textContent = `Preparing the experience · ${Math.round((loadedFrames / frameCount) * 100)}%`;
        resolve();
      };
      image.onerror = () => reject(new Error(`Unable to load product frame ${frameNumber}.`));
      image.src = `img/3d-transparent/ezgif-frame-${frameNumber}.webp`;
    }));

    return Promise.all(promises);
  }

  function setSceneCounter(value) {
    const current = document.querySelector(".counter-current");
    const sceneNumber = Math.min(5, Math.floor(value * 5) + 1);
    current.textContent = String(sceneNumber).padStart(2, "0");
  }

  function showStaticExperience() {
    frameIndex = frameCount - 1;
    showFrame(frameIndex);
    gsap.set([
      ".hero-copy",
      ".product-card",
      ".scene-copy",
      ".airflow-effects",
      ".tech-callout",
      ".scroll-cue",
      ".feature-card",
    ], { autoAlpha: 0 });
    gsap.set(".intro-stage", { autoAlpha: 0 });
    gsap.set(".final-caption", { autoAlpha: 1, y: 0 });
    setImagePosition(1);
    gsap.set(".corner-frame", { autoAlpha: 0.45 });
    experience.classList.remove("is-intro");
    document.querySelector(".scroll-progress-fill").style.width = "100%";
    document.querySelector(".counter-current").textContent = "05";
    loading.classList.add("is-hidden");
  }

  function createScrollExperience() {
    frameIndex = firstFrameIndex;
    showFrame(frameIndex);
    const imageTravel = { progress: 0 };
    gsap.set(sequenceImage, { autoAlpha: 0 });
    gsap.set([
      ".hero-copy",
      ".product-card",
      ".scene-copy",
      ".airflow-effects",
      ".tech-callout",
      ".feature-card",
      ".final-caption",
      ".corner-frame",
    ], { autoAlpha: 0 });
    gsap.set(".intro-stage", { autoAlpha: 1 });
    experience.classList.remove("is-intro");

    if (reducedMotion.matches) {
      showStaticExperience();
      return;
    }

    const scope = gsap.context(() => {
      const progressFill = document.querySelector(".scroll-progress-fill");
      const master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: experience,
          start: "top top",
          end: () => {
            const scrollLength = window.innerWidth <= 760
              ? 4
              : window.innerWidth <= 1100 ? 5 : 6;
            return `+=${Math.round(window.innerHeight * scrollLength)}`;
          },
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (trigger) => {
            progressFill.style.width = `${trigger.progress * 100}%`;
            setSceneCounter(trigger.progress);
          },
        },
      });

      master.to({ frame: firstFrameIndex }, {
        frame: frameCount - 1,
        duration: 82,
        onUpdate() {
          frameIndex = Math.round(this.targets()[0].frame);
          showFrame(frameIndex);
        },
      }, 8);

      master.to(".intro-stage", {
        autoAlpha: 0,
        y: -18,
        duration: 9,
      }, 0);
      master.to(sequenceImage, {
        autoAlpha: 1,
        duration: 2,
      }, 6);
      master.to(imageTravel, {
        progress: 1,
        duration: 54,
        onUpdate() {
          setImagePosition(imageTravel.progress);
        },
      }, 38);
      master.to([".hero-copy", ".product-card"], {
        autoAlpha: 0,
        y: -10,
        duration: 5,
      }, 87);
      master.to(".corner-frame", { autoAlpha: 0.45, duration: 5 }, 82);
      master.fromTo(".final-caption",
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 10 },
        91);
    }, experience);

    loading.classList.add("is-hidden");

    let refreshTimeout;
    window.addEventListener("resize", () => {
      window.clearTimeout(refreshTimeout);
      refreshTimeout = window.setTimeout(() => {
        ScrollTrigger.refresh();
        setImagePosition(imageTravel.progress);
      }, 150);
    }, { passive: true });

    window.addEventListener("pagehide", () => {
      scope.revert();
      window.clearTimeout(refreshTimeout);
    }, { once: true });

    ScrollTrigger.refresh();
  }

  loadFrames()
    .then(createScrollExperience)
    .catch((error) => {
      loadingMessage.textContent = error.message;
      console.error("Unable to prepare the product frame sequence.", error);
    });
})();
