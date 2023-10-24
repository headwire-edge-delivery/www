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

export const TEMPLATES = {
  blog: 'blog',
  tutorial: 'tutorial',
};

function showCookieBanner() {
  const cookieBanner = document.body.querySelector('#cookie-notification:not(.appear)');
  if (cookieBanner) {
    cookieBanner.classList.add('appear');
  }
}

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

// sort publication date
function sortByPublicationDate(a, b, sortOrder) {
  const dateA = new Date(a.publicationDate);
  const dateB = new Date(b.publicationDate);

  if (sortOrder === 'oldest') {
    return dateA - dateB;
  } if (sortOrder === 'newest') {
    return dateB - dateA;
  }
  return 0;
}

// extracts path from url
function extractPath(url) {
  const match = url.match(/hlx\.live\/(.+)$/);
  return match ? match[1] : '';
}

/**
 * Renders search results, manages sorting, and updates the UI based on selected tags
 *
 * @param {Array} originalData - The initial array of search results
 * @param {Element} resultsContainer - The container element where search results should be rendered
 * @param {Element} tagsPanel - The container element for the tags UI
 * @param {string} [sortOrder='relevance'] - sorting results ('relevance', 'oldest', or 'newest')
 * @param {Array<string>} [filterTags=[]] - array of tags to filter results by
 */

let initialDataOrder = [];
export function renderResults(originalData, resultsContainer, tagsPanel, sortOrder = 'relevance', filterTags = []) {
  let data = [...originalData];

  // save initial order on first search
  if (!initialDataOrder.length) {
    initialDataOrder = [...data];
  }

  if (sortOrder === 'oldest' || sortOrder === 'newest') {
    data.sort((a, b) => sortByPublicationDate(a, b, sortOrder));
  } else if (sortOrder === 'relevance') {
    data = [...initialDataOrder];
  }

  const filterResultsByTag = (tags) => {
    const cards = resultsContainer.querySelectorAll('.result-card');
    cards.forEach((card) => {
      const cardTags = card.getAttribute('data-tags').split(', ');
      if (tags.length && !tags.some((tag) => cardTags.includes(tag))) {
        card.style.display = 'none';
      } else {
        card.style.display = 'block';
      }
    });
  };

  // clear existing result cards
  while (resultsContainer.firstChild) {
    resultsContainer.removeChild(resultsContainer.firstChild);
  }

  // show result cards based on filtered data
  data.forEach((result) => {
    const resultCard = document.createElement('a');
    const newPath = extractPath(result.url);
    resultCard.href = `${window.location.origin}/${newPath}`;
    resultCard.classList.add('result-card');
    resultCard.setAttribute('data-tags', result.tags || '');
    resultCard.innerHTML = `
        <h2>${result.title}</h2>
        <p>${result.snippet ? result.snippet : result.intro}</p>
    `;
    resultsContainer.appendChild(resultCard);
  });

  // clear existing tags
  while (tagsPanel.firstChild) {
    tagsPanel.removeChild(tagsPanel.firstChild);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tagsFromUrl = urlParams.getAll('tags');
  const selectedTags = tagsFromUrl.length ? tagsFromUrl : [];

  //  render tags
  // render tags
  const allTags = new Set(data.flatMap((result) => (result.tags || '').split(', ')));
  allTags.forEach((tag) => {
    const tagItem = document.createElement('div');

    // Nest the checkbox inside the label and remove the ID attribute
    tagItem.innerHTML = `
      <label>
        <input type="checkbox" value="${tag}">
        <span>${tag} (0)</span>
      </label>
  `;

    tagsPanel.appendChild(tagItem);
  });

  // add tag count number
  const tagCounts = {};
  data.forEach((result) => {
    if (result.tags) {
      const tags = result.tags.split(', ');
      tags.forEach((tag) => {
        if (tagCounts[tag]) {
          tagCounts[tag] += 1;
        } else {
          tagCounts[tag] = 1;
        }
      });
    }
  });

  // render tag counts
  Object.keys(tagCounts).forEach((tag) => {
    const labels = tagsPanel.querySelectorAll('label');
    labels.forEach((label) => {
      const spanInsideLabel = label.querySelector('span');
      if (spanInsideLabel && spanInsideLabel.textContent.includes(tag)) {
        spanInsideLabel.textContent = `${tag} (${tagCounts[tag]})`;
      }
    });
  });

  // check checkboxes if tag is present in the search params
  selectedTags.forEach((tag) => {
    const checkbox = tagsPanel.querySelector(`input[type="checkbox"][value="${tag}"]`);
    if (checkbox) checkbox.checked = true;
  });

  // filters the search results by the given tags
  filterResultsByTag(filterTags.length ? filterTags : selectedTags);

  // update url when tag checkbox is changed
  tagsPanel.addEventListener('change', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
      // get all selected tags
      const checkedBoxes = tagsPanel.querySelectorAll('input[type="checkbox"]:checked');
      const currentlySelectedTags = Array.from(checkedBoxes)
        .map((checkbox) => checkbox.value);

      filterResultsByTag(currentlySelectedTags);

      // update URL
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('tags');
      currentlySelectedTags.forEach((tag) => {
        currentUrl.searchParams.append('tags', tag);
      });
      window.history.pushState({}, '', currentUrl.toString());
    }
  });
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
 * Adds target="_blank" and rel="noopener noreferrer nofollow" to links
 * within the node that leave the site.
 * @param {Element} node to apply these changes to the links
 */
export function applyLinkTargets(node) {
  node.querySelectorAll('a').forEach((anchor) => {
    if (anchor.href.startsWith(window.location.origin)) {
      return;
    }
    anchor.setAttribute('rel', 'noopener noreferrer nofollow');
    anchor.setAttribute('target', '_blank');
  });
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
  applyLinkTargets(main);
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

  if (TEMPLATES[toClassName(template)]) {
    const section = document.createElement('div');
    const templateBlock = buildBlock(toClassName(template), { elems: [...main.children] });

    section.append(templateBlock);
    main.prepend(section);
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

  // loadHeader(doc.querySelector('header'));
  // loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
  addFavIcon();

  document.body.addEventListener('scroll', showCookieBanner, { once: true, passive: true });
  document.body.addEventListener('mousemove', showCookieBanner, { once: true, passive: true });
  document.body.addEventListener('touchmove', showCookieBanner, { once: true, passive: true });
  document.body.addEventListener('keydown', showCookieBanner, { once: true, passive: true });

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
