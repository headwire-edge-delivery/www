import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';
// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

const placeholderHtml = `
<div class="header block" data-block-name="header" data-block-status="loading">
  <dialog class="nav-wrapper">
    <nav id="nav" >
      <div class="nav-hamburger">
        <button type="button" aria-controls="nav" aria-label="Open navigation">
          <span class="nav-hamburger-icon"></span>
        </button>
      </div>
      <div class="nav-brand" style="width: 80px; height: 99px;">
        <p>
        </p>
      </div>
      <div class="nav-sections">
        <ul style="width: 424px; height: 38px;">
        </ul>
      </div>
    </nav>
  </dialog>
</div>
`;

/**
 * creates and returns a search overlay component for both mobile and desktop view
 *
 * @param {string} className -tThe class name to be assigned to the created overlay
 * @returns {HTMLElement} overlay - the created search overlay element
 */
function createSearchOverlayComponent(className) {
  const overlay = document.createElement('div');
  overlay.className = className;
  overlay.style.display = 'none';

  const searchForm = document.createElement('form');
  searchForm.setAttribute('action', '/search-results');
  searchForm.setAttribute('method', 'GET');

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.name = 'q';
  searchInput.placeholder = 'Search...';
  searchInput.className = 'search-input-overlay';

  // Close button search
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-search';
  closeBtn.textContent = 'X';
  closeBtn.type = 'button';
  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  searchForm.appendChild(searchInput);
  searchForm.appendChild(closeBtn);
  overlay.appendChild(searchForm);

  // Event listeners for the search form
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = `/search-results?q=${encodeURIComponent(searchInput.value)}`;
  });

  // Listen for the keydown event directly on the searchInput
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      window.location.href = `/search-results?q=${encodeURIComponent(searchInput.value)}`;
    }
  });

  return overlay;
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

function onDialogClose(nav, navSections) {
  const button = nav.querySelector('.nav-hamburger button');

  const mobileOverlay = document.querySelector('.mobile-search-overlay');
  const desktopOverlay = document.querySelector('.search-overlay');
  mobileOverlay.style.display = 'none';
  desktopOverlay.style.display = 'none';

  nav.setAttribute('aria-expanded', 'false');
  toggleAllNavSections(navSections, 'false');
  button.setAttribute('aria-label', 'Open navigation');
  navSections.querySelector('.button-dropdown-wrapper')?.classList?.remove('open');
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
    navSections.querySelector('.button-dropdown-wrapper')?.classList?.remove('open');
    const button = nav.querySelector('.nav-hamburger button');

    nav.setAttribute('aria-expanded', 'false');
    toggleAllNavSections(navSections, 'false');
    button.setAttribute('aria-label', 'Open navigation');

    navSections.querySelector('.button-dropdown-wrapper')?.classList?.remove('open');
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
    const blogLinkWrapper = navWrapper.querySelector('.button-dropdown-wrapper:not(:focus-within)');
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
  block.innerHTML = placeholderHtml;
  // debugger
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';

  const navHtml = await (await fetch(`${navPath}.plain.html`)).text();

  if (navHtml) {
    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = navHtml;

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      });

      const headerListItems = nav.querySelectorAll('.nav-sections > ul > li');
      headerListItems.forEach((item) => {
        if (item.classList.contains('nav-drop')) {
          const buttonWrapper = document.createElement('div');
          buttonWrapper.className = 'button-dropdown-wrapper';

          const dropdownButton = document.createElement('button');
          dropdownButton.className = 'button-dropdown';
          dropdownButton.textContent = item.textContent.replace(item.children[0].textContent, '');

          const buttonClick = () => {
            const parent = dropdownButton.parentElement;
            const expanded = parent.getAttribute('aria-expanded') === 'true';
            if (expanded) {
              parent.setAttribute('aria-expanded', false);
            } else {
              parent.setAttribute('aria-expanded', true);
            }

            buttonWrapper.classList.toggle('open');
            buttonWrapper.parentElement.classList.toggle('dropdown-open');
          };

          dropdownButton.onclick = buttonClick;
          isDesktop.addEventListener('change', () => {
            buttonWrapper.parentElement.classList.remove('dropdown-open');
            buttonWrapper.classList.remove('open');
          });

          const mobileBackButtonWrapper = document.createElement('li');
          mobileBackButtonWrapper.className = 'mobile-back-button-wrapper';
          const mobileBackButton = document.createElement('button');
          mobileBackButton.className = 'mobile-back-button';
          mobileBackButton.onclick = buttonClick;

          mobileBackButtonWrapper.prepend(mobileBackButton);
          const linkList = item.querySelector('ul');
          linkList.prepend(mobileBackButtonWrapper);

          const tagMenu = document.createElement('div');
          tagMenu.className = 'tag-menu';
          tagMenu.append(linkList);

          buttonWrapper.append(tagMenu);
          navSections.append(buttonWrapper);
          item.innerHTML = '';
          item.append(dropdownButton);
        }
      });
    }
    // Overlay Search functionality for desktop
    const searchIconContainer = nav.querySelector('.icon-search').parentNode;
    searchIconContainer.classList.add('icon-search-container');
    searchIconContainer.setAttribute('tabindex', '0');

    const searchOverlay = createSearchOverlayComponent('search-overlay');
    navSections.insertBefore(searchOverlay, navSections.firstChild);

    // Overlay Search functionality for mobile
    const mobileSearchOverlay = createSearchOverlayComponent('mobile-search-overlay');
    searchIconContainer.appendChild(mobileSearchOverlay);

    // Toggle search overlay on search icon click.
    searchIconContainer.addEventListener('click', () => {
      const overlayToToggle = window.innerWidth < 900 ? mobileSearchOverlay : searchOverlay;
      if (overlayToToggle.style.display === 'none') {
        overlayToToggle.style.display = 'block';
        overlayToToggle.querySelector('.search-input-overlay').focus();
      } else {
        overlayToToggle.style.display = 'none';
      }
    });

    // Event listener for the 'keydown' event on the searchIconContainer
    searchIconContainer.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const overlayToToggle = window.innerWidth < 900 ? mobileSearchOverlay : searchOverlay;
        if (overlayToToggle.style.display === 'none') {
          overlayToToggle.style.display = 'block';
          overlayToToggle.querySelector('.search-input-overlay').focus();
        } else {
          overlayToToggle.style.display = 'none';
        }
      }
    });

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
    block.innerHTML = '';
    block.append(navWrapper);
    // prevent mobile nav behavior on window resize
    toggleMenu(nav, navSections, false);
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, false));
    // debugger

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
