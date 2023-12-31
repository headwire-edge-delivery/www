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
      <div class="input-wrapper">
        <div class="input-subwrapper">
          <label for="first-name">First Name </label>
          <input type="text" name="first_name" id="first-name" placeholder="First name" required="">
        </div>
        <div class="input-subwrapper">
          <label for="last-name">Last Name </label>
          <input type="text" name="last_name" id="last-name" placeholder="Last name" required="">
        </div>
      </div>
      <label for="email-address">Email Address </label>
      <input type="email" name="_replyto" id="email-address" placeholder="email@domain.tld" required="">
      <label for="message">Message</label>
      <textarea rows="5" name="message" id="message" placeholder="Your message here." required=""></textarea>
      <input type="hidden" name="_subject" id="email-subject" value="Contact Form Submission">
    </fieldset>
    <input type="submit" value="Submit">
  </form>
`);
}
