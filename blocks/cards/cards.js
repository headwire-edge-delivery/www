import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

function generateBlogCard(blogData) {
  const keywordsArray = blogData.keywords ? blogData.keywords.split(',').map((keyword) => keyword.trim()) : [];
  const publishedDate = blogData.publicationDate;
  return `
  <li class="blog-card">
      <a href="${blogData.path}" class="blog-card-image-link"> 
          <div class="blog-card-image">
              ${createOptimizedPicture(blogData.image, blogData.imageAlt || blogData.title, false, [{ width: '750' }]).outerHTML}
          </div>
      </a>
      <div class="blog-card-content">
          <div class="blog-card-author-date">${blogData.author ? `${blogData.author} • ` : ''}${publishedDate}</div>
          <div class="blog-card-title">
              <h3>${blogData.title}</h3>
          </div>
          <div class="blog-card-description">
              <p>${blogData.description}</p>
          </div>
          ${keywordsArray.length ? `<ul class="blog-card-tags">${keywordsArray.map((keyword) => `<li>${keyword}</li>`).join('')}</ul>` : ''}
      </div>
      <a href="${blogData.path}" class="blog-card-link">Read Post <img src="../../icons/arrow-up-right.svg" alt="Read Icon" class="read-icon"></a>
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
        blogData = res.data
          .filter((item) => item.path.startsWith('/blog/'))
          .sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));
      } else {
        return;
      }
    } catch (err) {
      return;
    }
    // Lastest blog becomes Hero
    const heroData = blogData.shift();
    if (heroData) {
      const heroBlock = document.querySelector('.hero.blog.block');
      if (heroBlock) {
        const publishedDate = heroData.publicationDate;
        const heroImageData = createOptimizedPicture(heroData.image, heroData.imageAlt || heroData.title, true, [{ width: '750' }]).outerHTML;
        const keywordsList = heroData.keywords ? heroData.keywords.split(',').map((keyword) => `<li>${keyword.trim()}</li>`).join('') : '';

        heroBlock.innerHTML = `
          <div class="hero-content-wrapper">
              <div class="hero-latest">Our latest article</div>
              <div class="hero-author-date">${heroData.author ? `${heroData.author} • ` : ''}<span>${publishedDate}</span></div>
              <h1 class="hero-title">${heroData.title}</h1>
              <div class="hero-description">${heroData.description}</div>
              <ul class="hero-keywords">${keywordsList}</ul>
              <a href="${heroData.path}" class="hero-link">Read Post <img src="../../icons/arrow-up-right.svg" alt="Read Icon" class="read-icon"></a>
          </div>
          <div class="hero-image-wrapper">
          <a href="${heroData.path}" class="hero-image-link"> 
          <div class="hero-image">${heroImageData}</div>
      </a>
          </div>
        `;
      }
    }

    // Process the rest of the blogs
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
