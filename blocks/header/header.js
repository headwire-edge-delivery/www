import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';
import { createTagList } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

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

function onDialogClose(nav, navSections) {
  const button = nav.querySelector('.nav-hamburger button');

  nav.setAttribute('aria-expanded', 'false');
  toggleAllNavSections(navSections, 'false');
  button.setAttribute('aria-label', 'Open navigation');
  navSections.querySelector('.blog-link-wrapper')?.classList?.remove('open');
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
  // enabling / disabling modal view & scroll lock
  const dialog = document.querySelector('header dialog');
  const expanded = dialog.hasAttribute('open');

  if (isDesktop.matches) {
    dialog?.close();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        nav.setAttribute('aria-expanded', true);
        toggleAllNavSections(navSections, false);
      });
    });
    return;
  }

  if (forceExpanded === null ? !expanded : forceExpanded) {
    dialog?.showModal();
    nav.setAttribute('aria-expanded', 'true');
    toggleAllNavSections(navSections, 'true');
    const button = nav.querySelector('.nav-hamburger button');
    button.setAttribute('aria-label', 'Close navigation');
  } else {
    dialog?.close();
    navSections.querySelector('.blog-link-wrapper')?.classList?.remove('open');
    const button = nav.querySelector('.nav-hamburger button');

    nav.setAttribute('aria-expanded', 'false');
    toggleAllNavSections(navSections, 'false');
    button.setAttribute('aria-label', 'Open navigation');

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
            navSections.querySelector('.mobile-back-button').onclick = () => {
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

    const navWrapper = document.createElement('dialog');
    navWrapper.className = 'nav-wrapper';
    navWrapper.addEventListener('close', () => onDialogClose(nav, navSections));
    navWrapper.append(nav);
    block.append(navWrapper);
    // prevent mobile nav behavior on window resize
    toggleMenu(nav, navSections, false);
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, false));

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
