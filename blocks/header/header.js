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
  navSections.classList.remove('dropdown-open');
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
        nav.querySelector('.mobile-dropdown-open')?.classList?.remove('mobile-dropdown-open');
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
        const innerList = navSection.querySelector('ul');

        // inner list functionality setup
        if (innerList) {
          const innerListWrapper = document.createElement('div');
          innerListWrapper.className = 'inner-list-wrapper';
          innerListWrapper.append(innerList);
          navSection.append(innerListWrapper);

          navSection.classList.add('nav-drop');
          navSection.setAttribute('tabindex', 0);

          const toggleOpen = (forceExpanded) => {
            const expanded = forceExpanded !== undefined ? !forceExpanded : navSection.getAttribute('aria-expanded') === 'true';
            if (expanded) {
              navSection.setAttribute('aria-expanded', false);
              navSection.parentElement.classList.add('mobile-dropdown-open');
            } else {
              navSection.setAttribute('aria-expanded', true);
              navSection.parentElement.classList.remove('mobile-dropdown-open');
            }
          };

          const keyNavThroughMenu = (up) => {
            const firstLinkInMenu = innerList.querySelector('ul li a');
            const lastLinkInMenu = innerList.querySelector('ul li:last-child a');
            if (innerList.contains(document.activeElement)) {
              if (up) {
                if (document.activeElement.isEqualNode(firstLinkInMenu)) {
                  navSection.focus();
                  return;
                }
                document.activeElement.parentElement.previousElementSibling.children[0].focus();
                return;
              }
              if (document.activeElement.isEqualNode(lastLinkInMenu)) {
                return;
              }
              document.activeElement.parentElement.nextElementSibling.children[0].focus();
            }
            if (document.activeElement.isEqualNode(navSection)) {
              if (up) {
                return;
              }
              firstLinkInMenu.focus();
            }
          };

          const keyboardPressHandler = (e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              keyNavThroughMenu(false);
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              keyNavThroughMenu(true);
            }
            if (e.key === 'Tab') {
              if (
                document.activeElement.isEqualNode(navSection)
                || navSection.contains(document.activeElement)
              ) {
                e.preventDefault();
                if (e.shiftKey) {
                  navSection.previousElementSibling.children[0].focus();
                } else {
                  navSection.nextElementSibling.children[0].focus();
                }
                toggleOpen(false);
              }
            }
          };

          const focusOutHandler = () => {
            requestAnimationFrame(() => {
              if (!navSection.contains(document.activeElement)) {
                toggleOpen(false);
              }
            });
          };

          innerList.classList.add('inner-list');
          navSection.onclick = () => {
            toggleOpen();
          };
          navSection.addEventListener('mouseenter', () => {
            if (!isDesktop.matches) return;
            toggleOpen(true);
          });
          navSection.addEventListener('mouseleave', () => {
            if (!isDesktop.matches || navSection.contains(document.activeElement)) return;
            toggleOpen(false);
          });
          navSection.addEventListener('focus', () => {
            if (!isDesktop.matches) return;
            toggleOpen(true);
          });
          navSection.addEventListener('keydown', (e) => {
            if (!isDesktop.matches) return;
            keyboardPressHandler(e);
          });
          navSection.addEventListener('focusout', () => {
            if (!isDesktop.matches) return;
            focusOutHandler();
          });

          // mobile inner menu control setup
          const mobileBackButtonWrapper = document.createElement('li');
          mobileBackButtonWrapper.className = 'mobile-back-button-wrapper';
          const mobileBackButton = document.createElement('button');
          mobileBackButton.className = 'mobile-back-button';
          mobileBackButton.onclick = () => toggleOpen(false);

          mobileBackButtonWrapper.prepend(mobileBackButton);
          innerList.prepend(mobileBackButtonWrapper);
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
