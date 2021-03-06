"use strict";

(function() {
  window.convertToImage = function() {
    var content = document.querySelector("#container");
    html2canvas(content, {
      // removeCanvas: false,
      onclone: function(doc) {
        return new Promise(function(resolve) {
          // Rules from external stylesheets must be placed inline
          // for all SVGs because html2canvas does not read
          // external CSS of SVG elements.

          // Strategy 1:
          // Search for both rules and elements that match the following
          // expression, then inline the rules into the elements.
          // window.inlineStyles('svg g path.highlighted.hexagon.transparent');

          // Strategy 2:
          // Get an element's computed style and inline everything.
          // Unlike #1, this captures the final output of our browser's CSS engine;
          // it ought to be an exact inline match.
          var elements = doc.querySelectorAll("svg g path");
          elements.forEach(function(element) {
            window.inlineComputedStyle(element);
          });

          // Now force SVG images to use base64 data URIs.
          var elements = doc.querySelectorAll("svg image");
          var count = 0;
          elements.forEach(function(element) {
            fetch(element.href.baseVal)
              .then(function(response) {
                return response.blob();
              })
              .then(
                function(response) {
                  var reader = new FileReader();
                  reader.readAsDataURL(response); // read as base64
                  reader.addEventListener(
                    "load",
                    function() {
                      // Set the element's value to our base64 encoded URI.
                      var uri = reader.result;
                      this.href.baseVal = uri;
                      // Resolve only if all elements have been updated.
                      count++;
                      if (count === elements.length) {
                        resolve();
                      }
                    }.bind(this), // bind "this" to the element
                    false
                  );
                }.bind(element)
              );
          });
        });
      }
    }).then(canvas => {
      document.body.appendChild(canvas);
    });
  };

  window.inlineComputedStyle = function(element, options) {
    if (!options) {
      options = {};
    }
    var computedStyle = window.getComputedStyle(element);
    for (var i = 0; i < computedStyle.length; i++) {
      var property = computedStyle.item(i);
      var match =
        !options.properties || options.properties.indexOf(property) >= 0;
      if (match) {
        var value = computedStyle.getPropertyValue(property);
        element.style[property] = value;
      }
    }
  };

  window.inlineStyles = function(selectorText) {
    var getRules = function(styleSheet) {
      var rules = Array.from(styleSheet.cssRules);
      return rules;
    };

    var saveStyles = function(element, stylesDeclaration) {
      for (var i = 0; i < stylesDeclaration.length; i++) {
        var name = stylesDeclaration.item(i);
        var value = stylesDeclaration.getPropertyValue(name);
        element.style.setProperty(name, value);
      }
    };

    var inlineRuleStyles = function(elements, rule) {
      Array.from(elements).forEach(function(element) {
        saveStyles(element, rule.style);
      });
    };

    // Get all stylesheets.
    var styleSheets = Array.from(document.styleSheets);
    styleSheets.forEach(function(styleSheet) {
      // Get all rules within this stylesheet.
      getRules(styleSheet).forEach(function(rule) {
        // Determine if the rule from this stylesheet matches our selectorText.
        // A partial match like ".highlighted" within "path.highlighted.hexagon"
        // will work fine.
        var position = selectorText.indexOf(rule.selectorText);
        // Because we are matching by string comparision,
        // some matches will not be found, e.g. an input of
        // "path.highlighted.transparent" will not match a CSS rule of
        // "g .transparent" even if it does match in the borwser.
        if (position !== -1) {
          // Get all DOM elements to which the rule applies.
          var elements = document.querySelectorAll(selectorText);
          inlineRuleStyles(elements, rule);
        }
      });
    });
  };
})();
