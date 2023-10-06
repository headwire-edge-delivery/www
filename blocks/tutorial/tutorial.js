import { loadBlocks, decorateBlock } from "../../scripts/lib-franklin.js";

export default async function decorate(block) {
  const outOfTutorialLinks = block.querySelectorAll(
    `a:not([target="_blank"]):not([href^="${window.location.origin}/drafts/"]):not([href^="/drafts/"])`
  );

  if (outOfTutorialLinks) {
    outOfTutorialLinks.forEach((anchor) => {
      anchor.setAttribute("target", "_blank");
    });
  }

  block.querySelectorAll(".cards, .hero, .banner, .formspree, .columns").forEach((innerBlock) => decorateBlock(innerBlock));
  loadBlocks(document.querySelector("main"));

  const blockExamples = block.querySelectorAll("div[data-block-name]");
  if (blockExamples) {
    blockExamples.forEach((innerBlock) => {
      const exampleWrapper = document.createElement("div");
      exampleWrapper.className = "block-example-wrapper";

      // creating block example definition
      const blockClassList = innerBlock.className
        .split(" ")
        .slice(0, -1)
        .map((word) => word.replaceAll("-", " "));
      const blockExampleText =
        blockClassList.length > 1 ? `${blockClassList[0]} (${blockClassList.slice(1).join(", ")})` : blockClassList[0];

      const tableHtml = `
      <div class="table-wrapper">
        <span class="table-title">Block Definition:</span>
        <table class="block-example-table">
          <tr>
            <td>${blockExampleText}</td>
          </tr>
        </table>
      </div>
      `;

      exampleWrapper.innerHTML = tableHtml;
      innerBlock.parentElement.insertBefore(exampleWrapper, innerBlock);

      const innerBlockWrapper = document.createElement("div");
      innerBlockWrapper.className = "inner-block-wrapper";
      innerBlockWrapper.append(innerBlock);
      exampleWrapper.append(innerBlockWrapper);
    });
  }

  const blockTutorialLinks = [...block.querySelectorAll('a[href*="/drafts/blocks/"]')];
  const tutorialNavigation = document.createElement("div");
  tutorialNavigation.className = "tutorial-nav-wrapper";

  tutorialNavigation.innerHTML = `
  <span class="tutorial-nav-title">Tutorial Navigation</span>
  <nav class="tutorial-nav">
    <ul class="main-link-list">
      <li>
        <a href="/drafts/creating-documents">Creating Documents</a>
      </li>
    </ul>
    ${blockTutorialLinks.length ? `<ul>
      ${blockTutorialLinks.map((link) => `<li>${link.outerHTML}</li>`).join("")}
    </ul>` : ''}
  </nav>
  `;

  const tutorialNavToggle = document.createElement('button')
  tutorialNavToggle.className = 'tutorial-nav-toggle'
  tutorialNavToggle.onclick = () => tutorialNavigation.classList.toggle('open')

  tutorialNavigation.prepend(tutorialNavToggle)

  block.append(tutorialNavigation);
}
