/* =========================================================
   FocusFlow — script.js
   Habit tracker, goal generator, form validation, UI polish
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------
     Navbar: shadow + condensed state on scroll
  --------------------------------------------------- */
  const nav = document.getElementById('mainNav');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrolled = window.scrollY > 24;
    nav.classList.toggle('is-scrolled', scrolled);
    backToTop.classList.toggle('is-visible', window.scrollY > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Close the mobile menu after a link is tapped */
  document.querySelectorAll('#navMenu .nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      const menu = document.getElementById('navMenu');
      if (menu.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  /* ---------------------------------------------------
     Scroll reveal (IntersectionObserver)
  --------------------------------------------------- */
  const revealItems = document.querySelectorAll('.ff-fade-up');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------
     Helper: set a progress ring's fill (0-100)
  --------------------------------------------------- */
  function setRing(circle, percent, circumference) {
    const offset = circumference - (Math.max(0, Math.min(100, percent)) / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  /* ---------------------------------------------------
     Helper: animate a number counting up
  --------------------------------------------------- */
  function animateCount(el, target, decimals, duration) {
    const start = 0;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = start + (target - start) * eased;
      el.textContent = decimals ? value.toFixed(decimals) : Math.round(value);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = decimals ? target.toFixed(decimals) : target;
    }
    requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------
     Hero dashboard: animate ring + stats once visible
  --------------------------------------------------- */
  const heroDashboard = document.querySelector('.ff-dashboard');
  const heroRing = document.getElementById('heroRing');
  const heroRingNumber = document.getElementById('heroRingNumber');
  const heroCircumference = 2 * Math.PI * 68;
  let heroAnimated = false;

  function animateHero() {
    if (heroAnimated) return;
    heroAnimated = true;
    const value = parseFloat(heroRing.dataset.value);
    setRing(heroRing, value, heroCircumference);
    animateCount(heroRingNumber, value, 0, 1200);
    document.querySelectorAll('.ff-stat-num').forEach(function (num) {
      const target = parseFloat(num.dataset.count);
      const decimals = num.dataset.decimal ? parseInt(num.dataset.decimal, 10) : 0;
      animateCount(num, target, decimals, 1300);
    });
  }

  if (heroDashboard && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateHero();
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    heroObserver.observe(heroDashboard);
  } else if (heroDashboard) {
    animateHero();
  }

  /* ---------------------------------------------------
     Daily Habits Tracker
  --------------------------------------------------- */
  const habitCards = document.querySelectorAll('[data-habit-card]');
  const habitRing = document.getElementById('habitRing');
  const habitRingNumber = document.getElementById('habitRingNumber');
  const habitCounter = document.getElementById('habitCounter');
  const habitEncourage = document.getElementById('habitEncourage');
  const habitCircumference = 2 * Math.PI * 50;

  const encouragements = [
    'Tap a habit below to mark it complete.',
    'Good start — keep the streak going.',
    'Halfway there. Nice, steady pace.',
    'Almost a full day. One more to go.',
    'Every habit done today. Well played.'
  ];

  function updateHabitSummary() {
    const total = habitCards.length;
    const completed = document.querySelectorAll('[data-habit-card].is-complete').length;
    const percent = Math.round((completed / total) * 100);

    setRing(habitRing, percent, habitCircumference);
    habitRingNumber.textContent = percent;
    habitCounter.textContent = completed + ' of ' + total + ' habits completed today';
    habitEncourage.textContent = encouragements[completed] || encouragements[0];
  }

  habitCards.forEach(function (card) {
    const btn = card.querySelector('[data-habit-toggle]');
    const btnText = btn.querySelector('.ff-habit-btn-text');
    btn.addEventListener('click', function () {
      const isComplete = card.classList.toggle('is-complete');
      btn.setAttribute('aria-pressed', isComplete ? 'true' : 'false');
      btnText.textContent = isComplete ? 'Completed' : 'Mark complete';
      updateHabitSummary();
    });
  });

  if (habitRing) {
    // initialise the ring dash array to match its radius
    habitRing.style.strokeDasharray = habitCircumference;
    habitRing.style.strokeDashoffset = habitCircumference;
    updateHabitSummary();
  }

  /* ---------------------------------------------------
     Interactive Goal Generator
  --------------------------------------------------- */
  const goalForm = document.getElementById('goalForm');
  const goalHours = document.getElementById('goalHours');
  const goalHoursValue = document.getElementById('goalHoursValue');
  const goalEmptyState = document.getElementById('goalEmptyState');
  const goalResult = document.getElementById('goalResult');

  goalHours.addEventListener('input', function () {
    goalHoursValue.textContent = goalHours.value;
  });

  const planLibrary = {
    coding: {
      label: 'Coding & Development',
      segments: [
        { name: 'Core practice', share: 0.5, color: 'var(--focus-blue)' },
        { name: 'Code review & revision', share: 0.25, color: 'var(--growth-green)' },
        { name: 'Project building', share: 0.25, color: '#6366F1' }
      ]
    },
    study: {
      label: 'Academic Study',
      segments: [
        { name: 'Reading & lectures', share: 0.4, color: 'var(--focus-blue)' },
        { name: 'Practice problems', share: 0.35, color: 'var(--growth-green)' },
        { name: 'Review & recall', share: 0.25, color: '#6366F1' }
      ]
    },
    fitness: {
      label: 'Fitness & Health',
      segments: [
        { name: 'Cardio training', share: 0.4, color: 'var(--focus-blue)' },
        { name: 'Strength training', share: 0.4, color: 'var(--growth-green)' },
        { name: 'Mobility & recovery', share: 0.2, color: '#6366F1' }
      ]
    },
    creative: {
      label: 'Creative Practice',
      segments: [
        { name: 'Focused creation', share: 0.55, color: 'var(--focus-blue)' },
        { name: 'Skill drills', share: 0.25, color: 'var(--growth-green)' },
        { name: 'Feedback & review', share: 0.2, color: '#6366F1' }
      ]
    },
    career: {
      label: 'Career Growth',
      segments: [
        { name: 'Skill building', share: 0.45, color: 'var(--focus-blue)' },
        { name: 'Networking & outreach', share: 0.3, color: 'var(--growth-green)' },
        { name: 'Portfolio & applications', share: 0.25, color: '#6366F1' }
      ]
    }
  };

  const difficultyNotes = {
    light: 'A light pace leans toward review and recovery — ideal if your week is already full.',
    balanced: 'A balanced split keeps the time evenly spread across practice and review.',
    intensive: 'An intensive pace pushes more time into core practice — pair it with real rest days.'
  };

  // Shifts a slice of "share" from the last segment to the first as difficulty rises.
  const difficultyShift = { light: -0.08, balanced: 0, intensive: 0.08 };

  function buildPlan(categoryKey, hours, difficulty) {
    const plan = planLibrary[categoryKey];
    const shift = difficultyShift[difficulty];
    const segs = plan.segments.map(function (s) { return { name: s.name, color: s.color, share: s.share }; });

    segs[0].share = Math.max(0.1, segs[0].share + shift);
    segs[segs.length - 1].share = Math.max(0.1, segs[segs.length - 1].share - shift);

    const total = segs.reduce(function (sum, s) { return sum + s.share; }, 0);

    return segs.map(function (s) {
      const normalizedShare = s.share / total;
      return {
        name: s.name,
        color: s.color,
        share: normalizedShare,
        hours: Math.round(normalizedShare * hours * 10) / 10
      };
    });
  }

  function renderPlan(categoryKey, hours, difficulty) {
    const plan = planLibrary[categoryKey];
    const lines = buildPlan(categoryKey, hours, difficulty);

    let barHtml = '<div class="ff-goal-bar-track">';
    lines.forEach(function (line) {
      barHtml += '<div class="ff-goal-bar-seg" style="width:' + (line.share * 100) + '%; background:' + line.color + '"></div>';
    });
    barHtml += '</div>';

    let linesHtml = '';
    lines.forEach(function (line) {
      linesHtml += '<div class="ff-goal-line">' +
        '<span class="ff-goal-line-label"><span class="ff-goal-dot" style="background:' + line.color + '"></span>' + line.name + '</span>' +
        '<span class="ff-goal-line-hours">' + line.hours + 'h</span>' +
        '</div>';
    });

    const sentenceParts = lines.map(function (l) { return l.hours + ' hours on ' + l.name.toLowerCase(); });
    const sentence = 'Spend ' + sentenceParts.slice(0, -1).join(', ') + ', and ' + sentenceParts[sentenceParts.length - 1] + ' this week.';

    goalResult.innerHTML =
      '<h3 class="ff-goal-result-title">' + plan.label + ' — ' + hours + 'h / week</h3>' +
      '<p class="ff-goal-result-sub">' + sentence + '</p>' +
      barHtml +
      linesHtml +
      '<p class="ff-goal-note">' + difficultyNotes[difficulty] + '</p>';

    goalEmptyState.classList.add('d-none');
    goalResult.classList.remove('d-none');
  }

  goalForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const category = document.getElementById('goalCategory').value;
    const hours = parseInt(goalHours.value, 10);
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    renderPlan(category, hours, difficulty);
  });

  /* ---------------------------------------------------
     Contact form: client-side validation
  --------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');
  const errorName = document.getElementById('errorName');
  const errorEmail = document.getElementById('errorEmail');
  const errorMessage = document.getElementById('errorMessage');
  const formSuccess = document.getElementById('formSuccess');

  function showError(input, errorEl, message) {
    errorEl.textContent = message;
    input.style.borderColor = message ? '#f87171' : '';
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateContact() {
    let valid = true;

    if (nameInput.value.trim().length < 2) {
      showError(nameInput, errorName, 'Please enter your name.');
      valid = false;
    } else {
      showError(nameInput, errorName, '');
    }

    if (!isValidEmail(emailInput.value.trim())) {
      showError(emailInput, errorEmail, 'Please enter a valid email address.');
      valid = false;
    } else {
      showError(emailInput, errorEmail, '');
    }

    if (messageInput.value.trim().length < 10) {
      showError(messageInput, errorMessage, 'Message should be at least 10 characters.');
      valid = false;
    } else {
      showError(messageInput, errorMessage, '');
    }

    return valid;
  }

  [nameInput, emailInput, messageInput].forEach(function (input) {
    input.addEventListener('blur', validateContact);
  });

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    formSuccess.textContent = '';
    if (validateContact()) {
      formSuccess.textContent = 'Thanks — your message has been noted. (Demo only, nothing was sent.)';
      contactForm.reset();
      setTimeout(function () { formSuccess.textContent = ''; }, 6000);
    }
  });

})();
