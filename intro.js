/**
 * Intro.js v2.0
 * https:
 * MIT licensed
 *
 * Copyright (C) 2013 usabli.ca - A weekend project by Afshin Mehrabani (@afshinmeh)
 */



(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
    module.exports.introJs = function () {
      console.warn('Deprecated: please use require("intro.js") directly, instead of the introJs method of the function');

      return f().apply(this, arguments);
    };
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.introJs = f();
  }
})(function () {

  var VERSION = '2.0.0';



  function IntroJs(obj) {
    this._targetElement = obj;
    this._introItems = [];

    this._options = {

      nextLabel: 'Next &rarr;',

      prevLabel: '&larr; Back',

      skipLabel: 'Skip',

      doneLabel: 'Done',

      hidePrev: false,

      hideNext: false,

      tooltipPosition: 'bottom',

      tooltipClass: '',

      highlightClass: '',

      exitOnEsc: true,

      exitOnOverlayClick: true,

      showStepNumbers: true,

      keyboardNavigation: true,

      showButtons: true,

      showBullets: true,

      showProgress: false,

      scrollToElement: true,

      scrollTo: 'element',

      scrollPadding: 30,

      overlayOpacity: 0.8,

      positionPrecedence: ["bottom", "top", "right", "left"],

      disableInteraction: false,

      helperElementPadding: 10,

      hintPosition: 'top-middle',

      hintButtonLabel: 'Got it',

      hintAnimation: true,

      buttonClass: "introjs-button"
    };
  }



  function _introForElement(targetElm, group) {
    var allIntroSteps = targetElm.querySelectorAll("*[data-intro]"),
      introItems = [];

    if (this._options.steps) {

      _forEach(this._options.steps, function (step) {
        var currentItem = _cloneObject(step);


        currentItem.step = introItems.length + 1;


        if (typeof (currentItem.element) === 'string') {

          currentItem.element = document.querySelector(currentItem.element);
        }


        if (typeof (currentItem.element) === 'undefined' || currentItem.element === null) {
          var floatingElementQuery = document.querySelector(".introjsFloatingElement");

          if (floatingElementQuery === null) {
            floatingElementQuery = document.createElement('div');
            floatingElementQuery.className = 'introjsFloatingElement';

            document.body.appendChild(floatingElementQuery);
          }

          currentItem.element = floatingElementQuery;
          currentItem.position = 'floating';
        }

        currentItem.scrollTo = currentItem.scrollTo || this._options.scrollTo;

        if (typeof (currentItem.disableInteraction) === 'undefined') {
          currentItem.disableInteraction = this._options.disableInteraction;
        }

        if (currentItem.element !== null) {
          introItems.push(currentItem);
        }
      }.bind(this));

    } else {

      var elmsLength = allIntroSteps.length;
      var disableInteraction;


      if (elmsLength < 1) {
        return false;
      }

      _forEach(allIntroSteps, function (currentElement) {



        if (group && (currentElement.getAttribute("data-intro-group") !== group)) {
          return;
        }


        if (currentElement.style.display === 'none') {
          return;
        }

        var step = parseInt(currentElement.getAttribute('data-step'), 10);

        if (typeof (currentElement.getAttribute('data-disable-interaction')) !== 'undefined') {
          disableInteraction = !!currentElement.getAttribute('data-disable-interaction');
        } else {
          disableInteraction = this._options.disableInteraction;
        }

        if (step > 0) {
          introItems[step - 1] = {
            element: currentElement,
            intro: currentElement.getAttribute('data-intro'),
            step: parseInt(currentElement.getAttribute('data-step'), 10),
            tooltipClass: currentElement.getAttribute('data-tooltipclass'),
            highlightClass: currentElement.getAttribute('data-highlightclass'),
            position: currentElement.getAttribute('data-position') || this._options.tooltipPosition,
            scrollTo: currentElement.getAttribute('data-scrollto') || this._options.scrollTo,
            disableInteraction: disableInteraction
          };
        }
      }.bind(this));



      var nextStep = 0;

      _forEach(allIntroSteps, function (currentElement) {



        if (group && (currentElement.getAttribute("data-intro-group") !== group)) {
          return;
        }

        if (currentElement.getAttribute('data-step') === null) {

          while (true) {
            if (typeof introItems[nextStep] === 'undefined') {
              break;
            } else {
              nextStep++;
            }
          }

          if (typeof (currentElement.getAttribute('data-disable-interaction')) !== 'undefined') {
            disableInteraction = !!currentElement.getAttribute('data-disable-interaction');
          } else {
            disableInteraction = this._options.disableInteraction;
          }

          introItems[nextStep] = {
            element: currentElement,
            intro: currentElement.getAttribute('data-intro'),
            step: nextStep + 1,
            tooltipClass: currentElement.getAttribute('data-tooltipclass'),
            highlightClass: currentElement.getAttribute('data-highlightclass'),
            position: currentElement.getAttribute('data-position') || this._options.tooltipPosition,
            scrollTo: currentElement.getAttribute('data-scrollto') || this._options.scrollTo,
            disableInteraction: disableInteraction
          };
        }
      }.bind(this));
    }


    var tempIntroItems = [];
    for (var z = 0; z < introItems.length; z++) {
      if (introItems[z]) {

        tempIntroItems.push(introItems[z]);
      }
    }

    introItems = tempIntroItems;


    introItems.sort(function (a, b) {
      return a.step - b.step;
    });


    this._introItems = introItems;


    if (_addOverlayLayer.call(this, targetElm)) {

      _nextStep.call(this);

      if (this._options.keyboardNavigation) {
        DOMEvent.on(window, 'keydown', _onKeyDown, this, true);
      }

      DOMEvent.on(window, 'resize', _onResize, this, true);
    }
    return false;
  }

  function _onResize() {
    this.refresh.call(this);
  }



















  function _onKeyDown(e) {
    var code = (e.code === null) ? e.which : e.code;


    if (code === null) {
      code = (e.charCode === null) ? e.keyCode : e.charCode;
    }

    if ((code === 'Escape' || code === 27) && this._options.exitOnEsc === true) {


      _exitIntro.call(this, this._targetElement);
    } else if (code === 'ArrowLeft' || code === 37) {

      _previousStep.call(this);
    } else if (code === 'ArrowRight' || code === 39) {

      _nextStep.call(this);
    } else if (code === 'Enter' || code === 13) {

      var target = e.target || e.srcElement;
      if (target && target.className.match('introjs-prevbutton')) {

        _previousStep.call(this);
      } else if (target && target.className.match('introjs-skipbutton')) {

        if (this._introItems.length - 1 === this._currentStep && typeof (this._introCompleteCallback) === 'function') {
          this._introCompleteCallback.call(this);
        }

        _exitIntro.call(this, this._targetElement);
      } else if (target && target.getAttribute('data-stepnumber')) {

        target.click();
      } else {

        _nextStep.call(this);
      }


      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
    }
  }


  function _cloneObject(object) {
    if (object === null || typeof (object) !== 'object' || typeof (object.nodeType) !== 'undefined') {
      return object;
    }
    var temp = {};
    for (var key in object) {
      if (typeof (window.jQuery) !== 'undefined' && object[key] instanceof window.jQuery) {
        temp[key] = object[key];
      } else {
        temp[key] = _cloneObject(object[key]);
      }
    }
    return temp;
  }


  function _goToStep(step) {

    this._currentStep = step - 2;
    if (typeof (this._introItems) !== 'undefined') {
      _nextStep.call(this);
    }
  }



  function _goToStepNumber(step) {
    this._currentStepNumber = step;
    if (typeof (this._introItems) !== 'undefined') {
      _nextStep.call(this);
    }
  }



  function _nextStep() {
    this._direction = 'forward';

    if (typeof (this._currentStepNumber) !== 'undefined') {
      _forEach(this._introItems, function (item, i) {
        if (item.step === this._currentStepNumber) {
          this._currentStep = i - 1;
          this._currentStepNumber = undefined;
        }
      }.bind(this));
    }

    if (typeof (this._currentStep) === 'undefined') {
      this._currentStep = 0;
    } else {
      ++this._currentStep;
    }

    var nextStep = this._introItems[this._currentStep];
    var continueStep = true;

    if (typeof (this._introBeforeChangeCallback) !== 'undefined') {
      continueStep = this._introBeforeChangeCallback.call(this, nextStep.element);
    }


    if (continueStep === false) {
      --this._currentStep;
      return false;
    }

    if ((this._introItems.length) <= this._currentStep) {


      if (typeof (this._introCompleteCallback) === 'function') {
        this._introCompleteCallback.call(this);
      }
      _exitIntro.call(this, this._targetElement);
      return;
    }

    _showElement.call(this, nextStep);
  }



  function _previousStep() {
    this._direction = 'backward';

    if (this._currentStep === 0) {
      return false;
    }

    --this._currentStep;

    var nextStep = this._introItems[this._currentStep];
    var continueStep = true;

    if (typeof (this._introBeforeChangeCallback) !== 'undefined') {
      continueStep = this._introBeforeChangeCallback.call(this, nextStep.element);
    }


    if (continueStep === false) {
      ++this._currentStep;
      return false;
    }

    _showElement.call(this, nextStep);
  }



  function _refresh() {

    _setHelperLayerPosition.call(this, document.querySelector('.introjs-helperLayer'));
    _setHelperLayerPosition.call(this, document.querySelector('.introjs-tooltipReferenceLayer'));
    _setHelperLayerPosition.call(this, document.querySelector('.introjs-disableInteraction'));


    if (this._currentStep !== undefined && this._currentStep !== null) {
      var oldHelperNumberLayer = document.querySelector('.introjs-helperNumberLayer'),
        oldArrowLayer = document.querySelector('.introjs-arrow'),
        oldtooltipContainer = document.querySelector('.introjs-tooltip');
      _placeTooltip.call(this, this._introItems[this._currentStep].element, oldtooltipContainer, oldArrowLayer, oldHelperNumberLayer);
    }


    _reAlignHints.call(this);
    return this;
  }



  function _exitIntro(targetElement, force) {
    var continueExit = true;




    if (this._introBeforeExitCallback !== undefined) {
      continueExit = this._introBeforeExitCallback.call(this);
    }



    if (!force && continueExit === false) return;


    var overlayLayers = targetElement.querySelectorAll('.introjs-overlay');

    if (overlayLayers && overlayLayers.length) {
      _forEach(overlayLayers, function (overlayLayer) {
        overlayLayer.style.opacity = 0;
        window.setTimeout(function () {
          if (this.parentNode) {
            this.parentNode.removeChild(this);
          }
        }.bind(overlayLayer), 500);
      }.bind(this));
    }


    var helperLayer = targetElement.querySelector('.introjs-helperLayer');
    if (helperLayer) {
      helperLayer.parentNode.removeChild(helperLayer);
    }

    var referenceLayer = targetElement.querySelector('.introjs-tooltipReferenceLayer');
    if (referenceLayer) {
      referenceLayer.parentNode.removeChild(referenceLayer);
    }


    var disableInteractionLayer = targetElement.querySelector('.introjs-disableInteraction');
    if (disableInteractionLayer) {
      disableInteractionLayer.parentNode.removeChild(disableInteractionLayer);
    }


    var floatingElement = document.querySelector('.introjsFloatingElement');
    if (floatingElement) {
      floatingElement.parentNode.removeChild(floatingElement);
    }

    _removeShowElement();


    var fixParents = document.querySelectorAll('.introjs-fixParent');
    _forEach(fixParents, function (parent) {
      _removeClass(parent, /introjs-fixParent/g);
    });


    DOMEvent.off(window, 'keydown', _onKeyDown, this, true);
    DOMEvent.off(window, 'resize', _onResize, this, true);


    if (this._introExitCallback !== undefined) {
      this._introExitCallback.call(this);
    }


    this._currentStep = undefined;
  }



  function _placeTooltip(targetElement, tooltipLayer, arrowLayer, helperNumberLayer, hintMode) {
    var tooltipCssClass = '',
      currentStepObj,
      tooltipOffset,
      targetOffset,
      windowSize,
      currentTooltipPosition;

    hintMode = hintMode || false;


    tooltipLayer.style.top = null;
    tooltipLayer.style.right = null;
    tooltipLayer.style.bottom = null;
    tooltipLayer.style.left = null;
    tooltipLayer.style.marginLeft = null;
    tooltipLayer.style.marginTop = null;

    arrowLayer.style.display = 'inherit';

    if (typeof (helperNumberLayer) !== 'undefined' && helperNumberLayer !== null) {
      helperNumberLayer.style.top = null;
      helperNumberLayer.style.left = null;
    }


    if (!this._introItems[this._currentStep]) return;


    currentStepObj = this._introItems[this._currentStep];
    if (typeof (currentStepObj.tooltipClass) === 'string') {
      tooltipCssClass = currentStepObj.tooltipClass;
    } else {
      tooltipCssClass = this._options.tooltipClass;
    }

    tooltipLayer.className = ('introjs-tooltip ' + tooltipCssClass).replace(/^\s+|\s+$/g, '');
    tooltipLayer.setAttribute('role', 'dialog');

    currentTooltipPosition = this._introItems[this._currentStep].position;


    if (currentTooltipPosition !== "floating") {
      currentTooltipPosition = _determineAutoPosition.call(this, targetElement, tooltipLayer, currentTooltipPosition);
    }

    var tooltipLayerStyleLeft;
    targetOffset = _getOffset(targetElement);
    tooltipOffset = _getOffset(tooltipLayer);
    windowSize = _getWinSize();

    _addClass(tooltipLayer, 'introjs-' + currentTooltipPosition);

    switch (currentTooltipPosition) {
      case 'top-right-aligned':
        arrowLayer.className = 'introjs-arrow bottom-right';

        var tooltipLayerStyleRight = 0;
        _checkLeft(targetOffset, tooltipLayerStyleRight, tooltipOffset, tooltipLayer);
        tooltipLayer.style.bottom = (targetOffset.height + 20) + 'px';
        break;

      case 'top-middle-aligned':
        arrowLayer.className = 'introjs-arrow bottom-middle';

        var tooltipLayerStyleLeftRight = targetOffset.width / 2 - tooltipOffset.width / 2;


        if (hintMode) {
          tooltipLayerStyleLeftRight += 5;
        }

        if (_checkLeft(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, tooltipLayer)) {
          tooltipLayer.style.right = null;
          _checkRight(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, windowSize, tooltipLayer);
        }
        tooltipLayer.style.bottom = (targetOffset.height + 20) + 'px';
        break;

      case 'top-left-aligned':

      case 'top':
        arrowLayer.className = 'introjs-arrow bottom';

        tooltipLayerStyleLeft = (hintMode) ? 0 : 15;

        _checkRight(targetOffset, tooltipLayerStyleLeft, tooltipOffset, windowSize, tooltipLayer);
        tooltipLayer.style.bottom = (targetOffset.height + 20) + 'px';
        break;
      case 'right':
        tooltipLayer.style.left = (targetOffset.width + 20) + 'px';
        if (targetOffset.top + tooltipOffset.height > windowSize.height) {


          arrowLayer.className = "introjs-arrow left-bottom";
          tooltipLayer.style.top = "-" + (tooltipOffset.height - targetOffset.height - 20) + "px";
        } else {
          arrowLayer.className = 'introjs-arrow left';
        }
        break;
      case 'left':
        if (!hintMode && this._options.showStepNumbers === true) {
          tooltipLayer.style.top = '15px';
        }

        if (targetOffset.top + tooltipOffset.height > windowSize.height) {


          tooltipLayer.style.top = "-" + (tooltipOffset.height - targetOffset.height - 20) + "px";
          arrowLayer.className = 'introjs-arrow right-bottom';
        } else {
          arrowLayer.className = 'introjs-arrow right';
        }
        tooltipLayer.style.right = (targetOffset.width + 20) + 'px';

        break;
      case 'floating':
        arrowLayer.style.display = 'none';


        tooltipLayer.style.left = '50%';
        tooltipLayer.style.top = '50%';
        tooltipLayer.style.marginLeft = '-' + (tooltipOffset.width / 2) + 'px';
        tooltipLayer.style.marginTop = '-' + (tooltipOffset.height / 2) + 'px';

        if (typeof (helperNumberLayer) !== 'undefined' && helperNumberLayer !== null) {
          helperNumberLayer.style.left = '-' + ((tooltipOffset.width / 2) + 18) + 'px';
          helperNumberLayer.style.top = '-' + ((tooltipOffset.height / 2) + 18) + 'px';
        }

        break;
      case 'bottom-right-aligned':
        arrowLayer.className = 'introjs-arrow top-right';

        tooltipLayerStyleRight = 0;
        _checkLeft(targetOffset, tooltipLayerStyleRight, tooltipOffset, tooltipLayer);
        tooltipLayer.style.top = (targetOffset.height + 20) + 'px';
        break;

      case 'bottom-middle-aligned':
        arrowLayer.className = 'introjs-arrow top-middle';

        tooltipLayerStyleLeftRight = targetOffset.width / 2 - tooltipOffset.width / 2;


        if (hintMode) {
          tooltipLayerStyleLeftRight += 5;
        }

        if (_checkLeft(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, tooltipLayer)) {
          tooltipLayer.style.right = null;
          _checkRight(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, windowSize, tooltipLayer);
        }
        tooltipLayer.style.top = (targetOffset.height + 20) + 'px';
        break;





      default:
        arrowLayer.className = 'introjs-arrow top';

        tooltipLayerStyleLeft = 0;
        _checkRight(targetOffset, tooltipLayerStyleLeft, tooltipOffset, windowSize, tooltipLayer);
        tooltipLayer.style.top = (targetOffset.height + 20) + 'px';
    }
  }



  function _checkRight(targetOffset, tooltipLayerStyleLeft, tooltipOffset, windowSize, tooltipLayer) {
    if (targetOffset.left + tooltipLayerStyleLeft + tooltipOffset.width > windowSize.width) {

      tooltipLayer.style.left = (windowSize.width - tooltipOffset.width - targetOffset.left) + 'px';
      return false;
    }
    tooltipLayer.style.left = tooltipLayerStyleLeft + 'px';
    return true;
  }



  function _checkLeft(targetOffset, tooltipLayerStyleRight, tooltipOffset, tooltipLayer) {
    if (targetOffset.left + targetOffset.width - tooltipLayerStyleRight - tooltipOffset.width < 0) {

      tooltipLayer.style.left = (-targetOffset.left) + 'px';
      return false;
    }
    tooltipLayer.style.right = tooltipLayerStyleRight + 'px';
    return true;
  }



  function _determineAutoPosition(targetElement, tooltipLayer, desiredTooltipPosition) {


    var possiblePositions = this._options.positionPrecedence.slice();

    var windowSize = _getWinSize();
    var tooltipHeight = _getOffset(tooltipLayer).height + 10;
    var tooltipWidth = _getOffset(tooltipLayer).width + 20;
    var targetElementRect = targetElement.getBoundingClientRect();



    var calculatedPosition = "floating";




    if (targetElementRect.bottom + tooltipHeight + tooltipHeight > windowSize.height) {
      _removeEntry(possiblePositions, "bottom");
    }


    if (targetElementRect.top - tooltipHeight < 0) {
      _removeEntry(possiblePositions, "top");
    }


    if (targetElementRect.right + tooltipWidth > windowSize.width) {
      _removeEntry(possiblePositions, "right");
    }


    if (targetElementRect.left - tooltipWidth < 0) {
      _removeEntry(possiblePositions, "left");
    }


    var desiredAlignment = (function (pos) {
      var hyphenIndex = pos.indexOf('-');
      if (hyphenIndex !== -1) {

        return pos.substr(hyphenIndex);
      }
      return '';
    })(desiredTooltipPosition || '');


    if (desiredTooltipPosition) {


      desiredTooltipPosition = desiredTooltipPosition.split('-')[0];
    }

    if (possiblePositions.length) {
      if (desiredTooltipPosition !== "auto" &&
        possiblePositions.indexOf(desiredTooltipPosition) > -1) {

        calculatedPosition = desiredTooltipPosition;
      } else {

        calculatedPosition = possiblePositions[0];
      }
    }


    if (['top', 'bottom'].indexOf(calculatedPosition) !== -1) {
      calculatedPosition += _determineAutoAlignment(targetElementRect.left, tooltipWidth, windowSize, desiredAlignment, targetElementRect.width);
    }

    return calculatedPosition;
  }









  function _determineAutoAlignment(offsetLeft, tooltipWidth, windowSize, desiredAlignment, targetElementWidth) {
    var halfTooltipWidth = tooltipWidth / 2,
      winWidth = Math.min(windowSize.width, window.screen.width),
      possibleAlignments = ['-left-aligned', '-middle-aligned', '-right-aligned'],
      calculatedAlignment = '';



    if (winWidth - offsetLeft < tooltipWidth) {
      _removeEntry(possibleAlignments, '-left-aligned');
    }



    if (offsetLeft < halfTooltipWidth ||
      winWidth - offsetLeft < halfTooltipWidth) {
      _removeEntry(possibleAlignments, '-middle-aligned');
    }

    if (tooltipWidth > (offsetLeft + targetElementWidth)) {
      _removeEntry(possibleAlignments, '-right-aligned');
    }

    if (possibleAlignments.length) {
      if (possibleAlignments.indexOf(desiredAlignment) !== -1) {

        calculatedAlignment = desiredAlignment;
      } else {

        calculatedAlignment = possibleAlignments[0];
      }
    } else {

      console.log("no desired alignment")

      calculatedAlignment = '-middle-aligned';
    }

    return calculatedAlignment;
  }



  function _removeEntry(stringArray, stringToRemove) {
    if (stringArray.indexOf(stringToRemove) > -1) {
      stringArray.splice(stringArray.indexOf(stringToRemove), 1);
    }
  }



  function _setHelperLayerPosition(helperLayer) {
    if (helperLayer) {

      if (!this._introItems[this._currentStep]) return;

      var currentElement = this._introItems[this._currentStep],
        elementPosition = _getOffset(currentElement.element),
        widthHeightPadding = this._options.helperElementPadding;




      if (_isFixed(currentElement.element)) {
        _addClass(helperLayer, 'introjs-fixedTooltip');
      } else {
        _removeClass(helperLayer, 'introjs-fixedTooltip');
      }

      if (currentElement.position === 'floating') {
        widthHeightPadding = 0;
      }


      helperLayer.style.cssText = 'width: ' + (elementPosition.width + widthHeightPadding) + 'px; ' +
        'height:' + (elementPosition.height + widthHeightPadding) + 'px; ' +
        'top:' + (elementPosition.top - widthHeightPadding / 2) + 'px;' +
        'left: ' + (elementPosition.left - widthHeightPadding / 2) + 'px;';

    }
  }



  function _disableInteraction() {
    var disableInteractionLayer = document.querySelector('.introjs-disableInteraction');

    if (disableInteractionLayer === null) {
      disableInteractionLayer = document.createElement('div');
      disableInteractionLayer.className = 'introjs-disableInteraction';
      this._targetElement.appendChild(disableInteractionLayer);
    }

    _setHelperLayerPosition.call(this, disableInteractionLayer);
  }



  function _setAnchorAsButton(anchor) {
    anchor.setAttribute('role', 'button');
    anchor.tabIndex = 0;
  }



  function _showElement(targetElement) {
    if (typeof (this._introChangeCallback) !== 'undefined') {
      this._introChangeCallback.call(this, targetElement.element);
    }

    var self = this,
      oldHelperLayer = document.querySelector('.introjs-helperLayer'),
      oldReferenceLayer = document.querySelector('.introjs-tooltipReferenceLayer'),
      highlightClass = 'introjs-helperLayer',
      nextTooltipButton,
      prevTooltipButton,
      skipTooltipButton,
      scrollParent;


    if (typeof (targetElement.highlightClass) === 'string') {
      highlightClass += (' ' + targetElement.highlightClass);
    }

    if (typeof (this._options.highlightClass) === 'string') {
      highlightClass += (' ' + this._options.highlightClass);
    }

    if (oldHelperLayer !== null) {
      var oldHelperNumberLayer = oldReferenceLayer.querySelector('.introjs-helperNumberLayer'),
        oldtooltipLayer = oldReferenceLayer.querySelector('.introjs-tooltiptext'),
        oldArrowLayer = oldReferenceLayer.querySelector('.introjs-arrow'),
        oldtooltipContainer = oldReferenceLayer.querySelector('.introjs-tooltip');

      skipTooltipButton = oldReferenceLayer.querySelector('.introjs-skipbutton');
      prevTooltipButton = oldReferenceLayer.querySelector('.introjs-prevbutton');
      nextTooltipButton = oldReferenceLayer.querySelector('.introjs-nextbutton');


      oldHelperLayer.className = highlightClass;

      oldtooltipContainer.style.opacity = 0;
      oldtooltipContainer.style.display = "none";

      if (oldHelperNumberLayer !== null) {
        var lastIntroItem = this._introItems[(targetElement.step - 2 >= 0 ? targetElement.step - 2 : 0)];

        if (lastIntroItem !== null && (this._direction === 'forward' && lastIntroItem.position === 'floating') || (this._direction === 'backward' && targetElement.position === 'floating')) {
          oldHelperNumberLayer.style.opacity = 0;
        }
      }


      scrollParent = _getScrollParent(targetElement.element);

      if (scrollParent !== document.body) {

        _scrollParentToElement(scrollParent, targetElement.element);
      }


      _setHelperLayerPosition.call(self, oldHelperLayer);
      _setHelperLayerPosition.call(self, oldReferenceLayer);


      var fixParents = document.querySelectorAll('.introjs-fixParent');
      _forEach(fixParents, function (parent) {
        _removeClass(parent, /introjs-fixParent/g);
      });


      _removeShowElement();


      if (self._lastShowElementTimer) {
        window.clearTimeout(self._lastShowElementTimer);
      }

      self._lastShowElementTimer = window.setTimeout(function () {

        if (oldHelperNumberLayer !== null) {
          oldHelperNumberLayer.innerHTML = targetElement.step;
        }

        oldtooltipLayer.innerHTML = targetElement.intro;

        oldtooltipContainer.style.display = "block";
        _placeTooltip.call(self, targetElement.element, oldtooltipContainer, oldArrowLayer, oldHelperNumberLayer);


        if (self._options.showBullets) {
          oldReferenceLayer.querySelector('.introjs-bullets li > a.active').className = '';
          oldReferenceLayer.querySelector('.introjs-bullets li > a[data-stepnumber="' + targetElement.step + '"]').className = 'active';
        }
        oldReferenceLayer.querySelector('.introjs-progress .introjs-progressbar').style.cssText = 'width:' + _getProgress.call(self) + '%;';
        oldReferenceLayer.querySelector('.introjs-progress .introjs-progressbar').setAttribute('aria-valuenow', _getProgress.call(self));


        oldtooltipContainer.style.opacity = 1;
        if (oldHelperNumberLayer) oldHelperNumberLayer.style.opacity = 1;


        if (typeof skipTooltipButton !== "undefined" && skipTooltipButton !== null && /introjs-donebutton/gi.test(skipTooltipButton.className)) {

          skipTooltipButton.focus();
        } else if (typeof nextTooltipButton !== "undefined" && nextTooltipButton !== null) {

          nextTooltipButton.focus();
        }


        _scrollTo.call(self, targetElement.scrollTo, targetElement, oldtooltipLayer);
      }, 350);


    } else {
      var helperLayer = document.createElement('div'),
        referenceLayer = document.createElement('div'),
        arrowLayer = document.createElement('div'),
        tooltipLayer = document.createElement('div'),
        tooltipTextLayer = document.createElement('div'),
        bulletsLayer = document.createElement('div'),
        progressLayer = document.createElement('div'),
        buttonsLayer = document.createElement('div');

      helperLayer.className = highlightClass;
      referenceLayer.className = 'introjs-tooltipReferenceLayer';


      scrollParent = _getScrollParent(targetElement.element);

      if (scrollParent !== document.body) {

        _scrollParentToElement(scrollParent, targetElement.element);
      }


      _setHelperLayerPosition.call(self, helperLayer);
      _setHelperLayerPosition.call(self, referenceLayer);


      this._targetElement.appendChild(helperLayer);
      this._targetElement.appendChild(referenceLayer);

      arrowLayer.className = 'introjs-arrow';

      tooltipTextLayer.className = 'introjs-tooltiptext';
      tooltipTextLayer.innerHTML = targetElement.intro;

      bulletsLayer.className = 'introjs-bullets';

      if (this._options.showBullets === false) {
        bulletsLayer.style.display = 'none';
      }

      var ulContainer = document.createElement('ul');
      ulContainer.setAttribute('role', 'tablist');

      var anchorClick = function () {
        self.goToStep(this.getAttribute('data-stepnumber'));
      };

      _forEach(this._introItems, function (item, i) {
        var innerLi = document.createElement('li');
        var anchorLink = document.createElement('a');

        innerLi.setAttribute('role', 'presentation');
        anchorLink.setAttribute('role', 'tab');

        anchorLink.onclick = anchorClick;

        if (i === (targetElement.step - 1)) {
          anchorLink.className = 'active';
        }

        _setAnchorAsButton(anchorLink);
        anchorLink.innerHTML = "&nbsp;";
        anchorLink.setAttribute('data-stepnumber', item.step);

        innerLi.appendChild(anchorLink);
        ulContainer.appendChild(innerLi);
      });

      bulletsLayer.appendChild(ulContainer);

      progressLayer.className = 'introjs-progress';

      if (this._options.showProgress === false) {
        progressLayer.style.display = 'none';
      }
      var progressBar = document.createElement('div');
      progressBar.className = 'introjs-progressbar';
      progressBar.setAttribute('role', 'progress');
      progressBar.setAttribute('aria-valuemin', 0);
      progressBar.setAttribute('aria-valuemax', 100);
      progressBar.setAttribute('aria-valuenow', _getProgress.call(this));
      progressBar.style.cssText = 'width:' + _getProgress.call(this) + '%;';

      progressLayer.appendChild(progressBar);

      buttonsLayer.className = 'introjs-tooltipbuttons';
      if (this._options.showButtons === false) {
        buttonsLayer.style.display = 'none';
      }

      tooltipLayer.className = 'introjs-tooltip';
      tooltipLayer.appendChild(tooltipTextLayer);
      tooltipLayer.appendChild(bulletsLayer);
      tooltipLayer.appendChild(progressLayer);


      var helperNumberLayer = document.createElement('span');
      if (this._options.showStepNumbers === true) {
        helperNumberLayer.className = 'introjs-helperNumberLayer';
        helperNumberLayer.innerHTML = targetElement.step;
        referenceLayer.appendChild(helperNumberLayer);
      }

      tooltipLayer.appendChild(arrowLayer);
      referenceLayer.appendChild(tooltipLayer);


      nextTooltipButton = document.createElement('a');

      nextTooltipButton.onclick = function () {
        if (self._introItems.length - 1 !== self._currentStep) {
          _nextStep.call(self);
        }
      };

      _setAnchorAsButton(nextTooltipButton);
      nextTooltipButton.innerHTML = this._options.nextLabel;


      prevTooltipButton = document.createElement('a');

      prevTooltipButton.onclick = function () {
        if (self._currentStep !== 0) {
          _previousStep.call(self);
        }
      };

      _setAnchorAsButton(prevTooltipButton);
      prevTooltipButton.innerHTML = this._options.prevLabel;


      skipTooltipButton = document.createElement('a');
      skipTooltipButton.className = this._options.buttonClass + ' introjs-skipbutton ';
      _setAnchorAsButton(skipTooltipButton);
      skipTooltipButton.innerHTML = this._options.skipLabel;

      skipTooltipButton.onclick = function () {
        if (self._introItems.length - 1 === self._currentStep && typeof (self._introCompleteCallback) === 'function') {
          self._introCompleteCallback.call(self);
        }

        if (self._introItems.length - 1 !== self._currentStep && typeof (self._introExitCallback) === 'function') {
          self._introExitCallback.call(self);
        }

        if (typeof (self._introSkipCallback) === 'function') {
          self._introSkipCallback.call(self);
        }

        _exitIntro.call(self, self._targetElement);
      };

      buttonsLayer.appendChild(skipTooltipButton);


      if (this._introItems.length > 1) {
        buttonsLayer.appendChild(prevTooltipButton);
        buttonsLayer.appendChild(nextTooltipButton);
      }

      tooltipLayer.appendChild(buttonsLayer);


      _placeTooltip.call(self, targetElement.element, tooltipLayer, arrowLayer, helperNumberLayer);


      _scrollTo.call(this, targetElement.scrollTo, targetElement, tooltipLayer);


    }


    var disableInteractionLayer = self._targetElement.querySelector('.introjs-disableInteraction');
    if (disableInteractionLayer) {
      disableInteractionLayer.parentNode.removeChild(disableInteractionLayer);
    }


    if (targetElement.disableInteraction) {
      _disableInteraction.call(self);
    }


    if (this._currentStep === 0 && this._introItems.length > 1) {
      if (typeof skipTooltipButton !== "undefined" && skipTooltipButton !== null) {
        skipTooltipButton.className = this._options.buttonClass + ' introjs-skipbutton';
      }
      if (typeof nextTooltipButton !== "undefined" && nextTooltipButton !== null) {
        nextTooltipButton.className = this._options.buttonClass + ' introjs-nextbutton';
      }

      if (this._options.hidePrev === true) {
        if (typeof prevTooltipButton !== "undefined" && prevTooltipButton !== null) {
          prevTooltipButton.className = this._options.buttonClass + ' introjs-prevbutton introjs-hidden';
        }
        if (typeof nextTooltipButton !== "undefined" && nextTooltipButton !== null) {
          _addClass(nextTooltipButton, 'introjs-fullbutton');
        }
      } else {
        if (typeof prevTooltipButton !== "undefined" && prevTooltipButton !== null) {
          prevTooltipButton.className = this._options.buttonClass + ' introjs-prevbutton introjs-disabled';
        }
      }

      if (typeof skipTooltipButton !== "undefined" && skipTooltipButton !== null) {
        skipTooltipButton.innerHTML = this._options.skipLabel;
      }
    } else if (this._introItems.length - 1 === this._currentStep || this._introItems.length === 1) {

      if (typeof skipTooltipButton !== "undefined" && skipTooltipButton !== null) {
        skipTooltipButton.innerHTML = this._options.doneLabel;

        _addClass(skipTooltipButton, 'introjs-donebutton');
      }
      if (typeof prevTooltipButton !== "undefined" && prevTooltipButton !== null) {
        prevTooltipButton.className = this._options.buttonClass + ' introjs-prevbutton';
      }

      if (this._options.hideNext === true) {
        if (typeof nextTooltipButton !== "undefined" && nextTooltipButton !== null) {
          nextTooltipButton.className = this._options.buttonClass + ' introjs-nextbutton introjs-hidden';
        }
        if (typeof prevTooltipButton !== "undefined" && prevTooltipButton !== null) {
          _addClass(prevTooltipButton, 'introjs-fullbutton');
        }
      } else {
        if (typeof nextTooltipButton !== "undefined" && nextTooltipButton !== null) {
          nextTooltipButton.className = this._options.buttonClass + ' introjs-nextbutton introjs-disabled';
        }
      }
    } else {

      if (typeof skipTooltipButton !== "undefined" && skipTooltipButton !== null) {
        skipTooltipButton.className = this._options.buttonClass + ' introjs-skipbutton';
      }
      if (typeof prevTooltipButton !== "undefined" && prevTooltipButton !== null) {
        prevTooltipButton.className = this._options.buttonClass + ' introjs-prevbutton';
      }
      if (typeof nextTooltipButton !== "undefined" && nextTooltipButton !== null) {
        nextTooltipButton.className = this._options.buttonClass + ' introjs-nextbutton';
      }
      if (typeof skipTooltipButton !== "undefined" && skipTooltipButton !== null) {
        skipTooltipButton.innerHTML = this._options.skipLabel;
      }
    }

    prevTooltipButton.setAttribute('role', 'button');
    nextTooltipButton.setAttribute('role', 'button');
    skipTooltipButton.setAttribute('role', 'button');


    if (typeof nextTooltipButton !== "undefined" && nextTooltipButton !== null) {
      nextTooltipButton.focus();
    }

    _setShowElement(targetElement);

    if (typeof (this._introAfterChangeCallback) !== 'undefined') {
      this._introAfterChangeCallback.call(this, targetElement.element);
    }
  }



  function _scrollTo(scrollTo, targetElement, tooltipLayer) {
    if (scrollTo === 'off') return;
    var rect;

    if (!this._options.scrollToElement) return;

    if (scrollTo === 'tooltip') {
      rect = tooltipLayer.getBoundingClientRect();
    } else {
      rect = targetElement.element.getBoundingClientRect();
    }

    if (!_elementInViewport(targetElement.element)) {
      var winHeight = _getWinSize().height;
      var top = rect.bottom - (rect.bottom - rect.top);





      if (top < 0 || targetElement.element.clientHeight > winHeight) {
        window.scrollBy({ left: 0, top: rect.top - ((winHeight / 2) - (rect.height / 2)) - this._options.scrollPadding, behavior: 'smooth' });

      } else {
        window.scrollBy({ left: 0, top: rect.top - ((winHeight / 2) - (rect.height / 2)) + this._options.scrollPadding, behavior: 'smooth' });
      }
    }
  }



  function _removeShowElement() {
    var elms = document.querySelectorAll('.introjs-showElement');

    _forEach(elms, function (elm) {
      _removeClass(elm, /introjs-[a-zA-Z]+/g);
    });
  }



  function _setShowElement(targetElement) {
    var parentElm;


    if (targetElement.element instanceof SVGElement) {
      parentElm = targetElement.element.parentNode;

      while (targetElement.element.parentNode !== null) {
        if (!parentElm.tagName || parentElm.tagName.toLowerCase() === 'body') break;

        if (parentElm.tagName.toLowerCase() === 'svg') {
          _addClass(parentElm, 'introjs-showElement introjs-relativePosition');
        }

        parentElm = parentElm.parentNode;
      }
    }

    _addClass(targetElement.element, 'introjs-showElement');

    var currentElementPosition = _getPropValue(targetElement.element, 'position');
    if (currentElementPosition !== 'absolute' &&
      currentElementPosition !== 'relative' &&
      currentElementPosition !== 'fixed') {

      _addClass(targetElement.element, 'introjs-relativePosition');
    }

    parentElm = targetElement.element.parentNode;
    while (parentElm !== null) {
      if (!parentElm.tagName || parentElm.tagName.toLowerCase() === 'body') break;



      var zIndex = _getPropValue(parentElm, 'z-index');
      var opacity = parseFloat(_getPropValue(parentElm, 'opacity'));
      var transform = _getPropValue(parentElm, 'transform') || _getPropValue(parentElm, '-webkit-transform') || _getPropValue(parentElm, '-moz-transform') || _getPropValue(parentElm, '-ms-transform') || _getPropValue(parentElm, '-o-transform');
      if (/[0-9]+/.test(zIndex) || opacity < 1 || (transform !== 'none' && transform !== undefined)) {
        _addClass(parentElm, 'introjs-fixParent');
      }

      parentElm = parentElm.parentNode;
    }
  }









  function _forEach(arr, forEachFnc, completeFnc) {

    if (arr) {
      for (var i = 0, len = arr.length; i < len; i++) {
        forEachFnc(arr[i], i);
      }
    }

    if (typeof (completeFnc) === 'function') {
      completeFnc();
    }
  }









  var _stamp = (function () {
    var keys = {};
    return function stamp(obj, key) {


      key = key || 'introjs-stamp';


      keys[key] = keys[key] || 0;


      if (obj[key] === undefined) {

        obj[key] = keys[key]++;
      }

      return obj[key];
    };
  })();









  var DOMEvent = (function () {
    function DOMEvent() {
      var events_key = 'introjs_event';










      this._id = function (obj, type, listener, context) {
        return type + _stamp(listener) + (context ? '_' + _stamp(context) : '');
      };











      this.on = function (obj, type, listener, context, useCapture) {
        var id = this._id.apply(this, arguments),
          handler = function (e) {
            return listener.call(context || obj, e || window.event);
          };

        if ('addEventListener' in obj) {
          obj.addEventListener(type, handler, useCapture);
        } else if ('attachEvent' in obj) {
          obj.attachEvent('on' + type, handler);
        }

        obj[events_key] = obj[events_key] || {};
        obj[events_key][id] = handler;
      };











      this.off = function (obj, type, listener, context, useCapture) {
        var id = this._id.apply(this, arguments),
          handler = obj[events_key] && obj[events_key][id];

        if (!handler) {
          return;
        }

        if ('removeEventListener' in obj) {
          obj.removeEventListener(type, handler, useCapture);
        } else if ('detachEvent' in obj) {
          obj.detachEvent('on' + type, handler);
        }

        obj[events_key][id] = null;
      };
    }

    return new DOMEvent();
  })();



  function _addClass(element, className) {
    if (element instanceof SVGElement) {

      var pre = element.getAttribute('class') || '';

      element.setAttribute('class', pre + ' ' + className);
    } else {
      if (element.classList !== undefined) {

        var classes = className.split(' ');
        _forEach(classes, function (cls) {
          element.classList.add(cls);
        });
      } else if (!element.className.match(className)) {

        element.className += ' ' + className;
      }
    }
  }



  function _removeClass(element, classNameRegex) {
    if (element instanceof SVGElement) {
      var pre = element.getAttribute('class') || '';

      element.setAttribute('class', pre.replace(classNameRegex, '').replace(/^\s+|\s+$/g, ''));
    } else {
      element.className = element.className.replace(classNameRegex, '').replace(/^\s+|\s+$/g, '');
    }
  }



  function _getPropValue(element, propName) {
    var propValue = '';
    if (element.currentStyle) {
      propValue = element.currentStyle[propName];
    } else if (document.defaultView && document.defaultView.getComputedStyle) {
      propValue = document.defaultView.getComputedStyle(element, null).getPropertyValue(propName);
    }


    if (propValue && propValue.toLowerCase) {
      return propValue.toLowerCase();
    } else {
      return propValue;
    }
  }



  function _isFixed(element) {
    var p = element.parentNode;

    if (!p || p.nodeName === 'HTML') {
      return false;
    }

    if (_getPropValue(element, 'position') === 'fixed') {
      return true;
    }

    return _isFixed(p);
  }



  function _getWinSize() {
    if (window.innerWidth !== undefined) {
      return { width: window.innerWidth, height: window.innerHeight };
    } else {
      var D = document.documentElement;
      return { width: D.clientWidth, height: D.clientHeight };
    }
  }



  function _elementInViewport(el) {
    var rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      (rect.bottom + 80) <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }



  function _addOverlayLayer(targetElm) {
    var overlayLayer = document.createElement('div'),
      styleText = '',
      self = this;


    overlayLayer.className = 'introjs-overlay';


    if (!targetElm.tagName || targetElm.tagName.toLowerCase() === 'body') {
      styleText += 'top: 0;bottom: 0; left: 0;right: 0;position: fixed;';
      overlayLayer.style.cssText = styleText;
    } else {

      var elementPosition = _getOffset(targetElm);
      if (elementPosition) {
        styleText += 'width: ' + elementPosition.width + 'px; height:' + elementPosition.height + 'px; top:' + elementPosition.top + 'px;left: ' + elementPosition.left + 'px;';
        overlayLayer.style.cssText = styleText;
      }
    }

    targetElm.appendChild(overlayLayer);

    overlayLayer.onclick = function () {
      if (self._options.exitOnOverlayClick === true) {
        _exitIntro.call(self, targetElm);
      }
    };

    window.setTimeout(function () {
      styleText += 'opacity: ' + self._options.overlayOpacity.toString() + ';';
      overlayLayer.style.cssText = styleText;
    }, 10);

    return true;
  }



  function _removeHintTooltip() {
    var tooltip = document.querySelector('.introjs-hintReference');

    if (tooltip) {
      var step = tooltip.getAttribute('data-step');
      tooltip.parentNode.removeChild(tooltip);
      return step;
    }
  }



  function _populateHints(targetElm) {

    this._introItems = [];

    if (this._options.hints) {
      _forEach(this._options.hints, function (hint) {
        var currentItem = _cloneObject(hint);

        if (typeof (currentItem.element) === 'string') {

          currentItem.element = document.querySelector(currentItem.element);
        }

        currentItem.hintPosition = currentItem.hintPosition || this._options.hintPosition;
        currentItem.hintAnimation = currentItem.hintAnimation || this._options.hintAnimation;

        if (currentItem.element !== null) {
          this._introItems.push(currentItem);
        }
      }.bind(this));
    } else {
      var hints = targetElm.querySelectorAll('*[data-hint]');

      if (!hints || !hints.length) {
        return false;
      }


      _forEach(hints, function (currentElement) {

        var hintAnimation = currentElement.getAttribute('data-hintanimation');

        if (hintAnimation) {
          hintAnimation = (hintAnimation === 'true');
        } else {
          hintAnimation = this._options.hintAnimation;
        }

        this._introItems.push({
          element: currentElement,
          hint: currentElement.getAttribute('data-hint'),
          hintPosition: currentElement.getAttribute('data-hintposition') || this._options.hintPosition,
          hintAnimation: hintAnimation,
          tooltipClass: currentElement.getAttribute('data-tooltipclass'),
          position: currentElement.getAttribute('data-position') || this._options.tooltipPosition
        });
      }.bind(this));
    }

    _addHints.call(this);


    DOMEvent.on(document, 'click', _removeHintTooltip, this, false);
    DOMEvent.on(window, 'resize', _reAlignHints, this, true);
  }



  function _reAlignHints() {
    _forEach(this._introItems, function (item) {
      if (typeof (item.targetElement) === 'undefined') {
        return;
      }

      _alignHintPosition.call(this, item.hintPosition, item.element, item.targetElement);
    }.bind(this));
  }







  function _hintQuerySelectorAll(selector) {
    var hintsWrapper = document.querySelector('.introjs-hints');
    return (hintsWrapper) ? hintsWrapper.querySelectorAll(selector) : [];
  }



  function _hideHint(stepId) {
    var hint = _hintQuerySelectorAll('.introjs-hint[data-step="' + stepId + '"]')[0];

    _removeHintTooltip.call(this);

    if (hint) {
      _addClass(hint, 'introjs-hidehint');
    }


    if (typeof (this._hintCloseCallback) !== 'undefined') {
      this._hintCloseCallback.call(this, stepId);
    }
  }



  function _hideHints() {
    var hints = _hintQuerySelectorAll('.introjs-hint');

    _forEach(hints, function (hint) {
      _hideHint.call(this, hint.getAttribute('data-step'));
    }.bind(this));
  }



  function _showHints() {
    var hints = _hintQuerySelectorAll('.introjs-hint');

    if (hints && hints.length) {
      _forEach(hints, function (hint) {
        _showHint.call(this, hint.getAttribute('data-step'));
      }.bind(this));
    } else {
      _populateHints.call(this, this._targetElement);
    }
  }



  function _showHint(stepId) {
    var hint = _hintQuerySelectorAll('.introjs-hint[data-step="' + stepId + '"]')[0];

    if (hint) {
      _removeClass(hint, /introjs-hidehint/g);
    }
  }



  function _removeHints() {
    var hints = _hintQuerySelectorAll('.introjs-hint');

    _forEach(hints, function (hint) {
      _removeHint.call(this, hint.getAttribute('data-step'));
    }.bind(this));
  }



  function _removeHint(stepId) {
    var hint = _hintQuerySelectorAll('.introjs-hint[data-step="' + stepId + '"]')[0];

    if (hint) {
      hint.parentNode.removeChild(hint);
    }
  }



  function _addHints() {
    var self = this;

    var hintsWrapper = document.querySelector('.introjs-hints');

    if (hintsWrapper === null) {
      hintsWrapper = document.createElement('div');
      hintsWrapper.className = 'introjs-hints';
    }







    var getHintClick = function (i) {
      return function (e) {
        var evt = e ? e : window.event;

        if (evt.stopPropagation) {
          evt.stopPropagation();
        }

        if (evt.cancelBubble !== null) {
          evt.cancelBubble = true;
        }

        _showHintDialog.call(self, i);
      };
    };

    _forEach(this._introItems, function (item, i) {

      if (document.querySelector('.introjs-hint[data-step="' + i + '"]')) {
        return;
      }

      var hint = document.createElement('a');
      _setAnchorAsButton(hint);

      hint.onclick = getHintClick(i);

      hint.className = 'introjs-hint';

      if (!item.hintAnimation) {
        _addClass(hint, 'introjs-hint-no-anim');
      }


      if (_isFixed(item.element)) {
        _addClass(hint, 'introjs-fixedhint');
      }

      var hintDot = document.createElement('div');
      hintDot.className = 'introjs-hint-dot';
      var hintPulse = document.createElement('div');
      hintPulse.className = 'introjs-hint-pulse';

      hint.appendChild(hintDot);
      hint.appendChild(hintPulse);
      hint.setAttribute('data-step', i);



      item.targetElement = item.element;
      item.element = hint;


      _alignHintPosition.call(this, item.hintPosition, hint, item.targetElement);

      hintsWrapper.appendChild(hint);
    }.bind(this));


    document.body.appendChild(hintsWrapper);


    if (typeof (this._hintsAddedCallback) !== 'undefined') {
      this._hintsAddedCallback.call(this);
    }
  }



  function _alignHintPosition(position, hint, element) {

    var offset = _getOffset.call(this, element);
    var iconWidth = 20;
    var iconHeight = 20;


    switch (position) {
      default:
      case 'top-left':
        hint.style.left = offset.left + 'px';
        hint.style.top = offset.top + 'px';
        break;
      case 'top-right':
        hint.style.left = (offset.left + offset.width - iconWidth) + 'px';
        hint.style.top = offset.top + 'px';
        break;
      case 'bottom-left':
        hint.style.left = offset.left + 'px';
        hint.style.top = (offset.top + offset.height - iconHeight) + 'px';
        break;
      case 'bottom-right':
        hint.style.left = (offset.left + offset.width - iconWidth) + 'px';
        hint.style.top = (offset.top + offset.height - iconHeight) + 'px';
        break;
      case 'middle-left':
        hint.style.left = offset.left + 'px';
        hint.style.top = (offset.top + (offset.height - iconHeight) / 2) + 'px';
        break;
      case 'middle-right':
        hint.style.left = (offset.left + offset.width - iconWidth) + 'px';
        hint.style.top = (offset.top + (offset.height - iconHeight) / 2) + 'px';
        break;
      case 'middle-middle':
        hint.style.left = (offset.left + (offset.width - iconWidth) / 2) + 'px';
        hint.style.top = (offset.top + (offset.height - iconHeight) / 2) + 'px';
        break;
      case 'bottom-middle':
        hint.style.left = (offset.left + (offset.width - iconWidth) / 2) + 'px';
        hint.style.top = (offset.top + offset.height - iconHeight) + 'px';
        break;
      case 'top-middle':
        hint.style.left = (offset.left + (offset.width - iconWidth) / 2) + 'px';
        hint.style.top = offset.top + 'px';
        break;
    }
  }



  function _showHintDialog(stepId) {
    var hintElement = document.querySelector('.introjs-hint[data-step="' + stepId + '"]');
    var item = this._introItems[stepId];


    if (typeof (this._hintClickCallback) !== 'undefined') {
      this._hintClickCallback.call(this, hintElement, item, stepId);
    }


    var removedStep = _removeHintTooltip.call(this);


    if (parseInt(removedStep, 10) === stepId) {
      return;
    }

    var tooltipLayer = document.createElement('div');
    var tooltipTextLayer = document.createElement('div');
    var arrowLayer = document.createElement('div');
    var referenceLayer = document.createElement('div');

    tooltipLayer.className = 'introjs-tooltip';

    tooltipLayer.onclick = function (e) {

      if (e.stopPropagation) {
        e.stopPropagation();
      }

      else {
        e.cancelBubble = true;
      }
    };

    tooltipTextLayer.className = 'introjs-tooltiptext';

    var tooltipWrapper = document.createElement('p');
    tooltipWrapper.innerHTML = item.hint;

    var closeButton = document.createElement('a');
    closeButton.className = this._options.buttonClass;
    closeButton.setAttribute('role', 'button');
    closeButton.innerHTML = this._options.hintButtonLabel;
    closeButton.onclick = _hideHint.bind(this, stepId);

    tooltipTextLayer.appendChild(tooltipWrapper);
    tooltipTextLayer.appendChild(closeButton);

    arrowLayer.className = 'introjs-arrow';
    tooltipLayer.appendChild(arrowLayer);

    tooltipLayer.appendChild(tooltipTextLayer);


    this._currentStep = hintElement.getAttribute('data-step');


    referenceLayer.className = 'introjs-tooltipReferenceLayer introjs-hintReference';
    referenceLayer.setAttribute('data-step', hintElement.getAttribute('data-step'));
    _setHelperLayerPosition.call(this, referenceLayer);

    referenceLayer.appendChild(tooltipLayer);
    document.body.appendChild(referenceLayer);


    _placeTooltip.call(this, hintElement, tooltipLayer, arrowLayer, null, true);
  }



  function _getOffset(element) {
    var body = document.body;
    var docEl = document.documentElement;
    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
    var x = element.getBoundingClientRect();
    return {
      top: x.top + scrollTop,
      width: x.width,
      height: x.height,
      left: x.left + scrollLeft
    };
  }








  function _getScrollParent(element) {
    var style = window.getComputedStyle(element);
    var excludeStaticParent = (style.position === "absolute");
    var overflowRegex = /(auto|scroll)/;

    if (style.position === "fixed") return document.body;

    for (var parent = element; (parent = parent.parentElement);) {
      style = window.getComputedStyle(parent);
      if (excludeStaticParent && style.position === "static") {
        continue;
      }
      if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
    }

    return document.body;
  }








  function _scrollParentToElement(parent, element) {
    parent.scrollTop = element.offsetTop - parent.offsetTop;
  }



  function _getProgress() {

    var currentStep = parseInt((this._currentStep + 1), 10);
    return ((currentStep / this._introItems.length) * 100);
  }



  function _mergeOptions(obj1, obj2) {
    var obj3 = {},
      attrname;
    for (attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
  }

  var introJs = function (targetElm) {
    var instance;

    if (typeof (targetElm) === 'object') {

      instance = new IntroJs(targetElm);

    } else if (typeof (targetElm) === 'string') {

      var targetElement = document.querySelector(targetElm);

      if (targetElement) {
        instance = new IntroJs(targetElement);
      } else {
        throw new Error('There is no element with given selector.');
      }
    } else {
      instance = new IntroJs(document.body);
    }



    introJs.instances[_stamp(instance, 'introjs-instance')] = instance;

    return instance;
  };



  introJs.version = VERSION;







  introJs.instances = {};


  introJs.fn = IntroJs.prototype = {
    clone: function () {
      return new IntroJs(this);
    },
    setOption: function (option, value) {
      this._options[option] = value;
      return this;
    },
    setOptions: function (options) {
      this._options = _mergeOptions(this._options, options);
      return this;
    },
    start: function (group) {
      _introForElement.call(this, this._targetElement, group);
      return this;
    },
    goToStep: function (step) {
      _goToStep.call(this, step);
      return this;
    },
    addStep: function (options) {
      if (!this._options.steps) {
        this._options.steps = [];
      }

      this._options.steps.push(options);

      return this;
    },
    addSteps: function (steps) {
      if (!steps.length) return;

      for (var index = 0; index < steps.length; index++) {
        this.addStep(steps[index]);
      }

      return this;
    },
    goToStepNumber: function (step) {
      _goToStepNumber.call(this, step);

      return this;
    },
    nextStep: function () {
      _nextStep.call(this);
      return this;
    },
    previousStep: function () {
      _previousStep.call(this);
      return this;
    },
    exit: function (force) {
      _exitIntro.call(this, this._targetElement, force);
      return this;
    },
    refresh: function () {
      _refresh.call(this);
      return this;
    },
    onbeforechange: function (providedCallback) {
      if (typeof (providedCallback) === 'function') {
        this._introBeforeChangeCallback = providedCallback;
      } else {
        throw new Error('Provided callback for onbeforechange was not a function');
      }
      return this;
    },
    onchange: function (providedCallback) {
      if (typeof (providedCallback) === 'function') {
        this._introChangeCallback = providedCallback;
      } else {
        throw new Error('Provided callback for onchange was not a function.');
      }
      return this;
    },
    onafterchange: function (providedCallback) {
      if (typeof (providedCallback) === 'function') {
        this._introAfterChangeCallback = providedCallback;
      } else {
        throw new Error('Provided callback for onafterchange was not a function');
      }
      return this;
    },
    oncomplete: function (providedCallback) {
      if (typeof (providedCallback) === 'function') {
        this._introCompleteCallback = providedCallback;
      } else {
        throw new Error('Provided callback for oncomplete was not a function.');
      }
      return this;
    },
    onhintsadded: function (providedCallback) {
      if (typeof (providedCallback) === 'function') {
        this._hintsAddedCallback = providedCallback;
      } else {
        throw new Error('Provided callback for onhintsadded was not a function.');
      }
      return this;
    },
    onhintclick: function (providedCallback) {
      if (typeof (providedCallback) === 'function') {
        this._hintClickCallback = providedCallback;
      } else {
        throw new Error('Provided callback for onhintclick was not a function.');
      }
      return this;
    },
    onhintclose: function (providedCallback) {
      if (typeof (providedCallback) === 'function') {
        this._hintCloseCallback = providedCallback;
      } else {
        throw new Error('Provided callback for onhintclose was not a function.');
      }
      return this;
    },
    onexit: function (providedCallback) {
      if (typeof (providedCallback) === 'function') {
        this._introExitCallback = providedCallback;
      } else {
        throw new Error('Provided callback for onexit was not a function.');
      }
      return this;
    },
    onskip: function (providedCallback) {
      if (typeof (providedCallback) === 'function') {
        this._introSkipCallback = providedCallback;
      } else {
        throw new Error('Provided callback for onskip was not a function.');
      }
      return this;
    },
    onbeforeexit: function (providedCallback) {
      if (typeof (providedCallback) === 'function') {
        this._introBeforeExitCallback = providedCallback;
      } else {
        throw new Error('Provided callback for onbeforeexit was not a function.');
      }
      return this;
    },
    addHints: function () {
      _populateHints.call(this, this._targetElement);
      return this;
    },
    hideHint: function (stepId) {
      _hideHint.call(this, stepId);
      return this;
    },
    hideHints: function () {
      _hideHints.call(this);
      return this;
    },
    showHint: function (stepId) {
      _showHint.call(this, stepId);
      return this;
    },
    showHints: function () {
      _showHints.call(this);
      return this;
    },
    removeHints: function () {
      _removeHints.call(this);
      return this;
    },
    removeHint: function (stepId) {
      _removeHint.call(this, stepId);
      return this;
    },
    showHintDialog: function (stepId) {
      _showHintDialog.call(this, stepId);
      return this;
    }
  };

  return introJs;
});