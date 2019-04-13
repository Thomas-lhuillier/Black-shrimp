/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./contentscript.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./contentscript.js":
/*!**************************!*\
  !*** ./contentscript.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

var debug = true;
var tabs = {};

function toggle(tab) {
  if (!tabs[tab.id]) {
    console.log('addTab', tab.id);
    addTab(tab);
  } else {
    console.log('deactivateTab', tab.id);
    deactivateTab(tab.id);
  }
}

function addTab(tab) {
  tabs[tab.id] = Object.create(Blackshrimp);
  tabs[tab.id].construct(tab);
}

function deactivateTab(id) {
  tabs[id].destroy();
}

function clearTab(id) {
  for (var tabId in tabs) {
    if (tabId == id) {
      delete tabs[tabId];
    }
  }
}

var lastBrowserAction = null; // Icon click listener

chrome.browserAction.onClicked.addListener(function (tab) {
  toggle(tab);
  lastBrowserAction = Date.now();
}); // Runtime port connexion

chrome.runtime.onConnect.addListener(function (port) {
  tabs[port.sender.tab.id].initialize(port);
});
chrome.runtime.onSuspend.addListener(function () {
  for (var tabId in tabs) {
    console.log('tab ', tabId, ' deactive');
    tabs[tabId].deactivate(true);
  }
});
var Blackshrimp = {
  image: new Image(),
  canvas: document.createElement('canvas'),
  construct: function construct(tab) {
    this.tab = tab;
    this.onBrowserDisconnectClosure = this.onBrowserDisconnect.bind(this);
    this.receiveBrowserMessageClosure = this.receiveBrowserMessage.bind(this);
    var tabId = this.tab.id;
    chrome.tabs.executeScript(this.tab.id, {
      file: 'injected.js'
    }); // chrome.tabs.executeScript(tabId, { file: 'vendors/jquery-3.2.1.min.js' }, function() {
    //   chrome.tabs.executeScript(tabId, { file: 'injected.js' });
    // });
    // chrome.tabs.insertCSS(this.tab.id, { file: 'css/injected.css' });
    // Set active icon

    chrome.browserAction.setIcon({
      tabId: this.tab.id,
      path: {
        16: 'assets/img/icon16_alt.png',
        32: 'assets/img/icon16@2x.png'
      }
    });
    this.worker = new Worker('worker.js');
    this.worker.onmessage = this.receiveWorkerMessage.bind(this);
    this.worker.postMessage({
      type: 'init',
      debug: debug
    }); // this.captureTab();
  },
  destroy: function destroy(silent) {
    // if(!this.port){
    //   // not yet initialized
    //   this.alive = false;
    //   return;
    // }
    if (!silent) {
      this.port.postMessage({
        type: 'destroy'
      });
    } // this.port.onMessage.removeListener(this.receiveBrowserMessageClosure);


    this.port.onDisconnect.removeListener(this.onBrowserDisconnectClosure); // this.port.postMessage({ type: 'destroy' });

    this.worker.postMessage({
      type: 'destroy'
    }); // Set back normal Icon

    chrome.browserAction.setIcon({
      tabId: this.tab.id,
      path: {
        16: 'assets/img/icon16.png',
        32: 'assets/img/icon16@2x.png'
      }
    });
    clearTab(this.tab.id);
  },
  initialize: function initialize(port) {
    this.port = port;
    console.log('initialize - port:', port); // if (!this.alive) {
    // this.destroy();
    // return;
    // }

    this.port.onMessage.addListener(this.receiveBrowserMessageClosure);
    this.port.onDisconnect.addListener(this.onBrowserDisconnectClosure);
    this.port.postMessage({
      type: 'init',
      debug: debug
    });
    this.captureTab();
  },
  onBrowserDisconnect: function onBrowserDisconnect() {
    console.log('onBrowserDisconnect');
    this.destroy(true);
  },
  receiveBrowserMessageClosure: function receiveBrowserMessageClosure(event) {
    console.log('receiveBrowserMessageClosure', event);
  },
  receiveBrowserMessage: function receiveBrowserMessage(event) {
    switch (event.type) {
      case 'mousePos':
        this.worker.postMessage({
          type: 'mousePos',
          coord: event.coord
        });
        break;

      case 'color':
        console.log('receiveBrowserMessage color', event.data.data);
        this.port.postMessage({
          type: 'color',
          coord: event.data
        });
        break;

      case 'viewportChange':
        console.log('receiveBrowserMessage viewportChange', event.pageOffset);
        this.captureTab();
        break;

      case 'destroy':
        console.log('receiveBrowserMessage destroy');
        this.destroy();
        break;
    }
  },
  receiveWorkerMessage: function receiveWorkerMessage(event) {
    var forward = ['debug screen', 'color', 'screenshot processed', 'mousePos'];
    console.log('received worker message, forward to port :', event);

    if (forward.indexOf(event.data.type) > -1) {
      this.port.postMessage(event.data);
    }
  },
  captureTab: function captureTab() {
    chrome.tabs.captureVisibleTab({
      format: "png"
    }, this.loadImage.bind(this));
  },
  loadImage: function loadImage(dataUrl) {
    this.image.onload = this.processCapture.bind(this);
    this.image.src = dataUrl;
  },
  processCapture: function processCapture() {
    this.context = this.canvas.getContext('2d'); // adjust the canvas size to the image size

    this.canvas.width = this.tab.width;
    this.canvas.height = this.tab.height; // draw the image to the canvas

    this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height); // store image data

    var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    this.sendImageData(imageData);
  },
  sendImageData: function sendImageData(imageData) {
    console.log('imageData :', imageData); // console.log('imageData.buffer :', imageData.buffer);

    this.worker.postMessage({
      type: 'imageData',
      imageData: imageData.buffer,
      width: this.canvas.width,
      height: this.canvas.height
    }, [imageData.buffer]);
    this.port.postMessage({
      type: 'imageData',
      imageData: this.image.src,
      width: this.canvas.width,
      height: this.canvas.height
    });
  }
};

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb250ZW50c2NyaXB0LmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy8uL2NvbnRlbnRzY3JpcHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9jb250ZW50c2NyaXB0LmpzXCIpO1xuIiwidmFyIGRlYnVnID0gdHJ1ZTtcbnZhciB0YWJzID0ge307XG5cbmZ1bmN0aW9uIHRvZ2dsZSh0YWIpIHtcbiAgaWYgKCF0YWJzW3RhYi5pZF0pIHtcbiAgICBjb25zb2xlLmxvZygnYWRkVGFiJywgdGFiLmlkKTtcbiAgICBhZGRUYWIodGFiKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZygnZGVhY3RpdmF0ZVRhYicsIHRhYi5pZCk7XG4gICAgZGVhY3RpdmF0ZVRhYih0YWIuaWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFRhYih0YWIpIHtcbiAgdGFic1t0YWIuaWRdID0gT2JqZWN0LmNyZWF0ZShCbGFja3NocmltcCk7XG4gIHRhYnNbdGFiLmlkXS5jb25zdHJ1Y3QodGFiKTtcbn1cblxuZnVuY3Rpb24gZGVhY3RpdmF0ZVRhYihpZCkge1xuICB0YWJzW2lkXS5kZXN0cm95KCk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyVGFiKGlkKSB7XG4gIGZvciAodmFyIHRhYklkIGluIHRhYnMpIHtcbiAgICBpZiAodGFiSWQgPT0gaWQpIHtcbiAgICAgIGRlbGV0ZSB0YWJzW3RhYklkXTtcbiAgICB9XG4gIH1cbn1cblxudmFyIGxhc3RCcm93c2VyQWN0aW9uID0gbnVsbDsgLy8gSWNvbiBjbGljayBsaXN0ZW5lclxuXG5jaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKHRhYikge1xuICB0b2dnbGUodGFiKTtcbiAgbGFzdEJyb3dzZXJBY3Rpb24gPSBEYXRlLm5vdygpO1xufSk7IC8vIFJ1bnRpbWUgcG9ydCBjb25uZXhpb25cblxuY2hyb21lLnJ1bnRpbWUub25Db25uZWN0LmFkZExpc3RlbmVyKGZ1bmN0aW9uIChwb3J0KSB7XG4gIHRhYnNbcG9ydC5zZW5kZXIudGFiLmlkXS5pbml0aWFsaXplKHBvcnQpO1xufSk7XG5jaHJvbWUucnVudGltZS5vblN1c3BlbmQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciB0YWJJZCBpbiB0YWJzKSB7XG4gICAgY29uc29sZS5sb2coJ3RhYiAnLCB0YWJJZCwgJyBkZWFjdGl2ZScpO1xuICAgIHRhYnNbdGFiSWRdLmRlYWN0aXZhdGUodHJ1ZSk7XG4gIH1cbn0pO1xudmFyIEJsYWNrc2hyaW1wID0ge1xuICBpbWFnZTogbmV3IEltYWdlKCksXG4gIGNhbnZhczogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gIGNvbnN0cnVjdDogZnVuY3Rpb24gY29uc3RydWN0KHRhYikge1xuICAgIHRoaXMudGFiID0gdGFiO1xuICAgIHRoaXMub25Ccm93c2VyRGlzY29ubmVjdENsb3N1cmUgPSB0aGlzLm9uQnJvd3NlckRpc2Nvbm5lY3QuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlY2VpdmVCcm93c2VyTWVzc2FnZUNsb3N1cmUgPSB0aGlzLnJlY2VpdmVCcm93c2VyTWVzc2FnZS5iaW5kKHRoaXMpO1xuICAgIHZhciB0YWJJZCA9IHRoaXMudGFiLmlkO1xuICAgIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQodGhpcy50YWIuaWQsIHtcbiAgICAgIGZpbGU6ICdpbmplY3RlZC5qcydcbiAgICB9KTsgLy8gY2hyb21lLnRhYnMuZXhlY3V0ZVNjcmlwdCh0YWJJZCwgeyBmaWxlOiAndmVuZG9ycy9qcXVlcnktMy4yLjEubWluLmpzJyB9LCBmdW5jdGlvbigpIHtcbiAgICAvLyAgIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQodGFiSWQsIHsgZmlsZTogJ2luamVjdGVkLmpzJyB9KTtcbiAgICAvLyB9KTtcbiAgICAvLyBjaHJvbWUudGFicy5pbnNlcnRDU1ModGhpcy50YWIuaWQsIHsgZmlsZTogJ2Nzcy9pbmplY3RlZC5jc3MnIH0pO1xuICAgIC8vIFNldCBhY3RpdmUgaWNvblxuXG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0SWNvbih7XG4gICAgICB0YWJJZDogdGhpcy50YWIuaWQsXG4gICAgICBwYXRoOiB7XG4gICAgICAgIDE2OiAnYXNzZXRzL2ltZy9pY29uMTZfYWx0LnBuZycsXG4gICAgICAgIDMyOiAnYXNzZXRzL2ltZy9pY29uMTZAMngucG5nJ1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcignd29ya2VyLmpzJyk7XG4gICAgdGhpcy53b3JrZXIub25tZXNzYWdlID0gdGhpcy5yZWNlaXZlV29ya2VyTWVzc2FnZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgIHR5cGU6ICdpbml0JyxcbiAgICAgIGRlYnVnOiBkZWJ1Z1xuICAgIH0pOyAvLyB0aGlzLmNhcHR1cmVUYWIoKTtcbiAgfSxcbiAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveShzaWxlbnQpIHtcbiAgICAvLyBpZighdGhpcy5wb3J0KXtcbiAgICAvLyAgIC8vIG5vdCB5ZXQgaW5pdGlhbGl6ZWRcbiAgICAvLyAgIHRoaXMuYWxpdmUgPSBmYWxzZTtcbiAgICAvLyAgIHJldHVybjtcbiAgICAvLyB9XG4gICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgIHRoaXMucG9ydC5wb3N0TWVzc2FnZSh7XG4gICAgICAgIHR5cGU6ICdkZXN0cm95J1xuICAgICAgfSk7XG4gICAgfSAvLyB0aGlzLnBvcnQub25NZXNzYWdlLnJlbW92ZUxpc3RlbmVyKHRoaXMucmVjZWl2ZUJyb3dzZXJNZXNzYWdlQ2xvc3VyZSk7XG5cblxuICAgIHRoaXMucG9ydC5vbkRpc2Nvbm5lY3QucmVtb3ZlTGlzdGVuZXIodGhpcy5vbkJyb3dzZXJEaXNjb25uZWN0Q2xvc3VyZSk7IC8vIHRoaXMucG9ydC5wb3N0TWVzc2FnZSh7IHR5cGU6ICdkZXN0cm95JyB9KTtcblxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgIHR5cGU6ICdkZXN0cm95J1xuICAgIH0pOyAvLyBTZXQgYmFjayBub3JtYWwgSWNvblxuXG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0SWNvbih7XG4gICAgICB0YWJJZDogdGhpcy50YWIuaWQsXG4gICAgICBwYXRoOiB7XG4gICAgICAgIDE2OiAnYXNzZXRzL2ltZy9pY29uMTYucG5nJyxcbiAgICAgICAgMzI6ICdhc3NldHMvaW1nL2ljb24xNkAyeC5wbmcnXG4gICAgICB9XG4gICAgfSk7XG4gICAgY2xlYXJUYWIodGhpcy50YWIuaWQpO1xuICB9LFxuICBpbml0aWFsaXplOiBmdW5jdGlvbiBpbml0aWFsaXplKHBvcnQpIHtcbiAgICB0aGlzLnBvcnQgPSBwb3J0O1xuICAgIGNvbnNvbGUubG9nKCdpbml0aWFsaXplIC0gcG9ydDonLCBwb3J0KTsgLy8gaWYgKCF0aGlzLmFsaXZlKSB7XG4gICAgLy8gdGhpcy5kZXN0cm95KCk7XG4gICAgLy8gcmV0dXJuO1xuICAgIC8vIH1cblxuICAgIHRoaXMucG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIodGhpcy5yZWNlaXZlQnJvd3Nlck1lc3NhZ2VDbG9zdXJlKTtcbiAgICB0aGlzLnBvcnQub25EaXNjb25uZWN0LmFkZExpc3RlbmVyKHRoaXMub25Ccm93c2VyRGlzY29ubmVjdENsb3N1cmUpO1xuICAgIHRoaXMucG9ydC5wb3N0TWVzc2FnZSh7XG4gICAgICB0eXBlOiAnaW5pdCcsXG4gICAgICBkZWJ1ZzogZGVidWdcbiAgICB9KTtcbiAgICB0aGlzLmNhcHR1cmVUYWIoKTtcbiAgfSxcbiAgb25Ccm93c2VyRGlzY29ubmVjdDogZnVuY3Rpb24gb25Ccm93c2VyRGlzY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZygnb25Ccm93c2VyRGlzY29ubmVjdCcpO1xuICAgIHRoaXMuZGVzdHJveSh0cnVlKTtcbiAgfSxcbiAgcmVjZWl2ZUJyb3dzZXJNZXNzYWdlQ2xvc3VyZTogZnVuY3Rpb24gcmVjZWl2ZUJyb3dzZXJNZXNzYWdlQ2xvc3VyZShldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdyZWNlaXZlQnJvd3Nlck1lc3NhZ2VDbG9zdXJlJywgZXZlbnQpO1xuICB9LFxuICByZWNlaXZlQnJvd3Nlck1lc3NhZ2U6IGZ1bmN0aW9uIHJlY2VpdmVCcm93c2VyTWVzc2FnZShldmVudCkge1xuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgY2FzZSAnbW91c2VQb3MnOlxuICAgICAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgdHlwZTogJ21vdXNlUG9zJyxcbiAgICAgICAgICBjb29yZDogZXZlbnQuY29vcmRcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdjb2xvcic6XG4gICAgICAgIGNvbnNvbGUubG9nKCdyZWNlaXZlQnJvd3Nlck1lc3NhZ2UgY29sb3InLCBldmVudC5kYXRhLmRhdGEpO1xuICAgICAgICB0aGlzLnBvcnQucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgIHR5cGU6ICdjb2xvcicsXG4gICAgICAgICAgY29vcmQ6IGV2ZW50LmRhdGFcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICd2aWV3cG9ydENoYW5nZSc6XG4gICAgICAgIGNvbnNvbGUubG9nKCdyZWNlaXZlQnJvd3Nlck1lc3NhZ2Ugdmlld3BvcnRDaGFuZ2UnLCBldmVudC5wYWdlT2Zmc2V0KTtcbiAgICAgICAgdGhpcy5jYXB0dXJlVGFiKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdkZXN0cm95JzpcbiAgICAgICAgY29uc29sZS5sb2coJ3JlY2VpdmVCcm93c2VyTWVzc2FnZSBkZXN0cm95Jyk7XG4gICAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0sXG4gIHJlY2VpdmVXb3JrZXJNZXNzYWdlOiBmdW5jdGlvbiByZWNlaXZlV29ya2VyTWVzc2FnZShldmVudCkge1xuICAgIHZhciBmb3J3YXJkID0gWydkZWJ1ZyBzY3JlZW4nLCAnY29sb3InLCAnc2NyZWVuc2hvdCBwcm9jZXNzZWQnLCAnbW91c2VQb3MnXTtcbiAgICBjb25zb2xlLmxvZygncmVjZWl2ZWQgd29ya2VyIG1lc3NhZ2UsIGZvcndhcmQgdG8gcG9ydCA6JywgZXZlbnQpO1xuXG4gICAgaWYgKGZvcndhcmQuaW5kZXhPZihldmVudC5kYXRhLnR5cGUpID4gLTEpIHtcbiAgICAgIHRoaXMucG9ydC5wb3N0TWVzc2FnZShldmVudC5kYXRhKTtcbiAgICB9XG4gIH0sXG4gIGNhcHR1cmVUYWI6IGZ1bmN0aW9uIGNhcHR1cmVUYWIoKSB7XG4gICAgY2hyb21lLnRhYnMuY2FwdHVyZVZpc2libGVUYWIoe1xuICAgICAgZm9ybWF0OiBcInBuZ1wiXG4gICAgfSwgdGhpcy5sb2FkSW1hZ2UuYmluZCh0aGlzKSk7XG4gIH0sXG4gIGxvYWRJbWFnZTogZnVuY3Rpb24gbG9hZEltYWdlKGRhdGFVcmwpIHtcbiAgICB0aGlzLmltYWdlLm9ubG9hZCA9IHRoaXMucHJvY2Vzc0NhcHR1cmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLmltYWdlLnNyYyA9IGRhdGFVcmw7XG4gIH0sXG4gIHByb2Nlc3NDYXB0dXJlOiBmdW5jdGlvbiBwcm9jZXNzQ2FwdHVyZSgpIHtcbiAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpOyAvLyBhZGp1c3QgdGhlIGNhbnZhcyBzaXplIHRvIHRoZSBpbWFnZSBzaXplXG5cbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMudGFiLndpZHRoO1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMudGFiLmhlaWdodDsgLy8gZHJhdyB0aGUgaW1hZ2UgdG8gdGhlIGNhbnZhc1xuXG4gICAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltYWdlLCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTsgLy8gc3RvcmUgaW1hZ2UgZGF0YVxuXG4gICAgdmFyIGltYWdlRGF0YSA9IHRoaXMuY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCkuZGF0YTtcbiAgICB0aGlzLnNlbmRJbWFnZURhdGEoaW1hZ2VEYXRhKTtcbiAgfSxcbiAgc2VuZEltYWdlRGF0YTogZnVuY3Rpb24gc2VuZEltYWdlRGF0YShpbWFnZURhdGEpIHtcbiAgICBjb25zb2xlLmxvZygnaW1hZ2VEYXRhIDonLCBpbWFnZURhdGEpOyAvLyBjb25zb2xlLmxvZygnaW1hZ2VEYXRhLmJ1ZmZlciA6JywgaW1hZ2VEYXRhLmJ1ZmZlcik7XG5cbiAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICB0eXBlOiAnaW1hZ2VEYXRhJyxcbiAgICAgIGltYWdlRGF0YTogaW1hZ2VEYXRhLmJ1ZmZlcixcbiAgICAgIHdpZHRoOiB0aGlzLmNhbnZhcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5jYW52YXMuaGVpZ2h0XG4gICAgfSwgW2ltYWdlRGF0YS5idWZmZXJdKTtcbiAgICB0aGlzLnBvcnQucG9zdE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogJ2ltYWdlRGF0YScsXG4gICAgICBpbWFnZURhdGE6IHRoaXMuaW1hZ2Uuc3JjLFxuICAgICAgd2lkdGg6IHRoaXMuY2FudmFzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmNhbnZhcy5oZWlnaHRcbiAgICB9KTtcbiAgfVxufTsiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QSIsInNvdXJjZVJvb3QiOiIifQ==