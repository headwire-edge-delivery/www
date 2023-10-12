import { renderResults } from '../../scripts/scripts.js';

export default async function decorate(block) {
  block.insertAdjacentHTML('beforeend', `
    <form action="" method="get" class="search-form">
        <input type="text" name="search" placeholder="Search for..." class="search-input" />
        <button type="submit" class="search-button">
          <img src="../icons/search-white.svg" alt="Search" />
        </button>
    </form>
    `);

  // extract search term from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q');

  if (searchTerm) {
    const searchField = block.querySelector('.search-input');
    searchField.value = searchTerm;

    const response = await fetch(`https://gd-search.gd-search.workers.dev/?search=${searchTerm}`);
    const data = await response.json();

    // only display if results are found for the search term
    if (data && data.length) {
      block.insertAdjacentHTML('beforeend', `
      <div class="results-summary-and-sorting">
          <span class="results-summary"></span>
          <div class="sort-container">
              <span>Sort By</span>
              <select class="results-sorting">
                  <option value="relevance">Relevance</option>
                  <option value="oldest">Oldest Content</option>
                  <option value="newest">Newest Content</option>
              </select>
          </div>
      </div>
      <div class="content-wrapper">
          <div class="tags-panel-container">
              <button class="tags-toggle-btn">TAGS</button>
              <div class="tags-panel"></div>
          </div>
          <div class="results-container"></div>
      </div>
  `);

      // create result card and tags list
      const resultsContainer = block.querySelector('.results-container');
      const tagsPanel = block.querySelector('.tags-panel');

      renderResults(data, resultsContainer, tagsPanel);

      // display summary of search results
      const resultsSpan = block.querySelector('.results-summary');
      resultsSpan.innerHTML = `Showing <strong>${data.length}</strong> result${data.length !== 1 ? 's' : ''} for <strong>"${searchTerm}"</strong>`;

      // toggle tags
      const tagsToggleButton = block.querySelector('.tags-toggle-btn');
      tagsToggleButton.addEventListener('click', () => {
        tagsPanel.classList.toggle('hidden');
        tagsToggleButton.classList.toggle('tags-open');
      });

      // Retrieve the current sort order from the dropdown
      const sortDropdown = block.querySelector('.results-sorting');
      // Listen for changes in the sort dropdown and re-render the results accordingly
      sortDropdown.addEventListener('change', () => {
        const sortOrder = sortDropdown.value;
        renderResults(data, resultsContainer, tagsPanel, null, sortOrder);
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
