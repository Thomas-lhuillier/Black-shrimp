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
/******/ 	return __webpack_require__(__webpack_require__.s = "./worker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./worker.js":
/*!*******************!*\
  !*** ./worker.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports) {

var debug;
var imageData;
var workerImageData;
var width, height; // In this file we can process the image data we received
// operating on a Uint8ClampedArray

onmessage = function onmessage(event) {
  switch (event.data.type) {
    case 'init':
      debug = event.data.debug; // postMessage({ type: "init", debug: debug});

      break;

    case 'imageData':
      imageData = new Uint8ClampedArray(event.data.imageData);
      workerImageData = new Uint8ClampedArray(imageData); // data = grayscale( imageData );

      width = event.data.width;
      height = event.data.height;
      postMessage({
        type: 'screenshot processed',
        imageData: imageData.buffer,
        width: width,
        height: height
      }, [imageData.buffer]);
      break;

    case 'mousePos':
      var coord = event.data.coord;
      processMousePos(coord);
      break;
    // case 'saveFile':
    //   postMessage({
    //     type: 'saveFile',
    //     data: event.data
    //   });
    //   break;
  }
};

var centerPixel = {};

function processMousePos(coord) {
  centerPixel.x = coord.x;
  centerPixel.y = coord.y;
  Object.assign(centerPixel, getPixelValueAt(centerPixel.x, centerPixel.y));
  console.log('centerPixel', centerPixel);
  postMessage({
    type: 'color',
    data: centerPixel
  });
}

function getPixelValueAt(x, y) {
  var tempArray = new Uint8ClampedArray(workerImageData);
  var n = y * width * 4 + x * 4;
  var R = tempArray[n],
      G = tempArray[++n],
      B = tempArray[++n],
      HEX = rgbToHex(R, G, B),
      HSL = rgbToHsl(R, G, B);
  var pixel = {
    r: R,
    g: G,
    b: B,
    hex: HEX,
    h: HSL[0],
    s: HSL[1],
    l: HSL[2]
  };
  return pixel;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
  var h,
      s,
      l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;

      case g:
        h = (b - r) / d + 2;
        break;

      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  } // return [h, s, l];


  return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi93b3JrZXIuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vd29ya2VyLmpzXCIpO1xuIiwidmFyIGRlYnVnO1xudmFyIGltYWdlRGF0YTtcbnZhciB3b3JrZXJJbWFnZURhdGE7XG52YXIgd2lkdGgsIGhlaWdodDsgLy8gSW4gdGhpcyBmaWxlIHdlIGNhbiBwcm9jZXNzIHRoZSBpbWFnZSBkYXRhIHdlIHJlY2VpdmVkXG4vLyBvcGVyYXRpbmcgb24gYSBVaW50OENsYW1wZWRBcnJheVxuXG5vbm1lc3NhZ2UgPSBmdW5jdGlvbiBvbm1lc3NhZ2UoZXZlbnQpIHtcbiAgc3dpdGNoIChldmVudC5kYXRhLnR5cGUpIHtcbiAgICBjYXNlICdpbml0JzpcbiAgICAgIGRlYnVnID0gZXZlbnQuZGF0YS5kZWJ1ZzsgLy8gcG9zdE1lc3NhZ2UoeyB0eXBlOiBcImluaXRcIiwgZGVidWc6IGRlYnVnfSk7XG5cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnaW1hZ2VEYXRhJzpcbiAgICAgIGltYWdlRGF0YSA9IG5ldyBVaW50OENsYW1wZWRBcnJheShldmVudC5kYXRhLmltYWdlRGF0YSk7XG4gICAgICB3b3JrZXJJbWFnZURhdGEgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkoaW1hZ2VEYXRhKTsgLy8gZGF0YSA9IGdyYXlzY2FsZSggaW1hZ2VEYXRhICk7XG5cbiAgICAgIHdpZHRoID0gZXZlbnQuZGF0YS53aWR0aDtcbiAgICAgIGhlaWdodCA9IGV2ZW50LmRhdGEuaGVpZ2h0O1xuICAgICAgcG9zdE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiAnc2NyZWVuc2hvdCBwcm9jZXNzZWQnLFxuICAgICAgICBpbWFnZURhdGE6IGltYWdlRGF0YS5idWZmZXIsXG4gICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICAgIH0sIFtpbWFnZURhdGEuYnVmZmVyXSk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ21vdXNlUG9zJzpcbiAgICAgIHZhciBjb29yZCA9IGV2ZW50LmRhdGEuY29vcmQ7XG4gICAgICBwcm9jZXNzTW91c2VQb3MoY29vcmQpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gY2FzZSAnc2F2ZUZpbGUnOlxuICAgIC8vICAgcG9zdE1lc3NhZ2Uoe1xuICAgIC8vICAgICB0eXBlOiAnc2F2ZUZpbGUnLFxuICAgIC8vICAgICBkYXRhOiBldmVudC5kYXRhXG4gICAgLy8gICB9KTtcbiAgICAvLyAgIGJyZWFrO1xuICB9XG59O1xuXG52YXIgY2VudGVyUGl4ZWwgPSB7fTtcblxuZnVuY3Rpb24gcHJvY2Vzc01vdXNlUG9zKGNvb3JkKSB7XG4gIGNlbnRlclBpeGVsLnggPSBjb29yZC54O1xuICBjZW50ZXJQaXhlbC55ID0gY29vcmQueTtcbiAgT2JqZWN0LmFzc2lnbihjZW50ZXJQaXhlbCwgZ2V0UGl4ZWxWYWx1ZUF0KGNlbnRlclBpeGVsLngsIGNlbnRlclBpeGVsLnkpKTtcbiAgY29uc29sZS5sb2coJ2NlbnRlclBpeGVsJywgY2VudGVyUGl4ZWwpO1xuICBwb3N0TWVzc2FnZSh7XG4gICAgdHlwZTogJ2NvbG9yJyxcbiAgICBkYXRhOiBjZW50ZXJQaXhlbFxuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0UGl4ZWxWYWx1ZUF0KHgsIHkpIHtcbiAgdmFyIHRlbXBBcnJheSA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh3b3JrZXJJbWFnZURhdGEpO1xuICB2YXIgbiA9IHkgKiB3aWR0aCAqIDQgKyB4ICogNDtcbiAgdmFyIFIgPSB0ZW1wQXJyYXlbbl0sXG4gICAgICBHID0gdGVtcEFycmF5Wysrbl0sXG4gICAgICBCID0gdGVtcEFycmF5Wysrbl0sXG4gICAgICBIRVggPSByZ2JUb0hleChSLCBHLCBCKSxcbiAgICAgIEhTTCA9IHJnYlRvSHNsKFIsIEcsIEIpO1xuICB2YXIgcGl4ZWwgPSB7XG4gICAgcjogUixcbiAgICBnOiBHLFxuICAgIGI6IEIsXG4gICAgaGV4OiBIRVgsXG4gICAgaDogSFNMWzBdLFxuICAgIHM6IEhTTFsxXSxcbiAgICBsOiBIU0xbMl1cbiAgfTtcbiAgcmV0dXJuIHBpeGVsO1xufVxuXG5mdW5jdGlvbiByZ2JUb0hleChyLCBnLCBiKSB7XG4gIHJldHVybiBcIiNcIiArIGNvbXBvbmVudFRvSGV4KHIpICsgY29tcG9uZW50VG9IZXgoZykgKyBjb21wb25lbnRUb0hleChiKTtcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50VG9IZXgoYykge1xuICB2YXIgaGV4ID0gYy50b1N0cmluZygxNik7XG4gIHJldHVybiBoZXgubGVuZ3RoID09IDEgPyBcIjBcIiArIGhleCA6IGhleDtcbn1cblxuZnVuY3Rpb24gcmdiVG9Ic2wociwgZywgYikge1xuICByIC89IDI1NSwgZyAvPSAyNTUsIGIgLz0gMjU1O1xuICB2YXIgbWF4ID0gTWF0aC5tYXgociwgZywgYiksXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgdmFyIGgsXG4gICAgICBzLFxuICAgICAgbCA9IChtYXggKyBtaW4pIC8gMjtcblxuICBpZiAobWF4ID09IG1pbikge1xuICAgIGggPSBzID0gMDsgLy8gYWNocm9tYXRpY1xuICB9IGVsc2Uge1xuICAgIHZhciBkID0gbWF4IC0gbWluO1xuICAgIHMgPSBsID4gMC41ID8gZCAvICgyIC0gbWF4IC0gbWluKSA6IGQgLyAobWF4ICsgbWluKTtcblxuICAgIHN3aXRjaCAobWF4KSB7XG4gICAgICBjYXNlIHI6XG4gICAgICAgIGggPSAoZyAtIGIpIC8gZCArIChnIDwgYiA/IDYgOiAwKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgZzpcbiAgICAgICAgaCA9IChiIC0gcikgLyBkICsgMjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgYjpcbiAgICAgICAgaCA9IChyIC0gZykgLyBkICsgNDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaCAvPSA2O1xuICB9IC8vIHJldHVybiBbaCwgcywgbF07XG5cblxuICByZXR1cm4gW01hdGguZmxvb3IoaCAqIDM2MCksIE1hdGguZmxvb3IocyAqIDEwMCksIE1hdGguZmxvb3IobCAqIDEwMCldO1xufSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0EiLCJzb3VyY2VSb290IjoiIn0=