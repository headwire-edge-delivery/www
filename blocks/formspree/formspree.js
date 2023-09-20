/**
 * loads formspree
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const link = block.querySelector('a[href^="#mailto"]');
  if (link) {
    link.setAttribute('href', link.getAttribute('href').slice(1));
  }

  block.insertAdjacentHTML('beforeend', `
    <form id="fs-frm" name="simple-contact-form" accept-charset="utf-8" action="https://formspree.io/f/mgejnypy" method="post">
      <fieldset id="fs-frm-inputs">
        <label for="full-name">Full Name</label>
        <input type="text" name="name" id="full-name" placeholder="First and Last" required="">
        <label for="email-address">Email Address</label>
        <input type="email" name="_replyto" id="email-address" placeholder="email@domain.tld" required="">
        <label for="message">Message</label>
        <textarea rows="5" name="message" id="message" placeholder="Aenean lacinia bibendum nulla sed consectetur. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Donec ullamcorper nulla non metus auctor fringilla nullam quis risus." required=""></textarea>
        <input type="hidden" name="_subject" id="email-subject" value="Contact Form Submission">
      </fieldset>
      <input type="submit" value="Submit">
    </form>
  `);
}
