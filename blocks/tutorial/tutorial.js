export default async function decorate(block) {
  const listLinks = block.querySelectorAll('ul li a, ol li a')

  if (listLinks) {
    listLinks.forEach((anchor) => {
      anchor.setAttribute('rel', 'noopener noreferrer nofollow')
      anchor.setAttribute('target', '_blank')
    })
  }

  console.log(block.outerHTML)
  // block.querySelectorAll('.cards').forEach((innerBlock) => decorateBlock(innerBlock));
  // loadBlocks(document.querySelector('main'));

  console.log("\x1b[34m ~ TEST:", block.outerHTML)
  const blockExamples = block.querySelectorAll('div[data-block-name]')
  if (blockExamples) {
    blockExamples.forEach((block) => {
      const className = block.className
      console.log("\x1b[31m ~ className:", className)
      block.parentElement.classList.add('tutorial-block-wrapper')
    })
  }




}