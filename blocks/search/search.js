import { renderResults } from '../../scripts/scripts.js';

export default async function decorate(block) {
  let data = [];
  block.insertAdjacentHTML('beforeend', `
    <form action="" method="get" class="search-form">
        <input type="text" name="search" placeholder="Search for..." class="search-input" />
        <button type="submit" class="search-button">
          <img src="../icons/search-white.svg" alt="Search" />
        </button>
    </form>
    `);

  const createMobileFilterOverlay = () => {
    const overlay = document.createElement('div');
    overlay.classList.add('filter-overlay');
    overlay.innerHTML = `
        <header>
          <strong>Filter By</strong>
          <button class="close-overlay">X</button>
        </header>
        <div class="tags-panel-mobile"></div>
        <button class="done-button">Done</button>
      `;

    document.body.appendChild(overlay);
    return overlay;
  };

  const mobileOverlay = createMobileFilterOverlay();
  const tagsPanelMobile = mobileOverlay.querySelector('.tags-panel-mobile');

  const closeOverlayButton = mobileOverlay.querySelector('.close-overlay');
  closeOverlayButton.addEventListener('click', () => {
    mobileOverlay.style.display = 'none';
  });

  const doneButton = mobileOverlay.querySelector('.done-button');
  // handle tag selection and search results update
  doneButton.addEventListener('click', () => {
    const checkedTags = Array.from(mobileOverlay.querySelectorAll('input[type="checkbox"]:checked')).map((checkbox) => checkbox.value);
    const resultsContainer = document.querySelector('.results-container');
    const tagsPanel = document.querySelector('.tags-panel');
    renderResults(data, resultsContainer, tagsPanel, undefined, checkedTags);
    mobileOverlay.style.display = 'none';

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('tags');
    checkedTags.forEach((tag) => {
      currentUrl.searchParams.append('tags', tag);
    });
    window.history.pushState({}, '', currentUrl.toString());
  });

  // extract search term from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q');

  if (searchTerm) {
    const searchField = block.querySelector('.search-input');
    searchField.value = searchTerm;

    const response = await fetch(`https://search.headwire.workers.dev/?search=${searchTerm}`);
    data = await response.json();

    // only display if results are found for the search term
    if (data && data.length) {
      block.insertAdjacentHTML('beforeend', `
        <div class="results-summary-and-sorting">
          <span class="results-summary"></span>
          <div class="sort-container">
          <label for="results-sorting" class="sort-by">Sort By</label>
            <select class="results-sorting" aria-label="Sort results by">
              <option value="relevance">Relevance</option>
              <option value="oldest">Oldest Content</option>
              <option value="newest">Newest Content</option>
            </select>
          </div>
        </div>
        <button class="filter-by-btn-mobile">Filter By</button>
        <div class="content-wrapper">
          <div class="tags-panel-container-desktop">
            <button class="tags-toggle-btn">TAGS</button>
            <div class="tags-panel"></div>
          </div>
          <div class="results-container"></div>
        </div>
      `);

      // "Filter By" button event listener for mobile
      const filterByButtonMobile = block.querySelector('.filter-by-btn-mobile');
      filterByButtonMobile.addEventListener('click', () => {
        mobileOverlay.style.display = 'block';
      });

      // create result card and tags list
      const resultsContainer = block.querySelector('.results-container');
      const tagsPanel = block.querySelector('.tags-panel');
      renderResults(data, resultsContainer, tagsPanel);

      // Populate the mobile tags panel
      tagsPanelMobile.innerHTML = block.querySelector('.tags-panel-container-desktop').innerHTML;

      // toggle tags mobile
      const tagsToggleBtnMobile = mobileOverlay.querySelector('.tags-toggle-btn');
      tagsToggleBtnMobile.addEventListener('click', () => {
        const tagsPanelInMobile = mobileOverlay.querySelector('.tags-panel');
        tagsPanelInMobile.classList.toggle('hidden');
        tagsToggleBtnMobile.classList.toggle('tags-open');
      });

      // toggle tags desktop
      const tagsToggleButton = block.querySelector('.tags-toggle-btn');
      tagsToggleButton.addEventListener('click', () => {
        tagsPanel.classList.toggle('hidden');
        tagsToggleButton.classList.toggle('tags-open');
      });

      // display summary of search results
      const resultsSpan = block.querySelector('.results-summary');
      resultsSpan.innerHTML = `Showing <strong>${data.length}</strong> result${data.length !== 1 ? 's' : ''} for <strong>"${searchTerm}"</strong>`;

      // Retrieve the current sort order from the dropdown
      const sortDropdown = block.querySelector('.results-sorting');
      sortDropdown.setAttribute('aria-label', 'Sort search results by');
      // Listen for changes in the sort dropdown and re-render the results accordingly
      sortDropdown.addEventListener('change', () => {
        const sortOrder = sortDropdown.value;
        renderResults(data, resultsContainer, tagsPanel, sortOrder);
      });
    } else {
      block.insertAdjacentHTML('beforeend', `
      <div class="results-summary-and-sorting">
          <span class="results-summary">No results found for <strong>"${searchTerm}"</strong></span>
      </div>
  `);
    }
  }

  // form submission
  block.querySelector('.search-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous search message
    const resultsContainer = block.querySelector('.results-summary-and-sorting');
    if (resultsContainer) resultsContainer.remove();

    const term = e.target.querySelector('.search-input').value;

    if (term.trim() === '') {
      // Clear existing search results
      const existingResultsContainer = block.querySelector('.content-wrapper');
      if (existingResultsContainer) existingResultsContainer.remove();

      // Clear the summary (for both successful and unsuccessful results)
      const existingSummary = block.querySelector('.results-summary-and-sorting');
      if (existingSummary) existingSummary.remove();

      // Display the message
      block.insertAdjacentHTML('beforeend', `
          <div class="results-summary-and-sorting">
              <span class="results-summary">Please enter a search term.</span>
          </div>
      `);
    } else {
      window.location.href = `/search-results?q=${encodeURIComponent(term)}`;
    }
  });
}
