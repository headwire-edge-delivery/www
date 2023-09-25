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
          <div class="blog-card-title">
              <h3>${blogData.title}</h3>
          </div>
          <div class="blog-card-description">
              <p>${blogData.description}</p>
          </div>
          <div class="blog-card-author-date">
            <strong>By ${blogData.author}</strong>
            <span>${blogData.publicationDate}</span>
          </div>
          ${keywordsArray.length ? `<ul class="tags">${keywordsArray.map((keyword) => `<li>${keyword}</li>`).join('')}</ul>` : ''}
      </div>
      <a href="${blogData.path}" class="button">Read Post</a>
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
        const image = createOptimizedPicture(heroData.image, '', true);

        const title = document.createElement('h1');
        title.textContent = heroData.title;

        const details = document.createElement('p');

        const description = document.createElement('em');
        description.textContent = heroData.description;

        const author = document.createElement('strong');
        author.className = 'author';
        author.textContent = `By ${heroData.author}`;
        const date = document.createElement('span');
        date.className = 'date';
        date.textContent = heroData.publicationDate;
        const keywords = document.createElement('ul');
        keywords.className = 'tags';
        heroData.keywords.split(',').forEach((keyword) => {
          const li = document.createElement('li');
          li.textContent = keyword.trim();
          keywords.append(li);
        });
        const link = document.createElement('a');
        link.className = 'button';
        link.href = heroData.path;
        link.textContent = 'Read Post';

        details.append(description);
        details.append(author);
        details.append(date);
        details.append(keywords);
        details.append(link);

        const hero = buildBlock('hero', { elems: [image, title, details] });
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
