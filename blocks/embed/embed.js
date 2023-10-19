import { loadCSS } from '../../scripts/lib-franklin.js';

const jsonpGist = (url, callback) => {
  // Setup a unique name that cane be called & destroyed
  const callbackName = `jsonp_${Math.round(100000 * Math.random())}`;

  // Create the script tag
  const script = document.createElement('script');
  script.src = `${url}${(url.indexOf('?') >= 0 ? '&' : '?')}callback=${callbackName}`;

  // Define the function that the script will call
  window[callbackName] = (data) => {
    delete window[callbackName];
    document.body.removeChild(script);
    callback(data);
  };

  // Append to the document
  document.body.appendChild(script);
};

const gist = (element) => {
  const { href } = element;
  const url = href.slice(-2) === 'js' ? `${href}on` : `${href}.json`;

  jsonpGist(url, (data) => {
    loadCSS(data.stylesheet);
    element.insertAdjacentHTML('afterend', data.div);
    element.remove();
  });
};

const youtube = (block, a, picture) => {
  const url = new URL(a.href);
  const vid = url.searchParams.get('v');

  const html = `
    <div class="youtube-poster">
      ${picture.outerHTML}
      <button aria-label="Play">
          <svg height="100%" viewBox="0 0 68 48" width="100%">
              <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path>
          </svg>
      </button>
    </div>
    <div class="youtube-wrapper">
        <iframe allow="autoplay" title="Content from Youtube"></iframe>
    </div>
  `;

  block.innerHTML = html;

  const button = block.querySelector('button');
  button.addEventListener('click', () => {
    block.classList.add('is-loaded');
    block.querySelector('iframe').src = `https://www.youtube.com/embed/${vid}?autoplay=1`;
  });

  block.querySelector('img').addEventListener('click', () => {
    button.click();
  });
};

const initObserver = (callback) => new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      callback(entry.target);
    }
  });
}, { root: null, rootMargin: '200px', threshold: 0 });

export default function decorate(block) {
  const a = block.querySelector('a');
  const picture = block.querySelector('picture');
  const { hostname } = new URL(a.href);
  if (hostname.includes('youtu')) {
    youtube(block, a, picture);
  }
  if (hostname.includes('gist')) {
    initObserver(() => {
      gist(a);
    }).observe(a);
  }
}
