import {
  getMetadata,
} from '../../scripts/lib-franklin.js';
import { createBlogDetails } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const defaultContent = document.querySelector('.default-content-wrapper');
  if (defaultContent) {
    let toc = '<div class="toc"><div class="sticky"><strong>Table of content</strong><ul>';
    defaultContent.querySelectorAll('h2, h3').forEach((heading) => {
      const level = parseInt(heading.tagName.slice(1), 10) - 1;
      toc += `<li class="level-${level}"><a href="#${heading.id}">${heading.textContent}</a></li>`;
    });
    toc += '</ul></div></div>';

    const title = getMetadata('og:title');
    const url = getMetadata('og:url');
    const author = getMetadata('author');
    const publicationDate = getMetadata('publication-date');
    const keywords = getMetadata('keywords');

    const blogDetails = createBlogDetails({ author, keywords, publicationDate });

    const shareTemplate = `<div class="social-share">
      <span class="label">Share story</span>
      <ul class="columns">
        <li>
          <a href="https://www.facebook.com/sharer.php?u=${url}" target="_blank" title="Share on Facebook">
            <img src="/icons/facebook.svg" alt="facebook" loading="lazy"/>
          </a>
        </li>
        <li>
          <a href="https://twitter.com/intent/tweet?text=${title}&url=${url}" target="_blank" title="Share on Twitter">
            <img src="/icons/twitter-x.svg" alt="twitter x" loading="lazy"/>
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" title="Share on LinkedIn">
            <img src="/icons/linkedin.svg" alt="linkedin" loading="lazy"/>
          </a>
        </li>
      </ul>
    </div>
    `;

    const template = `<div class="blog-main">
            <div class="details">
                ${blogDetails}
                ${shareTemplate}
            </div>
            <div class="content-container">
              ${toc}
              <div class="content">
                <a class="button contact" href="/contact-us">Contact us</a>
                <div class="details">
                    ${blogDetails}
                    ${shareTemplate}
                </div>
              </div>  
            </div>
        </div>`;

    block.insertAdjacentHTML('beforeend', template);
    const container = document.querySelector('.blog-container');

    container.querySelector('.content').prepend(defaultContent);
  }
}
