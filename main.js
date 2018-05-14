"use strict";

(function() {
  window.convertToImage = function() {
    var content = document.querySelector("#container");
    html2canvas(content, {}).then(canvas => {
      document.body.appendChild(canvas);
    });
  };
})();
