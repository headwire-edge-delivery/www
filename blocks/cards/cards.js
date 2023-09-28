import {
  buildBlock, createOptimizedPicture, decorateBlock, loadBlock,
} from '../../scripts/lib-franklin.js';

function generateBlogCard(blogData) {
  const keywordsArray = blogData.keywords ? blogData.keywords.split(',').map((keyword) => keyword.trim()) : [];

  return `
        <li class="blog-card">
          <a href="${blogData.path}" class="blog-card-image-link"> 
              <div class="blog-card-image">
                  ${createOptimizedPicture(blogData.image, blogData.imageAlt || blogData.title, false, [{ width: '750' }]).outerHTML}
              </div>
          </a>
          <div class="blog-card-content">
              <div class="blog-card-author-date">${blogData.author ? `${blogData.author} • ` : ''}${blogData.publicationDate}</div>
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
  const isBlog = block.classList.contains('blog');
  if (isBlog) {
    let blogData = [];

    const req = await fetch('/query-index.json');
    if (req.ok) {
      const res = await req.json();
      blogData = res.data
        .filter((item) => item.path.startsWith('/blog/'))
        .sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));

      // First blog becomes Hero
      const heroData = blogData.shift();
      if (heroData) {
        const keywordsArray = heroData.keywords ? heroData.keywords.split(',').map((keyword) => keyword.trim()) : [];

        const image = createOptimizedPicture(heroData.image, '', true);

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'image-wrapper';
        imageWrapper.append(image);

        const subTitle = document.createElement('h2');
        subTitle.textContent = 'Our Latest Article';

        const title = document.createElement('h1');
        title.textContent = heroData.title;

        const description = document.createElement('p');
        description.textContent = heroData.description;

        const heroAuthorDate = document.createElement('div');
        heroAuthorDate.className = 'blog-card-author-date';
        heroAuthorDate.textContent = heroData.author ? `${heroData.author} • ${heroData.publicationDate}` : `${heroData.publicationDate}`;

        const details = document.createElement('div');
        details.className = 'details';

        details.append(description);

        const tagsHTML = keywordsArray.length ? `<ul class="tags">${keywordsArray.map((keyword) => `<li>${keyword}</li>`).join('')}</ul>` : '';

        details.insertAdjacentHTML('beforeend', tagsHTML);

        const link = document.createElement('a');
        link.className = 'button';
        link.href = heroData.path;

        const readIcon = document.createElement('img');
        readIcon.src = '../../icons/arrow-up-right.svg';
        readIcon.alt = 'Read Icon';
        readIcon.className = 'read-icon';

        link.appendChild(document.createTextNode('Read Post '));
        link.appendChild(readIcon);

        details.append(link);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper';
        contentWrapper.append(subTitle, heroAuthorDate, title, description, details);

        const flexParent = document.createElement('div');
        flexParent.className = 'hero-blog-wrapper';
        flexParent.append(imageWrapper, contentWrapper);

        const hero = buildBlock('hero', { elems: [flexParent] });
        hero.classList.add('blog');

        const section = document.createElement('div');
        section.className = 'section';
        section.append(hero);

        // Load hero
        await decorateBlock(hero);
        await loadBlock(hero);

        // Add hero to main once loaded
        document.querySelector('main').prepend(section);

        // Process the rest of the blogs
        if (blogData.length) {
          block.innerHTML = `<h2>More Blog Posts</h2><ul class="blog-cards">${blogData.map((data) => generateBlogCard(data)).join('')}</ul>`;
        }
      }
    }
  } else {
    const ul = document.createElement('ul');
    [...block.children].forEach((row) => {
      const li = document.createElement('li');
      while (row.firstElementChild) li.append(row.firstElementChild);
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
        else div.className = 'cards-card-body';
      });
      ul.append(li);
    });

    block.textContent = '';
    block.append(ul);
  }
}
