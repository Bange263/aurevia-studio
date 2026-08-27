(() => {
  const cfg = window.AUREVIA_CONFIG || {};
  const supportEmail = cfg.supportEmail || 'if425785@gmail.com';
  const storeUrl = (cfg.storeUrl || '').trim();
  const productVersion = cfg.productVersion || '1.2.0';
  const productPrice = cfg.productPrice || '€29.99';

  document.querySelectorAll('[data-support-email]').forEach((node) => {
    node.textContent = supportEmail;
    if (node.tagName === 'A') node.href = `mailto:${supportEmail}`;
  });
  document.querySelectorAll('[data-support-link]').forEach((node) => {
    if (node.tagName === 'A') node.href = `mailto:${supportEmail}`;
  });
  document.querySelectorAll('[data-version]').forEach((node) => node.textContent = productVersion);
  document.querySelectorAll('[data-price]').forEach((node) => node.textContent = productPrice);

  document.querySelectorAll('strong').forEach((node) => {
    node.textContent = node.textContent.replace(
      /Aurevia-Theme-v\d+\.\d+\.\d+\.zip/g,
      `Aurevia-Theme-v${productVersion}.zip`
    );
  });

  document.querySelectorAll('[data-store-link]').forEach((link) => {
    if (storeUrl) {
      link.href = storeUrl;
      link.textContent = link.dataset.liveLabel || 'Get Aurevia';
      link.classList.remove('is-disabled');
      link.removeAttribute('aria-disabled');
    } else {
      link.href = '#pricing';
      link.textContent = link.dataset.testLabel || 'Available after store approval';
      link.classList.add('is-disabled');
      link.setAttribute('aria-disabled', 'true');
    }
  });

  const menuBtn = document.querySelector('[data-menu-button]');
  const navLinks = document.querySelector('[data-nav-links]');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
    navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }));
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = lightbox?.querySelector('img');
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  document.querySelectorAll('[data-lightbox-src]').forEach((item) => {
    item.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = item.dataset.lightboxSrc;
      lightboxImage.alt = item.querySelector('img')?.alt || 'Aurevia theme preview';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });
  lightbox?.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl && !ogUrl.content) ogUrl.content = window.location.href;
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && !/^https?:\/\//i.test(ogImage.content)) {
    ogImage.content = new URL(ogImage.content || 'assets/images/cover-1600x900.png', window.location.href).href;
  }

  const productSchema = document.querySelector('script[type="application/ld+json"]');
  if (productSchema) {
    try {
      const schema = JSON.parse(productSchema.textContent);
      if (schema?.['@type'] === 'Product') {
        schema.sku = `AUREVIA-${productVersion}`;
        if (schema.offers) {
          schema.offers.url = storeUrl || schema.offers.url;
          schema.offers.price = productPrice.replace(/[^0-9.,]/g, '').replace(',', '.');
          schema.offers.priceCurrency = 'EUR';
        }
        productSchema.textContent = JSON.stringify(schema);
      }
    } catch (_) { /* Static schema remains usable if parsing ever fails. */ }
  }
})();
