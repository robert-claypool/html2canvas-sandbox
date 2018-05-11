"use strict";

(function() {
  window.convertToImage = function() {
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
    var elements = document.querySelectorAll("svg g path");
    elements.forEach(function(element) {
      window.inlineComputedStyle(element);
    });

    // Now force SVG images to use base64 data URIs.
    var elements = document.querySelectorAll("svg image");
    elements.forEach(function(element) {
      // Attaching the element to global scope is an ugly hack.
      window.svgImageRef = element;
      fetch(element.href.baseVal)
        .then(response => {
          return response.blob();
        })
        .then(response => {
          var reader = new FileReader();
          reader.readAsDataURL(response);
          reader.addEventListener(
            "load",
            function() {
              var uri = reader.result;
              window.svgImageRef.href.baseVal = uri;
            },
            false
          );
        });
    });

    // This setTimeout is an ugly hack.
    setTimeout(function() {
      var content = document.querySelector("#container");
      html2canvas(content).then(canvas => {
        document.body.appendChild(canvas);
      });
    }, 200);
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
