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
            <button onclick="location.href='${blogData.path}'" class="blog-card-button" title="Read more about ${blogData.title}">
              Read More
            </button>
        </li>
    `;
}

export default async function decorate(block) {
  const ul = document.createElement('ul');

  if (block.classList.contains('blog')) {
    let blogData = [];

    try {
      const req = await fetch('/query-index.json');
      if (req.ok) {
        const res = await req.json();
        blogData = res.data;
      } else {
        return;
      }
    } catch (err) {
      return;
    }

    blogData.forEach((data) => {
      const li = generateBlogCard(data);
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
