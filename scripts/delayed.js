// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
const cookieBanner = document.getElementById('cookie-notification');
if (cookieBanner) {
  cookieBanner.classList.add('appear');
}
