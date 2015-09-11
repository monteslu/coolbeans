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
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {'use strict';

	var Bean = __webpack_require__(5);

	console.log('Bean', Bean);

	var element = document.querySelector("#greeting");
	element.innerText = "Hello, world!";

	var button = document.getElementById('scan');

	var SERIAL_SERVICE = 'a495ff10-c5b1-4b44-b512-1370f02d74de';

	function doScan() {
	  console.log('hello');
	  var intervalId;
	  var connectedBean;

	  Bean.discover(function (bean) {
	    connectedBean = bean;

	    bean.on("accell", function (x, y, z, valid) {
	      var status = valid ? "valid" : "invalid";
	      console.log("received " + status + " accell\tx:\t" + x + "\ty:\t" + y + "\tz:\t" + z);
	    });

	    bean.on("temp", function (temp, valid) {
	      var status = valid ? "valid" : "invalid";
	      console.log("received " + status + " temp:\t" + temp);
	    });

	    bean.on("disconnect", function () {
	      console.log('disconnected');
	    });

	    bean.connectAndSetup(function () {

	      var readData = function readData() {

	        //set random led colors between 0-255. I find red overpowering so red between 0-64
	        bean.setColor(new Buffer([0, 0, 255]), function () {
	          console.log("led color sent");
	        });

	        // bean.requestAccell(
	        // function(){
	        //   console.log("request accell sent");
	        // });

	        // bean.requestTemp(
	        // function(){
	        //   console.log("request temp sent");
	        // });
	      };

	      intervalId = setInterval(readData, 1000);
	    });
	  });
	}

	//function doCharacteristic

	button.addEventListener("click", doScan, false);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */

	var base64 = __webpack_require__(2)
	var ieee754 = __webpack_require__(3)
	var isArray = __webpack_require__(4)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = (function () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	})()

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  this.length = 0
	  this.parent = undefined

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	// pre-set for values that may exist in the future
	Buffer.prototype.length = undefined
	Buffer.prototype.parent = undefined

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = value
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = value
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = value
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = value
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = value
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = value
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 3 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	
	/**
	 * isArray
	 */

	var isArray = Array.isArray;

	/**
	 * toString
	 */

	var str = Object.prototype.toString;

	/**
	 * Whether or not the given `val`
	 * is an array.
	 *
	 * example:
	 *
	 *        isArray([]);
	 *        // > true
	 *        isArray(arguments);
	 *        // > false
	 *        isArray('');
	 *        // > false
	 *
	 * @param {mixed} val
	 * @return {bool}
	 */

	module.exports = isArray || function (val) {
	  return !! val && '[object Array]' == str.call(val);
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true */
	"use strict";

	var NobleDevice = __webpack_require__(6);

	var Bean = __webpack_require__(32);

	var ScratchOne = __webpack_require__(45);
	var ScratchTwo = __webpack_require__(46);
	var ScratchThree = __webpack_require__(47);
	var ScratchFour = __webpack_require__(48);
	var ScratchFive = __webpack_require__(49);

	NobleDevice.Util.mixin(Bean, NobleDevice.BatteryService);
	NobleDevice.Util.mixin(Bean, NobleDevice.DeviceInformationService);

	NobleDevice.Util.mixin(Bean, ScratchOne);
	NobleDevice.Util.mixin(Bean, ScratchTwo);
	NobleDevice.Util.mixin(Bean, ScratchThree);
	NobleDevice.Util.mixin(Bean, ScratchFour);
	NobleDevice.Util.mixin(Bean, ScratchFive);

	module.exports = Bean;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var NobleDevice = __webpack_require__(7);

	NobleDevice.Util = __webpack_require__(13);
	NobleDevice.DeviceInformationService = __webpack_require__(30);
	NobleDevice.BatteryService = __webpack_require__(31);

	module.exports = NobleDevice;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var events = __webpack_require__(8);
	var util = __webpack_require__(9);

	var GENERIC_ACCESS_UUID                     = '1800';
	var DEVICE_NAME_UUID                        = '2a00';

	function NobleDevice(peripheral) {
	  this._peripheral = peripheral;
	  this._services = {};
	  this._characteristics = {};

	  this.id = peripheral.id;
	  this.uuid = peripheral.uuid; // for legacy
	  this.address = peripheral.address;
	  this.addressType = peripheral.addressType;
	  this.connectedAndSetUp = false;

	  this._peripheral.on('disconnect', this.onDisconnect.bind(this));
	}

	util.inherits(NobleDevice, events.EventEmitter);

	NobleDevice.prototype.onDisconnect = function() {
	  this.connectedAndSetUp = false;
	  this.emit('disconnect');
	};

	NobleDevice.prototype.toString = function() {
	  return JSON.stringify({
	    uuid: this.uuid
	  });
	};

	NobleDevice.prototype.connect = function(callback) {
	  this._peripheral.connect(callback);
	};

	NobleDevice.prototype.disconnect = function(callback) {
	  this._peripheral.disconnect(callback);
	};

	NobleDevice.prototype.discoverServicesAndCharacteristics = function(callback) {
	  this._peripheral.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
	    if (error) {
	      return callback(error);
	    }

	    for (var i in services) {
	      var service = services[i];
	      var characteristics = service.characteristics;

	      var serviceUuid = service.uuid;

	      this._services[serviceUuid] = service;
	      this._characteristics[serviceUuid] = {};

	      for (var j in characteristics) {
	        var characteristic = characteristics[j];

	        this._characteristics[serviceUuid][characteristic.uuid] = characteristic;
	      }
	    }

	    callback();
	  }.bind(this));
	};

	NobleDevice.prototype.connectAndSetUp = NobleDevice.prototype.connectAndSetup = function(callback) {
	  this.connect(function(error) {
	    if (error) {
	      return callback(error);
	    }

	    this.discoverServicesAndCharacteristics(function() {
	      this.connectedAndSetUp = true;
	      callback();
	    }.bind(this));
	  }.bind(this));
	};

	NobleDevice.prototype.readDataCharacteristic = function(serviceUuid, characteristicUuid, callback) {
	  if (!this._characteristics[serviceUuid]) {
	    return callback(new Error('service uuid ' + serviceUuid + ' not found!'));
	  } else if (!this._characteristics[serviceUuid][characteristicUuid]) {
	    return callback(new Error('characteristic uuid ' + characteristicUuid + ' not found in service uuid ' + serviceUuid + '!'));
	  }

	  this._characteristics[serviceUuid][characteristicUuid].read(callback);
	};

	NobleDevice.prototype.writeDataCharacteristic = function(serviceUuid, characteristicUuid, data, callback) {
	  if (!this._characteristics[serviceUuid]) {
	    return callback(new Error('service uuid ' + serviceUuid + ' not found!'));
	  } else if (!this._characteristics[serviceUuid][characteristicUuid]) {
	    return callback(new Error('characteristic uuid ' + characteristicUuid + ' not found in service uuid ' + serviceUuid + '!'));
	  }

	  var characteristic = this._characteristics[serviceUuid][characteristicUuid];

	  var withoutResponse = (characteristic.properties.indexOf('writeWithoutResponse') !== -1) &&
	                          (characteristic.properties.indexOf('write') === -1);

	  characteristic.write(data, withoutResponse, function(error) {
	    if (typeof callback === 'function') {
	      callback(error);
	    }
	  });
	};

	NobleDevice.prototype.notifyCharacteristic = function(serviceUuid, characteristicUuid, notify, listener, callback) {
	  if (!this._characteristics[serviceUuid]) {
	    return callback(new Error('service uuid ' + serviceUuid + ' not found!'));
	  } else if (!this._characteristics[serviceUuid][characteristicUuid]) {
	    return callback(new Error('characteristic uuid ' + characteristicUuid + ' not found in service uuid ' + serviceUuid + '!'));
	  }

	  var characteristic = this._characteristics[serviceUuid][characteristicUuid];

	  characteristic.notify(notify, function(error) {
	    if (notify) {
	      characteristic.addListener('data', listener);
	    } else {
	      characteristic.removeListener('data', listener);
	    }

	    if (typeof callback === 'function') {
	      callback(error);
	    }
	  });
	};

	NobleDevice.prototype.readStringCharacteristic = function(serviceUuid, characteristicUuid, callback) {
	  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
	    if (error) {
	      return callback(error);
	    }

	    callback(null, data.toString());
	  });
	};

	NobleDevice.prototype.readUInt8Characteristic = function(serviceUuid, characteristicUuid, callback) {
	  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
	    if (error) {
	      return callback(error);
	    }

	    callback(null, data.readUInt8(0));
	  });
	};

	NobleDevice.prototype.readUInt16LECharacteristic = function(serviceUuid, characteristicUuid, callback) {
	  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
	    if (error) {
	      return callback(error);
	    }

	    callback(null, data.readUInt16LE(0));
	  });
	};

	NobleDevice.prototype.readUInt32LECharacteristic = function(serviceUuid, characteristicUuid, callback) {
	  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
	    if (error) {
	      return callback(error);
	    }

	    callback(null, data.readUInt32LE(0));
	  });
	};

	NobleDevice.prototype.readFloatLECharacteristic = function(serviceUuid, characteristicUuid, callback) {
	  this.readDataCharacteristic(serviceUuid, characteristicUuid, function(error, data) {
	    if (error) {
	      return callback(error);
	    }

	    callback(null, data.readFloatLE(0));
	  });
	};

	NobleDevice.prototype.writeStringCharacteristic = function(serviceUuid, characteristicUuid, string, callback) {
	  this.writeDataCharacteristic(serviceUuid, characteristicUuid, new Buffer(string), callback);
	};

	NobleDevice.prototype.writeUInt8Characteristic = function(serviceUuid, characteristicUuid, value, callback) {
	  var buffer = new Buffer(1);
	  buffer.writeUInt8(value, 0);

	  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
	};

	NobleDevice.prototype.writeUInt8Characteristic = function(serviceUuid, characteristicUuid, value, callback) {
	  var buffer = new Buffer(1);
	  buffer.writeUInt8(value, 0);

	  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
	};

	NobleDevice.prototype.writeUInt16LECharacteristic = function(serviceUuid, characteristicUuid, value, callback) {
	  var buffer = new Buffer(2);
	  buffer.writeUInt16LE(value, 0);

	  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
	};

	NobleDevice.prototype.writeUInt32LECharacteristic = function(serviceUuid, characteristicUuid, value, callback) {
	  var buffer = new Buffer(4);
	  buffer.writeUInt32LE(value, 0);

	  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
	};

	NobleDevice.prototype.writeFloatLECharacteristic = function(serviceUuid, characteristicUuid, value, callback) {
	  var buffer = new Buffer(4);
	  buffer.writeFloatLE(value, 0);

	  this.writeDataCharacteristic(serviceUuid, characteristicUuid, buffer, callback);
	};

	NobleDevice.prototype.readDeviceName = function(callback) {
	  this.readStringCharacteristic(GENERIC_ACCESS_UUID, DEVICE_NAME_UUID, callback);
	};

	module.exports = NobleDevice;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ },
/* 8 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        len = arguments.length;
	        args = new Array(len - 1);
	        for (i = 1; i < len; i++)
	          args[i - 1] = arguments[i];
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    len = arguments.length;
	    args = new Array(len - 1);
	    for (i = 1; i < len; i++)
	      args[i - 1] = arguments[i];

	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    var m;
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  var ret;
	  if (!emitter._events || !emitter._events[type])
	    ret = 0;
	  else if (isFunction(emitter._events[type]))
	    ret = 1;
	  else
	    ret = emitter._events[type].length;
	  return ret;
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(11);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(12);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(10)))

/***/ },
/* 10 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            currentQueue[queueIndex].run();
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 12 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var events = __webpack_require__(8);
	var util   = __webpack_require__(9);

	var noble  = __webpack_require__(14);

	var EventEmitter = events.EventEmitter;

	var NobleDevice = __webpack_require__(7);

	function Util() {
	}

	Util.inherits = function(constructor, superConstructor) {
	  util.inherits(constructor, superConstructor);

	  if (superConstructor === NobleDevice) {
	    constructor.SCAN_UUIDS = constructor.SCAN_UUIDS || [];
	    constructor.SCAN_DUPLICATES = constructor.SCAN_DUPLICATES || false;

	    constructor.is = constructor.is || function(peripheral) {
	      return true;
	    };

	    constructor.emitter = new EventEmitter();

	    constructor.onDiscover = function(peripheral) {
	      if (constructor.is(peripheral)) {
	        var device = new constructor(peripheral);

	        constructor.emitter.emit('discover', device);
	      }
	    };

	    constructor.onStateChange = function(state) {
	      if (state === 'poweredOn' && constructor.emitter.listeners('discover').length > 0) {
	        constructor.startScanning();
	      }
	    };

	    constructor.startScanning = function() {
	      noble.startScanning(constructor.SCAN_UUIDS, constructor.SCAN_DUPLICATES);
	    };

	    constructor.stopScanning = function() {
	      noble.stopScanning();
	    };

	    constructor.discoverAll = function(callback) {
	      constructor.emitter.addListener('discover', callback);

	      if (constructor.emitter.listeners('discover').length === 1) {
	        noble.on('discover', constructor.onDiscover);
	        noble.on('stateChange', constructor.onStateChange);

	        if (noble.state === 'poweredOn') {
	          constructor.startScanning();
	        }
	      }
	    };

	    constructor.stopDiscoverAll = function(discoverCallback) {
	      constructor.emitter.removeListener('discover', discoverCallback);

	      if (constructor.emitter.listeners('discover').length === 0) {
	        noble.removeListener('discover', constructor.onDiscover);
	        noble.removeListener('stateChange', constructor.onStateChange);

	        constructor.stopScanning();
	      }
	    };

	    constructor.discover = function(callback) {
	      var onDiscover = function(device) {
	        constructor.stopDiscoverAll(onDiscover);

	        callback(device);
	      };

	      constructor.discoverAll(onDiscover);
	    };

	    constructor.discoverWithFilter = function(filter, callback) {
	      var onDiscoverWithFilter = function(device) {
	        if (filter(device)) {
	          constructor.stopDiscoverAll(onDiscoverWithFilter);

	          callback(device);
	        }
	      };

	      constructor.discoverAll(onDiscoverWithFilter);
	    };

	    constructor.discoverById = function(id, callback) {
	      constructor.discoverWithFilter(function(device) {
	        return (device.id === id);
	      }, callback);
	    };

	    // deprecated
	    constructor.discoverByUuid = function(uuid, callback) {
	      constructor.discoverWithFilter(function(device) {
	        return (device.uuid === uuid);
	      }, callback);
	    };

	    constructor.discoverByAddress = function(address, callback) {
	      constructor.discoverWithFilter(function(device) {
	        return (device.address === address);
	      }, callback);
	    };
	  }
	};

	Util.mixin = function(constructor, mixin, includedMethods, excludedMethods) {
	  excludedMethods = excludedMethods || [];

	  for (var i in mixin.prototype) {
	    var include = (!includedMethods) || (includedMethods.indexOf(i) !== -1);
	    var exclude = (excludedMethods.indexOf(i) !== -1);

	    if (include && !exclude) {
	      constructor.prototype[i] = mixin.prototype[i];
	    }
	  }
	};

	module.exports = Util;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Noble = __webpack_require__(15);

	module.exports = new Noble();

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var debug = __webpack_require__(16)('noble');

	var events = __webpack_require__(8);
	var util = __webpack_require__(9);

	var Peripheral = __webpack_require__(19);
	var Service = __webpack_require__(20);
	var Characteristic = __webpack_require__(22);
	var Descriptor = __webpack_require__(24);

	var bindings = __webpack_require__(26)();

	function Noble() {
	  this.state = 'unknown';

	  this._bindings = bindings;
	  this._peripherals = {};
	  this._services = {};
	  this._characteristics = {};
	  this._descriptors = {};

	  this._bindings.on('stateChange', this.onStateChange.bind(this));
	  this._bindings.on('scanStart', this.onScanStart.bind(this));
	  this._bindings.on('scanStop', this.onScanStop.bind(this));
	  this._bindings.on('discover', this.onDiscover.bind(this));
	  this._bindings.on('connect', this.onConnect.bind(this));
	  this._bindings.on('disconnect', this.onDisconnect.bind(this));
	  this._bindings.on('rssiUpdate', this.onRssiUpdate.bind(this));
	  this._bindings.on('servicesDiscover', this.onServicesDiscover.bind(this));
	  this._bindings.on('includedServicesDiscover', this.onIncludedServicesDiscover.bind(this));
	  this._bindings.on('characteristicsDiscover', this.onCharacteristicsDiscover.bind(this));
	  this._bindings.on('read', this.onRead.bind(this));
	  this._bindings.on('write', this.onWrite.bind(this));
	  this._bindings.on('broadcast', this.onBroadcast.bind(this));
	  this._bindings.on('notify', this.onNotify.bind(this));
	  this._bindings.on('descriptorsDiscover', this.onDescriptorsDiscover.bind(this));
	  this._bindings.on('valueRead', this.onValueRead.bind(this));
	  this._bindings.on('valueWrite', this.onValueWrite.bind(this));
	  this._bindings.on('handleRead', this.onHandleRead.bind(this));
	  this._bindings.on('handleWrite', this.onHandleWrite.bind(this));
	  this._bindings.on('handleNotify', this.onHandleNotify.bind(this));

	  this.on('warning', (function (message) {
	    if (this.listeners('warning').length === 1) {
	      console.warn('noble: ' + message);
	    }
	  }).bind(this));
	}

	util.inherits(Noble, events.EventEmitter);

	Noble.prototype.onStateChange = function (state) {
	  debug('stateChange ' + state);

	  this.state = state;

	  this.emit('stateChange', state);
	};

	Noble.prototype.startScanning = function (serviceUuids, allowDuplicates, callback) {
	  if (this.state !== 'poweredOn') {
	    var error = new Error('Could not start scanning, state is ' + this.state + ' (not poweredOn)');

	    if (typeof callback === 'function') {
	      callback(error);
	    } else {
	      throw error;
	    }
	  } else {
	    if (callback) {
	      this.once('scanStart', callback);
	    }

	    this._discoveredPeripheralUUids = [];
	    this._allowDuplicates = allowDuplicates;

	    this._bindings.startScanning(serviceUuids, allowDuplicates);
	  }
	};

	Noble.prototype.onScanStart = function () {
	  debug('scanStart');
	  this.emit('scanStart');
	};

	Noble.prototype.stopScanning = function (callback) {
	  if (callback) {
	    this.once('scanStop', callback);
	  }
	  this._bindings.stopScanning();
	};

	Noble.prototype.onScanStop = function () {
	  debug('scanStop');
	  this.emit('scanStop');
	};

	Noble.prototype.onDiscover = function (uuid, address, addressType, advertisement, rssi) {
	  var peripheral = this._peripherals[uuid];

	  if (!peripheral) {
	    peripheral = new Peripheral(this, uuid, address, addressType, advertisement, rssi);

	    this._peripherals[uuid] = peripheral;
	    this._services[uuid] = {};
	    this._characteristics[uuid] = {};
	    this._descriptors[uuid] = {};
	  } else {
	    // "or" the advertisment data with existing
	    for (var i in advertisement) {
	      if (advertisement[i] !== undefined) {
	        peripheral.advertisement[i] = advertisement[i];
	      }
	    }

	    peripheral.rssi = rssi;
	  }

	  var previouslyDiscoverd = this._discoveredPeripheralUUids.indexOf(uuid) !== -1;

	  if (!previouslyDiscoverd) {
	    this._discoveredPeripheralUUids.push(uuid);
	  }

	  if (this._allowDuplicates || !previouslyDiscoverd) {
	    this.emit('discover', peripheral);
	  }
	};

	Noble.prototype.connect = function (peripheralUuid) {
	  this._bindings.connect(peripheralUuid);
	};

	Noble.prototype.onConnect = function (peripheralUuid, error) {
	  var peripheral = this._peripherals[peripheralUuid];

	  if (peripheral) {
	    peripheral.state = error ? 'error' : 'connected';
	    peripheral.emit('connect', error);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ' connected!');
	  }
	};

	Noble.prototype.disconnect = function (peripheralUuid) {
	  this._bindings.disconnect(peripheralUuid);
	};

	Noble.prototype.onDisconnect = function (peripheralUuid) {
	  var peripheral = this._peripherals[peripheralUuid];

	  if (peripheral) {
	    peripheral.state = 'disconnected';
	    peripheral.emit('disconnect');
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ' disconnected!');
	  }
	};

	Noble.prototype.updateRssi = function (peripheralUuid) {
	  this._bindings.updateRssi(peripheralUuid);
	};

	Noble.prototype.onRssiUpdate = function (peripheralUuid, rssi) {
	  var peripheral = this._peripherals[peripheralUuid];

	  if (peripheral) {
	    peripheral.rssi = rssi;

	    peripheral.emit('rssiUpdate', rssi);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ' RSSI update!');
	  }
	};

	Noble.prototype.discoverServices = function (peripheralUuid, uuids) {
	  this._bindings.discoverServices(peripheralUuid, uuids);
	};

	Noble.prototype.onServicesDiscover = function (peripheralUuid, serviceUuids) {
	  var peripheral = this._peripherals[peripheralUuid];

	  if (peripheral) {
	    var services = [];

	    for (var i = 0; i < serviceUuids.length; i++) {
	      var serviceUuid = serviceUuids[i];
	      var service = new Service(this, peripheralUuid, serviceUuid);

	      this._services[peripheralUuid][serviceUuid] = service;
	      this._characteristics[peripheralUuid][serviceUuid] = {};
	      this._descriptors[peripheralUuid][serviceUuid] = {};

	      services.push(service);
	    }

	    peripheral.services = services;

	    peripheral.emit('servicesDiscover', services);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ' services discover!');
	  }
	};

	Noble.prototype.discoverIncludedServices = function (peripheralUuid, serviceUuid, serviceUuids) {
	  this._bindings.discoverIncludedServices(peripheralUuid, serviceUuid, serviceUuids);
	};

	Noble.prototype.onIncludedServicesDiscover = function (peripheralUuid, serviceUuid, includedServiceUuids) {
	  var service = this._services[peripheralUuid][serviceUuid];

	  if (service) {
	    service.includedServiceUuids = includedServiceUuids;

	    service.emit('includedServicesDiscover', includedServiceUuids);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ', ' + serviceUuid + ' included services discover!');
	  }
	};

	Noble.prototype.discoverCharacteristics = function (peripheralUuid, serviceUuid, characteristicUuids) {
	  this._bindings.discoverCharacteristics(peripheralUuid, serviceUuid, characteristicUuids);
	};

	Noble.prototype.onCharacteristicsDiscover = function (peripheralUuid, serviceUuid, characteristics) {
	  var service = this._services[peripheralUuid][serviceUuid];

	  if (service) {
	    var characteristics_ = [];

	    for (var i = 0; i < characteristics.length; i++) {
	      var characteristicUuid = characteristics[i].uuid;

	      var characteristic = new Characteristic(this, peripheralUuid, serviceUuid, characteristicUuid, characteristics[i].properties);

	      this._characteristics[peripheralUuid][serviceUuid][characteristicUuid] = characteristic;
	      this._descriptors[peripheralUuid][serviceUuid][characteristicUuid] = {};

	      characteristics_.push(characteristic);
	    }

	    service.characteristics = characteristics_;

	    service.emit('characteristicsDiscover', characteristics_);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ', ' + serviceUuid + ' characteristics discover!');
	  }
	};

	Noble.prototype.read = function (peripheralUuid, serviceUuid, characteristicUuid) {
	  this._bindings.read(peripheralUuid, serviceUuid, characteristicUuid);
	};

	Noble.prototype.onRead = function (peripheralUuid, serviceUuid, characteristicUuid, data, isNotification) {
	  var characteristic = this._characteristics[peripheralUuid][serviceUuid][characteristicUuid];

	  if (characteristic) {
	    characteristic.emit('data', data, isNotification);

	    characteristic.emit('read', data, isNotification); // for backwards compatbility
	  } else {
	      this.emit('warning', 'unknown peripheral ' + peripheralUuid + ', ' + serviceUuid + ', ' + characteristicUuid + ' read!');
	    }
	};

	Noble.prototype.write = function (peripheralUuid, serviceUuid, characteristicUuid, data, withoutResponse) {
	  this._bindings.write(peripheralUuid, serviceUuid, characteristicUuid, data, withoutResponse);
	};

	Noble.prototype.onWrite = function (peripheralUuid, serviceUuid, characteristicUuid) {
	  var characteristic = this._characteristics[peripheralUuid][serviceUuid][characteristicUuid];

	  if (characteristic) {
	    characteristic.emit('write');
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ', ' + serviceUuid + ', ' + characteristicUuid + ' write!');
	  }
	};

	Noble.prototype.broadcast = function (peripheralUuid, serviceUuid, characteristicUuid, broadcast) {
	  this._bindings.broadcast(peripheralUuid, serviceUuid, characteristicUuid, broadcast);
	};

	Noble.prototype.onBroadcast = function (peripheralUuid, serviceUuid, characteristicUuid, state) {
	  var characteristic = this._characteristics[peripheralUuid][serviceUuid][characteristicUuid];

	  if (characteristic) {
	    characteristic.emit('broadcast', state);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ', ' + serviceUuid + ', ' + characteristicUuid + ' broadcast!');
	  }
	};

	Noble.prototype.notify = function (peripheralUuid, serviceUuid, characteristicUuid, notify) {
	  this._bindings.notify(peripheralUuid, serviceUuid, characteristicUuid, notify);
	};

	Noble.prototype.onNotify = function (peripheralUuid, serviceUuid, characteristicUuid, state) {
	  var characteristic = this._characteristics[peripheralUuid][serviceUuid][characteristicUuid];

	  if (characteristic) {
	    characteristic.emit('notify', state);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ', ' + serviceUuid + ', ' + characteristicUuid + ' notify!');
	  }
	};

	Noble.prototype.discoverDescriptors = function (peripheralUuid, serviceUuid, characteristicUuid) {
	  this._bindings.discoverDescriptors(peripheralUuid, serviceUuid, characteristicUuid);
	};

	Noble.prototype.onDescriptorsDiscover = function (peripheralUuid, serviceUuid, characteristicUuid, descriptors) {
	  var characteristic = this._characteristics[peripheralUuid][serviceUuid][characteristicUuid];

	  if (characteristic) {
	    var descriptors_ = [];

	    for (var i = 0; i < descriptors.length; i++) {
	      var descriptorUuid = descriptors[i];

	      var descriptor = new Descriptor(this, peripheralUuid, serviceUuid, characteristicUuid, descriptorUuid);

	      this._descriptors[peripheralUuid][serviceUuid][characteristicUuid][descriptorUuid] = descriptor;

	      descriptors_.push(descriptor);
	    }

	    characteristic.descriptors = descriptors_;

	    characteristic.emit('descriptorsDiscover', descriptors_);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ', ' + serviceUuid + ', ' + characteristicUuid + ' descriptors discover!');
	  }
	};

	Noble.prototype.readValue = function (peripheralUuid, serviceUuid, characteristicUuid, descriptorUuid) {
	  this._bindings.readValue(peripheralUuid, serviceUuid, characteristicUuid, descriptorUuid);
	};

	Noble.prototype.onValueRead = function (peripheralUuid, serviceUuid, characteristicUuid, descriptorUuid, data) {
	  var descriptor = this._descriptors[peripheralUuid][serviceUuid][characteristicUuid][descriptorUuid];

	  if (descriptor) {
	    descriptor.emit('valueRead', data);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ', ' + serviceUuid + ', ' + characteristicUuid + ', ' + descriptorUuid + ' value read!');
	  }
	};

	Noble.prototype.writeValue = function (peripheralUuid, serviceUuid, characteristicUuid, descriptorUuid, data) {
	  this._bindings.writeValue(peripheralUuid, serviceUuid, characteristicUuid, descriptorUuid, data);
	};

	Noble.prototype.onValueWrite = function (peripheralUuid, serviceUuid, characteristicUuid, descriptorUuid) {
	  var descriptor = this._descriptors[peripheralUuid][serviceUuid][characteristicUuid][descriptorUuid];

	  if (descriptor) {
	    descriptor.emit('valueWrite');
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ', ' + serviceUuid + ', ' + characteristicUuid + ', ' + descriptorUuid + ' value write!');
	  }
	};

	Noble.prototype.readHandle = function (peripheralUuid, handle) {
	  this._bindings.readHandle(peripheralUuid, handle);
	};

	Noble.prototype.onHandleRead = function (peripheralUuid, handle, data) {
	  var peripheral = this._peripherals[peripheralUuid];

	  if (peripheral) {
	    peripheral.emit('handleRead' + handle, data);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ' handle read!');
	  }
	};

	Noble.prototype.writeHandle = function (peripheralUuid, handle, data, withoutResponse) {
	  this._bindings.writeHandle(peripheralUuid, handle, data, withoutResponse);
	};

	Noble.prototype.onHandleWrite = function (peripheralUuid, handle) {
	  var peripheral = this._peripherals[peripheralUuid];

	  if (peripheral) {
	    peripheral.emit('handleWrite' + handle);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ' handle write!');
	  }
	};

	Noble.prototype.onHandleNotify = function (peripheralUuid, handle, data) {
	  var peripheral = this._peripherals[peripheralUuid];

	  if (peripheral) {
	    peripheral.emit('handleNotify', handle, data);
	  } else {
	    this.emit('warning', 'unknown peripheral ' + peripheralUuid + ' handle notify!');
	  }
	};

	module.exports = Noble;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(17);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return args;

	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	  return args;
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    r = exports.storage.debug;
	  } catch(e) {}
	  return r;
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(18);

	/**
	 * The currently active debug mode names, and names to skip.
	 */

	exports.names = [];
	exports.skips = [];

	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */

	exports.formatters = {};

	/**
	 * Previously assigned color.
	 */

	var prevColor = 0;

	/**
	 * Previous log timestamp.
	 */

	var prevTime;

	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */

	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}

	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */

	function debug(namespace) {

	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;

	  // define the `enabled` version
	  function enabled() {

	    var self = enabled;

	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;

	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();

	    var args = Array.prototype.slice.call(arguments);

	    args[0] = exports.coerce(args[0]);

	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }

	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);

	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });

	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;

	  var fn = exports.enabled(namespace) ? enabled : disabled;

	  fn.namespace = namespace;

	  return fn;
	}

	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */

	function enable(namespaces) {
	  exports.save(namespaces);

	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;

	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}

	/**
	 * Disable debug output.
	 *
	 * @api public
	 */

	function disable() {
	  exports.enable('');
	}

	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */

	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */

	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 18 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */

	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*jshint loopfunc: true */
	'use strict';

	var debug = __webpack_require__(16)('peripheral');

	var events = __webpack_require__(8);
	var util = __webpack_require__(9);

	function Peripheral(noble, id, address, addressType, advertisement, rssi) {
	  this._noble = noble;

	  this.id = id;
	  this.uuid = id; // for legacy
	  this.address = address;
	  this.addressType = addressType;
	  this.advertisement = advertisement;
	  this.rssi = rssi;
	  this.services = null;
	  this.state = 'disconnected';
	}

	util.inherits(Peripheral, events.EventEmitter);

	Peripheral.prototype.toString = function () {
	  return JSON.stringify({
	    id: this.id,
	    address: this.address,
	    advertisement: this.advertisement,
	    rssi: this.rssi,
	    state: this.state
	  });
	};

	Peripheral.prototype.connect = function (callback) {
	  if (callback) {
	    this.once('connect', function (error) {
	      callback(error);
	    });
	  }

	  if (this.state === 'connected') {
	    this.emit('connect', new Error('Peripheral already connected'));
	  } else {
	    this.state = 'connecting';
	    this._noble.connect(this.id);
	  }
	};

	Peripheral.prototype.disconnect = function (callback) {
	  if (callback) {
	    this.once('disconnect', function () {
	      callback(null);
	    });
	  }
	  this.state = 'disconnecting';
	  this._noble.disconnect(this.id);
	};

	Peripheral.prototype.updateRssi = function (callback) {
	  if (callback) {
	    this.once('rssiUpdate', function (rssi) {
	      callback(null, rssi);
	    });
	  }

	  this._noble.updateRssi(this.id);
	};

	Peripheral.prototype.discoverServices = function (uuids, callback) {
	  if (callback) {
	    this.once('servicesDiscover', function (services) {
	      callback(null, services);
	    });
	  }

	  this._noble.discoverServices(this.id, uuids);
	};

	Peripheral.prototype.discoverSomeServicesAndCharacteristics = function (serviceUuids, characteristicsUuids, callback) {
	  this.discoverServices(serviceUuids, (function (err, services) {
	    var numDiscovered = 0;
	    var allCharacteristics = [];

	    for (var i in services) {
	      var service = services[i];

	      service.discoverCharacteristics(characteristicsUuids, (function (error, characteristics) {
	        numDiscovered++;

	        if (error === null) {
	          for (var j in characteristics) {
	            var characteristic = characteristics[j];

	            allCharacteristics.push(characteristic);
	          }
	        }

	        if (numDiscovered === services.length) {
	          if (callback) {
	            callback(null, services, allCharacteristics);
	          }
	        }
	      }).bind(this));
	    }
	  }).bind(this));
	};

	Peripheral.prototype.discoverAllServicesAndCharacteristics = function (callback) {
	  this.discoverSomeServicesAndCharacteristics([], [], callback);
	};

	Peripheral.prototype.readHandle = function (handle, callback) {
	  if (callback) {
	    this.once('handleRead' + handle, function (data) {
	      callback(null, data);
	    });
	  }

	  this._noble.readHandle(this.id, handle);
	};

	Peripheral.prototype.writeHandle = function (handle, data, withoutResponse, callback) {
	  if (!(data instanceof Buffer)) {
	    throw new Error('data must be a Buffer');
	  }

	  if (callback) {
	    this.once('handleWrite' + handle, function () {
	      callback(null);
	    });
	  }

	  this._noble.writeHandle(this.id, handle, data, withoutResponse);
	};

	module.exports = Peripheral;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var debug = __webpack_require__(16)('service');

	var events = __webpack_require__(8);
	var util = __webpack_require__(9);

	var services = __webpack_require__(21);

	function Service(noble, peripheralId, uuid) {
	  this._noble = noble;
	  this._peripheralId = peripheralId;

	  this.uuid = uuid;
	  this.name = null;
	  this.type = null;
	  this.includedServiceUuids = null;
	  this.characteristics = null;

	  var service = services[uuid];
	  if (service) {
	    this.name = service.name;
	    this.type = service.type;
	  }
	}

	util.inherits(Service, events.EventEmitter);

	Service.prototype.toString = function () {
	  return JSON.stringify({
	    uuid: this.uuid,
	    name: this.name,
	    type: this.type,
	    includedServiceUuids: this.includedServiceUuids
	  });
	};

	Service.prototype.discoverIncludedServices = function (serviceUuids, callback) {
	  if (callback) {
	    this.once('includedServicesDiscover', function (includedServiceUuids) {
	      callback(null, includedServiceUuids);
	    });
	  }

	  this._noble.discoverIncludedServices(this._peripheralId, this.uuid, serviceUuids);
	};

	Service.prototype.discoverCharacteristics = function (characteristicUuids, callback) {
	  if (callback) {
	    this.once('characteristicsDiscover', function (characteristics) {
	      callback(null, characteristics);
	    });
	  }

	  this._noble.discoverCharacteristics(this._peripheralId, this.uuid, characteristicUuids);
	};

	module.exports = Service;

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = {
		"1800": {
			"name": "Generic Access",
			"type": "org.bluetooth.service.generic_access"
		},
		"1801": {
			"name": "Generic Attribute",
			"type": "org.bluetooth.service.generic_attribute"
		},
		"1802": {
			"name": "Immediate Alert",
			"type": "org.bluetooth.service.immediate_alert"
		},
		"1803": {
			"name": "Link Loss",
			"type": "org.bluetooth.service.link_loss"
		},
		"1804": {
			"name": "Tx Power",
			"type": "org.bluetooth.service.tx_power"
		},
		"1805": {
			"name": "Current Time Service",
			"type": "org.bluetooth.service.current_time"
		},
		"1806": {
			"name": "Reference Time Update Service",
			"type": "org.bluetooth.service.reference_time_update"
		},
		"1807": {
			"name": "Next DST Change Service",
			"type": "org.bluetooth.service.next_dst_change"
		},
		"1808": {
			"name": "Glucose",
			"type": "org.bluetooth.service.glucose"
		},
		"1809": {
			"name": "Health Thermometer",
			"type": "org.bluetooth.service.health_thermometer"
		},
		"1810": {
			"name": "Blood Pressure",
			"type": "org.bluetooth.service.blood_pressuer"
		},
		"1811": {
			"name": "Alert Notification Service",
			"type": "org.bluetooth.service.alert_notification"
		},
		"1812": {
			"name": "Human Interface Device",
			"type": "org.bluetooth.service.human_interface_device"
		},
		"1813": {
			"name": "Scan Parameters",
			"type": "org.bluetooth.service.scan_parameters"
		},
		"1814": {
			"name": "Running Speed and Cadence",
			"type": "org.bluetooth.service.running_speed_and_cadence"
		},
		"1815": {
			"name": "Automation IO",
			"type": "org.bluetooth.service.automation_io"
		},
		"1816": {
			"name": "Cycling Speed and Cadence",
			"type": "org.bluetooth.service.cycling_speed_and_cadence"
		},
		"1818": {
			"name": "Cycling Power",
			"type": "org.bluetooth.service.cycling_power"
		},
		"1819": {
			"name": "Location and Navigation",
			"type": "org.bluetooth.service.location_and_navigation"
		},
		"1820": {
			"name": "Internet Protocol Support",
			"type": "org.bluetooth.service.internet_protocol_support"
		},
		"180a": {
			"name": "Device Information",
			"type": "org.bluetooth.service.device_information"
		},
		"180d": {
			"name": "Heart Rate",
			"type": "org.bluetooth.service.heart_rate"
		},
		"180e": {
			"name": "Phone Alert Status Service",
			"type": "org.bluetooth.service.phone_alert_service"
		},
		"180f": {
			"name": "Battery Service",
			"type": "org.bluetooth.service.battery_service"
		},
		"181a": {
			"name": "Environmental Sensing",
			"type": "org.bluetooth.service.environmental_sensing"
		},
		"181b": {
			"name": "Body Composition",
			"type": "org.bluetooth.service.body_composition"
		},
		"181c": {
			"name": "User Data",
			"type": "org.bluetooth.service.user_data"
		},
		"181d": {
			"name": "Weight Scale",
			"type": "org.bluetooth.service.weight_scale"
		},
		"181e": {
			"name": "Bond Management",
			"type": "org.bluetooth.service.bond_management"
		},
		"181f": {
			"name": "Continuous Glucose Monitoring",
			"type": "org.bluetooth.service.continuous_glucose_monitoring"
		}
	}

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, Buffer) {'use strict';

	var debug = __webpack_require__(16)('characteristic');

	var events = __webpack_require__(8);
	var util = __webpack_require__(9);

	var characteristics = __webpack_require__(23);

	function Characteristic(noble, peripheralId, serviceUuid, uuid, properties) {
	  this._noble = noble;
	  this._peripheralId = peripheralId;
	  this._serviceUuid = serviceUuid;

	  this.uuid = uuid;
	  this.name = null;
	  this.type = null;
	  this.properties = properties;
	  this.descriptors = null;

	  var characteristic = characteristics[uuid];
	  if (characteristic) {
	    this.name = characteristic.name;
	    this.type = characteristic.type;
	  }
	}

	util.inherits(Characteristic, events.EventEmitter);

	Characteristic.prototype.toString = function () {
	  return JSON.stringify({
	    uuid: this.uuid,
	    name: this.name,
	    type: this.type,
	    properties: this.properties
	  });
	};

	Characteristic.prototype.read = function (callback) {
	  if (callback) {
	    this.once('read', function (data) {
	      callback(null, data);
	    });
	  }

	  this._noble.read(this._peripheralId, this._serviceUuid, this.uuid);
	};

	Characteristic.prototype.write = function (data, withoutResponse, callback) {
	  if (process.title !== 'browser') {
	    if (!(data instanceof Buffer)) {
	      throw new Error('data must be a Buffer');
	    }
	  }

	  if (callback) {
	    this.once('write', function () {
	      callback(null);
	    });
	  }

	  this._noble.write(this._peripheralId, this._serviceUuid, this.uuid, data, withoutResponse);
	};

	Characteristic.prototype.broadcast = function (broadcast, callback) {
	  if (callback) {
	    this.once('broadcast', function () {
	      callback(null);
	    });
	  }

	  this._noble.broadcast(this._peripheralId, this._serviceUuid, this.uuid, broadcast);
	};

	Characteristic.prototype.notify = function (notify, callback) {
	  if (callback) {
	    this.once('notify', function () {
	      callback(null);
	    });
	  }

	  this._noble.notify(this._peripheralId, this._serviceUuid, this.uuid, notify);
	};

	Characteristic.prototype.discoverDescriptors = function (callback) {
	  if (callback) {
	    this.once('descriptorsDiscover', function (descriptors) {
	      callback(null, descriptors);
	    });
	  }

	  this._noble.discoverDescriptors(this._peripheralId, this._serviceUuid, this.uuid);
	};

	module.exports = Characteristic;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10), __webpack_require__(1).Buffer))

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = {
		"2a00": {
			"name": "Device Name",
			"type": "org.bluetooth.characteristic.gap.device_name"
		},
		"2a01": {
			"name": "Appearance",
			"type": "org.bluetooth.characteristic.gap.appearance"
		},
		"2a02": {
			"name": "Peripheral Privacy Flag",
			"type": "org.bluetooth.characteristic.gap.peripheral_privacy_flag"
		},
		"2a03": {
			"name": "Reconnection Address",
			"type": "org.bluetooth.characteristic.gap.reconnection_address"
		},
		"2a04": {
			"name": "Peripheral Preferred Connection Parameters",
			"type": "org.bluetooth.characteristic.gap.peripheral_preferred_connection_parameters"
		},
		"2a05": {
			"name": "Service Changed",
			"type": "org.bluetooth.characteristic.gatt.service_changed"
		},
		"2a06": {
			"name": "Alert Level",
			"type": "org.bluetooth.characteristic.alert_level"
		},
		"2a07": {
			"name": "Tx Power Level",
			"type": "org.bluetooth.characteristic.tx_power_level"
		},
		"2a08": {
			"name": "Date Time",
			"type": "org.bluetooth.characteristic.date_time"
		},
		"2a09": {
			"name": "Day of Week",
			"type": "org.bluetooth.characteristic.day_of_week"
		},
		"2a0a": {
			"name": "Day Date Time",
			"type": "org.bluetooth.characteristic.day_date_time"
		},
		"2a0c": {
			"name": "Exact Time 256",
			"type": "org.bluetooth.characteristic.exact_time_256"
		},
		"2a0d": {
			"name": "DST Offset",
			"type": "org.bluetooth.characteristic.dst_offset"
		},
		"2a0e": {
			"name": "Time Zone",
			"type": "org.bluetooth.characteristic.time_zone"
		},
		"2a0f": {
			"name": "Local Time Information",
			"type": "org.bluetooth.characteristic.local_time_information"
		},
		"2a11": {
			"name": "Time with DST",
			"type": "org.bluetooth.characteristic.time_with_dst"
		},
		"2a12": {
			"name": "Time Accuracy",
			"type": "org.bluetooth.characteristic.time_accuracy"
		},
		"2a13": {
			"name": "Time Source",
			"type": "org.bluetooth.characteristic.time_source"
		},
		"2a14": {
			"name": "Reference Time Information",
			"type": "org.bluetooth.characteristic.reference_time_information"
		},
		"2a16": {
			"name": "Time Update Control Point",
			"type": "org.bluetooth.characteristic.time_update_control_point"
		},
		"2a17": {
			"name": "Time Update State",
			"type": "org.bluetooth.characteristic.time_update_state"
		},
		"2a18": {
			"name": "Glucose Measurement",
			"type": "org.bluetooth.characteristic.glucose_measurement"
		},
		"2a19": {
			"name": "Battery Level",
			"type": "org.bluetooth.characteristic.battery_level"
		},
		"2a1c": {
			"name": "Temperature Measurement",
			"type": "org.bluetooth.characteristic.temperature_measurement"
		},
		"2a1d": {
			"name": "Temperature Type",
			"type": "org.bluetooth.characteristic.temperature_type"
		},
		"2a1e": {
			"name": "Intermediate Temperature",
			"type": "org.bluetooth.characteristic.intermediate_temperature"
		},
		"2a21": {
			"name": "Measurement Interval",
			"type": "org.bluetooth.characteristic.measurement_interval"
		},
		"2a22": {
			"name": "Boot Keyboard Input Report",
			"type": "org.bluetooth.characteristic.boot_keyboard_input_report"
		},
		"2a23": {
			"name": "System ID",
			"type": "org.bluetooth.characteristic.system_id"
		},
		"2a24": {
			"name": "Model Number String",
			"type": "org.bluetooth.characteristic.model_number_string"
		},
		"2a25": {
			"name": "Serial Number String",
			"type": "org.bluetooth.characteristic.serial_number_string"
		},
		"2a26": {
			"name": "Firmware Revision String",
			"type": "org.bluetooth.characteristic.firmware_revision_string"
		},
		"2a27": {
			"name": "Hardware Revision String",
			"type": "org.bluetooth.characteristic.hardware_revision_string"
		},
		"2a28": {
			"name": "Software Revision String",
			"type": "org.bluetooth.characteristic.software_revision_string"
		},
		"2a29": {
			"name": "Manufacturer Name String",
			"type": "org.bluetooth.characteristic.manufacturer_name_string"
		},
		"2a2a": {
			"name": "IEEE 11073-20601 Regulatory Certification Data List",
			"type": "org.bluetooth.characteristic.ieee_11073-20601_regulatory_certification_data_list"
		},
		"2a2b": {
			"name": "Current Time",
			"type": "org.bluetooth.characteristic.current_time"
		},
		"2a2c": {
			"name": "Magnetic Declination",
			"type": "org.bluetooth.characteristic.magnetic_declination"
		},
		"2a31": {
			"name": "Scan Refresh",
			"type": "org.bluetooth.characteristic.scan_refresh"
		},
		"2a32": {
			"name": "Boot Keyboard Output Report",
			"type": "org.bluetooth.characteristic.boot_keyboard_output_report"
		},
		"2a33": {
			"name": "Boot Mouse Input Report",
			"type": "org.bluetooth.characteristic.boot_mouse_input_report"
		},
		"2a34": {
			"name": "Glucose Measurement Context",
			"type": "org.bluetooth.characteristic.glucose_measurement_context"
		},
		"2a35": {
			"name": "Blood Pressure Measurement",
			"type": "org.bluetooth.characteristic.blood_pressure_measurement"
		},
		"2a36": {
			"name": "Intermediate Cuff Pressure",
			"type": "org.bluetooth.characteristic.intermediate_blood_pressure"
		},
		"2a37": {
			"name": "Heart Rate Measurement",
			"type": "org.bluetooth.characteristic.heart_rate_measurement"
		},
		"2a38": {
			"name": "Body Sensor Location",
			"type": "org.bluetooth.characteristic.body_sensor_location"
		},
		"2a39": {
			"name": "Heart Rate Control Point",
			"type": "org.bluetooth.characteristic.heart_rate_control_point"
		},
		"2a3f": {
			"name": "Alert Status",
			"type": "org.bluetooth.characteristic.alert_status"
		},
		"2a40": {
			"name": "Ringer Control Point",
			"type": "org.bluetooth.characteristic.ringer_control_point"
		},
		"2a41": {
			"name": "Ringer Setting",
			"type": "org.bluetooth.characteristic.ringer_setting"
		},
		"2a42": {
			"name": "Alert Category ID Bit Mask",
			"type": "org.bluetooth.characteristic.alert_category_id_bit_mask"
		},
		"2a43": {
			"name": "Alert Category ID",
			"type": "org.bluetooth.characteristic.alert_category_id"
		},
		"2a44": {
			"name": "Alert Notification Control Point",
			"type": "org.bluetooth.characteristic.alert_notification_control_point"
		},
		"2a45": {
			"name": "Unread Alert Status",
			"type": "org.bluetooth.characteristic.unread_alert_status"
		},
		"2a46": {
			"name": "New Alert",
			"type": "org.bluetooth.characteristic.new_alert"
		},
		"2a47": {
			"name": "Supported New Alert Category",
			"type": "org.bluetooth.characteristic.supported_new_alert_category"
		},
		"2a48": {
			"name": "Supported Unread Alert Category",
			"type": "org.bluetooth.characteristic.supported_unread_alert_category"
		},
		"2a49": {
			"name": "Blood Pressure Feature",
			"type": "org.bluetooth.characteristic.blood_pressure_feature"
		},
		"2a4a": {
			"name": "HID Information",
			"type": "org.bluetooth.characteristic.hid_information"
		},
		"2a4b": {
			"name": "Report Map",
			"type": "org.bluetooth.characteristic.report_map"
		},
		"2a4c": {
			"name": "HID Control Point",
			"type": "org.bluetooth.characteristic.hid_control_point"
		},
		"2a4d": {
			"name": "Report",
			"type": "org.bluetooth.characteristic.report"
		},
		"2a4e": {
			"name": "Protocol Mode",
			"type": "org.bluetooth.characteristic.protocol_mode"
		},
		"2a4f": {
			"name": "Scan Interval Window",
			"type": "org.bluetooth.characteristic.scan_interval_window"
		},
		"2a50": {
			"name": "PnP ID",
			"type": "org.bluetooth.characteristic.pnp_id"
		},
		"2a51": {
			"name": "Glucose Feature",
			"type": "org.bluetooth.characteristic.glucose_feature"
		},
		"2a52": {
			"name": "Record Access Control Point",
			"type": "org.bluetooth.characteristic.record_access_control_point"
		},
		"2a53": {
			"name": "RSC Measurement",
			"type": "org.bluetooth.characteristic.rsc_measurement"
		},
		"2a54": {
			"name": "RSC Feature",
			"type": "org.bluetooth.characteristic.rsc_feature"
		},
		"2a55": {
			"name": "SC Control Point",
			"type": "org.bluetooth.characteristic.sc_control_point"
		},
		"2a56": {
			"name": "Digital",
			"type": "org.bluetooth.characteristic.digital"
		},
		"2a58": {
			"name": "Analog",
			"type": "org.bluetooth.characteristic.analog"
		},
		"2a5a": {
			"name": "Aggregate",
			"type": "org.bluetooth.characteristic.aggregate"
		},
		"2a5b": {
			"name": "CSC Measurement",
			"type": "org.bluetooth.characteristic.csc_measurement"
		},
		"2a5c": {
			"name": "CSC Feature",
			"type": "org.bluetooth.characteristic.csc_feature"
		},
		"2a5d": {
			"name": "Sensor Location",
			"type": "org.bluetooth.characteristic.sensor_location"
		},
		"2a63": {
			"name": "Cycling Power Measurement",
			"type": "org.bluetooth.characteristic.cycling_power_measurement"
		},
		"2a64": {
			"name": "Cycling Power Vector",
			"type": "org.bluetooth.characteristic.cycling_power_vector"
		},
		"2a65": {
			"name": "Cycling Power Feature",
			"type": "org.bluetooth.characteristic.cycling_power_feature"
		},
		"2a66": {
			"name": "Cycling Power Control Point",
			"type": "org.bluetooth.characteristic.cycling_power_control_point"
		},
		"2a67": {
			"name": "Location and Speed",
			"type": "org.bluetooth.characteristic.location_and_speed"
		},
		"2a68": {
			"name": "Navigation",
			"type": "org.bluetooth.characteristic.navigation"
		},
		"2a69": {
			"name": "Position Quality",
			"type": "org.bluetooth.characteristic.position_quality"
		},
		"2a6a": {
			"name": "LN Feature",
			"type": "org.bluetooth.characteristic.ln_feature"
		},
		"2a6b": {
			"name": "LN Control Point",
			"type": "org.bluetooth.characteristic.ln_control_point"
		},
		"2a6c": {
			"name": "Elevation",
			"type": "org.bluetooth.characteristic.elevation"
		},
		"2a6d": {
			"name": "Pressure",
			"type": "org.bluetooth.characteristic.pressure"
		},
		"2a6e": {
			"name": "Temperature",
			"type": "org.bluetooth.characteristic.temperature"
		},
		"2a6f": {
			"name": "Humidity",
			"type": "org.bluetooth.characteristic.humidity"
		},
		"2a70": {
			"name": "True Wind Speed",
			"type": "org.bluetooth.characteristic.true_wind_speed"
		},
		"2a71": {
			"name": "True Wind Direction",
			"type": "org.bluetooth.characteristic.true_wind_direction"
		},
		"2a72": {
			"name": "Apparent Wind Speed",
			"type": "org.bluetooth.characteristic.apparent_wind_speed"
		},
		"2a73": {
			"name": "Apparent Wind Direction",
			"type": "org.bluetooth.characteristic.apparent_wind_direction"
		},
		"2a74": {
			"name": "Gust Factor",
			"type": "org.bluetooth.characteristic.gust_factor"
		},
		"2a75": {
			"name": "Pollen Concentration",
			"type": "org.bluetooth.characteristic.pollen_concentration"
		},
		"2a76": {
			"name": "UV Index",
			"type": "org.bluetooth.characteristic.uv_index"
		},
		"2a77": {
			"name": "Irradiance",
			"type": "org.bluetooth.characteristic.irradiance"
		},
		"2a78": {
			"name": "Rainfall",
			"type": "org.bluetooth.characteristic.rainfall"
		},
		"2a79": {
			"name": "Wind Chill",
			"type": "org.bluetooth.characteristic.wind_chill"
		},
		"2a7a": {
			"name": "Heat Index",
			"type": "org.bluetooth.characteristic.heat_index"
		},
		"2a7b": {
			"name": "Dew Point",
			"type": "org.bluetooth.characteristic.dew_point"
		},
		"2a7d": {
			"name": "Descriptor Value Changed",
			"type": "org.bluetooth.characteristic.descriptor_value_change"
		},
		"2a7e": {
			"name": "Aerobic Heart Rate Lower Limit",
			"type": "org.bluetooth.characteristic.aerobic_heart_rate_lower_limit"
		},
		"2a7f": {
			"name": "Aerobic Threshold",
			"type": "org.bluetooth.characteristic.aerobic_threshold"
		},
		"2a80": {
			"name": "Age",
			"type": "org.bluetooth.characteristic.age"
		},
		"2a81": {
			"name": "Anaerobic Heart Rate Lower Limit",
			"type": "org.bluetooth.characteristic.anaerobic_heart_rate_lower_limit"
		},
		"2a82": {
			"name": "Anaerobic Heart Rate Upper Limit",
			"type": "org.bluetooth.characteristic.anaerobic_heart_rate_upper_limit"
		},
		"2a83": {
			"name": "Anaerobic Threshold",
			"type": "org.bluetooth.characteristic.anaerobic_threshold"
		},
		"2a84": {
			"name": "Aerobic Heart Rate Upper Limit",
			"type": "org.bluetooth.characteristic.aerobic_heart_rate_upper_limit"
		},
		"2a85": {
			"name": "Date of Birth",
			"type": "org.bluetooth.characteristic.date_of_birth"
		},
		"2a86": {
			"name": "Date of Threshold Assessment",
			"type": "org.bluetooth.characteristic.date_of_threshold_assessment"
		},
		"2a87": {
			"name": "Email Address",
			"type": "org.bluetooth.characteristic.email_address"
		},
		"2a88": {
			"name": "Fat Burn Heart Rate Lower Limit",
			"type": "org.bluetooth.characteristic.fat_burn_heart_lower_limit"
		},
		"2a89": {
			"name": "Fat Burn Heart Rate Upper Limit",
			"type": "org.bluetooth.characteristic.fat_burn_heart_upper_limit"
		},
		"2a8a": {
			"name": "First Name",
			"type": "org.bluetooth.characteristic.first_name"
		},
		"2a8b": {
			"name": "Five Zone Heart Rate Limits",
			"type": "org.bluetooth.characteristic.five_zone_heart_rate_limits"
		},
		"2a8c": {
			"name": "Gender",
			"type": "org.bluetooth.characteristic.gender"
		},
		"2a8d": {
			"name": "Heart Rate Max",
			"type": "org.bluetooth.characteristic.heart_rate_max"
		},
		"2a8e": {
			"name": "Height",
			"type": "org.bluetooth.characteristic.height"
		},
		"2a8f": {
			"name": "Hip Circumference",
			"type": "org.bluetooth.characteristic.hip_circumference"
		},
		"2a90": {
			"name": "Last Name",
			"type": "org.bluetooth.characteristic.last_name"
		},
		"2a91": {
			"name": "Maximum Recommended Heart Rate",
			"type": "org.bluetooth.characteristic.maximum_recommended_heart_rate"
		},
		"2a92": {
			"name": "Resting Heart Rate",
			"type": "org.bluetooth.characteristic.resting_heart_rate"
		},
		"2a93": {
			"name": "Sport Type for Aerobic and Anaerobic Threshold",
			"type": "org.bluetooth.characteristic.sport_type_for_aerobic_and_anaerobic_threshold"
		},
		"2a94": {
			"name": "Three Zone Heart Rate Limits",
			"type": "org.bluetooth.characteristic.three_zone_heart_rate_limits"
		},
		"2a95": {
			"name": "Two Zone Heart Rate Limit",
			"type": "org.bluetooth.characteristic.two_zone_heart_rate_limit"
		},
		"2a96": {
			"name": "VO2 Max",
			"type": "org.bluetooth.characteristic.vo2_max"
		},
		"2a97": {
			"name": "Waist Circumference",
			"type": "org.bluetooth.characteristic.waist_circumference"
		},
		"2a98": {
			"name": "Weight",
			"type": "org.bluetooth.characteristic.weight"
		},
		"2a99": {
			"name": "Database Change Increment",
			"type": "org.bluetooth.characteristic.database_change_increment"
		},
		"2a9a": {
			"name": "User Index",
			"type": "org.bluetooth.characteristic.user_index"
		},
		"2a9b": {
			"name": "Body Composition Feature",
			"type": "org.bluetooth.characteristic.body_composition_feature"
		},
		"2a9c": {
			"name": "Body Composition Measurement",
			"type": "org.bluetooth.characteristic.body_composition_measurement"
		},
		"2a9d": {
			"name": "Weight Measurement",
			"type": "org.bluetooth.characteristic.weight_measurement"
		},
		"2a9e": {
			"name": "Weight Scale Feature",
			"type": "org.bluetooth.characteristic.weight_scale_feature"
		},
		"2a9f": {
			"name": "User Control Point",
			"type": "org.bluetooth.characteristic.user_control_point"
		},
		"2aa0": {
			"name": "Magnetic Flux Density - 2D",
			"type": "org.bluetooth.characteristic.magnetic_flux_density_2d"
		},
		"2aa1": {
			"name": "Magnetic Flux Density - 3D",
			"type": "org.bluetooth.characteristic.magnetic_flux_density_3d"
		},
		"2aa2": {
			"name": "Language",
			"type": "org.bluetooth.characteristic.language"
		},
		"2aa3": {
			"name": "Barometric Pressure Trend",
			"type": "org.bluetooth.characteristic.barometric_pressure_trend"
		},
		"2aa4": {
			"name": "Bond Management Control Point",
			"type": "org.bluetooth.characteristic.bond_management_control_point"
		},
		"2aa5": {
			"name": "Bond Management Feature",
			"type": "org.bluetooth.characteristic.bond_management_feature"
		},
		"2aa6": {
			"name": "Central Address Resolution",
			"type": "org.bluetooth.characteristic.central_address_resolution"
		},
		"2aa7": {
			"name": "CGM Measurement",
			"type": "org.bluetooth.characteristic.cgm_measurement"
		},
		"2aa8": {
			"name": "CGM Feature",
			"type": "org.bluetooth.characteristic.cgm_feature"
		},
		"2aa9": {
			"name": "CGM Status",
			"type": "org.bluetooth.characteristic.cgm_status"
		},
		"2aaa": {
			"name": "CGM Session Start Time",
			"type": "org.bluetooth.characteristic.cgm_session_start_time"
		},
		"2aab": {
			"name": "CGM Session Run Time",
			"type": "org.bluetooth.characteristic.cgm_session_run_time"
		},
		"2aac": {
			"name": "CGM Specific Ops Control Point",
			"type": "org.bluetooth.characteristic.cgm_specific_ops_control_point"
		}
	}

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {'use strict';

	var debug = __webpack_require__(16)('descriptor');

	var events = __webpack_require__(8);
	var util = __webpack_require__(9);

	var descriptors = __webpack_require__(25);

	function Descriptor(noble, peripheralId, serviceUuid, characteristicUuid, uuid) {
	  this._noble = noble;
	  this._peripheralId = peripheralId;
	  this._serviceUuid = serviceUuid;
	  this._characteristicUuid = characteristicUuid;

	  this.uuid = uuid;
	  this.name = null;
	  this.type = null;

	  var descriptor = descriptors[uuid];
	  if (descriptor) {
	    this.name = descriptor.name;
	    this.type = descriptor.type;
	  }
	}

	util.inherits(Descriptor, events.EventEmitter);

	Descriptor.prototype.toString = function () {
	  return JSON.stringify({
	    uuid: this.uuid,
	    name: this.name,
	    type: this.type
	  });
	};

	Descriptor.prototype.readValue = function (callback) {
	  if (callback) {
	    this.once('valueRead', function (data) {
	      callback(null, data);
	    });
	  }
	  this._noble.readValue(this._peripheralId, this._serviceUuid, this._characteristicUuid, this.uuid);
	};

	Descriptor.prototype.writeValue = function (data, callback) {
	  if (!(data instanceof Buffer)) {
	    throw new Error('data must be a Buffer');
	  }

	  if (callback) {
	    this.once('valueWrite', function () {
	      callback(null);
	    });
	  }
	  this._noble.writeValue(this._peripheralId, this._serviceUuid, this._characteristicUuid, this.uuid, data);
	};

	module.exports = Descriptor;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = {
		"2900": {
			"name": "Characteristic Extended Properties",
			"type": "org.bluetooth.descriptor.gatt.characteristic_extended_properties"
		},
		"2901": {
			"name": "Characteristic User Description",
			"type": "org.bluetooth.descriptor.gatt.characteristic_user_description"
		},
		"2902": {
			"name": "Client Characteristic Configuration",
			"type": "org.bluetooth.descriptor.gatt.client_characteristic_configuration"
		},
		"2903": {
			"name": "Server Characteristic Configuration",
			"type": "org.bluetooth.descriptor.gatt.server_characteristic_configuration"
		},
		"2904": {
			"name": "Characteristic Presentation Format",
			"type": "org.bluetooth.descriptor.gatt.characteristic_presentation_format"
		},
		"2905": {
			"name": "Characteristic Aggregate Format",
			"type": "org.bluetooth.descriptor.gatt.characteristic_aggregate_format"
		},
		"2906": {
			"name": "Valid Range",
			"type": "org.bluetooth.descriptor.valid_range"
		},
		"2907": {
			"name": "External Report Reference",
			"type": "org.bluetooth.descriptor.external_report_reference"
		},
		"2908": {
			"name": "Report Reference",
			"type": "org.bluetooth.descriptor.report_reference"
		},
		"2909": {
			"name": "Number of Digitals",
			"type": "org.bluetooth.descriptor.number_of_digitals"
		},
		"290a": {
			"name": "Value Trigger Setting",
			"type": "org.bluetooth.descriptor.value_trigger_setting"
		},
		"290b": {
			"name": "Environmental Sensing Configuration",
			"type": "org.bluetooth.descriptor.environmental_sensing_configuration"
		},
		"290c": {
			"name": "Environmental Sensing Measurement",
			"type": "org.bluetooth.descriptor.environmental_sensing_measurement"
		},
		"290d": {
			"name": "Environmental Sensing Trigger Setting",
			"type": "org.bluetooth.descriptor.environmental_sensing_trigger_setting"
		},
		"290e": {
			"name": "Time Trigger Setting",
			"type": "org.bluetooth.descriptor.time_trigger_setting"
		}
	}

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function resolveBindings() {
	  if (navigator.bluetooth) {
	    return __webpack_require__(27);
	  }

	  return __webpack_require__(28);
	}

	module.exports = resolveBindings;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var events = __webpack_require__(8);
	var util = __webpack_require__(9);

	var debug = __webpack_require__(16)('bindings');

	var ble = navigator.bluetooth;

	//temporary data until web api is finished:
	var BEAN_SERVICES = ['f000ffc004514000b000000000000000', '1800', '1801', '180a', 'a495ff10c5b14b44b5121370f02d74de', 'a495ff20c5b14b44b5121370f02d74de', '180f'];

	var BEAN_CHARACTERISTICS = {
	  "1800": [{ properties: ['read'], uuid: '2a00' }, { properties: ['read'], uuid: '2a01' }, { properties: ['read', 'write'], uuid: '2a02' }, { properties: ['write'], uuid: '2a03' }, { properties: ['read'], uuid: '2a04' }],
	  "1801": [{ properties: ['indicate'], uuid: '2a05' }],
	  "a495ff10c5b14b44b5121370f02d74de": [{ properties: ['read', 'writeWithoutResponse', 'write', 'notify'],
	    uuid: 'a495ff11c5b14b44b5121370f02d74de' }],
	  "180f": [{ properties: ['read', 'notify'], uuid: '2a19' }],
	  "f000ffc004514000b000000000000000": [{ properties: ['writeWithoutResponse', 'write', 'notify'],
	    uuid: 'f000ffc104514000b000000000000000' }, { properties: ['writeWithoutResponse', 'write', 'notify'],
	    uuid: 'f000ffc204514000b000000000000000' }],
	  "180a": [{ properties: ['read'], uuid: '2a23' }, { properties: ['read'], uuid: '2a24' }, { properties: ['read'], uuid: '2a25' }, { properties: ['read'], uuid: '2a26' }, { properties: ['read'], uuid: '2a27' }, { properties: ['read'], uuid: '2a28' }, { properties: ['read'], uuid: '2a29' }, { properties: ['read'], uuid: '2a2a' }, { properties: ['read'], uuid: '2a50' }],
	  "a495ff20c5b14b44b5121370f02d74de": [{ properties: ['read', 'write'],
	    uuid: 'a495ff21c5b14b44b5121370f02d74de' }, { properties: ['read', 'write'],
	    uuid: 'a495ff22c5b14b44b5121370f02d74de' }, { properties: ['read', 'write'],
	    uuid: 'a495ff23c5b14b44b5121370f02d74de' }, { properties: ['read', 'write'],
	    uuid: 'a495ff24c5b14b44b5121370f02d74de' }, { properties: ['read', 'write'],
	    uuid: 'a495ff25c5b14b44b5121370f02d74de' }]
	};

	function addDashes(uuid) {
	  if (uuid && uuid.length === 32) {
	    uuid = uuid.substring(0, 8) + '-' + uuid.substring(8, 12) + '-' + uuid.substring(12, 16) + '-' + uuid.substring(16, 20) + '-' + uuid.substring(20);
	  }
	  return uuid;
	}

	function stripDashes(uuid) {
	  if (uuid) {
	    uuid = uuid.split('-').join('');
	  }
	  return uuid;
	}

	var NobleBindings = function NobleBindings() {

	  this._startScanCommand = null;
	  this._peripherals = {};

	  var self = this;

	  setTimeout(function () {
	    self.emit('stateChange', 'poweredOn');
	  }, 50); //maybe just a next tick?
	};

	util.inherits(NobleBindings, events.EventEmitter);

	NobleBindings.prototype._onOpen = function () {
	  console.log('on -> open');
	};

	NobleBindings.prototype._onClose = function () {
	  console.log('on -> close');

	  this.emit('stateChange', 'poweredOff');
	};

	NobleBindings.prototype.startScanning = function (serviceUuids, allowDuplicates) {
	  var self = this;
	  console.log('startScanning', serviceUuids, allowDuplicates);

	  if (!Array.isArray(serviceUuids)) {
	    serviceUuids = [serviceUuids];
	  }

	  ble.requestDevice({ filters: [{ services: serviceUuids.map(addDashes) }] }).then(function (device) {
	    console.log('scan finished', device);
	    if (device) {

	      var address = device.instanceID;
	      var rssi;
	      //TODO use device.adData when api is ready
	      //rssi = device.adData.rssi;

	      self._peripherals[address] = {
	        uuid: address,
	        address: address,
	        advertisement: {}, //advertisement,
	        rssi: rssi,
	        device: device,
	        cachedServices: {}
	      };

	      self.emit('discover', device.instanceID, { localName: device.name, serviceUuids: serviceUuids }, device.rssi);
	    }
	  }, function (err) {
	    console.log('err scanning', err);
	  });

	  this.emit('scanStart');
	};

	NobleBindings.prototype.stopScanning = function () {
	  this._startScanCommand = null;

	  //TODO: need web api completed for this to work'=
	  this.emit('scanStop');
	};

	NobleBindings.prototype.connect = function (deviceUuid) {
	  var self = this;
	  console.log('connect', deviceUuid);
	  var peripheral = this._peripherals[deviceUuid];

	  // Attempts to connect to remote GATT Server.
	  peripheral.device.connectGATT().then(function (gattServer) {
	    peripheral.gattServer = gattServer;
	    console.log('peripheral connected', gattServer);
	    self.emit('connect', deviceUuid);
	  }, function (err) {
	    console.log('err connecting', err);
	  });
	};

	NobleBindings.prototype.disconnect = function (deviceUuid) {
	  var peripheral = this._peripherals[deviceUuid];
	  if (peripheral.gattServer) {
	    peripheral.gattServer.disconnect();
	    this.emit('disconnect', deviceUuid);
	  }
	};

	NobleBindings.prototype.updateRssi = function (deviceUuid) {
	  var peripheral = this._peripherals[deviceUuid];

	  //TODO: need web api completed for this to work
	  this.emit('rssiUpdate', deviceUuid, rssi);
	};

	NobleBindings.prototype.discoverServices = function (deviceUuid, uuids) {
	  var peripheral = this._peripherals[deviceUuid];

	  //TODO: need web api completed for this to work
	  if (peripheral) {
	    this.emit('servicesDiscover', deviceUuid, BEAN_SERVICES);
	  }
	};

	NobleBindings.prototype.discoverIncludedServices = function (deviceUuid, serviceUuid, serviceUuids) {
	  var peripheral = this._peripherals[deviceUuid];

	  //TODO impelment when web API has functionatility then emit response
	  //this.emit('includedServicesDiscover', deviceUuid, serviceUuid, includedServiceUuids);
	};

	NobleBindings.prototype.discoverCharacteristics = function (deviceUuid, serviceUuid, characteristicUuids) {
	  var peripheral = this._peripherals[deviceUuid];

	  //TODO need a web api to do this
	  if (peripheral) {
	    this.emit('characteristicsDiscover', deviceUuid, serviceUuid, BEAN_CHARACTERISTICS[serviceUuid] || []);
	  }
	};

	NobleBindings.prototype._getPrimaryService = function (peripheral, serviceUuid) {
	  serviceUuid = addDashes(serviceUuid);

	  if (peripheral.cachedServices[serviceUuid]) {
	    return new Promise(function (resolve, reject) {
	      resolve(peripheral.cachedServices[serviceUuid]);
	    });
	  }

	  return peripheral.gattServer.getPrimaryService(serviceUuid).then(function (service) {
	    peripheral.cachedServices[serviceUuid] = service;
	    return service;
	  });
	};

	NobleBindings.prototype.read = function (deviceUuid, serviceUuid, characteristicUuid) {
	  var self = this;
	  var peripheral = this._peripherals[deviceUuid];
	  console.log('read', deviceUuid, serviceUuid, characteristicUuid);

	  self._getPrimaryService(peripheral, serviceUuid).then(function (service) {
	    return service.getCharacteristic(addDashes(characteristicUuid));
	  }).then(function (characteristic) {
	    return characteristic.readValue();
	  }).then(function (data) {
	    console.log('value written');
	    self.emit('write', peripheral.uuid, serviceUuid, characteristicUuid);
	  })['catch'](function (err) {
	    console.log('error writing to characteristc', err);
	  });
	};

	NobleBindings.prototype.write = function (deviceUuid, serviceUuid, characteristicUuid, data, withoutResponse) {
	  var self = this;
	  var peripheral = this._peripherals[deviceUuid];
	  console.log('write', deviceUuid, serviceUuid, characteristicUuid, data, withoutResponse);

	  self._getPrimaryService(peripheral, serviceUuid).then(function (service) {
	    return service.getCharacteristic(addDashes(characteristicUuid));
	  }).then(function (characteristic) {
	    return characteristic.writeValue(data);
	  }).then(function () {
	    console.log('value written');
	    self.emit('write', peripheral.uuid, serviceUuid, characteristicUuid);
	  })['catch'](function (err) {
	    console.log('error writing to characteristc', err);
	  });
	};

	NobleBindings.prototype.broadcast = function (deviceUuid, serviceUuid, characteristicUuid, broadcast) {
	  var peripheral = this._peripherals[deviceUuid];

	  //TODO impelment when web API has functionatility then emit response
	  //this.emit('broadcast', deviceUuid, serviceUuid, characteristicUuid, state);
	};

	NobleBindings.prototype.notify = function (deviceUuid, serviceUuid, characteristicUuid, notify) {
	  var peripheral = this._peripherals[deviceUuid];

	  console.log('notify not yet implemented', serviceUuid, characteristicUuid, notify);

	  //TODO impelment when web API has functionatility then emit response
	  this.emit('notify', deviceUuid, serviceUuid, characteristicUuid, true);
	};

	NobleBindings.prototype.discoverDescriptors = function (deviceUuid, serviceUuid, characteristicUuid) {
	  var peripheral = this._peripherals[deviceUuid];

	  //TODO impelment when web API has functionatility then emit response
	  //this.emit('descriptorsDiscover', deviceUuid, serviceUuid, characteristicUuid, descriptors);
	};

	NobleBindings.prototype.readValue = function (deviceUuid, serviceUuid, characteristicUuid, descriptorUuid) {
	  var peripheral = this._peripherals[deviceUuid];

	  //TODO impelment when web API has functionatility then emit response
	  //this.emit('valueRead', deviceUuid, serviceUuid, characteristicUuid, descriptorUuid, data);
	};

	NobleBindings.prototype.writeValue = function (deviceUuid, serviceUuid, characteristicUuid, descriptorUuid, data) {
	  var peripheral = this._peripherals[deviceUuid];

	  //TODO impelment when web API has functionatility then emit response
	  //this.emit('valueWrite', deviceUuid, serviceUuid, characteristicUuid, descriptorUuid);
	};

	NobleBindings.prototype.readHandle = function (deviceUuid, handle) {
	  var peripheral = this._peripherals[deviceUuid];

	  //TODO impelment when web API has functionatility then emit response
	  //this.emit('handleRead', deviceUuid, handle, data);
	};

	NobleBindings.prototype.writeHandle = function (deviceUuid, handle, data, withoutResponse) {
	  var peripheral = this._peripherals[deviceUuid];

	  //TODO impelment when web API has functionatility then emit response
	  //this.emit('handleWrite', deviceUuid, handle);
	};

	var nobleBindings = new NobleBindings();

	module.exports = nobleBindings;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, Buffer) {'use strict';

	var events = __webpack_require__(8);
	var util = __webpack_require__(9);

	var debug = __webpack_require__(16)('bindings');
	var WebSocket = __webpack_require__(29);

	var NobleBindings = function NobleBindings() {
	  var port = 0xB1e;
	  this._ws = new WebSocket('ws://localhost:' + port);

	  this._startScanCommand = null;
	  this._peripherals = {};

	  this.on('message', this._onMessage.bind(this));

	  if (!this._ws.on) {
	    this._ws.on = this._ws.addEventListener;
	  }

	  this._ws.on('open', this._onOpen.bind(this));
	  this._ws.on('close', this._onClose.bind(this));

	  var _this = this;
	  this._ws.on('message', function (event) {
	    var data = process.title === 'browser' ? event.data : event;

	    _this.emit('message', JSON.parse(data));
	  });
	};

	util.inherits(NobleBindings, events.EventEmitter);

	NobleBindings.prototype._onOpen = function () {
	  console.log('on -> open');
	};

	NobleBindings.prototype._onClose = function () {
	  console.log('on -> close');

	  this.emit('stateChange', 'poweredOff');
	};

	NobleBindings.prototype._onMessage = function (event) {
	  var type = event.type;
	  var peripheralUuid = event.peripheralUuid;
	  var address = event.address;
	  var addressType = event.addressType;
	  var advertisement = event.advertisement;
	  var rssi = event.rssi;
	  var serviceUuids = event.serviceUuids;
	  var serviceUuid = event.serviceUuid;
	  var includedServiceUuids = event.includedServiceUuids;
	  var characteristics = event.characteristics;
	  var characteristicUuid = event.characteristicUuid;
	  var data = event.data ? new Buffer(event.data, 'hex') : null;
	  var isNotification = event.isNotification;
	  var state = event.state;
	  var descriptors = event.descriptors;
	  var descriptorUuid = event.descriptorUuid;
	  var handle = event.handle;

	  if (type === 'stateChange') {
	    console.log(state);
	    this.emit('stateChange', state);
	  } else if (type === 'discover') {
	    advertisement = {
	      localName: advertisement.localName,
	      txPowerLevel: advertisement.txPowerLevel,
	      serviceUuids: advertisement.serviceUuids,
	      manufacturerData: advertisement.manufacturerData ? new Buffer(advertisement.manufacturerData, 'hex') : null,
	      serviceData: advertisement.serviceData ? new Buffer(advertisement.serviceData, 'hex') : null
	    };

	    this._peripherals[peripheralUuid] = {
	      uuid: peripheralUuid,
	      address: address,
	      advertisement: advertisement,
	      rssi: rssi
	    };

	    this.emit('discover', peripheralUuid, address, addressType, advertisement, rssi);
	  } else if (type === 'connect') {
	    this.emit('connect', peripheralUuid);
	  } else if (type === 'disconnect') {
	    this.emit('disconnect', peripheralUuid);
	  } else if (type === 'rssiUpdate') {
	    this.emit('rssiUpdate', peripheralUuid, rssi);
	  } else if (type === 'servicesDiscover') {
	    this.emit('servicesDiscover', peripheralUuid, serviceUuids);
	  } else if (type === 'includedServicesDiscover') {
	    this.emit('includedServicesDiscover', peripheralUuid, serviceUuid, includedServiceUuids);
	  } else if (type === 'characteristicsDiscover') {
	    this.emit('characteristicsDiscover', peripheralUuid, serviceUuid, characteristics);
	  } else if (type === 'read') {
	    this.emit('read', peripheralUuid, serviceUuid, characteristicUuid, data, isNotification);
	  } else if (type === 'write') {
	    this.emit('write', peripheralUuid, serviceUuid, characteristicUuid);
	  } else if (type === 'broadcast') {
	    this.emit('broadcast', peripheralUuid, serviceUuid, characteristicUuid, state);
	  } else if (type === 'notify') {
	    this.emit('notify', peripheralUuid, serviceUuid, characteristicUuid, state);
	  } else if (type === 'descriptorsDiscover') {
	    this.emit('descriptorsDiscover', peripheralUuid, serviceUuid, characteristicUuid, descriptors);
	  } else if (type === 'valueRead') {
	    this.emit('valueRead', peripheralUuid, serviceUuid, characteristicUuid, descriptorUuid, data);
	  } else if (type === 'valueWrite') {
	    this.emit('valueWrite', peripheralUuid, serviceUuid, characteristicUuid, descriptorUuid);
	  } else if (type === 'handleRead') {
	    this.emit('handleRead', peripheralUuid, handle, data);
	  } else if (type === 'handleWrite') {
	    this.emit('handleWrite', peripheralUuid, handle);
	  } else if (type === 'handleNotify') {
	    this.emit('handleNotify', peripheralUuid, handle, data);
	  }
	};

	NobleBindings.prototype._sendCommand = function (command) {
	  var message = JSON.stringify(command);

	  this._ws.send(message);
	};

	NobleBindings.prototype.startScanning = function (serviceUuids, allowDuplicates) {
	  this._startScanCommand = {
	    action: 'startScanning',
	    serviceUuids: serviceUuids,
	    allowDuplicates: allowDuplicates
	  };
	  this._sendCommand(this._startScanCommand);

	  this.emit('scanStart');
	};

	NobleBindings.prototype.stopScanning = function () {
	  this._startScanCommand = null;

	  this._sendCommand({
	    action: 'stopScanning'
	  });

	  this.emit('scanStop');
	};

	NobleBindings.prototype.connect = function (deviceUuid) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'connect',
	    peripheralUuid: peripheral.uuid
	  });
	};

	NobleBindings.prototype.disconnect = function (deviceUuid) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'disconnect',
	    peripheralUuid: peripheral.uuid
	  });
	};

	NobleBindings.prototype.updateRssi = function (deviceUuid) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'updateRssi',
	    peripheralUuid: peripheral.uuid
	  });
	};

	NobleBindings.prototype.discoverServices = function (deviceUuid, uuids) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'discoverServices',
	    peripheralUuid: peripheral.uuid,
	    uuids: uuids
	  });
	};

	NobleBindings.prototype.discoverIncludedServices = function (deviceUuid, serviceUuid, serviceUuids) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'discoverIncludedServices',
	    peripheralUuid: peripheral.uuid,
	    serviceUuid: serviceUuid,
	    serviceUuids: serviceUuids
	  });
	};

	NobleBindings.prototype.discoverCharacteristics = function (deviceUuid, serviceUuid, characteristicUuids) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'discoverCharacteristics',
	    peripheralUuid: peripheral.uuid,
	    serviceUuid: serviceUuid,
	    characteristicUuids: characteristicUuids
	  });
	};

	NobleBindings.prototype.read = function (deviceUuid, serviceUuid, characteristicUuid) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'read',
	    peripheralUuid: peripheral.uuid,
	    serviceUuid: serviceUuid,
	    characteristicUuid: characteristicUuid
	  });
	};

	NobleBindings.prototype.write = function (deviceUuid, serviceUuid, characteristicUuid, data, withoutResponse) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'write',
	    peripheralUuid: peripheral.uuid,
	    serviceUuid: serviceUuid,
	    characteristicUuid: characteristicUuid,
	    data: data.toString('hex'),
	    withoutResponse: withoutResponse
	  });
	};

	NobleBindings.prototype.broadcast = function (deviceUuid, serviceUuid, characteristicUuid, broadcast) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'broadcast',
	    peripheralUuid: peripheral.uuid,
	    serviceUuid: serviceUuid,
	    characteristicUuid: characteristicUuid,
	    broadcast: broadcast
	  });
	};

	NobleBindings.prototype.notify = function (deviceUuid, serviceUuid, characteristicUuid, notify) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'notify',
	    peripheralUuid: peripheral.uuid,
	    serviceUuid: serviceUuid,
	    characteristicUuid: characteristicUuid,
	    notify: notify
	  });
	};

	NobleBindings.prototype.discoverDescriptors = function (deviceUuid, serviceUuid, characteristicUuid) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'discoverDescriptors',
	    peripheralUuid: peripheral.uuid,
	    serviceUuid: serviceUuid,
	    characteristicUuid: characteristicUuid
	  });
	};

	NobleBindings.prototype.readValue = function (deviceUuid, serviceUuid, characteristicUuid, descriptorUuid) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'readValue',
	    peripheralUuid: peripheral.uuid,
	    serviceUuid: serviceUuid,
	    characteristicUuid: characteristicUuid,
	    descriptorUuid: descriptorUuid
	  });
	};

	NobleBindings.prototype.writeValue = function (deviceUuid, serviceUuid, characteristicUuid, descriptorUuid, data) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'writeValue',
	    peripheralUuid: peripheral.uuid,
	    serviceUuid: serviceUuid,
	    characteristicUuid: characteristicUuid,
	    descriptorUuid: descriptorUuid,
	    data: data.toString('hex')
	  });
	};

	NobleBindings.prototype.readHandle = function (deviceUuid, handle) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'readHandle',
	    peripheralUuid: peripheral.uuid,
	    handle: handle
	  });
	};

	NobleBindings.prototype.writeHandle = function (deviceUuid, handle, data, withoutResponse) {
	  var peripheral = this._peripherals[deviceUuid];

	  this._sendCommand({
	    action: 'readHandle',
	    peripheralUuid: peripheral.uuid,
	    handle: handle,
	    data: data.toString('hex'),
	    withoutResponse: withoutResponse
	  });
	};

	var nobleBindings = new NobleBindings();

	module.exports = nobleBindings;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10), __webpack_require__(1).Buffer))

/***/ },
/* 29 */
/***/ function(module, exports) {

	
	/**
	 * Module dependencies.
	 */

	var global = (function() { return this; })();

	/**
	 * WebSocket constructor.
	 */

	var WebSocket = global.WebSocket || global.MozWebSocket;

	/**
	 * Module exports.
	 */

	module.exports = WebSocket ? ws : null;

	/**
	 * WebSocket constructor.
	 *
	 * The third `opts` options object gets ignored in web browsers, since it's
	 * non-standard, and throws a TypeError if passed to the constructor.
	 * See: https://github.com/einaros/ws/issues/227
	 *
	 * @param {String} uri
	 * @param {Array} protocols (optional)
	 * @param {Object) opts (optional)
	 * @api public
	 */

	function ws(uri, protocols, opts) {
	  var instance;
	  if (protocols) {
	    instance = new WebSocket(uri, protocols);
	  } else {
	    instance = new WebSocket(uri);
	  }
	  return instance;
	}

	if (WebSocket) ws.prototype = WebSocket.prototype;


/***/ },
/* 30 */
/***/ function(module, exports) {

	var DEVICE_INFORMATION_UUID         = '180a';
	var SYSTEM_ID_UUID                  = '2a23';
	var MODEL_NUMBER_UUID               = '2a24';
	var SERIAL_NUMBER_UUID              = '2a25';
	var FIRMWARE_REVISION_UUID          = '2a26';
	var HARDWARE_REVISION_UUID          = '2a27';
	var SOFTWARE_REVISION_UUID          = '2a28';
	var MANUFACTURER_NAME_UUID          = '2a29';

	function DeviceInformationService() {
	}

	DeviceInformationService.prototype.readSystemId = function(callback) {
	  this.readDataCharacteristic(DEVICE_INFORMATION_UUID, SYSTEM_ID_UUID, function(error, data) {
	    if (error) {
	      return callback(error);
	    }

	    var systemId = data.toString('hex').match(/.{1,2}/g).reverse().join(':');

	    callback(null, systemId);
	  });
	};

	DeviceInformationService.prototype.readModelNumber = function(callback) {
	  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, MODEL_NUMBER_UUID, callback);
	};

	DeviceInformationService.prototype.readSerialNumber = function(callback) {
	  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, SERIAL_NUMBER_UUID, callback);
	};

	DeviceInformationService.prototype.readFirmwareRevision = function(callback) {
	  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, FIRMWARE_REVISION_UUID, callback);
	};

	DeviceInformationService.prototype.readHardwareRevision = function(callback) {
	  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, HARDWARE_REVISION_UUID, callback);
	};

	DeviceInformationService.prototype.readSoftwareRevision = function(callback) {
	  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, SOFTWARE_REVISION_UUID, callback);
	};

	DeviceInformationService.prototype.readManufacturerName = function(callback) {
	  this.readStringCharacteristic(DEVICE_INFORMATION_UUID, MANUFACTURER_NAME_UUID, callback);
	};

	module.exports = DeviceInformationService;


/***/ },
/* 31 */
/***/ function(module, exports) {

	var BATTERY_UUID                    = '180f';
	var BATTERY_LEVEL_UUID              = '2a19';

	function BatteryService() {
	}

	BatteryService.prototype.readBatteryLevel = function(callback) {
	  this.readUInt8Characteristic(BATTERY_UUID, BATTERY_LEVEL_UUID, callback);
	};

	module.exports = BatteryService;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*jslint node: true */
	"use strict";

	var NobleDevice = __webpack_require__(6);

	var EventEmitter = __webpack_require__(8).EventEmitter;
	var util = __webpack_require__(9);
	var crc = __webpack_require__(33);
	var commands = __webpack_require__(44);

	var SERIAL_UUID = 'a495ff10c5b14b44b5121370f02d74de';
	var BEAN_SERIAL_CHAR_UUID = 'a495ff11c5b14b44b5121370f02d74de';

	var Bean = function Bean(peripheral) {
	  if (!(this instanceof Bean)) return new Bean();

	  NobleDevice.call(this, peripheral);

	  EventEmitter.call(this);

	  this.count = 0;
	  this.gst = new Buffer(0);
	};

	Bean.SCAN_UUIDS = [SERIAL_UUID];

	util.inherits(Bean, EventEmitter);
	NobleDevice.Util.inherits(Bean, NobleDevice);

	Bean.prototype.connectAndSetup = function (callback) {

	  var self = this;

	  NobleDevice.prototype.connectAndSetup.call(self, function () {

	    self.notifyCharacteristic(SERIAL_UUID, BEAN_SERIAL_CHAR_UUID, true, self._onRead.bind(self), function (err) {

	      if (err) throw err;

	      self.emit('ready', err);
	      callback(err);
	    });
	  });
	};

	Bean.prototype._onRead = function (gt) {

	  //see https://github.com/PunchThrough/bean-documentation/blob/master/serial_message_protocol.md

	  //Received a single GT packet
	  var start = gt[0] & 0x80; //Set to 1 for the first packet of each App Message, 0 for every other packet
	  var messageCount = gt[0] & 0x60; //Increments and rolls over on each new GT Message (0, 1, 2, 3, 0, ...)
	  var packetCount = gt[0] & 0x1F; //Represents the number of packets remaining in the GST message

	  //first packet, reset data buffer
	  if (start) {
	    this.gst = new Buffer(0);
	  }

	  //TODO probably only if messageCount is in order
	  this.gst = Buffer.concat([this.gst, gt.slice(1)]);

	  //last packet, process and emit
	  if (packetCount === 0) {

	    var length = this.gst[0]; //size of thse cmd and payload

	    //crc only the size, cmd and payload
	    var crcString = crc.crc16ccitt(this.gst.slice(0, this.gst.length - 2));
	    //messy buffer equality because we have to swap bytes and can't use string equality because tostring drops leading zeros
	    var crc16 = new Buffer(crcString, 'hex');
	    var valid = crc16[0] === this.gst[this.gst.length - 1] && crc16[1] === this.gst[this.gst.length - 2];

	    var command = (this.gst[2] << 8) + this.gst[3] & ~0x80;

	    this.emit('raw', this.gst.slice(2, this.gst.length - 2), length, valid, command);

	    if (valid) {

	      //ideally some better way to do lookup
	      if (command === (commands.MSG_ID_CC_ACCEL_READ[0] << 8) + commands.MSG_ID_CC_ACCEL_READ[1]) {
	        var x = (this.gst[5] << 24 >> 16 | this.gst[4]) * 0.00391;
	        var y = (this.gst[7] << 24 >> 16 | this.gst[6]) * 0.00391;
	        var z = (this.gst[9] << 24 >> 16 | this.gst[8]) * 0.00391;

	        this.emit('accell', x.toFixed(5), y.toFixed(5), z.toFixed(5), valid);
	      } else if (this.gst[2] === commands.MSG_ID_SERIAL_DATA[0] && this.gst[3] === commands.MSG_ID_SERIAL_DATA[1]) {

	        this.emit('serial', this.gst.slice(4, this.gst.length - 2), valid);
	      } else if (command === (commands.MSG_ID_CC_TEMP_READ[0] << 8) + commands.MSG_ID_CC_TEMP_READ[1]) {

	        this.emit('temp', this.gst[4], valid);
	      } else {

	        this.emit('invalid', this.gst.slice(2, this.gst.length - 2), length, valid, command);
	      }
	    }
	  }
	};

	Bean.prototype.send = function (cmdBuffer, payloadBuffer, done) {

	  //size buffer contains size of(cmdBuffer, and payloadBuffer) and a reserved byte set to 0
	  var sizeBuffer = new Buffer(2);
	  sizeBuffer.writeUInt8(cmdBuffer.length + payloadBuffer.length, 0);
	  sizeBuffer.writeUInt8(0, 1);

	  //GST contains sizeBuffer, cmdBuffer, and payloadBuffer
	  var gstBuffer = Buffer.concat([sizeBuffer, cmdBuffer, payloadBuffer]);

	  var crcString = crc.crc16ccitt(gstBuffer);
	  var crc16Buffer = new Buffer(crcString, 'hex');

	  //GATT contains sequence header, gstBuffer and crc166
	  var gattBuffer = new Buffer(1 + gstBuffer.length + crc16Buffer.length);

	  var header = (this.count++ * 0x20 | 0x80) & 0xff;
	  gattBuffer[0] = header;

	  gstBuffer.copy(gattBuffer, 1, 0); //copy gstBuffer into gatt shifted right 1

	  //swap 2 crc bytes and add to end of gatt
	  gattBuffer[gattBuffer.length - 2] = crc16Buffer[1];
	  gattBuffer[gattBuffer.length - 1] = crc16Buffer[0];

	  this.writeDataCharacteristic(SERIAL_UUID, BEAN_SERIAL_CHAR_UUID, gattBuffer, done);
	};

	Bean.prototype.unGate = function (done) {
	  this.send(commands.MSG_ID_GATING, new Buffer({}), done);
	};

	Bean.prototype.write = function (data, done) {
	  this.send(commands.MSG_ID_SERIAL_DATA, data, done);
	};

	Bean.prototype.setColor = function (color, done) {
	  this.send(commands.MSG_ID_CC_LED_WRITE_ALL, color, done);
	};

	Bean.prototype.requestAccell = function (done) {
	  this.send(commands.MSG_ID_CC_ACCEL_READ, new Buffer([]), done);
	};

	Bean.prototype.requestTemp = function (done) {
	  this.send(commands.MSG_ID_CC_TEMP_READ, new Buffer([]), done);
	};

	module.exports = Bean;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.7.1
	var item, name, _fn, _ref;

	module.exports = {
	  CRC1: __webpack_require__(34).CRC1,
	  CRC8: __webpack_require__(37).CRC8,
	  CRC81Wire: __webpack_require__(38).CRC81Wire,
	  CRC16: __webpack_require__(39).CRC16,
	  CRC16CCITT: __webpack_require__(40).CRC16CCITT,
	  CRC16Modbus: __webpack_require__(41).CRC16Modbus,
	  CRC24: __webpack_require__(42).CRC24,
	  CRC32: __webpack_require__(43).CRC32
	};

	_ref = module.exports;
	_fn = function(item) {
	  return module.exports[name.toLowerCase()] = function(value) {
	    return new item().hexdigest(value);
	  };
	};
	for (name in _ref) {
	  item = _ref[name];
	  _fn(item);
	}


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.7.1
	var CRC, hex,
	  __hasProp = {}.hasOwnProperty,
	  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	CRC = __webpack_require__(35);

	hex = __webpack_require__(36);

	module.exports.CRC1 = (function(_super) {
	  __extends(_Class, _super);

	  function _Class() {
	    return _Class.__super__.constructor.apply(this, arguments);
	  }

	  _Class.prototype.TABLE = [];

	  _Class.prototype.CRC_MASK = 0x00;

	  _Class.prototype.pack = function(crc) {
	    return hex(crc % 256);
	  };

	  _Class.prototype.update = function(data) {
	    var accum;
	    accum = 0;
	    this.each_byte(data, function(b) {
	      return accum += b;
	    });
	    this.crc += accum % 256;
	    return this;
	  };

	  return _Class;

	})(CRC);


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Generated by CoffeeScript 1.7.1
	var CRC, hex;

	hex = __webpack_require__(36);

	module.exports = CRC = (function() {
	  CRC.prototype.INIT_CRC = 0x00;

	  CRC.prototype.XOR_MASK = 0x00;

	  CRC.prototype.WIDTH = 0;

	  CRC.prototype.pack = function(crc) {
	    return '';
	  };

	  CRC.prototype.each_byte = function(buf, cb) {
	    var byte, _i, _len, _results;
	    if (typeof buf === 'string') {
	      buf = new Buffer(buf);
	    }
	    _results = [];
	    for (_i = 0, _len = buf.length; _i < _len; _i++) {
	      byte = buf[_i];
	      _results.push(cb(byte));
	    }
	    return _results;
	  };

	  function CRC() {
	    this.crc = this.INIT_CRC;
	  }

	  CRC.prototype.digest_length = function() {
	    return Math.ceil(this.WIDTH / 8.0);
	  };

	  CRC.prototype.update = function(data) {};

	  CRC.prototype.reset = function() {
	    return this.crc = this.INIT_CRC;
	  };

	  CRC.prototype.checksum = function(signed) {
	    var sum;
	    if (signed == null) {
	      signed = true;
	    }
	    sum = this.crc ^ this.XOR_MASK;
	    if (signed) {
	      sum = sum >>> 0;
	    }
	    return sum;
	  };

	  CRC.prototype.finish = function() {
	    return this.pack(this.checksum());
	  };

	  CRC.prototype.hexdigest = function(value) {
	    var result;
	    if (value != null) {
	      this.update(value);
	    }
	    result = hex(this.finish());
	    this.reset();
	    return result;
	  };

	  return CRC;

	})();

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ },
/* 36 */
/***/ function(module, exports) {

	// Generated by CoffeeScript 1.7.1
	module.exports = function(number) {
	  var result;
	  result = number.toString(16);
	  while (result.length % 2) {
	    result = "0" + result;
	  }
	  return result;
	};


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.7.1
	var CRC, hex,
	  __hasProp = {}.hasOwnProperty,
	  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	CRC = __webpack_require__(35);

	hex = __webpack_require__(36);

	module.exports.CRC8 = (function(_super) {
	  __extends(_Class, _super);

	  function _Class() {
	    return _Class.__super__.constructor.apply(this, arguments);
	  }

	  _Class.prototype.WIDTH = 8;

	  _Class.prototype.INIT_CRC = 0x00;

	  _Class.prototype.TABLE = [0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15, 0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a, 0x2d, 0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65, 0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d, 0xe0, 0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5, 0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd, 0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85, 0xa8, 0xaf, 0xa6, 0xa1, 0xb4, 0xb3, 0xba, 0xbd, 0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2, 0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea, 0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5, 0xa2, 0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a, 0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 0x1f, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a, 0x57, 0x50, 0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42, 0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a, 0x89, 0x8e, 0x87, 0x80, 0x95, 0x92, 0x9b, 0x9c, 0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4, 0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec, 0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3, 0xd4, 0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c, 0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44, 0x19, 0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c, 0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34, 0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b, 0x76, 0x71, 0x78, 0x7f, 0x6a, 0x6d, 0x64, 0x63, 0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b, 0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13, 0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc, 0xbb, 0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8d, 0x84, 0x83, 0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 0xe6, 0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3];

	  _Class.prototype.pack = function(crc) {
	    return hex(crc & 0xff);
	  };

	  _Class.prototype.update = function(data) {
	    this.each_byte(data, (function(_this) {
	      return function(b) {
	        return _this.crc = (_this.TABLE[(_this.crc ^ b) & 0xff] ^ (_this.crc << 8)) & 0xff;
	      };
	    })(this));
	    return this;
	  };

	  return _Class;

	})(CRC);


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.7.1
	var CRC, hex,
	  __hasProp = {}.hasOwnProperty,
	  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	CRC = __webpack_require__(35);

	hex = __webpack_require__(36);

	module.exports.CRC81Wire = (function(_super) {
	  __extends(_Class, _super);

	  function _Class() {
	    return _Class.__super__.constructor.apply(this, arguments);
	  }

	  _Class.prototype.WIDTH = 8;

	  _Class.prototype.INIT_CRC = 0x00;

	  _Class.prototype.TABLE = [0x00, 0x5e, 0xbc, 0xe2, 0x61, 0x3f, 0xdd, 0x83, 0xc2, 0x9c, 0x7e, 0x20, 0xa3, 0xfd, 0x1f, 0x41, 0x9d, 0xc3, 0x21, 0x7f, 0xfc, 0xa2, 0x40, 0x1e, 0x5f, 0x01, 0xe3, 0xbd, 0x3e, 0x60, 0x82, 0xdc, 0x23, 0x7d, 0x9f, 0xc1, 0x42, 0x1c, 0xfe, 0xa0, 0xe1, 0xbf, 0x5d, 0x03, 0x80, 0xde, 0x3c, 0x62, 0xbe, 0xe0, 0x02, 0x5c, 0xdf, 0x81, 0x63, 0x3d, 0x7c, 0x22, 0xc0, 0x9e, 0x1d, 0x43, 0xa1, 0xff, 0x46, 0x18, 0xfa, 0xa4, 0x27, 0x79, 0x9b, 0xc5, 0x84, 0xda, 0x38, 0x66, 0xe5, 0xbb, 0x59, 0x07, 0xdb, 0x85, 0x67, 0x39, 0xba, 0xe4, 0x06, 0x58, 0x19, 0x47, 0xa5, 0xfb, 0x78, 0x26, 0xc4, 0x9a, 0x65, 0x3b, 0xd9, 0x87, 0x04, 0x5a, 0xb8, 0xe6, 0xa7, 0xf9, 0x1b, 0x45, 0xc6, 0x98, 0x7a, 0x24, 0xf8, 0xa6, 0x44, 0x1a, 0x99, 0xc7, 0x25, 0x7b, 0x3a, 0x64, 0x86, 0xd8, 0x5b, 0x05, 0xe7, 0xb9, 0x8c, 0xd2, 0x30, 0x6e, 0xed, 0xb3, 0x51, 0x0f, 0x4e, 0x10, 0xf2, 0xac, 0x2f, 0x71, 0x93, 0xcd, 0x11, 0x4f, 0xad, 0xf3, 0x70, 0x2e, 0xcc, 0x92, 0xd3, 0x8d, 0x6f, 0x31, 0xb2, 0xec, 0x0e, 0x50, 0xaf, 0xf1, 0x13, 0x4d, 0xce, 0x90, 0x72, 0x2c, 0x6d, 0x33, 0xd1, 0x8f, 0x0c, 0x52, 0xb0, 0xee, 0x32, 0x6c, 0x8e, 0xd0, 0x53, 0x0d, 0xef, 0xb1, 0xf0, 0xae, 0x4c, 0x12, 0x91, 0xcf, 0x2d, 0x73, 0xca, 0x94, 0x76, 0x28, 0xab, 0xf5, 0x17, 0x49, 0x08, 0x56, 0xb4, 0xea, 0x69, 0x37, 0xd5, 0x8b, 0x57, 0x09, 0xeb, 0xb5, 0x36, 0x68, 0x8a, 0xd4, 0x95, 0xcb, 0x29, 0x77, 0xf4, 0xaa, 0x48, 0x16, 0xe9, 0xb7, 0x55, 0x0b, 0x88, 0xd6, 0x34, 0x6a, 0x2b, 0x75, 0x97, 0xc9, 0x4a, 0x14, 0xf6, 0xa8, 0x74, 0x2a, 0xc8, 0x96, 0x15, 0x4b, 0xa9, 0xf7, 0xb6, 0xe8, 0x0a, 0x54, 0xd7, 0x89, 0x6b, 0x35];

	  _Class.prototype.pack = function(crc) {
	    return hex(crc & 0xff);
	  };

	  _Class.prototype.update = function(data) {
	    this.each_byte(data, (function(_this) {
	      return function(b) {
	        return _this.crc = (_this.TABLE[(_this.crc ^ b) & 0xff] ^ (_this.crc << 8)) & 0xff;
	      };
	    })(this));
	    return this;
	  };

	  return _Class;

	})(CRC);


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.7.1
	var CRC, hex,
	  __hasProp = {}.hasOwnProperty,
	  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	CRC = __webpack_require__(35);

	hex = __webpack_require__(36);

	module.exports.CRC16 = (function(_super) {
	  __extends(_Class, _super);

	  function _Class() {
	    return _Class.__super__.constructor.apply(this, arguments);
	  }

	  _Class.prototype.WIDTH = 16;

	  _Class.prototype.INIT_CRC = 0x0000;

	  _Class.prototype.TABLE = [0x0000, 0xc0c1, 0xc181, 0x0140, 0xc301, 0x03c0, 0x0280, 0xc241, 0xc601, 0x06c0, 0x0780, 0xc741, 0x0500, 0xc5c1, 0xc481, 0x0440, 0xcc01, 0x0cc0, 0x0d80, 0xcd41, 0x0f00, 0xcfc1, 0xce81, 0x0e40, 0x0a00, 0xcac1, 0xcb81, 0x0b40, 0xc901, 0x09c0, 0x0880, 0xc841, 0xd801, 0x18c0, 0x1980, 0xd941, 0x1b00, 0xdbc1, 0xda81, 0x1a40, 0x1e00, 0xdec1, 0xdf81, 0x1f40, 0xdd01, 0x1dc0, 0x1c80, 0xdc41, 0x1400, 0xd4c1, 0xd581, 0x1540, 0xd701, 0x17c0, 0x1680, 0xd641, 0xd201, 0x12c0, 0x1380, 0xd341, 0x1100, 0xd1c1, 0xd081, 0x1040, 0xf001, 0x30c0, 0x3180, 0xf141, 0x3300, 0xf3c1, 0xf281, 0x3240, 0x3600, 0xf6c1, 0xf781, 0x3740, 0xf501, 0x35c0, 0x3480, 0xf441, 0x3c00, 0xfcc1, 0xfd81, 0x3d40, 0xff01, 0x3fc0, 0x3e80, 0xfe41, 0xfa01, 0x3ac0, 0x3b80, 0xfb41, 0x3900, 0xf9c1, 0xf881, 0x3840, 0x2800, 0xe8c1, 0xe981, 0x2940, 0xeb01, 0x2bc0, 0x2a80, 0xea41, 0xee01, 0x2ec0, 0x2f80, 0xef41, 0x2d00, 0xedc1, 0xec81, 0x2c40, 0xe401, 0x24c0, 0x2580, 0xe541, 0x2700, 0xe7c1, 0xe681, 0x2640, 0x2200, 0xe2c1, 0xe381, 0x2340, 0xe101, 0x21c0, 0x2080, 0xe041, 0xa001, 0x60c0, 0x6180, 0xa141, 0x6300, 0xa3c1, 0xa281, 0x6240, 0x6600, 0xa6c1, 0xa781, 0x6740, 0xa501, 0x65c0, 0x6480, 0xa441, 0x6c00, 0xacc1, 0xad81, 0x6d40, 0xaf01, 0x6fc0, 0x6e80, 0xae41, 0xaa01, 0x6ac0, 0x6b80, 0xab41, 0x6900, 0xa9c1, 0xa881, 0x6840, 0x7800, 0xb8c1, 0xb981, 0x7940, 0xbb01, 0x7bc0, 0x7a80, 0xba41, 0xbe01, 0x7ec0, 0x7f80, 0xbf41, 0x7d00, 0xbdc1, 0xbc81, 0x7c40, 0xb401, 0x74c0, 0x7580, 0xb541, 0x7700, 0xb7c1, 0xb681, 0x7640, 0x7200, 0xb2c1, 0xb381, 0x7340, 0xb101, 0x71c0, 0x7080, 0xb041, 0x5000, 0x90c1, 0x9181, 0x5140, 0x9301, 0x53c0, 0x5280, 0x9241, 0x9601, 0x56c0, 0x5780, 0x9741, 0x5500, 0x95c1, 0x9481, 0x5440, 0x9c01, 0x5cc0, 0x5d80, 0x9d41, 0x5f00, 0x9fc1, 0x9e81, 0x5e40, 0x5a00, 0x9ac1, 0x9b81, 0x5b40, 0x9901, 0x59c0, 0x5880, 0x9841, 0x8801, 0x48c0, 0x4980, 0x8941, 0x4b00, 0x8bc1, 0x8a81, 0x4a40, 0x4e00, 0x8ec1, 0x8f81, 0x4f40, 0x8d01, 0x4dc0, 0x4c80, 0x8c41, 0x4400, 0x84c1, 0x8581, 0x4540, 0x8701, 0x47c0, 0x4680, 0x8641, 0x8201, 0x42c0, 0x4380, 0x8341, 0x4100, 0x81c1, 0x8081, 0x4040];

	  _Class.prototype.pack = function(crc) {
	    return hex((crc & 0xff00) >> 8) + hex(crc & 0xff);
	  };

	  _Class.prototype.update = function(data) {
	    this.each_byte(data, (function(_this) {
	      return function(b) {
	        return _this.crc = (_this.TABLE[(_this.crc ^ b) & 0xff] ^ (_this.crc >> 8)) & 0xffff;
	      };
	    })(this));
	    return this;
	  };

	  return _Class;

	})(CRC);


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.7.1
	var CRC, hex,
	  __hasProp = {}.hasOwnProperty,
	  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	CRC = __webpack_require__(35);

	hex = __webpack_require__(36);

	module.exports.CRC16CCITT = (function(_super) {
	  __extends(_Class, _super);

	  function _Class() {
	    return _Class.__super__.constructor.apply(this, arguments);
	  }

	  _Class.prototype.WIDTH = 16;

	  _Class.prototype.INIT_CRC = 0xffff;

	  _Class.prototype.TABLE = [0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6, 0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d, 0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc, 0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823, 0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b, 0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a, 0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70, 0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067, 0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d, 0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634, 0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3, 0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a, 0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92, 0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1, 0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0];

	  _Class.prototype.pack = function(crc) {
	    return hex((crc & 0xff00) >> 8) + hex(crc & 0xff);
	  };

	  _Class.prototype.update = function(data) {
	    this.each_byte(data, (function(_this) {
	      return function(b) {
	        return _this.crc = (_this.TABLE[((_this.crc >> 8) ^ b) & 0xff] ^ (_this.crc << 8)) & 0xffff;
	      };
	    })(this));
	    return this;
	  };

	  return _Class;

	})(CRC);


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.7.1
	var CRC, hex,
	  __hasProp = {}.hasOwnProperty,
	  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	CRC = __webpack_require__(35);

	hex = __webpack_require__(36);

	module.exports.CRC16Modbus = (function(_super) {
	  __extends(_Class, _super);

	  function _Class() {
	    return _Class.__super__.constructor.apply(this, arguments);
	  }

	  _Class.prototype.WIDTH = 16;

	  _Class.prototype.INIT_CRC = 0xffff;

	  _Class.prototype.TABLE = [0x0000, 0xc0c1, 0xc181, 0x0140, 0xc301, 0x03c0, 0x0280, 0xc241, 0xc601, 0x06c0, 0x0780, 0xc741, 0x0500, 0xc5c1, 0xc481, 0x0440, 0xcc01, 0x0cc0, 0x0d80, 0xcd41, 0x0f00, 0xcfc1, 0xce81, 0x0e40, 0x0a00, 0xcac1, 0xcb81, 0x0b40, 0xc901, 0x09c0, 0x0880, 0xc841, 0xd801, 0x18c0, 0x1980, 0xd941, 0x1b00, 0xdbc1, 0xda81, 0x1a40, 0x1e00, 0xdec1, 0xdf81, 0x1f40, 0xdd01, 0x1dc0, 0x1c80, 0xdc41, 0x1400, 0xd4c1, 0xd581, 0x1540, 0xd701, 0x17c0, 0x1680, 0xd641, 0xd201, 0x12c0, 0x1380, 0xd341, 0x1100, 0xd1c1, 0xd081, 0x1040, 0xf001, 0x30c0, 0x3180, 0xf141, 0x3300, 0xf3c1, 0xf281, 0x3240, 0x3600, 0xf6c1, 0xf781, 0x3740, 0xf501, 0x35c0, 0x3480, 0xf441, 0x3c00, 0xfcc1, 0xfd81, 0x3d40, 0xff01, 0x3fc0, 0x3e80, 0xfe41, 0xfa01, 0x3ac0, 0x3b80, 0xfb41, 0x3900, 0xf9c1, 0xf881, 0x3840, 0x2800, 0xe8c1, 0xe981, 0x2940, 0xeb01, 0x2bc0, 0x2a80, 0xea41, 0xee01, 0x2ec0, 0x2f80, 0xef41, 0x2d00, 0xedc1, 0xec81, 0x2c40, 0xe401, 0x24c0, 0x2580, 0xe541, 0x2700, 0xe7c1, 0xe681, 0x2640, 0x2200, 0xe2c1, 0xe381, 0x2340, 0xe101, 0x21c0, 0x2080, 0xe041, 0xa001, 0x60c0, 0x6180, 0xa141, 0x6300, 0xa3c1, 0xa281, 0x6240, 0x6600, 0xa6c1, 0xa781, 0x6740, 0xa501, 0x65c0, 0x6480, 0xa441, 0x6c00, 0xacc1, 0xad81, 0x6d40, 0xaf01, 0x6fc0, 0x6e80, 0xae41, 0xaa01, 0x6ac0, 0x6b80, 0xab41, 0x6900, 0xa9c1, 0xa881, 0x6840, 0x7800, 0xb8c1, 0xb981, 0x7940, 0xbb01, 0x7bc0, 0x7a80, 0xba41, 0xbe01, 0x7ec0, 0x7f80, 0xbf41, 0x7d00, 0xbdc1, 0xbc81, 0x7c40, 0xb401, 0x74c0, 0x7580, 0xb541, 0x7700, 0xb7c1, 0xb681, 0x7640, 0x7200, 0xb2c1, 0xb381, 0x7340, 0xb101, 0x71c0, 0x7080, 0xb041, 0x5000, 0x90c1, 0x9181, 0x5140, 0x9301, 0x53c0, 0x5280, 0x9241, 0x9601, 0x56c0, 0x5780, 0x9741, 0x5500, 0x95c1, 0x9481, 0x5440, 0x9c01, 0x5cc0, 0x5d80, 0x9d41, 0x5f00, 0x9fc1, 0x9e81, 0x5e40, 0x5a00, 0x9ac1, 0x9b81, 0x5b40, 0x9901, 0x59c0, 0x5880, 0x9841, 0x8801, 0x48c0, 0x4980, 0x8941, 0x4b00, 0x8bc1, 0x8a81, 0x4a40, 0x4e00, 0x8ec1, 0x8f81, 0x4f40, 0x8d01, 0x4dc0, 0x4c80, 0x8c41, 0x4400, 0x84c1, 0x8581, 0x4540, 0x8701, 0x47c0, 0x4680, 0x8641, 0x8201, 0x42c0, 0x4380, 0x8341, 0x4100, 0x81c1, 0x8081, 0x4040];

	  _Class.prototype.pack = function(crc) {
	    return hex((crc & 0xff00) >> 8) + hex(crc & 0xff);
	  };

	  _Class.prototype.update = function(data) {
	    this.each_byte(data, (function(_this) {
	      return function(b) {
	        return _this.crc = (_this.TABLE[(_this.crc ^ b) & 0xff] ^ (_this.crc >> 8)) & 0xffff;
	      };
	    })(this));
	    return this;
	  };

	  return _Class;

	})(CRC);


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.7.1
	var CRC, hex,
	  __hasProp = {}.hasOwnProperty,
	  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	CRC = __webpack_require__(35);

	hex = __webpack_require__(36);

	module.exports.CRC24 = (function(_super) {
	  __extends(_Class, _super);

	  function _Class() {
	    return _Class.__super__.constructor.apply(this, arguments);
	  }

	  _Class.prototype.WIDTH = 24;

	  _Class.prototype.INIT_CRC = 0xb704ce;

	  _Class.prototype.TABLE = [0x000000, 0x864cfb, 0x8ad50d, 0x0c99f6, 0x93e6e1, 0x15aa1a, 0x1933ec, 0x9f7f17, 0xa18139, 0x27cdc2, 0x2b5434, 0xad18cf, 0x3267d8, 0xb42b23, 0xb8b2d5, 0x3efe2e, 0xc54e89, 0x430272, 0x4f9b84, 0xc9d77f, 0x56a868, 0xd0e493, 0xdc7d65, 0x5a319e, 0x64cfb0, 0xe2834b, 0xee1abd, 0x685646, 0xf72951, 0x7165aa, 0x7dfc5c, 0xfbb0a7, 0x0cd1e9, 0x8a9d12, 0x8604e4, 0x00481f, 0x9f3708, 0x197bf3, 0x15e205, 0x93aefe, 0xad50d0, 0x2b1c2b, 0x2785dd, 0xa1c926, 0x3eb631, 0xb8faca, 0xb4633c, 0x322fc7, 0xc99f60, 0x4fd39b, 0x434a6d, 0xc50696, 0x5a7981, 0xdc357a, 0xd0ac8c, 0x56e077, 0x681e59, 0xee52a2, 0xe2cb54, 0x6487af, 0xfbf8b8, 0x7db443, 0x712db5, 0xf7614e, 0x19a3d2, 0x9fef29, 0x9376df, 0x153a24, 0x8a4533, 0x0c09c8, 0x00903e, 0x86dcc5, 0xb822eb, 0x3e6e10, 0x32f7e6, 0xb4bb1d, 0x2bc40a, 0xad88f1, 0xa11107, 0x275dfc, 0xdced5b, 0x5aa1a0, 0x563856, 0xd074ad, 0x4f0bba, 0xc94741, 0xc5deb7, 0x43924c, 0x7d6c62, 0xfb2099, 0xf7b96f, 0x71f594, 0xee8a83, 0x68c678, 0x645f8e, 0xe21375, 0x15723b, 0x933ec0, 0x9fa736, 0x19ebcd, 0x8694da, 0x00d821, 0x0c41d7, 0x8a0d2c, 0xb4f302, 0x32bff9, 0x3e260f, 0xb86af4, 0x2715e3, 0xa15918, 0xadc0ee, 0x2b8c15, 0xd03cb2, 0x567049, 0x5ae9bf, 0xdca544, 0x43da53, 0xc596a8, 0xc90f5e, 0x4f43a5, 0x71bd8b, 0xf7f170, 0xfb6886, 0x7d247d, 0xe25b6a, 0x641791, 0x688e67, 0xeec29c, 0x3347a4, 0xb50b5f, 0xb992a9, 0x3fde52, 0xa0a145, 0x26edbe, 0x2a7448, 0xac38b3, 0x92c69d, 0x148a66, 0x181390, 0x9e5f6b, 0x01207c, 0x876c87, 0x8bf571, 0x0db98a, 0xf6092d, 0x7045d6, 0x7cdc20, 0xfa90db, 0x65efcc, 0xe3a337, 0xef3ac1, 0x69763a, 0x578814, 0xd1c4ef, 0xdd5d19, 0x5b11e2, 0xc46ef5, 0x42220e, 0x4ebbf8, 0xc8f703, 0x3f964d, 0xb9dab6, 0xb54340, 0x330fbb, 0xac70ac, 0x2a3c57, 0x26a5a1, 0xa0e95a, 0x9e1774, 0x185b8f, 0x14c279, 0x928e82, 0x0df195, 0x8bbd6e, 0x872498, 0x016863, 0xfad8c4, 0x7c943f, 0x700dc9, 0xf64132, 0x693e25, 0xef72de, 0xe3eb28, 0x65a7d3, 0x5b59fd, 0xdd1506, 0xd18cf0, 0x57c00b, 0xc8bf1c, 0x4ef3e7, 0x426a11, 0xc426ea, 0x2ae476, 0xaca88d, 0xa0317b, 0x267d80, 0xb90297, 0x3f4e6c, 0x33d79a, 0xb59b61, 0x8b654f, 0x0d29b4, 0x01b042, 0x87fcb9, 0x1883ae, 0x9ecf55, 0x9256a3, 0x141a58, 0xefaaff, 0x69e604, 0x657ff2, 0xe33309, 0x7c4c1e, 0xfa00e5, 0xf69913, 0x70d5e8, 0x4e2bc6, 0xc8673d, 0xc4fecb, 0x42b230, 0xddcd27, 0x5b81dc, 0x57182a, 0xd154d1, 0x26359f, 0xa07964, 0xace092, 0x2aac69, 0xb5d37e, 0x339f85, 0x3f0673, 0xb94a88, 0x87b4a6, 0x01f85d, 0x0d61ab, 0x8b2d50, 0x145247, 0x921ebc, 0x9e874a, 0x18cbb1, 0xe37b16, 0x6537ed, 0x69ae1b, 0xefe2e0, 0x709df7, 0xf6d10c, 0xfa48fa, 0x7c0401, 0x42fa2f, 0xc4b6d4, 0xc82f22, 0x4e63d9, 0xd11cce, 0x575035, 0x5bc9c3, 0xdd8538];

	  _Class.prototype.pack = function(crc) {
	    return hex((crc & 0xff0000) >> 16) + hex((crc & 0x00ff00) >> 8) + hex(crc & 0x0000ff);
	  };

	  _Class.prototype.update = function(data) {
	    this.each_byte(data, (function(_this) {
	      return function(b) {
	        return _this.crc = (_this.TABLE[((_this.crc >> 16) ^ b) & 0xff] ^ (_this.crc << 8)) & 0xffffff;
	      };
	    })(this));
	    return this;
	  };

	  return _Class;

	})(CRC);


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.7.1
	var CRC, hex,
	  __hasProp = {}.hasOwnProperty,
	  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	CRC = __webpack_require__(35);

	hex = __webpack_require__(36);

	module.exports.CRC32 = (function(_super) {
	  __extends(_Class, _super);

	  function _Class() {
	    return _Class.__super__.constructor.apply(this, arguments);
	  }

	  _Class.prototype.WIDTH = 4;

	  _Class.prototype.INIT_CRC = 0xffffffff;

	  _Class.prototype.XOR_MASK = 0xffffffff;

	  _Class.prototype.TABLE = [0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01, 0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f, 0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1, 0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9, 0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d];

	  _Class.prototype.pack = function(crc) {
	    return hex(crc >> 24 & 0xff) + hex(crc >> 16 & 0xff) + hex(crc >> 8 & 0xff) + hex(crc & 0xff);
	  };

	  _Class.prototype.update = function(data) {
	    this.each_byte(data, (function(_this) {
	      return function(b) {
	        return _this.crc = _this.TABLE[(_this.crc ^ b) & 0xff] ^ (_this.crc >>> 8);
	      };
	    })(this));
	    return this;
	  };

	  return _Class;

	})(CRC);


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*jslint node: true */
	"use strict";

	//presumably defined here https://github.com/PunchThrough/bean-documentation/blob/master/app_message_types.md

	module.exports = {

	    MSG_ID_SERIAL_DATA: new Buffer([0x00, 0x00]),
	    MSG_ID_BT_SET_ADV: new Buffer([0x05, 0x00]),
	    MSG_ID_BT_SET_CONN: new Buffer([0x05, 0x02]),
	    MSG_ID_BT_SET_LOCAL_NAME: new Buffer([0x05, 0x04]),
	    MSG_ID_BT_SET_PIN: new Buffer([0x05, 0x06]),
	    MSG_ID_BT_SET_TX_PWR: new Buffer([0x05, 0x08]),
	    MSG_ID_BT_GET_CONFIG: new Buffer([0x05, 0x10]),
	    MSG_ID_BT_ADV_ONOFF: new Buffer([0x05, 0x12]),
	    MSG_ID_BT_SET_SCRATCH: new Buffer([0x05, 0x14]),
	    MSG_ID_BT_GET_SCRATCH: new Buffer([0x05, 0x15]),
	    MSG_ID_BT_RESTART: new Buffer([0x05, 0x20]),
	    MSG_ID_GATING: new Buffer([0x05, 0x50]),
	    MSG_ID_BL_CMD: new Buffer([0x10, 0x00]),
	    MSG_ID_BL_FW_BLOCK: new Buffer([0x10, 0x01]),
	    MSG_ID_BL_STATUS: new Buffer([0x10, 0x02]),
	    MSG_ID_CC_LED_WRITE: new Buffer([0x20, 0x00]),
	    MSG_ID_CC_LED_WRITE_ALL: new Buffer([0x20, 0x01]),
	    MSG_ID_CC_LED_READ_ALL: new Buffer([0x20, 0x02]),
	    MSG_ID_CC_ACCEL_READ: new Buffer([0x20, 0x10]),
	    MSG_ID_CC_TEMP_READ: new Buffer([0x20, 0x11]),
	    MSG_ID_AR_SET_POWER: new Buffer([0x30, 0x00]),
	    MSG_ID_AR_GET_CONFIG: new Buffer([0x30, 0x06]),
	    MSG_ID_DB_LOOPBACK: new Buffer([0xFE, 0x00]),
	    MSG_ID_DB_COUNTER: new Buffer([0xFE, 0x01])

	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ },
/* 45 */
/***/ function(module, exports) {

	'use strict';

	var SCRATCH_UUID = 'a495ff20c5b14b44b5121370f02d74de';
	var SCRATCH_ONE = 'a495ff21c5b14b44b5121370f02d74de';

	function ScratchOne() {}

	ScratchOne.prototype.readOne = function (callback) {
	  this.readDataCharacteristic(SCRATCH_UUID, SCRATCH_ONE, callback);
	};

	ScratchOne.prototype.writeOne = function (data, callback) {
	  this.writeDataCharacteristic(SCRATCH_UUID, SCRATCH_ONE, data, callback);
	};

	ScratchOne.prototype.notifyOne = function (onRead, callback) {
	  this.notifyCharacteristic(SCRATCH_UUID, SCRATCH_ONE, true, onRead, callback);
	};

	ScratchOne.prototype.unnotifyOne = function (onRead, callback) {
	  this.notifyCharacteristic(SCRATCH_UUID, SCRATCH_ONE, false, onRead, callback);
	};

	module.exports = ScratchOne;

/***/ },
/* 46 */
/***/ function(module, exports) {

	'use strict';

	var SCRATCH_UUID = 'a495ff20c5b14b44b5121370f02d74de';
	var SCRATCH_TWO = 'a495ff22c5b14b44b5121370f02d74de';

	function ScratchTwo() {}

	ScratchTwo.prototype.readTwo = function (callback) {
	  this.readDataCharacteristic(SCRATCH_UUID, SCRATCH_TWO, callback);
	};

	ScratchTwo.prototype.writeTwo = function (data, callback) {
	  this.writeDataCharacteristic(SCRATCH_UUID, SCRATCH_TWO, data, callback);
	};

	ScratchTwo.prototype.notifyTwo = function (onRead, callback) {
	  this.notifyCharacteristic(SCRATCH_UUID, SCRATCH_TWO, true, onRead, callback);
	};

	ScratchTwo.prototype.unnotifyTwo = function (onRead, callback) {
	  this.notifyCharacteristic(SCRATCH_UUID, SCRATCH_TWO, false, onRead, callback);
	};

	module.exports = ScratchTwo;

/***/ },
/* 47 */
/***/ function(module, exports) {

	'use strict';

	var SCRATCH_UUID = 'a495ff20c5b14b44b5121370f02d74de';
	var SCRATCH_THREE = 'a495ff23c5b14b44b5121370f02d74de';

	function ScratchThree() {}

	ScratchThree.prototype.readThree = function (callback) {
	  this.readDataCharacteristic(SCRATCH_UUID, SCRATCH_THREE, callback);
	};

	ScratchThree.prototype.writeThree = function (data, callback) {
	  this.writeDataCharacteristic(SCRATCH_UUID, SCRATCH_THREE, data, callback);
	};

	ScratchThree.prototype.notifyThree = function (onRead, callback) {
	  this.notifyCharacteristic(SCRATCH_UUID, SCRATCH_THREE, true, onRead, callback);
	};

	ScratchThree.prototype.unnotifyThree = function (onRead, callback) {
	  this.notifyCharacteristic(SCRATCH_UUID, SCRATCH_THREE, false, onRead, callback);
	};

	module.exports = ScratchThree;

/***/ },
/* 48 */
/***/ function(module, exports) {

	'use strict';

	var SCRATCH_UUID = 'a495ff20c5b14b44b5121370f02d74de';
	var SCRATCH_FOUR = 'a495ff24c5b14b44b5121370f02d74de';

	function ScratchFour() {}

	ScratchFour.prototype.readFour = function (callback) {
	  this.readDataCharacteristic(SCRATCH_UUID, SCRATCH_FOUR, callback);
	};

	ScratchFour.prototype.writeFour = function (data, callback) {
	  this.writeDataCharacteristic(SCRATCH_UUID, SCRATCH_FOUR, data, callback);
	};

	ScratchFour.prototype.notifyFour = function (onRead, callback) {
	  this.notifyCharacteristic(SCRATCH_UUID, SCRATCH_FOUR, true, onRead, callback);
	};

	ScratchFour.prototype.unnotifyFour = function (onRead, callback) {
	  this.notifyCharacteristic(SCRATCH_UUID, SCRATCH_FOUR, false, onRead, callback);
	};

	module.exports = ScratchFour;

/***/ },
/* 49 */
/***/ function(module, exports) {

	'use strict';

	var SCRATCH_UUID = 'a495ff20c5b14b44b5121370f02d74de';
	var SCRATCH_FIVE = 'a495ff25c5b14b44b5121370f02d74de';

	function ScratchFive() {}

	ScratchFive.prototype.readFive = function (callback) {
	  this.readDataCharacteristic(SCRATCH_UUID, SCRATCH_FIVE, callback);
	};

	ScratchFive.prototype.writeFive = function (data, callback) {
	  this.writeDataCharacteristic(SCRATCH_UUID, SCRATCH_FIVE, data, callback);
	};

	ScratchFive.prototype.notifyFive = function (onRead, callback) {
	  this.notifyCharacteristic(SCRATCH_UUID, SCRATCH_FIVE, true, onRead, callback);
	};

	ScratchFive.prototype.unnotifyFive = function (onRead, callback) {
	  this.notifyCharacteristic(SCRATCH_UUID, SCRATCH_FIVE, false, onRead, callback);
	};

	module.exports = ScratchFive;

/***/ }
/******/ ]);