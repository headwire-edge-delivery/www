import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);

  // add svg icons
  const cardListItems = document.querySelectorAll('.cards.light.block li');

  if (cardListItems.length > 1) {
    cardListItems[1].querySelector('picture').innerHTML = `
          <img src="/icons/tools.svg" alt="Tools Icon">
      `;
  }

  if (cardListItems.length > 2) {
    cardListItems[2].querySelector('picture').innerHTML = `
          <img src="/icons/wifi.svg" alt="WiFi Icon">
      `;
  }
}
