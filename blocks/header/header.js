import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';
import { createTagList } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  if (!nav || !navSections) {
    return;
  }
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');

  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    navSections.querySelector('.blog-link-wrapper')?.classList?.remove('open');
  }
}

let prevScrollpos = document.body.scrollTop;

document.body.addEventListener('scroll', () => {
  const currentScrollPos = document.body.scrollTop;
  const navWrapper = document.querySelector('header .nav-wrapper');

  if (!navWrapper) {
    return;
  }

  if (prevScrollpos > currentScrollPos || currentScrollPos <= 0) {
    navWrapper.classList.remove('hide');
  } else {
    navWrapper.classList.add('hide');
    const blogLinkWrapper = navWrapper.querySelector('.blog-link-wrapper:not(:focus-within)');
    if (blogLinkWrapper?.classList?.contains('open')) {
      blogLinkWrapper.classList.remove('open');
      document.activeElement.blur();
      const expandedItems = navWrapper.querySelectorAll('li[aria-expanded="true"]');
      expandedItems.forEach((item) => item.setAttribute('aria-expanded', 'false'));
    }
  }
  prevScrollpos = currentScrollPos;
});

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';

  const [navHtml, queryData] = await Promise.allSettled([(await fetch(`${navPath}.plain.html`)).text(), (await fetch('/query-index.json')).json()]);

  if (navHtml) {
    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = navHtml.value;

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          }
        });
      });

      const allLinks = nav.querySelectorAll('a');
      allLinks.forEach((link) => {
        if (link.textContent === 'Blog') {
          const blogTagWrapper = document.createElement('div');
          blogTagWrapper.className = 'blog-link-wrapper';

          const blogButton = document.createElement('button');
          blogButton.className = 'blog-link';

          const tagMenu = document.createElement('div');
          blogButton.textContent = 'Blog';
          tagMenu.className = 'tag-menu';
          blogButton.onclick = () => {
            blogTagWrapper.classList.toggle('open');
          };
          isDesktop.addEventListener('change', () => blogTagWrapper.classList.remove('open'));

          const tagList = createTagList(queryData.value);
          const tagListElement = document.createElement('ul');
          tagListElement.className = 'tag-list';
          tagListElement.innerHTML = `<li class="tag-list-item">
              <a href="/blog">
                All Blogs
              </a>
            </li>`;
          const mobileBackButtonWrapper = document.createElement('li');
          mobileBackButtonWrapper.className = 'tag-list-item';
          const mobileBackButton = document.createElement('button');
          mobileBackButton.className = 'mobile-back-button';

          // click listener doesn't function if it is set here without waiting first.
          window.requestAnimationFrame(() => {
            document.querySelector('.mobile-back-button').onclick = () => {
              blogTagWrapper.classList.remove('open');
            };
          });

          mobileBackButtonWrapper.prepend(mobileBackButton);
          tagListElement.prepend(mobileBackButtonWrapper);

          tagList.forEach((tag) => {
            tagListElement.innerHTML += `
            <li class="tag-list-item">
              <a href="${tag.path}">
                ${tag.description.includes(' Blog Articles') ? tag.description.split(' Blog Articles')[0] : tag.path.replace('/blog/categories/', '').toUpperCase()}
              </a>
            </li>
            `;
          });
          tagMenu.append(tagListElement);
          blogTagWrapper.append(tagMenu);
          navSections.append(blogTagWrapper);
          link.replaceWith(blogButton);
        }
      });
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    // prevent mobile nav behavior on window resize
    toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.append(navWrapper);

    // Transform logo into home page link
    const logo = nav.querySelector('.icon-headwirelogo');
    const link = document.createElement('a');
    link.href = '/';
    link.setAttribute('aria-label', 'headwire');
    logo.parentElement.appendChild(link);
    link.appendChild(logo);

    decorateIcons(nav);
  }
}
