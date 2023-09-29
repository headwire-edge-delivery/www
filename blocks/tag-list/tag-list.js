export default async function decorate (block) {
  block.innerHTML = ''
  const response = await fetch('/query-index.json')
  const data = await response.json()


  // match paths that start with "/blog/categories/" and have at least one extra character
  // so that the index page will not appear
  const tagList = data.data.filter(item => item.path.match(/^\/blog\/categories\/./g))

  const title = document.createElement('h1')
  title.className = 'categories-title'
  title.textContent = 'Blog Article Categories'
  block.append(title)
  
  const articleContent = document.createElement('article')

  tagList.forEach(item => {
    const anchor = document.createElement('a')
    anchor.className = 'button tag-button'
    anchor.href = item.path

    anchor.textContent = item.description.includes(' Blog Articles') ? item.description.split(' Blog Articles')[0] : item.path.replace('/blog/categories/', '').toUpperCase()
    articleContent.append(anchor)
  });

  block.append(articleContent)
}