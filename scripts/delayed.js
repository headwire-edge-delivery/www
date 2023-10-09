// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

// Analytics
if (window.location.hostname === 'www.headwire.workers.dev') {
  document.head.insertAdjacentHTML('beforeend', `
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-C3VLD9MKXK"></script>
      <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
      
          gtag('config', 'G-C3VLD9MKXK');
      </script>
    `);
}
