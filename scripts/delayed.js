// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
if (window.location.hostname === 'www.headwire.workers.dev') {
  document.head.insertAdjacentHTML('beforeend', `
    <script src="https://app.enzuzo.com/apps/enzuzo/static/js/__enzuzo-cookiebar.js?uuid=04cbcc9c-62ba-11ee-b344-331207534791"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-C3VLD9MKXK"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
    
        gtag('config', 'G-C3VLD9MKXK');
    </script>
  `);
}