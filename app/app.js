(() => {
  const root = document.documentElement;
  const languageButton = document.querySelector('#langue');
  const savedLanguage = (() => {
    try { return localStorage.getItem('portsamaree-language'); }
    catch { return null; }
  })();
  let language = savedLanguage || (navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr');

  function setLanguage(next) {
    language = next;
    root.lang = language;
    document.querySelectorAll('[data-fr][data-en]').forEach((element) => {
      const value = element.dataset[language];
      if (value !== undefined) element.innerHTML = value;
    });
    document.querySelectorAll('img[data-fr-src][data-en-src]').forEach((image) => {
      image.src = image.dataset[`${language}Src`];
      image.alt = image.dataset[`${language}Alt`] || image.alt;
    });
    document.querySelectorAll('[data-fr-label][data-en-label]').forEach((element) => {
      element.setAttribute('aria-label', element.dataset[`${language}Label`]);
    });
    document.querySelectorAll('[data-time]').forEach((element) => {
      const [hours, minutes] = element.dataset.time.split(':');
      element.textContent = language === 'fr' ? `${hours} h ${minutes}` : `${hours}:${minutes}`;
    });
    document.querySelectorAll('[data-hour][data-kind]').forEach((element) => {
      const hour = element.dataset.hour;
      const kind = language === 'fr'
        ? (element.dataset.kind === 'low' ? 'BM' : 'PM')
        : (element.dataset.kind === 'low' ? 'LW' : 'HW');
      element.textContent = language === 'fr' ? `${hour} h 00 · ${kind}` : `${hour}:00 · ${kind}`;
    });
    document.querySelector('#heure-acces').setAttribute('aria-label', language === 'fr'
      ? 'Faire défiler l’heure de minuit à 23 h 55'
      : 'Scrub the time from midnight to 23:55');
    document.querySelector('#heure-quille').setAttribute('aria-label', language === 'fr'
      ? 'Faire défiler le cycle de marée de 0 à 24 heures'
      : 'Scrub through the 24-hour tide cycle');
    document.querySelector('#sonde-quille').setAttribute('aria-label', language === 'fr'
      ? 'Ajuster la sonde de 0,60 à 2,40 mètres'
      : 'Adjust the sounding from 0.60 to 2.40 metres');
    languageButton.textContent = language === 'fr' ? 'EN' : 'FR';
    languageButton.setAttribute('aria-label', language === 'fr' ? 'Switch to English' : 'Passer en français');
    document.title = language === 'fr'
      ? 'Ports à marée — Savoir quand on passe'
      : 'Tidal Harbours — Know when you can pass';
    document.querySelector('meta[name="description"]').content = language === 'fr'
      ? 'Ports à marée réunit les horaires d’accès et les marées des ports situés en France, en Belgique, aux Pays-Bas et dans les îles Anglo-Normandes.'
      : 'Tidal Harbours brings port access times and local tides together for France, Belgium, the Netherlands and the Channel Islands.';
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = language === 'fr'
      ? 'Horaires d’accès et marées des ports en France, en Belgique, aux Pays-Bas et dans les îles Anglo-Normandes.'
      : 'Port access times and local tides for France, Belgium, the Netherlands and the Channel Islands.';
    try { localStorage.setItem('portsamaree-language', language); }
    catch { /* Language selection remains available for this page view. */ }
    updateAccess();
    updateKeel();
  }

  languageButton.addEventListener('click', () => setLanguage(language === 'fr' ? 'en' : 'fr'));
  document.querySelector('#annee').textContent = new Date().getFullYear();

  // The time wheel follows the app's 24-hour time selector. These two access windows
  // mirror the published-hours layout; this is a fixed illustration, not live port data.
  const accessSlider = document.querySelector('#heure-acces');
  const accessTime = document.querySelector('[data-access-time]');
  const accessOutput = document.querySelector('[data-access-output]');
  const accessStatus = document.querySelector('[data-access-status]');
  const accessResult = document.querySelector('[data-access-result]');
  const accessCursor = document.querySelector('[data-access-cursor]');
  const accessTimeNeighbors = [...document.querySelectorAll('.access-demo .app-time-wheel > span')];
  const accessWindows = [{ start: 5 * 60 + 14, end: 10 * 60 + 14 }, { start: 17 * 60 + 31, end: 22 * 60 + 31 }];
  const totalMinutes = 24 * 60;

  function clockLabel(hour, minute) {
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    return language === 'fr' ? `${h}h${m}` : `${h}:${m}`;
  }

  function updateAccess() {
    const absolute = Number(accessSlider.value);
    const hour = Math.floor(absolute / 60) % 24;
    const minute = absolute % 60;
    const current = clockLabel(hour, minute);
    accessTime.textContent = current;
    accessOutput.textContent = current;
    accessTimeNeighbors.forEach((neighbor, index) => {
      const offset = (index - 1.5) * 30;
      const minutes = (absolute + offset + 1440) % 1440;
      neighbor.textContent = clockLabel(Math.floor(minutes / 60), minutes % 60);
    });
    accessCursor.style.left = `${(absolute / totalMinutes) * 100}%`;

    accessStatus.classList.remove('status-before', 'status-open', 'status-closed');
    const activeWindow = accessWindows.find((window) => absolute >= window.start && absolute < window.end);
    const nextWindow = accessWindows.find((window) => absolute < window.start);
    if (activeWindow) {
      accessStatus.classList.add('status-open');
      accessStatus.textContent = language === 'fr' ? 'OUVERT' : 'OPEN';
      accessResult.textContent = language === 'fr'
        ? `Franchissable jusqu’à ${clockLabel(Math.floor(activeWindow.end / 60), activeWindow.end % 60)}`
        : `Passable until ${clockLabel(Math.floor(activeWindow.end / 60), activeWindow.end % 60)}`;
    } else {
      accessStatus.classList.add('status-closed');
      accessStatus.textContent = language === 'fr' ? 'FERMÉ' : 'CLOSED';
      accessResult.textContent = language === 'fr'
        ? nextWindow
          ? `Prochaine fenêtre à ${clockLabel(Math.floor(nextWindow.start / 60), nextWindow.start % 60)}`
          : 'Prochaine fenêtre demain à 05h14'
        : nextWindow
          ? `Next window at ${clockLabel(Math.floor(nextWindow.start / 60), nextWindow.start % 60)}`
          : 'Next window tomorrow at 05:14';
    }
  }

  accessSlider.addEventListener('input', updateAccess);

  // A small illustrative tide cycle drives the boat, water surface, depth marker and curve.
  // The tide and draught are demo values; visitors can adjust the charted depth themselves.
  const keelSlider = document.querySelector('#heure-quille');
  const keelOutput = document.querySelector('[data-keel-output]');
  const soundingSlider = document.querySelector('#sonde-quille');
  const soundingValue = document.querySelector('[data-sounding-value]');
  const depthWheelOutput = document.querySelector('.app-depth-wheel output');
  const depthLabel = document.querySelector('[data-depth-label]');
  const keelTimeNeighbors = [...document.querySelectorAll('.keel-time-wheel > span')];
  const boat = document.querySelector('[data-boat]');
  const waterFill = document.querySelector('[data-water-fill]');
  const waterline = document.querySelector('[data-waterline]');
  const waterLabel = document.querySelector('[data-water-label]');
  const tideHeight = document.querySelector('[data-tide-height]');
  const keelClearance = document.querySelector('[data-keel-clearance]');
  const boatState = document.querySelector('[data-boat-state]');
  const depthLine = document.querySelector('[data-depth-line]');
  const curve = document.querySelector('[data-tide-curve]');
  const curvePoint = document.querySelector('[data-curve-point]');
  const keelScene = document.querySelector('.keel-scene');
  const draught = 1.5;
  const tidalRange = 1.8;
  const bedY = 218;
  const scale = 26;
  const boatHeight = 60;

  function tidalHeightAt(hour) {
    return tidalRange * (1 - Math.cos((Math.PI * 2 * hour) / 12)) / 2;
  }

  function tideCurvePath() {
    const points = [];
    for (let index = 0; index <= 96; index++) {
      const hour = index / 4;
      const x = hour / 24 * 500;
      const y = 100 - tidalHeightAt(hour) / tidalRange * 78;
      points.push(`${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }

  curve.setAttribute('d', tideCurvePath());

  function updateKeel() {
    const hour = Number(keelSlider.value);
    const water = tidalHeightAt(hour);
    const sounding = Number(soundingSlider.value) / 100;
    soundingValue.textContent = `${sounding.toFixed(2).replace('.', language === 'fr' ? ',' : '.')} m`;
    depthWheelOutput.textContent = sounding.toFixed(2).replace('.', language === 'fr' ? ',' : '.');
    const totalDepth = sounding + water;
    const clearance = totalDepth - draught;
    const waterY = bedY - totalDepth * scale;
    const keelY = bedY - Math.max(0, clearance) * scale;
    const topWave = waterY;
    const wavePath = `M0 ${topWave.toFixed(1)} Q62 ${(topWave - 5).toFixed(1)} 125 ${topWave.toFixed(1)} T250 ${topWave.toFixed(1)} T375 ${topWave.toFixed(1)} T500 ${topWave.toFixed(1)}`;
    const fillPath = `${wavePath} L500 ${bedY} L0 ${bedY} Z`;
    waterFill.setAttribute('d', fillPath);
    waterline.setAttribute('d', wavePath);
    const boatTop = keelY - boatHeight;
    const grounded = clearance < 0;
    boat.setAttribute('transform', grounded
      ? `translate(0 ${boatTop.toFixed(1)}) rotate(5 250 ${boatHeight})`
      : `translate(0 ${boatTop.toFixed(1)})`);
    boat.classList.toggle('state-grounded', grounded);
    boat.classList.toggle('state-floating', !grounded);
    depthLine.setAttribute('y1', waterY.toFixed(1));
    depthLine.setAttribute('y2', bedY.toFixed(1));
    depthLabel.setAttribute('y', Math.min(bedY - 7, Math.max(waterY + 17, waterY + ((bedY - waterY) / 2) + 4)).toFixed(1));

    const surfacePercent = Math.max(17, Math.min(69, waterY / 250 * 100));
    waterLabel.style.top = `${surfacePercent}%`;
    const heightText = language === 'fr' ? `Marée +${water.toFixed(2).replace('.', ',')} m` : `Tide +${water.toFixed(2)} m`;
    waterLabel.textContent = heightText;
    tideHeight.textContent = heightText;

    const h = Math.floor(hour) % 24;
    const m = Math.round((hour - Math.floor(hour)) * 60);
    keelOutput.textContent = clockLabel(h, m);
    keelTimeNeighbors.forEach((neighbor, index) => {
      const offset = (index - 1.5) * 30;
      const minutes = (Math.round(hour * 60) + offset + 1440) % 1440;
      neighbor.textContent = clockLabel(Math.floor(minutes / 60), minutes % 60);
    });
    depthLabel.textContent = `${sounding.toFixed(2).replace('.', language === 'fr' ? ',' : '.')} m`;

    const pointX = hour / 24 * 500;
    const pointY = 100 - water / tidalRange * 78;
    curvePoint.setAttribute('cx', pointX.toFixed(1));
    curvePoint.setAttribute('cy', pointY.toFixed(1));

    if (clearance < 0) {
      boatState.classList.remove('state-floating');
      boatState.classList.add('state-grounded');
      boatState.textContent = language === 'fr' ? 'ÉCHOUÉ' : 'GROUNDED';
      keelClearance.textContent = language === 'fr'
        ? `Manque ${Math.abs(clearance).toFixed(2).replace('.', ',')} m pour flotter`
        : `${Math.abs(clearance).toFixed(2)} m short of floating`;
    } else {
      boatState.classList.remove('state-grounded');
      boatState.classList.add('state-floating');
      boatState.textContent = language === 'fr' ? 'À FLOT' : 'AFLOAT';
      keelClearance.textContent = language === 'fr'
        ? `${clearance.toFixed(2).replace('.', ',')} m sous la quille`
        : `${clearance.toFixed(2)} m under keel`;
    }

    const sceneLabel = language === 'fr'
      ? `${boatState.textContent}, sonde ${sounding.toFixed(2).replace('.', ',')} m, tirant ${draught.toFixed(2).replace('.', ',')} m, marée ${water.toFixed(2).replace('.', ',')} m.`
      : `${boatState.textContent}, sounding ${sounding.toFixed(2)} m, draught ${draught.toFixed(2)} m, tide ${water.toFixed(2)} m.`;
    keelScene.setAttribute('aria-label', sceneLabel);
  }

  keelSlider.addEventListener('input', updateKeel);
  soundingSlider.addEventListener('input', updateKeel);
  document.querySelector('.sound-button').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const note = document.querySelector('#sound-note');
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    note.hidden = !expanded;
  });

  // An automatically advancing story runs while it is visible.
  const storyPlayer = document.querySelector('[data-story-player]');
  const storyFrames = [...document.querySelectorAll('[data-story-frame]')];
  const storyDurations = [3200, 3000, 2300, 2700, 3300];
  let storyStep = 0;
  let storyTimer = null;
  let storyVisible = false;
  const reducedStoryMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showStoryStep(step) {
    storyStep = step;
    storyFrames.forEach((frame, index) => frame.classList.toggle('is-active', index === step));
  }

  function stopStory() {
    window.clearTimeout(storyTimer);
    storyTimer = null;
  }

  function advanceStory() {
    stopStory();
    if (reducedStoryMotion || !storyVisible || document.hidden) return;
    storyTimer = window.setTimeout(() => {
      showStoryStep((storyStep + 1) % storyFrames.length);
      advanceStory();
    }, storyDurations[storyStep]);
  }

  if (!reducedStoryMotion && 'IntersectionObserver' in window) {
    const storyObserver = new IntersectionObserver(([entry]) => {
      storyVisible = entry.isIntersecting;
      if (storyVisible) advanceStory();
      else stopStory();
    }, { threshold: 0.2 });
    storyObserver.observe(storyPlayer);
    document.addEventListener('visibilitychange', advanceStory);
  } else if (!reducedStoryMotion) {
    storyVisible = true;
    advanceStory();
  }
  showStoryStep(0);
  updateAccess();
  updateKeel();

  // Reveal on scroll, with no motion at all when the visitor requests reduced motion.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('js-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }

  setLanguage(language);
})();
