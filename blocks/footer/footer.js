import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;

    const footerInfoWrapper = document.createElement('div');
    footerInfoWrapper.className = 'footer-info-wrapper';

    const divs = footer.querySelectorAll('div > div');
    for (let i = 0; i < 3 && i < divs.length; i += 1) {
      footerInfoWrapper.appendChild(divs[i]);
    }

    footer.children[0].insertBefore(footerInfoWrapper, footer.children[0].firstChild);

    decorateIcons(footer);
    block.append(footer);
  }
}
