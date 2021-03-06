define(function(require) {
  "use strict";

  var $ = require("jquery");

  // Lazy-load in tile images
  $(".tile").find("img").unveil(200, function() {
    $(this).load(function() {
      this.style.opacity = 1;
    });
  });


  /**
   * This is a temporary fix until the next Neue release!
   * @TODO: Remove when Neue 6.0.0-beta5 is merged in!
   *
   * Replace the `video` tag in a tile with a static image, based on either the `poster`
   * attribute of the video, or an included `img` fallback source.
   */
  function replaceVideoWithImage() {
    var poster = $(this).find('img').attr('src') || $(this).attr('poster');
    $(this).replaceWith($("<img>").attr('src', poster));
  }

  // On Mobile Safari, we need to replace `<video>` with a static image so the "play" control does not appear.
  // Yes, this is browser sniffing - but we're fixing a browser-specific quirk so I don't think it's evil.
  if (window.navigator.userAgent.match(/iPad/i) || window.navigator.userAgent.match(/iPhone/i)) {
    $(function() {
      $(".tile video").each(replaceVideoWithImage);
    });
  }

});
