'use strict';

(function() {
  window.convertToImage = function() {
    // html2canvas(document.getElementById('html2canvas-content'), {
    //   onrendered: function(canvas) {
    //     document.body.appendChild(canvas);
    //   },
    //   width: 300,
    //   height: 400,
    // });
    html2canvas(document.querySelector('#html2canvas-content')).then(canvas => {
      document.body.appendChild(canvas);
    });
  };
})();
