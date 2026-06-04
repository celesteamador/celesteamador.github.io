(() => {

  /* =============================================
     NAV — scroll shadow + dark/light theme
  ============================================= */
  const nav       = document.getElementById('nav');
  const toggle    = document.querySelector('.nav-toggle');
  const links     = document.querySelector('.nav-links');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const heroEl    = document.querySelector('.hero');

  function updateNav() {
    const scrollY   = window.scrollY;
    const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 0;
    nav.classList.toggle('scrolled',  scrollY > 40);
    nav.classList.toggle('nav-dark',  heroBottom > 60);
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  navAnchors.forEach(a => a.addEventListener('click', () => {
    toggle.classList.remove('open');
    links.classList.remove('open');
  }));

  /* =============================================
     SECTION ACTIVE HIGHLIGHT
  ============================================= */
  const sections = document.querySelectorAll('.section');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a =>
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`)
        );
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => sectionObserver.observe(s));

  /* =============================================
     FADE-IN SCROLL ANIMATIONS
  ============================================= */
  const fadeSelectors = [
    '.timeline-item', '.project-card', '.cert-card', '.detail-card',
    '.about-text', '.music-text', '.music-highlights', '.contact-card',
    '.skill-category', '.edu-card', '.now-card',
    '.section-quote blockquote', '.fondarte-award'
  ].join(', ');

  const fadeEls = document.querySelectorAll(fadeSelectors);
  fadeEls.forEach(el => el.classList.add('fade-in'));

  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => fadeObserver.observe(el));

  /* =============================================
     MATRIX RAIN CANVAS
  ============================================= */
  const canvas = document.getElementById('matrix-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const FONT  = 13;
    const CHARS = '01アイウエオカキクケコサシスセソABCDEF<>/\\|{}[]$#@!?'.split('');
    let cols, drops;

    function initMatrix() {
      canvas.width  = heroEl ? heroEl.offsetWidth  : window.innerWidth;
      canvas.height = heroEl ? heroEl.offsetHeight : window.innerHeight;
      cols  = Math.floor(canvas.width / FONT);
      drops = Array.from({ length: cols }, () => Math.random() * -(canvas.height / FONT));
    }
    initMatrix();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initMatrix, 200);
    });

    function drawMatrix() {
      // Fade trail — very subtle, matches dark hero bg
      ctx.fillStyle = 'rgba(13, 12, 11, 0.055)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT}px monospace`;

      for (let i = 0; i < cols; i++) {
        if (i % 2 !== 0) continue; // skip alternate cols — less dense
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const y = drops[i] * FONT;
        if (y > 0 && y < canvas.height) {
          ctx.fillStyle = 'rgba(0, 255, 65, 0.13)';
          ctx.fillText(char, i * FONT, y);
        }
        drops[i] += 0.35;
        if (drops[i] * FONT > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -30;
        }
      }
    }

    setInterval(drawMatrix, 55); // ~18fps — ambient, not distracting
  }

  /* =============================================
     TYPED TAGLINE
  ============================================= */
  const typedEl   = document.getElementById('typed-tagline');
  const subTagEl  = document.querySelector('.hero-subtagline');
  const statsEl   = document.querySelector('.hero-stats');
  const TAGLINE   = 'Turning Curiosity into Code';
  const TYPE_MS   = 58; // ms per character

  if (typedEl) {
    // Hide elements that appear after typing
    if (subTagEl) { subTagEl.style.opacity = '0'; }
    if (statsEl)  { statsEl.style.opacity  = '0'; }

    let i = 0;
    const typeTimer = setInterval(() => {
      if (i < TAGLINE.length) {
        typedEl.textContent = TAGLINE.slice(0, ++i);
      } else {
        clearInterval(typeTimer);

        // Subtagline fades in
        if (subTagEl) {
          subTagEl.style.transition = 'opacity 0.65s ease';
          subTagEl.style.opacity = '1';
        }

        // Stats strip fades in then counts up
        setTimeout(() => {
          if (statsEl) {
            statsEl.style.transition = 'opacity 0.6s ease';
            statsEl.style.opacity = '1';
            animateStats();
          }
        }, 380);
      }
    }, TYPE_MS);
  }

  /* =============================================
     STATS COUNT-UP
  ============================================= */
  function animateStats() {
    document.querySelectorAll('.stat-num[data-target]').forEach(el => {
      const target   = parseFloat(el.dataset.target);
      const suffix   = el.dataset.suffix || '';
      const duration = 900;
      const steps    = 36;
      const stepMs   = Math.floor(duration / steps);
      let step = 0;
      const t = setInterval(() => {
        step++;
        const ease = 1 - Math.pow(1 - step / steps, 3); // cubic ease-out
        const val  = Math.round(target * ease);
        el.textContent = val + suffix;
        if (step >= steps) {
          el.textContent = target + suffix;
          clearInterval(t);
        }
      }, stepMs);
    });
  }

  /* =============================================
     SUBSTACK RSS FEED
  ============================================= */
  const SUBSTACK_RSS = 'https://api.rss2json.com/v1/api.json'
    + '?rss_url=https%3A%2F%2Fsubstack.com%2Ffeed%2F%40celesteamador&count=3';
  const feedEl = document.getElementById('blog-feed');

  if (feedEl) {
    fetch(SUBSTACK_RSS)
      .then(r => r.json())
      .then(data => {
        if (!data.items || !data.items.length) throw new Error('empty');
        feedEl.innerHTML = data.items.map(item => {
          const date = new Date(item.pubDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          });
          const excerpt = item.description
            ? item.description.replace(/<[^>]+>/g, '').slice(0, 120).trim() + '…'
            : '';
          return `<a class="blog-post-card fade-in" href="${item.link}"
                    target="_blank" rel="noopener">
            <span class="blog-post-date">${date}</span>
            <span class="blog-post-title">${item.title}</span>
            ${excerpt ? `<span class="blog-post-excerpt">${excerpt}</span>` : ''}
            <span class="blog-post-read">Read &rarr;</span>
          </a>`;
        }).join('');
        feedEl.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
      })
      .catch(() => {
        feedEl.innerHTML = '';
      });
  }

})();
