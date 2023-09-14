export default async function decorate(block) {
    const textElems = block.querySelectorAll('h2, p');
    
    const imageWrapper = block.querySelector('p > picture');
    if(imageWrapper) {
        const parentP = imageWrapper.parentNode;
        parentP.classList.add('banner-logo'); 
    }

    const bannerTextWrapper = document.createElement('div');
    bannerTextWrapper.className = 'banner-text-wrapper';

    for (let i = 1; i < textElems.length; i++) { 
        bannerTextWrapper.appendChild(textElems[i].cloneNode(true));
        textElems[i].remove();
    }

    block.appendChild(bannerTextWrapper);

    let imageUrl = document.querySelector('.banner-text-wrapper picture img').src;

    document.querySelector('.banner-wrapper').style.backgroundImage = `url(${imageUrl})`;
}
