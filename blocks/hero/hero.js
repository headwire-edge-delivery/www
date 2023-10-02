export default async function decorate(block) {
  if (document.body.classList.contains('homepage')) {
    const firstPicture = block.querySelector('p > picture');
    if (firstPicture) {
      firstPicture.parentNode.classList.add('hero-background');
    }
  } else if (block.querySelector('h1[id^="the-"]')) {
    const articleHeroDiv = document.createElement('div');
    articleHeroDiv.className = 'article-hero';

    const elementsToWrap = block.querySelectorAll('h1, p:not(.hero-background)');
    elementsToWrap.forEach((elem) => {
      articleHeroDiv.appendChild(elem);
    });

    const pictureElem = block.querySelector('picture');
    if (pictureElem) {
      const articleHeroWrapper = document.createElement('div');
      articleHeroWrapper.className = 'article-hero-wrapper';

      articleHeroWrapper.appendChild(pictureElem);
      articleHeroWrapper.appendChild(articleHeroDiv);

      block.appendChild(articleHeroWrapper);
    } else {
      block.appendChild(articleHeroDiv);
    }
  }
}
