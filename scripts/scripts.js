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
  buildBlock, createOptimizedPicture, toClassName, getMetadata,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
const AUTHORS = {
  'Ruben Reusser': {
    image: '/team/rr.jpeg',
    title: 'CTO, headwire',
  },
};

export const ARTICLE_TEMPLATES = {
  // 'tag-list': 'tag-list'
  // homepage: homepage
  blog: 'blog',
  tutorial: 'tutorial',
};

export function createBlogDetails(data) {
  const authorExists = AUTHORS[data.author] && AUTHORS[data.author].image;
  const imageUrl = authorExists ? `${window.location.origin}${AUTHORS[data.author].image}` : '../icons/headwirelogo.svg';
  const authorTitle = authorExists ? AUTHORS[data.author].title : 'Employee at Headwire';

  return `
    <div class="author">
      ${createOptimizedPicture(imageUrl, data.author).outerHTML}
      <div>
        <div>
            <strong>${data.author}</strong>
        </div>
        <div>
            <div class="title">${authorTitle}</div>
        </div>
      </div>
    </div>
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
    if (!document.querySelector('main.error')) {
      buildHeroBlock(main);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Adds target="_blank" and rel="noopener noreferrer nofollow" to links within the node that leave the site.
 * @param {Element} node to apply these changes to the links
 */
export function applyLinkTargets(node) {
  node.querySelectorAll('a').forEach((anchor) => {
    if (anchor.href.startsWith(window.location.origin)) {
      return
    }
    anchor.setAttribute('rel', 'noopener noreferrer nofollow')
    anchor.setAttribute('target', '_blank')
  })
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
  applyLinkTargets(main)
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  if (!document.title.includes('headwire')) {
    document.title += ' | headwire';
  }

  const template = getMetadata('template');
  const main = doc.querySelector('main');

  if (ARTICLE_TEMPLATES[toClassName(template)]) {const section = document.createElement('div');
      const templateBlock = buildBlock(toClassName(template), { elems: [...main.children] });

      // additionalClasses?.forEach((classString) => templateBlock.classList.add(classString));
      section.append(templateBlock);
      main.prepend(section);
    // main.append(buildBlock(toClassName(template), { elems: [...main.children[0].children] }));
    // document.querySelector('main div').append(buildBlock(toClassName(template), { elems: [...main.children] }));
  }

  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
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

/**
 * Generates a list of tag-blog-pages from a query-index request.
 */
export function createTagList(queryIndexData) {
  return queryIndexData.data.filter((item) => item.path.match(/^\/blog\/categories\/./g));
}
