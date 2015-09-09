/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	"use strict";

	var element = document.querySelector("#greeting");
	element.innerText = "Hello, world!";

	var button = document.getElementById('scan');

	var SERIAL_SERVICE = 'a495ff10-c5b1-4b44-b512-1370f02d74de';

	function getDevice() {
	  return navigator.bluetooth.requestDevice({ filters: [{ services: [SERIAL_SERVICE, 0x1800, 0x1801] }] });
	}

	function doScan() {
	  console.log('hello');

	  getDevice().then(function (device) {

	    console.log('device', device);
	    // Human-readable name of the device.
	    console.log('name', device.name);
	    // Indicates whether or not the device is paired with the system.
	    console.log('paired', device.paired);
	    // Filtered UUIDs of GATT services the website origin has access to.
	    console.log('services', device.uuids);

	    // Attempts to connect to remote GATT Server.
	    return device.connectGATT();
	  }).then(function (server) {
	    console.log('server', server);
	    return server.getPrimaryService(SERIAL_SERVICE);
	  }).then(function (service) {
	    console.log('service', service);
	  })["catch"](function (error) {
	    console.log(error);
	  });
	}

	//function doCharacteristic

	button.addEventListener("click", doScan, false);

/***/ }
/******/ ]);