import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  buildBlock, createOptimizedPicture,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
const AUTHORS = {
  'Ruben Reusser': {
    image: '/team/rr.jpeg',
    title: 'CTO, headwire',
  },
};
export function createBlogDetails(data) {
  return `
    <div class="author">
      ${createOptimizedPicture(`${window.location.origin}${AUTHORS[data.author].image}`, data.author).outerHTML}
      <div>
        <div>
            <strong>By ${data.author}</strong>
        </div>
        <div>
            <div>${AUTHORS[data.author].title}</div>
        </div>
      </div>
    </div>
    <div class="date">${data.publicationDate}</div>
    <ul class="tags">${data.keywords.split(',').map((keyword) => `<li>${keyword.trim()}</li>`).join('')}</ul>
   `;
}

/**
 * Adds the favicons.
 */
export function addFavIcon() {
  // Remove placeholder
  document.head.querySelector('head link[rel="icon"]').remove();

  // Add favicon
  document.head.insertAdjacentHTML('beforeend', '<link rel="icon" href="/icons/headwirelogo.svg">');
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const description = main.querySelector('h1 + p');
  const picture = main.querySelector('p > picture');
  if (picture && picture.parentElement.nextElementSibling === h1) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1, description] }));
    main.prepend(section);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  if (!document.title.includes('headwire')) {
    document.title += ' | headwire';
  }

  if (window.location.pathname === '/') {
    document.body.classList.add('homepage');
  } else {
    document.body.classList.add('page');
  }

  if (window.location.pathname.startsWith('/blog/')) {
    document.querySelector('main div').append(buildBlock('blog', { elems: [] }));
  }

  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
  addFavIcon();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
