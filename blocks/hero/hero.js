export default async function decorate(block) {
  if (block.classList.contains('overlay')) {
    const firstPicture = block.querySelector('p > picture');
    if (firstPicture) {
      firstPicture.parentNode.classList.add('hero-background');
    }

    const heroTextWrapper = document.createElement('div');
    heroTextWrapper.className = 'hero-text-wrapper';

    const elementsToAppend = block.querySelectorAll('h1, p:not(.hero-background)');
    elementsToAppend.forEach((elem) => {
      heroTextWrapper.appendChild(elem);
    });

    const heroImage = firstPicture.querySelector('img');
    if (heroImage) {
      heroImage.setAttribute('loading', 'eager');
    }
    block.appendChild(heroTextWrapper);

    const h1Elem = block.querySelector('h1');
    if (h1Elem) {
      h1Elem.innerHTML = h1Elem.innerHTML.replace(/&amp;/g, '<span class="lighter-font">&</span>');
    }
  } else if (block.querySelector('h1') && !block.querySelector('div.details')) {
    const articleHeroWrapper = document.createElement('div');
    articleHeroWrapper.className = 'article-hero-wrapper';
    const articleHeroDiv = document.createElement('div');
    articleHeroDiv.className = 'article-hero';

    const pictureElem = block.querySelector('picture');
    if (pictureElem) {
      articleHeroWrapper.appendChild(pictureElem);
      articleHeroWrapper.appendChild(articleHeroDiv);
    }

    const elementsToMove = block.querySelectorAll('h1, p:not(.hero-background)');
    elementsToMove.forEach((elem) => {
      articleHeroDiv.appendChild(elem);
    });
    block.innerHTML = '';
    block.appendChild(articleHeroWrapper);
  }
}
