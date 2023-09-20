import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

function generateBlogCard(blogData) {
  const keywordsArray = blogData.keywords ? blogData.keywords.split(',').map((keyword) => keyword.trim()) : [];

  return `
        <li class="blog-card">
            <div class="blog-card-image">
                ${createOptimizedPicture(blogData.image, blogData.imageAlt || blogData.title, false, [{ width: '750' }]).outerHTML}
            </div>
            <div class="blog-card-content">
                <div class="blog-card-title">
                    <h3>${blogData.title}</h3>
                </div>
                <div class="blog-card-description">
                    <p>${blogData.description}</p>
                    <div class="blog-card-author">
                        Written by: <span>${blogData.author}</span>
                    </div>
                </div>
                ${keywordsArray.length ? `<ul class="blog-card-tags">${keywordsArray.map((keyword) => `<li>${keyword}</li>`).join('')}</ul>` : ''}
            </div>
            <a href="${blogData.path}" class="blog-card-link"">Continue Reading</a>
        </li>
    `;
}

export default async function decorate(block) {
  const ul = document.createElement('ul');

  if (block.classList.contains('blog')) {
    let data = [];

    try {
      const req = await fetch('/query-index.json');
      if (req.ok) {
        const res = await req.json();
        data = res.data.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));
      } else {
        return;
      }
    } catch (err) {
      return;
    }

    data.forEach((item) => {
      const li = generateBlogCard(item);
      ul.innerHTML += li;
    });
  } else {
    [...block.children].forEach((row) => {
      const li = document.createElement('li');
      while (row.firstElementChild) li.append(row.firstElementChild);
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
        else div.className = 'cards-card-body';
      });
      ul.append(li);
    });
  }

  block.textContent = '';
  block.append(ul);
}
