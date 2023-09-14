export default async function decorate(block) {
  const textElems = block.querySelectorAll('h1, p');

  const imageWrappers = block.querySelectorAll('p > picture');
  if (imageWrappers.length >= 2) {
    imageWrappers[0].parentNode.classList.add('hero-logo');
    imageWrappers[1].parentNode.classList.add('hero-background');
  }

  const heroTextWrapper = document.createElement('div');
  heroTextWrapper.className = 'hero-text-wrapper';

  for (let i = 2; i < textElems.length; i += 1) {
    heroTextWrapper.appendChild(textElems[i]);
  }

  block.appendChild(heroTextWrapper);

  const h1Elem = block.querySelector('h1');
  if (h1Elem) {
    h1Elem.innerHTML = h1Elem.innerHTML.replace(/&amp;/g, '<span class="lighter-font">&</span>');
  }
}
