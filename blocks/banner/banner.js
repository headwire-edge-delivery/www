const setBackground = (block, image) => {
  block.style.backgroundImage = `url(${image.currentSrc})`;
  image.parentElement.remove();
};

export default async function decorate(block) {
  const textElems = block.querySelectorAll('h2, p');

  const imageWrapper = block.querySelector('p > picture');
  if (imageWrapper) {
    const parentP = imageWrapper.parentNode;
    parentP.classList.add('banner-logo');
  }

  const bannerTextWrapper = document.createElement('div');
  bannerTextWrapper.className = 'banner-text-wrapper';

  for (let i = 1; i < textElems.length; i += 1) {
    bannerTextWrapper.appendChild(textElems[i].cloneNode(true));
    textElems[i].remove();
  }

  block.appendChild(bannerTextWrapper);

  const image = block.querySelector('.banner-text-wrapper picture img');
  if (image.complete) {
    setBackground(block, image);
  } else {
    image.onload = () => {
      setBackground(block, image);
    };
  }
}
