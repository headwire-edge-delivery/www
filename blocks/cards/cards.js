import {
  buildBlock, createOptimizedPicture, decorateBlock, loadBlock, toClassName,
} from '../../scripts/lib-franklin.js';

function generateBlogCard(blogData) {
  const keywordsArray = blogData.keywords ? blogData.keywords.split(',').map((keyword) => keyword.trim()) : [];
  return `
    <li class="blog-card">
        <a href="${blogData.path}" class="blog-card-wrapper">
            <div class="blog-card-image">
                ${createOptimizedPicture(blogData.image, blogData.imageAlt || blogData.title, false, [{ width: '750' }]).outerHTML}
            </div>
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
        </a>
    </li>
`;
}

function blogFilter(blogData, isBlogCategory) {
  if (!blogData.path.startsWith('/blog/')) {
    return false;
  }

  const blogCategoryFilter = isBlogCategory ? window.location.pathname.replace('/blog/categories/', '') : null;

  if (!blogCategoryFilter) {
    return !blogData.path.startsWith('/blog/categories');
  }

  const tags = blogData.keywords.split(',').map((word) => toClassName(word.trim()));
  return tags.includes(blogCategoryFilter);
}

export default async function decorate(block) {
  const isBlog = block.classList.contains('blog');
  const isBlogCategory = block.classList.contains('blog-category');

  if (isBlog) {
    let blogData = [];

    const req = await fetch('/query-index.json');
    if (req.ok) {
      const res = await req.json();
      blogData = res.data
        .filter((item) => blogFilter(item, isBlogCategory))
        .sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));

      // First blog becomes Hero
      const heroData = blogData.shift();
      if (heroData) {
        const keywordsArray = heroData.keywords ? heroData.keywords.split(',').map((keyword) => keyword.trim()) : [];

        const image = createOptimizedPicture(heroData.image, '', true);

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'image-wrapper';
        imageWrapper.append(image);

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

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper';
        contentWrapper.append(heroAuthorDate, title, description, details);

        const link = document.createElement('a');
        link.className = 'hero-blog-link';
        link.href = heroData.path;
        link.append(imageWrapper, contentWrapper);

        const flexParent = document.createElement('div');
        flexParent.className = 'hero-blog-wrapper';
        flexParent.append(link);

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
