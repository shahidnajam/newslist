/*
 * News List
 * @author Michael Chadwick
 * @url http://nebyooweb.com
 * @url http://github.com/nebyoolae/newslist
 * @license Licensed under the MIT License
 * @description jQuery plugin that presents multiple news items in an auto-cycling slideshow with additional manual control
 */

/* News List is a simple way to display a list of items in a auto-cycling slideshow.
 * By calling the newslist() method on an element with the correct structure shown
 * below, control links will be automatically created. Items will fade in and out 
 * over a configurable amount of time, but any individual item can be chosen manually,
 * which will stop the auto-cycle. The class for the cycler and the control link hover
 * will need to be changed in the newslist.css file if you don't use the defaults.
 *
 * Simple usage:
 *   $('elem').newslist();
 *
 * Advanced usage (with defaults listed): 
 *   $('elem').newslist({
 *     'itemsDiv'       : '.items',     // class of news items container
 *     'item'           : '.item',      // class of individual news item
 *     'controlsDiv'    : '.controls',  // class of control link container
 *     'cycler'         : '.cycler',    // class of auto-cycle toggle
 *     'hoverClass'     : 'on',         // class for hovering over control links
 *           
 *     'cycleSpeed'     : 10000,        // speed, in milliseconds, of auto-cycler
 *     'fadeSpeed'      : 1000,         // speed, in milliseconds, for news item to fade in
 *     'maxLoops'       : -1,           // number of times the whole slideshow should loop; 
 *                                         if non-positive integer, will loop indefinitely
 *           
 *     'leadZero'       : false         // should the control links use a leading zero for items 1-9?
 *   });
 *
 * HTML:
 * <script type="text/javascript" src="newslist.js"></script>
 * <div id="newslist">
 *   <div class="items">
 *     <div class="item">News item #1.</div>
 *		 <div class="item">News item #2.</div>
 *		 <div class="item">News item #3.</div>
 *		 <div class="item">News item #4.</div>
 *   </div>
 *   <div class="controls"></div>
 *   <input type="hidden" class="cycler" />
 * </div>
 * <script type="text/javascript">
 *   $("#newslist").newslist();
 * </script>
**/

(function($) {

  $.fn.newslist = function(options) {
    return this.each(function() {
      $.init(this, options);
    });
  };

  // initialize all components and start item cycle
  $.init = function(container, options) {

    var $nl = $(container);
    
    var settings = {
      'itemsDiv'       : '.items',
      'item'           : '.item',
      'controlsDiv'    : '.controls',
      'cycler'         : '.cycler',
      'hoverClass'     : 'on', 
      'cycleSpeed'     : 10000,
      'fadeSpeed'      : 1000,
      'maxLoops'       : -1,      
      'leadZero'       : false            
    };

    // customize settings if args exist
    if (options) {
      $.extend(settings, options);
    }

    var $itemsDiv = $nl.children(settings.itemsDiv); // grab div with items in it
    var $items = $nl.children().children(settings.item); // grab all items
    var $controlsDiv = $nl.children(settings.controlsDiv); // grab div with control links
        
    // attach ids to all items
    var i = 1;
    $items.each(function() {
      $(this).attr("id", "item" + i++);
    });
        
    // create a control link for each item
    for (i = 1; i <= $items.length; i++) {
      if(i < 10 && settings.leadZero) {
        itext = "0" + i;
      } else {
        itext = i;
      }
      $controlsDiv.append("<a rel=\"" + i + "\" id=\"control" + i + "\" href=\"#" + i + "\">" + itext + "</a>");
    }

    var $controls = $controlsDiv.children("a"); // grab all control links
        
    // attach click event to all control links
    $controls.each(function() {
      $(this).click(function(e) {
        e.preventDefault();
        // turn off cycler
        $cycler.attr('value', 'false');
        // change current item to one associated with control link clicked
        $.changeItemTo($items, $controls, $(this), settings.fadeSpeed);
      });
    });
        
    // attach hover event to all control links
    $controls.hover(
      function() { $(this).addClass(settings.hoverClass); },
      function() { $(this).removeClass(settings.hoverClass); }
    );
        
    // load first news item
    $items.hide();
    $items.eq(0).fadeIn(settings.fadeSpeed);
    $controls.eq(0).addClass("current");
    $itemsDiv.css("overflow", "hidden");

    var $cycler = $(settings.cycler);
    var maxLoops = (settings.maxLoops >= 0) ? (settings.maxLoops * ($items.length-1)) : -1;
        
    // turn on cycler
    $cycler.attr('value', 'true');
        
    // start the cycle of items
    $.cycleItems($items, $controls, $controls.eq(0), $cycler, settings.fadeSpeed, settings.cycleSpeed, 0, maxLoops);

  };

  /****************************/
  /* Item slideshow functions */
  /****************************/

  // manual: click control link to change item; interrupts auto
  $.changeItemTo = function($items, $controls, link, fadeSpeed) {
    
    $items.hide();
    $items.filter("#item" + link.attr("rel")).fadeIn(fadeSpeed);
    $controls.removeClass("current");
    link.addClass("current");
  
  };

  // auto: cycle items
  $.cycleItems = function($items, $controls, $curControl, $cycler, fadeSpeed, cycleSpeed, curLoop, maxLoops) {

    setTimeout(function() {          
      if ( ((curLoop < maxLoops) || (maxLoops == -1)) && ($cycler.attr('value') !== 'false') ) {
        var curItemId = parseInt($curControl.attr("rel"));
        var nextItemId = curItemId + 1;

        if (nextItemId > $items.length) {                  
          nextItemId = 1;                   
          curItemId = 0;
        }

        $items.hide();

        // show next item in list
        $items.filter("#item" + nextItemId).fadeIn(fadeSpeed);
        // remove highlight of all controls
        $controls.removeClass("current");
        // add it to the next one
        $controls.filter("#control" + nextItemId).addClass("current");

        // recursively call function again
        $.cycleItems($items, $controls, $controls.eq(curItemId), $cycler, fadeSpeed, cycleSpeed, curLoop + 1, maxLoops);
      }
    }, cycleSpeed);
  };

})(jQuery);