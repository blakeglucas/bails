// \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) {
		__defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	}
	if (!no_symbols) {
		__defProp(target, Symbol.toStringTag, { value: "Module" });
	}
	return target;
};

// src/environment.ts
var hasDOM;
function init_environment() {
	return (init_environment = __esmMin((() => {
		hasDOM = typeof window !== "undefined" && typeof document !== "undefined";
	})))();
}

// src/nanoid.ts
function nanoid(size = 21) {
	const source = typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" ? crypto : null;
	if (source) {
		const bytes = new Uint8Array(size);
		source.getRandomValues(bytes);
		let id = "";
		for (let i = 0; i < size; i++) id += urlAlphabet[bytes[i] & 63];
		return id;
	}
	let id = "";
	let i = size | 0;
	while (i--) id += urlAlphabet[Math.random() * 64 | 0];
	return id;
}
var urlAlphabet;
function init_nanoid() {
	return (init_nanoid = __esmMin((() => {
		urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
function init_typeof() {
	return (init_typeof = __esmMin((() => {})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
function init_toPrimitive() {
	return (init_toPrimitive = __esmMin((() => {
		/* @__PURE__ */ init_typeof();
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}
function init_toPropertyKey() {
	return (init_toPropertyKey = __esmMin((() => {
		/* @__PURE__ */ init_typeof();
		init_toPrimitive();
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}
function init_defineProperty() {
	return (init_defineProperty = __esmMin((() => {
		init_toPropertyKey();
	})))();
}

// \0@oxc-project+runtime@0.155.0/helpers/esm/objectSpread2.js
function ownKeys(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r && (o = o.filter(function(r) {
			return Object.getOwnPropertyDescriptor(e, r).enumerable;
		})), t.push.apply(t, o);
	}
	return t;
}
function _objectSpread2(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
			_defineProperty(e, r, t[r]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
			Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
		});
	}
	return e;
}
function init_objectSpread2() {
	return (init_objectSpread2 = __esmMin((() => {
		init_defineProperty();
	})))();
}

// src/runtime.ts
function runtimeURL() {
	return window.location.origin + "/bails/runtime";
}
function setTransport(transport) {
	customTransport = transport;
}
function getTransport() {
	return customTransport;
}
function newRuntimeCaller(object, windowName = "") {
	return function(method, args = null) {
		return runtimeCallWithID(object, method, windowName, args);
	};
}
async function runtimeCallWithID(objectID, method, windowName, args) {
	var _response$headers$get, _response$headers$get2;
	if (customTransport) return customTransport.call(objectID, method, windowName, args);
	let url = new URL(runtimeURL());
	let body = {
		object: objectID,
		method
	};
	if (args !== null && args !== void 0) body.args = args;
	let headers = {
		["x-bails-client-id"]: clientId,
		["Content-Type"]: "application/json"
	};
	if (windowName) headers["x-bails-window-name"] = windowName;
	const bodyStr = JSON.stringify(body);
	let response;
	if (bodyStr.length > CHUNK_THRESHOLD$1) response = await sendChunked(url, headers, bodyStr);
	else response = await fetch(url, {
		method: "POST",
		headers,
		body: bodyStr
	});
	if (!response.ok) {
		const ct = response.headers.get("Content-Type");
		if (ct === null || ct === void 0 ? void 0 : ct.includes("application/json")) {
			const json = await response.json();
			let err;
			switch (json.kind) {
				case "ReferenceError":
					err = new ReferenceError(json.message);
					break;
				case "TypeError":
					err = new TypeError(json.message);
					break;
				case "RuntimeError":
					err = new RuntimeError(json.message);
					break;
				default: err = new Error(json.message);
			}
			err.cause = json.cause;
			throw err;
		}
		throw new Error(await response.text());
	}
	if (((_response$headers$get = (_response$headers$get2 = response.headers.get("Content-Type")) === null || _response$headers$get2 === void 0 ? void 0 : _response$headers$get2.indexOf("application/json")) !== null && _response$headers$get !== void 0 ? _response$headers$get : -1) !== -1) return response.json();
	else return response.text();
}
async function sendChunked(url, headers, bodyStr) {
	const chunkId = nanoid();
	const bodyBytes = new TextEncoder().encode(bodyStr);
	const totalChunks = Math.ceil(bodyBytes.length / CHUNK_THRESHOLD$1);
	for (let i = 0; i < totalChunks - 1; i++) {
		const chunk = bodyBytes.subarray(i * CHUNK_THRESHOLD$1, (i + 1) * CHUNK_THRESHOLD$1);
		const resp = await fetch(url, {
			method: "POST",
			headers: _objectSpread2(_objectSpread2({}, headers), {}, {
				"x-bails-chunk-id": chunkId,
				"x-bails-chunk-index": String(i),
				"x-bails-chunk-total": String(totalChunks)
			}),
			body: chunk
		});
		if (!resp.ok) throw new Error(await resp.text());
	}
	return fetch(url, {
		method: "POST",
		headers: _objectSpread2(_objectSpread2({}, headers), {}, {
			"x-bails-chunk-id": chunkId,
			"x-bails-chunk-index": String(totalChunks - 1),
			"x-bails-chunk-total": String(totalChunks)
		}),
		body: bodyBytes.subarray((totalChunks - 1) * CHUNK_THRESHOLD$1)
	});
}
var _window$bails, CHUNK_THRESHOLD$1, RuntimeError, objectNames, clientId, customTransport, androidBridge;
function init_runtime() {
	return (init_runtime = __esmMin((() => {
		init_nanoid();
		init_environment();
		init_objectSpread2();
		;
		CHUNK_THRESHOLD$1 = 524288;
		RuntimeError = class extends Error {
			constructor(message, options) {
				super(message, options);
				this.name = "RuntimeError";
			}
		};
		objectNames = Object.freeze({
			Call: 0,
			Clipboard: 1,
			Application: 2,
			Events: 3,
			ContextMenu: 4,
			Dialog: 5,
			Window: 6,
			Screens: 7,
			System: 8,
			Browser: 9,
			CancelCall: 10,
			IOS: 11,
			Android: 12
		});
		clientId = nanoid();
		customTransport = null;
		androidBridge = hasDOM && typeof ((_window$bails = window.bails) === null || _window$bails === void 0 ? void 0 : _window$bails.invokeAsync) === "function" ? window.bails : null;
		if (androidBridge) {
			const pending = /* @__PURE__ */ new Map();
			window._bailsAndroidCallback = (id, response, error) => {
				const promise = pending.get(id);
				if (!promise) return;
				pending.delete(id);
				if (error) {
					promise.reject(new Error(error));
					return;
				}
				try {
					const envelope = JSON.parse(response !== null && response !== void 0 ? response : "{}");
					if (!envelope.ok) {
						var _envelope$error;
						promise.reject(new Error((_envelope$error = envelope.error) !== null && _envelope$error !== void 0 ? _envelope$error : "unknown runtime call error"));
						return;
					}
					promise.resolve("text" in envelope ? envelope.text : envelope.data);
				} catch (e) {
					promise.reject(e);
				}
			};
			customTransport = { call(objectID, method, windowName, args) {
				return new Promise((resolve, reject) => {
					const id = nanoid();
					pending.set(id, {
						resolve,
						reject
					});
					try {
						androidBridge.invokeAsync(id, JSON.stringify({
							object: objectID,
							method,
							windowName,
							args: args !== null && args !== void 0 ? args : null,
							clientId
						}));
					} catch (e) {
						pending.delete(id);
						reject(e);
					}
				});
			} };
		}
	})))();
}

// src/system.ts
var system_exports = /* @__PURE__ */ __exportAll({
	Capabilities: () => Capabilities,
	Environment: () => Environment,
	IsAMD64: () => IsAMD64,
	IsARM: () => IsARM,
	IsARM64: () => IsARM64,
	IsAndroid: () => IsAndroid,
	IsDarkMode: () => IsDarkMode,
	IsDebug: () => IsDebug,
	IsDesktop: () => IsDesktop,
	IsIOS: () => IsIOS,
	IsLinux: () => IsLinux,
	IsMac: () => IsMac,
	IsMobile: () => IsMobile,
	IsWindows: () => IsWindows,
	invoke: () => invoke
});
function invoke(msg) {
	_invoke === null || _invoke === void 0 || _invoke(msg);
}
function IsDarkMode() {
	return call$10(SystemIsDarkMode);
}
async function Capabilities() {
	return call$10(SystemCapabilities);
}
function Environment() {
	return call$10(SystemEnvironment);
}
function IsWindows() {
	var _window$_bails;
	return ((_window$_bails = window._bails) === null || _window$_bails === void 0 || (_window$_bails = _window$_bails.environment) === null || _window$_bails === void 0 ? void 0 : _window$_bails.OS) === "windows";
}
function IsLinux() {
	var _window$_bails2;
	return ((_window$_bails2 = window._bails) === null || _window$_bails2 === void 0 || (_window$_bails2 = _window$_bails2.environment) === null || _window$_bails2 === void 0 ? void 0 : _window$_bails2.OS) === "linux";
}
function IsMac() {
	var _window$_bails3;
	return ((_window$_bails3 = window._bails) === null || _window$_bails3 === void 0 || (_window$_bails3 = _window$_bails3.environment) === null || _window$_bails3 === void 0 ? void 0 : _window$_bails3.OS) === "darwin";
}
function IsIOS() {
	var _window$_bails4;
	return ((_window$_bails4 = window._bails) === null || _window$_bails4 === void 0 || (_window$_bails4 = _window$_bails4.environment) === null || _window$_bails4 === void 0 ? void 0 : _window$_bails4.OS) === "ios";
}
function IsAndroid() {
	var _window$_bails5;
	return ((_window$_bails5 = window._bails) === null || _window$_bails5 === void 0 || (_window$_bails5 = _window$_bails5.environment) === null || _window$_bails5 === void 0 ? void 0 : _window$_bails5.OS) === "android";
}
function IsMobile() {
	return IsIOS() || IsAndroid();
}
function IsDesktop() {
	return IsMac() || IsWindows() || IsLinux();
}
function IsAMD64() {
	var _window$_bails6;
	return ((_window$_bails6 = window._bails) === null || _window$_bails6 === void 0 || (_window$_bails6 = _window$_bails6.environment) === null || _window$_bails6 === void 0 ? void 0 : _window$_bails6.Arch) === "amd64";
}
function IsARM() {
	var _window$_bails7;
	return ((_window$_bails7 = window._bails) === null || _window$_bails7 === void 0 || (_window$_bails7 = _window$_bails7.environment) === null || _window$_bails7 === void 0 ? void 0 : _window$_bails7.Arch) === "arm";
}
function IsARM64() {
	var _window$_bails8;
	return ((_window$_bails8 = window._bails) === null || _window$_bails8 === void 0 || (_window$_bails8 = _window$_bails8.environment) === null || _window$_bails8 === void 0 ? void 0 : _window$_bails8.Arch) === "arm64";
}
function IsDebug() {
	var _window$_bails9;
	return Boolean((_window$_bails9 = window._bails) === null || _window$_bails9 === void 0 || (_window$_bails9 = _window$_bails9.environment) === null || _window$_bails9 === void 0 ? void 0 : _window$_bails9.Debug);
}
var call$10, SystemIsDarkMode, SystemEnvironment, SystemCapabilities, _invoke;
function init_system() {
	return (init_system = __esmMin((() => {
		init_runtime();
		call$10 = newRuntimeCaller(objectNames.System);
		SystemIsDarkMode = 0;
		SystemEnvironment = 1;
		SystemCapabilities = 2;
		_invoke = (function() {
			try {
				var _window$chrome, _window$webkit, _window$bails;
				if ((_window$chrome = window.chrome) === null || _window$chrome === void 0 || (_window$chrome = _window$chrome.webview) === null || _window$chrome === void 0 ? void 0 : _window$chrome.postMessage) return window.chrome.webview.postMessage.bind(window.chrome.webview);
				else if ((_window$webkit = window.webkit) === null || _window$webkit === void 0 || (_window$webkit = _window$webkit.messageHandlers) === null || _window$webkit === void 0 || (_window$webkit = _window$webkit["external"]) === null || _window$webkit === void 0 ? void 0 : _window$webkit.postMessage) return window.webkit.messageHandlers["external"].postMessage.bind(window.webkit.messageHandlers["external"]);
				else if ((_window$bails = window.bails) === null || _window$bails === void 0 ? void 0 : _window$bails.invoke) {
					const bridge = window.bails;
					return (msg) => bridge.invoke(typeof msg === "string" ? msg : JSON.stringify(msg));
				}
			} catch (e) {}
			console.warn("\n%c⚠️ Browser Environment Detected %c\n\n%cOnly UI previews are available in the browser. For full functionality, please run the application in desktop mode.\nMore information at: https://v3.wails.io/learn/build/#using-a-browser-for-development\n", "background: #ffffff; color: #000000; font-weight: bold; padding: 4px 8px; border-radius: 4px; border: 2px solid #000000;", "background: transparent;", "color: #ffffff; font-style: italic; font-weight: bold;");
			return null;
		})();
	})))();
}

// src/utils.ts
function debugLog(message) {
	console.log("%c bails %c " + message + " ", "background: #aa0000; color: #fff; border-radius: 3px 0px 0px 3px; padding: 1px; font-size: 0.7rem", "background: #009900; color: #fff; border-radius: 0px 3px 3px 0px; padding: 1px; font-size: 0.7rem");
}
function canTrackButtons() {
	return new MouseEvent("mousedown").buttons === 0;
}
function canAbortListeners() {
	if (!EventTarget || !AbortSignal || !AbortController) return false;
	let result = true;
	const target = new EventTarget();
	const controller = new AbortController();
	target.addEventListener("test", () => {
		result = false;
	}, { signal: controller.signal });
	controller.abort();
	target.dispatchEvent(new CustomEvent("test"));
	return result;
}
function eventTarget(event) {
	if (event.target instanceof HTMLElement) return event.target;
	else if (!(event.target instanceof HTMLElement) && event.target instanceof Node) {
		var _event$target$parentE;
		return (_event$target$parentE = event.target.parentElement) !== null && _event$target$parentE !== void 0 ? _event$target$parentE : document.body;
	} else return document.body;
}
function whenReady(callback) {
	if (isReady || document.readyState === "complete") callback();
	else document.addEventListener("DOMContentLoaded", callback);
}
var isReady;
function init_utils() {
	return (init_utils = __esmMin((() => {
		init_environment();
		isReady = false;
		if (hasDOM) document.addEventListener("DOMContentLoaded", () => {
			isReady = true;
		});
	})))();
}

// src/contextmenu.ts
function openContextMenu(id, x, y, data) {
	call$9(ContextMenuOpen, {
		id,
		x,
		y,
		data
	});
}
function contextMenuHandler(event) {
	const target = eventTarget(event);
	const customContextMenu = window.getComputedStyle(target).getPropertyValue("--custom-contextmenu").trim();
	if (customContextMenu) {
		event.preventDefault();
		const data = window.getComputedStyle(target).getPropertyValue("--custom-contextmenu-data");
		openContextMenu(customContextMenu, event.clientX, event.clientY, data);
	} else processDefaultContextMenu(event, target);
}
function processDefaultContextMenu(event, target) {
	if (IsDebug()) return;
	switch (window.getComputedStyle(target).getPropertyValue("--default-contextmenu").trim()) {
		case "show": return;
		case "hide":
			event.preventDefault();
			return;
	}
	if (target.isContentEditable) return;
	const selection = window.getSelection();
	const hasSelection = selection && selection.toString().length > 0;
	if (hasSelection) for (let i = 0; i < selection.rangeCount; i++) {
		const rects = selection.getRangeAt(i).getClientRects();
		for (let j = 0; j < rects.length; j++) {
			const rect = rects[j];
			if (document.elementFromPoint(rect.left, rect.top) === target) return;
		}
	}
	if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
		if (hasSelection || !target.readOnly && !target.disabled) return;
	}
	event.preventDefault();
}
var call$9, ContextMenuOpen;
function init_contextmenu() {
	return (init_contextmenu = __esmMin((() => {
		init_runtime();
		init_system();
		init_utils();
		init_environment();
		if (hasDOM) window.addEventListener("contextmenu", contextMenuHandler);
		call$9 = newRuntimeCaller(objectNames.ContextMenu);
		ContextMenuOpen = 0;
	})))();
}

// src/flags.ts
var flags_exports = /* @__PURE__ */ __exportAll({ GetFlag: () => GetFlag });
function GetFlag(key) {
	try {
		return window._bails.flags[key];
	} catch (e) {
		throw new Error("Unable to retrieve flag '" + key + "': " + e, { cause: e });
	}
}
function init_flags() {
	return (init_flags = __esmMin((() => {})))();
}

// src/drag.ts
function isMobile() {
	var _window$_bails;
	const os = (_window$_bails = window._bails) === null || _window$_bails === void 0 || (_window$_bails = _window$_bails.environment) === null || _window$_bails === void 0 ? void 0 : _window$_bails.OS;
	if (os === "ios" || os === "android") return true;
	const ua = navigator.userAgent || navigator.vendor || window.opera || "";
	return /android|iphone|ipad|ipod|iemobile|wpdesktop/i.test(ua);
}
function tryInitDragHandlers() {
	if (dragInitDone) return;
	if (isMobile()) return;
	window.addEventListener("mousedown", update, { capture: true });
	window.addEventListener("mousemove", update, { capture: true });
	window.addEventListener("mouseup", update, { capture: true });
	for (const ev of [
		"click",
		"contextmenu",
		"dblclick"
	]) window.addEventListener(ev, suppressEvent, { capture: true });
	dragInitDone = true;
}
function suppressEvent(event) {
	if (event.type === "dblclick" && IsMac() && window === window.top && isDraggableEvent(event)) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
		invoke("bails:drag:doubleclick");
		return;
	}
	if (dragging || resizing) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
	}
}
function isDraggableEvent(event) {
	const target = eventTarget(event);
	return window.getComputedStyle(target).getPropertyValue("--bails-draggable").trim() === "drag" && event.offsetX >= 0 && event.offsetX < target.clientWidth && event.offsetY >= 0 && event.offsetY < target.clientHeight;
}
function update(event) {
	let eventType, eventButtons = event.buttons;
	switch (event.type) {
		case "mousedown":
			eventType = MouseDown;
			if (!buttonsTracked) eventButtons = buttons | 1 << event.button;
			break;
		case "mouseup":
			eventType = MouseUp;
			if (!buttonsTracked) eventButtons = buttons & ~(1 << event.button);
			break;
		default:
			eventType = MouseMove;
			if (!buttonsTracked) eventButtons = buttons;
	}
	let released = buttons & ~eventButtons;
	let pressed = eventButtons & ~buttons;
	buttons = eventButtons;
	if (eventType === MouseDown && !(pressed & event.button)) {
		released |= 1 << event.button;
		pressed |= 1 << event.button;
	}
	if (eventType !== MouseMove && resizing || dragging && (eventType === MouseDown || event.button !== 0)) {
		event.stopImmediatePropagation();
		event.stopPropagation();
		event.preventDefault();
	}
	if (released & 1) primaryUp(event);
	if (pressed & 1) primaryDown(event);
	if (eventType === MouseMove) onMouseMove(event);
}
function primaryDown(event) {
	canDrag = false;
	canResize = false;
	if (!IsWindows()) {
		if (event.type === "mousedown" && event.button === 0 && event.detail !== 1) return;
	}
	if (resizeEdge) {
		if (event.type !== "mousedown") return;
		canResize = true;
		return;
	}
	canDrag = isDraggableEvent(event);
}
function primaryUp(event) {
	canDrag = false;
	dragging = false;
	canResize = false;
	resizing = false;
}
function setResize(edge) {
	if (edge) {
		if (!resizeEdge) defaultCursor = document.body.style.cursor;
		document.body.style.cursor = cursorForEdge[edge];
	} else if (!edge && resizeEdge) document.body.style.cursor = defaultCursor;
	resizeEdge = edge || "";
}
function onMouseMove(event) {
	if (canResize && resizeEdge) {
		resizing = true;
		invoke("bails:resize:" + resizeEdge);
	} else if (canDrag) {
		dragging = true;
		invoke("bails:drag");
	}
	if (dragging || resizing) {
		canDrag = canResize = false;
		return;
	}
	if (!resizable || !IsWindows() && !(IsLinux() && GetFlag("frameless"))) {
		if (resizeEdge) setResize();
		return;
	}
	const resizeHandleHeight = GetFlag("system.resizeHandleHeight") || 5;
	const resizeHandleWidth = GetFlag("system.resizeHandleWidth") || 5;
	const cornerExtra = GetFlag("resizeCornerExtra") || 10;
	const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
	const scrollbarHeight = Math.max(0, window.innerHeight - document.documentElement.clientHeight);
	const rightContentEdge = window.innerWidth - scrollbarWidth;
	const bottomContentEdge = window.innerHeight - scrollbarHeight;
	const rightBorder = event.clientX < rightContentEdge && rightContentEdge - event.clientX < resizeHandleWidth;
	const leftBorder = event.clientX < resizeHandleWidth;
	const topBorder = event.clientY < resizeHandleHeight;
	const bottomBorder = event.clientY < bottomContentEdge && bottomContentEdge - event.clientY < resizeHandleHeight;
	const rightCorner = event.clientX < rightContentEdge && rightContentEdge - event.clientX < resizeHandleWidth + cornerExtra;
	const leftCorner = event.clientX < resizeHandleWidth + cornerExtra;
	const topCorner = event.clientY < resizeHandleHeight + cornerExtra;
	const bottomCorner = event.clientY < bottomContentEdge && bottomContentEdge - event.clientY < resizeHandleHeight + cornerExtra;
	if (!leftCorner && !topCorner && !bottomCorner && !rightCorner) setResize();
	else if (rightCorner && bottomCorner) setResize("se-resize");
	else if (leftCorner && bottomCorner) setResize("sw-resize");
	else if (leftCorner && topCorner) setResize("nw-resize");
	else if (topCorner && rightCorner) setResize("ne-resize");
	else if (leftBorder) setResize("w-resize");
	else if (topBorder) setResize("n-resize");
	else if (bottomBorder) setResize("s-resize");
	else if (rightBorder) setResize("e-resize");
	else setResize();
}
var canDrag, dragging, resizable, canResize, resizing, resizeEdge, defaultCursor, buttons, buttonsTracked, dragInitDone, MouseDown, MouseUp, MouseMove, cursorForEdge;
function init_drag() {
	return (init_drag = __esmMin((() => {
		init_system();
		/* @__PURE__ */ init_flags();
		init_utils();
		init_environment();
		canDrag = false;
		dragging = false;
		resizable = false;
		canResize = false;
		resizing = false;
		resizeEdge = "";
		defaultCursor = "auto";
		buttons = 0;
		buttonsTracked = false;
		if (hasDOM) {
			buttonsTracked = canTrackButtons();
			window._bails = window._bails || {};
			window._bails.setResizable = (value) => {
				resizable = value;
				if (!resizable) {
					canResize = resizing = false;
					setResize();
				}
			};
		}
		dragInitDone = false;
		if (hasDOM) {
			tryInitDragHandlers();
			document.addEventListener("DOMContentLoaded", tryInitDragHandlers, { once: true });
			let dragEnvPolls = 0;
			const dragEnvPoll = window.setInterval(() => {
				if (dragInitDone) {
					window.clearInterval(dragEnvPoll);
					return;
				}
				tryInitDragHandlers();
				if (++dragEnvPolls > 100) window.clearInterval(dragEnvPoll);
			}, 50);
		}
		MouseDown = 0;
		MouseUp = 1;
		MouseMove = 2;
		cursorForEdge = Object.freeze({
			"se-resize": "nwse-resize",
			"sw-resize": "nesw-resize",
			"nw-resize": "nwse-resize",
			"ne-resize": "nesw-resize",
			"w-resize": "ew-resize",
			"n-resize": "ns-resize",
			"s-resize": "ns-resize",
			"e-resize": "ew-resize"
		});
	})))();
}

// src/appregion.ts
function normaliseRegionKind(value) {
	const region = value.trim().toLowerCase();
	if (validRegions.has(region)) return region;
}
function nonClientRegionForElement(element) {
	if (!(element instanceof HTMLElement)) return;
	const region = normaliseRegionKind(window.getComputedStyle(element).getPropertyValue(regionProperty));
	if (!region) return;
	const parent = element.parentElement;
	if (parent) {
		if (normaliseRegionKind(window.getComputedStyle(parent).getPropertyValue(regionProperty)) === region) return;
	}
	return region;
}
function isVisible(element) {
	const style = window.getComputedStyle(element);
	return style.display !== "none" && style.visibility !== "hidden" && style.contentVisibility !== "hidden";
}
function elementRegion(element) {
	if (!(element instanceof HTMLElement)) return;
	const kind = nonClientRegionForElement(element);
	if (!kind || !isVisible(element)) return;
	const rect = element.getBoundingClientRect();
	if (rect.width <= 0 || rect.height <= 0) return;
	const scale = window.devicePixelRatio || 1;
	const left = Math.floor(rect.left * scale);
	const top = Math.floor(rect.top * scale);
	const right = Math.ceil(rect.right * scale);
	const bottom = Math.ceil(rect.bottom * scale);
	if (right <= left || bottom <= top) return;
	return {
		kind,
		left,
		top,
		right,
		bottom
	};
}
function regionElements() {
	const elements = [];
	if (document.documentElement) elements.push(document.documentElement);
	if (document.body) {
		elements.push(document.body);
		for (const element of document.body.querySelectorAll("*")) elements.push(element);
	}
	return elements;
}
function observeRegionElements(elements) {
	var _resizeObserver;
	if (typeof ResizeObserver === "undefined") return;
	(_resizeObserver = resizeObserver) !== null && _resizeObserver !== void 0 || (resizeObserver = new ResizeObserver(scheduleUpdate));
	const nextElements = new Set(elements);
	for (const element of observedElements) if (!nextElements.has(element)) resizeObserver.unobserve(element);
	for (const element of nextElements) if (!observedElements.has(element)) resizeObserver.observe(element);
	observedElements = nextElements;
}
function updateNonClientRegions() {
	updatePending = false;
	const elements = regionElements();
	const regions = [];
	const activeElements = [];
	for (const element of elements) {
		const region = elementRegion(element);
		if (region) {
			regions.push(region);
			activeElements.push(element);
		}
	}
	observeRegionElements(activeElements);
	const payload = JSON.stringify({
		version: 1,
		regions
	});
	if (payload === lastPayload) return;
	lastPayload = payload;
	invoke("bails:non-client-region:" + payload);
}
function scheduleUpdate() {
	if (updatePending) return;
	updatePending = true;
	window.requestAnimationFrame(updateNonClientRegions);
}
function startNonClientRegionTracking() {
	var _window$visualViewpor, _window$visualViewpor2;
	if (trackingStarted) return;
	trackingStarted = true;
	scheduleUpdate();
	new MutationObserver(scheduleUpdate).observe(document.documentElement, {
		attributes: true,
		childList: true,
		subtree: true
	});
	window.addEventListener("resize", scheduleUpdate);
	window.addEventListener("scroll", scheduleUpdate, true);
	(_window$visualViewpor = window.visualViewport) === null || _window$visualViewpor === void 0 || _window$visualViewpor.addEventListener("resize", scheduleUpdate);
	(_window$visualViewpor2 = window.visualViewport) === null || _window$visualViewpor2 === void 0 || _window$visualViewpor2.addEventListener("scroll", scheduleUpdate);
}
function tryStartNonClientRegionTracking() {
	var _window$_bails$enviro, _window$_bails$flags;
	const os = (_window$_bails$enviro = window._bails.environment) === null || _window$_bails$enviro === void 0 ? void 0 : _window$_bails$enviro.OS;
	if (os === void 0) return false;
	const enabled = (_window$_bails$flags = window._bails.flags) === null || _window$_bails$flags === void 0 ? void 0 : _window$_bails$flags.nonClientRegionTracking;
	if (os === "windows") {
		if (enabled === true) whenReady(startNonClientRegionTracking);
		return true;
	}
	return true;
}
var regionProperty, runtimeConfigReadyEvent, validRegions, updatePending, lastPayload, observedElements, resizeObserver, trackingStarted;
function init_appregion() {
	return (init_appregion = __esmMin((() => {
		init_system();
		init_utils();
		init_environment();
		regionProperty = "--bails-non-client-region";
		runtimeConfigReadyEvent = "bails:runtime-config-ready";
		validRegions = /* @__PURE__ */ new Set([
			"caption",
			"minimize",
			"maximize",
			"close"
		]);
		if (hasDOM) window._bails = window._bails || {};
		updatePending = false;
		lastPayload = "";
		observedElements = /* @__PURE__ */ new Set();
		;
		trackingStarted = false;
		if (hasDOM && !tryStartNonClientRegionTracking()) window.addEventListener(runtimeConfigReadyEvent, tryStartNonClientRegionTracking, { once: true });
	})))();
}

// src/application.ts
var application_exports = /* @__PURE__ */ __exportAll({
	Hide: () => Hide,
	Quit: () => Quit,
	Show: () => Show
});
function Hide() {
	return call$8(HideMethod$1);
}
function Show() {
	return call$8(ShowMethod$1);
}
function Quit() {
	return call$8(QuitMethod);
}
var call$8, HideMethod$1, ShowMethod$1, QuitMethod;
function init_application() {
	return (init_application = __esmMin((() => {
		init_runtime();
		call$8 = newRuntimeCaller(objectNames.Application);
		HideMethod$1 = 0;
		ShowMethod$1 = 1;
		QuitMethod = 2;
	})))();
}

// src/browser.ts
var browser_exports = /* @__PURE__ */ __exportAll({ OpenURL: () => OpenURL });
function OpenURL(url) {
	return call$7(BrowserOpenURL, { url: url.toString() });
}
var call$7, BrowserOpenURL;
function init_browser() {
	return (init_browser = __esmMin((() => {
		init_runtime();
		call$7 = newRuntimeCaller(objectNames.Browser);
		BrowserOpenURL = 0;
	})))();
}

// src/callable.ts
function isCallableRefApply(value) {
	if (isDDA(value)) return true;
	if (!value) return false;
	if (typeof value !== "function" && typeof value !== "object") return false;
	try {
		reflectApply(value, null, badArrayLike);
	} catch (e) {
		if (e !== isCallableMarker) return false;
	}
	return !isES6ClassFn(value) && tryFunctionObject(value);
}
function isCallableNoRefApply(value) {
	if (isDDA(value)) return true;
	if (!value) return false;
	if (typeof value !== "function" && typeof value !== "object") return false;
	if (hasToStringTag) return tryFunctionObject(value);
	if (isES6ClassFn(value)) return false;
	var strClass = toStr.call(value);
	if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) return false;
	return tryFunctionObject(value);
}
var fnToStr, reflectApply, badArrayLike, isCallableMarker, constructorRegex, isES6ClassFn, tryFunctionObject, toStr, objectClass, fnClass, genClass, ddaClass, ddaClass2, ddaClass3, hasToStringTag, isIE68, isDDA, all, callable_default;
function init_callable() {
	return (init_callable = __esmMin((() => {
		fnToStr = Function.prototype.toString;
		reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
		;
		;
		if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") try {
			badArrayLike = Object.defineProperty({}, "length", { get: function() {
				throw isCallableMarker;
			} });
			isCallableMarker = {};
			reflectApply(function() {
				throw 42;
			}, null, badArrayLike);
		} catch (_) {
			if (_ !== isCallableMarker) reflectApply = null;
		}
		else reflectApply = null;
		constructorRegex = /^\s*class\b/;
		isES6ClassFn = function isES6ClassFunction(value) {
			try {
				var fnStr = fnToStr.call(value);
				return constructorRegex.test(fnStr);
			} catch (e) {
				return false;
			}
		};
		tryFunctionObject = function tryFunctionToStr(value) {
			try {
				if (isES6ClassFn(value)) return false;
				fnToStr.call(value);
				return true;
			} catch (e) {
				return false;
			}
		};
		toStr = Object.prototype.toString;
		objectClass = "[object Object]";
		fnClass = "[object Function]";
		genClass = "[object GeneratorFunction]";
		ddaClass = "[object HTMLAllCollection]";
		ddaClass2 = "[object HTML document.all class]";
		ddaClass3 = "[object HTMLCollection]";
		hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
		isIE68 = !(0 in [,]);
		isDDA = function isDocumentDotAll() {
			return false;
		};
		if (typeof document === "object") {
			all = document.all;
			if (toStr.call(all) === toStr.call(document.all)) isDDA = function isDocumentDotAll(value) {
				if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) try {
					var str = toStr.call(value);
					return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
				} catch (e) {}
				return false;
			};
		}
		callable_default = reflectApply ? isCallableRefApply : isCallableNoRefApply;
	})))();
}

// src/cancellable.ts
function cancellerFor(promise, state) {
	let cancellationPromise = void 0;
	return (reason) => {
		if (!state.settled) {
			state.settled = true;
			state.reason = reason;
			promise.reject(reason);
			Promise.prototype.then.call(promise.promise, void 0, (err) => {
				if (err !== reason) throw err;
			});
		}
		if (!state.reason || !promise.oncancelled) return;
		cancellationPromise = new Promise((resolve) => {
			try {
				resolve(promise.oncancelled(state.reason.cause));
			} catch (err) {
				Promise.reject(new CancelledRejectionError(promise.promise, err, "Unhandled exception in oncancelled callback."));
			}
		}).catch((reason) => {
			Promise.reject(new CancelledRejectionError(promise.promise, reason, "Unhandled rejection in oncancelled callback."));
		});
		promise.oncancelled = null;
		return cancellationPromise;
	};
}
function resolverFor(promise, state) {
	return (value) => {
		if (state.resolving) return;
		state.resolving = true;
		if (value === promise.promise) {
			if (state.settled) return;
			state.settled = true;
			promise.reject(/* @__PURE__ */ new TypeError("A promise cannot be resolved with itself."));
			return;
		}
		if (value != null && (typeof value === "object" || typeof value === "function")) {
			let then;
			try {
				then = value.then;
			} catch (err) {
				state.settled = true;
				promise.reject(err);
				return;
			}
			if (callable_default(then)) {
				try {
					let cancel = value.cancel;
					if (callable_default(cancel)) {
						const oncancelled = (cause) => {
							Reflect.apply(cancel, value, [cause]);
						};
						if (state.reason) cancellerFor(_objectSpread2(_objectSpread2({}, promise), {}, { oncancelled }), state)(state.reason);
						else promise.oncancelled = oncancelled;
					}
				} catch (_unused) {}
				const newState = {
					root: state.root,
					resolving: false,
					get settled() {
						return this.root.settled;
					},
					set settled(value) {
						this.root.settled = value;
					},
					get reason() {
						return this.root.reason;
					}
				};
				const rejector = rejectorFor(promise, newState);
				try {
					Reflect.apply(then, value, [resolverFor(promise, newState), rejector]);
				} catch (err) {
					rejector(err);
				}
				return;
			}
		}
		if (state.settled) return;
		state.settled = true;
		promise.resolve(value);
	};
}
function rejectorFor(promise, state) {
	return (reason) => {
		if (state.resolving) return;
		state.resolving = true;
		if (state.settled) {
			try {
				if (reason instanceof CancelError && state.reason instanceof CancelError && Object.is(reason.cause, state.reason.cause)) return;
			} catch (_unused2) {}
			Promise.reject(new CancelledRejectionError(promise.promise, reason));
		} else {
			state.settled = true;
			promise.reject(reason);
		}
	};
}
function cancelAll(parent, values, cause) {
	const results = [];
	for (const value of values) {
		let cancel;
		try {
			if (!callable_default(value.then)) continue;
			cancel = value.cancel;
			if (!callable_default(cancel)) continue;
		} catch (_unused3) {
			continue;
		}
		let result;
		try {
			result = Reflect.apply(cancel, value, [cause]);
		} catch (err) {
			Promise.reject(new CancelledRejectionError(parent, err, "Unhandled exception in cancel method."));
			continue;
		}
		if (!result) continue;
		results.push((result instanceof Promise ? result : Promise.resolve(result)).catch((reason) => {
			Promise.reject(new CancelledRejectionError(parent, reason, "Unhandled rejection in cancel method."));
		}));
	}
	return Promise.all(results);
}
function identity(x) {
	return x;
}
function thrower(reason) {
	throw reason;
}
function errorMessage(err) {
	try {
		if (err instanceof Error || typeof err !== "object" || err.toString !== Object.prototype.toString) return "" + err;
	} catch (_unused4) {}
	try {
		return JSON.stringify(err);
	} catch (_unused5) {}
	try {
		return Object.prototype.toString.call(err);
	} catch (_unused6) {}
	return "<could not convert error to string>";
}
function currentBarrier(promise) {
	var _promise$barrierSym;
	let pwr = (_promise$barrierSym = promise[barrierSym]) !== null && _promise$barrierSym !== void 0 ? _promise$barrierSym : {};
	if (!("promise" in pwr)) Object.assign(pwr, promiseWithResolvers());
	if (promise[barrierSym] == null) {
		pwr.resolve();
		promise[barrierSym] = pwr;
	}
	return pwr.promise;
}
var _Symbol$species, CancelError, CancelledRejectionError, barrierSym, cancelImplSym, species, CancellablePromise, promiseWithResolvers;
function init_cancellable() {
	return (init_cancellable = __esmMin((() => {
		init_callable();
		init_objectSpread2();
		;
		CancelError = class extends Error {
			constructor(message, options) {
				super(message, options);
				this.name = "CancelError";
			}
		};
		CancelledRejectionError = class extends Error {
			constructor(promise, reason, info) {
				super((info !== null && info !== void 0 ? info : "Unhandled rejection in cancelled promise.") + " Reason: " + errorMessage(reason), { cause: reason });
				this.promise = promise;
				this.name = "CancelledRejectionError";
			}
		};
		barrierSym = Symbol("barrier");
		cancelImplSym = Symbol("cancelImpl");
		species = (_Symbol$species = Symbol.species) !== null && _Symbol$species !== void 0 ? _Symbol$species : Symbol("speciesPolyfill");
		CancellablePromise = class CancellablePromise extends Promise {
			constructor(executor, oncancelled) {
				let resolve;
				let reject;
				super((res, rej) => {
					resolve = res;
					reject = rej;
				});
				if (this.constructor[species] !== Promise) throw new TypeError("CancellablePromise does not support transparent subclassing. Please refrain from overriding the [Symbol.species] static property.");
				let promise = {
					promise: this,
					resolve,
					reject,
					get oncancelled() {
						var _oncancelled;
						return (_oncancelled = oncancelled) !== null && _oncancelled !== void 0 ? _oncancelled : null;
					},
					set oncancelled(cb) {
						oncancelled = cb !== null && cb !== void 0 ? cb : void 0;
					}
				};
				const state = {
					get root() {
						return state;
					},
					resolving: false,
					settled: false
				};
				Object.defineProperties(this, {
					[barrierSym]: {
						configurable: false,
						enumerable: false,
						writable: true,
						value: null
					},
					[cancelImplSym]: {
						configurable: false,
						enumerable: false,
						writable: false,
						value: cancellerFor(promise, state)
					}
				});
				const rejector = rejectorFor(promise, state);
				try {
					executor(resolverFor(promise, state), rejector);
				} catch (err) {
					if (state.resolving) console.log("Unhandled exception in CancellablePromise executor.", err);
					else rejector(err);
				}
			}
			cancel(cause) {
				return new CancellablePromise((resolve) => {
					Promise.all([this[cancelImplSym](new CancelError("Promise cancelled.", { cause })), currentBarrier(this)]).then(() => resolve(), () => resolve());
				});
			}
			cancelOn(signal) {
				if (signal.aborted) this.cancel(signal.reason);
				else signal.addEventListener("abort", () => void this.cancel(signal.reason), { capture: true });
				return this;
			}
			then(onfulfilled, onrejected, oncancelled) {
				if (!(this instanceof CancellablePromise)) throw new TypeError("CancellablePromise.prototype.then called on an invalid object.");
				if (!callable_default(onfulfilled)) onfulfilled = identity;
				if (!callable_default(onrejected)) onrejected = thrower;
				if (onfulfilled === identity && onrejected == thrower) return new CancellablePromise((resolve) => resolve(this));
				const barrier = {};
				this[barrierSym] = barrier;
				return new CancellablePromise((resolve, reject) => {
					super.then((value) => {
						var _barrier$resolve;
						if (this[barrierSym] === barrier) this[barrierSym] = null;
						(_barrier$resolve = barrier.resolve) === null || _barrier$resolve === void 0 || _barrier$resolve.call(barrier);
						try {
							resolve(onfulfilled(value));
						} catch (err) {
							reject(err);
						}
					}, (reason) => {
						var _barrier$resolve2;
						if (this[barrierSym] === barrier) this[barrierSym] = null;
						(_barrier$resolve2 = barrier.resolve) === null || _barrier$resolve2 === void 0 || _barrier$resolve2.call(barrier);
						try {
							resolve(onrejected(reason));
						} catch (err) {
							reject(err);
						}
					});
				}, async (cause) => {
					try {
						return oncancelled === null || oncancelled === void 0 ? void 0 : oncancelled(cause);
					} finally {
						await this.cancel(cause);
					}
				});
			}
			catch(onrejected, oncancelled) {
				return this.then(void 0, onrejected, oncancelled);
			}
			finally(onfinally, oncancelled) {
				if (!(this instanceof CancellablePromise)) throw new TypeError("CancellablePromise.prototype.finally called on an invalid object.");
				if (!callable_default(onfinally)) return this.then(onfinally, onfinally, oncancelled);
				return this.then((value) => CancellablePromise.resolve(onfinally()).then(() => value), (reason) => CancellablePromise.resolve(onfinally()).then(() => {
					throw reason;
				}), oncancelled);
			}
			static get [species]() {
				return Promise;
			}
			static all(values) {
				let collected = Array.from(values);
				const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
					Promise.all(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static allSettled(values) {
				let collected = Array.from(values);
				const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
					Promise.allSettled(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static any(values) {
				let collected = Array.from(values);
				const promise = collected.length === 0 ? CancellablePromise.resolve(collected) : new CancellablePromise((resolve, reject) => {
					Promise.any(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static race(values) {
				let collected = Array.from(values);
				const promise = new CancellablePromise((resolve, reject) => {
					Promise.race(collected).then(resolve, reject);
				}, (cause) => cancelAll(promise, collected, cause));
				return promise;
			}
			static cancel(cause) {
				const p = new CancellablePromise(() => {});
				p.cancel(cause);
				return p;
			}
			static timeout(milliseconds, cause) {
				const promise = new CancellablePromise(() => {});
				if (AbortSignal && typeof AbortSignal === "function" && AbortSignal.timeout && typeof AbortSignal.timeout === "function") AbortSignal.timeout(milliseconds).addEventListener("abort", () => void promise.cancel(cause));
				else setTimeout(() => void promise.cancel(cause), milliseconds);
				return promise;
			}
			static sleep(milliseconds, value) {
				return new CancellablePromise((resolve) => {
					setTimeout(() => resolve(value), milliseconds);
				});
			}
			static reject(reason) {
				return new CancellablePromise((_, reject) => reject(reason));
			}
			static resolve(value) {
				if (value instanceof CancellablePromise) return value;
				return new CancellablePromise((resolve) => resolve(value));
			}
			static withResolvers() {
				let result = { oncancelled: null };
				result.promise = new CancellablePromise((resolve, reject) => {
					result.resolve = resolve;
					result.reject = reject;
				}, (cause) => {
					var _result$oncancelled;
					(_result$oncancelled = result.oncancelled) === null || _result$oncancelled === void 0 || _result$oncancelled.call(result, cause);
				});
				return result;
			}
		};
		promiseWithResolvers = Promise.withResolvers;
		if (promiseWithResolvers && typeof promiseWithResolvers === "function") promiseWithResolvers = promiseWithResolvers.bind(Promise);
		else promiseWithResolvers = function() {
			let resolve;
			let reject;
			return {
				promise: new Promise((res, rej) => {
					resolve = res;
					reject = rej;
				}),
				resolve,
				reject
			};
		};
	})))();
}

// src/calls.ts
var calls_exports = /* @__PURE__ */ __exportAll({
	ByID: () => ByID,
	ByName: () => ByName,
	Call: () => Call,
	RuntimeError: () => RuntimeError
});
function generateID() {
	let result;
	do
		result = nanoid();
	while (callResponses.has(result));
	return result;
}
function Call(options) {
	const id = generateID();
	const result = CancellablePromise.withResolvers();
	callResponses.set(id, {
		resolve: result.resolve,
		reject: result.reject
	});
	const request = call$6(CallBinding, Object.assign({ "call-id": id }, options));
	let running = true;
	request.then((res) => {
		running = false;
		callResponses.delete(id);
		result.resolve(res);
	}, (err) => {
		running = false;
		callResponses.delete(id);
		result.reject(err);
	});
	const cancel = () => {
		callResponses.delete(id);
		return cancelCall(CancelMethod, { "call-id": id }).catch((err) => {
			console.error("Error while requesting binding call cancellation:", err);
		});
	};
	result.oncancelled = () => {
		if (running) return cancel();
		else return request.then(cancel);
	};
	return result.promise;
}
function ByName(methodName, ...args) {
	return Call({
		methodName,
		args
	});
}
function ByID(methodID, ...args) {
	return Call({
		methodID,
		args
	});
}
var call$6, cancelCall, callResponses, CallBinding, CancelMethod;
function init_calls() {
	return (init_calls = __esmMin((() => {
		init_cancellable();
		init_runtime();
		init_nanoid();
		init_environment();
		if (hasDOM) window._bails = window._bails || {};
		call$6 = newRuntimeCaller(objectNames.Call);
		cancelCall = newRuntimeCaller(objectNames.CancelCall);
		callResponses = /* @__PURE__ */ new Map();
		CallBinding = 0;
		CancelMethod = 0;
	})))();
}

// src/clipboard.ts
var clipboard_exports = /* @__PURE__ */ __exportAll({
	SetText: () => SetText,
	Text: () => Text
});
function SetText(text) {
	return call$5(ClipboardSetText, { text });
}
function Text() {
	return call$5(ClipboardText);
}
var call$5, ClipboardSetText, ClipboardText;
function init_clipboard() {
	return (init_clipboard = __esmMin((() => {
		init_runtime();
		call$5 = newRuntimeCaller(objectNames.Clipboard);
		ClipboardSetText = 0;
		ClipboardText = 1;
	})))();
}

// src/create.ts
var create_exports = /* @__PURE__ */ __exportAll({
	Any: () => Any,
	Array: () => Array$1,
	ByteSlice: () => ByteSlice,
	DateFromTime: () => DateFromTime,
	Events: () => Events$1,
	Map: () => Map$1,
	Nullable: () => Nullable,
	Struct: () => Struct
});
function Any(source) {
	return source;
}
function ByteSlice(source) {
	return source == null ? "" : source;
}
function Array$1(element) {
	if (element === Any) return (source) => source === null ? [] : source;
	return (source) => {
		if (source === null) return [];
		for (let i = 0; i < source.length; i++) source[i] = element(source[i]);
		return source;
	};
}
function Map$1(key, value) {
	if (value === Any) return (source) => source === null ? {} : source;
	return (source) => {
		if (source === null) return {};
		for (const key in source) source[key] = value(source[key]);
		return source;
	};
}
function Nullable(element) {
	if (element === Any) return Any;
	return (source) => source === null ? null : element(source);
}
function Struct(createField) {
	let allAny = true;
	for (const name in createField) if (createField[name] !== Any) {
		allAny = false;
		break;
	}
	if (allAny) return Any;
	return (source) => {
		for (const name in createField) if (name in source) source[name] = createField[name](source[name]);
		return source;
	};
}
function DateFromTime(source) {
	return new Date(source);
}
var Events$1;
function init_create() {
	return (init_create = __esmMin((() => {
		Events$1 = {};
	})))();
}

// src/dialogs.ts
var dialogs_exports = /* @__PURE__ */ __exportAll({
	Error: () => Error$1,
	Info: () => Info,
	OpenFile: () => OpenFile,
	Question: () => Question,
	SaveFile: () => SaveFile,
	Warning: () => Warning
});
function dialog(type, options = {}) {
	return call$4(type, options);
}
function Info(options) {
	return dialog(DialogInfo, options);
}
function Warning(options) {
	return dialog(DialogWarning, options);
}
function Error$1(options) {
	return dialog(DialogError, options);
}
function Question(options) {
	return dialog(DialogQuestion, options);
}
function OpenFile(options) {
	var _dialog;
	return (_dialog = dialog(DialogOpenFile, options)) !== null && _dialog !== void 0 ? _dialog : [];
}
function SaveFile(options) {
	return dialog(DialogSaveFile, options);
}
var call$4, DialogInfo, DialogWarning, DialogError, DialogQuestion, DialogOpenFile, DialogSaveFile;
function init_dialogs() {
	return (init_dialogs = __esmMin((() => {
		init_runtime();
		init_environment();
		if (hasDOM) window._bails = window._bails || {};
		call$4 = newRuntimeCaller(objectNames.Dialog);
		DialogInfo = 0;
		DialogWarning = 1;
		DialogError = 2;
		DialogQuestion = 3;
		DialogOpenFile = 4;
		DialogSaveFile = 5;
	})))();
}

// src/listener.ts
function listenerOff(listener) {
	let listeners = eventListeners.get(listener.eventName);
	if (!listeners) return;
	listeners = listeners.filter((l) => l !== listener);
	if (listeners.length === 0) eventListeners.delete(listener.eventName);
	else eventListeners.set(listener.eventName, listeners);
}
var eventListeners, Listener;
function init_listener() {
	return (init_listener = __esmMin((() => {
		eventListeners = /* @__PURE__ */ new Map();
		Listener = class {
			constructor(eventName, callback, maxCallbacks) {
				this.eventName = eventName;
				this.callback = callback;
				this.maxCallbacks = maxCallbacks || -1;
			}
			dispatch(data) {
				try {
					this.callback(data);
				} catch (err) {
					console.error(err);
				}
				if (this.maxCallbacks === -1) return false;
				this.maxCallbacks -= 1;
				return this.maxCallbacks === 0;
			}
		};
	})))();
}

// src/event_types.ts
var Types;
function init_event_types() {
	return (init_event_types = __esmMin((() => {
		Types = Object.freeze({
			Windows: Object.freeze({
				APMPowerSettingChange: "windows:APMPowerSettingChange",
				APMPowerStatusChange: "windows:APMPowerStatusChange",
				APMResumeAutomatic: "windows:APMResumeAutomatic",
				APMResumeSuspend: "windows:APMResumeSuspend",
				APMSuspend: "windows:APMSuspend",
				ApplicationStarted: "windows:ApplicationStarted",
				SystemThemeChanged: "windows:SystemThemeChanged",
				WebViewNavigationCompleted: "windows:WebViewNavigationCompleted",
				WindowActive: "windows:WindowActive",
				WindowBackgroundErase: "windows:WindowBackgroundErase",
				WindowClickActive: "windows:WindowClickActive",
				WindowClosing: "windows:WindowClosing",
				WindowDidMove: "windows:WindowDidMove",
				WindowDidResize: "windows:WindowDidResize",
				WindowDPIChanged: "windows:WindowDPIChanged",
				WindowDragDrop: "windows:WindowDragDrop",
				WindowDragEnter: "windows:WindowDragEnter",
				WindowDragLeave: "windows:WindowDragLeave",
				WindowDragOver: "windows:WindowDragOver",
				WindowEndMove: "windows:WindowEndMove",
				WindowEndResize: "windows:WindowEndResize",
				WindowFullscreen: "windows:WindowFullscreen",
				WindowHide: "windows:WindowHide",
				WindowInactive: "windows:WindowInactive",
				WindowKeyDown: "windows:WindowKeyDown",
				WindowKeyUp: "windows:WindowKeyUp",
				WindowKillFocus: "windows:WindowKillFocus",
				WindowNonClientHit: "windows:WindowNonClientHit",
				WindowNonClientMouseDown: "windows:WindowNonClientMouseDown",
				WindowNonClientMouseLeave: "windows:WindowNonClientMouseLeave",
				WindowNonClientMouseMove: "windows:WindowNonClientMouseMove",
				WindowNonClientMouseUp: "windows:WindowNonClientMouseUp",
				WindowPaint: "windows:WindowPaint",
				WindowRestore: "windows:WindowRestore",
				WindowSetFocus: "windows:WindowSetFocus",
				WindowShow: "windows:WindowShow",
				WindowStartMove: "windows:WindowStartMove",
				WindowStartResize: "windows:WindowStartResize",
				WindowUnFullscreen: "windows:WindowUnFullscreen",
				WindowZOrderChanged: "windows:WindowZOrderChanged",
				WindowMinimise: "windows:WindowMinimise",
				WindowUnMinimise: "windows:WindowUnMinimise",
				WindowMaximise: "windows:WindowMaximise",
				WindowUnMaximise: "windows:WindowUnMaximise"
			}),
			Mac: Object.freeze({
				ApplicationDidBecomeActive: "mac:ApplicationDidBecomeActive",
				ApplicationDidChangeBackingProperties: "mac:ApplicationDidChangeBackingProperties",
				ApplicationDidChangeEffectiveAppearance: "mac:ApplicationDidChangeEffectiveAppearance",
				ApplicationDidChangeIcon: "mac:ApplicationDidChangeIcon",
				ApplicationDidChangeOcclusionState: "mac:ApplicationDidChangeOcclusionState",
				ApplicationDidChangeScreenParameters: "mac:ApplicationDidChangeScreenParameters",
				ApplicationDidChangeStatusBarFrame: "mac:ApplicationDidChangeStatusBarFrame",
				ApplicationDidChangeStatusBarOrientation: "mac:ApplicationDidChangeStatusBarOrientation",
				ApplicationDidChangeTheme: "mac:ApplicationDidChangeTheme",
				ApplicationDidFinishLaunching: "mac:ApplicationDidFinishLaunching",
				ApplicationDidHide: "mac:ApplicationDidHide",
				ApplicationDidResignActive: "mac:ApplicationDidResignActive",
				ApplicationDidUnhide: "mac:ApplicationDidUnhide",
				ApplicationDidUpdate: "mac:ApplicationDidUpdate",
				ApplicationDidWake: "mac:ApplicationDidWake",
				ApplicationScreensDidSleep: "mac:ApplicationScreensDidSleep",
				ApplicationScreensDidWake: "mac:ApplicationScreensDidWake",
				ApplicationShouldHandleReopen: "mac:ApplicationShouldHandleReopen",
				ApplicationWillBecomeActive: "mac:ApplicationWillBecomeActive",
				ApplicationWillFinishLaunching: "mac:ApplicationWillFinishLaunching",
				ApplicationWillHide: "mac:ApplicationWillHide",
				ApplicationWillResignActive: "mac:ApplicationWillResignActive",
				ApplicationWillSleep: "mac:ApplicationWillSleep",
				ApplicationWillTerminate: "mac:ApplicationWillTerminate",
				ApplicationWillUnhide: "mac:ApplicationWillUnhide",
				ApplicationWillUpdate: "mac:ApplicationWillUpdate",
				MenuDidAddItem: "mac:MenuDidAddItem",
				MenuDidBeginTracking: "mac:MenuDidBeginTracking",
				MenuDidClose: "mac:MenuDidClose",
				MenuDidDisplayItem: "mac:MenuDidDisplayItem",
				MenuDidEndTracking: "mac:MenuDidEndTracking",
				MenuDidHighlightItem: "mac:MenuDidHighlightItem",
				MenuDidOpen: "mac:MenuDidOpen",
				MenuDidPopUp: "mac:MenuDidPopUp",
				MenuDidRemoveItem: "mac:MenuDidRemoveItem",
				MenuDidSendAction: "mac:MenuDidSendAction",
				MenuDidSendActionToItem: "mac:MenuDidSendActionToItem",
				MenuDidUpdate: "mac:MenuDidUpdate",
				MenuWillAddItem: "mac:MenuWillAddItem",
				MenuWillBeginTracking: "mac:MenuWillBeginTracking",
				MenuWillDisplayItem: "mac:MenuWillDisplayItem",
				MenuWillEndTracking: "mac:MenuWillEndTracking",
				MenuWillHighlightItem: "mac:MenuWillHighlightItem",
				MenuWillOpen: "mac:MenuWillOpen",
				MenuWillPopUp: "mac:MenuWillPopUp",
				MenuWillRemoveItem: "mac:MenuWillRemoveItem",
				MenuWillSendAction: "mac:MenuWillSendAction",
				MenuWillSendActionToItem: "mac:MenuWillSendActionToItem",
				MenuWillUpdate: "mac:MenuWillUpdate",
				WebViewDidCommitNavigation: "mac:WebViewDidCommitNavigation",
				WebViewDidFinishNavigation: "mac:WebViewDidFinishNavigation",
				WebViewDidReceiveServerRedirectForProvisionalNavigation: "mac:WebViewDidReceiveServerRedirectForProvisionalNavigation",
				WebViewDidStartProvisionalNavigation: "mac:WebViewDidStartProvisionalNavigation",
				WindowDidBecomeKey: "mac:WindowDidBecomeKey",
				WindowDidBecomeMain: "mac:WindowDidBecomeMain",
				WindowDidBeginSheet: "mac:WindowDidBeginSheet",
				WindowDidChangeAlpha: "mac:WindowDidChangeAlpha",
				WindowDidChangeBackingLocation: "mac:WindowDidChangeBackingLocation",
				WindowDidChangeBackingProperties: "mac:WindowDidChangeBackingProperties",
				WindowDidChangeCollectionBehavior: "mac:WindowDidChangeCollectionBehavior",
				WindowDidChangeEffectiveAppearance: "mac:WindowDidChangeEffectiveAppearance",
				WindowDidChangeOcclusionState: "mac:WindowDidChangeOcclusionState",
				WindowDidChangeOrderingMode: "mac:WindowDidChangeOrderingMode",
				WindowDidChangeScreen: "mac:WindowDidChangeScreen",
				WindowDidChangeScreenParameters: "mac:WindowDidChangeScreenParameters",
				WindowDidChangeScreenProfile: "mac:WindowDidChangeScreenProfile",
				WindowDidChangeScreenSpace: "mac:WindowDidChangeScreenSpace",
				WindowDidChangeScreenSpaceProperties: "mac:WindowDidChangeScreenSpaceProperties",
				WindowDidChangeSharingType: "mac:WindowDidChangeSharingType",
				WindowDidChangeSpace: "mac:WindowDidChangeSpace",
				WindowDidChangeSpaceOrderingMode: "mac:WindowDidChangeSpaceOrderingMode",
				WindowDidChangeTitle: "mac:WindowDidChangeTitle",
				WindowDidChangeToolbar: "mac:WindowDidChangeToolbar",
				WindowDidDeminiaturize: "mac:WindowDidDeminiaturize",
				WindowDidEndSheet: "mac:WindowDidEndSheet",
				WindowDidEnterFullScreen: "mac:WindowDidEnterFullScreen",
				WindowDidEnterVersionBrowser: "mac:WindowDidEnterVersionBrowser",
				WindowDidExitFullScreen: "mac:WindowDidExitFullScreen",
				WindowDidExitVersionBrowser: "mac:WindowDidExitVersionBrowser",
				WindowDidExpose: "mac:WindowDidExpose",
				WindowDidFocus: "mac:WindowDidFocus",
				WindowDidMiniaturize: "mac:WindowDidMiniaturize",
				WindowDidMove: "mac:WindowDidMove",
				WindowDidOrderOffScreen: "mac:WindowDidOrderOffScreen",
				WindowDidOrderOnScreen: "mac:WindowDidOrderOnScreen",
				WindowDidResignKey: "mac:WindowDidResignKey",
				WindowDidResignMain: "mac:WindowDidResignMain",
				WindowDidResize: "mac:WindowDidResize",
				WindowDidUpdate: "mac:WindowDidUpdate",
				WindowDidUpdateAlpha: "mac:WindowDidUpdateAlpha",
				WindowDidUpdateCollectionBehavior: "mac:WindowDidUpdateCollectionBehavior",
				WindowDidUpdateCollectionProperties: "mac:WindowDidUpdateCollectionProperties",
				WindowDidUpdateShadow: "mac:WindowDidUpdateShadow",
				WindowDidUpdateTitle: "mac:WindowDidUpdateTitle",
				WindowDidUpdateToolbar: "mac:WindowDidUpdateToolbar",
				WindowDidZoom: "mac:WindowDidZoom",
				WindowFileDraggingEntered: "mac:WindowFileDraggingEntered",
				WindowFileDraggingExited: "mac:WindowFileDraggingExited",
				WindowFileDraggingPerformed: "mac:WindowFileDraggingPerformed",
				WindowHide: "mac:WindowHide",
				WindowMaximise: "mac:WindowMaximise",
				WindowUnMaximise: "mac:WindowUnMaximise",
				WindowMinimise: "mac:WindowMinimise",
				WindowUnMinimise: "mac:WindowUnMinimise",
				WindowShouldClose: "mac:WindowShouldClose",
				WindowShow: "mac:WindowShow",
				WindowWillBecomeKey: "mac:WindowWillBecomeKey",
				WindowWillBecomeMain: "mac:WindowWillBecomeMain",
				WindowWillBeginSheet: "mac:WindowWillBeginSheet",
				WindowWillChangeOrderingMode: "mac:WindowWillChangeOrderingMode",
				WindowWillClose: "mac:WindowWillClose",
				WindowWillDeminiaturize: "mac:WindowWillDeminiaturize",
				WindowWillEnterFullScreen: "mac:WindowWillEnterFullScreen",
				WindowWillEnterVersionBrowser: "mac:WindowWillEnterVersionBrowser",
				WindowWillExitFullScreen: "mac:WindowWillExitFullScreen",
				WindowWillExitVersionBrowser: "mac:WindowWillExitVersionBrowser",
				WindowWillFocus: "mac:WindowWillFocus",
				WindowWillMiniaturize: "mac:WindowWillMiniaturize",
				WindowWillMove: "mac:WindowWillMove",
				WindowWillOrderOffScreen: "mac:WindowWillOrderOffScreen",
				WindowWillOrderOnScreen: "mac:WindowWillOrderOnScreen",
				WindowWillResignMain: "mac:WindowWillResignMain",
				WindowWillResize: "mac:WindowWillResize",
				WindowWillUnfocus: "mac:WindowWillUnfocus",
				WindowWillUpdate: "mac:WindowWillUpdate",
				WindowWillUpdateAlpha: "mac:WindowWillUpdateAlpha",
				WindowWillUpdateCollectionBehavior: "mac:WindowWillUpdateCollectionBehavior",
				WindowWillUpdateCollectionProperties: "mac:WindowWillUpdateCollectionProperties",
				WindowWillUpdateShadow: "mac:WindowWillUpdateShadow",
				WindowWillUpdateTitle: "mac:WindowWillUpdateTitle",
				WindowWillUpdateToolbar: "mac:WindowWillUpdateToolbar",
				WindowWillUpdateVisibility: "mac:WindowWillUpdateVisibility",
				WindowWillUseStandardFrame: "mac:WindowWillUseStandardFrame",
				WindowZoomIn: "mac:WindowZoomIn",
				WindowZoomOut: "mac:WindowZoomOut",
				WindowZoomReset: "mac:WindowZoomReset",
				WebViewWebContentProcessDidTerminate: "mac:WebViewWebContentProcessDidTerminate"
			}),
			Linux: Object.freeze({
				ApplicationStartup: "linux:ApplicationStartup",
				SystemDidWake: "linux:SystemDidWake",
				SystemThemeChanged: "linux:SystemThemeChanged",
				SystemWillSleep: "linux:SystemWillSleep",
				WindowDeleteEvent: "linux:WindowDeleteEvent",
				WindowDidMove: "linux:WindowDidMove",
				WindowDidResize: "linux:WindowDidResize",
				WindowFocusIn: "linux:WindowFocusIn",
				WindowFocusOut: "linux:WindowFocusOut",
				WindowLoadStarted: "linux:WindowLoadStarted",
				WindowLoadRedirected: "linux:WindowLoadRedirected",
				WindowLoadCommitted: "linux:WindowLoadCommitted",
				WindowLoadFinished: "linux:WindowLoadFinished"
			}),
			iOS: Object.freeze({
				ApplicationDidBecomeActive: "ios:ApplicationDidBecomeActive",
				ApplicationDidEnterBackground: "ios:ApplicationDidEnterBackground",
				ApplicationDidFinishLaunching: "ios:ApplicationDidFinishLaunching",
				ApplicationDidReceiveMemoryWarning: "ios:ApplicationDidReceiveMemoryWarning",
				ApplicationWillEnterForeground: "ios:ApplicationWillEnterForeground",
				ApplicationWillResignActive: "ios:ApplicationWillResignActive",
				ApplicationWillTerminate: "ios:ApplicationWillTerminate",
				WindowDidLoad: "ios:WindowDidLoad",
				WindowWillAppear: "ios:WindowWillAppear",
				WindowDidAppear: "ios:WindowDidAppear",
				WindowWillDisappear: "ios:WindowWillDisappear",
				WindowDidDisappear: "ios:WindowDidDisappear",
				WindowSafeAreaInsetsChanged: "ios:WindowSafeAreaInsetsChanged",
				WindowOrientationChanged: "ios:WindowOrientationChanged",
				WindowTouchBegan: "ios:WindowTouchBegan",
				WindowTouchMoved: "ios:WindowTouchMoved",
				WindowTouchEnded: "ios:WindowTouchEnded",
				WindowTouchCancelled: "ios:WindowTouchCancelled",
				WebViewDidStartNavigation: "ios:WebViewDidStartNavigation",
				WebViewDidFinishNavigation: "ios:WebViewDidFinishNavigation",
				WebViewDidFailNavigation: "ios:WebViewDidFailNavigation",
				WebViewDecidePolicyForNavigationAction: "ios:WebViewDecidePolicyForNavigationAction",
				BatteryChanged: "ios:BatteryChanged",
				NetworkChanged: "ios:NetworkChanged",
				ThemeChanged: "ios:ThemeChanged",
				ScreenLocked: "ios:ScreenLocked",
				ScreenUnlocked: "ios:ScreenUnlocked"
			}),
			Android: Object.freeze({
				ActivityCreated: "android:ActivityCreated",
				ActivityStarted: "android:ActivityStarted",
				ActivityResumed: "android:ActivityResumed",
				ActivityPaused: "android:ActivityPaused",
				ActivityStopped: "android:ActivityStopped",
				ActivityDestroyed: "android:ActivityDestroyed",
				ApplicationLowMemory: "android:ApplicationLowMemory",
				WebViewPageStarted: "android:WebViewPageStarted",
				WebViewPageFinished: "android:WebViewPageFinished",
				BatteryChanged: "android:BatteryChanged",
				NetworkChanged: "android:NetworkChanged",
				ThemeChanged: "android:ThemeChanged",
				ScreenLocked: "android:ScreenLocked",
				ScreenUnlocked: "android:ScreenUnlocked"
			}),
			Common: Object.freeze({
				ApplicationOpenedWithFile: "common:ApplicationOpenedWithFile",
				ApplicationStarted: "common:ApplicationStarted",
				ApplicationLaunchedWithUrl: "common:ApplicationLaunchedWithUrl",
				ThemeChanged: "common:ThemeChanged",
				SystemDidWake: "common:SystemDidWake",
				SystemWillSleep: "common:SystemWillSleep",
				WindowClosing: "common:WindowClosing",
				WindowDidMove: "common:WindowDidMove",
				WindowDidResize: "common:WindowDidResize",
				WindowDPIChanged: "common:WindowDPIChanged",
				WindowFilesDropped: "common:WindowFilesDropped",
				WindowFocus: "common:WindowFocus",
				WindowFullscreen: "common:WindowFullscreen",
				WindowHide: "common:WindowHide",
				WindowLostFocus: "common:WindowLostFocus",
				WindowMaximise: "common:WindowMaximise",
				WindowMinimise: "common:WindowMinimise",
				WindowToggleFrameless: "common:WindowToggleFrameless",
				WindowRestore: "common:WindowRestore",
				WindowRuntimeReady: "common:WindowRuntimeReady",
				WindowShow: "common:WindowShow",
				WindowUnFullscreen: "common:WindowUnFullscreen",
				WindowUnMaximise: "common:WindowUnMaximise",
				WindowUnMinimise: "common:WindowUnMinimise",
				WindowZoom: "common:WindowZoom",
				WindowZoomIn: "common:WindowZoomIn",
				WindowZoomOut: "common:WindowZoomOut",
				WindowZoomReset: "common:WindowZoomReset",
				BatteryChanged: "common:BatteryChanged",
				NetworkChanged: "common:NetworkChanged",
				ScreenLocked: "common:ScreenLocked",
				ScreenUnlocked: "common:ScreenUnlocked",
				LowMemory: "common:LowMemory"
			})
		});
	})))();
}

// src/events.ts
var events_exports = /* @__PURE__ */ __exportAll({
	BailsEvent: () => BailsEvent,
	Emit: () => Emit,
	Off: () => Off,
	OffAll: () => OffAll,
	On: () => On,
	OnMultiple: () => OnMultiple,
	Once: () => Once,
	Types: () => Types
});
function dispatchBailsEvent(event) {
	let listeners = eventListeners.get(event.name);
	if (!listeners) return;
	let bailsEvent = new BailsEvent(event.name, event.name in Events$1 ? Events$1[event.name](event.data) : event.data);
	if ("sender" in event) bailsEvent.sender = event.sender;
	const expired = /* @__PURE__ */ new Set();
	for (const listener of listeners.slice()) if (listener.dispatch(bailsEvent)) expired.add(listener);
	if (expired.size > 0) {
		const live = eventListeners.get(event.name);
		if (live) {
			const remaining = live.filter((l) => !expired.has(l));
			if (remaining.length === 0) eventListeners.delete(event.name);
			else eventListeners.set(event.name, remaining);
		}
	}
}
function OnMultiple(eventName, callback, maxCallbacks) {
	let listeners = eventListeners.get(eventName) || [];
	const thisListener = new Listener(eventName, callback, maxCallbacks);
	listeners.push(thisListener);
	eventListeners.set(eventName, listeners);
	return () => listenerOff(thisListener);
}
function On(eventName, callback) {
	return OnMultiple(eventName, callback, -1);
}
function Once(eventName, callback) {
	return OnMultiple(eventName, callback, 1);
}
function Off(...eventNames) {
	eventNames.forEach((eventName) => eventListeners.delete(eventName));
}
function OffAll() {
	eventListeners.clear();
}
function Emit(name, data) {
	return call$3(EmitMethod, new BailsEvent(name, data));
}
var call$3, EmitMethod, BailsEvent;
function init_events() {
	return (init_events = __esmMin((() => {
		init_runtime();
		init_listener();
		init_create();
		init_event_types();
		init_environment();
		if (hasDOM) {
			window._bails = window._bails || {};
			window._bails.dispatchBailsEvent = dispatchBailsEvent;
		}
		call$3 = newRuntimeCaller(objectNames.Events);
		EmitMethod = 0;
		BailsEvent = class {
			constructor(name, data) {
				this.name = name;
				this.data = data !== null && data !== void 0 ? data : null;
			}
		};
	})))();
}

// src/screens.ts
var screens_exports = /* @__PURE__ */ __exportAll({
	GetAll: () => GetAll,
	GetByID: () => GetByID,
	GetByIndex: () => GetByIndex,
	GetCurrent: () => GetCurrent,
	GetPrimary: () => GetPrimary
});
function GetAll() {
	return call$2(getAll);
}
function GetPrimary() {
	return call$2(getPrimary);
}
function GetCurrent() {
	return call$2(getCurrent);
}
function GetByID(id) {
	return call$2(getByID, { id });
}
function GetByIndex(index) {
	return call$2(getByIndex, { index });
}
var call$2, getAll, getPrimary, getCurrent, getByID, getByIndex;
function init_screens() {
	return (init_screens = __esmMin((() => {
		init_runtime();
		call$2 = newRuntimeCaller(objectNames.Screens);
		getAll = 0;
		getPrimary = 1;
		getCurrent = 2;
		getByID = 3;
		getByIndex = 4;
	})))();
}

// src/ios.ts
var ios_exports = /* @__PURE__ */ __exportAll({
	Device: () => Device$1,
	Haptics: () => Haptics$1
});
var call$1, HapticsImpact, DeviceInfo$1, Haptics$1, Device$1;
function init_ios() {
	return (init_ios = __esmMin((() => {
		init_runtime();
		call$1 = newRuntimeCaller(objectNames.IOS);
		HapticsImpact = 0;
		DeviceInfo$1 = 1;
		;
		(function(_Haptics) {
			function Impact(style = "medium") {
				return call$1(HapticsImpact, { style });
			}
			_Haptics.Impact = Impact;
		})(Haptics$1 || (Haptics$1 = {}));
		;
		(function(_Device) {
			function Info() {
				return call$1(DeviceInfo$1);
			}
			_Device.Info = Info;
		})(Device$1 || (Device$1 = {}));
	})))();
}

// src/android.ts
var android_exports = /* @__PURE__ */ __exportAll({
	Device: () => Device,
	Haptics: () => Haptics,
	Toast: () => Toast
});
var call, HapticsVibrate, DeviceInfo, ToastShow, Haptics, Device, Toast;
function init_android() {
	return (init_android = __esmMin((() => {
		init_runtime();
		call = newRuntimeCaller(objectNames.Android);
		HapticsVibrate = 0;
		DeviceInfo = 1;
		ToastShow = 2;
		;
		(function(_Haptics) {
			function Vibrate(durationMs = 100) {
				return call(HapticsVibrate, { duration: durationMs });
			}
			_Haptics.Vibrate = Vibrate;
		})(Haptics || (Haptics = {}));
		;
		(function(_Device) {
			function Info() {
				return call(DeviceInfo);
			}
			_Device.Info = Info;
		})(Device || (Device = {}));
		;
		(function(_Toast) {
			function Show(message) {
				return call(ToastShow, { message });
			}
			_Toast.Show = Show;
		})(Toast || (Toast = {}));
	})))();
}

// src/updater.ts
var updater_exports = /* @__PURE__ */ __exportAll({ Events: () => Events });
var Events;
function init_updater() {
	return (init_updater = __esmMin((() => {
		Events = Object.freeze({
			CheckStarted: "bails:updater:check-started",
			UpdateAvailable: "bails:updater:update-available",
			NoUpdate: "bails:updater:no-update",
			DownloadStarted: "bails:updater:download-started",
			DownloadProgress: "bails:updater:download-progress",
			DownloadComplete: "bails:updater:download-complete",
			Verifying: "bails:updater:verifying",
			Installing: "bails:updater:installing",
			UpdateReady: "bails:updater:update-ready",
			Error: "bails:updater:error",
			Meta: "bails:updater:meta",
			User: Object.freeze({
				Install: "bails:updater:user:install",
				Restart: "bails:updater:user:restart",
				Skip: "bails:updater:user:skip",
				Remind: "bails:updater:user:remind",
				Cancel: "bails:updater:user:cancel"
			}),
			Window: Object.freeze({ Ready: "bails:updater:window:ready" })
		});
	})))();
}

// src/window.ts
function getDropTargetElement(element) {
	if (!element) return null;
	return element.closest(`[${DROP_TARGET_ATTRIBUTE}]`);
}
function canResolveFilePaths() {
	var _window$chrome, _window$_bails;
	if (((_window$chrome = window.chrome) === null || _window$chrome === void 0 || (_window$chrome = _window$chrome.webview) === null || _window$chrome === void 0 ? void 0 : _window$chrome.postMessageWithAdditionalObjects) == null) return false;
	return ((_window$_bails = window._bails) === null || _window$_bails === void 0 || (_window$_bails = _window$_bails.flags) === null || _window$_bails === void 0 ? void 0 : _window$_bails.enableFileDrop) === true;
}
function resolveFilePaths(x, y, files) {
	var _window$chrome2;
	if ((_window$chrome2 = window.chrome) === null || _window$chrome2 === void 0 || (_window$chrome2 = _window$chrome2.webview) === null || _window$chrome2 === void 0 ? void 0 : _window$chrome2.postMessageWithAdditionalObjects) window.chrome.webview.postMessageWithAdditionalObjects(`file:drop:${x}:${y}`, files);
}
function cleanupNativeDrag() {
	nativeDragActive = false;
	if (currentDropTarget) {
		currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		currentDropTarget = null;
	}
}
function handleDragEnter() {
	var _window$_bails2;
	if (((_window$_bails2 = window._bails) === null || _window$_bails2 === void 0 || (_window$_bails2 = _window$_bails2.flags) === null || _window$_bails2 === void 0 ? void 0 : _window$_bails2.enableFileDrop) === false) return;
	nativeDragActive = true;
}
function handleDragLeave() {
	cleanupNativeDrag();
}
function handleDragOver(x, y) {
	var _window$_bails3;
	if (!nativeDragActive) return;
	if (((_window$_bails3 = window._bails) === null || _window$_bails3 === void 0 || (_window$_bails3 = _window$_bails3.flags) === null || _window$_bails3 === void 0 ? void 0 : _window$_bails3.enableFileDrop) === false) return;
	const dropTarget = getDropTargetElement(document.elementFromPoint(x, y));
	if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
	if (dropTarget) {
		dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
		currentDropTarget = dropTarget;
	} else currentDropTarget = null;
}
function setupDropTargetListeners() {
	const docElement = document.documentElement;
	let dragEnterCounter = 0;
	docElement.addEventListener("dragenter", (event) => {
		var _event$dataTransfer, _window$_bails5;
		if (!((_event$dataTransfer = event.dataTransfer) === null || _event$dataTransfer === void 0 ? void 0 : _event$dataTransfer.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_bails5 = window._bails) === null || _window$_bails5 === void 0 || (_window$_bails5 = _window$_bails5.flags) === null || _window$_bails5 === void 0 ? void 0 : _window$_bails5.enableFileDrop) === false) {
			event.dataTransfer.dropEffect = "none";
			return;
		}
		dragEnterCounter++;
		const dropTarget = getDropTargetElement(document.elementFromPoint(event.clientX, event.clientY));
		if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		if (dropTarget) {
			dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
			event.dataTransfer.dropEffect = "copy";
			currentDropTarget = dropTarget;
		} else {
			event.dataTransfer.dropEffect = "none";
			currentDropTarget = null;
		}
	}, false);
	docElement.addEventListener("dragover", (event) => {
		var _event$dataTransfer2, _window$_bails6;
		if (!((_event$dataTransfer2 = event.dataTransfer) === null || _event$dataTransfer2 === void 0 ? void 0 : _event$dataTransfer2.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_bails6 = window._bails) === null || _window$_bails6 === void 0 || (_window$_bails6 = _window$_bails6.flags) === null || _window$_bails6 === void 0 ? void 0 : _window$_bails6.enableFileDrop) === false) {
			event.dataTransfer.dropEffect = "none";
			return;
		}
		const dropTarget = getDropTargetElement(document.elementFromPoint(event.clientX, event.clientY));
		if (currentDropTarget && currentDropTarget !== dropTarget) currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
		if (dropTarget) {
			if (!dropTarget.classList.contains(DROP_TARGET_ACTIVE_CLASS)) dropTarget.classList.add(DROP_TARGET_ACTIVE_CLASS);
			event.dataTransfer.dropEffect = "copy";
			currentDropTarget = dropTarget;
		} else {
			event.dataTransfer.dropEffect = "none";
			currentDropTarget = null;
		}
	}, false);
	docElement.addEventListener("dragleave", (event) => {
		var _event$dataTransfer3, _window$_bails7;
		if (!((_event$dataTransfer3 = event.dataTransfer) === null || _event$dataTransfer3 === void 0 ? void 0 : _event$dataTransfer3.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_bails7 = window._bails) === null || _window$_bails7 === void 0 || (_window$_bails7 = _window$_bails7.flags) === null || _window$_bails7 === void 0 ? void 0 : _window$_bails7.enableFileDrop) === false) return;
		if (event.relatedTarget === null) return;
		dragEnterCounter--;
		if (dragEnterCounter === 0 || currentDropTarget && !currentDropTarget.contains(event.relatedTarget)) {
			if (currentDropTarget) {
				currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
				currentDropTarget = null;
			}
			dragEnterCounter = 0;
		}
	}, false);
	docElement.addEventListener("drop", (event) => {
		var _event$dataTransfer4, _window$_bails8;
		if (!((_event$dataTransfer4 = event.dataTransfer) === null || _event$dataTransfer4 === void 0 ? void 0 : _event$dataTransfer4.types.includes("Files"))) return;
		event.preventDefault();
		if (((_window$_bails8 = window._bails) === null || _window$_bails8 === void 0 || (_window$_bails8 = _window$_bails8.flags) === null || _window$_bails8 === void 0 ? void 0 : _window$_bails8.enableFileDrop) === false) return;
		dragEnterCounter = 0;
		if (currentDropTarget) {
			currentDropTarget.classList.remove(DROP_TARGET_ACTIVE_CLASS);
			currentDropTarget = null;
		}
		if (canResolveFilePaths()) {
			const files = [];
			if (event.dataTransfer.items) {
				for (const item of event.dataTransfer.items) if (item.kind === "file") {
					const file = item.getAsFile();
					if (file) files.push(file);
				}
			} else if (event.dataTransfer.files) for (const file of event.dataTransfer.files) files.push(file);
			if (files.length > 0) resolveFilePaths(event.clientX, event.clientY, files);
		}
	}, false);
}
var DROP_TARGET_ATTRIBUTE, DROP_TARGET_ACTIVE_CLASS, currentDropTarget, PositionMethod, CenterMethod, CloseMethod, DisableSizeConstraintsMethod, EnableSizeConstraintsMethod, FocusMethod, ForceReloadMethod, FullscreenMethod, GetScreenMethod, GetZoomMethod, HeightMethod, HideMethod, IsFocusedMethod, IsFullscreenMethod, IsMaximisedMethod, IsMinimisedMethod, MaximiseMethod, MinimiseMethod, NameMethod, OpenDevToolsMethod, RelativePositionMethod, ReloadMethod, ResizableMethod, RestoreMethod, SetPositionMethod, SetAlwaysOnTopMethod, SetBackgroundColourMethod, SetFramelessMethod, SetFullscreenButtonEnabledMethod, SetMaxSizeMethod, SetMinSizeMethod, SetRelativePositionMethod, SetResizableMethod, SetSizeMethod, SetTitleMethod, SetZoomMethod, ShowMethod, SizeMethod, ToggleFullscreenMethod, ToggleMaximiseMethod, ToggleFramelessMethod, UnFullscreenMethod, UnMaximiseMethod, UnMinimiseMethod, WidthMethod, ZoomMethod, ZoomInMethod, ZoomOutMethod, ZoomResetMethod, SnapAssistMethod, FilesDropped, PrintMethod, SetScreenMethod, nativeDragActive, callerSym, Window, thisWindow;
function init_window() {
	return (init_window = __esmMin((() => {
		init_runtime();
		DROP_TARGET_ATTRIBUTE = "data-file-drop-target";
		DROP_TARGET_ACTIVE_CLASS = "file-drop-target-active";
		currentDropTarget = null;
		PositionMethod = 0;
		CenterMethod = 1;
		CloseMethod = 2;
		DisableSizeConstraintsMethod = 3;
		EnableSizeConstraintsMethod = 4;
		FocusMethod = 5;
		ForceReloadMethod = 6;
		FullscreenMethod = 7;
		GetScreenMethod = 8;
		GetZoomMethod = 9;
		HeightMethod = 10;
		HideMethod = 11;
		IsFocusedMethod = 12;
		IsFullscreenMethod = 13;
		IsMaximisedMethod = 14;
		IsMinimisedMethod = 15;
		MaximiseMethod = 16;
		MinimiseMethod = 17;
		NameMethod = 18;
		OpenDevToolsMethod = 19;
		RelativePositionMethod = 20;
		ReloadMethod = 21;
		ResizableMethod = 22;
		RestoreMethod = 23;
		SetPositionMethod = 24;
		SetAlwaysOnTopMethod = 25;
		SetBackgroundColourMethod = 26;
		SetFramelessMethod = 27;
		SetFullscreenButtonEnabledMethod = 28;
		SetMaxSizeMethod = 29;
		SetMinSizeMethod = 30;
		SetRelativePositionMethod = 31;
		SetResizableMethod = 32;
		SetSizeMethod = 33;
		SetTitleMethod = 34;
		SetZoomMethod = 35;
		ShowMethod = 36;
		SizeMethod = 37;
		ToggleFullscreenMethod = 38;
		ToggleMaximiseMethod = 39;
		ToggleFramelessMethod = 40;
		UnFullscreenMethod = 41;
		UnMaximiseMethod = 42;
		UnMinimiseMethod = 43;
		WidthMethod = 44;
		ZoomMethod = 45;
		ZoomInMethod = 46;
		ZoomOutMethod = 47;
		ZoomResetMethod = 48;
		SnapAssistMethod = 49;
		FilesDropped = 50;
		PrintMethod = 51;
		SetScreenMethod = 52;
		nativeDragActive = false;
		callerSym = Symbol("caller");
		Window = class Window {
			constructor(name = "") {
				this[callerSym] = newRuntimeCaller(objectNames.Window, name);
				for (const method of Object.getOwnPropertyNames(Window.prototype)) if (method !== "constructor" && typeof this[method] === "function") this[method] = this[method].bind(this);
			}
			Get(name) {
				return new Window(name);
			}
			Position() {
				return this[callerSym](PositionMethod);
			}
			Center() {
				return this[callerSym](CenterMethod);
			}
			Close() {
				return this[callerSym](CloseMethod);
			}
			DisableSizeConstraints() {
				return this[callerSym](DisableSizeConstraintsMethod);
			}
			EnableSizeConstraints() {
				return this[callerSym](EnableSizeConstraintsMethod);
			}
			Focus() {
				return this[callerSym](FocusMethod);
			}
			ForceReload() {
				return this[callerSym](ForceReloadMethod);
			}
			Fullscreen() {
				return this[callerSym](FullscreenMethod);
			}
			GetScreen() {
				return this[callerSym](GetScreenMethod);
			}
			GetZoom() {
				return this[callerSym](GetZoomMethod);
			}
			Height() {
				return this[callerSym](HeightMethod);
			}
			Hide() {
				return this[callerSym](HideMethod);
			}
			IsFocused() {
				return this[callerSym](IsFocusedMethod);
			}
			IsFullscreen() {
				return this[callerSym](IsFullscreenMethod);
			}
			IsMaximised() {
				return this[callerSym](IsMaximisedMethod);
			}
			IsMinimised() {
				return this[callerSym](IsMinimisedMethod);
			}
			Maximise() {
				return this[callerSym](MaximiseMethod);
			}
			Minimise() {
				return this[callerSym](MinimiseMethod);
			}
			Name() {
				return this[callerSym](NameMethod);
			}
			OpenDevTools() {
				return this[callerSym](OpenDevToolsMethod);
			}
			RelativePosition() {
				return this[callerSym](RelativePositionMethod);
			}
			Reload() {
				return this[callerSym](ReloadMethod);
			}
			Resizable() {
				return this[callerSym](ResizableMethod);
			}
			Restore() {
				return this[callerSym](RestoreMethod);
			}
			SetPosition(x, y) {
				return this[callerSym](SetPositionMethod, {
					x,
					y
				});
			}
			SetAlwaysOnTop(alwaysOnTop) {
				return this[callerSym](SetAlwaysOnTopMethod, { alwaysOnTop });
			}
			SetBackgroundColour(r, g, b, a) {
				return this[callerSym](SetBackgroundColourMethod, {
					r,
					g,
					b,
					a
				});
			}
			SetFrameless(frameless) {
				return this[callerSym](SetFramelessMethod, { frameless });
			}
			SetFullscreenButtonEnabled(enabled) {
				return this[callerSym](SetFullscreenButtonEnabledMethod, { enabled });
			}
			SetMaxSize(width, height) {
				return this[callerSym](SetMaxSizeMethod, {
					width,
					height
				});
			}
			SetMinSize(width, height) {
				return this[callerSym](SetMinSizeMethod, {
					width,
					height
				});
			}
			SetRelativePosition(x, y) {
				return this[callerSym](SetRelativePositionMethod, {
					x,
					y
				});
			}
			SetResizable(resizable) {
				return this[callerSym](SetResizableMethod, { resizable });
			}
			SetSize(width, height) {
				return this[callerSym](SetSizeMethod, {
					width,
					height
				});
			}
			SetTitle(title) {
				return this[callerSym](SetTitleMethod, { title });
			}
			SetZoom(zoom) {
				return this[callerSym](SetZoomMethod, { zoom });
			}
			Show() {
				return this[callerSym](ShowMethod);
			}
			Size() {
				return this[callerSym](SizeMethod);
			}
			ToggleFullscreen() {
				return this[callerSym](ToggleFullscreenMethod);
			}
			ToggleMaximise() {
				return this[callerSym](ToggleMaximiseMethod);
			}
			ToggleFrameless() {
				return this[callerSym](ToggleFramelessMethod);
			}
			UnFullscreen() {
				return this[callerSym](UnFullscreenMethod);
			}
			UnMaximise() {
				return this[callerSym](UnMaximiseMethod);
			}
			UnMinimise() {
				return this[callerSym](UnMinimiseMethod);
			}
			Width() {
				return this[callerSym](WidthMethod);
			}
			Zoom() {
				return this[callerSym](ZoomMethod);
			}
			ZoomIn() {
				return this[callerSym](ZoomInMethod);
			}
			ZoomOut() {
				return this[callerSym](ZoomOutMethod);
			}
			ZoomReset() {
				return this[callerSym](ZoomResetMethod);
			}
			HandlePlatformFileDrop(filenames, x, y) {
				var _window$_bails4;
				if (((_window$_bails4 = window._bails) === null || _window$_bails4 === void 0 || (_window$_bails4 = _window$_bails4.flags) === null || _window$_bails4 === void 0 ? void 0 : _window$_bails4.enableFileDrop) === false) return;
				const dropTarget = getDropTargetElement(document.elementFromPoint(x, y));
				if (!dropTarget) return;
				const elementDetails = {
					id: dropTarget.id,
					classList: Array.from(dropTarget.classList),
					attributes: {}
				};
				for (let i = 0; i < dropTarget.attributes.length; i++) {
					const attr = dropTarget.attributes[i];
					elementDetails.attributes[attr.name] = attr.value;
				}
				const payload = {
					filenames,
					x,
					y,
					elementDetails
				};
				this[callerSym](FilesDropped, payload);
				cleanupNativeDrag();
			}
			SetScreen(screenID) {
				return this[callerSym](SetScreenMethod, { screenID });
			}
			SnapAssist() {
				return this[callerSym](SnapAssistMethod);
			}
			Print() {
				return this[callerSym](PrintMethod);
			}
		};
		thisWindow = new Window("");
		if (typeof window !== "undefined" && typeof document !== "undefined") setupDropTargetListeners();
	})))();
}

// src/wml.ts
var wml_exports = /* @__PURE__ */ __exportAll({
	Enable: () => Enable,
	Reload: () => Reload
});
function sendEvent(eventName, data = null) {
	Emit(eventName, data);
}
function callWindowMethod(windowName, methodName) {
	const targetWindow = thisWindow.Get(windowName);
	const method = targetWindow[methodName];
	if (typeof method !== "function") {
		console.error(`Window method '${methodName}' not found`);
		return;
	}
	try {
		method.call(targetWindow);
	} catch (e) {
		console.error(`Error calling window method '${methodName}': `, e);
	}
}
function onWMLTriggered(ev) {
	const element = ev.currentTarget;
	function runEffect(choice = "Yes") {
		if (choice !== "Yes") return;
		const eventType = element.getAttribute("wml-event") || element.getAttribute("data-wml-event");
		const targetWindow = element.getAttribute("wml-target-window") || element.getAttribute("data-wml-target-window") || "";
		const windowMethod = element.getAttribute("wml-window") || element.getAttribute("data-wml-window");
		const url = element.getAttribute("wml-openurl") || element.getAttribute("data-wml-openurl");
		if (eventType !== null) sendEvent(eventType);
		if (windowMethod !== null) callWindowMethod(targetWindow, windowMethod);
		if (url !== null) OpenURL(url);
	}
	const confirm = element.getAttribute("wml-confirm") || element.getAttribute("data-wml-confirm");
	if (confirm) Question({
		Title: "Confirm",
		Message: confirm,
		Detached: false,
		Buttons: [{ Label: "Yes" }, {
			Label: "No",
			IsDefault: true
		}]
	}).then(runEffect);
	else runEffect();
}
function addWMLListeners(element) {
	const triggerRegExp = /\S+/g;
	const triggerAttr = element.getAttribute("wml-trigger") || element.getAttribute("data-wml-trigger") || "click";
	const triggers = [];
	let match;
	while ((match = triggerRegExp.exec(triggerAttr)) !== null) triggers.push(match[0]);
	const options = triggerRegistry.set(element, triggers);
	for (const trigger of triggers) element.addEventListener(trigger, onWMLTriggered, options);
}
function Enable() {
	whenReady(Reload);
}
function Reload() {
	triggerRegistry.reset();
	document.body.querySelectorAll("[wml-event], [wml-window], [wml-openurl], [data-wml-event], [data-wml-window], [data-wml-openurl]").forEach(addWMLListeners);
}
var controllerSym, triggerMapSym, elementCountSym, AbortControllerRegistry, WeakMapRegistry, triggerRegistry;
function init_wml() {
	return (init_wml = __esmMin((() => {
		init_browser();
		init_dialogs();
		init_events();
		init_utils();
		init_window();
		controllerSym = Symbol("controller");
		triggerMapSym = Symbol("triggerMap");
		elementCountSym = Symbol("elementCount");
		AbortControllerRegistry = class {
			constructor() {
				this[controllerSym] = new AbortController();
			}
			set(element, triggers) {
				return { signal: this[controllerSym].signal };
			}
			reset() {
				this[controllerSym].abort();
				this[controllerSym] = new AbortController();
			}
		};
		WeakMapRegistry = class {
			constructor() {
				this[triggerMapSym] = /* @__PURE__ */ new WeakMap();
				this[elementCountSym] = 0;
			}
			set(element, triggers) {
				if (!this[triggerMapSym].has(element)) this[elementCountSym]++;
				this[triggerMapSym].set(element, triggers);
				return {};
			}
			reset() {
				if (this[elementCountSym] <= 0) return;
				for (const element of document.body.querySelectorAll("*")) {
					if (this[elementCountSym] <= 0) break;
					const triggers = this[triggerMapSym].get(element);
					if (triggers != null) this[elementCountSym]--;
					for (const trigger of triggers || []) element.removeEventListener(trigger, onWMLTriggered);
				}
				this[triggerMapSym] = /* @__PURE__ */ new WeakMap();
				this[elementCountSym] = 0;
			}
		};
		triggerRegistry = canAbortListeners() ? new AbortControllerRegistry() : new WeakMapRegistry();
	})))();
}

// src/stream.ts
function namedPageGeneration() {
	try {
		const marker = window.name.lastIndexOf(GENERATION_NAME_MARKER);
		if (marker < 0) return 0;
		const value = Number(window.name.slice(marker + 29));
		return Number.isSafeInteger(value) && value > 0 ? value : 0;
	} catch (_unused) {
		return 0;
	}
}
function rememberNamedPageGeneration(generation) {
	try {
		const marker = window.name.lastIndexOf(GENERATION_NAME_MARKER);
		const applicationName = marker < 0 ? window.name : window.name.slice(0, marker);
		window.name = applicationName + GENERATION_NAME_MARKER + generation;
	} catch (_unused2) {}
}
function nextPageGeneration() {
	if (!hasDOM) return 1;
	const origin = typeof performance !== "undefined" && Number.isFinite(performance.timeOrigin) ? performance.timeOrigin : Date.now();
	const pageTime = Math.max(1, Math.floor(origin * 1e3));
	let current = namedPageGeneration();
	try {
		const raw = window.sessionStorage.getItem(GENERATION_KEY);
		const stored = raw === null ? 0 : Number(raw);
		if (Number.isSafeInteger(stored) && stored > current) current = stored;
	} catch (_unused3) {}
	const next = Number.isSafeInteger(current) && current >= 0 && current < Number.MAX_SAFE_INTEGER ? Math.max(current + 1, pageTime) : pageTime;
	try {
		window.sessionStorage.setItem(GENERATION_KEY, String(next));
	} catch (_unused4) {}
	rememberNamedPageGeneration(next);
	return next;
}
function streamGlobals() {
	const fresh = () => ({
		session: nanoid(),
		generation: nextPageGeneration(),
		nextConnID: 1,
		connections: /* @__PURE__ */ new Map(),
		polling: false
	});
	if (!hasDOM) return fresh();
	const w = window._bails = window._bails || {};
	return w.__stream = w.__stream || fresh();
}
function streamURL(endpoint) {
	return window.location.origin + "/bails/stream/" + endpoint;
}
function sleep(ms, signal) {
	if (!signal) return new Promise((resolve) => setTimeout(resolve, ms));
	if (signal.aborted) return Promise.reject(new StreamRequestCancelled());
	return new Promise((resolve, reject) => {
		const onAbort = () => {
			clearTimeout(timer);
			reject(new StreamRequestCancelled());
		};
		const timer = setTimeout(() => {
			signal.removeEventListener("abort", onAbort);
			resolve();
		}, ms);
		signal.addEventListener("abort", onAbort, { once: true });
	});
}
function Stream(name) {
	if (hasDOM) {
		var _window$_bails;
		const factory = (_window$_bails = window._bails) === null || _window$_bails === void 0 ? void 0 : _window$_bails.streamFactory;
		if (typeof factory === "function") return factory(name);
	}
	return new BailsSocket(name);
}
function defineHandlerProperty(target, type) {
	let current = null;
	Object.defineProperty(target, "on" + type, {
		get: () => current,
		set(fn) {
			if (current) target.removeEventListener(type, current);
			current = typeof fn === "function" ? fn : null;
			if (current) target.addEventListener(type, current);
		},
		configurable: true,
		enumerable: true
	});
}
function JSONStream(name) {
	const socket = Stream(name);
	const decoder = new TextDecoder();
	const parse = (payload) => JSON.parse(typeof payload === "string" ? payload : decoder.decode(payload));
	if (socket instanceof BailsSocket) socket._decode = (payload) => parse(payload);
	else {
		const native = socket;
		native.binaryType = "arraybuffer";
		const wrapped = /* @__PURE__ */ new WeakMap();
		const decodedEvents = /* @__PURE__ */ new WeakMap();
		const add = native.addEventListener.bind(native);
		const remove = native.removeEventListener.bind(native);
		const decodeEvent = (ev) => {
			var _decodedEvents$get;
			if (decodedEvents.has(ev)) return (_decodedEvents$get = decodedEvents.get(ev)) !== null && _decodedEvents$get !== void 0 ? _decodedEvents$get : null;
			try {
				const value = parse(ev.data);
				const decoded = new MessageEvent("message", { data: value });
				decodedEvents.set(ev, decoded);
				return decoded;
			} catch (_unused6) {
				decodedEvents.set(ev, null);
				native.dispatchEvent(new Event("error"));
				return null;
			}
		};
		const decode = (listener) => {
			const existing = wrapped.get(listener);
			if (existing) return existing;
			const fn = (ev) => {
				const decoded = decodeEvent(ev);
				if (!decoded) return;
				if (typeof listener === "function") listener.call(native, decoded);
				else listener.handleEvent(decoded);
			};
			wrapped.set(listener, fn);
			return fn;
		};
		native.addEventListener = ((type, listener, opts) => {
			add(type, type === "message" && listener ? decode(listener) : listener, opts);
		});
		native.removeEventListener = ((type, listener, opts) => {
			const fn = type === "message" && listener ? wrapped.get(listener) : void 0;
			remove(type, fn !== null && fn !== void 0 ? fn : listener, opts);
		});
		let handler = null;
		Object.defineProperty(native, "onmessage", {
			get: () => handler,
			set(fn) {
				if (handler) native.removeEventListener("message", handler);
				handler = typeof fn === "function" ? fn : null;
				if (handler) native.addEventListener("message", handler);
			},
			configurable: true,
			enumerable: true
		});
	}
	const send = socket.send.bind(socket);
	socket.send = (value) => send(JSON.stringify(value));
	return socket;
}
function toBytesSync(data) {
	if (typeof data === "string") return textEncoder.encode(data);
	if (typeof Blob !== "undefined" && data instanceof Blob) return null;
	if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice();
	return new Uint8Array(data).slice();
}
function abortable(promise, signal) {
	if (!signal) return promise;
	if (signal.aborted) return Promise.reject(new StreamRequestCancelled());
	return new Promise((resolve, reject) => {
		const onAbort = () => reject(new StreamRequestCancelled());
		signal.addEventListener("abort", onAbort, { once: true });
		promise.then((value) => {
			signal.removeEventListener("abort", onAbort);
			resolve(value);
		}, (err) => {
			signal.removeEventListener("abort", onAbort);
			reject(err);
		});
	});
}
async function toBytes(data, signal) {
	if (typeof data === "string") return textEncoder.encode(data);
	if (typeof Blob !== "undefined" && data instanceof Blob) return new Uint8Array(await abortable(data.arrayBuffer(), signal));
	if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice();
	return new Uint8Array(data).slice();
}
async function postFrame(connID, kind, body, name, signal) {
	const headers = {
		[HDR_SESSION]: G.session,
		[HDR_GENERATION]: String(G.generation),
		[HDR_CONN]: String(connID),
		[HDR_KIND]: String(kind),
		"Content-Type": "application/octet-stream"
	};
	if (name !== void 0) headers[HDR_NAME] = name;
	if (body.byteLength <= CHUNK_THRESHOLD) {
		await postWithRetry(headers, body, signal);
		return;
	}
	const chunkID = nanoid();
	const total = Math.ceil(body.byteLength / CHUNK_THRESHOLD);
	for (let i = 0; i < total; i++) {
		const slice = body.subarray(i * CHUNK_THRESHOLD, (i + 1) * CHUNK_THRESHOLD);
		await postWithRetry(_objectSpread2(_objectSpread2({}, headers), {}, {
			[HDR_CHUNK]: chunkID,
			[HDR_CHUNK_INDEX]: String(i),
			[HDR_CHUNK_TOTAL]: String(total)
		}), slice, signal);
	}
}
async function postWithRetry(headers, body, signal) {
	let wait = 1;
	for (;;) {
		if (signal === null || signal === void 0 ? void 0 : signal.aborted) throw new StreamRequestCancelled();
		const resp = await fetch(streamURL("send"), {
			method: "POST",
			headers,
			body,
			signal
		});
		if (resp.ok) return;
		if (resp.status !== 429) throw new Error(await resp.text());
		await sleep(wait, signal);
		wait = Math.min(wait * 2, 50);
	}
}
async function postBatch(connID, frames, signal) {
	let start = 0;
	while (start < frames.length) {
		if (frames[start].byteLength > CHUNK_THRESHOLD) {
			await postFrame(connID, KIND_DATA, frames[start], void 0, signal);
			start++;
			continue;
		}
		let end = start;
		let size = 4;
		while (end < frames.length && end - start < MAX_BATCH_FRAMES) {
			const frame = frames[end];
			if (frame.byteLength > CHUNK_THRESHOLD || size + 4 + frame.byteLength > CHUNK_THRESHOLD) break;
			size += 4 + frame.byteLength;
			end++;
		}
		if (end === start) {
			await postFrame(connID, KIND_DATA, frames[start], void 0, signal);
			start++;
			continue;
		}
		const group = frames.slice(start, end);
		if (group.length === 1) await postFrame(connID, KIND_DATA, group[0], void 0, signal);
		else await postBatchGroup(connID, group, signal);
		start = end;
	}
}
async function postBatchGroup(connID, frames, signal) {
	if (frames.length === 0 || frames.length > MAX_BATCH_FRAMES) throw new Error("invalid stream batch size");
	let body = buildBatch(frames);
	let sent = 0;
	let wait = 1;
	for (;;) {
		var _resp$headers$get;
		if (signal === null || signal === void 0 ? void 0 : signal.aborted) throw new StreamRequestCancelled();
		const resp = await fetch(streamURL("send"), {
			method: "POST",
			headers: {
				[HDR_SESSION]: G.session,
				[HDR_GENERATION]: String(G.generation),
				[HDR_CONN]: String(connID),
				[HDR_KIND]: String(KIND_DATA),
				[HDR_BATCH]: String(frames.length - sent),
				"Content-Type": "application/octet-stream"
			},
			body,
			signal
		});
		if (resp.ok) return;
		if (resp.status !== 429) throw new Error(await resp.text());
		const accepted = Number((_resp$headers$get = resp.headers.get(HDR_BATCH)) !== null && _resp$headers$get !== void 0 ? _resp$headers$get : 0);
		const remaining = frames.length - sent;
		if (!Number.isInteger(accepted) || accepted < 0 || accepted >= remaining) {
			if (accepted !== 0) throw new Error("invalid stream batch acknowledgement");
		}
		sent += accepted;
		body = buildBatch(frames.slice(sent));
		await sleep(wait, signal);
		wait = Math.min(wait * 2, 50);
	}
}
function buildBatch(frames) {
	let size = 4;
	for (const f of frames) size += 4 + f.byteLength;
	const out = new Uint8Array(size);
	const view = new DataView(out.buffer);
	view.setUint32(0, frames.length);
	let off = 4;
	for (const f of frames) {
		view.setUint32(off, f.byteLength);
		off += 4;
		out.set(f, off);
		off += f.byteLength;
	}
	return out;
}
function startPolling() {
	if (G.polling || !hasDOM) return;
	G.polling = true;
	pollLoop();
}
async function pollLoop() {
	let backoff = 0;
	const abort = new AbortController();
	G.pollAbort = abort;
	while (G.connections.size > 0) try {
		const resp = await fetch(streamURL("poll"), {
			method: "GET",
			headers: {
				[HDR_SESSION]: G.session,
				[HDR_GENERATION]: String(G.generation)
			},
			cache: "no-store",
			signal: abort.signal
		});
		if (resp.status === 410) {
			closeAll(1001, "session closed");
			break;
		}
		if (!resp.ok && resp.status !== 204) {
			if (!isRetryablePollStatus(resp.status)) {
				failAll("stream poll failed: " + resp.status);
				break;
			}
			throw new Error("retryable stream poll failure: " + resp.status);
		}
		backoff = 0;
		if (resp.status !== 204) {
			let buf;
			try {
				buf = await resp.arrayBuffer();
			} catch (_unused7) {
				failAll("stream poll response body failed");
				break;
			}
			const frames = decodeFrames(buf);
			if (frames === null) {
				closeAll(1002, "unrecognised stream framing");
				break;
			}
			deliver(frames);
		}
	} catch (err) {
		if (abort.signal.aborted || G.connections.size === 0) break;
		backoff = backoff ? Math.min(backoff * 2, BACKOFF_MAX) : BACKOFF_MIN;
		try {
			await sleep(backoff, abort.signal);
		} catch (_unused8) {
			break;
		}
	}
	if (G.pollAbort === abort) G.pollAbort = void 0;
	G.polling = false;
	if (G.connections.size > 0) startPolling();
}
function isRetryablePollStatus(status) {
	return status === 408 || status === 425 || status === 429 || status >= 500 && status <= 599;
}
function decodeFrames(buf) {
	if (buf.byteLength < 9) return null;
	const dv = new DataView(buf);
	if (dv.getUint8(0) !== 87 || dv.getUint8(1) !== 83 || dv.getUint8(2) !== 49 || dv.getUint8(3) !== 0 || (dv.getUint8(4) & -2) !== 0) return null;
	const count = dv.getUint32(5);
	const frames = [];
	let off = 9;
	for (let i = 0; i < count; i++) {
		if (off + 9 > buf.byteLength) return null;
		const connID = dv.getUint32(off);
		off += 4;
		const kind = dv.getUint8(off);
		off += 1;
		const len = dv.getUint32(off);
		off += 4;
		if (kind > KIND_ERROR || len > buf.byteLength - off) return null;
		const payload = buf.slice(off, off + len);
		off += len;
		frames.push({
			connID,
			kind,
			payload
		});
	}
	return off === buf.byteLength ? frames : null;
}
function deliver(frames) {
	for (const frame of frames) {
		const connID = frame.connID;
		const kind = frame.kind;
		const payload = frame.payload;
		const conn = G.connections.get(connID);
		if (!conn) continue;
		switch (kind) {
			case KIND_DATA:
				conn._message(payload);
				break;
			case KIND_OPEN:
				conn._opened();
				break;
			case KIND_CLOSE:
				conn._closed(1e3, "", true);
				break;
			case KIND_ERROR: conn._fail(new Error(new TextDecoder().decode(payload)));
		}
	}
}
function closeAll(code, reason) {
	for (const conn of [...G.connections.values()]) conn._closed(code, reason, false);
}
function failAll(reason) {
	for (const conn of [...G.connections.values()]) conn._fail(new Error(reason));
}
var _BailsSocket, GENERATION_KEY, GENERATION_NAME_MARKER, G, HDR_SESSION, HDR_GENERATION, HDR_CONN, HDR_KIND, HDR_NAME, HDR_CHUNK, HDR_CHUNK_INDEX, HDR_CHUNK_TOTAL, HDR_BATCH, KIND_DATA, KIND_OPEN, KIND_CLOSE, KIND_ERROR, CHUNK_THRESHOLD, MAX_BATCH_FRAMES, BACKOFF_MIN, BACKOFF_MAX, textEncoder, StreamRequestCancelled, BailsSocket;
function init_stream() {
	return (init_stream = __esmMin((() => {
		init_nanoid();
		init_environment();
		init_objectSpread2();
		;
		GENERATION_KEY = "__bails_stream_generation";
		GENERATION_NAME_MARKER = "__bails_stream_generation__:";
		G = streamGlobals();
		HDR_SESSION = "x-bails-stream-session";
		HDR_GENERATION = "x-bails-stream-generation";
		HDR_CONN = "x-bails-stream-conn";
		HDR_KIND = "x-bails-stream-kind";
		HDR_NAME = "x-bails-stream-name";
		HDR_CHUNK = "x-bails-stream-chunk";
		HDR_CHUNK_INDEX = "x-bails-stream-chunk-index";
		HDR_CHUNK_TOTAL = "x-bails-stream-chunk-total";
		HDR_BATCH = "x-bails-stream-batch";
		KIND_DATA = 0;
		KIND_OPEN = 1;
		KIND_CLOSE = 2;
		KIND_ERROR = 3;
		CHUNK_THRESHOLD = 524288;
		MAX_BATCH_FRAMES = 4096;
		BACKOFF_MIN = 250;
		BACKOFF_MAX = 5e3;
		textEncoder = new TextEncoder();
		StreamRequestCancelled = class extends Error {
			constructor() {
				super("stream request cancelled");
				this.name = "AbortError";
			}
		};
		BailsSocket = class BailsSocket extends EventTarget {
			get bufferedAmount() {
				return this._buffered;
			}
			constructor(name) {
				super();
				this.CONNECTING = 0;
				this.OPEN = 1;
				this.CLOSING = 2;
				this.CLOSED = 3;
				this.protocol = "";
				this.extensions = "";
				this.binaryType = "arraybuffer";
				this.readyState = BailsSocket.CONNECTING;
				this.onopen = null;
				this.onmessage = null;
				this.onclose = null;
				this.onerror = null;
				this._decode = (payload) => payload;
				this._buffered = 0;
				this._chain = Promise.resolve();
				this._pending = [];
				this._flushing = false;
				this._openAbort = new AbortController();
				this._sendAbort = new AbortController();
				this.name = name;
				this._id = G.nextConnID++;
				this.url = hasDOM ? streamURL("poll") + "#" + encodeURIComponent(name) : "";
				for (const type of [
					"open",
					"message",
					"close",
					"error"
				]) defineHandlerProperty(this, type);
				G.connections.set(this._id, this);
				this._chain = this._chain.then(() => postFrame(this._id, KIND_OPEN, /* @__PURE__ */ new Uint8Array(0), name, this._openAbort.signal)).catch((err) => {
					this._fail(err);
				});
				startPolling();
			}
			send(data) {
				if (this.readyState === BailsSocket.CONNECTING) throw new DOMException("Still in CONNECTING state.", "InvalidStateError");
				if (this.readyState !== BailsSocket.OPEN) return;
				const immediate = toBytesSync(data);
				const snapshot = immediate ? Promise.resolve(immediate) : toBytes(data, this._sendAbort.signal);
				snapshot.catch(() => {});
				const blobSize = !immediate && typeof Blob !== "undefined" && data instanceof Blob ? data.size : 0;
				if (blobSize) this._buffered += blobSize;
				if (immediate) this._buffered += immediate.byteLength;
				this._pending.push(snapshot);
				if (this._flushing) return;
				this._flushing = true;
				this._chain = this._chain.then(async () => {
					try {
						while (this._pending.length > 0) {
							const queued = this._pending.splice(0, MAX_BATCH_FRAMES);
							const batch = await Promise.all(queued);
							if (this.readyState === BailsSocket.CLOSED) break;
							const total = batch.reduce((n, b) => n + b.byteLength, 0);
							try {
								await postBatch(this._id, batch, this._sendAbort.signal);
							} finally {
								this._buffered = Math.max(0, this._buffered - total);
							}
						}
					} finally {
						this._flushing = false;
					}
				}).catch((err) => {
					this._flushing = false;
					this._fail(err);
				});
			}
			close(code = 1e3, reason = "") {
				if (this.readyState === BailsSocket.CLOSING || this.readyState === BailsSocket.CLOSED) return;
				this.readyState = BailsSocket.CLOSING;
				this._pending.length = 0;
				this._buffered = 0;
				this._openAbort.abort();
				this._sendAbort.abort();
				this._chain = this._chain.then(() => postFrame(this._id, KIND_CLOSE, /* @__PURE__ */ new Uint8Array(0))).catch(() => {}).then(() => {
					this._closed(code, reason, true);
				});
			}
			_opened() {
				if (this.readyState !== BailsSocket.CONNECTING) return;
				this.readyState = BailsSocket.OPEN;
				this.dispatchEvent(new Event("open"));
			}
			_message(payload) {
				if (this.readyState !== BailsSocket.OPEN) return;
				let data;
				try {
					data = this._decode(payload);
				} catch (_unused5) {
					this.dispatchEvent(new Event("error"));
					return;
				}
				if (data === payload && this.binaryType === "blob") data = new Blob([payload]);
				this.dispatchEvent(new MessageEvent("message", { data }));
			}
			_fail(err) {
				if (this.readyState === BailsSocket.CLOSED || this.readyState === BailsSocket.CLOSING) return;
				this.dispatchEvent(new Event("error"));
				this._closed(1006, err instanceof Error ? err.message : String(err), false);
			}
			_closed(code, reason, wasClean) {
				var _G$pollAbort;
				if (this.readyState === BailsSocket.CLOSED) return;
				this.readyState = BailsSocket.CLOSED;
				this._openAbort.abort();
				this._sendAbort.abort();
				G.connections.delete(this._id);
				if (G.connections.size === 0) (_G$pollAbort = G.pollAbort) === null || _G$pollAbort === void 0 || _G$pollAbort.abort();
				this._pending.length = 0;
				this._buffered = 0;
				const ev = typeof CloseEvent === "function" ? new CloseEvent("close", {
					code,
					reason,
					wasClean
				}) : Object.assign(new Event("close"), {
					code,
					reason,
					wasClean
				});
				this.dispatchEvent(ev);
			}
		};
		_BailsSocket = BailsSocket;
		_BailsSocket.CONNECTING = 0;
		_BailsSocket.OPEN = 1;
		_BailsSocket.CLOSING = 2;
		_BailsSocket.CLOSED = 3;
	})))();
}

// ../../compiled/main.js
function init_main() {
	return (init_main = __esmMin((() => {
		init_src();
		init_wml();
		init_utils();
		window.bails = src_exports;
		Enable();
		debugLog("Bails Runtime Loaded");
	})))();
}

// src/index.ts
var src_exports = /* @__PURE__ */ __exportAll({
	Android: () => android_exports,
	Application: () => application_exports,
	BailsSocket: () => BailsSocket,
	Browser: () => browser_exports,
	Call: () => calls_exports,
	CancelError: () => CancelError,
	CancellablePromise: () => CancellablePromise,
	CancelledRejectionError: () => CancelledRejectionError,
	Clipboard: () => clipboard_exports,
	Create: () => create_exports,
	Dialogs: () => dialogs_exports,
	Events: () => events_exports,
	Flags: () => flags_exports,
	IOS: () => ios_exports,
	JSONStream: () => JSONStream,
	Screens: () => screens_exports,
	Stream: () => Stream,
	System: () => system_exports,
	Updater: () => updater_exports,
	WML: () => wml_exports,
	Window: () => thisWindow,
	clientId: () => clientId,
	getTransport: () => getTransport,
	loadOptionalScript: () => loadOptionalScript,
	objectNames: () => objectNames,
	setTransport: () => setTransport
});
function loadOptionalScript(url) {
	return fetch(url, { method: "HEAD" }).then((response) => {
		if (response.ok) {
			if ((response.headers.get("content-type") || "").toLowerCase().includes("javascript")) {
				const script = document.createElement("script");
				script.src = url;
				document.head.appendChild(script);
			}
		}
	}).catch(() => {});
}
function init_src() {
	return (init_src = __esmMin((() => {
		init_environment();
		init_contextmenu();
		init_drag();
		init_appregion();
		init_application();
		init_browser();
		init_calls();
		init_clipboard();
		init_create();
		init_dialogs();
		init_events();
		/* @__PURE__ */ init_flags();
		init_screens();
		init_system();
		init_ios();
		init_android();
		init_updater();
		init_window();
		init_wml();
		init_stream();
		init_cancellable();
		init_runtime();
		init_main();
		if (hasDOM) window._bails = window._bails || {};
		if (hasDOM) {
			window._bails.invoke = invoke;
			window._bails.clientId = clientId;
		}
		if (hasDOM) window._bails.handlePlatformFileDrop = thisWindow.HandlePlatformFileDrop.bind(thisWindow);
		if (hasDOM) {
			window._bails.handleDragEnter = handleDragEnter;
			window._bails.handleDragLeave = handleDragLeave;
			window._bails.handleDragOver = handleDragOver;
		}
		if (hasDOM) invoke("bails:runtime:ready");
		if (hasDOM) loadOptionalScript("/bails/custom.js");
	})))();
}

init_src();
export { android_exports as Android, application_exports as Application, BailsSocket, browser_exports as Browser, calls_exports as Call, CancelError, CancellablePromise, CancelledRejectionError, clipboard_exports as Clipboard, create_exports as Create, dialogs_exports as Dialogs, events_exports as Events, flags_exports as Flags, ios_exports as IOS, JSONStream, screens_exports as Screens, Stream, system_exports as System, updater_exports as Updater, wml_exports as WML, thisWindow as Window, clientId, getTransport, loadOptionalScript, objectNames, setTransport };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5kZWJ1Zy5qcyIsIm5hbWVzIjpbIkNIVU5LX1RIUkVTSE9MRCIsImNhbGwiLCJjYWxsIiwiY2FsbCIsIkhpZGVNZXRob2QiLCJTaG93TWV0aG9kIiwiY2FsbCIsImlzQ2FsbGFibGUiLCJjYWxsIiwiY2FsbCIsIkFycmF5IiwiTWFwIiwiRXZlbnRzIiwiY2FsbCIsIkVycm9yIiwiQ3JlYXRlIiwiY2FsbCIsImNhbGwiLCJjYWxsIiwiRGV2aWNlSW5mbyIsIkhhcHRpY3MiLCJEZXZpY2UiLCJXaW5kb3ciLCJSdW50aW1lIiwiU3lzdGVtLmludm9rZSIsIldpbmRvdyJdLCJzb3VyY2VzIjpbIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9AYmFpbHMvcnVudGltZS9zcmMvZW52aXJvbm1lbnQudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQGJhaWxzL3J1bnRpbWUvc3JjL25hbm9pZC50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9AYmFpbHMvcnVudGltZS9zcmMvcnVudGltZS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9AYmFpbHMvcnVudGltZS9zcmMvc3lzdGVtLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0BiYWlscy9ydW50aW1lL3NyYy91dGlscy50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9AYmFpbHMvcnVudGltZS9zcmMvY29udGV4dG1lbnUudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQGJhaWxzL3J1bnRpbWUvc3JjL2ZsYWdzLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0BiYWlscy9ydW50aW1lL3NyYy9kcmFnLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0BiYWlscy9ydW50aW1lL3NyYy9hcHByZWdpb24udHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQGJhaWxzL3J1bnRpbWUvc3JjL2FwcGxpY2F0aW9uLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0BiYWlscy9ydW50aW1lL3NyYy9icm93c2VyLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0BiYWlscy9ydW50aW1lL3NyYy9jYWxsYWJsZS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9AYmFpbHMvcnVudGltZS9zcmMvY2FuY2VsbGFibGUudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQGJhaWxzL3J1bnRpbWUvc3JjL2NhbGxzLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0BiYWlscy9ydW50aW1lL3NyYy9jbGlwYm9hcmQudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQGJhaWxzL3J1bnRpbWUvc3JjL2NyZWF0ZS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9AYmFpbHMvcnVudGltZS9zcmMvZGlhbG9ncy50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9AYmFpbHMvcnVudGltZS9zcmMvbGlzdGVuZXIudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQGJhaWxzL3J1bnRpbWUvc3JjL2V2ZW50X3R5cGVzLnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0BiYWlscy9ydW50aW1lL3NyYy9ldmVudHMudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQGJhaWxzL3J1bnRpbWUvc3JjL3NjcmVlbnMudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQGJhaWxzL3J1bnRpbWUvc3JjL2lvcy50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9AYmFpbHMvcnVudGltZS9zcmMvYW5kcm9pZC50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9AYmFpbHMvcnVudGltZS9zcmMvdXBkYXRlci50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9AYmFpbHMvcnVudGltZS9zcmMvd2luZG93LnRzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0BiYWlscy9ydW50aW1lL3NyYy93bWwudHMiLCIuLi8uLi9ydW50aW1lL2Rlc2t0b3AvQGJhaWxzL3J1bnRpbWUvc3JjL3N0cmVhbS50cyIsIi4uLy4uL3J1bnRpbWUvZGVza3RvcC9jb21waWxlZC9tYWluLmpzIiwiLi4vLi4vcnVudGltZS9kZXNrdG9wL0BiYWlscy9ydW50aW1lL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIF8gICAgIF9fICAgICBfIF9fXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBpbnNpZGUgYSBicm93c2VyL3dlYnZpZXcgd2l0aCBhIERPTSBhdmFpbGFibGUuXG4gKiBGYWxzZSB1bmRlciBzZXJ2ZXItc2lkZSByZW5kZXJpbmcgKGUuZy4gYG5leHQgYnVpbGRgIHByZXJlbmRlcmluZyksXG4gKiB3aGVyZSBhcHBsaWNhdGlvbiBjb2RlIG1heSBpbXBvcnQgdGhlIHJ1bnRpbWUgbW9kdWxlIGV2ZW4gdGhvdWdoIG5vXG4gKiBCYWlscyBBUElzIGNhbiBhY3R1YWxseSBiZSB1c2VkICgjNDY3OSkuIE1vZHVsZXMgbXVzdCBub3QgdG91Y2hcbiAqIGB3aW5kb3dgL2Bkb2N1bWVudGAgYXQgaW1wb3J0IHRpbWUgZXhjZXB0IGJlaGluZCB0aGlzIGd1YXJkLlxuICovXG5leHBvcnQgY29uc3QgaGFzRE9NID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgZG9jdW1lbnQgIT09IFwidW5kZWZpbmVkXCI7XG4iLCIvLyBTb3VyY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9haS9uYW5vaWRcblxuLy8gVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4vL1xuLy8gQ29weXJpZ2h0IDIwMTcgQW5kcmV5IFNpdG5payA8YW5kcmV5QHNpdG5pay5ydT5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mXG4vLyB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluXG4vLyB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvXG4vLyB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZlxuLy8gdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLFxuLy8gICAgIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vICAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbi8vIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTXG4vLyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1Jcbi8vIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUlxuLy8gSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU5cbi8vIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIFRoaXMgYWxwaGFiZXQgdXNlcyBgQS1aYS16MC05Xy1gIHN5bWJvbHMuXG4vLyBUaGUgb3JkZXIgb2YgY2hhcmFjdGVycyBpcyBvcHRpbWl6ZWQgZm9yIGJldHRlciBnemlwIGFuZCBicm90bGkgY29tcHJlc3Npb24uXG4vLyBSZWZlcmVuY2VzIHRvIHRoZSBzYW1lIGZpbGUgKHdvcmtzIGJvdGggZm9yIGd6aXAgYW5kIGJyb3RsaSk6XG4vLyBgJ3VzZWAsIGBhbmRvbWAsIGFuZCBgcmljdCdgXG4vLyBSZWZlcmVuY2VzIHRvIHRoZSBicm90bGkgZGVmYXVsdCBkaWN0aW9uYXJ5OlxuLy8gYC0yNlRgLCBgMTk4M2AsIGA0MHB4YCwgYDc1cHhgLCBgYnVzaGAsIGBqYWNrYCwgYG1pbmRgLCBgdmVyeWAsIGFuZCBgd29sZmBcbmNvbnN0IHVybEFscGhhYmV0ID1cbiAgICAndXNlYW5kb20tMjZUMTk4MzQwUFg3NXB4SkFDS1ZFUllNSU5EQlVTSFdPTEZfR1FaYmZnaGprbHF2d3l6cmljdCdcblxuLy8gTU9ESUZJRUQgRk9SIEJBSUxTOiB0aGUgdXBzdHJlYW0gaW1wbGVtZW50YXRpb24gZHJhd3MgZnJvbSBNYXRoLnJhbmRvbSgpLFxuLy8gd2hpY2ggaXMgbm90IGEgY3J5cHRvZ3JhcGhpYyBzb3VyY2UuIFRoZXNlIGlkcyBhcmUgdXNlZCBmb3IgdGhlIHJ1bnRpbWVcbi8vIGNsaWVudCBpZCwgYmluZGluZyBjYWxsIGlkcywgY2h1bmsgaWRzLCBhbmQgZGVza3RvcCBzdHJlYW0gc2Vzc2lvbiBpZHMuIFRoZXlcbi8vIGFyZSBjb3JyZWxhdGlvbiBpZGVudGlmaWVycyByYXRoZXIgdGhhbiBhdXRoZW50aWNhdGlvbiBjYXBhYmlsaXRpZXMsIGJ1dCBhXG4vLyBzdHJvbmdlciBzb3VyY2UgbWFrZXMgYWNjaWRlbnRhbCBjb2xsaXNpb25zIG5lZ2xpZ2libGUgZXZlbiBhY3Jvc3MgbWFueVxuLy8gY29uY3VycmVudGx5IGxvYWRlZCBydW50aW1lcy4gVGhlIGFscGhhYmV0IGlzIDY0IGNoYXJhY3RlcnMsIHNvIG1hc2tpbmcgYVxuLy8gcmFuZG9tIGJ5dGUgd2l0aCA2MyBpcyB1bmlmb3JtIOKAlCBubyByZWplY3Rpb24gc2FtcGxpbmcgbmVlZGVkLlxuZXhwb3J0IGZ1bmN0aW9uIG5hbm9pZChzaXplOiBudW1iZXIgPSAyMSk6IHN0cmluZyB7XG4gICAgY29uc3Qgc291cmNlID0gdHlwZW9mIGNyeXB0byAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgID8gY3J5cHRvXG4gICAgICAgIDogbnVsbDtcblxuICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShzaXplKTtcbiAgICAgICAgc291cmNlLmdldFJhbmRvbVZhbHVlcyhieXRlcyk7XG4gICAgICAgIGxldCBpZCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICAgICAgaWQgKz0gdXJsQWxwaGFiZXRbYnl0ZXNbaV0gJiA2M107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlkO1xuICAgIH1cblxuICAgIC8vIEZhbGxiYWNrIGZvciBlbnZpcm9ubWVudHMgd2l0aG91dCBXZWIgQ3J5cHRvICh2ZXJ5IG9sZCBlbmdpbmVzLCBzb21lXG4gICAgLy8gc2VydmVyLXNpZGUgcmVuZGVyaW5nIGNvbnRleHRzKS4gSWRzIHJlbWFpbiB1bmlxdWUgYnV0IG5vdCB1bmd1ZXNzYWJsZS5cbiAgICBsZXQgaWQgPSAnJztcbiAgICBsZXQgaSA9IHNpemUgfCAwO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgaWQgKz0gdXJsQWxwaGFiZXRbKE1hdGgucmFuZG9tKCkgKiA2NCkgfCAwXTtcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xufVxuIiwiLypcbiBfICAgICBfXyAgICAgXyBfX1xufCB8ICAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCB7IG5hbm9pZCB9IGZyb20gXCIuL25hbm9pZC5qc1wiO1xuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcblxuLy8gUmVzb2x2ZWQgbGF6aWx5OiB3aW5kb3cgZG9lcyBub3QgZXhpc3Qgd2hlbiB0aGUgbW9kdWxlIGlzIGltcG9ydGVkIGR1cmluZ1xuLy8gc2VydmVyLXNpZGUgcmVuZGVyaW5nICgjNDY3OSksIGFuZCBub3RoaW5nIGNhbiBjYWxsIHRoZSBydW50aW1lIHRoZXJlLlxuZnVuY3Rpb24gcnVudGltZVVSTCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgXCIvYmFpbHMvcnVudGltZVwiO1xufVxuXG4vLyBTdGF5IHVuZGVyIFdlYlZpZXcyJ3MgfjJNQiByZXF1ZXN0IGJvZHkgYnVmZmVyaW5nIGxpbWl0IGluIFdlYlJlc291cmNlUmVxdWVzdGVkLlxuY29uc3QgQ0hVTktfVEhSRVNIT0xEID0gNTEyICogMTAyNDtcblxuLy8gUmUtZXhwb3J0IG5hbm9pZCBmb3IgY3VzdG9tIHRyYW5zcG9ydCBpbXBsZW1lbnRhdGlvbnNcbmV4cG9ydCB7IG5hbm9pZCB9O1xuXG50eXBlIENhbGxFcnJvclR5cGUgPSB7XG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIGNhdXNlPzogdW5rbm93bixcbiAgICBraW5kOiBcIlJlZmVyZW5jZUVycm9yXCIgfCBcIlR5cGVFcnJvclwiIHwgXCJSdW50aW1lRXJyb3JcIlxufVxuXG4vKipcbiAqIEV4Y2VwdGlvbiBjbGFzcyB0aGF0IHdpbGwgYmUgdGhyb3duIGluIGNhc2UgdGhlIGJvdW5kIG1ldGhvZCByZXR1cm5zIGFuIGVycm9yLlxuICogVGhlIHZhbHVlIG9mIHRoZSB7QGxpbmsgUnVudGltZUVycm9yI25hbWV9IHByb3BlcnR5IGlzIFwiUnVudGltZUVycm9yXCIuXG4gKi9cbmV4cG9ydCBjbGFzcyBSdW50aW1lRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIG5ldyBSdW50aW1lRXJyb3IgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBFcnJvciBjb25zdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBvcHRpb25zPzogRXJyb3JPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm5hbWUgPSBcIlJ1bnRpbWVFcnJvclwiO1xuICAgIH1cbn1cblxuLy8gT2JqZWN0IE5hbWVzXG5leHBvcnQgY29uc3Qgb2JqZWN0TmFtZXMgPSBPYmplY3QuZnJlZXplKHtcbiAgICBDYWxsOiAwLFxuICAgIENsaXBib2FyZDogMSxcbiAgICBBcHBsaWNhdGlvbjogMixcbiAgICBFdmVudHM6IDMsXG4gICAgQ29udGV4dE1lbnU6IDQsXG4gICAgRGlhbG9nOiA1LFxuICAgIFdpbmRvdzogNixcbiAgICBTY3JlZW5zOiA3LFxuICAgIFN5c3RlbTogOCxcbiAgICBCcm93c2VyOiA5LFxuICAgIENhbmNlbENhbGw6IDEwLFxuICAgIElPUzogMTEsXG4gICAgQW5kcm9pZDogMTIsXG59KTtcbmV4cG9ydCBsZXQgY2xpZW50SWQgPSBuYW5vaWQoKTtcblxuLyoqXG4gKiBSdW50aW1lVHJhbnNwb3J0IGRlZmluZXMgdGhlIGludGVyZmFjZSBmb3IgY3VzdG9tIElQQyB0cmFuc3BvcnQgaW1wbGVtZW50YXRpb25zLlxuICogSW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlIHRvIHVzZSBXZWJTb2NrZXRzLCBjdXN0b20gcHJvdG9jb2xzLCBvciBhbnkgb3RoZXJcbiAqIHRyYW5zcG9ydCBtZWNoYW5pc20gaW5zdGVhZCBvZiB0aGUgZGVmYXVsdCBIVFRQIGZldGNoLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJ1bnRpbWVUcmFuc3BvcnQge1xuICAgIC8qKlxuICAgICAqIFNlbmQgYSBydW50aW1lIGNhbGwgYW5kIHJldHVybiB0aGUgcmVzcG9uc2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb2JqZWN0SUQgLSBUaGUgQmFpbHMgb2JqZWN0IElEICgwPUNhbGwsIDE9Q2xpcGJvYXJkLCBldGMuKVxuICAgICAqIEBwYXJhbSBtZXRob2QgLSBUaGUgbWV0aG9kIElEIHRvIGNhbGxcbiAgICAgKiBAcGFyYW0gd2luZG93TmFtZSAtIE9wdGlvbmFsIHdpbmRvdyBuYW1lXG4gICAgICogQHBhcmFtIGFyZ3MgLSBBcmd1bWVudHMgdG8gcGFzcyAod2lsbCBiZSBKU09OIHN0cmluZ2lmaWVkIGlmIHByZXNlbnQpXG4gICAgICogQHJldHVybnMgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIHJlc3BvbnNlIGRhdGFcbiAgICAgKi9cbiAgICBjYWxsKG9iamVjdElEOiBudW1iZXIsIG1ldGhvZDogbnVtYmVyLCB3aW5kb3dOYW1lOiBzdHJpbmcsIGFyZ3M6IGFueSk6IFByb21pc2U8YW55Pjtcbn1cblxuLyoqXG4gKiBDdXN0b20gdHJhbnNwb3J0IGltcGxlbWVudGF0aW9uIChjYW4gYmUgc2V0IGJ5IHVzZXIpXG4gKi9cbmxldCBjdXN0b21UcmFuc3BvcnQ6IFJ1bnRpbWVUcmFuc3BvcnQgfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBTZXQgYSBjdXN0b20gdHJhbnNwb3J0IGZvciBhbGwgQmFpbHMgcnVudGltZSBjYWxscy5cbiAqIFRoaXMgYWxsb3dzIHlvdSB0byByZXBsYWNlIHRoZSBkZWZhdWx0IEhUVFAgZmV0Y2ggdHJhbnNwb3J0IHdpdGhcbiAqIFdlYlNvY2tldHMsIGN1c3RvbSBwcm90b2NvbHMsIG9yIGFueSBvdGhlciBtZWNoYW5pc20uXG4gKlxuICogQHBhcmFtIHRyYW5zcG9ydCAtIFlvdXIgY3VzdG9tIHRyYW5zcG9ydCBpbXBsZW1lbnRhdGlvblxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBzZXRUcmFuc3BvcnQgfSBmcm9tICcvYmFpbHMvcnVudGltZS5qcyc7XG4gKlxuICogY29uc3Qgd3NUcmFuc3BvcnQgPSB7XG4gKiAgIGNhbGw6IGFzeW5jIChvYmplY3RJRCwgbWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKSA9PiB7XG4gKiAgICAgLy8gWW91ciBXZWJTb2NrZXQgaW1wbGVtZW50YXRpb25cbiAqICAgfVxuICogfTtcbiAqXG4gKiBzZXRUcmFuc3BvcnQod3NUcmFuc3BvcnQpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRUcmFuc3BvcnQodHJhbnNwb3J0OiBSdW50aW1lVHJhbnNwb3J0IHwgbnVsbCk6IHZvaWQge1xuICAgIGN1c3RvbVRyYW5zcG9ydCA9IHRyYW5zcG9ydDtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgdHJhbnNwb3J0ICh1c2VmdWwgZm9yIGV4dGVuZGluZy93cmFwcGluZylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zcG9ydCgpOiBSdW50aW1lVHJhbnNwb3J0IHwgbnVsbCB7XG4gICAgcmV0dXJuIGN1c3RvbVRyYW5zcG9ydDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHJ1bnRpbWUgY2FsbGVyIHdpdGggc3BlY2lmaWVkIElELlxuICpcbiAqIEBwYXJhbSBvYmplY3QgLSBUaGUgb2JqZWN0IHRvIGludm9rZSB0aGUgbWV0aG9kIG9uLlxuICogQHBhcmFtIHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93LlxuICogQHJldHVybiBUaGUgbmV3IHJ1bnRpbWUgY2FsbGVyIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbmV3UnVudGltZUNhbGxlcihvYmplY3Q6IG51bWJlciwgd2luZG93TmFtZTogc3RyaW5nID0gJycpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1ldGhvZDogbnVtYmVyLCBhcmdzOiBhbnkgPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBydW50aW1lQ2FsbFdpdGhJRChvYmplY3QsIG1ldGhvZCwgd2luZG93TmFtZSwgYXJncyk7XG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVudGltZUNhbGxXaXRoSUQob2JqZWN0SUQ6IG51bWJlciwgbWV0aG9kOiBudW1iZXIsIHdpbmRvd05hbWU6IHN0cmluZywgYXJnczogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAvLyBVc2UgY3VzdG9tIHRyYW5zcG9ydCBpZiBhdmFpbGFibGVcbiAgICBpZiAoY3VzdG9tVHJhbnNwb3J0KSB7XG4gICAgICAgIHJldHVybiBjdXN0b21UcmFuc3BvcnQuY2FsbChvYmplY3RJRCwgbWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKTtcbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IEhUVFAgZmV0Y2ggdHJhbnNwb3J0XG4gICAgbGV0IHVybCA9IG5ldyBVUkwocnVudGltZVVSTCgpKTtcblxuICAgIGxldCBib2R5OiB7IG9iamVjdDogbnVtYmVyOyBtZXRob2Q6IG51bWJlciwgYXJncz86IGFueSB9ID0ge1xuICAgICAgb2JqZWN0OiBvYmplY3RJRCxcbiAgICAgIG1ldGhvZFxuICAgIH1cbiAgICBpZiAoYXJncyAhPT0gbnVsbCAmJiBhcmdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGJvZHkuYXJncyA9IGFyZ3M7XG4gICAgfVxuXG4gICAgbGV0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgIFtcIngtYmFpbHMtY2xpZW50LWlkXCJdOiBjbGllbnRJZCxcbiAgICAgICAgW1wiQ29udGVudC1UeXBlXCJdOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgIH1cbiAgICBpZiAod2luZG93TmFtZSkge1xuICAgICAgICBoZWFkZXJzW1wieC1iYWlscy13aW5kb3ctbmFtZVwiXSA9IHdpbmRvd05hbWU7XG4gICAgfVxuXG4gICAgY29uc3QgYm9keVN0ciA9IEpTT04uc3RyaW5naWZ5KGJvZHkpO1xuICAgIGxldCByZXNwb25zZTogUmVzcG9uc2U7XG4gICAgaWYgKGJvZHlTdHIubGVuZ3RoID4gQ0hVTktfVEhSRVNIT0xEKSB7XG4gICAgICAgIHJlc3BvbnNlID0gYXdhaXQgc2VuZENodW5rZWQodXJsLCBoZWFkZXJzLCBib2R5U3RyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyBtZXRob2Q6ICdQT1NUJywgaGVhZGVycywgYm9keTogYm9keVN0ciB9KTtcbiAgICB9XG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgY29uc3QgY3QgPSByZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKTtcbiAgICAgIGlmIChjdD8uaW5jbHVkZXMoXCJhcHBsaWNhdGlvbi9qc29uXCIpKSB7XG4gICAgICAgICAgY29uc3QganNvbjogQ2FsbEVycm9yVHlwZSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICBsZXQgZXJyO1xuICAgICAgICAgIHN3aXRjaCAoanNvbi5raW5kKSB7XG4gICAgICAgICAgICAgIGNhc2UgXCJSZWZlcmVuY2VFcnJvclwiOiBlcnIgPSBuZXcgUmVmZXJlbmNlRXJyb3IoanNvbi5tZXNzYWdlKTsgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJUeXBlRXJyb3JcIjogICAgICBlcnIgPSBuZXcgVHlwZUVycm9yKGpzb24ubWVzc2FnZSk7IGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIFwiUnVudGltZUVycm9yXCI6ICAgZXJyID0gbmV3IFJ1bnRpbWVFcnJvcihqc29uLm1lc3NhZ2UpOyBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDogICAgICAgICAgICAgICBlcnIgPSBuZXcgRXJyb3IoanNvbi5tZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXJyLmNhdXNlID0ganNvbi5jYXVzZTtcbiAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihhd2FpdCByZXNwb25zZS50ZXh0KCkpO1xuICAgIH1cblxuICAgIGlmICgocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIik/LmluZGV4T2YoXCJhcHBsaWNhdGlvbi9qc29uXCIpID8/IC0xKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgIH1cbn1cblxuLy8gc2VuZENodW5rZWQgc3BsaXRzIGEgbGFyZ2Ugc2VyaWFsaXNlZCByZXF1ZXN0IGJvZHkgaW50byBDSFVOS19USFJFU0hPTEQtc2l6ZWRcbi8vIGJ5dGUgY2h1bmtzIGFuZCBzZW5kcyB0aGVtIHNlcmlhbGx5LiAgRW5jb2RpbmcgdG8gVVRGLTggYnl0ZXMgYmVmb3JlIHNsaWNpbmdcbi8vIHByZXZlbnRzIGNvcnJ1cHRpb24gb2Ygbm9uLUJNUCBjaGFyYWN0ZXJzIChzdXJyb2dhdGUgcGFpcnMpIHRoYXQgd291bGQgb2NjdXJcbi8vIHdoZW4gc3BsaXR0aW5nIGF0IEphdmFTY3JpcHQgc3RyaW5nIGluZGljZXMuICBUaGUgR28gdHJhbnNwb3J0IGFzc2VtYmxlcyB0aGVcbi8vIHJhdyBieXRlcyBiZWZvcmUgcHJvY2Vzc2luZy4gIE9ubHkgdGhlIGZpbmFsIGNodW5rJ3MgcmVzcG9uc2UgY2FycmllcyB0aGUgUlBDIHJlc3VsdC5cbmFzeW5jIGZ1bmN0aW9uIHNlbmRDaHVua2VkKHVybDogVVJMLCBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LCBib2R5U3RyOiBzdHJpbmcpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgY29uc3QgY2h1bmtJZCA9IG5hbm9pZCgpO1xuICAgIGNvbnN0IGJvZHlCeXRlcyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShib2R5U3RyKTtcbiAgICBjb25zdCB0b3RhbENodW5rcyA9IE1hdGguY2VpbChib2R5Qnl0ZXMubGVuZ3RoIC8gQ0hVTktfVEhSRVNIT0xEKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG90YWxDaHVua3MgLSAxOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2h1bmsgPSBib2R5Qnl0ZXMuc3ViYXJyYXkoaSAqIENIVU5LX1RIUkVTSE9MRCwgKGkgKyAxKSAqIENIVU5LX1RIUkVTSE9MRCk7XG4gICAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICAgICAgICAgICAgJ3gtYmFpbHMtY2h1bmstaWQnOiBjaHVua0lkLFxuICAgICAgICAgICAgICAgICd4LWJhaWxzLWNodW5rLWluZGV4JzogU3RyaW5nKGkpLFxuICAgICAgICAgICAgICAgICd4LWJhaWxzLWNodW5rLXRvdGFsJzogU3RyaW5nKHRvdGFsQ2h1bmtzKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBjaHVuayxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcmVzcC5vaykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGF3YWl0IHJlc3AudGV4dCgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICAgICAgICAneC1iYWlscy1jaHVuay1pZCc6IGNodW5rSWQsXG4gICAgICAgICAgICAneC1iYWlscy1jaHVuay1pbmRleCc6IFN0cmluZyh0b3RhbENodW5rcyAtIDEpLFxuICAgICAgICAgICAgJ3gtYmFpbHMtY2h1bmstdG90YWwnOiBTdHJpbmcodG90YWxDaHVua3MpLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBib2R5Qnl0ZXMuc3ViYXJyYXkoKHRvdGFsQ2h1bmtzIC0gMSkgKiBDSFVOS19USFJFU0hPTEQpLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIEFuZHJvaWQgV2ViVmlldyBjYW5ub3QgZGVsaXZlciBmZXRjaCgpIFBPU1QgYm9kaWVzIHRvXG4gKiBzaG91bGRJbnRlcmNlcHRSZXF1ZXN0LCBzbyB0aGUgZGVmYXVsdCBIVFRQIHRyYW5zcG9ydCBjYW5ub3QgcmVhY2ggR28uXG4gKiBXaGVuIHRoZSBBbmRyb2lkIEphdmFzY3JpcHRJbnRlcmZhY2UgYnJpZGdlICh3aW5kb3cuYmFpbHMpIGlzIHByZXNlbnQsXG4gKiByb3V0ZSBydW50aW1lIGNhbGxzIHRocm91Z2ggaXQgaW5zdGVhZC4gUmVzcG9uc2VzIGFycml2ZSB2aWFcbiAqIHdpbmRvdy5fYmFpbHNBbmRyb2lkQ2FsbGJhY2ssIGludm9rZWQgYnkgdGhlIEphdmEgc2lkZS5cbiAqL1xuaW50ZXJmYWNlIEFuZHJvaWRKU0JyaWRnZSB7XG4gICAgaW52b2tlQXN5bmMoY2FsbGJhY2tJRDogc3RyaW5nLCBwYXlsb2FkOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5jb25zdCBhbmRyb2lkQnJpZGdlOiBBbmRyb2lkSlNCcmlkZ2UgfCBudWxsID0gaGFzRE9NICYmXG4gICAgdHlwZW9mICh3aW5kb3cgYXMgYW55KS5iYWlscz8uaW52b2tlQXN5bmMgPT09IFwiZnVuY3Rpb25cIiA/ICh3aW5kb3cgYXMgYW55KS5iYWlscyA6IG51bGw7XG5cbmlmIChhbmRyb2lkQnJpZGdlKSB7XG4gICAgY29uc3QgcGVuZGluZyA9IG5ldyBNYXA8c3RyaW5nLCB7IHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkOyByZWplY3Q6IChyZWFzb246IGFueSkgPT4gdm9pZCB9PigpO1xuXG4gICAgKHdpbmRvdyBhcyBhbnkpLl9iYWlsc0FuZHJvaWRDYWxsYmFjayA9IChpZDogc3RyaW5nLCByZXNwb25zZTogc3RyaW5nIHwgbnVsbCwgZXJyb3I6IHN0cmluZyB8IG51bGwpID0+IHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHBlbmRpbmcuZ2V0KGlkKTtcbiAgICAgICAgaWYgKCFwcm9taXNlKSByZXR1cm47XG4gICAgICAgIHBlbmRpbmcuZGVsZXRlKGlkKTtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZW52ZWxvcGUgPSBKU09OLnBhcnNlKHJlc3BvbnNlID8/IFwie31cIik7XG4gICAgICAgICAgICBpZiAoIWVudmVsb3BlLm9rKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGVudmVsb3BlLmVycm9yID8/IFwidW5rbm93biBydW50aW1lIGNhbGwgZXJyb3JcIikpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZShcInRleHRcIiBpbiBlbnZlbG9wZSA/IGVudmVsb3BlLnRleHQgOiBlbnZlbG9wZS5kYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QoZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY3VzdG9tVHJhbnNwb3J0ID0ge1xuICAgICAgICBjYWxsKG9iamVjdElEOiBudW1iZXIsIG1ldGhvZDogbnVtYmVyLCB3aW5kb3dOYW1lOiBzdHJpbmcsIGFyZ3M6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gbmFub2lkKCk7XG4gICAgICAgICAgICAgICAgcGVuZGluZy5zZXQoaWQsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGFuZHJvaWRCcmlkZ2UuaW52b2tlQXN5bmMoaWQsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogb2JqZWN0SUQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvd05hbWU6IHdpbmRvd05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBhcmdzID8/IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogY2xpZW50SWQsXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IGxlYWsgdGhlIHBlbmRpbmcgZW50cnkgaWYgZGlzcGF0Y2ggdGhyb3dzIHN5bmNocm9ub3VzbHlcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgfTtcbn1cbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcblxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuU3lzdGVtKTtcblxuY29uc3QgU3lzdGVtSXNEYXJrTW9kZSA9IDA7XG5jb25zdCBTeXN0ZW1FbnZpcm9ubWVudCA9IDE7XG5jb25zdCBTeXN0ZW1DYXBhYmlsaXRpZXMgPSAyO1xuXG5jb25zdCBfaW52b2tlID0gKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICAvLyBXaW5kb3dzIFdlYlZpZXcyXG4gICAgICAgIGlmICgod2luZG93IGFzIGFueSkuY2hyb21lPy53ZWJ2aWV3Py5wb3N0TWVzc2FnZSkge1xuICAgICAgICAgICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5jaHJvbWUud2Vidmlldy5wb3N0TWVzc2FnZS5iaW5kKCh3aW5kb3cgYXMgYW55KS5jaHJvbWUud2Vidmlldyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbWFjT1MvaU9TIFdLV2ViVmlld1xuICAgICAgICBlbHNlIGlmICgod2luZG93IGFzIGFueSkud2Via2l0Py5tZXNzYWdlSGFuZGxlcnM/LlsnZXh0ZXJuYWwnXT8ucG9zdE1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiAod2luZG93IGFzIGFueSkud2Via2l0Lm1lc3NhZ2VIYW5kbGVyc1snZXh0ZXJuYWwnXS5wb3N0TWVzc2FnZS5iaW5kKCh3aW5kb3cgYXMgYW55KS53ZWJraXQubWVzc2FnZUhhbmRsZXJzWydleHRlcm5hbCddKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBbmRyb2lkIFdlYlZpZXcgLSB1c2VzIGFkZEphdmFzY3JpcHRJbnRlcmZhY2Ugd2hpY2ggZXhwb3NlcyB3aW5kb3cuYmFpbHMuaW52b2tlXG4gICAgICAgIGVsc2UgaWYgKCh3aW5kb3cgYXMgYW55KS5iYWlscz8uaW52b2tlKSB7XG4gICAgICAgICAgICBjb25zdCBicmlkZ2UgPSAod2luZG93IGFzIGFueSkuYmFpbHM7XG4gICAgICAgICAgICByZXR1cm4gKG1zZzogYW55KSA9PiBicmlkZ2UuaW52b2tlKHR5cGVvZiBtc2cgPT09ICdzdHJpbmcnID8gbXNnIDogSlNPTi5zdHJpbmdpZnkobXNnKSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICBjb25zb2xlLndhcm4oJ1xcbiVj4pqg77iPIEJyb3dzZXIgRW52aXJvbm1lbnQgRGV0ZWN0ZWQgJWNcXG5cXG4lY09ubHkgVUkgcHJldmlld3MgYXJlIGF2YWlsYWJsZSBpbiB0aGUgYnJvd3Nlci4gRm9yIGZ1bGwgZnVuY3Rpb25hbGl0eSwgcGxlYXNlIHJ1biB0aGUgYXBwbGljYXRpb24gaW4gZGVza3RvcCBtb2RlLlxcbk1vcmUgaW5mb3JtYXRpb24gYXQ6IGh0dHBzOi8vdjMud2FpbHMuaW8vbGVhcm4vYnVpbGQvI3VzaW5nLWEtYnJvd3Nlci1mb3ItZGV2ZWxvcG1lbnRcXG4nLFxuICAgICAgICAnYmFja2dyb3VuZDogI2ZmZmZmZjsgY29sb3I6ICMwMDAwMDA7IGZvbnQtd2VpZ2h0OiBib2xkOyBwYWRkaW5nOiA0cHggOHB4OyBib3JkZXItcmFkaXVzOiA0cHg7IGJvcmRlcjogMnB4IHNvbGlkICMwMDAwMDA7JyxcbiAgICAgICAgJ2JhY2tncm91bmQ6IHRyYW5zcGFyZW50OycsXG4gICAgICAgICdjb2xvcjogI2ZmZmZmZjsgZm9udC1zdHlsZTogaXRhbGljOyBmb250LXdlaWdodDogYm9sZDsnKTtcbiAgICByZXR1cm4gbnVsbDtcbn0pKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZva2UobXNnOiBhbnkpOiB2b2lkIHtcbiAgICBfaW52b2tlPy4obXNnKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHN5c3RlbSBkYXJrIG1vZGUgc3RhdHVzLlxuICpcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIGlmIHRoZSBzeXN0ZW0gaXMgaW4gZGFyayBtb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNEYXJrTW9kZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gY2FsbChTeXN0ZW1Jc0RhcmtNb2RlKTtcbn1cblxuLyoqXG4gKiBGZXRjaGVzIHRoZSBjYXBhYmlsaXRpZXMgb2YgdGhlIGFwcGxpY2F0aW9uIGZyb20gdGhlIHNlcnZlci5cbiAqXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgY2FwYWJpbGl0aWVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gQ2FwYWJpbGl0aWVzKCk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgYW55Pj4ge1xuICAgIHJldHVybiBjYWxsKFN5c3RlbUNhcGFiaWxpdGllcyk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT1NJbmZvIHtcbiAgICAvKiogVGhlIGJyYW5kaW5nIG9mIHRoZSBPUy4gKi9cbiAgICBCcmFuZGluZzogc3RyaW5nO1xuICAgIC8qKiBUaGUgSUQgb2YgdGhlIE9TLiAqL1xuICAgIElEOiBzdHJpbmc7XG4gICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBPUy4gKi9cbiAgICBOYW1lOiBzdHJpbmc7XG4gICAgLyoqIFRoZSB2ZXJzaW9uIG9mIHRoZSBPUy4gKi9cbiAgICBWZXJzaW9uOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW52aXJvbm1lbnRJbmZvIHtcbiAgICAvKiogVGhlIGFyY2hpdGVjdHVyZSBvZiB0aGUgc3lzdGVtLiAqL1xuICAgIEFyY2g6IHN0cmluZztcbiAgICAvKiogVHJ1ZSBpZiB0aGUgYXBwbGljYXRpb24gaXMgcnVubmluZyBpbiBkZWJ1ZyBtb2RlLCBvdGhlcndpc2UgZmFsc2UuICovXG4gICAgRGVidWc6IGJvb2xlYW47XG4gICAgLyoqIFRoZSBvcGVyYXRpbmcgc3lzdGVtIGluIHVzZS4gKi9cbiAgICBPUzogc3RyaW5nO1xuICAgIC8qKiBEZXRhaWxzIG9mIHRoZSBvcGVyYXRpbmcgc3lzdGVtLiAqL1xuICAgIE9TSW5mbzogT1NJbmZvO1xuICAgIC8qKiBBZGRpdGlvbmFsIHBsYXRmb3JtIGluZm9ybWF0aW9uLiAqL1xuICAgIFBsYXRmb3JtSW5mbzogUmVjb3JkPHN0cmluZywgYW55Pjtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgZW52aXJvbm1lbnQgZGV0YWlscy5cbiAqXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBvYmplY3QgY29udGFpbmluZyBPUyBhbmQgc3lzdGVtIGFyY2hpdGVjdHVyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVudmlyb25tZW50KCk6IFByb21pc2U8RW52aXJvbm1lbnRJbmZvPiB7XG4gICAgcmV0dXJuIGNhbGwoU3lzdGVtRW52aXJvbm1lbnQpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIFdpbmRvd3MuXG4gKlxuICogQHJldHVybiBUcnVlIGlmIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGlzIFdpbmRvd3MsIG90aGVyd2lzZSBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzV2luZG93cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl9iYWlscz8uZW52aXJvbm1lbnQ/Lk9TID09PSBcIndpbmRvd3NcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBMaW51eC5cbiAqXG4gKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBMaW51eCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNMaW51eCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl9iYWlscz8uZW52aXJvbm1lbnQ/Lk9TID09PSBcImxpbnV4XCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIGEgbWFjT1Mgb3BlcmF0aW5nIHN5c3RlbS5cbiAqXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBlbnZpcm9ubWVudCBpcyBtYWNPUywgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNNYWMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5fYmFpbHM/LmVudmlyb25tZW50Py5PUyA9PT0gXCJkYXJ3aW5cIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBpT1MuXG4gKlxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgb3BlcmF0aW5nIHN5c3RlbSBpcyBpT1MsIG90aGVyd2lzZSBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzSU9TKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX2JhaWxzPy5lbnZpcm9ubWVudD8uT1MgPT09IFwiaW9zXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgQW5kcm9pZC5cbiAqXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGlzIEFuZHJvaWQsIG90aGVyd2lzZSBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQW5kcm9pZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl9iYWlscz8uZW52aXJvbm1lbnQ/Lk9TID09PSBcImFuZHJvaWRcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGFwcCBpcyBydW5uaW5nIG9uIGEgbW9iaWxlIE9TIChpT1Mgb3IgQW5kcm9pZCkuXG4gKlxuICogQHJldHVybnMgVHJ1ZSBvbiBpT1Mgb3IgQW5kcm9pZCwgb3RoZXJ3aXNlIGZhbHNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNNb2JpbGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIElzSU9TKCkgfHwgSXNBbmRyb2lkKCk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBhcHAgaXMgcnVubmluZyBvbiBhIGRlc2t0b3AgT1MgKG1hY09TLCBXaW5kb3dzIG9yIExpbnV4KS5cbiAqXG4gKiBAcmV0dXJucyBUcnVlIG9uIG1hY09TLCBXaW5kb3dzIG9yIExpbnV4LCBvdGhlcndpc2UgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0Rlc2t0b3AoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIElzTWFjKCkgfHwgSXNXaW5kb3dzKCkgfHwgSXNMaW51eCgpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBhcmNoaXRlY3R1cmUgaXMgQU1ENjQuXG4gKlxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBhcmNoaXRlY3R1cmUgaXMgQU1ENjQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQU1ENjQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5fYmFpbHM/LmVudmlyb25tZW50Py5BcmNoID09PSBcImFtZDY0XCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGFyY2hpdGVjdHVyZSBpcyBBUk0uXG4gKlxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY3VycmVudCBhcmNoaXRlY3R1cmUgaXMgQVJNLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0FSTSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl9iYWlscz8uZW52aXJvbm1lbnQ/LkFyY2ggPT09IFwiYXJtXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIEFSTTY0IGFyY2hpdGVjdHVyZS5cbiAqXG4gKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIEFSTTY0IGFyY2hpdGVjdHVyZSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0FSTTY0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuX2JhaWxzPy5lbnZpcm9ubWVudD8uQXJjaCA9PT0gXCJhcm02NFwiO1xufVxuXG4vKipcbiAqIFJlcG9ydHMgd2hldGhlciB0aGUgYXBwIGlzIGJlaW5nIHJ1biBpbiBkZWJ1ZyBtb2RlLlxuICpcbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGFwcCBpcyBiZWluZyBydW4gaW4gZGVidWcgbW9kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRGVidWcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEJvb2xlYW4oKHdpbmRvdyBhcyBhbnkpLl9iYWlscz8uZW52aXJvbm1lbnQ/LkRlYnVnKTtcbn1cblxuIiwiLypcbiBfICAgICBfXyAgICAgXyBfX1xufCB8ICAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qKlxuICogTG9ncyBhIG1lc3NhZ2UgdG8gdGhlIGNvbnNvbGUgd2l0aCBjdXN0b20gZm9ybWF0dGluZy5cbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIGJlIGxvZ2dlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnTG9nKG1lc3NhZ2U6IGFueSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAnJWMgYmFpbHMgJWMgJyArIG1lc3NhZ2UgKyAnICcsXG4gICAgICAgICdiYWNrZ3JvdW5kOiAjYWEwMDAwOyBjb2xvcjogI2ZmZjsgYm9yZGVyLXJhZGl1czogM3B4IDBweCAwcHggM3B4OyBwYWRkaW5nOiAxcHg7IGZvbnQtc2l6ZTogMC43cmVtJyxcbiAgICAgICAgJ2JhY2tncm91bmQ6ICMwMDk5MDA7IGNvbG9yOiAjZmZmOyBib3JkZXItcmFkaXVzOiAwcHggM3B4IDNweCAwcHg7IHBhZGRpbmc6IDFweDsgZm9udC1zaXplOiAwLjdyZW0nXG4gICAgKTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgd2VidmlldyBzdXBwb3J0cyB0aGUge0BsaW5rIE1vdXNlRXZlbnQjYnV0dG9uc30gcHJvcGVydHkuXG4gKiBMb29raW5nIGF0IHlvdSBtYWNPUyBIaWdoIFNpZXJyYSFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhblRyYWNrQnV0dG9ucygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKG5ldyBNb3VzZUV2ZW50KCdtb3VzZWRvd24nKSkuYnV0dG9ucyA9PT0gMDtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYnJvd3NlciBzdXBwb3J0cyByZW1vdmluZyBsaXN0ZW5lcnMgYnkgdHJpZ2dlcmluZyBhbiBBYm9ydFNpZ25hbFxuICogKHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRXZlbnRUYXJnZXQvYWRkRXZlbnRMaXN0ZW5lciNzaWduYWwpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FuQWJvcnRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKCFFdmVudFRhcmdldCB8fCAhQWJvcnRTaWduYWwgfHwgIUFib3J0Q29udHJvbGxlcilcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IHJlc3VsdCA9IHRydWU7XG5cbiAgICBjb25zdCB0YXJnZXQgPSBuZXcgRXZlbnRUYXJnZXQoKTtcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgKCkgPT4geyByZXN1bHQgPSBmYWxzZTsgfSwgeyBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsIH0pO1xuICAgIGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3Rlc3QnKSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJlc29sdmVzIHRoZSBjbG9zZXN0IEhUTUxFbGVtZW50IGFuY2VzdG9yIG9mIGFuIGV2ZW50J3MgdGFyZ2V0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRUYXJnZXQoZXZlbnQ6IEV2ZW50KTogSFRNTEVsZW1lbnQge1xuICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZXZlbnQudGFyZ2V0O1xuICAgIH0gZWxzZSBpZiAoIShldmVudC50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgJiYgZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICByZXR1cm4gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQgPz8gZG9jdW1lbnQuYm9keTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuYm9keTtcbiAgICB9XG59XG5cbi8qKipcbiBUaGlzIHRlY2huaXF1ZSBmb3IgcHJvcGVyIGxvYWQgZGV0ZWN0aW9uIGlzIHRha2VuIGZyb20gSFRNWDpcblxuIEJTRCAyLUNsYXVzZSBMaWNlbnNlXG5cbiBDb3B5cmlnaHQgKGMpIDIwMjAsIEJpZyBTa3kgU29mdHdhcmVcbiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG4gUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAxLiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cblxuIDIuIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cbiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcbiBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFXG4gRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUxcbiBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUlxuIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSXG4gQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSxcbiBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG5cbiAqKiovXG5cbmxldCBpc1JlYWR5ID0gZmFsc2U7XG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xuXG5pZiAoaGFzRE9NKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHsgaXNSZWFkeSA9IHRydWUgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGVuUmVhZHkoY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAgICBpZiAoaXNSZWFkeSB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGNhbGxiYWNrKTtcbiAgICB9XG59XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IHsgbmV3UnVudGltZUNhbGxlciwgb2JqZWN0TmFtZXMgfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQgeyBJc0RlYnVnIH0gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5pbXBvcnQgeyBldmVudFRhcmdldCB9IGZyb20gXCIuL3V0aWxzLmpzXCI7XG5cbi8vIHNldHVwXG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xuXG5pZiAoaGFzRE9NKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgY29udGV4dE1lbnVIYW5kbGVyKTtcbn1cblxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQ29udGV4dE1lbnUpO1xuXG5jb25zdCBDb250ZXh0TWVudU9wZW4gPSAwO1xuXG5mdW5jdGlvbiBvcGVuQ29udGV4dE1lbnUoaWQ6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIGRhdGE6IGFueSk6IHZvaWQge1xuICAgIHZvaWQgY2FsbChDb250ZXh0TWVudU9wZW4sIHtpZCwgeCwgeSwgZGF0YX0pO1xufVxuXG5mdW5jdGlvbiBjb250ZXh0TWVudUhhbmRsZXIoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBldmVudFRhcmdldChldmVudCk7XG5cbiAgICAvLyBDaGVjayBmb3IgY3VzdG9tIGNvbnRleHQgbWVudVxuICAgIGNvbnN0IGN1c3RvbUNvbnRleHRNZW51ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1jdXN0b20tY29udGV4dG1lbnVcIikudHJpbSgpO1xuXG4gICAgaWYgKGN1c3RvbUNvbnRleHRNZW51KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLWN1c3RvbS1jb250ZXh0bWVudS1kYXRhXCIpO1xuICAgICAgICBvcGVuQ29udGV4dE1lbnUoY3VzdG9tQ29udGV4dE1lbnUsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQsIHRhcmdldCk7XG4gICAgfVxufVxuXG5cbi8qXG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IGF1dG87IChkZWZhdWx0KSB3aWxsIHNob3cgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51IGlmIGNvbnRlbnRFZGl0YWJsZSBpcyB0cnVlIE9SIHRleHQgaGFzIGJlZW4gc2VsZWN0ZWQgT1IgZWxlbWVudCBpcyBpbnB1dCBvciB0ZXh0YXJlYVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBzaG93OyB3aWxsIGFsd2F5cyBzaG93IHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBoaWRlOyB3aWxsIGFsd2F5cyBoaWRlIHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuXG5UaGlzIHJ1bGUgaXMgaW5oZXJpdGVkIGxpa2Ugbm9ybWFsIENTUyBydWxlcywgc28gbmVzdGluZyB3b3JrcyBhcyBleHBlY3RlZFxuKi9cbmZ1bmN0aW9uIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQ6IE1vdXNlRXZlbnQsIHRhcmdldDogSFRNTEVsZW1lbnQpIHtcbiAgICAvLyBEZWJ1ZyBidWlsZHMgYWx3YXlzIHNob3cgdGhlIG1lbnVcbiAgICBpZiAoSXNEZWJ1ZygpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQcm9jZXNzIGRlZmF1bHQgY29udGV4dCBtZW51XG4gICAgc3dpdGNoICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLWRlZmF1bHQtY29udGV4dG1lbnVcIikudHJpbSgpKSB7XG4gICAgICAgIGNhc2UgJ3Nob3cnOlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjYXNlICdoaWRlJzpcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgY29udGVudEVkaXRhYmxlIGlzIHRydWVcbiAgICBpZiAodGFyZ2V0LmlzQ29udGVudEVkaXRhYmxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB0ZXh0IGhhcyBiZWVuIHNlbGVjdGVkXG4gICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIGNvbnN0IGhhc1NlbGVjdGlvbiA9IHNlbGVjdGlvbiAmJiBzZWxlY3Rpb24udG9TdHJpbmcoKS5sZW5ndGggPiAwO1xuICAgIGlmIChoYXNTZWxlY3Rpb24pIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rpb24ucmFuZ2VDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCByYW5nZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KGkpO1xuICAgICAgICAgICAgY29uc3QgcmVjdHMgPSByYW5nZS5nZXRDbGllbnRSZWN0cygpO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByZWN0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlY3QgPSByZWN0c1tqXTtcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChyZWN0LmxlZnQsIHJlY3QudG9wKSA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB0YWcgaXMgaW5wdXQgb3IgdGV4dGFyZWEuXG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgfHwgdGFyZ2V0IGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCkge1xuICAgICAgICBpZiAoaGFzU2VsZWN0aW9uIHx8ICghdGFyZ2V0LnJlYWRPbmx5ICYmICF0YXJnZXQuZGlzYWJsZWQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBoaWRlIGRlZmF1bHQgY29udGV4dCBtZW51XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn1cbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGZyb20gdGhlIGZsYWcgbWFwLlxuICpcbiAqIEBwYXJhbSBrZXkgLSBUaGUga2V5IHRvIHJldHJpZXZlIHRoZSB2YWx1ZSBmb3IuXG4gKiBAcmV0dXJuIFRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRGbGFnKGtleTogc3RyaW5nKTogYW55IHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gd2luZG93Ll9iYWlscy5mbGFnc1trZXldO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHJldHJpZXZlIGZsYWcgJ1wiICsga2V5ICsgXCInOiBcIiArIGUsIHsgY2F1c2U6IGUgfSk7XG4gICAgfVxufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCB7IGludm9rZSwgSXNXaW5kb3dzLCBJc0xpbnV4LCBJc01hYyB9IGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuaW1wb3J0IHsgR2V0RmxhZyB9IGZyb20gXCIuL2ZsYWdzLmpzXCI7XG5pbXBvcnQgeyBjYW5UcmFja0J1dHRvbnMsIGV2ZW50VGFyZ2V0IH0gZnJvbSBcIi4vdXRpbHMuanNcIjtcblxuLy8gU2V0dXBcbmxldCBjYW5EcmFnID0gZmFsc2U7XG5sZXQgZHJhZ2dpbmcgPSBmYWxzZTtcblxubGV0IHJlc2l6YWJsZSA9IGZhbHNlO1xubGV0IGNhblJlc2l6ZSA9IGZhbHNlO1xubGV0IHJlc2l6aW5nID0gZmFsc2U7XG5sZXQgcmVzaXplRWRnZTogc3RyaW5nID0gXCJcIjtcbmxldCBkZWZhdWx0Q3Vyc29yID0gXCJhdXRvXCI7XG5cbmxldCBidXR0b25zID0gMDtcbmltcG9ydCB7IGhhc0RPTSB9IGZyb20gXCIuL2Vudmlyb25tZW50LmpzXCI7XG5cbmxldCBidXR0b25zVHJhY2tlZCA9IGZhbHNlO1xuXG5pZiAoaGFzRE9NKSB7XG4gICAgYnV0dG9uc1RyYWNrZWQgPSBjYW5UcmFja0J1dHRvbnMoKTtcbiAgICB3aW5kb3cuX2JhaWxzID0gd2luZG93Ll9iYWlscyB8fCB7fTtcbiAgICB3aW5kb3cuX2JhaWxzLnNldFJlc2l6YWJsZSA9ICh2YWx1ZTogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICByZXNpemFibGUgPSB2YWx1ZTtcbiAgICAgICAgaWYgKCFyZXNpemFibGUpIHtcbiAgICAgICAgICAgIC8vIFN0b3AgcmVzaXppbmcgaWYgaW4gcHJvZ3Jlc3MuXG4gICAgICAgICAgICBjYW5SZXNpemUgPSByZXNpemluZyA9IGZhbHNlO1xuICAgICAgICAgICAgc2V0UmVzaXplKCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG4vLyBEZWZlciBhdHRhY2hpbmcgbW91c2UgbGlzdGVuZXJzIHVudGlsIHdlIGtub3cgd2UncmUgbm90IG9uIG1vYmlsZS5cbmxldCBkcmFnSW5pdERvbmUgPSBmYWxzZTtcbmZ1bmN0aW9uIGlzTW9iaWxlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG9zID0gKHdpbmRvdyBhcyBhbnkpLl9iYWlscz8uZW52aXJvbm1lbnQ/Lk9TO1xuICAgIGlmIChvcyA9PT0gXCJpb3NcIiB8fCBvcyA9PT0gXCJhbmRyb2lkXCIpIHJldHVybiB0cnVlO1xuICAgIC8vIEZhbGxiYWNrIGhldXJpc3RpYyBpZiBlbnZpcm9ubWVudCBub3QgeWV0IHNldFxuICAgIGNvbnN0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudCB8fCBuYXZpZ2F0b3IudmVuZG9yIHx8ICh3aW5kb3cgYXMgYW55KS5vcGVyYSB8fCBcIlwiO1xuICAgIHJldHVybiAvYW5kcm9pZHxpcGhvbmV8aXBhZHxpcG9kfGllbW9iaWxlfHdwZGVza3RvcC9pLnRlc3QodWEpO1xufVxuZnVuY3Rpb24gdHJ5SW5pdERyYWdIYW5kbGVycygpOiB2b2lkIHtcbiAgICBpZiAoZHJhZ0luaXREb25lKSByZXR1cm47XG4gICAgaWYgKGlzTW9iaWxlKCkpIHJldHVybjtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdXBkYXRlLCB7IGNhcHR1cmU6IHRydWUgfSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHVwZGF0ZSwgeyBjYXB0dXJlOiB0cnVlIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdXBkYXRlLCB7IGNhcHR1cmU6IHRydWUgfSk7XG4gICAgZm9yIChjb25zdCBldiBvZiBbJ2NsaWNrJywgJ2NvbnRleHRtZW51JywgJ2RibGNsaWNrJ10pIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXYsIHN1cHByZXNzRXZlbnQsIHsgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgICB9XG4gICAgZHJhZ0luaXREb25lID0gdHJ1ZTtcbn1cbmlmIChoYXNET00pIHtcbiAgICAvLyBBdHRlbXB0IGltbWVkaWF0ZSBpbml0IChpbiBjYXNlIGVudmlyb25tZW50IGFscmVhZHkgcHJlc2VudClcbiAgICB0cnlJbml0RHJhZ0hhbmRsZXJzKCk7XG4gICAgLy8gQWxzbyBhdHRlbXB0IG9uIERPTSByZWFkeVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCB0cnlJbml0RHJhZ0hhbmRsZXJzLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgLy8gQXMgYSBsYXN0IHJlc29ydCwgcG9sbCBmb3IgZW52aXJvbm1lbnQgZm9yIGEgc2hvcnQgcGVyaW9kXG4gICAgbGV0IGRyYWdFbnZQb2xscyA9IDA7XG4gICAgY29uc3QgZHJhZ0VudlBvbGwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAoZHJhZ0luaXREb25lKSB7IHdpbmRvdy5jbGVhckludGVydmFsKGRyYWdFbnZQb2xsKTsgcmV0dXJuOyB9XG4gICAgICAgIHRyeUluaXREcmFnSGFuZGxlcnMoKTtcbiAgICAgICAgaWYgKCsrZHJhZ0VudlBvbGxzID4gMTAwKSB7IHdpbmRvdy5jbGVhckludGVydmFsKGRyYWdFbnZQb2xsKTsgfVxuICAgIH0sIDUwKTtcbn1cblxuZnVuY3Rpb24gc3VwcHJlc3NFdmVudChldmVudDogRXZlbnQpIHtcbiAgICBpZiAoXG4gICAgICAgIGV2ZW50LnR5cGUgPT09IFwiZGJsY2xpY2tcIlxuICAgICAgICAmJiBJc01hYygpXG4gICAgICAgICYmIHdpbmRvdyA9PT0gd2luZG93LnRvcFxuICAgICAgICAmJiBpc0RyYWdnYWJsZUV2ZW50KGV2ZW50IGFzIE1vdXNlRXZlbnQpXG4gICAgKSB7XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaW52b2tlKFwiYmFpbHM6ZHJhZzpkb3VibGVjbGlja1wiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFN1cHByZXNzIGNsaWNrIGV2ZW50cyB3aGlsZSByZXNpemluZyBvciBkcmFnZ2luZy5cbiAgICBpZiAoZHJhZ2dpbmcgfHwgcmVzaXppbmcpIHtcbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNEcmFnZ2FibGVFdmVudChldmVudDogTW91c2VFdmVudCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50VGFyZ2V0KGV2ZW50KTtcbiAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhcmdldCk7XG4gICAgcmV0dXJuIChcbiAgICAgICAgc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShcIi0tYmFpbHMtZHJhZ2dhYmxlXCIpLnRyaW0oKSA9PT0gXCJkcmFnXCJcbiAgICAgICAgJiYgZXZlbnQub2Zmc2V0WCA+PSAwXG4gICAgICAgICYmIGV2ZW50Lm9mZnNldFggPCB0YXJnZXQuY2xpZW50V2lkdGhcbiAgICAgICAgJiYgZXZlbnQub2Zmc2V0WSA+PSAwXG4gICAgICAgICYmIGV2ZW50Lm9mZnNldFkgPCB0YXJnZXQuY2xpZW50SGVpZ2h0XG4gICAgKTtcbn1cblxuLy8gVXNlIGNvbnN0YW50cyB0byBhdm9pZCBjb21wYXJpbmcgc3RyaW5ncyBtdWx0aXBsZSB0aW1lcy5cbmNvbnN0IE1vdXNlRG93biA9IDA7XG5jb25zdCBNb3VzZVVwICAgPSAxO1xuY29uc3QgTW91c2VNb3ZlID0gMjtcblxuZnVuY3Rpb24gdXBkYXRlKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgLy8gV2luZG93cyBzdXBwcmVzc2VzIG1vdXNlIGV2ZW50cyBhdCB0aGUgZW5kIG9mIGRyYWdnaW5nIG9yIHJlc2l6aW5nLFxuICAgIC8vIHNvIHdlIG5lZWQgdG8gYmUgc21hcnQgYW5kIHN5bnRoZXNpemUgYnV0dG9uIGV2ZW50cy5cblxuICAgIGxldCBldmVudFR5cGU6IG51bWJlciwgZXZlbnRCdXR0b25zID0gZXZlbnQuYnV0dG9ucztcbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbW91c2Vkb3duJzpcbiAgICAgICAgICAgIGV2ZW50VHlwZSA9IE1vdXNlRG93bjtcbiAgICAgICAgICAgIGlmICghYnV0dG9uc1RyYWNrZWQpIHsgZXZlbnRCdXR0b25zID0gYnV0dG9ucyB8ICgxIDw8IGV2ZW50LmJ1dHRvbik7IH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb3VzZXVwJzpcbiAgICAgICAgICAgIGV2ZW50VHlwZSA9IE1vdXNlVXA7XG4gICAgICAgICAgICBpZiAoIWJ1dHRvbnNUcmFja2VkKSB7IGV2ZW50QnV0dG9ucyA9IGJ1dHRvbnMgJiB+KDEgPDwgZXZlbnQuYnV0dG9uKTsgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBldmVudFR5cGUgPSBNb3VzZU1vdmU7XG4gICAgICAgICAgICBpZiAoIWJ1dHRvbnNUcmFja2VkKSB7IGV2ZW50QnV0dG9ucyA9IGJ1dHRvbnM7IH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCByZWxlYXNlZCA9IGJ1dHRvbnMgJiB+ZXZlbnRCdXR0b25zO1xuICAgIGxldCBwcmVzc2VkID0gZXZlbnRCdXR0b25zICYgfmJ1dHRvbnM7XG5cbiAgICBidXR0b25zID0gZXZlbnRCdXR0b25zO1xuXG4gICAgLy8gU3ludGhlc2l6ZSBhIHJlbGVhc2UtcHJlc3Mgc2VxdWVuY2UgaWYgd2UgZGV0ZWN0IGEgcHJlc3Mgb2YgYW4gYWxyZWFkeSBwcmVzc2VkIGJ1dHRvbi5cbiAgICBpZiAoZXZlbnRUeXBlID09PSBNb3VzZURvd24gJiYgIShwcmVzc2VkICYgZXZlbnQuYnV0dG9uKSkge1xuICAgICAgICByZWxlYXNlZCB8PSAoMSA8PCBldmVudC5idXR0b24pO1xuICAgICAgICBwcmVzc2VkIHw9ICgxIDw8IGV2ZW50LmJ1dHRvbik7XG4gICAgfVxuXG4gICAgLy8gU3VwcHJlc3MgYWxsIGJ1dHRvbiBldmVudHMgZHVyaW5nIGRyYWdnaW5nIGFuZCByZXNpemluZyxcbiAgICAvLyB1bmxlc3MgdGhpcyBpcyBhIG1vdXNldXAgZXZlbnQgdGhhdCBpcyBlbmRpbmcgYSBkcmFnIGFjdGlvbi5cbiAgICBpZiAoXG4gICAgICAgIGV2ZW50VHlwZSAhPT0gTW91c2VNb3ZlIC8vIEZhc3QgcGF0aCBmb3IgbW91c2Vtb3ZlXG4gICAgICAgICYmIHJlc2l6aW5nXG4gICAgICAgIHx8IChcbiAgICAgICAgICAgIGRyYWdnaW5nXG4gICAgICAgICAgICAmJiAoXG4gICAgICAgICAgICAgICAgZXZlbnRUeXBlID09PSBNb3VzZURvd25cbiAgICAgICAgICAgICAgICB8fCBldmVudC5idXR0b24gIT09IDBcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICkge1xuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHJlbGVhc2VzXG4gICAgaWYgKHJlbGVhc2VkICYgMSkgeyBwcmltYXJ5VXAoZXZlbnQpOyB9XG4gICAgLy8gSGFuZGxlIHByZXNzZXNcbiAgICBpZiAocHJlc3NlZCAmIDEpIHsgcHJpbWFyeURvd24oZXZlbnQpOyB9XG5cbiAgICAvLyBIYW5kbGUgbW91c2Vtb3ZlXG4gICAgaWYgKGV2ZW50VHlwZSA9PT0gTW91c2VNb3ZlKSB7IG9uTW91c2VNb3ZlKGV2ZW50KTsgfTtcbn1cblxuZnVuY3Rpb24gcHJpbWFyeURvd24oZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBSZXNldCByZWFkaW5lc3Mgc3RhdGUuXG4gICAgY2FuRHJhZyA9IGZhbHNlO1xuICAgIGNhblJlc2l6ZSA9IGZhbHNlO1xuXG4gICAgLy8gSWdub3JlIHJlcGVhdGVkIGNsaWNrcyBvbiBtYWNPUyBhbmQgTGludXguXG4gICAgaWYgKCFJc1dpbmRvd3MoKSkge1xuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uID09PSAwICYmIGV2ZW50LmRldGFpbCAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlc2l6ZUVkZ2UpIHtcbiAgICAgICAgLy8gRG8gbm90IGFybSBlZGdlIHJlc2l6ZSBmcm9tIHN5bnRoZXNpemVkIHByZXNzZXMgb2JzZXJ2ZWQgb24gbW92ZS91cDpcbiAgICAgICAgLy8gZW50ZXJpbmcgdGhlIHdpbmRvdyB3aXRoIHRoZSBwcmltYXJ5IGJ1dHRvbiBhbHJlYWR5IGhlbGQgc2hvdWxkIG5vdFxuICAgICAgICAvLyBzdGVhbCBhbm90aGVyIGdlc3R1cmUgaW50byBhIHJlc2l6ZS5cbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgIT09ICdtb3VzZWRvd24nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWFkeSB0byByZXNpemUgaWYgdGhlIHByaW1hcnkgYnV0dG9uIHdhcyBwcmVzc2VkIGZvciB0aGUgZmlyc3QgdGltZS5cbiAgICAgICAgY2FuUmVzaXplID0gdHJ1ZTtcbiAgICAgICAgLy8gRG8gbm90IHN0YXJ0IGRyYWcgb3BlcmF0aW9ucyB3aGVuIG9uIHJlc2l6ZSBlZGdlcy5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJldHJpZXZlIHRhcmdldCBlbGVtZW50XG4gICAgLy8gUmVhZHkgdG8gZHJhZyBpZiB0aGUgcHJpbWFyeSBidXR0b24gd2FzIHByZXNzZWQgZm9yIHRoZSBmaXJzdCB0aW1lIG9uIGEgZHJhZ2dhYmxlIGVsZW1lbnQuXG4gICAgLy8gSWdub3JlIGNsaWNrcyBvbiB0aGUgc2Nyb2xsYmFyLlxuICAgIGNhbkRyYWcgPSBpc0RyYWdnYWJsZUV2ZW50KGV2ZW50KTtcbn1cblxuZnVuY3Rpb24gcHJpbWFyeVVwKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgLy8gU3RvcCBkcmFnZ2luZyBhbmQgcmVzaXppbmcuXG4gICAgY2FuRHJhZyA9IGZhbHNlO1xuICAgIGRyYWdnaW5nID0gZmFsc2U7XG4gICAgY2FuUmVzaXplID0gZmFsc2U7XG4gICAgcmVzaXppbmcgPSBmYWxzZTtcbn1cblxuY29uc3QgY3Vyc29yRm9yRWRnZSA9IE9iamVjdC5mcmVlemUoe1xuICAgIFwic2UtcmVzaXplXCI6IFwibndzZS1yZXNpemVcIixcbiAgICBcInN3LXJlc2l6ZVwiOiBcIm5lc3ctcmVzaXplXCIsXG4gICAgXCJudy1yZXNpemVcIjogXCJud3NlLXJlc2l6ZVwiLFxuICAgIFwibmUtcmVzaXplXCI6IFwibmVzdy1yZXNpemVcIixcbiAgICBcInctcmVzaXplXCI6IFwiZXctcmVzaXplXCIsXG4gICAgXCJuLXJlc2l6ZVwiOiBcIm5zLXJlc2l6ZVwiLFxuICAgIFwicy1yZXNpemVcIjogXCJucy1yZXNpemVcIixcbiAgICBcImUtcmVzaXplXCI6IFwiZXctcmVzaXplXCIsXG59KVxuXG5mdW5jdGlvbiBzZXRSZXNpemUoZWRnZT86IGtleW9mIHR5cGVvZiBjdXJzb3JGb3JFZGdlKTogdm9pZCB7XG4gICAgaWYgKGVkZ2UpIHtcbiAgICAgICAgaWYgKCFyZXNpemVFZGdlKSB7IGRlZmF1bHRDdXJzb3IgPSBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvcjsgfVxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IGN1cnNvckZvckVkZ2VbZWRnZV07XG4gICAgfSBlbHNlIGlmICghZWRnZSAmJiByZXNpemVFZGdlKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gZGVmYXVsdEN1cnNvcjtcbiAgICB9XG5cbiAgICByZXNpemVFZGdlID0gZWRnZSB8fCBcIlwiO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmIChjYW5SZXNpemUgJiYgcmVzaXplRWRnZSkge1xuICAgICAgICAvLyBTdGFydCByZXNpemluZy5cbiAgICAgICAgcmVzaXppbmcgPSB0cnVlO1xuICAgICAgICBpbnZva2UoXCJiYWlsczpyZXNpemU6XCIgKyByZXNpemVFZGdlKTtcbiAgICB9IGVsc2UgaWYgKGNhbkRyYWcpIHtcbiAgICAgICAgLy8gU3RhcnQgZHJhZ2dpbmcuXG4gICAgICAgIGRyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgaW52b2tlKFwiYmFpbHM6ZHJhZ1wiKTtcbiAgICB9XG5cbiAgICBpZiAoZHJhZ2dpbmcgfHwgcmVzaXppbmcpIHtcbiAgICAgICAgLy8gRWl0aGVyIGRyYWcgb3IgcmVzaXplIGlzIG9uZ29pbmcsXG4gICAgICAgIC8vIHJlc2V0IHJlYWRpbmVzcyBhbmQgc3RvcCBwcm9jZXNzaW5nLlxuICAgICAgICBjYW5EcmFnID0gY2FuUmVzaXplID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXJlc2l6YWJsZSB8fCAoIUlzV2luZG93cygpICYmICEoSXNMaW51eCgpICYmIEdldEZsYWcoXCJmcmFtZWxlc3NcIikpKSkge1xuICAgICAgICBpZiAocmVzaXplRWRnZSkgeyBzZXRSZXNpemUoKTsgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcmVzaXplSGFuZGxlSGVpZ2h0ID0gR2V0RmxhZyhcInN5c3RlbS5yZXNpemVIYW5kbGVIZWlnaHRcIikgfHwgNTtcbiAgICBjb25zdCByZXNpemVIYW5kbGVXaWR0aCA9IEdldEZsYWcoXCJzeXN0ZW0ucmVzaXplSGFuZGxlV2lkdGhcIikgfHwgNTtcblxuICAgIC8vIEV4dHJhIHBpeGVscyBmb3IgdGhlIGNvcm5lciBhcmVhcy5cbiAgICBjb25zdCBjb3JuZXJFeHRyYSA9IEdldEZsYWcoXCJyZXNpemVDb3JuZXJFeHRyYVwiKSB8fCAxMDtcblxuICAgIC8vIFdoZW4gYSBzY3JvbGxiYXIgaXMgcHJlc2VudCBhdCB0aGUgd2luZG93IGVkZ2UgaXQgY29uc3VtZXMgbW91c2UgZXZlbnRzIGluIHRoYXQgc3RyaXAuXG4gICAgLy8gU2hpZnQgdGhlIGVmZmVjdGl2ZSBjb250ZW50IGVkZ2UgaW53YXJkIHNvIHRoZSByZXNpemUgem9uZSBzaXRzIGp1c3QgYmVmb3JlIHRoZSBzY3JvbGxiYXIuXG4gICAgY29uc3Qgc2Nyb2xsYmFyV2lkdGggPSBNYXRoLm1heCgwLCB3aW5kb3cuaW5uZXJXaWR0aCAtIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCk7XG4gICAgY29uc3Qgc2Nyb2xsYmFySGVpZ2h0ID0gTWF0aC5tYXgoMCwgd2luZG93LmlubmVySGVpZ2h0IC0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCk7XG4gICAgY29uc3QgcmlnaHRDb250ZW50RWRnZSA9IHdpbmRvdy5pbm5lcldpZHRoIC0gc2Nyb2xsYmFyV2lkdGg7XG4gICAgY29uc3QgYm90dG9tQ29udGVudEVkZ2UgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSBzY3JvbGxiYXJIZWlnaHQ7XG5cbiAgICBjb25zdCByaWdodEJvcmRlciA9IGV2ZW50LmNsaWVudFggPCByaWdodENvbnRlbnRFZGdlICYmIChyaWdodENvbnRlbnRFZGdlIC0gZXZlbnQuY2xpZW50WCkgPCByZXNpemVIYW5kbGVXaWR0aDtcbiAgICBjb25zdCBsZWZ0Qm9yZGVyID0gZXZlbnQuY2xpZW50WCA8IHJlc2l6ZUhhbmRsZVdpZHRoO1xuICAgIGNvbnN0IHRvcEJvcmRlciA9IGV2ZW50LmNsaWVudFkgPCByZXNpemVIYW5kbGVIZWlnaHQ7XG4gICAgY29uc3QgYm90dG9tQm9yZGVyID0gZXZlbnQuY2xpZW50WSA8IGJvdHRvbUNvbnRlbnRFZGdlICYmIChib3R0b21Db250ZW50RWRnZSAtIGV2ZW50LmNsaWVudFkpIDwgcmVzaXplSGFuZGxlSGVpZ2h0O1xuXG4gICAgLy8gQWRqdXN0IGZvciBjb3JuZXIgYXJlYXMuXG4gICAgY29uc3QgcmlnaHRDb3JuZXIgPSBldmVudC5jbGllbnRYIDwgcmlnaHRDb250ZW50RWRnZSAmJiAocmlnaHRDb250ZW50RWRnZSAtIGV2ZW50LmNsaWVudFgpIDwgKHJlc2l6ZUhhbmRsZVdpZHRoICsgY29ybmVyRXh0cmEpO1xuICAgIGNvbnN0IGxlZnRDb3JuZXIgPSBldmVudC5jbGllbnRYIDwgKHJlc2l6ZUhhbmRsZVdpZHRoICsgY29ybmVyRXh0cmEpO1xuICAgIGNvbnN0IHRvcENvcm5lciA9IGV2ZW50LmNsaWVudFkgPCAocmVzaXplSGFuZGxlSGVpZ2h0ICsgY29ybmVyRXh0cmEpO1xuICAgIGNvbnN0IGJvdHRvbUNvcm5lciA9IGV2ZW50LmNsaWVudFkgPCBib3R0b21Db250ZW50RWRnZSAmJiAoYm90dG9tQ29udGVudEVkZ2UgLSBldmVudC5jbGllbnRZKSA8IChyZXNpemVIYW5kbGVIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XG5cbiAgICBpZiAoIWxlZnRDb3JuZXIgJiYgIXRvcENvcm5lciAmJiAhYm90dG9tQ29ybmVyICYmICFyaWdodENvcm5lcikge1xuICAgICAgICAvLyBPcHRpbWlzYXRpb246IG91dCBvZiBhbGwgY29ybmVyIGFyZWFzIGltcGxpZXMgb3V0IG9mIGJvcmRlcnMuXG4gICAgICAgIHNldFJlc2l6ZSgpO1xuICAgIH1cbiAgICAvLyBEZXRlY3QgY29ybmVycy5cbiAgICBlbHNlIGlmIChyaWdodENvcm5lciAmJiBib3R0b21Db3JuZXIpIHNldFJlc2l6ZShcInNlLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChsZWZ0Q29ybmVyICYmIGJvdHRvbUNvcm5lcikgc2V0UmVzaXplKFwic3ctcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGxlZnRDb3JuZXIgJiYgdG9wQ29ybmVyKSBzZXRSZXNpemUoXCJudy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAodG9wQ29ybmVyICYmIHJpZ2h0Q29ybmVyKSBzZXRSZXNpemUoXCJuZS1yZXNpemVcIik7XG4gICAgLy8gRGV0ZWN0IGJvcmRlcnMuXG4gICAgZWxzZSBpZiAobGVmdEJvcmRlcikgc2V0UmVzaXplKFwidy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAodG9wQm9yZGVyKSBzZXRSZXNpemUoXCJuLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChib3R0b21Cb3JkZXIpIHNldFJlc2l6ZShcInMtcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKHJpZ2h0Qm9yZGVyKSBzZXRSZXNpemUoXCJlLXJlc2l6ZVwiKTtcbiAgICAvLyBPdXQgb2YgYm9yZGVyIGFyZWEuXG4gICAgZWxzZSBzZXRSZXNpemUoKTtcbn1cbiIsIi8qXG4gXyAgICAgX18gICAgXyBfX1xufCB8ICAgLyAvX19fKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IHsgaW52b2tlIH0gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5pbXBvcnQgeyB3aGVuUmVhZHkgfSBmcm9tIFwiLi91dGlscy5qc1wiO1xuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcblxudHlwZSBOb25DbGllbnRSZWdpb25LaW5kID0gXCJjYXB0aW9uXCIgfCBcIm1pbmltaXplXCIgfCBcIm1heGltaXplXCIgfCBcImNsb3NlXCI7XG5cbmludGVyZmFjZSBOb25DbGllbnRSZWdpb24ge1xuICAgIGtpbmQ6IE5vbkNsaWVudFJlZ2lvbktpbmQ7XG4gICAgbGVmdDogbnVtYmVyO1xuICAgIHRvcDogbnVtYmVyO1xuICAgIHJpZ2h0OiBudW1iZXI7XG4gICAgYm90dG9tOiBudW1iZXI7XG59XG5cbi8qXG4tLWJhaWxzLW5vbi1jbGllbnQtcmVnaW9uOiBjYXB0aW9uOyAgbWFya3MgYW4gYXJlYSB0aGF0IGNhbiBkcmFnIHRoZSB3aW5kb3dcbi0tYmFpbHMtbm9uLWNsaWVudC1yZWdpb246IG1pbmltaXplOyBtYXJrcyBhIGN1c3RvbSBtaW5pbWl6ZSBidXR0b25cbi0tYmFpbHMtbm9uLWNsaWVudC1yZWdpb246IG1heGltaXplOyBtYXJrcyBhIGN1c3RvbSBtYXhpbWl6ZSBidXR0b25cbi0tYmFpbHMtbm9uLWNsaWVudC1yZWdpb246IGNsb3NlOyAgICBtYXJrcyBhIGN1c3RvbSBjbG9zZSBidXR0b25cbiovXG5jb25zdCByZWdpb25Qcm9wZXJ0eSA9IFwiLS1iYWlscy1ub24tY2xpZW50LXJlZ2lvblwiO1xuY29uc3QgcnVudGltZUNvbmZpZ1JlYWR5RXZlbnQgPSBcImJhaWxzOnJ1bnRpbWUtY29uZmlnLXJlYWR5XCI7XG5jb25zdCB2YWxpZFJlZ2lvbnMgPSBuZXcgU2V0PE5vbkNsaWVudFJlZ2lvbktpbmQ+KFtcImNhcHRpb25cIiwgXCJtaW5pbWl6ZVwiLCBcIm1heGltaXplXCIsIFwiY2xvc2VcIl0pO1xuXG4vLyBTZXR1cFxuaWYgKGhhc0RPTSkge1xuICAgIHdpbmRvdy5fYmFpbHMgPSB3aW5kb3cuX2JhaWxzIHx8IHt9O1xufVxuXG5sZXQgdXBkYXRlUGVuZGluZyA9IGZhbHNlO1xubGV0IGxhc3RQYXlsb2FkID0gXCJcIjtcbmxldCBvYnNlcnZlZEVsZW1lbnRzID0gbmV3IFNldDxFbGVtZW50PigpO1xubGV0IHJlc2l6ZU9ic2VydmVyOiBSZXNpemVPYnNlcnZlciB8IHVuZGVmaW5lZDtcbmxldCB0cmFja2luZ1N0YXJ0ZWQgPSBmYWxzZTtcblxuZnVuY3Rpb24gbm9ybWFsaXNlUmVnaW9uS2luZCh2YWx1ZTogc3RyaW5nKTogTm9uQ2xpZW50UmVnaW9uS2luZCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgcmVnaW9uID0gdmFsdWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHZhbGlkUmVnaW9ucy5oYXMocmVnaW9uIGFzIE5vbkNsaWVudFJlZ2lvbktpbmQpKSB7XG4gICAgICAgIHJldHVybiByZWdpb24gYXMgTm9uQ2xpZW50UmVnaW9uS2luZDtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gbm9uQ2xpZW50UmVnaW9uRm9yRWxlbWVudChlbGVtZW50OiBFbGVtZW50KTogTm9uQ2xpZW50UmVnaW9uS2luZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG4gICAgY29uc3QgcmVnaW9uID0gbm9ybWFsaXNlUmVnaW9uS2luZChzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHJlZ2lvblByb3BlcnR5KSk7XG4gICAgaWYgKCFyZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJlbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgICBjb25zdCBwYXJlbnRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHBhcmVudCk7XG4gICAgICAgIC8vIFRoZSBDU1MgcHJvcGVydHkgaXMgaW5oZXJpdGVkLiBPbmx5IHJlcG9ydCB0aGUgb3V0ZXJtb3N0IGVsZW1lbnQgZm9yXG4gICAgICAgIC8vIGVhY2ggY29udGlndW91cyByZWdpb24gc28gbmF0aXZlIGhpdCB0ZXN0aW5nIHNlZXMgc3RhYmxlIHJlY3RhbmdsZXMuXG4gICAgICAgIGlmIChub3JtYWxpc2VSZWdpb25LaW5kKHBhcmVudFN0eWxlLmdldFByb3BlcnR5VmFsdWUocmVnaW9uUHJvcGVydHkpKSA9PT0gcmVnaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZ2lvbjtcbn1cblxuZnVuY3Rpb24gaXNWaXNpYmxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcbiAgICByZXR1cm4gc3R5bGUuZGlzcGxheSAhPT0gXCJub25lXCIgJiZcbiAgICAgICAgc3R5bGUudmlzaWJpbGl0eSAhPT0gXCJoaWRkZW5cIiAmJlxuICAgICAgICBzdHlsZS5jb250ZW50VmlzaWJpbGl0eSAhPT0gXCJoaWRkZW5cIjtcbn1cblxuZnVuY3Rpb24gZWxlbWVudFJlZ2lvbihlbGVtZW50OiBFbGVtZW50KTogTm9uQ2xpZW50UmVnaW9uIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3Qga2luZCA9IG5vbkNsaWVudFJlZ2lvbkZvckVsZW1lbnQoZWxlbWVudCk7XG4gICAgaWYgKCFraW5kIHx8ICFpc1Zpc2libGUoZWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAocmVjdC53aWR0aCA8PSAwIHx8IHJlY3QuaGVpZ2h0IDw9IDApIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBOYXRpdmUgaGl0IHRlc3RpbmcgcnVucyBpbiBwaHlzaWNhbCBwaXhlbHMsIHdoaWxlIERPTSBnZW9tZXRyeSBpcyBpbiBDU1MgcGl4ZWxzLlxuICAgIGNvbnN0IHNjYWxlID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICBjb25zdCBsZWZ0ID0gTWF0aC5mbG9vcihyZWN0LmxlZnQgKiBzY2FsZSk7XG4gICAgY29uc3QgdG9wID0gTWF0aC5mbG9vcihyZWN0LnRvcCAqIHNjYWxlKTtcbiAgICBjb25zdCByaWdodCA9IE1hdGguY2VpbChyZWN0LnJpZ2h0ICogc2NhbGUpO1xuICAgIGNvbnN0IGJvdHRvbSA9IE1hdGguY2VpbChyZWN0LmJvdHRvbSAqIHNjYWxlKTtcblxuICAgIGlmIChyaWdodCA8PSBsZWZ0IHx8IGJvdHRvbSA8PSB0b3ApIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4geyBraW5kLCBsZWZ0LCB0b3AsIHJpZ2h0LCBib3R0b20gfTtcbn1cblxuZnVuY3Rpb24gcmVnaW9uRWxlbWVudHMoKTogRWxlbWVudFtdIHtcbiAgICBjb25zdCBlbGVtZW50czogRWxlbWVudFtdID0gW107XG5cbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnRzLnB1c2goZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcbiAgICB9XG4gICAgaWYgKGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgZWxlbWVudHMucHVzaChkb2N1bWVudC5ib2R5KTtcbiAgICAgICAgLy8gQXBwZW5kIHZpYSBhIGxvb3A6IHNwcmVhZGluZyBhIGh1Z2UgTm9kZUxpc3QgaW50byBwdXNoKCkgb3ZlcmZsb3dzXG4gICAgICAgIC8vIHRoZSBlbmdpbmUncyBhcmd1bWVudCBsaW1pdCBvbiB2ZXJ5IGxhcmdlIGRvY3VtZW50cy5cbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbChcIipcIikpIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZWxlbWVudHM7XG59XG5cbmZ1bmN0aW9uIG9ic2VydmVSZWdpb25FbGVtZW50cyhlbGVtZW50czogRWxlbWVudFtdKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVHJhY2sgc2l6ZSBjaGFuZ2VzIG9ubHkgZm9yIGFjdGl2ZSByZWdpb24gZWxlbWVudHMuIERPTSBzdHJ1Y3R1cmUgYW5kIHN0eWxlXG4gICAgLy8gY2hhbmdlcyBhcmUgY292ZXJlZCBieSBNdXRhdGlvbk9ic2VydmVyIGluIHN0YXJ0Tm9uQ2xpZW50UmVnaW9uVHJhY2tpbmcoKS5cbiAgICByZXNpemVPYnNlcnZlciA/Pz0gbmV3IFJlc2l6ZU9ic2VydmVyKHNjaGVkdWxlVXBkYXRlKTtcbiAgICBjb25zdCBuZXh0RWxlbWVudHMgPSBuZXcgU2V0KGVsZW1lbnRzKTtcblxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBvYnNlcnZlZEVsZW1lbnRzKSB7XG4gICAgICAgIGlmICghbmV4dEVsZW1lbnRzLmhhcyhlbGVtZW50KSkge1xuICAgICAgICAgICAgcmVzaXplT2JzZXJ2ZXIudW5vYnNlcnZlKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIG5leHRFbGVtZW50cykge1xuICAgICAgICBpZiAoIW9ic2VydmVkRWxlbWVudHMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb2JzZXJ2ZWRFbGVtZW50cyA9IG5leHRFbGVtZW50cztcbn1cblxuZnVuY3Rpb24gdXBkYXRlTm9uQ2xpZW50UmVnaW9ucygpOiB2b2lkIHtcbiAgICB1cGRhdGVQZW5kaW5nID0gZmFsc2U7XG5cbiAgICBjb25zdCBlbGVtZW50cyA9IHJlZ2lvbkVsZW1lbnRzKCk7XG4gICAgY29uc3QgcmVnaW9uczogTm9uQ2xpZW50UmVnaW9uW10gPSBbXTtcbiAgICBjb25zdCBhY3RpdmVFbGVtZW50czogRWxlbWVudFtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgY29uc3QgcmVnaW9uID0gZWxlbWVudFJlZ2lvbihlbGVtZW50KTtcbiAgICAgICAgaWYgKHJlZ2lvbikge1xuICAgICAgICAgICAgcmVnaW9ucy5wdXNoKHJlZ2lvbik7XG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb2JzZXJ2ZVJlZ2lvbkVsZW1lbnRzKGFjdGl2ZUVsZW1lbnRzKTtcblxuICAgIGNvbnN0IHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeSh7IHZlcnNpb246IDEsIHJlZ2lvbnMgfSk7XG4gICAgaWYgKHBheWxvYWQgPT09IGxhc3RQYXlsb2FkKSB7XG4gICAgICAgIC8vIEF2b2lkIHNlbmRpbmcgZHVwbGljYXRlIG5hdGl2ZSBtZXNzYWdlcyBkdXJpbmcgcmVzaXplIG9yIHN0eWxlIGNodXJuLlxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGFzdFBheWxvYWQgPSBwYXlsb2FkO1xuICAgIGludm9rZShcImJhaWxzOm5vbi1jbGllbnQtcmVnaW9uOlwiICsgcGF5bG9hZCk7XG59XG5cbmZ1bmN0aW9uIHNjaGVkdWxlVXBkYXRlKCk6IHZvaWQge1xuICAgIGlmICh1cGRhdGVQZW5kaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBCYXRjaCByZWdpb24gdXBkYXRlcyB0byBhbmltYXRpb24gZnJhbWVzIHNvIGxheW91dCBpcyBtZWFzdXJlZCBvbmNlIHBlciBmcmFtZS5cbiAgICB1cGRhdGVQZW5kaW5nID0gdHJ1ZTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZU5vbkNsaWVudFJlZ2lvbnMpO1xufVxuXG5mdW5jdGlvbiBzdGFydE5vbkNsaWVudFJlZ2lvblRyYWNraW5nKCk6IHZvaWQge1xuICAgIGlmICh0cmFja2luZ1N0YXJ0ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyYWNraW5nU3RhcnRlZCA9IHRydWU7XG4gICAgLy8gU2VuZCBhbiBpbml0aWFsIGVtcHR5IG9yIHBvcHVsYXRlZCByZWdpb24gbGlzdCBvbmNlIHRoZSBET00gaXMgcmVhZHkuXG4gICAgc2NoZWR1bGVVcGRhdGUoKTtcblxuICAgIGNvbnN0IG11dGF0aW9uT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihzY2hlZHVsZVVwZGF0ZSk7XG4gICAgbXV0YXRpb25PYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwge1xuICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBzY2hlZHVsZVVwZGF0ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgc2NoZWR1bGVVcGRhdGUsIHRydWUpO1xuICAgIHdpbmRvdy52aXN1YWxWaWV3cG9ydD8uYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBzY2hlZHVsZVVwZGF0ZSk7XG4gICAgd2luZG93LnZpc3VhbFZpZXdwb3J0Py5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHNjaGVkdWxlVXBkYXRlKTtcbn1cblxuZnVuY3Rpb24gdHJ5U3RhcnROb25DbGllbnRSZWdpb25UcmFja2luZygpOiBib29sZWFuIHtcbiAgICBjb25zdCBvcyA9IHdpbmRvdy5fYmFpbHMuZW52aXJvbm1lbnQ/Lk9TO1xuICAgIGlmIChvcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmFibGVkID0gd2luZG93Ll9iYWlscy5mbGFncz8ubm9uQ2xpZW50UmVnaW9uVHJhY2tpbmc7XG4gICAgaWYgKG9zID09PSBcIndpbmRvd3NcIikge1xuICAgICAgICBpZiAoZW5hYmxlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgd2hlblJlYWR5KHN0YXJ0Tm9uQ2xpZW50UmVnaW9uVHJhY2tpbmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xufVxuXG5pZiAoaGFzRE9NICYmICF0cnlTdGFydE5vbkNsaWVudFJlZ2lvblRyYWNraW5nKCkpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihydW50aW1lQ29uZmlnUmVhZHlFdmVudCwgdHJ5U3RhcnROb25DbGllbnRSZWdpb25UcmFja2luZywgeyBvbmNlOiB0cnVlIH0pO1xufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQXBwbGljYXRpb24pO1xuXG5jb25zdCBIaWRlTWV0aG9kID0gMDtcbmNvbnN0IFNob3dNZXRob2QgPSAxO1xuY29uc3QgUXVpdE1ldGhvZCA9IDI7XG5cbi8qKlxuICogSGlkZXMgYSBjZXJ0YWluIG1ldGhvZCBieSBjYWxsaW5nIHRoZSBIaWRlTWV0aG9kIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSGlkZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gY2FsbChIaWRlTWV0aG9kKTtcbn1cblxuLyoqXG4gKiBDYWxscyB0aGUgU2hvd01ldGhvZCBhbmQgcmV0dXJucyB0aGUgcmVzdWx0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gU2hvdygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gY2FsbChTaG93TWV0aG9kKTtcbn1cblxuLyoqXG4gKiBDYWxscyB0aGUgUXVpdE1ldGhvZCB0byB0ZXJtaW5hdGUgdGhlIHByb2dyYW0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWl0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBjYWxsKFF1aXRNZXRob2QpO1xufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5Ccm93c2VyKTtcblxuY29uc3QgQnJvd3Nlck9wZW5VUkwgPSAwO1xuXG4vKipcbiAqIE9wZW4gYSBicm93c2VyIHdpbmRvdyB0byB0aGUgZ2l2ZW4gVVJMLlxuICpcbiAqIEBwYXJhbSB1cmwgLSBUaGUgVVJMIHRvIG9wZW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9wZW5VUkwodXJsOiBzdHJpbmcgfCBVUkwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gY2FsbChCcm93c2VyT3BlblVSTCwge3VybDogdXJsLnRvU3RyaW5nKCl9KTtcbn1cbiIsIi8vIFNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL2luc3BlY3QtanMvaXMtY2FsbGFibGVcblxuLy8gVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4vL1xuLy8gQ29weXJpZ2h0IChjKSAyMDE1IEpvcmRhbiBIYXJiYW5kXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuLy8gY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4vLyBTT0ZUV0FSRS5cblxudmFyIGZuVG9TdHIgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgcmVmbGVjdEFwcGx5OiB0eXBlb2YgUmVmbGVjdC5hcHBseSB8IGZhbHNlIHwgbnVsbCA9IHR5cGVvZiBSZWZsZWN0ID09PSAnb2JqZWN0JyAmJiBSZWZsZWN0ICE9PSBudWxsICYmIFJlZmxlY3QuYXBwbHk7XG52YXIgYmFkQXJyYXlMaWtlOiBhbnk7XG52YXIgaXNDYWxsYWJsZU1hcmtlcjogYW55O1xuaWYgKHR5cGVvZiByZWZsZWN0QXBwbHkgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICAgIGJhZEFycmF5TGlrZSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2xlbmd0aCcsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRocm93IGlzQ2FsbGFibGVNYXJrZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpc0NhbGxhYmxlTWFya2VyID0ge307XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10aHJvdy1saXRlcmFsXG4gICAgICAgIHJlZmxlY3RBcHBseShmdW5jdGlvbiAoKSB7IHRocm93IDQyOyB9LCBudWxsLCBiYWRBcnJheUxpa2UpO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgaWYgKF8gIT09IGlzQ2FsbGFibGVNYXJrZXIpIHtcbiAgICAgICAgICAgIHJlZmxlY3RBcHBseSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59IGVsc2Uge1xuICAgIHJlZmxlY3RBcHBseSA9IG51bGw7XG59XG5cbnZhciBjb25zdHJ1Y3RvclJlZ2V4ID0gL15cXHMqY2xhc3NcXGIvO1xudmFyIGlzRVM2Q2xhc3NGbiA9IGZ1bmN0aW9uIGlzRVM2Q2xhc3NGdW5jdGlvbih2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIGZuU3RyID0gZm5Ub1N0ci5jYWxsKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yUmVnZXgudGVzdChmblN0cik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIG5vdCBhIGZ1bmN0aW9uXG4gICAgfVxufTtcblxudmFyIHRyeUZ1bmN0aW9uT2JqZWN0ID0gZnVuY3Rpb24gdHJ5RnVuY3Rpb25Ub1N0cih2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKGlzRVM2Q2xhc3NGbih2YWx1ZSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICAgIGZuVG9TdHIuY2FsbCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIG9iamVjdENsYXNzID0gJ1tvYmplY3QgT2JqZWN0XSc7XG52YXIgZm5DbGFzcyA9ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG52YXIgZ2VuQ2xhc3MgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nO1xudmFyIGRkYUNsYXNzID0gJ1tvYmplY3QgSFRNTEFsbENvbGxlY3Rpb25dJzsgLy8gSUUgMTFcbnZhciBkZGFDbGFzczIgPSAnW29iamVjdCBIVE1MIGRvY3VtZW50LmFsbCBjbGFzc10nO1xudmFyIGRkYUNsYXNzMyA9ICdbb2JqZWN0IEhUTUxDb2xsZWN0aW9uXSc7IC8vIElFIDktMTBcbnZhciBoYXNUb1N0cmluZ1RhZyA9IHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgISFTeW1ib2wudG9TdHJpbmdUYWc7IC8vIGJldHRlcjogdXNlIGBoYXMtdG9zdHJpbmd0YWdgXG5cbnZhciBpc0lFNjggPSAhKDAgaW4gWyxdKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zcGFyc2UtYXJyYXlzLCBjb21tYS1zcGFjaW5nXG5cbnZhciBpc0REQTogKHZhbHVlOiBhbnkpID0+IGJvb2xlYW4gPSBmdW5jdGlvbiBpc0RvY3VtZW50RG90QWxsKCkgeyByZXR1cm4gZmFsc2U7IH07XG5pZiAodHlwZW9mIGRvY3VtZW50ID09PSAnb2JqZWN0Jykge1xuICAgIC8vIEZpcmVmb3ggMyBjYW5vbmljYWxpemVzIEREQSB0byB1bmRlZmluZWQgd2hlbiBpdCdzIG5vdCBhY2Nlc3NlZCBkaXJlY3RseVxuICAgIHZhciBhbGwgPSBkb2N1bWVudC5hbGw7XG4gICAgaWYgKHRvU3RyLmNhbGwoYWxsKSA9PT0gdG9TdHIuY2FsbChkb2N1bWVudC5hbGwpKSB7XG4gICAgICAgIGlzRERBID0gZnVuY3Rpb24gaXNEb2N1bWVudERvdEFsbCh2YWx1ZSkge1xuICAgICAgICAgICAgLyogZ2xvYmFscyBkb2N1bWVudDogZmFsc2UgKi9cbiAgICAgICAgICAgIC8vIGluIElFIDYtOCwgdHlwZW9mIGRvY3VtZW50LmFsbCBpcyBcIm9iamVjdFwiIGFuZCBpdCdzIHRydXRoeVxuICAgICAgICAgICAgaWYgKChpc0lFNjggfHwgIXZhbHVlKSAmJiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHIgPSB0b1N0ci5jYWxsKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciA9PT0gZGRhQ2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8IHN0ciA9PT0gZGRhQ2xhc3MyXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBzdHIgPT09IGRkYUNsYXNzMyAvLyBvcGVyYSAxMi4xNlxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgc3RyID09PSBvYmplY3RDbGFzcyAvLyBJRSA2LThcbiAgICAgICAgICAgICAgICAgICAgKSAmJiB2YWx1ZSgnJykgPT0gbnVsbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7IC8qKi8gfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNDYWxsYWJsZVJlZkFwcGx5PFQ+KHZhbHVlOiBUIHwgdW5rbm93bik6IHZhbHVlIGlzICguLi5hcmdzOiBhbnlbXSkgPT4gYW55ICB7XG4gICAgaWYgKGlzRERBKHZhbHVlKSkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIGlmICghdmFsdWUpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIHRyeSB7XG4gICAgICAgIChyZWZsZWN0QXBwbHkgYXMgYW55KSh2YWx1ZSwgbnVsbCwgYmFkQXJyYXlMaWtlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlICE9PSBpc0NhbGxhYmxlTWFya2VyKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIH1cbiAgICByZXR1cm4gIWlzRVM2Q2xhc3NGbih2YWx1ZSkgJiYgdHJ5RnVuY3Rpb25PYmplY3QodmFsdWUpO1xufVxuXG5mdW5jdGlvbiBpc0NhbGxhYmxlTm9SZWZBcHBseTxUPih2YWx1ZTogVCB8IHVua25vd24pOiB2YWx1ZSBpcyAoLi4uYXJnczogYW55W10pID0+IGFueSB7XG4gICAgaWYgKGlzRERBKHZhbHVlKSkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIGlmICghdmFsdWUpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIGlmIChoYXNUb1N0cmluZ1RhZykgeyByZXR1cm4gdHJ5RnVuY3Rpb25PYmplY3QodmFsdWUpOyB9XG4gICAgaWYgKGlzRVM2Q2xhc3NGbih2YWx1ZSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdmFyIHN0ckNsYXNzID0gdG9TdHIuY2FsbCh2YWx1ZSk7XG4gICAgaWYgKHN0ckNsYXNzICE9PSBmbkNsYXNzICYmIHN0ckNsYXNzICE9PSBnZW5DbGFzcyAmJiAhKC9eXFxbb2JqZWN0IEhUTUwvKS50ZXN0KHN0ckNsYXNzKSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICByZXR1cm4gdHJ5RnVuY3Rpb25PYmplY3QodmFsdWUpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgcmVmbGVjdEFwcGx5ID8gaXNDYWxsYWJsZVJlZkFwcGx5IDogaXNDYWxsYWJsZU5vUmVmQXBwbHk7XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IGlzQ2FsbGFibGUgZnJvbSBcIi4vY2FsbGFibGUuanNcIjtcblxuLyoqXG4gKiBFeGNlcHRpb24gY2xhc3MgdGhhdCB3aWxsIGJlIHVzZWQgYXMgcmVqZWN0aW9uIHJlYXNvblxuICogaW4gY2FzZSBhIHtAbGluayBDYW5jZWxsYWJsZVByb21pc2V9IGlzIGNhbmNlbGxlZCBzdWNjZXNzZnVsbHkuXG4gKlxuICogVGhlIHZhbHVlIG9mIHRoZSB7QGxpbmsgbmFtZX0gcHJvcGVydHkgaXMgdGhlIHN0cmluZyBgXCJDYW5jZWxFcnJvclwiYC5cbiAqIFRoZSB2YWx1ZSBvZiB0aGUge0BsaW5rIGNhdXNlfSBwcm9wZXJ0eSBpcyB0aGUgY2F1c2UgcGFzc2VkIHRvIHRoZSBjYW5jZWwgbWV0aG9kLCBpZiBhbnkuXG4gKi9cbmV4cG9ydCBjbGFzcyBDYW5jZWxFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IGBDYW5jZWxFcnJvcmAgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBFcnJvciBjb25zdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBvcHRpb25zPzogRXJyb3JPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm5hbWUgPSBcIkNhbmNlbEVycm9yXCI7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4Y2VwdGlvbiBjbGFzcyB0aGF0IHdpbGwgYmUgcmVwb3J0ZWQgYXMgYW4gdW5oYW5kbGVkIHJlamVjdGlvblxuICogaW4gY2FzZSBhIHtAbGluayBDYW5jZWxsYWJsZVByb21pc2V9IHJlamVjdHMgYWZ0ZXIgYmVpbmcgY2FuY2VsbGVkLFxuICogb3Igd2hlbiB0aGUgYG9uY2FuY2VsbGVkYCBjYWxsYmFjayB0aHJvd3Mgb3IgcmVqZWN0cy5cbiAqXG4gKiBUaGUgdmFsdWUgb2YgdGhlIHtAbGluayBuYW1lfSBwcm9wZXJ0eSBpcyB0aGUgc3RyaW5nIGBcIkNhbmNlbGxlZFJlamVjdGlvbkVycm9yXCJgLlxuICogVGhlIHZhbHVlIG9mIHRoZSB7QGxpbmsgY2F1c2V9IHByb3BlcnR5IGlzIHRoZSByZWFzb24gdGhlIHByb21pc2UgcmVqZWN0ZWQgd2l0aC5cbiAqXG4gKiBCZWNhdXNlIHRoZSBvcmlnaW5hbCBwcm9taXNlIHdhcyBjYW5jZWxsZWQsXG4gKiBhIHdyYXBwZXIgcHJvbWlzZSB3aWxsIGJlIHBhc3NlZCB0byB0aGUgdW5oYW5kbGVkIHJlamVjdGlvbiBsaXN0ZW5lciBpbnN0ZWFkLlxuICogVGhlIHtAbGluayBwcm9taXNlfSBwcm9wZXJ0eSBob2xkcyBhIHJlZmVyZW5jZSB0byB0aGUgb3JpZ2luYWwgcHJvbWlzZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENhbmNlbGxlZFJlamVjdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIC8qKlxuICAgICAqIEhvbGRzIGEgcmVmZXJlbmNlIHRvIHRoZSBwcm9taXNlIHRoYXQgd2FzIGNhbmNlbGxlZCBhbmQgdGhlbiByZWplY3RlZC5cbiAgICAgKi9cbiAgICBwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj47XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IGBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcmAgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHByb21pc2UgLSBUaGUgcHJvbWlzZSB0aGF0IGNhdXNlZCB0aGUgZXJyb3Igb3JpZ2luYWxseS5cbiAgICAgKiBAcGFyYW0gcmVhc29uIC0gVGhlIHJlamVjdGlvbiByZWFzb24uXG4gICAgICogQHBhcmFtIGluZm8gLSBBbiBvcHRpb25hbCBpbmZvcm1hdGl2ZSBtZXNzYWdlIHNwZWNpZnlpbmcgdGhlIGNpcmN1bXN0YW5jZXMgaW4gd2hpY2ggdGhlIGVycm9yIHdhcyB0aHJvd24uXG4gICAgICogICAgICAgICAgICAgICBEZWZhdWx0cyB0byB0aGUgc3RyaW5nIGBcIlVuaGFuZGxlZCByZWplY3Rpb24gaW4gY2FuY2VsbGVkIHByb21pc2UuXCJgLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByb21pc2U6IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPiwgcmVhc29uPzogYW55LCBpbmZvPzogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKChpbmZvID8/IFwiVW5oYW5kbGVkIHJlamVjdGlvbiBpbiBjYW5jZWxsZWQgcHJvbWlzZS5cIikgKyBcIiBSZWFzb246IFwiICsgZXJyb3JNZXNzYWdlKHJlYXNvbiksIHsgY2F1c2U6IHJlYXNvbiB9KTtcbiAgICAgICAgdGhpcy5wcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgdGhpcy5uYW1lID0gXCJDYW5jZWxsZWRSZWplY3Rpb25FcnJvclwiO1xuICAgIH1cbn1cblxudHlwZSBDYW5jZWxsYWJsZVByb21pc2VSZXNvbHZlcjxUPiA9ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+IHwgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUPikgPT4gdm9pZDtcbnR5cGUgQ2FuY2VsbGFibGVQcm9taXNlUmVqZWN0b3IgPSAocmVhc29uPzogYW55KSA9PiB2b2lkO1xudHlwZSBDYW5jZWxsYWJsZVByb21pc2VDYW5jZWxsZXIgPSAoY2F1c2U/OiBhbnkpID0+IHZvaWQgfCBQcm9taXNlTGlrZTx2b2lkPjtcbnR5cGUgQ2FuY2VsbGFibGVQcm9taXNlRXhlY3V0b3I8VD4gPSAocmVzb2x2ZTogQ2FuY2VsbGFibGVQcm9taXNlUmVzb2x2ZXI8VD4sIHJlamVjdDogQ2FuY2VsbGFibGVQcm9taXNlUmVqZWN0b3IpID0+IHZvaWQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUPiB7XG4gICAgdGhlbjxUUmVzdWx0MSA9IFQsIFRSZXN1bHQyID0gbmV2ZXI+KG9uZnVsZmlsbGVkPzogKCh2YWx1ZTogVCkgPT4gVFJlc3VsdDEgfCBQcm9taXNlTGlrZTxUUmVzdWx0MT4gfCBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFRSZXN1bHQxPikgfCB1bmRlZmluZWQgfCBudWxsLCBvbnJlamVjdGVkPzogKChyZWFzb246IGFueSkgPT4gVFJlc3VsdDIgfCBQcm9taXNlTGlrZTxUUmVzdWx0Mj4gfCBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFRSZXN1bHQyPikgfCB1bmRlZmluZWQgfCBudWxsKTogQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUUmVzdWx0MSB8IFRSZXN1bHQyPjtcbiAgICBjYW5jZWwoY2F1c2U/OiBhbnkpOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD47XG59XG5cbi8qKlxuICogV3JhcHMgYSBjYW5jZWxsYWJsZSBwcm9taXNlIGFsb25nIHdpdGggaXRzIHJlc29sdXRpb24gbWV0aG9kcy5cbiAqIFRoZSBgb25jYW5jZWxsZWRgIGZpZWxkIHdpbGwgYmUgbnVsbCBpbml0aWFsbHkgYnV0IG1heSBiZSBzZXQgdG8gcHJvdmlkZSBhIGN1c3RvbSBjYW5jZWxsYXRpb24gZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiB7XG4gICAgcHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+O1xuICAgIHJlc29sdmU6IENhbmNlbGxhYmxlUHJvbWlzZVJlc29sdmVyPFQ+O1xuICAgIHJlamVjdDogQ2FuY2VsbGFibGVQcm9taXNlUmVqZWN0b3I7XG4gICAgb25jYW5jZWxsZWQ6IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlciB8IG51bGw7XG59XG5cbmludGVyZmFjZSBDYW5jZWxsYWJsZVByb21pc2VTdGF0ZSB7XG4gICAgcmVhZG9ubHkgcm9vdDogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGU7XG4gICAgcmVzb2x2aW5nOiBib29sZWFuO1xuICAgIHNldHRsZWQ6IGJvb2xlYW47XG4gICAgcmVhc29uPzogQ2FuY2VsRXJyb3I7XG59XG5cbi8vIFByaXZhdGUgZmllbGQgbmFtZXMuXG5jb25zdCBiYXJyaWVyU3ltID0gU3ltYm9sKFwiYmFycmllclwiKTtcbmNvbnN0IGNhbmNlbEltcGxTeW0gPSBTeW1ib2woXCJjYW5jZWxJbXBsXCIpO1xuY29uc3Qgc3BlY2llczogdHlwZW9mIFN5bWJvbC5zcGVjaWVzID0gU3ltYm9sLnNwZWNpZXMgPz8gU3ltYm9sKFwic3BlY2llc1BvbHlmaWxsXCIpO1xuXG4vKipcbiAqIEEgcHJvbWlzZSB3aXRoIGFuIGF0dGFjaGVkIG1ldGhvZCBmb3IgY2FuY2VsbGluZyBsb25nLXJ1bm5pbmcgb3BlcmF0aW9ucyAoc2VlIHtAbGluayBDYW5jZWxsYWJsZVByb21pc2UjY2FuY2VsfSkuXG4gKiBDYW5jZWxsYXRpb24gY2FuIG9wdGlvbmFsbHkgYmUgYm91bmQgdG8gYW4ge0BsaW5rIEFib3J0U2lnbmFsfVxuICogZm9yIGJldHRlciBjb21wb3NhYmlsaXR5IChzZWUge0BsaW5rIENhbmNlbGxhYmxlUHJvbWlzZSNjYW5jZWxPbn0pLlxuICpcbiAqIENhbmNlbGxpbmcgYSBwZW5kaW5nIHByb21pc2Ugd2lsbCByZXN1bHQgaW4gYW4gaW1tZWRpYXRlIHJlamVjdGlvblxuICogd2l0aCBhbiBpbnN0YW5jZSBvZiB7QGxpbmsgQ2FuY2VsRXJyb3J9IGFzIHJlYXNvbixcbiAqIGJ1dCB3aG9ldmVyIHN0YXJ0ZWQgdGhlIHByb21pc2Ugd2lsbCBiZSByZXNwb25zaWJsZVxuICogZm9yIGFjdHVhbGx5IGFib3J0aW5nIHRoZSB1bmRlcmx5aW5nIG9wZXJhdGlvbi5cbiAqIFRvIHRoaXMgcHVycG9zZSwgdGhlIGNvbnN0cnVjdG9yIGFuZCBhbGwgY2hhaW5pbmcgbWV0aG9kc1xuICogYWNjZXB0IG9wdGlvbmFsIGNhbmNlbGxhdGlvbiBjYWxsYmFja3MuXG4gKlxuICogSWYgYSBgQ2FuY2VsbGFibGVQcm9taXNlYCBzdGlsbCByZXNvbHZlcyBhZnRlciBoYXZpbmcgYmVlbiBjYW5jZWxsZWQsXG4gKiB0aGUgcmVzdWx0IHdpbGwgYmUgZGlzY2FyZGVkLiBJZiBpdCByZWplY3RzLCB0aGUgcmVhc29uXG4gKiB3aWxsIGJlIHJlcG9ydGVkIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24sXG4gKiB3cmFwcGVkIGluIGEge0BsaW5rIENhbmNlbGxlZFJlamVjdGlvbkVycm9yfSBpbnN0YW5jZS5cbiAqIFRvIGZhY2lsaXRhdGUgdGhlIGhhbmRsaW5nIG9mIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyxcbiAqIGNhbmNlbGxlZCBgQ2FuY2VsbGFibGVQcm9taXNlYHMgd2lsbCBfbm90XyByZXBvcnQgdW5oYW5kbGVkIGBDYW5jZWxFcnJvcmBzXG4gKiB3aG9zZSBgY2F1c2VgIGZpZWxkIGlzIHRoZSBzYW1lIGFzIHRoZSBvbmUgd2l0aCB3aGljaCB0aGUgY3VycmVudCBwcm9taXNlIHdhcyBjYW5jZWxsZWQuXG4gKlxuICogQWxsIHVzdWFsIHByb21pc2UgbWV0aG9kcyBhcmUgZGVmaW5lZCBhbmQgcmV0dXJuIGEgYENhbmNlbGxhYmxlUHJvbWlzZWBcbiAqIHdob3NlIGNhbmNlbCBtZXRob2Qgd2lsbCBjYW5jZWwgdGhlIHBhcmVudCBvcGVyYXRpb24gYXMgd2VsbCwgcHJvcGFnYXRpbmcgdGhlIGNhbmNlbGxhdGlvbiByZWFzb25cbiAqIHVwd2FyZHMgdGhyb3VnaCBwcm9taXNlIGNoYWlucy5cbiAqIENvbnZlcnNlbHksIGNhbmNlbGxpbmcgYSBwcm9taXNlIHdpbGwgbm90IGF1dG9tYXRpY2FsbHkgY2FuY2VsIGRlcGVuZGVudCBwcm9taXNlcyBkb3duc3RyZWFtOlxuICogYGBgdHNcbiAqIGxldCByb290ID0gbmV3IENhbmNlbGxhYmxlUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7IC4uLiB9KTtcbiAqIGxldCBjaGlsZDEgPSByb290LnRoZW4oKCkgPT4geyAuLi4gfSk7XG4gKiBsZXQgY2hpbGQyID0gY2hpbGQxLnRoZW4oKCkgPT4geyAuLi4gfSk7XG4gKiBsZXQgY2hpbGQzID0gcm9vdC5jYXRjaCgoKSA9PiB7IC4uLiB9KTtcbiAqIGNoaWxkMS5jYW5jZWwoKTsgLy8gQ2FuY2VscyBjaGlsZDEgYW5kIHJvb3QsIGJ1dCBub3QgY2hpbGQyIG9yIGNoaWxkM1xuICogYGBgXG4gKiBDYW5jZWxsaW5nIGEgcHJvbWlzZSB0aGF0IGhhcyBhbHJlYWR5IHNldHRsZWQgaXMgc2FmZSBhbmQgaGFzIG5vIGNvbnNlcXVlbmNlLlxuICpcbiAqIFRoZSBgY2FuY2VsYCBtZXRob2QgcmV0dXJucyBhIHByb21pc2UgdGhhdCBfYWx3YXlzIGZ1bGZpbGxzX1xuICogYWZ0ZXIgdGhlIHdob2xlIGNoYWluIGhhcyBwcm9jZXNzZWQgdGhlIGNhbmNlbCByZXF1ZXN0XG4gKiBhbmQgYWxsIGF0dGFjaGVkIGNhbGxiYWNrcyB1cCB0byB0aGF0IG1vbWVudCBoYXZlIHJ1bi5cbiAqXG4gKiBBbGwgRVMyMDI0IHByb21pc2UgbWV0aG9kcyAoc3RhdGljIGFuZCBpbnN0YW5jZSkgYXJlIGRlZmluZWQgb24gQ2FuY2VsbGFibGVQcm9taXNlLFxuICogYnV0IGFjdHVhbCBhdmFpbGFiaWxpdHkgbWF5IHZhcnkgd2l0aCBPUy93ZWJ2aWV3IHZlcnNpb24uXG4gKlxuICogSW4gbGluZSB3aXRoIHRoZSBwcm9wb3NhbCBhdCBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1ybS1idWlsdGluLXN1YmNsYXNzaW5nLFxuICogYENhbmNlbGxhYmxlUHJvbWlzZWAgZG9lcyBub3Qgc3VwcG9ydCB0cmFuc3BhcmVudCBzdWJjbGFzc2luZy5cbiAqIEV4dGVuZGVycyBzaG91bGQgdGFrZSBjYXJlIHRvIHByb3ZpZGUgdGhlaXIgb3duIG1ldGhvZCBpbXBsZW1lbnRhdGlvbnMuXG4gKiBUaGlzIG1pZ2h0IGJlIHJlY29uc2lkZXJlZCBpbiBjYXNlIHRoZSBwcm9wb3NhbCBpcyByZXRpcmVkLlxuICpcbiAqIENhbmNlbGxhYmxlUHJvbWlzZSBpcyBhIHdyYXBwZXIgYXJvdW5kIHRoZSBET00gUHJvbWlzZSBvYmplY3RcbiAqIGFuZCBpcyBjb21wbGlhbnQgd2l0aCB0aGUgW1Byb21pc2VzL0ErIHNwZWNpZmljYXRpb25dKGh0dHBzOi8vcHJvbWlzZXNhcGx1cy5jb20vKVxuICogKGl0IHBhc3NlcyB0aGUgW2NvbXBsaWFuY2Ugc3VpdGVdKGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy10ZXN0cykpXG4gKiBpZiBzbyBpcyB0aGUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIENhbmNlbGxhYmxlUHJvbWlzZTxUPiBleHRlbmRzIFByb21pc2U8VD4gaW1wbGVtZW50cyBQcm9taXNlTGlrZTxUPiwgQ2FuY2VsbGFibGVQcm9taXNlTGlrZTxUPiB7XG4gICAgLy8gUHJpdmF0ZSBmaWVsZHMuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHByaXZhdGUgW2JhcnJpZXJTeW1dITogUGFydGlhbDxQcm9taXNlV2l0aFJlc29sdmVyczx2b2lkPj4gfCBudWxsO1xuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwcml2YXRlIHJlYWRvbmx5IFtjYW5jZWxJbXBsU3ltXSE6IChyZWFzb246IENhbmNlbEVycm9yKSA9PiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD47XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGBDYW5jZWxsYWJsZVByb21pc2VgLlxuICAgICAqXG4gICAgICogQHBhcmFtIGV4ZWN1dG9yIC0gQSBjYWxsYmFjayB1c2VkIHRvIGluaXRpYWxpemUgdGhlIHByb21pc2UuIFRoaXMgY2FsbGJhY2sgaXMgcGFzc2VkIHR3byBhcmd1bWVudHM6XG4gICAgICogICAgICAgICAgICAgICAgICAgYSBgcmVzb2x2ZWAgY2FsbGJhY2sgdXNlZCB0byByZXNvbHZlIHRoZSBwcm9taXNlIHdpdGggYSB2YWx1ZVxuICAgICAqICAgICAgICAgICAgICAgICAgIG9yIHRoZSByZXN1bHQgb2YgYW5vdGhlciBwcm9taXNlIChwb3NzaWJseSBjYW5jZWxsYWJsZSksXG4gICAgICogICAgICAgICAgICAgICAgICAgYW5kIGEgYHJlamVjdGAgY2FsbGJhY2sgdXNlZCB0byByZWplY3QgdGhlIHByb21pc2Ugd2l0aCBhIHByb3ZpZGVkIHJlYXNvbiBvciBlcnJvci5cbiAgICAgKiAgICAgICAgICAgICAgICAgICBJZiB0aGUgdmFsdWUgcHJvdmlkZWQgdG8gdGhlIGByZXNvbHZlYCBjYWxsYmFjayBpcyBhIHRoZW5hYmxlIF9hbmRfIGNhbmNlbGxhYmxlIG9iamVjdFxuICAgICAqICAgICAgICAgICAgICAgICAgIChpdCBoYXMgYSBgdGhlbmAgX2FuZF8gYSBgY2FuY2VsYCBtZXRob2QpLFxuICAgICAqICAgICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyB3aWxsIGJlIGZvcndhcmRlZCB0byB0aGF0IG9iamVjdCBhbmQgdGhlIG9uY2FuY2VsbGVkIHdpbGwgbm90IGJlIGludm9rZWQgYW55bW9yZS5cbiAgICAgKiAgICAgICAgICAgICAgICAgICBJZiBhbnkgb25lIG9mIHRoZSB0d28gY2FsbGJhY2tzIGlzIGNhbGxlZCBfYWZ0ZXJfIHRoZSBwcm9taXNlIGhhcyBiZWVuIGNhbmNlbGxlZCxcbiAgICAgKiAgICAgICAgICAgICAgICAgICB0aGUgcHJvdmlkZWQgdmFsdWVzIHdpbGwgYmUgY2FuY2VsbGVkIGFuZCByZXNvbHZlZCBhcyB1c3VhbCxcbiAgICAgKiAgICAgICAgICAgICAgICAgICBidXQgdGhlaXIgcmVzdWx0cyB3aWxsIGJlIGRpc2NhcmRlZC5cbiAgICAgKiAgICAgICAgICAgICAgICAgICBIb3dldmVyLCBpZiB0aGUgcmVzb2x1dGlvbiBwcm9jZXNzIHVsdGltYXRlbHkgZW5kcyB1cCBpbiBhIHJlamVjdGlvblxuICAgICAqICAgICAgICAgICAgICAgICAgIHRoYXQgaXMgbm90IGR1ZSB0byBjYW5jZWxsYXRpb24sIHRoZSByZWplY3Rpb24gcmVhc29uXG4gICAgICogICAgICAgICAgICAgICAgICAgd2lsbCBiZSB3cmFwcGVkIGluIGEge0BsaW5rIENhbmNlbGxlZFJlamVjdGlvbkVycm9yfVxuICAgICAqICAgICAgICAgICAgICAgICAgIGFuZCBidWJibGVkIHVwIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24uXG4gICAgICogQHBhcmFtIG9uY2FuY2VsbGVkIC0gSXQgaXMgdGhlIGNhbGxlcidzIHJlc3BvbnNpYmlsaXR5IHRvIGVuc3VyZSB0aGF0IGFueSBvcGVyYXRpb25cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICBzdGFydGVkIGJ5IHRoZSBleGVjdXRvciBpcyBwcm9wZXJseSBoYWx0ZWQgdXBvbiBjYW5jZWxsYXRpb24uXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgVGhpcyBvcHRpb25hbCBjYWxsYmFjayBjYW4gYmUgdXNlZCB0byB0aGF0IHB1cnBvc2UuXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgSXQgd2lsbCBiZSBjYWxsZWQgX3N5bmNocm9ub3VzbHlfIHdpdGggYSBjYW5jZWxsYXRpb24gY2F1c2VcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICB3aGVuIGNhbmNlbGxhdGlvbiBpcyByZXF1ZXN0ZWQsIF9hZnRlcl8gdGhlIHByb21pc2UgaGFzIGFscmVhZHkgcmVqZWN0ZWRcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICB3aXRoIGEge0BsaW5rIENhbmNlbEVycm9yfSwgYnV0IF9iZWZvcmVfXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgYW55IHtAbGluayB0aGVufS97QGxpbmsgY2F0Y2h9L3tAbGluayBmaW5hbGx5fSBjYWxsYmFjayBydW5zLlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIElmIHRoZSBjYWxsYmFjayByZXR1cm5zIGEgdGhlbmFibGUsIHRoZSBwcm9taXNlIHJldHVybmVkIGZyb20ge0BsaW5rIGNhbmNlbH1cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICB3aWxsIG9ubHkgZnVsZmlsbCBhZnRlciB0aGUgZm9ybWVyIGhhcyBzZXR0bGVkLlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIFVuaGFuZGxlZCBleGNlcHRpb25zIG9yIHJlamVjdGlvbnMgZnJvbSB0aGUgY2FsbGJhY2sgd2lsbCBiZSB3cmFwcGVkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGFuZCBidWJibGVkIHVwIGFzIHVuaGFuZGxlZCByZWplY3Rpb25zLlxuICAgICAqICAgICAgICAgICAgICAgICAgICAgIElmIHRoZSBgcmVzb2x2ZWAgY2FsbGJhY2sgaXMgY2FsbGVkIGJlZm9yZSBjYW5jZWxsYXRpb24gd2l0aCBhIGNhbmNlbGxhYmxlIHByb21pc2UsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIG9uIHRoaXMgcHJvbWlzZSB3aWxsIGJlIGRpdmVydGVkIHRvIHRoYXQgcHJvbWlzZSxcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICBhbmQgdGhlIG9yaWdpbmFsIGBvbmNhbmNlbGxlZGAgY2FsbGJhY2sgd2lsbCBiZSBkaXNjYXJkZWQuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZXhlY3V0b3I6IENhbmNlbGxhYmxlUHJvbWlzZUV4ZWN1dG9yPFQ+LCBvbmNhbmNlbGxlZD86IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlcikge1xuICAgICAgICBsZXQgcmVzb2x2ZSE6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICAgICAgICBsZXQgcmVqZWN0ITogKHJlYXNvbj86IGFueSkgPT4gdm9pZDtcbiAgICAgICAgc3VwZXIoKHJlcywgcmVqKSA9PiB7IHJlc29sdmUgPSByZXM7IHJlamVjdCA9IHJlajsgfSk7XG5cbiAgICAgICAgaWYgKCh0aGlzLmNvbnN0cnVjdG9yIGFzIGFueSlbc3BlY2llc10gIT09IFByb21pc2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5jZWxsYWJsZVByb21pc2UgZG9lcyBub3Qgc3VwcG9ydCB0cmFuc3BhcmVudCBzdWJjbGFzc2luZy4gUGxlYXNlIHJlZnJhaW4gZnJvbSBvdmVycmlkaW5nIHRoZSBbU3ltYm9sLnNwZWNpZXNdIHN0YXRpYyBwcm9wZXJ0eS5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiA9IHtcbiAgICAgICAgICAgIHByb21pc2U6IHRoaXMsXG4gICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgcmVqZWN0LFxuICAgICAgICAgICAgZ2V0IG9uY2FuY2VsbGVkKCkgeyByZXR1cm4gb25jYW5jZWxsZWQgPz8gbnVsbDsgfSxcbiAgICAgICAgICAgIHNldCBvbmNhbmNlbGxlZChjYikgeyBvbmNhbmNlbGxlZCA9IGNiID8/IHVuZGVmaW5lZDsgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHN0YXRlOiBDYW5jZWxsYWJsZVByb21pc2VTdGF0ZSA9IHtcbiAgICAgICAgICAgIGdldCByb290KCkgeyByZXR1cm4gc3RhdGU7IH0sXG4gICAgICAgICAgICByZXNvbHZpbmc6IGZhbHNlLFxuICAgICAgICAgICAgc2V0dGxlZDogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTZXR1cCBjYW5jZWxsYXRpb24gc3lzdGVtLlxuICAgICAgICB2b2lkIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgICAgIFtiYXJyaWVyU3ltXToge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbY2FuY2VsSW1wbFN5bV06IHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2FuY2VsbGVyRm9yKHByb21pc2UsIHN0YXRlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSdW4gdGhlIGFjdHVhbCBleGVjdXRvci5cbiAgICAgICAgY29uc3QgcmVqZWN0b3IgPSByZWplY3RvckZvcihwcm9taXNlLCBzdGF0ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBleGVjdXRvcihyZXNvbHZlckZvcihwcm9taXNlLCBzdGF0ZSksIHJlamVjdG9yKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoc3RhdGUucmVzb2x2aW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmhhbmRsZWQgZXhjZXB0aW9uIGluIENhbmNlbGxhYmxlUHJvbWlzZSBleGVjdXRvci5cIiwgZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0b3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbmNlbHMgaW1tZWRpYXRlbHkgdGhlIGV4ZWN1dGlvbiBvZiB0aGUgb3BlcmF0aW9uIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHByb21pc2UuXG4gICAgICogVGhlIHByb21pc2UgcmVqZWN0cyB3aXRoIGEge0BsaW5rIENhbmNlbEVycm9yfSBpbnN0YW5jZSBhcyByZWFzb24sXG4gICAgICogd2l0aCB0aGUge0BsaW5rIENhbmNlbEVycm9yI2NhdXNlfSBwcm9wZXJ0eSBzZXQgdG8gdGhlIGdpdmVuIGFyZ3VtZW50LCBpZiBhbnkuXG4gICAgICpcbiAgICAgKiBIYXMgbm8gZWZmZWN0IGlmIGNhbGxlZCBhZnRlciB0aGUgcHJvbWlzZSBoYXMgYWxyZWFkeSBzZXR0bGVkO1xuICAgICAqIHJlcGVhdGVkIGNhbGxzIGluIHBhcnRpY3VsYXIgYXJlIHNhZmUsIGJ1dCBvbmx5IHRoZSBmaXJzdCBvbmVcbiAgICAgKiB3aWxsIHNldCB0aGUgY2FuY2VsbGF0aW9uIGNhdXNlLlxuICAgICAqXG4gICAgICogVGhlIGBDYW5jZWxFcnJvcmAgZXhjZXB0aW9uIF9uZWVkIG5vdF8gYmUgaGFuZGxlZCBleHBsaWNpdGx5IF9vbiB0aGUgcHJvbWlzZXMgdGhhdCBhcmUgYmVpbmcgY2FuY2VsbGVkOl9cbiAgICAgKiBjYW5jZWxsaW5nIGEgcHJvbWlzZSB3aXRoIG5vIGF0dGFjaGVkIHJlamVjdGlvbiBoYW5kbGVyIGRvZXMgbm90IHRyaWdnZXIgYW4gdW5oYW5kbGVkIHJlamVjdGlvbiBldmVudC5cbiAgICAgKiBUaGVyZWZvcmUsIHRoZSBmb2xsb3dpbmcgaWRpb21zIGFyZSBhbGwgZXF1YWxseSBjb3JyZWN0OlxuICAgICAqIGBgYHRzXG4gICAgICogbmV3IENhbmNlbGxhYmxlUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7IC4uLiB9KS5jYW5jZWwoKTtcbiAgICAgKiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsgLi4uIH0pLnRoZW4oLi4uKS5jYW5jZWwoKTtcbiAgICAgKiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsgLi4uIH0pLnRoZW4oLi4uKS5jYXRjaCguLi4pLmNhbmNlbCgpO1xuICAgICAqIGBgYFxuICAgICAqIFdoZW5ldmVyIHNvbWUgY2FuY2VsbGVkIHByb21pc2UgaW4gYSBjaGFpbiByZWplY3RzIHdpdGggYSBgQ2FuY2VsRXJyb3JgXG4gICAgICogd2l0aCB0aGUgc2FtZSBjYW5jZWxsYXRpb24gY2F1c2UgYXMgaXRzZWxmLCB0aGUgZXJyb3Igd2lsbCBiZSBkaXNjYXJkZWQgc2lsZW50bHkuXG4gICAgICogSG93ZXZlciwgdGhlIGBDYW5jZWxFcnJvcmAgX3dpbGwgc3RpbGwgYmUgZGVsaXZlcmVkXyB0byBhbGwgYXR0YWNoZWQgcmVqZWN0aW9uIGhhbmRsZXJzXG4gICAgICogYWRkZWQgYnkge0BsaW5rIHRoZW59IGFuZCByZWxhdGVkIG1ldGhvZHM6XG4gICAgICogYGBgdHNcbiAgICAgKiBsZXQgY2FuY2VsbGFibGUgPSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsgLi4uIH0pO1xuICAgICAqIGNhbmNlbGxhYmxlLnRoZW4oKCkgPT4geyAuLi4gfSkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAqIGNhbmNlbGxhYmxlLmNhbmNlbCgpOyAvLyBBIENhbmNlbEVycm9yIGlzIHByaW50ZWQgdG8gdGhlIGNvbnNvbGUuXG4gICAgICogYGBgXG4gICAgICogSWYgdGhlIGBDYW5jZWxFcnJvcmAgaXMgbm90IGhhbmRsZWQgZG93bnN0cmVhbSBieSB0aGUgdGltZSBpdCByZWFjaGVzXG4gICAgICogYSBfbm9uLWNhbmNlbGxlZF8gcHJvbWlzZSwgaXQgX3dpbGxfIHRyaWdnZXIgYW4gdW5oYW5kbGVkIHJlamVjdGlvbiBldmVudCxcbiAgICAgKiBqdXN0IGxpa2Ugbm9ybWFsIHJlamVjdGlvbnMgd291bGQ6XG4gICAgICogYGBgdHNcbiAgICAgKiBsZXQgY2FuY2VsbGFibGUgPSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsgLi4uIH0pO1xuICAgICAqIGxldCBjaGFpbmVkID0gY2FuY2VsbGFibGUudGhlbigoKSA9PiB7IC4uLiB9KS50aGVuKCgpID0+IHsgLi4uIH0pOyAvLyBObyBjYXRjaC4uLlxuICAgICAqIGNhbmNlbGxhYmxlLmNhbmNlbCgpOyAvLyBVbmhhbmRsZWQgcmVqZWN0aW9uIGV2ZW50IG9uIGNoYWluZWQhXG4gICAgICogYGBgXG4gICAgICogVGhlcmVmb3JlLCBpdCBpcyBpbXBvcnRhbnQgdG8gZWl0aGVyIGNhbmNlbCB3aG9sZSBwcm9taXNlIGNoYWlucyBmcm9tIHRoZWlyIHRhaWwsXG4gICAgICogYXMgc2hvd24gaW4gdGhlIGNvcnJlY3QgaWRpb21zIGFib3ZlLCBvciB0YWtlIGNhcmUgb2YgaGFuZGxpbmcgZXJyb3JzIGV2ZXJ5d2hlcmUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIGNhbmNlbGxhYmxlIHByb21pc2UgdGhhdCBfZnVsZmlsbHNfIGFmdGVyIHRoZSBjYW5jZWwgY2FsbGJhY2sgKGlmIGFueSlcbiAgICAgKiBhbmQgYWxsIGhhbmRsZXJzIGF0dGFjaGVkIHVwIHRvIHRoZSBjYWxsIHRvIGNhbmNlbCBoYXZlIHJ1bi5cbiAgICAgKiBJZiB0aGUgY2FuY2VsIGNhbGxiYWNrIHJldHVybnMgYSB0aGVuYWJsZSwgdGhlIHByb21pc2UgcmV0dXJuZWQgYnkgYGNhbmNlbGBcbiAgICAgKiB3aWxsIGFsc28gd2FpdCBmb3IgdGhhdCB0aGVuYWJsZSB0byBzZXR0bGUuXG4gICAgICogVGhpcyBlbmFibGVzIGNhbGxlcnMgdG8gd2FpdCBmb3IgdGhlIGNhbmNlbGxlZCBvcGVyYXRpb24gdG8gdGVybWluYXRlXG4gICAgICogd2l0aG91dCBiZWluZyBmb3JjZWQgdG8gaGFuZGxlIHBvdGVudGlhbCBlcnJvcnMgYXQgdGhlIGNhbGwgc2l0ZS5cbiAgICAgKiBgYGB0c1xuICAgICAqIGNhbmNlbGxhYmxlLmNhbmNlbCgpLnRoZW4oKCkgPT4ge1xuICAgICAqICAgICAvLyBDbGVhbnVwIGZpbmlzaGVkLCBpdCdzIHNhZmUgdG8gZG8gc29tZXRoaW5nIGVsc2UuXG4gICAgICogfSwgKGVycikgPT4ge1xuICAgICAqICAgICAvLyBVbnJlYWNoYWJsZTogdGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSBjYW5jZWwgd2lsbCBuZXZlciByZWplY3QuXG4gICAgICogfSk7XG4gICAgICogYGBgXG4gICAgICogTm90ZSB0aGF0IHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgX25vdF8gaGFuZGxlIGltcGxpY2l0bHkgYW55IHJlamVjdGlvblxuICAgICAqIHRoYXQgbWlnaHQgaGF2ZSBvY2N1cnJlZCBhbHJlYWR5IGluIHRoZSBjYW5jZWxsZWQgY2hhaW4uXG4gICAgICogSXQgd2lsbCBqdXN0IHRyYWNrIHdoZXRoZXIgcmVnaXN0ZXJlZCBoYW5kbGVycyBoYXZlIGJlZW4gZXhlY3V0ZWQgb3Igbm90LlxuICAgICAqIFRoZXJlZm9yZSwgdW5oYW5kbGVkIHJlamVjdGlvbnMgd2lsbCBuZXZlciBiZSBzaWxlbnRseSBoYW5kbGVkIGJ5IGNhbGxpbmcgY2FuY2VsLlxuICAgICAqL1xuICAgIGNhbmNlbChjYXVzZT86IGFueSk6IENhbmNlbGxhYmxlUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyBJTlZBUklBTlQ6IHRoZSByZXN1bHQgb2YgdGhpc1tjYW5jZWxJbXBsU3ltXSBhbmQgdGhlIGJhcnJpZXIgZG8gbm90IGV2ZXIgcmVqZWN0LlxuICAgICAgICAgICAgLy8gVW5mb3J0dW5hdGVseSBtYWNPUyBIaWdoIFNpZXJyYSBkb2VzIG5vdCBzdXBwb3J0IFByb21pc2UuYWxsU2V0dGxlZC5cbiAgICAgICAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICB0aGlzW2NhbmNlbEltcGxTeW1dKG5ldyBDYW5jZWxFcnJvcihcIlByb21pc2UgY2FuY2VsbGVkLlwiLCB7IGNhdXNlIH0pKSxcbiAgICAgICAgICAgICAgICBjdXJyZW50QmFycmllcih0aGlzKVxuICAgICAgICAgICAgXSkudGhlbigoKSA9PiByZXNvbHZlKCksICgpID0+IHJlc29sdmUoKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmRzIHByb21pc2UgY2FuY2VsbGF0aW9uIHRvIHRoZSBhYm9ydCBldmVudCBvZiB0aGUgZ2l2ZW4ge0BsaW5rIEFib3J0U2lnbmFsfS5cbiAgICAgKiBJZiB0aGUgc2lnbmFsIGhhcyBhbHJlYWR5IGFib3J0ZWQsIHRoZSBwcm9taXNlIHdpbGwgYmUgY2FuY2VsbGVkIGltbWVkaWF0ZWx5LlxuICAgICAqIFdoZW4gZWl0aGVyIGNvbmRpdGlvbiBpcyB2ZXJpZmllZCwgdGhlIGNhbmNlbGxhdGlvbiBjYXVzZSB3aWxsIGJlIHNldFxuICAgICAqIHRvIHRoZSBzaWduYWwncyBhYm9ydCByZWFzb24gKHNlZSB7QGxpbmsgQWJvcnRTaWduYWwjcmVhc29ufSkuXG4gICAgICpcbiAgICAgKiBIYXMgbm8gZWZmZWN0IGlmIGNhbGxlZCAob3IgaWYgdGhlIHNpZ25hbCBhYm9ydHMpIF9hZnRlcl8gdGhlIHByb21pc2UgaGFzIGFscmVhZHkgc2V0dGxlZC5cbiAgICAgKiBPbmx5IHRoZSBmaXJzdCBzaWduYWwgdG8gYWJvcnQgd2lsbCBzZXQgdGhlIGNhbmNlbGxhdGlvbiBjYXVzZS5cbiAgICAgKlxuICAgICAqIEZvciBtb3JlIGRldGFpbHMgYWJvdXQgdGhlIGNhbmNlbGxhdGlvbiBwcm9jZXNzLFxuICAgICAqIHNlZSB7QGxpbmsgY2FuY2VsfSBhbmQgdGhlIGBDYW5jZWxsYWJsZVByb21pc2VgIGNvbnN0cnVjdG9yLlxuICAgICAqXG4gICAgICogVGhpcyBtZXRob2QgZW5hYmxlcyBgYXdhaXRgaW5nIGNhbmNlbGxhYmxlIHByb21pc2VzIHdpdGhvdXQgaGF2aW5nXG4gICAgICogdG8gc3RvcmUgdGhlbSBmb3IgZnV0dXJlIGNhbmNlbGxhdGlvbiwgZS5nLjpcbiAgICAgKiBgYGB0c1xuICAgICAqIGF3YWl0IGxvbmdSdW5uaW5nT3BlcmF0aW9uKCkuY2FuY2VsT24oc2lnbmFsKTtcbiAgICAgKiBgYGBcbiAgICAgKiBpbnN0ZWFkIG9mOlxuICAgICAqIGBgYHRzXG4gICAgICogbGV0IHByb21pc2VUb0JlQ2FuY2VsbGVkID0gbG9uZ1J1bm5pbmdPcGVyYXRpb24oKTtcbiAgICAgKiBhd2FpdCBwcm9taXNlVG9CZUNhbmNlbGxlZDtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoaXMgcHJvbWlzZSwgZm9yIG1ldGhvZCBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBjYW5jZWxPbihzaWduYWw6IEFib3J0U2lnbmFsKTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcbiAgICAgICAgaWYgKHNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICB2b2lkIHRoaXMuY2FuY2VsKHNpZ25hbC5yZWFzb24pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCAoKSA9PiB2b2lkIHRoaXMuY2FuY2VsKHNpZ25hbC5yZWFzb24pLCB7Y2FwdHVyZTogdHJ1ZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoZXMgY2FsbGJhY2tzIGZvciB0aGUgcmVzb2x1dGlvbiBhbmQvb3IgcmVqZWN0aW9uIG9mIHRoZSBgQ2FuY2VsbGFibGVQcm9taXNlYC5cbiAgICAgKlxuICAgICAqIFRoZSBvcHRpb25hbCBgb25jYW5jZWxsZWRgIGFyZ3VtZW50IHdpbGwgYmUgaW52b2tlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCxcbiAgICAgKiB3aXRoIHRoZSBzYW1lIHNlbWFudGljcyBhcyB0aGUgYG9uY2FuY2VsbGVkYCBhcmd1bWVudCBvZiB0aGUgY29uc3RydWN0b3IuXG4gICAgICogV2hlbiB0aGUgcGFyZW50IHByb21pc2UgcmVqZWN0cyBvciBpcyBjYW5jZWxsZWQsIHRoZSBgb25yZWplY3RlZGAgY2FsbGJhY2sgd2lsbCBydW4sXG4gICAgICogX2V2ZW4gYWZ0ZXIgdGhlIHJldHVybmVkIHByb21pc2UgaGFzIGJlZW4gY2FuY2VsbGVkOl9cbiAgICAgKiBpbiB0aGF0IGNhc2UsIHNob3VsZCBpdCByZWplY3Qgb3IgdGhyb3csIHRoZSByZWFzb24gd2lsbCBiZSB3cmFwcGVkXG4gICAgICogaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGFuZCBidWJibGVkIHVwIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb25mdWxmaWxsZWQgVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiB0aGUgUHJvbWlzZSBpcyByZXNvbHZlZC5cbiAgICAgKiBAcGFyYW0gb25yZWplY3RlZCBUaGUgY2FsbGJhY2sgdG8gZXhlY3V0ZSB3aGVuIHRoZSBQcm9taXNlIGlzIHJlamVjdGVkLlxuICAgICAqIEByZXR1cm5zIEEgYENhbmNlbGxhYmxlUHJvbWlzZWAgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHdoaWNoZXZlciBjYWxsYmFjayBpcyBleGVjdXRlZC5cbiAgICAgKiBUaGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBob29rZWQgdXAgdG8gcHJvcGFnYXRlIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyB1cCB0aGUgY2hhaW4sIGJ1dCBub3QgZG93bjpcbiAgICAgKlxuICAgICAqICAgLSBpZiB0aGUgcGFyZW50IHByb21pc2UgaXMgY2FuY2VsbGVkLCB0aGUgYG9ucmVqZWN0ZWRgIGhhbmRsZXIgd2lsbCBiZSBpbnZva2VkIHdpdGggYSBgQ2FuY2VsRXJyb3JgXG4gICAgICogICAgIGFuZCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBfd2lsbCByZXNvbHZlIHJlZ3VsYXJseV8gd2l0aCBpdHMgcmVzdWx0O1xuICAgICAqICAgLSBjb252ZXJzZWx5LCBpZiB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBjYW5jZWxsZWQsIF90aGUgcGFyZW50IHByb21pc2UgaXMgY2FuY2VsbGVkIHRvbztfXG4gICAgICogICAgIHRoZSBgb25yZWplY3RlZGAgaGFuZGxlciB3aWxsIHN0aWxsIGJlIGludm9rZWQgd2l0aCB0aGUgcGFyZW50J3MgYENhbmNlbEVycm9yYCxcbiAgICAgKiAgICAgYnV0IGl0cyByZXN1bHQgd2lsbCBiZSBkaXNjYXJkZWRcbiAgICAgKiAgICAgYW5kIHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgcmVqZWN0IHdpdGggYSBgQ2FuY2VsRXJyb3JgIGFzIHdlbGwuXG4gICAgICpcbiAgICAgKiBUaGUgcHJvbWlzZSByZXR1cm5lZCBmcm9tIHtAbGluayBjYW5jZWx9IHdpbGwgZnVsZmlsbCBvbmx5IGFmdGVyIGFsbCBhdHRhY2hlZCBoYW5kbGVyc1xuICAgICAqIHVwIHRoZSBlbnRpcmUgcHJvbWlzZSBjaGFpbiBoYXZlIGJlZW4gcnVuLlxuICAgICAqXG4gICAgICogSWYgZWl0aGVyIGNhbGxiYWNrIHJldHVybnMgYSBjYW5jZWxsYWJsZSBwcm9taXNlLFxuICAgICAqIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyB3aWxsIGJlIGRpdmVydGVkIHRvIGl0LFxuICAgICAqIGFuZCB0aGUgc3BlY2lmaWVkIGBvbmNhbmNlbGxlZGAgY2FsbGJhY2sgd2lsbCBiZSBkaXNjYXJkZWQuXG4gICAgICovXG4gICAgdGhlbjxUUmVzdWx0MSA9IFQsIFRSZXN1bHQyID0gbmV2ZXI+KG9uZnVsZmlsbGVkPzogKCh2YWx1ZTogVCkgPT4gVFJlc3VsdDEgfCBQcm9taXNlTGlrZTxUUmVzdWx0MT4gfCBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFRSZXN1bHQxPikgfCB1bmRlZmluZWQgfCBudWxsLCBvbnJlamVjdGVkPzogKChyZWFzb246IGFueSkgPT4gVFJlc3VsdDIgfCBQcm9taXNlTGlrZTxUUmVzdWx0Mj4gfCBDYW5jZWxsYWJsZVByb21pc2VMaWtlPFRSZXN1bHQyPikgfCB1bmRlZmluZWQgfCBudWxsLCBvbmNhbmNlbGxlZD86IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlcik6IENhbmNlbGxhYmxlUHJvbWlzZTxUUmVzdWx0MSB8IFRSZXN1bHQyPiB7XG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDYW5jZWxsYWJsZVByb21pc2UpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2FuY2VsbGFibGVQcm9taXNlLnByb3RvdHlwZS50aGVuIGNhbGxlZCBvbiBhbiBpbnZhbGlkIG9iamVjdC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOT1RFOiBUeXBlU2NyaXB0J3MgYnVpbHQtaW4gdHlwZSBmb3IgdGhlbiBpcyBicm9rZW4sXG4gICAgICAgIC8vIGFzIGl0IGFsbG93cyBzcGVjaWZ5aW5nIGFuIGFyYml0cmFyeSBUUmVzdWx0MSAhPSBUIGV2ZW4gd2hlbiBvbmZ1bGZpbGxlZCBpcyBub3QgYSBmdW5jdGlvbi5cbiAgICAgICAgLy8gV2UgY2Fubm90IGZpeCBpdCBpZiB3ZSB3YW50IHRvIENhbmNlbGxhYmxlUHJvbWlzZSB0byBpbXBsZW1lbnQgUHJvbWlzZUxpa2U8VD4uXG5cbiAgICAgICAgaWYgKCFpc0NhbGxhYmxlKG9uZnVsZmlsbGVkKSkgeyBvbmZ1bGZpbGxlZCA9IGlkZW50aXR5IGFzIGFueTsgfVxuICAgICAgICBpZiAoIWlzQ2FsbGFibGUob25yZWplY3RlZCkpIHsgb25yZWplY3RlZCA9IHRocm93ZXI7IH1cblxuICAgICAgICBpZiAob25mdWxmaWxsZWQgPT09IGlkZW50aXR5ICYmIG9ucmVqZWN0ZWQgPT0gdGhyb3dlcikge1xuICAgICAgICAgICAgLy8gU2hvcnRjdXQgZm9yIHRyaXZpYWwgYXJndW1lbnRzLlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDYW5jZWxsYWJsZVByb21pc2UoKHJlc29sdmUpID0+IHJlc29sdmUodGhpcyBhcyBhbnkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJhcnJpZXI6IFBhcnRpYWw8UHJvbWlzZVdpdGhSZXNvbHZlcnM8dm9pZD4+ID0ge307XG4gICAgICAgIHRoaXNbYmFycmllclN5bV0gPSBiYXJyaWVyO1xuXG4gICAgICAgIHJldHVybiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPFRSZXN1bHQxIHwgVFJlc3VsdDI+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZvaWQgc3VwZXIudGhlbihcbiAgICAgICAgICAgICAgICAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNbYmFycmllclN5bV0gPT09IGJhcnJpZXIpIHsgdGhpc1tiYXJyaWVyU3ltXSA9IG51bGw7IH1cbiAgICAgICAgICAgICAgICAgICAgYmFycmllci5yZXNvbHZlPy4oKTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvbmZ1bGZpbGxlZCEodmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKHJlYXNvbj8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNbYmFycmllclN5bV0gPT09IGJhcnJpZXIpIHsgdGhpc1tiYXJyaWVyU3ltXSA9IG51bGw7IH1cbiAgICAgICAgICAgICAgICAgICAgYmFycmllci5yZXNvbHZlPy4oKTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvbnJlamVjdGVkIShyZWFzb24pKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sIGFzeW5jIChjYXVzZT8pID0+IHtcbiAgICAgICAgICAgIC8vY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9uY2FuY2VsbGVkPy4oY2F1c2UpO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNhbmNlbChjYXVzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaGVzIGEgY2FsbGJhY2sgZm9yIG9ubHkgdGhlIHJlamVjdGlvbiBvZiB0aGUgUHJvbWlzZS5cbiAgICAgKlxuICAgICAqIFRoZSBvcHRpb25hbCBgb25jYW5jZWxsZWRgIGFyZ3VtZW50IHdpbGwgYmUgaW52b2tlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCxcbiAgICAgKiB3aXRoIHRoZSBzYW1lIHNlbWFudGljcyBhcyB0aGUgYG9uY2FuY2VsbGVkYCBhcmd1bWVudCBvZiB0aGUgY29uc3RydWN0b3IuXG4gICAgICogV2hlbiB0aGUgcGFyZW50IHByb21pc2UgcmVqZWN0cyBvciBpcyBjYW5jZWxsZWQsIHRoZSBgb25yZWplY3RlZGAgY2FsbGJhY2sgd2lsbCBydW4sXG4gICAgICogX2V2ZW4gYWZ0ZXIgdGhlIHJldHVybmVkIHByb21pc2UgaGFzIGJlZW4gY2FuY2VsbGVkOl9cbiAgICAgKiBpbiB0aGF0IGNhc2UsIHNob3VsZCBpdCByZWplY3Qgb3IgdGhyb3csIHRoZSByZWFzb24gd2lsbCBiZSB3cmFwcGVkXG4gICAgICogaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGFuZCBidWJibGVkIHVwIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24uXG4gICAgICpcbiAgICAgKiBJdCBpcyBlcXVpdmFsZW50IHRvXG4gICAgICogYGBgdHNcbiAgICAgKiBjYW5jZWxsYWJsZVByb21pc2UudGhlbih1bmRlZmluZWQsIG9ucmVqZWN0ZWQsIG9uY2FuY2VsbGVkKTtcbiAgICAgKiBgYGBcbiAgICAgKiBhbmQgdGhlIHNhbWUgY2F2ZWF0cyBhcHBseS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSBmb3IgdGhlIGNvbXBsZXRpb24gb2YgdGhlIGNhbGxiYWNrLlxuICAgICAqIENhbmNlbGxhdGlvbiByZXF1ZXN0cyBvbiB0aGUgcmV0dXJuZWQgcHJvbWlzZVxuICAgICAqIHdpbGwgcHJvcGFnYXRlIHVwIHRoZSBjaGFpbiB0byB0aGUgcGFyZW50IHByb21pc2UsXG4gICAgICogYnV0IG5vdCBpbiB0aGUgb3RoZXIgZGlyZWN0aW9uLlxuICAgICAqXG4gICAgICogVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB7QGxpbmsgY2FuY2VsfSB3aWxsIGZ1bGZpbGwgb25seSBhZnRlciBhbGwgYXR0YWNoZWQgaGFuZGxlcnNcbiAgICAgKiB1cCB0aGUgZW50aXJlIHByb21pc2UgY2hhaW4gaGF2ZSBiZWVuIHJ1bi5cbiAgICAgKlxuICAgICAqIElmIGBvbnJlamVjdGVkYCByZXR1cm5zIGEgY2FuY2VsbGFibGUgcHJvbWlzZSxcbiAgICAgKiBjYW5jZWxsYXRpb24gcmVxdWVzdHMgd2lsbCBiZSBkaXZlcnRlZCB0byBpdCxcbiAgICAgKiBhbmQgdGhlIHNwZWNpZmllZCBgb25jYW5jZWxsZWRgIGNhbGxiYWNrIHdpbGwgYmUgZGlzY2FyZGVkLlxuICAgICAqIFNlZSB7QGxpbmsgdGhlbn0gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKi9cbiAgICBjYXRjaDxUUmVzdWx0ID0gbmV2ZXI+KG9ucmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiAoUHJvbWlzZUxpa2U8VFJlc3VsdD4gfCBUUmVzdWx0KSkgfCB1bmRlZmluZWQgfCBudWxsLCBvbmNhbmNlbGxlZD86IENhbmNlbGxhYmxlUHJvbWlzZUNhbmNlbGxlcik6IENhbmNlbGxhYmxlUHJvbWlzZTxUIHwgVFJlc3VsdD4ge1xuICAgICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25yZWplY3RlZCwgb25jYW5jZWxsZWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaGVzIGEgY2FsbGJhY2sgdGhhdCBpcyBpbnZva2VkIHdoZW4gdGhlIENhbmNlbGxhYmxlUHJvbWlzZSBpcyBzZXR0bGVkIChmdWxmaWxsZWQgb3IgcmVqZWN0ZWQpLiBUaGVcbiAgICAgKiByZXNvbHZlZCB2YWx1ZSBjYW5ub3QgYmUgYWNjZXNzZWQgb3IgbW9kaWZpZWQgZnJvbSB0aGUgY2FsbGJhY2suXG4gICAgICogVGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBzZXR0bGUgaW4gdGhlIHNhbWUgc3RhdGUgYXMgdGhlIG9yaWdpbmFsIG9uZVxuICAgICAqIGFmdGVyIHRoZSBwcm92aWRlZCBjYWxsYmFjayBoYXMgY29tcGxldGVkIGV4ZWN1dGlvbixcbiAgICAgKiB1bmxlc3MgdGhlIGNhbGxiYWNrIHRocm93cyBvciByZXR1cm5zIGEgcmVqZWN0aW5nIHByb21pc2UsXG4gICAgICogaW4gd2hpY2ggY2FzZSB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIHJlamVjdCBhcyB3ZWxsLlxuICAgICAqXG4gICAgICogVGhlIG9wdGlvbmFsIGBvbmNhbmNlbGxlZGAgYXJndW1lbnQgd2lsbCBiZSBpbnZva2VkIHdoZW4gdGhlIHJldHVybmVkIHByb21pc2UgaXMgY2FuY2VsbGVkLFxuICAgICAqIHdpdGggdGhlIHNhbWUgc2VtYW50aWNzIGFzIHRoZSBgb25jYW5jZWxsZWRgIGFyZ3VtZW50IG9mIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgKiBPbmNlIHRoZSBwYXJlbnQgcHJvbWlzZSBzZXR0bGVzLCB0aGUgYG9uZmluYWxseWAgY2FsbGJhY2sgd2lsbCBydW4sXG4gICAgICogX2V2ZW4gYWZ0ZXIgdGhlIHJldHVybmVkIHByb21pc2UgaGFzIGJlZW4gY2FuY2VsbGVkOl9cbiAgICAgKiBpbiB0aGF0IGNhc2UsIHNob3VsZCBpdCByZWplY3Qgb3IgdGhyb3csIHRoZSByZWFzb24gd2lsbCBiZSB3cmFwcGVkXG4gICAgICogaW4gYSB7QGxpbmsgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3J9IGFuZCBidWJibGVkIHVwIGFzIGFuIHVuaGFuZGxlZCByZWplY3Rpb24uXG4gICAgICpcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBpbXBsZW1lbnRlZCBpbiB0ZXJtcyBvZiB7QGxpbmsgdGhlbn0gYW5kIHRoZSBzYW1lIGNhdmVhdHMgYXBwbHkuXG4gICAgICogSXQgaXMgcG9seWZpbGxlZCwgaGVuY2UgYXZhaWxhYmxlIGluIGV2ZXJ5IE9TL3dlYnZpZXcgdmVyc2lvbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSBmb3IgdGhlIGNvbXBsZXRpb24gb2YgdGhlIGNhbGxiYWNrLlxuICAgICAqIENhbmNlbGxhdGlvbiByZXF1ZXN0cyBvbiB0aGUgcmV0dXJuZWQgcHJvbWlzZVxuICAgICAqIHdpbGwgcHJvcGFnYXRlIHVwIHRoZSBjaGFpbiB0byB0aGUgcGFyZW50IHByb21pc2UsXG4gICAgICogYnV0IG5vdCBpbiB0aGUgb3RoZXIgZGlyZWN0aW9uLlxuICAgICAqXG4gICAgICogVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB7QGxpbmsgY2FuY2VsfSB3aWxsIGZ1bGZpbGwgb25seSBhZnRlciBhbGwgYXR0YWNoZWQgaGFuZGxlcnNcbiAgICAgKiB1cCB0aGUgZW50aXJlIHByb21pc2UgY2hhaW4gaGF2ZSBiZWVuIHJ1bi5cbiAgICAgKlxuICAgICAqIElmIGBvbmZpbmFsbHlgIHJldHVybnMgYSBjYW5jZWxsYWJsZSBwcm9taXNlLFxuICAgICAqIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyB3aWxsIGJlIGRpdmVydGVkIHRvIGl0LFxuICAgICAqIGFuZCB0aGUgc3BlY2lmaWVkIGBvbmNhbmNlbGxlZGAgY2FsbGJhY2sgd2lsbCBiZSBkaXNjYXJkZWQuXG4gICAgICogU2VlIHtAbGluayB0aGVufSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAqL1xuICAgIGZpbmFsbHkob25maW5hbGx5PzogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkIHwgbnVsbCwgb25jYW5jZWxsZWQ/OiBDYW5jZWxsYWJsZVByb21pc2VDYW5jZWxsZXIpOiBDYW5jZWxsYWJsZVByb21pc2U8VD4ge1xuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ2FuY2VsbGFibGVQcm9taXNlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbmNlbGxhYmxlUHJvbWlzZS5wcm90b3R5cGUuZmluYWxseSBjYWxsZWQgb24gYW4gaW52YWxpZCBvYmplY3QuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc0NhbGxhYmxlKG9uZmluYWxseSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRoZW4ob25maW5hbGx5LCBvbmZpbmFsbHksIG9uY2FuY2VsbGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4oXG4gICAgICAgICAgICAodmFsdWUpID0+IENhbmNlbGxhYmxlUHJvbWlzZS5yZXNvbHZlKG9uZmluYWxseSgpKS50aGVuKCgpID0+IHZhbHVlKSxcbiAgICAgICAgICAgIChyZWFzb24/KSA9PiBDYW5jZWxsYWJsZVByb21pc2UucmVzb2x2ZShvbmZpbmFsbHkoKSkudGhlbigoKSA9PiB7IHRocm93IHJlYXNvbjsgfSksXG4gICAgICAgICAgICBvbmNhbmNlbGxlZCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXZSB1c2UgdGhlIGBbU3ltYm9sLnNwZWNpZXNdYCBzdGF0aWMgcHJvcGVydHksIGlmIGF2YWlsYWJsZSxcbiAgICAgKiB0byBkaXNhYmxlIHRoZSBidWlsdC1pbiBhdXRvbWF0aWMgc3ViY2xhc3NpbmcgZmVhdHVyZXMgZnJvbSB7QGxpbmsgUHJvbWlzZX0uXG4gICAgICogSXQgaXMgY3JpdGljYWwgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgdGhhdCBleHRlbmRlcnMgZG8gbm90IG92ZXJyaWRlIHRoaXMuXG4gICAgICogT25jZSB0aGUgcHJvcG9zYWwgYXQgaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtcm0tYnVpbHRpbi1zdWJjbGFzc2luZ1xuICAgICAqIGlzIGVpdGhlciBhY2NlcHRlZCBvciByZXRpcmVkLCB0aGlzIGltcGxlbWVudGF0aW9uIHdpbGwgaGF2ZSB0byBiZSByZXZpc2VkIGFjY29yZGluZ2x5LlxuICAgICAqXG4gICAgICogQGlnbm9yZVxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgW3NwZWNpZXNdKCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgQ2FuY2VsbGFibGVQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCBhbiBhcnJheSBvZiByZXN1bHRzXG4gICAgICogd2hlbiBhbGwgb2YgdGhlIHByb3ZpZGVkIFByb21pc2VzIHJlc29sdmUsIG9yIHJlamVjdGVkIHdoZW4gYW55IFByb21pc2UgaXMgcmVqZWN0ZWQuXG4gICAgICpcbiAgICAgKiBFdmVyeSBvbmUgb2YgdGhlIHByb3ZpZGVkIG9iamVjdHMgdGhhdCBpcyBhIHRoZW5hYmxlIF9hbmRfIGNhbmNlbGxhYmxlIG9iamVjdFxuICAgICAqIHdpbGwgYmUgY2FuY2VsbGVkIHdoZW4gdGhlIHJldHVybmVkIHByb21pc2UgaXMgY2FuY2VsbGVkLCB3aXRoIHRoZSBzYW1lIGNhdXNlLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIGFsbDxUPih2YWx1ZXM6IEl0ZXJhYmxlPFQgfCBQcm9taXNlTGlrZTxUPj4pOiBDYW5jZWxsYWJsZVByb21pc2U8QXdhaXRlZDxUPltdPjtcbiAgICBzdGF0aWMgYWxsPFQgZXh0ZW5kcyByZWFkb25seSB1bmtub3duW10gfCBbXT4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHsgLXJlYWRvbmx5IFtQIGluIGtleW9mIFRdOiBBd2FpdGVkPFRbUF0+OyB9PjtcbiAgICBzdGF0aWMgYWxsPFQgZXh0ZW5kcyBJdGVyYWJsZTx1bmtub3duPiB8IEFycmF5TGlrZTx1bmtub3duPj4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+IHtcbiAgICAgICAgbGV0IGNvbGxlY3RlZCA9IEFycmF5LmZyb20odmFsdWVzKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGNvbGxlY3RlZC5sZW5ndGggPT09IDBcbiAgICAgICAgICAgID8gQ2FuY2VsbGFibGVQcm9taXNlLnJlc29sdmUoY29sbGVjdGVkKVxuICAgICAgICAgICAgOiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB2b2lkIFByb21pc2UuYWxsKGNvbGxlY3RlZCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSwgKGNhdXNlPyk6IFByb21pc2U8dm9pZD4gPT4gY2FuY2VsQWxsKHByb21pc2UsIGNvbGxlY3RlZCwgY2F1c2UpKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIENhbmNlbGxhYmxlUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggYW4gYXJyYXkgb2YgcmVzdWx0c1xuICAgICAqIHdoZW4gYWxsIG9mIHRoZSBwcm92aWRlZCBQcm9taXNlcyByZXNvbHZlIG9yIHJlamVjdC5cbiAgICAgKlxuICAgICAqIEV2ZXJ5IG9uZSBvZiB0aGUgcHJvdmlkZWQgb2JqZWN0cyB0aGF0IGlzIGEgdGhlbmFibGUgX2FuZF8gY2FuY2VsbGFibGUgb2JqZWN0XG4gICAgICogd2lsbCBiZSBjYW5jZWxsZWQgd2hlbiB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBjYW5jZWxsZWQsIHdpdGggdGhlIHNhbWUgY2F1c2UuXG4gICAgICpcbiAgICAgKiBAZ3JvdXAgU3RhdGljIE1ldGhvZHNcbiAgICAgKi9cbiAgICBzdGF0aWMgYWxsU2V0dGxlZDxUPih2YWx1ZXM6IEl0ZXJhYmxlPFQgfCBQcm9taXNlTGlrZTxUPj4pOiBDYW5jZWxsYWJsZVByb21pc2U8UHJvbWlzZVNldHRsZWRSZXN1bHQ8QXdhaXRlZDxUPj5bXT47XG4gICAgc3RhdGljIGFsbFNldHRsZWQ8VCBleHRlbmRzIHJlYWRvbmx5IHVua25vd25bXSB8IFtdPih2YWx1ZXM6IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8eyAtcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFByb21pc2VTZXR0bGVkUmVzdWx0PEF3YWl0ZWQ8VFtQXT4+OyB9PjtcbiAgICBzdGF0aWMgYWxsU2V0dGxlZDxUIGV4dGVuZHMgSXRlcmFibGU8dW5rbm93bj4gfCBBcnJheUxpa2U8dW5rbm93bj4+KHZhbHVlczogVCk6IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPiB7XG4gICAgICAgIGxldCBjb2xsZWN0ZWQgPSBBcnJheS5mcm9tKHZhbHVlcyk7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBjb2xsZWN0ZWQubGVuZ3RoID09PSAwXG4gICAgICAgICAgICA/IENhbmNlbGxhYmxlUHJvbWlzZS5yZXNvbHZlKGNvbGxlY3RlZClcbiAgICAgICAgICAgIDogbmV3IENhbmNlbGxhYmxlUHJvbWlzZTx1bmtub3duPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgdm9pZCBQcm9taXNlLmFsbFNldHRsZWQoY29sbGVjdGVkKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgICB9LCAoY2F1c2U/KTogUHJvbWlzZTx2b2lkPiA9PiBjYW5jZWxBbGwocHJvbWlzZSwgY29sbGVjdGVkLCBjYXVzZSkpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYW55IGZ1bmN0aW9uIHJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIGJ5IHRoZSBmaXJzdCBnaXZlbiBwcm9taXNlIHRvIGJlIGZ1bGZpbGxlZCxcbiAgICAgKiBvciByZWplY3RlZCB3aXRoIGFuIEFnZ3JlZ2F0ZUVycm9yIGNvbnRhaW5pbmcgYW4gYXJyYXkgb2YgcmVqZWN0aW9uIHJlYXNvbnNcbiAgICAgKiBpZiBhbGwgb2YgdGhlIGdpdmVuIHByb21pc2VzIGFyZSByZWplY3RlZC5cbiAgICAgKiBJdCByZXNvbHZlcyBhbGwgZWxlbWVudHMgb2YgdGhlIHBhc3NlZCBpdGVyYWJsZSB0byBwcm9taXNlcyBhcyBpdCBydW5zIHRoaXMgYWxnb3JpdGhtLlxuICAgICAqXG4gICAgICogRXZlcnkgb25lIG9mIHRoZSBwcm92aWRlZCBvYmplY3RzIHRoYXQgaXMgYSB0aGVuYWJsZSBfYW5kXyBjYW5jZWxsYWJsZSBvYmplY3RcbiAgICAgKiB3aWxsIGJlIGNhbmNlbGxlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCwgd2l0aCB0aGUgc2FtZSBjYXVzZS5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyBhbnk8VD4odmFsdWVzOiBJdGVyYWJsZTxUIHwgUHJvbWlzZUxpa2U8VD4+KTogQ2FuY2VsbGFibGVQcm9taXNlPEF3YWl0ZWQ8VD4+O1xuICAgIHN0YXRpYyBhbnk8VCBleHRlbmRzIHJlYWRvbmx5IHVua25vd25bXSB8IFtdPih2YWx1ZXM6IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8QXdhaXRlZDxUW251bWJlcl0+PjtcbiAgICBzdGF0aWMgYW55PFQgZXh0ZW5kcyBJdGVyYWJsZTx1bmtub3duPiB8IEFycmF5TGlrZTx1bmtub3duPj4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+IHtcbiAgICAgICAgbGV0IGNvbGxlY3RlZCA9IEFycmF5LmZyb20odmFsdWVzKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGNvbGxlY3RlZC5sZW5ndGggPT09IDBcbiAgICAgICAgICAgID8gQ2FuY2VsbGFibGVQcm9taXNlLnJlc29sdmUoY29sbGVjdGVkKVxuICAgICAgICAgICAgOiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB2b2lkIFByb21pc2UuYW55KGNvbGxlY3RlZCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgfSwgKGNhdXNlPyk6IFByb21pc2U8dm9pZD4gPT4gY2FuY2VsQWxsKHByb21pc2UsIGNvbGxlY3RlZCwgY2F1c2UpKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCBvciByZWplY3RlZCB3aGVuIGFueSBvZiB0aGUgcHJvdmlkZWQgUHJvbWlzZXMgYXJlIHJlc29sdmVkIG9yIHJlamVjdGVkLlxuICAgICAqXG4gICAgICogRXZlcnkgb25lIG9mIHRoZSBwcm92aWRlZCBvYmplY3RzIHRoYXQgaXMgYSB0aGVuYWJsZSBfYW5kXyBjYW5jZWxsYWJsZSBvYmplY3RcbiAgICAgKiB3aWxsIGJlIGNhbmNlbGxlZCB3aGVuIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIGNhbmNlbGxlZCwgd2l0aCB0aGUgc2FtZSBjYXVzZS5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyByYWNlPFQ+KHZhbHVlczogSXRlcmFibGU8VCB8IFByb21pc2VMaWtlPFQ+Pik6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFQ+PjtcbiAgICBzdGF0aWMgcmFjZTxUIGV4dGVuZHMgcmVhZG9ubHkgdW5rbm93bltdIHwgW10+KHZhbHVlczogVCk6IENhbmNlbGxhYmxlUHJvbWlzZTxBd2FpdGVkPFRbbnVtYmVyXT4+O1xuICAgIHN0YXRpYyByYWNlPFQgZXh0ZW5kcyBJdGVyYWJsZTx1bmtub3duPiB8IEFycmF5TGlrZTx1bmtub3duPj4odmFsdWVzOiBUKTogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+IHtcbiAgICAgICAgbGV0IGNvbGxlY3RlZCA9IEFycmF5LmZyb20odmFsdWVzKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8dW5rbm93bj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdm9pZCBQcm9taXNlLnJhY2UoY29sbGVjdGVkKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0sIChjYXVzZT8pOiBQcm9taXNlPHZvaWQ+ID0+IGNhbmNlbEFsbChwcm9taXNlLCBjb2xsZWN0ZWQsIGNhdXNlKSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgY2FuY2VsbGVkIENhbmNlbGxhYmxlUHJvbWlzZSBmb3IgdGhlIHByb3ZpZGVkIGNhdXNlLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIGNhbmNlbDxUID0gbmV2ZXI+KGNhdXNlPzogYW55KTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcbiAgICAgICAgY29uc3QgcCA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8VD4oKCkgPT4ge30pO1xuICAgICAgICBwLmNhbmNlbChjYXVzZSk7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlIHRoYXQgY2FuY2Vsc1xuICAgICAqIGFmdGVyIHRoZSBzcGVjaWZpZWQgdGltZW91dCwgd2l0aCB0aGUgcHJvdmlkZWQgY2F1c2UuXG4gICAgICpcbiAgICAgKiBJZiB0aGUge0BsaW5rIEFib3J0U2lnbmFsLnRpbWVvdXR9IGZhY3RvcnkgbWV0aG9kIGlzIGF2YWlsYWJsZSxcbiAgICAgKiBpdCBpcyB1c2VkIHRvIGJhc2UgdGhlIHRpbWVvdXQgb24gX2FjdGl2ZV8gdGltZSByYXRoZXIgdGhhbiBfZWxhcHNlZF8gdGltZS5cbiAgICAgKiBPdGhlcndpc2UsIGB0aW1lb3V0YCBmYWxscyBiYWNrIHRvIHtAbGluayBzZXRUaW1lb3V0fS5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyB0aW1lb3V0PFQgPSBuZXZlcj4obWlsbGlzZWNvbmRzOiBudW1iZXIsIGNhdXNlPzogYW55KTogQ2FuY2VsbGFibGVQcm9taXNlPFQ+IHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8VD4oKCkgPT4ge30pO1xuICAgICAgICBpZiAoQWJvcnRTaWduYWwgJiYgdHlwZW9mIEFib3J0U2lnbmFsID09PSAnZnVuY3Rpb24nICYmIEFib3J0U2lnbmFsLnRpbWVvdXQgJiYgdHlwZW9mIEFib3J0U2lnbmFsLnRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIEFib3J0U2lnbmFsLnRpbWVvdXQobWlsbGlzZWNvbmRzKS5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsICgpID0+IHZvaWQgcHJvbWlzZS5jYW5jZWwoY2F1c2UpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdm9pZCBwcm9taXNlLmNhbmNlbChjYXVzZSksIG1pbGxpc2Vjb25kcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBDYW5jZWxsYWJsZVByb21pc2UgdGhhdCByZXNvbHZlcyBhZnRlciB0aGUgc3BlY2lmaWVkIHRpbWVvdXQuXG4gICAgICogVGhlIHJldHVybmVkIHByb21pc2UgY2FuIGJlIGNhbmNlbGxlZCB3aXRob3V0IGNvbnNlcXVlbmNlcy5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyBzbGVlcChtaWxsaXNlY29uZHM6IG51bWJlcik6IENhbmNlbGxhYmxlUHJvbWlzZTx2b2lkPjtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IENhbmNlbGxhYmxlUHJvbWlzZSB0aGF0IHJlc29sdmVzIGFmdGVyXG4gICAgICogdGhlIHNwZWNpZmllZCB0aW1lb3V0LCB3aXRoIHRoZSBwcm92aWRlZCB2YWx1ZS5cbiAgICAgKiBUaGUgcmV0dXJuZWQgcHJvbWlzZSBjYW4gYmUgY2FuY2VsbGVkIHdpdGhvdXQgY29uc2VxdWVuY2VzLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIHNsZWVwPFQ+KG1pbGxpc2Vjb25kczogbnVtYmVyLCB2YWx1ZTogVCk6IENhbmNlbGxhYmxlUHJvbWlzZTxUPjtcbiAgICBzdGF0aWMgc2xlZXA8VCA9IHZvaWQ+KG1pbGxpc2Vjb25kczogbnVtYmVyLCB2YWx1ZT86IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8VD4ge1xuICAgICAgICByZXR1cm4gbmV3IENhbmNlbGxhYmxlUHJvbWlzZTxUPigocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiByZXNvbHZlKHZhbHVlISksIG1pbGxpc2Vjb25kcyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgcmVqZWN0ZWQgQ2FuY2VsbGFibGVQcm9taXNlIGZvciB0aGUgcHJvdmlkZWQgcmVhc29uLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIHJlamVjdDxUID0gbmV2ZXI+KHJlYXNvbj86IGFueSk6IENhbmNlbGxhYmxlUHJvbWlzZTxUPiB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FuY2VsbGFibGVQcm9taXNlPFQ+KChfLCByZWplY3QpID0+IHJlamVjdChyZWFzb24pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJlc29sdmVkIENhbmNlbGxhYmxlUHJvbWlzZS5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlKCk6IENhbmNlbGxhYmxlUHJvbWlzZTx2b2lkPjtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJlc29sdmVkIENhbmNlbGxhYmxlUHJvbWlzZSBmb3IgdGhlIHByb3ZpZGVkIHZhbHVlLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmU8VD4odmFsdWU6IFQpOiBDYW5jZWxsYWJsZVByb21pc2U8QXdhaXRlZDxUPj47XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyByZXNvbHZlZCBDYW5jZWxsYWJsZVByb21pc2UgZm9yIHRoZSBwcm92aWRlZCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBncm91cCBTdGF0aWMgTWV0aG9kc1xuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlPFQ+KHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pOiBDYW5jZWxsYWJsZVByb21pc2U8QXdhaXRlZDxUPj47XG4gICAgc3RhdGljIHJlc29sdmU8VCA9IHZvaWQ+KHZhbHVlPzogVCB8IFByb21pc2VMaWtlPFQ+KTogQ2FuY2VsbGFibGVQcm9taXNlPEF3YWl0ZWQ8VD4+IHtcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQ2FuY2VsbGFibGVQcm9taXNlKSB7XG4gICAgICAgICAgICAvLyBPcHRpbWlzZSBmb3IgY2FuY2VsbGFibGUgcHJvbWlzZXMuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBDYW5jZWxsYWJsZVByb21pc2U8YW55PigocmVzb2x2ZSkgPT4gcmVzb2x2ZSh2YWx1ZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgQ2FuY2VsbGFibGVQcm9taXNlIGFuZCByZXR1cm5zIGl0IGluIGFuIG9iamVjdCwgYWxvbmcgd2l0aCBpdHMgcmVzb2x2ZSBhbmQgcmVqZWN0IGZ1bmN0aW9uc1xuICAgICAqIGFuZCBhIGdldHRlci9zZXR0ZXIgZm9yIHRoZSBjYW5jZWxsYXRpb24gY2FsbGJhY2suXG4gICAgICpcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBwb2x5ZmlsbGVkLCBoZW5jZSBhdmFpbGFibGUgaW4gZXZlcnkgT1Mvd2VidmlldyB2ZXJzaW9uLlxuICAgICAqXG4gICAgICogQGdyb3VwIFN0YXRpYyBNZXRob2RzXG4gICAgICovXG4gICAgc3RhdGljIHdpdGhSZXNvbHZlcnM8VD4oKTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiB7XG4gICAgICAgIGxldCByZXN1bHQ6IENhbmNlbGxhYmxlUHJvbWlzZVdpdGhSZXNvbHZlcnM8VD4gPSB7IG9uY2FuY2VsbGVkOiBudWxsIH0gYXMgYW55O1xuICAgICAgICByZXN1bHQucHJvbWlzZSA9IG5ldyBDYW5jZWxsYWJsZVByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0LnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICAgICAgcmVzdWx0LnJlamVjdCA9IHJlamVjdDtcbiAgICAgICAgfSwgKGNhdXNlPzogYW55KSA9PiB7IHJlc3VsdC5vbmNhbmNlbGxlZD8uKGNhdXNlKTsgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBjYWxsYmFjayB0aGF0IGltcGxlbWVudHMgdGhlIGNhbmNlbGxhdGlvbiBhbGdvcml0aG0gZm9yIHRoZSBnaXZlbiBjYW5jZWxsYWJsZSBwcm9taXNlLlxuICogVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB0aGUgcmVzdWx0aW5nIGZ1bmN0aW9uIGRvZXMgbm90IHJlamVjdC5cbiAqL1xuZnVuY3Rpb24gY2FuY2VsbGVyRm9yPFQ+KHByb21pc2U6IENhbmNlbGxhYmxlUHJvbWlzZVdpdGhSZXNvbHZlcnM8VD4sIHN0YXRlOiBDYW5jZWxsYWJsZVByb21pc2VTdGF0ZSkge1xuICAgIGxldCBjYW5jZWxsYXRpb25Qcm9taXNlOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4gPSB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4gKHJlYXNvbjogQ2FuY2VsRXJyb3IpOiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD4gPT4ge1xuICAgICAgICBpZiAoIXN0YXRlLnNldHRsZWQpIHtcbiAgICAgICAgICAgIHN0YXRlLnNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgc3RhdGUucmVhc29uID0gcmVhc29uO1xuICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QocmVhc29uKTtcblxuICAgICAgICAgICAgLy8gQXR0YWNoIGFuIGVycm9yIGhhbmRsZXIgdGhhdCBpZ25vcmVzIHRoaXMgc3BlY2lmaWMgcmVqZWN0aW9uIHJlYXNvbiBhbmQgbm90aGluZyBlbHNlLlxuICAgICAgICAgICAgLy8gSW4gdGhlb3J5LCBhIHNhbmUgdW5kZXJseWluZyBpbXBsZW1lbnRhdGlvbiBhdCB0aGlzIHBvaW50XG4gICAgICAgICAgICAvLyBzaG91bGQgYWx3YXlzIHJlamVjdCB3aXRoIG91ciBjYW5jZWxsYXRpb24gcmVhc29uLFxuICAgICAgICAgICAgLy8gaGVuY2UgdGhlIGhhbmRsZXIgd2lsbCBuZXZlciB0aHJvdy5cbiAgICAgICAgICAgIHZvaWQgUHJvbWlzZS5wcm90b3R5cGUudGhlbi5jYWxsKHByb21pc2UucHJvbWlzZSwgdW5kZWZpbmVkLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciAhPT0gcmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHJlYXNvbiBpcyBub3Qgc2V0LCB0aGUgcHJvbWlzZSByZXNvbHZlZCByZWd1bGFybHksIGhlbmNlIHdlIG11c3Qgbm90IGNhbGwgb25jYW5jZWxsZWQuXG4gICAgICAgIC8vIElmIG9uY2FuY2VsbGVkIGlzIHVuc2V0LCBubyBuZWVkIHRvIGdvIGFueSBmdXJ0aGVyLlxuICAgICAgICBpZiAoIXN0YXRlLnJlYXNvbiB8fCAhcHJvbWlzZS5vbmNhbmNlbGxlZCkgeyByZXR1cm47IH1cblxuICAgICAgICBjYW5jZWxsYXRpb25Qcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShwcm9taXNlLm9uY2FuY2VsbGVkIShzdGF0ZS5yZWFzb24hLmNhdXNlKSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgQ2FuY2VsbGVkUmVqZWN0aW9uRXJyb3IocHJvbWlzZS5wcm9taXNlLCBlcnIsIFwiVW5oYW5kbGVkIGV4Y2VwdGlvbiBpbiBvbmNhbmNlbGxlZCBjYWxsYmFjay5cIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgocmVhc29uPykgPT4ge1xuICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IENhbmNlbGxlZFJlamVjdGlvbkVycm9yKHByb21pc2UucHJvbWlzZSwgcmVhc29uLCBcIlVuaGFuZGxlZCByZWplY3Rpb24gaW4gb25jYW5jZWxsZWQgY2FsbGJhY2suXCIpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVW5zZXQgb25jYW5jZWxsZWQgdG8gcHJldmVudCByZXBlYXRlZCBjYWxscy5cbiAgICAgICAgcHJvbWlzZS5vbmNhbmNlbGxlZCA9IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIGNhbmNlbGxhdGlvblByb21pc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBjYWxsYmFjayB0aGF0IGltcGxlbWVudHMgdGhlIHJlc29sdXRpb24gYWxnb3JpdGhtIGZvciB0aGUgZ2l2ZW4gY2FuY2VsbGFibGUgcHJvbWlzZS5cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZXJGb3I8VD4ocHJvbWlzZTogQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVyczxUPiwgc3RhdGU6IENhbmNlbGxhYmxlUHJvbWlzZVN0YXRlKTogQ2FuY2VsbGFibGVQcm9taXNlUmVzb2x2ZXI8VD4ge1xuICAgIHJldHVybiAodmFsdWUpID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLnJlc29sdmluZykgeyByZXR1cm47IH1cbiAgICAgICAgc3RhdGUucmVzb2x2aW5nID0gdHJ1ZTtcblxuICAgICAgICBpZiAodmFsdWUgPT09IHByb21pc2UucHJvbWlzZSkge1xuICAgICAgICAgICAgaWYgKHN0YXRlLnNldHRsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICBzdGF0ZS5zZXR0bGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2UgY2Fubm90IGJlIHJlc29sdmVkIHdpdGggaXRzZWxmLlwiKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCAmJiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgICBsZXQgdGhlbjogYW55O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGVuID0gKHZhbHVlIGFzIGFueSkudGhlbjtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHN0YXRlLnNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNDYWxsYWJsZSh0aGVuKSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjYW5jZWwgPSAodmFsdWUgYXMgYW55KS5jYW5jZWw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0NhbGxhYmxlKGNhbmNlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9uY2FuY2VsbGVkID0gKGNhdXNlPzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVmbGVjdC5hcHBseShjYW5jZWwsIHZhbHVlLCBbY2F1c2VdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUucmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgYWxyZWFkeSBjYW5jZWxsZWQsIHByb3BhZ2F0ZSBjYW5jZWxsYXRpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB0aGUgY2FuY2VsbGVyIGFsZ29yaXRobSBkb2VzIG5vdCByZWplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyBpdCBjYW4gYmUgZGlzY2FyZGVkIHNhZmVseS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIGNhbmNlbGxlckZvcih7IC4uLnByb21pc2UsIG9uY2FuY2VsbGVkIH0sIHN0YXRlKShzdGF0ZS5yZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlLm9uY2FuY2VsbGVkID0gb25jYW5jZWxsZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIHt9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXdTdGF0ZTogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJvb3Q6IHN0YXRlLnJvb3QsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGdldCBzZXR0bGVkKCkgeyByZXR1cm4gdGhpcy5yb290LnNldHRsZWQgfSxcbiAgICAgICAgICAgICAgICAgICAgc2V0IHNldHRsZWQodmFsdWUpIHsgdGhpcy5yb290LnNldHRsZWQgPSB2YWx1ZTsgfSxcbiAgICAgICAgICAgICAgICAgICAgZ2V0IHJlYXNvbigpIHsgcmV0dXJuIHRoaXMucm9vdC5yZWFzb24gfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb25zdCByZWplY3RvciA9IHJlamVjdG9yRm9yKHByb21pc2UsIG5ld1N0YXRlKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBSZWZsZWN0LmFwcGx5KHRoZW4sIHZhbHVlLCBbcmVzb2x2ZXJGb3IocHJvbWlzZSwgbmV3U3RhdGUpLCByZWplY3Rvcl0pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3RvcihlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIElNUE9SVEFOVCFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZS5zZXR0bGVkKSB7IHJldHVybjsgfVxuICAgICAgICBzdGF0ZS5zZXR0bGVkID0gdHJ1ZTtcbiAgICAgICAgcHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBjYWxsYmFjayB0aGF0IGltcGxlbWVudHMgdGhlIHJlamVjdGlvbiBhbGdvcml0aG0gZm9yIHRoZSBnaXZlbiBjYW5jZWxsYWJsZSBwcm9taXNlLlxuICovXG5mdW5jdGlvbiByZWplY3RvckZvcjxUPihwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2VXaXRoUmVzb2x2ZXJzPFQ+LCBzdGF0ZTogQ2FuY2VsbGFibGVQcm9taXNlU3RhdGUpOiBDYW5jZWxsYWJsZVByb21pc2VSZWplY3RvciB7XG4gICAgcmV0dXJuIChyZWFzb24/KSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZS5yZXNvbHZpbmcpIHsgcmV0dXJuOyB9XG4gICAgICAgIHN0YXRlLnJlc29sdmluZyA9IHRydWU7XG5cbiAgICAgICAgaWYgKHN0YXRlLnNldHRsZWQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlYXNvbiBpbnN0YW5jZW9mIENhbmNlbEVycm9yICYmIHN0YXRlLnJlYXNvbiBpbnN0YW5jZW9mIENhbmNlbEVycm9yICYmIE9iamVjdC5pcyhyZWFzb24uY2F1c2UsIHN0YXRlLnJlYXNvbi5jYXVzZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3dhbGxvdyBsYXRlIHJlamVjdGlvbnMgdGhhdCBhcmUgQ2FuY2VsRXJyb3JzIHdob3NlIGNhbmNlbGxhdGlvbiBjYXVzZSBpcyB0aGUgc2FtZSBhcyBvdXJzLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCB7fVxuXG4gICAgICAgICAgICB2b2lkIFByb21pc2UucmVqZWN0KG5ldyBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcihwcm9taXNlLnByb21pc2UsIHJlYXNvbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUuc2V0dGxlZCA9IHRydWU7XG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChyZWFzb24pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIENhbmNlbHMgYWxsIHZhbHVlcyBpbiBhbiBhcnJheSB0aGF0IGxvb2sgbGlrZSBjYW5jZWxsYWJsZSB0aGVuYWJsZXMuXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIG9uY2UgYWxsIGNhbmNlbGxhdGlvbiBwcm9jZWR1cmVzIGZvciB0aGUgZ2l2ZW4gdmFsdWVzIGhhdmUgc2V0dGxlZC5cbiAqL1xuZnVuY3Rpb24gY2FuY2VsQWxsKHBhcmVudDogQ2FuY2VsbGFibGVQcm9taXNlPHVua25vd24+LCB2YWx1ZXM6IGFueVtdLCBjYXVzZT86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgICAgbGV0IGNhbmNlbDogQ2FuY2VsbGFibGVQcm9taXNlQ2FuY2VsbGVyO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFpc0NhbGxhYmxlKHZhbHVlLnRoZW4pKSB7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICBjYW5jZWwgPSB2YWx1ZS5jYW5jZWw7XG4gICAgICAgICAgICBpZiAoIWlzQ2FsbGFibGUoY2FuY2VsKSkgeyBjb250aW51ZTsgfVxuICAgICAgICB9IGNhdGNoIHsgY29udGludWU7IH1cblxuICAgICAgICBsZXQgcmVzdWx0OiB2b2lkIHwgUHJvbWlzZUxpa2U8dm9pZD47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQgPSBSZWZsZWN0LmFwcGx5KGNhbmNlbCwgdmFsdWUsIFtjYXVzZV0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBDYW5jZWxsZWRSZWplY3Rpb25FcnJvcihwYXJlbnQsIGVyciwgXCJVbmhhbmRsZWQgZXhjZXB0aW9uIGluIGNhbmNlbCBtZXRob2QuXCIpKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyZXN1bHQpIHsgY29udGludWU7IH1cbiAgICAgICAgcmVzdWx0cy5wdXNoKFxuICAgICAgICAgICAgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UgID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkpLmNhdGNoKChyZWFzb24/KSA9PiB7XG4gICAgICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IENhbmNlbGxlZFJlamVjdGlvbkVycm9yKHBhcmVudCwgcmVhc29uLCBcIlVuaGFuZGxlZCByZWplY3Rpb24gaW4gY2FuY2VsIG1ldGhvZC5cIikpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0cykgYXMgYW55O1xufVxuXG4vKipcbiAqIFJldHVybnMgaXRzIGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBpZGVudGl0eTxUPih4OiBUKTogVCB7XG4gICAgcmV0dXJuIHg7XG59XG5cbi8qKlxuICogVGhyb3dzIGl0cyBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dlcihyZWFzb24/OiBhbnkpOiBuZXZlciB7XG4gICAgdGhyb3cgcmVhc29uO1xufVxuXG4vKipcbiAqIEF0dGVtcHRzIHZhcmlvdXMgc3RyYXRlZ2llcyB0byBjb252ZXJ0IGFuIGVycm9yIHRvIGEgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBlcnJvck1lc3NhZ2UoZXJyOiBhbnkpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvciB8fCB0eXBlb2YgZXJyICE9PSAnb2JqZWN0JyB8fCBlcnIudG9TdHJpbmcgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiICsgZXJyO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCB7fVxuXG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgfSBjYXRjaCB7fVxuXG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlcnIpO1xuICAgIH0gY2F0Y2gge31cblxuICAgIHJldHVybiBcIjxjb3VsZCBub3QgY29udmVydCBlcnJvciB0byBzdHJpbmc+XCI7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgY3VycmVudCBiYXJyaWVyIHByb21pc2UgZm9yIHRoZSBnaXZlbiBjYW5jZWxsYWJsZSBwcm9taXNlLiBJZiBuZWNlc3NhcnksIGluaXRpYWxpc2VzIHRoZSBiYXJyaWVyLlxuICovXG5mdW5jdGlvbiBjdXJyZW50QmFycmllcjxUPihwcm9taXNlOiBDYW5jZWxsYWJsZVByb21pc2U8VD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgcHdyOiBQYXJ0aWFsPFByb21pc2VXaXRoUmVzb2x2ZXJzPHZvaWQ+PiA9IHByb21pc2VbYmFycmllclN5bV0gPz8ge307XG4gICAgaWYgKCEoJ3Byb21pc2UnIGluIHB3cikpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihwd3IsIHByb21pc2VXaXRoUmVzb2x2ZXJzPHZvaWQ+KCkpO1xuICAgIH1cbiAgICBpZiAocHJvbWlzZVtiYXJyaWVyU3ltXSA9PSBudWxsKSB7XG4gICAgICAgIHB3ci5yZXNvbHZlISgpO1xuICAgICAgICBwcm9taXNlW2JhcnJpZXJTeW1dID0gcHdyO1xuICAgIH1cbiAgICByZXR1cm4gcHdyLnByb21pc2UhO1xufVxuXG4vLyBQb2x5ZmlsbCBQcm9taXNlLndpdGhSZXNvbHZlcnMuXG5sZXQgcHJvbWlzZVdpdGhSZXNvbHZlcnMgPSBQcm9taXNlLndpdGhSZXNvbHZlcnM7XG5pZiAocHJvbWlzZVdpdGhSZXNvbHZlcnMgJiYgdHlwZW9mIHByb21pc2VXaXRoUmVzb2x2ZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcHJvbWlzZVdpdGhSZXNvbHZlcnMgPSBwcm9taXNlV2l0aFJlc29sdmVycy5iaW5kKFByb21pc2UpO1xufSBlbHNlIHtcbiAgICBwcm9taXNlV2l0aFJlc29sdmVycyA9IGZ1bmN0aW9uIDxUPigpOiBQcm9taXNlV2l0aFJlc29sdmVyczxUPiB7XG4gICAgICAgIGxldCByZXNvbHZlITogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG4gICAgICAgIGxldCByZWplY3QhOiAocmVhc29uPzogYW55KSA9PiB2b2lkO1xuICAgICAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8VD4oKHJlcywgcmVqKSA9PiB7IHJlc29sdmUgPSByZXM7IHJlamVjdCA9IHJlajsgfSk7XG4gICAgICAgIHJldHVybiB7IHByb21pc2UsIHJlc29sdmUsIHJlamVjdCB9O1xuICAgIH1cbn1cbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG5pbXBvcnQgeyBDYW5jZWxsYWJsZVByb21pc2UsIHR5cGUgQ2FuY2VsbGFibGVQcm9taXNlV2l0aFJlc29sdmVycyB9IGZyb20gXCIuL2NhbmNlbGxhYmxlLmpzXCI7XG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB7IG5hbm9pZCB9IGZyb20gXCIuL25hbm9pZC5qc1wiO1xuXG4vLyBTZXR1cFxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcblxuaWYgKGhhc0RPTSkge1xuICAgIHdpbmRvdy5fYmFpbHMgPSB3aW5kb3cuX2JhaWxzIHx8IHt9O1xufVxuXG50eXBlIFByb21pc2VSZXNvbHZlcnMgPSBPbWl0PENhbmNlbGxhYmxlUHJvbWlzZVdpdGhSZXNvbHZlcnM8YW55PiwgXCJwcm9taXNlXCIgfCBcIm9uY2FuY2VsbGVkXCI+XG5cbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLkNhbGwpO1xuY29uc3QgY2FuY2VsQ2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQ2FuY2VsQ2FsbCk7XG5jb25zdCBjYWxsUmVzcG9uc2VzID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2VSZXNvbHZlcnM+KCk7XG5cbmNvbnN0IENhbGxCaW5kaW5nID0gMDtcbmNvbnN0IENhbmNlbE1ldGhvZCA9IDBcblxuLyoqXG4gKiBIb2xkcyBhbGwgcmVxdWlyZWQgaW5mb3JtYXRpb24gZm9yIGEgYmluZGluZyBjYWxsLlxuICogTWF5IHByb3ZpZGUgZWl0aGVyIGEgbWV0aG9kIElEIG9yIGEgbWV0aG9kIG5hbWUsIGJ1dCBub3QgYm90aC5cbiAqL1xuZXhwb3J0IHR5cGUgQ2FsbE9wdGlvbnMgPSB7XG4gICAgLyoqIFRoZSBudW1lcmljIElEIG9mIHRoZSBib3VuZCBtZXRob2QgdG8gY2FsbC4gKi9cbiAgICBtZXRob2RJRDogbnVtYmVyO1xuICAgIC8qKiBUaGUgZnVsbHkgcXVhbGlmaWVkIG5hbWUgb2YgdGhlIGJvdW5kIG1ldGhvZCB0byBjYWxsLiAqL1xuICAgIG1ldGhvZE5hbWU/OiBuZXZlcjtcbiAgICAvKiogQXJndW1lbnRzIHRvIGJlIHBhc3NlZCBpbnRvIHRoZSBib3VuZCBtZXRob2QuICovXG4gICAgYXJnczogYW55W107XG59IHwge1xuICAgIC8qKiBUaGUgbnVtZXJpYyBJRCBvZiB0aGUgYm91bmQgbWV0aG9kIHRvIGNhbGwuICovXG4gICAgbWV0aG9kSUQ/OiBuZXZlcjtcbiAgICAvKiogVGhlIGZ1bGx5IHF1YWxpZmllZCBuYW1lIG9mIHRoZSBib3VuZCBtZXRob2QgdG8gY2FsbC4gKi9cbiAgICBtZXRob2ROYW1lOiBzdHJpbmc7XG4gICAgLyoqIEFyZ3VtZW50cyB0byBiZSBwYXNzZWQgaW50byB0aGUgYm91bmQgbWV0aG9kLiAqL1xuICAgIGFyZ3M6IGFueVtdO1xufTtcblxuLy8gcnVudGltZS5qcyBuZWVkcyB0byB1c2UgUnVudGltZUVycm9yIGludGVybmFsbHkgdG8gcHJvcGVybHkgcGFyc2UgYW5kIHJldHVyblxuLy8gZXJyb3JzIGZvciBiaW5kaW5nIGNhbGxzLCBzbyBpdCBoYWQgdG8gbW92ZSB0aGVyZS4gRXhwb3J0aW5nIGhlcmUgYWdhaW4gdG9cbi8vIGtlZXAgZnJvbSBicmVha2luZyB0aGUgcHVibGljIENhbGwgaW50ZXJmYWNlLlxuZXhwb3J0IHsgUnVudGltZUVycm9yIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBJRCB1c2luZyB0aGUgbmFub2lkIGxpYnJhcnkuXG4gKlxuICogQHJldHVybnMgQSB1bmlxdWUgSUQgdGhhdCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgY2FsbFJlc3BvbnNlcyBzZXQuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlSUQoKTogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGRvIHtcbiAgICAgICAgcmVzdWx0ID0gbmFub2lkKCk7XG4gICAgfSB3aGlsZSAoY2FsbFJlc3BvbnNlcy5oYXMocmVzdWx0KSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDYWxsIGEgYm91bmQgbWV0aG9kIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gY2FsbCBvcHRpb25zLlxuICpcbiAqIEluIGNhc2Ugb2YgZmFpbHVyZSwgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCByZWplY3Qgd2l0aCBhbiBleGNlcHRpb25cbiAqIGFtb25nIFJlZmVyZW5jZUVycm9yICh1bmtub3duIG1ldGhvZCksIFR5cGVFcnJvciAod3JvbmcgYXJndW1lbnQgY291bnQgb3IgdHlwZSksXG4gKiB7QGxpbmsgUnVudGltZUVycm9yfSAobWV0aG9kIHJldHVybmVkIGFuIGVycm9yKSwgb3Igb3RoZXIgKG5ldHdvcmsgb3IgaW50ZXJuYWwgZXJyb3JzKS5cbiAqIFRoZSBleGNlcHRpb24gbWlnaHQgaGF2ZSBhIFwiY2F1c2VcIiBmaWVsZCB3aXRoIHRoZSB2YWx1ZSByZXR1cm5lZFxuICogYnkgdGhlIGFwcGxpY2F0aW9uLSBvciBzZXJ2aWNlLWxldmVsIGVycm9yIG1hcnNoYWxpbmcgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBvcHRpb25zIC0gQSBtZXRob2QgY2FsbCBkZXNjcmlwdG9yLlxuICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgY2FsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENhbGwob3B0aW9uczogQ2FsbE9wdGlvbnMpOiBDYW5jZWxsYWJsZVByb21pc2U8YW55PiB7XG4gICAgY29uc3QgaWQgPSBnZW5lcmF0ZUlEKCk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBDYW5jZWxsYWJsZVByb21pc2Uud2l0aFJlc29sdmVyczxhbnk+KCk7XG4gICAgY2FsbFJlc3BvbnNlcy5zZXQoaWQsIHsgcmVzb2x2ZTogcmVzdWx0LnJlc29sdmUsIHJlamVjdDogcmVzdWx0LnJlamVjdCB9KTtcblxuICAgIGNvbnN0IHJlcXVlc3QgPSBjYWxsKENhbGxCaW5kaW5nLCBPYmplY3QuYXNzaWduKHsgXCJjYWxsLWlkXCI6IGlkIH0sIG9wdGlvbnMpKTtcbiAgICBsZXQgcnVubmluZyA9IHRydWU7XG5cbiAgICByZXF1ZXN0LnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIGNhbGxSZXNwb25zZXMuZGVsZXRlKGlkKTtcbiAgICAgICAgcmVzdWx0LnJlc29sdmUocmVzKTtcbiAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgY2FsbFJlc3BvbnNlcy5kZWxldGUoaWQpO1xuICAgICAgICByZXN1bHQucmVqZWN0KGVycik7XG4gICAgfSk7XG5cbiAgICBjb25zdCBjYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIGNhbGxSZXNwb25zZXMuZGVsZXRlKGlkKTtcbiAgICAgICAgcmV0dXJuIGNhbmNlbENhbGwoQ2FuY2VsTWV0aG9kLCB7XCJjYWxsLWlkXCI6IGlkfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoaWxlIHJlcXVlc3RpbmcgYmluZGluZyBjYWxsIGNhbmNlbGxhdGlvbjpcIiwgZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlc3VsdC5vbmNhbmNlbGxlZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBjYW5jZWwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0LnRoZW4oY2FuY2VsKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzdWx0LnByb21pc2U7XG59XG5cbi8qKlxuICogQ2FsbHMgYSBib3VuZCBtZXRob2QgYnkgbmFtZSB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzLlxuICogU2VlIHtAbGluayBDYWxsfSBmb3IgZGV0YWlscy5cbiAqXG4gKiBAcGFyYW0gbWV0aG9kTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgaW4gdGhlIGZvcm1hdCAncGFja2FnZS5zdHJ1Y3QubWV0aG9kJy5cbiAqIEBwYXJhbSBhcmdzIC0gVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2QuXG4gKiBAcmV0dXJucyBUaGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgY2FsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJ5TmFtZShtZXRob2ROYW1lOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogQ2FuY2VsbGFibGVQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBDYWxsKHsgbWV0aG9kTmFtZSwgYXJncyB9KTtcbn1cblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBieSBpdHMgbnVtZXJpYyBJRCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzLlxuICogU2VlIHtAbGluayBDYWxsfSBmb3IgZGV0YWlscy5cbiAqXG4gKiBAcGFyYW0gbWV0aG9kSUQgLSBUaGUgSUQgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxuICogQHBhcmFtIGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGNhbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCeUlEKG1ldGhvZElEOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogQ2FuY2VsbGFibGVQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBDYWxsKHsgbWV0aG9kSUQsIGFyZ3MgfSk7XG59XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IHtuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lc30gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5DbGlwYm9hcmQpO1xuXG5jb25zdCBDbGlwYm9hcmRTZXRUZXh0ID0gMDtcbmNvbnN0IENsaXBib2FyZFRleHQgPSAxO1xuXG4vKipcbiAqIFNldHMgdGhlIHRleHQgdG8gdGhlIENsaXBib2FyZC5cbiAqXG4gKiBAcGFyYW0gdGV4dCAtIFRoZSB0ZXh0IHRvIGJlIHNldCB0byB0aGUgQ2xpcGJvYXJkLlxuICogQHJldHVybiBBIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBvcGVyYXRpb24gaXMgc3VjY2Vzc2Z1bC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFRleHQodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIGNhbGwoQ2xpcGJvYXJkU2V0VGV4dCwge3RleHR9KTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIENsaXBib2FyZCB0ZXh0XG4gKlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgdGV4dCBmcm9tIHRoZSBDbGlwYm9hcmQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIGNhbGwoQ2xpcGJvYXJkVGV4dCk7XG59XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoqXG4gKiBBbnkgaXMgYSBkdW1teSBjcmVhdGlvbiBmdW5jdGlvbiBmb3Igc2ltcGxlIG9yIHVua25vd24gdHlwZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBbnk8VCA9IGFueT4oc291cmNlOiBhbnkpOiBUIHtcbiAgICByZXR1cm4gc291cmNlO1xufVxuXG4vKipcbiAqIEJ5dGVTbGljZSBpcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIHRoYXQgcmVwbGFjZXNcbiAqIG51bGwgc3RyaW5ncyB3aXRoIGVtcHR5IHN0cmluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCeXRlU2xpY2Uoc291cmNlOiBhbnkpOiBzdHJpbmcge1xuICAgIHJldHVybiAoKHNvdXJjZSA9PSBudWxsKSA/IFwiXCIgOiBzb3VyY2UpO1xufVxuXG4vKipcbiAqIEFycmF5IHRha2VzIGEgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIGFyYml0cmFyeSB0eXBlXG4gKiBhbmQgcmV0dXJucyBhbiBpbi1wbGFjZSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJyYXlcbiAqIHdob3NlIGVsZW1lbnRzIGFyZSBvZiB0aGF0IHR5cGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJheTxUID0gYW55PihlbGVtZW50OiAoc291cmNlOiBhbnkpID0+IFQpOiAoc291cmNlOiBhbnkpID0+IFRbXSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IEFueSkge1xuICAgICAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IFtdIDogc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb3VyY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvdXJjZVtpXSA9IGVsZW1lbnQoc291cmNlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG59XG5cbi8qKlxuICogTWFwIHRha2VzIGNyZWF0aW9uIGZ1bmN0aW9ucyBmb3IgdHdvIGFyYml0cmFyeSB0eXBlc1xuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIG9iamVjdFxuICogd2hvc2Uga2V5cyBhbmQgdmFsdWVzIGFyZSBvZiB0aG9zZSB0eXBlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1hcDxLIGV4dGVuZHMgUHJvcGVydHlLZXkgPSBhbnksIFYgPSBhbnk+KGtleTogKHNvdXJjZTogYW55KSA9PiBLLCB2YWx1ZTogKHNvdXJjZTogYW55KSA9PiBWKTogKHNvdXJjZTogYW55KSA9PiBSZWNvcmQ8SywgVj4ge1xuICAgIGlmICh2YWx1ZSA9PT0gQW55KSB7XG4gICAgICAgIHJldHVybiAoc291cmNlKSA9PiAoc291cmNlID09PSBudWxsID8ge30gOiBzb3VyY2UpO1xuICAgIH1cblxuICAgIHJldHVybiAoc291cmNlKSA9PiB7XG4gICAgICAgIGlmIChzb3VyY2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIHNvdXJjZVtrZXldID0gdmFsdWUoc291cmNlW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBOdWxsYWJsZSB0YWtlcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBhcmJpdHJhcnkgdHlwZVxuICogYW5kIHJldHVybnMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYSBudWxsYWJsZSB2YWx1ZSBvZiB0aGF0IHR5cGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdWxsYWJsZTxUID0gYW55PihlbGVtZW50OiAoc291cmNlOiBhbnkpID0+IFQpOiAoc291cmNlOiBhbnkpID0+IChUIHwgbnVsbCkge1xuICAgIGlmIChlbGVtZW50ID09PSBBbnkpIHtcbiAgICAgICAgcmV0dXJuIEFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IG51bGwgOiBlbGVtZW50KHNvdXJjZSkpO1xufVxuXG4vKipcbiAqIFN0cnVjdCB0YWtlcyBhbiBvYmplY3QgbWFwcGluZyBmaWVsZCBuYW1lcyB0byBjcmVhdGlvbiBmdW5jdGlvbnNcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhIHN0cnVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0cnVjdChjcmVhdGVGaWVsZDogUmVjb3JkPHN0cmluZywgKHNvdXJjZTogYW55KSA9PiBhbnk+KTpcbiAgICA8VSBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gPSBhbnk+KHNvdXJjZTogYW55KSA9PiBVXG57XG4gICAgbGV0IGFsbEFueSA9IHRydWU7XG4gICAgZm9yIChjb25zdCBuYW1lIGluIGNyZWF0ZUZpZWxkKSB7XG4gICAgICAgIGlmIChjcmVhdGVGaWVsZFtuYW1lXSAhPT0gQW55KSB7XG4gICAgICAgICAgICBhbGxBbnkgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhbGxBbnkpIHtcbiAgICAgICAgcmV0dXJuIEFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gY3JlYXRlRmllbGQpIHtcbiAgICAgICAgICAgIGlmIChuYW1lIGluIHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHNvdXJjZVtuYW1lXSA9IGNyZWF0ZUZpZWxkW25hbWVdKHNvdXJjZVtuYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9O1xufVxuXG4vKipcbiAqIERhdGVGcm9tVGltZSBpcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIHRoYXQgY29udmVydHMgUkZDMzMzOSBzdHJpbmdzXG4gKiAoZnJvbSBHbydzIHRpbWUuVGltZSBKU09OIG1hcnNoYWxpbmcpIHRvIEphdmFTY3JpcHQgRGF0ZSBvYmplY3RzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gRGF0ZUZyb21UaW1lKHNvdXJjZTogYW55KTogRGF0ZSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHNvdXJjZSk7XG59XG5cbi8qKlxuICogTWFwcyBrbm93biBldmVudCBuYW1lcyB0byBjcmVhdGlvbiBmdW5jdGlvbnMgZm9yIHRoZWlyIGRhdGEgdHlwZXMuXG4gKiBXaWxsIGJlIG1vbmtleS1wYXRjaGVkIGJ5IHRoZSBiaW5kaW5nIGdlbmVyYXRvci5cbiAqL1xuZXhwb3J0IGNvbnN0IEV2ZW50czogUmVjb3JkPHN0cmluZywgKHNvdXJjZTogYW55KSA9PiBhbnk+ID0ge307XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IHtuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lc30gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG4vLyBzZXR1cFxuaW1wb3J0IHsgaGFzRE9NIH0gZnJvbSBcIi4vZW52aXJvbm1lbnQuanNcIjtcblxuaWYgKGhhc0RPTSkge1xuICAgIHdpbmRvdy5fYmFpbHMgPSB3aW5kb3cuX2JhaWxzIHx8IHt9O1xufVxuXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcihvYmplY3ROYW1lcy5EaWFsb2cpO1xuXG4vLyBEZWZpbmUgY29uc3RhbnRzIGZyb20gdGhlIGBtZXRob2RzYCBvYmplY3QgaW4gVGl0bGUgQ2FzZVxuY29uc3QgRGlhbG9nSW5mbyA9IDA7XG5jb25zdCBEaWFsb2dXYXJuaW5nID0gMTtcbmNvbnN0IERpYWxvZ0Vycm9yID0gMjtcbmNvbnN0IERpYWxvZ1F1ZXN0aW9uID0gMztcbmNvbnN0IERpYWxvZ09wZW5GaWxlID0gNDtcbmNvbnN0IERpYWxvZ1NhdmVGaWxlID0gNTtcblxuZXhwb3J0IGludGVyZmFjZSBPcGVuRmlsZURpYWxvZ09wdGlvbnMge1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgZGlyZWN0b3JpZXMgY2FuIGJlIGNob3Nlbi4gKi9cbiAgICBDYW5DaG9vc2VEaXJlY3Rvcmllcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBmaWxlcyBjYW4gYmUgY2hvc2VuLiAqL1xuICAgIENhbkNob29zZUZpbGVzPzogYm9vbGVhbjtcbiAgICAvKiogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjcmVhdGVkLiAqL1xuICAgIENhbkNyZWF0ZURpcmVjdG9yaWVzPzogYm9vbGVhbjtcbiAgICAvKiogSW5kaWNhdGVzIGlmIGhpZGRlbiBmaWxlcyBzaG91bGQgYmUgc2hvd24uICovXG4gICAgU2hvd0hpZGRlbkZpbGVzPzogYm9vbGVhbjtcbiAgICAvKiogSW5kaWNhdGVzIGlmIGFsaWFzZXMgc2hvdWxkIGJlIHJlc29sdmVkLiAqL1xuICAgIFJlc29sdmVzQWxpYXNlcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBtdWx0aXBsZSBzZWxlY3Rpb24gaXMgYWxsb3dlZC4gKi9cbiAgICBBbGxvd3NNdWx0aXBsZVNlbGVjdGlvbj86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiB0aGUgZXh0ZW5zaW9uIHNob3VsZCBiZSBoaWRkZW4uICovXG4gICAgSGlkZUV4dGVuc2lvbj86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBoaWRkZW4gZXh0ZW5zaW9ucyBjYW4gYmUgc2VsZWN0ZWQuICovXG4gICAgQ2FuU2VsZWN0SGlkZGVuRXh0ZW5zaW9uPzogYm9vbGVhbjtcbiAgICAvKiogSW5kaWNhdGVzIGlmIGZpbGUgcGFja2FnZXMgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgZGlyZWN0b3JpZXMuICovXG4gICAgVHJlYXRzRmlsZVBhY2thZ2VzQXNEaXJlY3Rvcmllcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBvdGhlciBmaWxlIHR5cGVzIGFyZSBhbGxvd2VkLiAqL1xuICAgIEFsbG93c090aGVyRmlsZXR5cGVzPzogYm9vbGVhbjtcbiAgICAvKiogQXJyYXkgb2YgZmlsZSBmaWx0ZXJzLiAqL1xuICAgIEZpbHRlcnM/OiBGaWxlRmlsdGVyW107XG4gICAgLyoqIFRpdGxlIG9mIHRoZSBkaWFsb2cuICovXG4gICAgVGl0bGU/OiBzdHJpbmc7XG4gICAgLyoqIE1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLiAqL1xuICAgIE1lc3NhZ2U/OiBzdHJpbmc7XG4gICAgLyoqIFRleHQgdG8gZGlzcGxheSBvbiB0aGUgYnV0dG9uLiAqL1xuICAgIEJ1dHRvblRleHQ/OiBzdHJpbmc7XG4gICAgLyoqIERpcmVjdG9yeSB0byBvcGVuIGluIHRoZSBkaWFsb2cuICovXG4gICAgRGlyZWN0b3J5Pzogc3RyaW5nO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgdGhlIGRpYWxvZyBzaG91bGQgYXBwZWFyIGRldGFjaGVkIGZyb20gdGhlIG1haW4gd2luZG93LiAqL1xuICAgIERldGFjaGVkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTYXZlRmlsZURpYWxvZ09wdGlvbnMge1xuICAgIC8qKiBEZWZhdWx0IGZpbGVuYW1lIHRvIHVzZSBpbiB0aGUgZGlhbG9nLiAqL1xuICAgIEZpbGVuYW1lPzogc3RyaW5nO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgZGlyZWN0b3JpZXMgY2FuIGJlIGNob3Nlbi4gKi9cbiAgICBDYW5DaG9vc2VEaXJlY3Rvcmllcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBmaWxlcyBjYW4gYmUgY2hvc2VuLiAqL1xuICAgIENhbkNob29zZUZpbGVzPzogYm9vbGVhbjtcbiAgICAvKiogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjcmVhdGVkLiAqL1xuICAgIENhbkNyZWF0ZURpcmVjdG9yaWVzPzogYm9vbGVhbjtcbiAgICAvKiogSW5kaWNhdGVzIGlmIGhpZGRlbiBmaWxlcyBzaG91bGQgYmUgc2hvd24uICovXG4gICAgU2hvd0hpZGRlbkZpbGVzPzogYm9vbGVhbjtcbiAgICAvKiogSW5kaWNhdGVzIGlmIGFsaWFzZXMgc2hvdWxkIGJlIHJlc29sdmVkLiAqL1xuICAgIFJlc29sdmVzQWxpYXNlcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiB0aGUgZXh0ZW5zaW9uIHNob3VsZCBiZSBoaWRkZW4uICovXG4gICAgSGlkZUV4dGVuc2lvbj86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBoaWRkZW4gZXh0ZW5zaW9ucyBjYW4gYmUgc2VsZWN0ZWQuICovXG4gICAgQ2FuU2VsZWN0SGlkZGVuRXh0ZW5zaW9uPzogYm9vbGVhbjtcbiAgICAvKiogSW5kaWNhdGVzIGlmIGZpbGUgcGFja2FnZXMgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgZGlyZWN0b3JpZXMuICovXG4gICAgVHJlYXRzRmlsZVBhY2thZ2VzQXNEaXJlY3Rvcmllcz86IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBpZiBvdGhlciBmaWxlIHR5cGVzIGFyZSBhbGxvd2VkLiAqL1xuICAgIEFsbG93c090aGVyRmlsZXR5cGVzPzogYm9vbGVhbjtcbiAgICAvKiogQXJyYXkgb2YgZmlsZSBmaWx0ZXJzLiAqL1xuICAgIEZpbHRlcnM/OiBGaWxlRmlsdGVyW107XG4gICAgLyoqIFRpdGxlIG9mIHRoZSBkaWFsb2cuICovXG4gICAgVGl0bGU/OiBzdHJpbmc7XG4gICAgLyoqIE1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLiAqL1xuICAgIE1lc3NhZ2U/OiBzdHJpbmc7XG4gICAgLyoqIFRleHQgdG8gZGlzcGxheSBvbiB0aGUgYnV0dG9uLiAqL1xuICAgIEJ1dHRvblRleHQ/OiBzdHJpbmc7XG4gICAgLyoqIERpcmVjdG9yeSB0byBvcGVuIGluIHRoZSBkaWFsb2cuICovXG4gICAgRGlyZWN0b3J5Pzogc3RyaW5nO1xuICAgIC8qKiBJbmRpY2F0ZXMgaWYgdGhlIGRpYWxvZyBzaG91bGQgYXBwZWFyIGRldGFjaGVkIGZyb20gdGhlIG1haW4gd2luZG93LiAqL1xuICAgIERldGFjaGVkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXNzYWdlRGlhbG9nT3B0aW9ucyB7XG4gICAgLyoqIFRoZSB0aXRsZSBvZiB0aGUgZGlhbG9nIHdpbmRvdy4gKi9cbiAgICBUaXRsZT86IHN0cmluZztcbiAgICAvKiogVGhlIG1haW4gbWVzc2FnZSB0byBzaG93IGluIHRoZSBkaWFsb2cuICovXG4gICAgTWVzc2FnZT86IHN0cmluZztcbiAgICAvKiogQXJyYXkgb2YgYnV0dG9uIG9wdGlvbnMgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLiAqL1xuICAgIEJ1dHRvbnM/OiBCdXR0b25bXTtcbiAgICAvKiogVHJ1ZSBpZiB0aGUgZGlhbG9nIHNob3VsZCBhcHBlYXIgZGV0YWNoZWQgZnJvbSB0aGUgbWFpbiB3aW5kb3cgKGlmIGFwcGxpY2FibGUpLiAqL1xuICAgIERldGFjaGVkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdXR0b24ge1xuICAgIC8qKiBUZXh0IHRoYXQgYXBwZWFycyB3aXRoaW4gdGhlIGJ1dHRvbi4gKi9cbiAgICBMYWJlbD86IHN0cmluZztcbiAgICAvKiogVHJ1ZSBpZiB0aGUgYnV0dG9uIHNob3VsZCBjYW5jZWwgYW4gb3BlcmF0aW9uIHdoZW4gY2xpY2tlZC4gKi9cbiAgICBJc0NhbmNlbD86IGJvb2xlYW47XG4gICAgLyoqIFRydWUgaWYgdGhlIGJ1dHRvbiBzaG91bGQgYmUgdGhlIGRlZmF1bHQgYWN0aW9uIHdoZW4gdGhlIHVzZXIgcHJlc3NlcyBlbnRlci4gKi9cbiAgICBJc0RlZmF1bHQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVGaWx0ZXIge1xuICAgIC8qKiBEaXNwbGF5IG5hbWUgZm9yIHRoZSBmaWx0ZXIsIGl0IGNvdWxkIGJlIFwiVGV4dCBGaWxlc1wiLCBcIkltYWdlc1wiIGV0Yy4gKi9cbiAgICBEaXNwbGF5TmFtZT86IHN0cmluZztcbiAgICAvKiogUGF0dGVybiB0byBtYXRjaCBmb3IgdGhlIGZpbHRlciwgZS5nLiBcIioudHh0OyoubWRcIiBmb3IgdGV4dCBtYXJrZG93biBmaWxlcy4gKi9cbiAgICBQYXR0ZXJuPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFByZXNlbnRzIGEgZGlhbG9nIG9mIHNwZWNpZmllZCB0eXBlIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIHR5cGUgLSBEaWFsb2cgdHlwZS5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIGRpYWxvZy5cbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggcmVzdWx0IG9mIGRpYWxvZy5cbiAqL1xuZnVuY3Rpb24gZGlhbG9nKHR5cGU6IG51bWJlciwgb3B0aW9uczogTWVzc2FnZURpYWxvZ09wdGlvbnMgfCBPcGVuRmlsZURpYWxvZ09wdGlvbnMgfCBTYXZlRmlsZURpYWxvZ09wdGlvbnMgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGNhbGwodHlwZSwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogUHJlc2VudHMgYW4gaW5mbyBkaWFsb2cuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSBEaWFsb2cgb3B0aW9uc1xuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgbGFiZWwgb2YgdGhlIGNob3NlbiBidXR0b24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJbmZvKG9wdGlvbnM6IE1lc3NhZ2VEaWFsb2dPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHsgcmV0dXJuIGRpYWxvZyhEaWFsb2dJbmZvLCBvcHRpb25zKTsgfVxuXG4vKipcbiAqIFByZXNlbnRzIGEgd2FybmluZyBkaWFsb2cuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSBEaWFsb2cgb3B0aW9ucy5cbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGxhYmVsIG9mIHRoZSBjaG9zZW4gYnV0dG9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gV2FybmluZyhvcHRpb25zOiBNZXNzYWdlRGlhbG9nT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7IHJldHVybiBkaWFsb2coRGlhbG9nV2FybmluZywgb3B0aW9ucyk7IH1cblxuLyoqXG4gKiBQcmVzZW50cyBhbiBlcnJvciBkaWFsb2cuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSBEaWFsb2cgb3B0aW9ucy5cbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGxhYmVsIG9mIHRoZSBjaG9zZW4gYnV0dG9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gRXJyb3Iob3B0aW9uczogTWVzc2FnZURpYWxvZ09wdGlvbnMpOiBQcm9taXNlPHN0cmluZz4geyByZXR1cm4gZGlhbG9nKERpYWxvZ0Vycm9yLCBvcHRpb25zKTsgfVxuXG4vKipcbiAqIFByZXNlbnRzIGEgcXVlc3Rpb24gZGlhbG9nLlxuICpcbiAqIEBwYXJhbSBvcHRpb25zIC0gRGlhbG9nIG9wdGlvbnMuXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBsYWJlbCBvZiB0aGUgY2hvc2VuIGJ1dHRvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFF1ZXN0aW9uKG9wdGlvbnM6IE1lc3NhZ2VEaWFsb2dPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHsgcmV0dXJuIGRpYWxvZyhEaWFsb2dRdWVzdGlvbiwgb3B0aW9ucyk7IH1cblxuLyoqXG4gKiBQcmVzZW50cyBhIGZpbGUgc2VsZWN0aW9uIGRpYWxvZyB0byBwaWNrIG9uZSBvciBtb3JlIGZpbGVzIHRvIG9wZW4uXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSBEaWFsb2cgb3B0aW9ucy5cbiAqIEByZXR1cm5zIFNlbGVjdGVkIGZpbGUgb3IgbGlzdCBvZiBmaWxlcywgb3IgYSBibGFuayBzdHJpbmcvZW1wdHkgbGlzdCBpZiBubyBmaWxlIGhhcyBiZWVuIHNlbGVjdGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlbkZpbGUob3B0aW9uczogT3BlbkZpbGVEaWFsb2dPcHRpb25zICYgeyBBbGxvd3NNdWx0aXBsZVNlbGVjdGlvbjogdHJ1ZSB9KTogUHJvbWlzZTxzdHJpbmdbXT47XG5leHBvcnQgZnVuY3Rpb24gT3BlbkZpbGUob3B0aW9uczogT3BlbkZpbGVEaWFsb2dPcHRpb25zICYgeyBBbGxvd3NNdWx0aXBsZVNlbGVjdGlvbj86IGZhbHNlIHwgdW5kZWZpbmVkIH0pOiBQcm9taXNlPHN0cmluZz47XG5leHBvcnQgZnVuY3Rpb24gT3BlbkZpbGUob3B0aW9uczogT3BlbkZpbGVEaWFsb2dPcHRpb25zKTogUHJvbWlzZTxzdHJpbmcgfCBzdHJpbmdbXT47XG5leHBvcnQgZnVuY3Rpb24gT3BlbkZpbGUob3B0aW9uczogT3BlbkZpbGVEaWFsb2dPcHRpb25zKTogUHJvbWlzZTxzdHJpbmcgfCBzdHJpbmdbXT4geyByZXR1cm4gZGlhbG9nKERpYWxvZ09wZW5GaWxlLCBvcHRpb25zKSA/PyBbXTsgfVxuXG4vKipcbiAqIFByZXNlbnRzIGEgZmlsZSBzZWxlY3Rpb24gZGlhbG9nIHRvIHBpY2sgYSBmaWxlIHRvIHNhdmUuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSBEaWFsb2cgb3B0aW9ucy5cbiAqIEByZXR1cm5zIFNlbGVjdGVkIGZpbGUsIG9yIGEgYmxhbmsgc3RyaW5nIGlmIG5vIGZpbGUgaGFzIGJlZW4gc2VsZWN0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTYXZlRmlsZShvcHRpb25zOiBTYXZlRmlsZURpYWxvZ09wdGlvbnMpOiBQcm9taXNlPHN0cmluZz4geyByZXR1cm4gZGlhbG9nKERpYWxvZ1NhdmVGaWxlLCBvcHRpb25zKTsgfVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8vIFRoZSBmb2xsb3dpbmcgdXRpbGl0aWVzIGhhdmUgYmVlbiBmYWN0b3JlZCBvdXQgb2YgLi9ldmVudHMudHNcbi8vIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxuXG5leHBvcnQgY29uc3QgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwPHN0cmluZywgTGlzdGVuZXJbXT4oKTtcblxuZXhwb3J0IGNsYXNzIExpc3RlbmVyIHtcbiAgICBldmVudE5hbWU6IHN0cmluZztcbiAgICBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gdm9pZDtcbiAgICBtYXhDYWxsYmFja3M6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gdm9pZCwgbWF4Q2FsbGJhY2tzOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5tYXhDYWxsYmFja3MgPSBtYXhDYWxsYmFja3MgfHwgLTE7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2goZGF0YTogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1heENhbGxiYWNrcyA9PT0gLTEpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhpcy5tYXhDYWxsYmFja3MgLT0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF4Q2FsbGJhY2tzID09PSAwO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpc3RlbmVyT2ZmKGxpc3RlbmVyOiBMaXN0ZW5lcik6IHZvaWQge1xuICAgIGxldCBsaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5nZXQobGlzdGVuZXIuZXZlbnROYW1lKTtcbiAgICBpZiAoIWxpc3RlbmVycykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmZpbHRlcihsID0+IGwgIT09IGxpc3RlbmVyKTtcbiAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBldmVudExpc3RlbmVycy5kZWxldGUobGlzdGVuZXIuZXZlbnROYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBldmVudExpc3RlbmVycy5zZXQobGlzdGVuZXIuZXZlbnROYW1lLCBsaXN0ZW5lcnMpO1xuICAgIH1cbn1cbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIMOCIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5leHBvcnQgY29uc3QgVHlwZXMgPSBPYmplY3QuZnJlZXplKHtcblx0V2luZG93czogT2JqZWN0LmZyZWV6ZSh7XG5cdFx0QVBNUG93ZXJTZXR0aW5nQ2hhbmdlOiBcIndpbmRvd3M6QVBNUG93ZXJTZXR0aW5nQ2hhbmdlXCIsXG5cdFx0QVBNUG93ZXJTdGF0dXNDaGFuZ2U6IFwid2luZG93czpBUE1Qb3dlclN0YXR1c0NoYW5nZVwiLFxuXHRcdEFQTVJlc3VtZUF1dG9tYXRpYzogXCJ3aW5kb3dzOkFQTVJlc3VtZUF1dG9tYXRpY1wiLFxuXHRcdEFQTVJlc3VtZVN1c3BlbmQ6IFwid2luZG93czpBUE1SZXN1bWVTdXNwZW5kXCIsXG5cdFx0QVBNU3VzcGVuZDogXCJ3aW5kb3dzOkFQTVN1c3BlbmRcIixcblx0XHRBcHBsaWNhdGlvblN0YXJ0ZWQ6IFwid2luZG93czpBcHBsaWNhdGlvblN0YXJ0ZWRcIixcblx0XHRTeXN0ZW1UaGVtZUNoYW5nZWQ6IFwid2luZG93czpTeXN0ZW1UaGVtZUNoYW5nZWRcIixcblx0XHRXZWJWaWV3TmF2aWdhdGlvbkNvbXBsZXRlZDogXCJ3aW5kb3dzOldlYlZpZXdOYXZpZ2F0aW9uQ29tcGxldGVkXCIsXG5cdFx0V2luZG93QWN0aXZlOiBcIndpbmRvd3M6V2luZG93QWN0aXZlXCIsXG5cdFx0V2luZG93QmFja2dyb3VuZEVyYXNlOiBcIndpbmRvd3M6V2luZG93QmFja2dyb3VuZEVyYXNlXCIsXG5cdFx0V2luZG93Q2xpY2tBY3RpdmU6IFwid2luZG93czpXaW5kb3dDbGlja0FjdGl2ZVwiLFxuXHRcdFdpbmRvd0Nsb3Npbmc6IFwid2luZG93czpXaW5kb3dDbG9zaW5nXCIsXG5cdFx0V2luZG93RGlkTW92ZTogXCJ3aW5kb3dzOldpbmRvd0RpZE1vdmVcIixcblx0XHRXaW5kb3dEaWRSZXNpemU6IFwid2luZG93czpXaW5kb3dEaWRSZXNpemVcIixcblx0XHRXaW5kb3dEUElDaGFuZ2VkOiBcIndpbmRvd3M6V2luZG93RFBJQ2hhbmdlZFwiLFxuXHRcdFdpbmRvd0RyYWdEcm9wOiBcIndpbmRvd3M6V2luZG93RHJhZ0Ryb3BcIixcblx0XHRXaW5kb3dEcmFnRW50ZXI6IFwid2luZG93czpXaW5kb3dEcmFnRW50ZXJcIixcblx0XHRXaW5kb3dEcmFnTGVhdmU6IFwid2luZG93czpXaW5kb3dEcmFnTGVhdmVcIixcblx0XHRXaW5kb3dEcmFnT3ZlcjogXCJ3aW5kb3dzOldpbmRvd0RyYWdPdmVyXCIsXG5cdFx0V2luZG93RW5kTW92ZTogXCJ3aW5kb3dzOldpbmRvd0VuZE1vdmVcIixcblx0XHRXaW5kb3dFbmRSZXNpemU6IFwid2luZG93czpXaW5kb3dFbmRSZXNpemVcIixcblx0XHRXaW5kb3dGdWxsc2NyZWVuOiBcIndpbmRvd3M6V2luZG93RnVsbHNjcmVlblwiLFxuXHRcdFdpbmRvd0hpZGU6IFwid2luZG93czpXaW5kb3dIaWRlXCIsXG5cdFx0V2luZG93SW5hY3RpdmU6IFwid2luZG93czpXaW5kb3dJbmFjdGl2ZVwiLFxuXHRcdFdpbmRvd0tleURvd246IFwid2luZG93czpXaW5kb3dLZXlEb3duXCIsXG5cdFx0V2luZG93S2V5VXA6IFwid2luZG93czpXaW5kb3dLZXlVcFwiLFxuXHRcdFdpbmRvd0tpbGxGb2N1czogXCJ3aW5kb3dzOldpbmRvd0tpbGxGb2N1c1wiLFxuXHRcdFdpbmRvd05vbkNsaWVudEhpdDogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudEhpdFwiLFxuXHRcdFdpbmRvd05vbkNsaWVudE1vdXNlRG93bjogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudE1vdXNlRG93blwiLFxuXHRcdFdpbmRvd05vbkNsaWVudE1vdXNlTGVhdmU6IFwid2luZG93czpXaW5kb3dOb25DbGllbnRNb3VzZUxlYXZlXCIsXG5cdFx0V2luZG93Tm9uQ2xpZW50TW91c2VNb3ZlOiBcIndpbmRvd3M6V2luZG93Tm9uQ2xpZW50TW91c2VNb3ZlXCIsXG5cdFx0V2luZG93Tm9uQ2xpZW50TW91c2VVcDogXCJ3aW5kb3dzOldpbmRvd05vbkNsaWVudE1vdXNlVXBcIixcblx0XHRXaW5kb3dQYWludDogXCJ3aW5kb3dzOldpbmRvd1BhaW50XCIsXG5cdFx0V2luZG93UmVzdG9yZTogXCJ3aW5kb3dzOldpbmRvd1Jlc3RvcmVcIixcblx0XHRXaW5kb3dTZXRGb2N1czogXCJ3aW5kb3dzOldpbmRvd1NldEZvY3VzXCIsXG5cdFx0V2luZG93U2hvdzogXCJ3aW5kb3dzOldpbmRvd1Nob3dcIixcblx0XHRXaW5kb3dTdGFydE1vdmU6IFwid2luZG93czpXaW5kb3dTdGFydE1vdmVcIixcblx0XHRXaW5kb3dTdGFydFJlc2l6ZTogXCJ3aW5kb3dzOldpbmRvd1N0YXJ0UmVzaXplXCIsXG5cdFx0V2luZG93VW5GdWxsc2NyZWVuOiBcIndpbmRvd3M6V2luZG93VW5GdWxsc2NyZWVuXCIsXG5cdFx0V2luZG93Wk9yZGVyQ2hhbmdlZDogXCJ3aW5kb3dzOldpbmRvd1pPcmRlckNoYW5nZWRcIixcblx0XHRXaW5kb3dNaW5pbWlzZTogXCJ3aW5kb3dzOldpbmRvd01pbmltaXNlXCIsXG5cdFx0V2luZG93VW5NaW5pbWlzZTogXCJ3aW5kb3dzOldpbmRvd1VuTWluaW1pc2VcIixcblx0XHRXaW5kb3dNYXhpbWlzZTogXCJ3aW5kb3dzOldpbmRvd01heGltaXNlXCIsXG5cdFx0V2luZG93VW5NYXhpbWlzZTogXCJ3aW5kb3dzOldpbmRvd1VuTWF4aW1pc2VcIixcblx0fSksXG5cdE1hYzogT2JqZWN0LmZyZWV6ZSh7XG5cdFx0QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQmVjb21lQWN0aXZlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllczogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllc1wiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZTogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VJY29uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUljb25cIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZU9jY2x1c2lvblN0YXRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZU9jY2x1c2lvblN0YXRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVNjcmVlblBhcmFtZXRlcnNcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VTdGF0dXNCYXJPcmllbnRhdGlvbjogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VTdGF0dXNCYXJPcmllbnRhdGlvblwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlVGhlbWU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlVGhlbWVcIixcblx0XHRBcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZzogXCJtYWM6QXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmdcIixcblx0XHRBcHBsaWNhdGlvbkRpZEhpZGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkSGlkZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkUmVzaWduQWN0aXZlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZFJlc2lnbkFjdGl2ZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkVW5oaWRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZFVuaGlkZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkVXBkYXRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZFVwZGF0ZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkV2FrZTogXCJtYWM6QXBwbGljYXRpb25EaWRXYWtlXCIsXG5cdFx0QXBwbGljYXRpb25TY3JlZW5zRGlkU2xlZXA6IFwibWFjOkFwcGxpY2F0aW9uU2NyZWVuc0RpZFNsZWVwXCIsXG5cdFx0QXBwbGljYXRpb25TY3JlZW5zRGlkV2FrZTogXCJtYWM6QXBwbGljYXRpb25TY3JlZW5zRGlkV2FrZVwiLFxuXHRcdEFwcGxpY2F0aW9uU2hvdWxkSGFuZGxlUmVvcGVuOiBcIm1hYzpBcHBsaWNhdGlvblNob3VsZEhhbmRsZVJlb3BlblwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbEJlY29tZUFjdGl2ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsQmVjb21lQWN0aXZlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsRmluaXNoTGF1bmNoaW5nOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxGaW5pc2hMYXVuY2hpbmdcIixcblx0XHRBcHBsaWNhdGlvbldpbGxIaWRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxIaWRlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsUmVzaWduQWN0aXZlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxTbGVlcDogXCJtYWM6QXBwbGljYXRpb25XaWxsU2xlZXBcIixcblx0XHRBcHBsaWNhdGlvbldpbGxUZXJtaW5hdGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFRlcm1pbmF0ZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFVuaGlkZTogXCJtYWM6QXBwbGljYXRpb25XaWxsVW5oaWRlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsVXBkYXRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxVcGRhdGVcIixcblx0XHRNZW51RGlkQWRkSXRlbTogXCJtYWM6TWVudURpZEFkZEl0ZW1cIixcblx0XHRNZW51RGlkQmVnaW5UcmFja2luZzogXCJtYWM6TWVudURpZEJlZ2luVHJhY2tpbmdcIixcblx0XHRNZW51RGlkQ2xvc2U6IFwibWFjOk1lbnVEaWRDbG9zZVwiLFxuXHRcdE1lbnVEaWREaXNwbGF5SXRlbTogXCJtYWM6TWVudURpZERpc3BsYXlJdGVtXCIsXG5cdFx0TWVudURpZEVuZFRyYWNraW5nOiBcIm1hYzpNZW51RGlkRW5kVHJhY2tpbmdcIixcblx0XHRNZW51RGlkSGlnaGxpZ2h0SXRlbTogXCJtYWM6TWVudURpZEhpZ2hsaWdodEl0ZW1cIixcblx0XHRNZW51RGlkT3BlbjogXCJtYWM6TWVudURpZE9wZW5cIixcblx0XHRNZW51RGlkUG9wVXA6IFwibWFjOk1lbnVEaWRQb3BVcFwiLFxuXHRcdE1lbnVEaWRSZW1vdmVJdGVtOiBcIm1hYzpNZW51RGlkUmVtb3ZlSXRlbVwiLFxuXHRcdE1lbnVEaWRTZW5kQWN0aW9uOiBcIm1hYzpNZW51RGlkU2VuZEFjdGlvblwiLFxuXHRcdE1lbnVEaWRTZW5kQWN0aW9uVG9JdGVtOiBcIm1hYzpNZW51RGlkU2VuZEFjdGlvblRvSXRlbVwiLFxuXHRcdE1lbnVEaWRVcGRhdGU6IFwibWFjOk1lbnVEaWRVcGRhdGVcIixcblx0XHRNZW51V2lsbEFkZEl0ZW06IFwibWFjOk1lbnVXaWxsQWRkSXRlbVwiLFxuXHRcdE1lbnVXaWxsQmVnaW5UcmFja2luZzogXCJtYWM6TWVudVdpbGxCZWdpblRyYWNraW5nXCIsXG5cdFx0TWVudVdpbGxEaXNwbGF5SXRlbTogXCJtYWM6TWVudVdpbGxEaXNwbGF5SXRlbVwiLFxuXHRcdE1lbnVXaWxsRW5kVHJhY2tpbmc6IFwibWFjOk1lbnVXaWxsRW5kVHJhY2tpbmdcIixcblx0XHRNZW51V2lsbEhpZ2hsaWdodEl0ZW06IFwibWFjOk1lbnVXaWxsSGlnaGxpZ2h0SXRlbVwiLFxuXHRcdE1lbnVXaWxsT3BlbjogXCJtYWM6TWVudVdpbGxPcGVuXCIsXG5cdFx0TWVudVdpbGxQb3BVcDogXCJtYWM6TWVudVdpbGxQb3BVcFwiLFxuXHRcdE1lbnVXaWxsUmVtb3ZlSXRlbTogXCJtYWM6TWVudVdpbGxSZW1vdmVJdGVtXCIsXG5cdFx0TWVudVdpbGxTZW5kQWN0aW9uOiBcIm1hYzpNZW51V2lsbFNlbmRBY3Rpb25cIixcblx0XHRNZW51V2lsbFNlbmRBY3Rpb25Ub0l0ZW06IFwibWFjOk1lbnVXaWxsU2VuZEFjdGlvblRvSXRlbVwiLFxuXHRcdE1lbnVXaWxsVXBkYXRlOiBcIm1hYzpNZW51V2lsbFVwZGF0ZVwiLFxuXHRcdFdlYlZpZXdEaWRDb21taXROYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkQ29tbWl0TmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRGaW5pc2hOYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkRmluaXNoTmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRSZWNlaXZlU2VydmVyUmVkaXJlY3RGb3JQcm92aXNpb25hbE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRSZWNlaXZlU2VydmVyUmVkaXJlY3RGb3JQcm92aXNpb25hbE5hdmlnYXRpb25cIixcblx0XHRXZWJWaWV3RGlkU3RhcnRQcm92aXNpb25hbE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRTdGFydFByb3Zpc2lvbmFsTmF2aWdhdGlvblwiLFxuXHRcdFdpbmRvd0RpZEJlY29tZUtleTogXCJtYWM6V2luZG93RGlkQmVjb21lS2V5XCIsXG5cdFx0V2luZG93RGlkQmVjb21lTWFpbjogXCJtYWM6V2luZG93RGlkQmVjb21lTWFpblwiLFxuXHRcdFdpbmRvd0RpZEJlZ2luU2hlZXQ6IFwibWFjOldpbmRvd0RpZEJlZ2luU2hlZXRcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VBbHBoYTogXCJtYWM6V2luZG93RGlkQ2hhbmdlQWxwaGFcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VCYWNraW5nTG9jYXRpb246IFwibWFjOldpbmRvd0RpZENoYW5nZUJhY2tpbmdMb2NhdGlvblwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllc1wiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUNvbGxlY3Rpb25CZWhhdmlvcjogXCJtYWM6V2luZG93RGlkQ2hhbmdlQ29sbGVjdGlvbkJlaGF2aW9yXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZU9jY2x1c2lvblN0YXRlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VPY2NsdXNpb25TdGF0ZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlT3JkZXJpbmdNb2RlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuUHJvZmlsZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2NyZWVuUHJvZmlsZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlUHJvcGVydGllczogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2VQcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2hhcmluZ1R5cGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVNoYXJpbmdUeXBlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU3BhY2U6IFwibWFjOldpbmRvd0RpZENoYW5nZVNwYWNlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU3BhY2VPcmRlcmluZ01vZGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVNwYWNlT3JkZXJpbmdNb2RlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlVGl0bGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVRpdGxlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlVG9vbGJhcjogXCJtYWM6V2luZG93RGlkQ2hhbmdlVG9vbGJhclwiLFxuXHRcdFdpbmRvd0RpZERlbWluaWF0dXJpemU6IFwibWFjOldpbmRvd0RpZERlbWluaWF0dXJpemVcIixcblx0XHRXaW5kb3dEaWRFbmRTaGVldDogXCJtYWM6V2luZG93RGlkRW5kU2hlZXRcIixcblx0XHRXaW5kb3dEaWRFbnRlckZ1bGxTY3JlZW46IFwibWFjOldpbmRvd0RpZEVudGVyRnVsbFNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZEVudGVyVmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd0RpZEVudGVyVmVyc2lvbkJyb3dzZXJcIixcblx0XHRXaW5kb3dEaWRFeGl0RnVsbFNjcmVlbjogXCJtYWM6V2luZG93RGlkRXhpdEZ1bGxTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRFeGl0VmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd0RpZEV4aXRWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd0RpZEV4cG9zZTogXCJtYWM6V2luZG93RGlkRXhwb3NlXCIsXG5cdFx0V2luZG93RGlkRm9jdXM6IFwibWFjOldpbmRvd0RpZEZvY3VzXCIsXG5cdFx0V2luZG93RGlkTWluaWF0dXJpemU6IFwibWFjOldpbmRvd0RpZE1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93RGlkTW92ZTogXCJtYWM6V2luZG93RGlkTW92ZVwiLFxuXHRcdFdpbmRvd0RpZE9yZGVyT2ZmU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRPcmRlck9mZlNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZE9yZGVyT25TY3JlZW46IFwibWFjOldpbmRvd0RpZE9yZGVyT25TY3JlZW5cIixcblx0XHRXaW5kb3dEaWRSZXNpZ25LZXk6IFwibWFjOldpbmRvd0RpZFJlc2lnbktleVwiLFxuXHRcdFdpbmRvd0RpZFJlc2lnbk1haW46IFwibWFjOldpbmRvd0RpZFJlc2lnbk1haW5cIixcblx0XHRXaW5kb3dEaWRSZXNpemU6IFwibWFjOldpbmRvd0RpZFJlc2l6ZVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZTogXCJtYWM6V2luZG93RGlkVXBkYXRlXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlQWxwaGE6IFwibWFjOldpbmRvd0RpZFVwZGF0ZUFscGhhXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uQmVoYXZpb3JcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uUHJvcGVydGllczogXCJtYWM6V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXNcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVTaGFkb3c6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVNoYWRvd1wiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZVRpdGxlOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVUaXRsZVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZVRvb2xiYXI6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVRvb2xiYXJcIixcblx0XHRXaW5kb3dEaWRab29tOiBcIm1hYzpXaW5kb3dEaWRab29tXCIsXG5cdFx0V2luZG93RmlsZURyYWdnaW5nRW50ZXJlZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nRW50ZXJlZFwiLFxuXHRcdFdpbmRvd0ZpbGVEcmFnZ2luZ0V4aXRlZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nRXhpdGVkXCIsXG5cdFx0V2luZG93RmlsZURyYWdnaW5nUGVyZm9ybWVkOiBcIm1hYzpXaW5kb3dGaWxlRHJhZ2dpbmdQZXJmb3JtZWRcIixcblx0XHRXaW5kb3dIaWRlOiBcIm1hYzpXaW5kb3dIaWRlXCIsXG5cdFx0V2luZG93TWF4aW1pc2U6IFwibWFjOldpbmRvd01heGltaXNlXCIsXG5cdFx0V2luZG93VW5NYXhpbWlzZTogXCJtYWM6V2luZG93VW5NYXhpbWlzZVwiLFxuXHRcdFdpbmRvd01pbmltaXNlOiBcIm1hYzpXaW5kb3dNaW5pbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWluaW1pc2U6IFwibWFjOldpbmRvd1VuTWluaW1pc2VcIixcblx0XHRXaW5kb3dTaG91bGRDbG9zZTogXCJtYWM6V2luZG93U2hvdWxkQ2xvc2VcIixcblx0XHRXaW5kb3dTaG93OiBcIm1hYzpXaW5kb3dTaG93XCIsXG5cdFx0V2luZG93V2lsbEJlY29tZUtleTogXCJtYWM6V2luZG93V2lsbEJlY29tZUtleVwiLFxuXHRcdFdpbmRvd1dpbGxCZWNvbWVNYWluOiBcIm1hYzpXaW5kb3dXaWxsQmVjb21lTWFpblwiLFxuXHRcdFdpbmRvd1dpbGxCZWdpblNoZWV0OiBcIm1hYzpXaW5kb3dXaWxsQmVnaW5TaGVldFwiLFxuXHRcdFdpbmRvd1dpbGxDaGFuZ2VPcmRlcmluZ01vZGU6IFwibWFjOldpbmRvd1dpbGxDaGFuZ2VPcmRlcmluZ01vZGVcIixcblx0XHRXaW5kb3dXaWxsQ2xvc2U6IFwibWFjOldpbmRvd1dpbGxDbG9zZVwiLFxuXHRcdFdpbmRvd1dpbGxEZW1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dXaWxsRGVtaW5pYXR1cml6ZVwiLFxuXHRcdFdpbmRvd1dpbGxFbnRlckZ1bGxTY3JlZW46IFwibWFjOldpbmRvd1dpbGxFbnRlckZ1bGxTY3JlZW5cIixcblx0XHRXaW5kb3dXaWxsRW50ZXJWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93V2lsbEVudGVyVmVyc2lvbkJyb3dzZXJcIixcblx0XHRXaW5kb3dXaWxsRXhpdEZ1bGxTY3JlZW46IFwibWFjOldpbmRvd1dpbGxFeGl0RnVsbFNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxFeGl0VmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd1dpbGxFeGl0VmVyc2lvbkJyb3dzZXJcIixcblx0XHRXaW5kb3dXaWxsRm9jdXM6IFwibWFjOldpbmRvd1dpbGxGb2N1c1wiLFxuXHRcdFdpbmRvd1dpbGxNaW5pYXR1cml6ZTogXCJtYWM6V2luZG93V2lsbE1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93V2lsbE1vdmU6IFwibWFjOldpbmRvd1dpbGxNb3ZlXCIsXG5cdFx0V2luZG93V2lsbE9yZGVyT2ZmU2NyZWVuOiBcIm1hYzpXaW5kb3dXaWxsT3JkZXJPZmZTY3JlZW5cIixcblx0XHRXaW5kb3dXaWxsT3JkZXJPblNjcmVlbjogXCJtYWM6V2luZG93V2lsbE9yZGVyT25TY3JlZW5cIixcblx0XHRXaW5kb3dXaWxsUmVzaWduTWFpbjogXCJtYWM6V2luZG93V2lsbFJlc2lnbk1haW5cIixcblx0XHRXaW5kb3dXaWxsUmVzaXplOiBcIm1hYzpXaW5kb3dXaWxsUmVzaXplXCIsXG5cdFx0V2luZG93V2lsbFVuZm9jdXM6IFwibWFjOldpbmRvd1dpbGxVbmZvY3VzXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVwiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVBbHBoYTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZUFscGhhXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvcjogXCJtYWM6V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvclwiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVDb2xsZWN0aW9uUHJvcGVydGllczogXCJtYWM6V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZVNoYWRvdzogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVNoYWRvd1wiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVUaXRsZTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVRpdGxlXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZVRvb2xiYXI6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVUb29sYmFyXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZVZpc2liaWxpdHk6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVWaXNpYmlsaXR5XCIsXG5cdFx0V2luZG93V2lsbFVzZVN0YW5kYXJkRnJhbWU6IFwibWFjOldpbmRvd1dpbGxVc2VTdGFuZGFyZEZyYW1lXCIsXG5cdFx0V2luZG93Wm9vbUluOiBcIm1hYzpXaW5kb3dab29tSW5cIixcblx0XHRXaW5kb3dab29tT3V0OiBcIm1hYzpXaW5kb3dab29tT3V0XCIsXG5cdFx0V2luZG93Wm9vbVJlc2V0OiBcIm1hYzpXaW5kb3dab29tUmVzZXRcIixcblx0XHRXZWJWaWV3V2ViQ29udGVudFByb2Nlc3NEaWRUZXJtaW5hdGU6IFwibWFjOldlYlZpZXdXZWJDb250ZW50UHJvY2Vzc0RpZFRlcm1pbmF0ZVwiLFxuXHR9KSxcblx0TGludXg6IE9iamVjdC5mcmVlemUoe1xuXHRcdEFwcGxpY2F0aW9uU3RhcnR1cDogXCJsaW51eDpBcHBsaWNhdGlvblN0YXJ0dXBcIixcblx0XHRTeXN0ZW1EaWRXYWtlOiBcImxpbnV4OlN5c3RlbURpZFdha2VcIixcblx0XHRTeXN0ZW1UaGVtZUNoYW5nZWQ6IFwibGludXg6U3lzdGVtVGhlbWVDaGFuZ2VkXCIsXG5cdFx0U3lzdGVtV2lsbFNsZWVwOiBcImxpbnV4OlN5c3RlbVdpbGxTbGVlcFwiLFxuXHRcdFdpbmRvd0RlbGV0ZUV2ZW50OiBcImxpbnV4OldpbmRvd0RlbGV0ZUV2ZW50XCIsXG5cdFx0V2luZG93RGlkTW92ZTogXCJsaW51eDpXaW5kb3dEaWRNb3ZlXCIsXG5cdFx0V2luZG93RGlkUmVzaXplOiBcImxpbnV4OldpbmRvd0RpZFJlc2l6ZVwiLFxuXHRcdFdpbmRvd0ZvY3VzSW46IFwibGludXg6V2luZG93Rm9jdXNJblwiLFxuXHRcdFdpbmRvd0ZvY3VzT3V0OiBcImxpbnV4OldpbmRvd0ZvY3VzT3V0XCIsXG5cdFx0V2luZG93TG9hZFN0YXJ0ZWQ6IFwibGludXg6V2luZG93TG9hZFN0YXJ0ZWRcIixcblx0XHRXaW5kb3dMb2FkUmVkaXJlY3RlZDogXCJsaW51eDpXaW5kb3dMb2FkUmVkaXJlY3RlZFwiLFxuXHRcdFdpbmRvd0xvYWRDb21taXR0ZWQ6IFwibGludXg6V2luZG93TG9hZENvbW1pdHRlZFwiLFxuXHRcdFdpbmRvd0xvYWRGaW5pc2hlZDogXCJsaW51eDpXaW5kb3dMb2FkRmluaXNoZWRcIixcblx0fSksXG5cdGlPUzogT2JqZWN0LmZyZWV6ZSh7XG5cdFx0QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmU6IFwiaW9zOkFwcGxpY2F0aW9uRGlkQmVjb21lQWN0aXZlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRFbnRlckJhY2tncm91bmQ6IFwiaW9zOkFwcGxpY2F0aW9uRGlkRW50ZXJCYWNrZ3JvdW5kXCIsXG5cdFx0QXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmc6IFwiaW9zOkFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nXCIsXG5cdFx0QXBwbGljYXRpb25EaWRSZWNlaXZlTWVtb3J5V2FybmluZzogXCJpb3M6QXBwbGljYXRpb25EaWRSZWNlaXZlTWVtb3J5V2FybmluZ1wiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbEVudGVyRm9yZWdyb3VuZDogXCJpb3M6QXBwbGljYXRpb25XaWxsRW50ZXJGb3JlZ3JvdW5kXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsUmVzaWduQWN0aXZlOiBcImlvczpBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxUZXJtaW5hdGU6IFwiaW9zOkFwcGxpY2F0aW9uV2lsbFRlcm1pbmF0ZVwiLFxuXHRcdFdpbmRvd0RpZExvYWQ6IFwiaW9zOldpbmRvd0RpZExvYWRcIixcblx0XHRXaW5kb3dXaWxsQXBwZWFyOiBcImlvczpXaW5kb3dXaWxsQXBwZWFyXCIsXG5cdFx0V2luZG93RGlkQXBwZWFyOiBcImlvczpXaW5kb3dEaWRBcHBlYXJcIixcblx0XHRXaW5kb3dXaWxsRGlzYXBwZWFyOiBcImlvczpXaW5kb3dXaWxsRGlzYXBwZWFyXCIsXG5cdFx0V2luZG93RGlkRGlzYXBwZWFyOiBcImlvczpXaW5kb3dEaWREaXNhcHBlYXJcIixcblx0XHRXaW5kb3dTYWZlQXJlYUluc2V0c0NoYW5nZWQ6IFwiaW9zOldpbmRvd1NhZmVBcmVhSW5zZXRzQ2hhbmdlZFwiLFxuXHRcdFdpbmRvd09yaWVudGF0aW9uQ2hhbmdlZDogXCJpb3M6V2luZG93T3JpZW50YXRpb25DaGFuZ2VkXCIsXG5cdFx0V2luZG93VG91Y2hCZWdhbjogXCJpb3M6V2luZG93VG91Y2hCZWdhblwiLFxuXHRcdFdpbmRvd1RvdWNoTW92ZWQ6IFwiaW9zOldpbmRvd1RvdWNoTW92ZWRcIixcblx0XHRXaW5kb3dUb3VjaEVuZGVkOiBcImlvczpXaW5kb3dUb3VjaEVuZGVkXCIsXG5cdFx0V2luZG93VG91Y2hDYW5jZWxsZWQ6IFwiaW9zOldpbmRvd1RvdWNoQ2FuY2VsbGVkXCIsXG5cdFx0V2ViVmlld0RpZFN0YXJ0TmF2aWdhdGlvbjogXCJpb3M6V2ViVmlld0RpZFN0YXJ0TmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRGaW5pc2hOYXZpZ2F0aW9uOiBcImlvczpXZWJWaWV3RGlkRmluaXNoTmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRGYWlsTmF2aWdhdGlvbjogXCJpb3M6V2ViVmlld0RpZEZhaWxOYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RlY2lkZVBvbGljeUZvck5hdmlnYXRpb25BY3Rpb246IFwiaW9zOldlYlZpZXdEZWNpZGVQb2xpY3lGb3JOYXZpZ2F0aW9uQWN0aW9uXCIsXG5cdFx0QmF0dGVyeUNoYW5nZWQ6IFwiaW9zOkJhdHRlcnlDaGFuZ2VkXCIsXG5cdFx0TmV0d29ya0NoYW5nZWQ6IFwiaW9zOk5ldHdvcmtDaGFuZ2VkXCIsXG5cdFx0VGhlbWVDaGFuZ2VkOiBcImlvczpUaGVtZUNoYW5nZWRcIixcblx0XHRTY3JlZW5Mb2NrZWQ6IFwiaW9zOlNjcmVlbkxvY2tlZFwiLFxuXHRcdFNjcmVlblVubG9ja2VkOiBcImlvczpTY3JlZW5VbmxvY2tlZFwiLFxuXHR9KSxcblx0QW5kcm9pZDogT2JqZWN0LmZyZWV6ZSh7XG5cdFx0QWN0aXZpdHlDcmVhdGVkOiBcImFuZHJvaWQ6QWN0aXZpdHlDcmVhdGVkXCIsXG5cdFx0QWN0aXZpdHlTdGFydGVkOiBcImFuZHJvaWQ6QWN0aXZpdHlTdGFydGVkXCIsXG5cdFx0QWN0aXZpdHlSZXN1bWVkOiBcImFuZHJvaWQ6QWN0aXZpdHlSZXN1bWVkXCIsXG5cdFx0QWN0aXZpdHlQYXVzZWQ6IFwiYW5kcm9pZDpBY3Rpdml0eVBhdXNlZFwiLFxuXHRcdEFjdGl2aXR5U3RvcHBlZDogXCJhbmRyb2lkOkFjdGl2aXR5U3RvcHBlZFwiLFxuXHRcdEFjdGl2aXR5RGVzdHJveWVkOiBcImFuZHJvaWQ6QWN0aXZpdHlEZXN0cm95ZWRcIixcblx0XHRBcHBsaWNhdGlvbkxvd01lbW9yeTogXCJhbmRyb2lkOkFwcGxpY2F0aW9uTG93TWVtb3J5XCIsXG5cdFx0V2ViVmlld1BhZ2VTdGFydGVkOiBcImFuZHJvaWQ6V2ViVmlld1BhZ2VTdGFydGVkXCIsXG5cdFx0V2ViVmlld1BhZ2VGaW5pc2hlZDogXCJhbmRyb2lkOldlYlZpZXdQYWdlRmluaXNoZWRcIixcblx0XHRCYXR0ZXJ5Q2hhbmdlZDogXCJhbmRyb2lkOkJhdHRlcnlDaGFuZ2VkXCIsXG5cdFx0TmV0d29ya0NoYW5nZWQ6IFwiYW5kcm9pZDpOZXR3b3JrQ2hhbmdlZFwiLFxuXHRcdFRoZW1lQ2hhbmdlZDogXCJhbmRyb2lkOlRoZW1lQ2hhbmdlZFwiLFxuXHRcdFNjcmVlbkxvY2tlZDogXCJhbmRyb2lkOlNjcmVlbkxvY2tlZFwiLFxuXHRcdFNjcmVlblVubG9ja2VkOiBcImFuZHJvaWQ6U2NyZWVuVW5sb2NrZWRcIixcblx0fSksXG5cdENvbW1vbjogT2JqZWN0LmZyZWV6ZSh7XG5cdFx0QXBwbGljYXRpb25PcGVuZWRXaXRoRmlsZTogXCJjb21tb246QXBwbGljYXRpb25PcGVuZWRXaXRoRmlsZVwiLFxuXHRcdEFwcGxpY2F0aW9uU3RhcnRlZDogXCJjb21tb246QXBwbGljYXRpb25TdGFydGVkXCIsXG5cdFx0QXBwbGljYXRpb25MYXVuY2hlZFdpdGhVcmw6IFwiY29tbW9uOkFwcGxpY2F0aW9uTGF1bmNoZWRXaXRoVXJsXCIsXG5cdFx0VGhlbWVDaGFuZ2VkOiBcImNvbW1vbjpUaGVtZUNoYW5nZWRcIixcblx0XHRTeXN0ZW1EaWRXYWtlOiBcImNvbW1vbjpTeXN0ZW1EaWRXYWtlXCIsXG5cdFx0U3lzdGVtV2lsbFNsZWVwOiBcImNvbW1vbjpTeXN0ZW1XaWxsU2xlZXBcIixcblx0XHRXaW5kb3dDbG9zaW5nOiBcImNvbW1vbjpXaW5kb3dDbG9zaW5nXCIsXG5cdFx0V2luZG93RGlkTW92ZTogXCJjb21tb246V2luZG93RGlkTW92ZVwiLFxuXHRcdFdpbmRvd0RpZFJlc2l6ZTogXCJjb21tb246V2luZG93RGlkUmVzaXplXCIsXG5cdFx0V2luZG93RFBJQ2hhbmdlZDogXCJjb21tb246V2luZG93RFBJQ2hhbmdlZFwiLFxuXHRcdFdpbmRvd0ZpbGVzRHJvcHBlZDogXCJjb21tb246V2luZG93RmlsZXNEcm9wcGVkXCIsXG5cdFx0V2luZG93Rm9jdXM6IFwiY29tbW9uOldpbmRvd0ZvY3VzXCIsXG5cdFx0V2luZG93RnVsbHNjcmVlbjogXCJjb21tb246V2luZG93RnVsbHNjcmVlblwiLFxuXHRcdFdpbmRvd0hpZGU6IFwiY29tbW9uOldpbmRvd0hpZGVcIixcblx0XHRXaW5kb3dMb3N0Rm9jdXM6IFwiY29tbW9uOldpbmRvd0xvc3RGb2N1c1wiLFxuXHRcdFdpbmRvd01heGltaXNlOiBcImNvbW1vbjpXaW5kb3dNYXhpbWlzZVwiLFxuXHRcdFdpbmRvd01pbmltaXNlOiBcImNvbW1vbjpXaW5kb3dNaW5pbWlzZVwiLFxuXHRcdFdpbmRvd1RvZ2dsZUZyYW1lbGVzczogXCJjb21tb246V2luZG93VG9nZ2xlRnJhbWVsZXNzXCIsXG5cdFx0V2luZG93UmVzdG9yZTogXCJjb21tb246V2luZG93UmVzdG9yZVwiLFxuXHRcdFdpbmRvd1J1bnRpbWVSZWFkeTogXCJjb21tb246V2luZG93UnVudGltZVJlYWR5XCIsXG5cdFx0V2luZG93U2hvdzogXCJjb21tb246V2luZG93U2hvd1wiLFxuXHRcdFdpbmRvd1VuRnVsbHNjcmVlbjogXCJjb21tb246V2luZG93VW5GdWxsc2NyZWVuXCIsXG5cdFx0V2luZG93VW5NYXhpbWlzZTogXCJjb21tb246V2luZG93VW5NYXhpbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWluaW1pc2U6IFwiY29tbW9uOldpbmRvd1VuTWluaW1pc2VcIixcblx0XHRXaW5kb3dab29tOiBcImNvbW1vbjpXaW5kb3dab29tXCIsXG5cdFx0V2luZG93Wm9vbUluOiBcImNvbW1vbjpXaW5kb3dab29tSW5cIixcblx0XHRXaW5kb3dab29tT3V0OiBcImNvbW1vbjpXaW5kb3dab29tT3V0XCIsXG5cdFx0V2luZG93Wm9vbVJlc2V0OiBcImNvbW1vbjpXaW5kb3dab29tUmVzZXRcIixcblx0XHRCYXR0ZXJ5Q2hhbmdlZDogXCJjb21tb246QmF0dGVyeUNoYW5nZWRcIixcblx0XHROZXR3b3JrQ2hhbmdlZDogXCJjb21tb246TmV0d29ya0NoYW5nZWRcIixcblx0XHRTY3JlZW5Mb2NrZWQ6IFwiY29tbW9uOlNjcmVlbkxvY2tlZFwiLFxuXHRcdFNjcmVlblVubG9ja2VkOiBcImNvbW1vbjpTY3JlZW5VbmxvY2tlZFwiLFxuXHRcdExvd01lbW9yeTogXCJjb21tb246TG93TWVtb3J5XCIsXG5cdH0pLFxufSk7XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IHsgbmV3UnVudGltZUNhbGxlciwgb2JqZWN0TmFtZXMgfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQgeyBldmVudExpc3RlbmVycywgTGlzdGVuZXIsIGxpc3RlbmVyT2ZmIH0gZnJvbSBcIi4vbGlzdGVuZXIuanNcIjtcbmltcG9ydCB7IEV2ZW50cyBhcyBDcmVhdGUgfSBmcm9tIFwiLi9jcmVhdGUuanNcIjtcbmltcG9ydCB7IFR5cGVzIH0gZnJvbSBcIi4vZXZlbnRfdHlwZXMuanNcIjtcblxuLy8gU2V0dXBcbmltcG9ydCB7IGhhc0RPTSB9IGZyb20gXCIuL2Vudmlyb25tZW50LmpzXCI7XG5cbmlmIChoYXNET00pIHtcbiAgICB3aW5kb3cuX2JhaWxzID0gd2luZG93Ll9iYWlscyB8fCB7fTtcbiAgICB3aW5kb3cuX2JhaWxzLmRpc3BhdGNoQmFpbHNFdmVudCA9IGRpc3BhdGNoQmFpbHNFdmVudDtcbn1cblxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuRXZlbnRzKTtcbmNvbnN0IEVtaXRNZXRob2QgPSAwO1xuXG5leHBvcnQgKiBmcm9tIFwiLi9ldmVudF90eXBlcy5qc1wiO1xuXG4vKipcbiAqIEEgdGFibGUgb2YgZGF0YSB0eXBlcyBmb3IgYWxsIGtub3duIGV2ZW50cy5cbiAqIFdpbGwgYmUgbW9ua2V5LXBhdGNoZWQgYnkgdGhlIGJpbmRpbmcgZ2VuZXJhdG9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEN1c3RvbUV2ZW50cyB7fVxuXG4vKipcbiAqIEVpdGhlciBhIGtub3duIGV2ZW50IG5hbWUgb3IgYW4gYXJiaXRyYXJ5IHN0cmluZy5cbiAqL1xuZXhwb3J0IHR5cGUgQmFpbHNFdmVudE5hbWU8RSBleHRlbmRzIGtleW9mIEN1c3RvbUV2ZW50cyA9IGtleW9mIEN1c3RvbUV2ZW50cz4gPSBFIHwgKHN0cmluZyAmIHt9KTtcblxuLyoqXG4gKiBVbmlvbiBvZiBhbGwga25vd24gc3lzdGVtIGV2ZW50IG5hbWVzLlxuICovXG50eXBlIFN5c3RlbUV2ZW50TmFtZSA9IHtcbiAgICBbSyBpbiBrZXlvZiAodHlwZW9mIFR5cGVzKV06ICh0eXBlb2YgVHlwZXMpW0tdW2tleW9mICgodHlwZW9mIFR5cGVzKVtLXSldXG59IGV4dGVuZHMgKGluZmVyIE0pID8gTVtrZXlvZiBNXSA6IG5ldmVyO1xuXG4vKipcbiAqIFRoZSBkYXRhIHR5cGUgYXNzb2NpYXRlZCB0byBhIGdpdmVuIGV2ZW50LlxuICovXG5leHBvcnQgdHlwZSBCYWlsc0V2ZW50RGF0YTxFIGV4dGVuZHMgQmFpbHNFdmVudE5hbWUgPSBCYWlsc0V2ZW50TmFtZT4gPVxuICAgIEUgZXh0ZW5kcyBrZXlvZiBDdXN0b21FdmVudHMgPyBDdXN0b21FdmVudHNbRV0gOiAoRSBleHRlbmRzIFN5c3RlbUV2ZW50TmFtZSA/IHZvaWQgOiBhbnkpO1xuXG4vKipcbiAqIFRoZSB0eXBlIG9mIGhhbmRsZXJzIGZvciBhIGdpdmVuIGV2ZW50LlxuICovXG5leHBvcnQgdHlwZSBCYWlsc0V2ZW50Q2FsbGJhY2s8RSBleHRlbmRzIEJhaWxzRXZlbnROYW1lID0gQmFpbHNFdmVudE5hbWU+ID0gKGV2OiBCYWlsc0V2ZW50PEU+KSA9PiB2b2lkO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzeXN0ZW0gZXZlbnQgb3IgYSBjdXN0b20gZXZlbnQgZW1pdHRlZCB0aHJvdWdoIGJhaWxzLXByb3ZpZGVkIGZhY2lsaXRpZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCYWlsc0V2ZW50PEUgZXh0ZW5kcyBCYWlsc0V2ZW50TmFtZSA9IEJhaWxzRXZlbnROYW1lPiB7XG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICAgICAqL1xuICAgIG5hbWU6IEU7XG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbCBkYXRhIGFzc29jaWF0ZWQgd2l0aCB0aGUgZW1pdHRlZCBldmVudC5cbiAgICAgKi9cbiAgICBkYXRhOiBCYWlsc0V2ZW50RGF0YTxFPjtcblxuICAgIC8qKlxuICAgICAqIE5hbWUgb2YgdGhlIG9yaWdpbmF0aW5nIHdpbmRvdy4gT21pdHRlZCBmb3IgYXBwbGljYXRpb24gZXZlbnRzLlxuICAgICAqIFdpbGwgYmUgb3ZlcnJpZGRlbiBpZiBzZXQgbWFudWFsbHkuXG4gICAgICovXG4gICAgc2VuZGVyPzogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IobmFtZTogRSwgZGF0YTogQmFpbHNFdmVudERhdGE8RT4pO1xuICAgIGNvbnN0cnVjdG9yKG5hbWU6IEJhaWxzRXZlbnREYXRhPEU+IGV4dGVuZHMgbnVsbCB8IHZvaWQgPyBFIDogbmV2ZXIpXG4gICAgY29uc3RydWN0b3IobmFtZTogRSwgZGF0YT86IGFueSkge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhID8/IG51bGw7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEJhaWxzRXZlbnQoZXZlbnQ6IGFueSkge1xuICAgIGxldCBsaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnQubmFtZSk7XG4gICAgaWYgKCFsaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBiYWlsc0V2ZW50ID0gbmV3IEJhaWxzRXZlbnQoXG4gICAgICAgIGV2ZW50Lm5hbWUsXG4gICAgICAgIChldmVudC5uYW1lIGluIENyZWF0ZSkgPyBDcmVhdGVbZXZlbnQubmFtZV0oZXZlbnQuZGF0YSkgOiBldmVudC5kYXRhXG4gICAgKTtcbiAgICBpZiAoJ3NlbmRlcicgaW4gZXZlbnQpIHtcbiAgICAgICAgYmFpbHNFdmVudC5zZW5kZXIgPSBldmVudC5zZW5kZXI7XG4gICAgfVxuXG4gICAgLy8gRGlzcGF0Y2ggdG8gYSBzbmFwc2hvdCwgdGhlbiByZW1vdmUgYWxsIGV4cGlyZWQgbGlzdGVuZXJzIGluIGEgc2luZ2xlXG4gICAgLy8gcG9zdC1kaXNwYXRjaCBmaWx0ZXIgb2YgdGhlIGxpdmUgbWFwLlxuICAgIC8vIC0gV3JpdGluZyB0aGUgc25hcHNob3QgYmFjayB3aG9sZXNhbGUgd291bGQgdW5kbyBzdWJzY3JpcHRpb24gY2hhbmdlc1xuICAgIC8vICAgbWFkZSBpbnNpZGUgYSBoYW5kbGVyICgjNDM5MykuXG4gICAgLy8gLSBDYWxsaW5nIGxpc3RlbmVyT2ZmKCkgcGVyIGV4cGlyZWQgbGlzdGVuZXIgaW5zaWRlIHRoZSBsb29wIGlzIE8obsKyKVxuICAgIC8vICAgd2hlbiBtYW55IGxpc3RlbmVycyBleHBpcmUgb24gdGhlIHNhbWUgZXZlbnQuXG4gICAgLy8gRmlsdGVyaW5nIHRoZSBsaXZlIGFycmF5IG9uY2UgYWZ0ZXIgZGlzcGF0Y2ggaXMgTyhuKSBhbmQgc3RpbGwgaG9ub3Vyc1xuICAgIC8vIGFueSBsaXN0ZW5lcnMgYWRkZWQgb3IgcmVtb3ZlZCBieSBoYW5kbGVycyBkdXJpbmcgZGlzcGF0Y2guXG4gICAgY29uc3QgZXhwaXJlZCA9IG5ldyBTZXQ8TGlzdGVuZXI+KCk7XG4gICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMuc2xpY2UoKSkge1xuICAgICAgICBpZiAobGlzdGVuZXIuZGlzcGF0Y2goYmFpbHNFdmVudCkpIHtcbiAgICAgICAgICAgIGV4cGlyZWQuYWRkKGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZXhwaXJlZC5zaXplID4gMCkge1xuICAgICAgICBjb25zdCBsaXZlID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50Lm5hbWUpO1xuICAgICAgICBpZiAobGl2ZSkge1xuICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nID0gbGl2ZS5maWx0ZXIobCA9PiAhZXhwaXJlZC5oYXMobCkpO1xuICAgICAgICAgICAgaWYgKHJlbWFpbmluZy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBldmVudExpc3RlbmVycy5kZWxldGUoZXZlbnQubmFtZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJzLnNldChldmVudC5uYW1lLCByZW1haW5pbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGZvciBhIHNwZWNpZmljIGV2ZW50LlxuICpcbiAqIEBwYXJhbSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZvci5cbiAqIEBwYXJhbSBjYWxsYmFjayAtIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICogQHBhcmFtIG1heENhbGxiYWNrcyAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiB0aW1lcyB0aGUgY2FsbGJhY2sgY2FuIGJlIGNhbGxlZCBmb3IgdGhlIGV2ZW50LiBPbmNlIHRoZSBtYXhpbXVtIG51bWJlciBpcyByZWFjaGVkLCB0aGUgY2FsbGJhY2sgd2lsbCBubyBsb25nZXIgYmUgY2FsbGVkLlxuICogQHJldHVybnMgQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgd2lsbCB1bnJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmcm9tIHRoZSBldmVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9uTXVsdGlwbGU8RSBleHRlbmRzIEJhaWxzRXZlbnROYW1lID0gQmFpbHNFdmVudE5hbWU+KGV2ZW50TmFtZTogRSwgY2FsbGJhY2s6IEJhaWxzRXZlbnRDYWxsYmFjazxFPiwgbWF4Q2FsbGJhY2tzOiBudW1iZXIpIHtcbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50TmFtZSkgfHwgW107XG4gICAgY29uc3QgdGhpc0xpc3RlbmVyID0gbmV3IExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG1heENhbGxiYWNrcyk7XG4gICAgbGlzdGVuZXJzLnB1c2godGhpc0xpc3RlbmVyKTtcbiAgICBldmVudExpc3RlbmVycy5zZXQoZXZlbnROYW1lLCBsaXN0ZW5lcnMpO1xuICAgIHJldHVybiAoKSA9PiBsaXN0ZW5lck9mZih0aGlzTGlzdGVuZXIpO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIHNwZWNpZmllZCBldmVudCBvY2N1cnMuXG4gKlxuICogQHBhcmFtIGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byByZWdpc3RlciB0aGUgY2FsbGJhY2sgZm9yLlxuICogQHBhcmFtIGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuXG4gKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHVucmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gT248RSBleHRlbmRzIEJhaWxzRXZlbnROYW1lID0gQmFpbHNFdmVudE5hbWU+KGV2ZW50TmFtZTogRSwgY2FsbGJhY2s6IEJhaWxzRXZlbnRDYWxsYmFjazxFPik6ICgpID0+IHZvaWQge1xuICAgIHJldHVybiBPbk11bHRpcGxlKGV2ZW50TmFtZSwgY2FsbGJhY2ssIC0xKTtcbn1cblxuLyoqXG4gKiBSZWdpc3RlcnMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCBvbmx5IG9uY2UgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byByZWdpc3RlciB0aGUgY2FsbGJhY2sgZm9yLlxuICogQHBhcmFtIGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuXG4gKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHVucmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gT25jZTxFIGV4dGVuZHMgQmFpbHNFdmVudE5hbWUgPSBCYWlsc0V2ZW50TmFtZT4oZXZlbnROYW1lOiBFLCBjYWxsYmFjazogQmFpbHNFdmVudENhbGxiYWNrPEU+KTogKCkgPT4gdm9pZCB7XG4gICAgcmV0dXJuIE9uTXVsdGlwbGUoZXZlbnROYW1lLCBjYWxsYmFjaywgMSk7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgbmFtZXMuXG4gKlxuICogQHBhcmFtIGV2ZW50TmFtZXMgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRzIHRvIHJlbW92ZSBsaXN0ZW5lcnMgZm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gT2ZmKC4uLmV2ZW50TmFtZXM6IFtCYWlsc0V2ZW50TmFtZSwgLi4uQmFpbHNFdmVudE5hbWVbXV0pOiB2b2lkIHtcbiAgICBldmVudE5hbWVzLmZvckVhY2goZXZlbnROYW1lID0+IGV2ZW50TGlzdGVuZXJzLmRlbGV0ZShldmVudE5hbWUpKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPZmZBbGwoKTogdm9pZCB7XG4gICAgZXZlbnRMaXN0ZW5lcnMuY2xlYXIoKTtcbn1cblxuLyoqXG4gKiBFbWl0cyBhbiBldmVudC5cbiAqXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCB3aWxsIGJlIGZ1bGZpbGxlZCBvbmNlIHRoZSBldmVudCBoYXMgYmVlbiBlbWl0dGVkLiAgUmVzb2x2ZXMgdG8gdHJ1ZSBpZiB0aGUgZXZlbnQgd2FzIGNhbmNlbGxlZC5cbiAqIEBwYXJhbSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIGVtaXRcbiAqIEBwYXJhbSBkYXRhIC0gVGhlIGRhdGEgdGhhdCB3aWxsIGJlIHNlbnQgd2l0aCB0aGUgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVtaXQ8RSBleHRlbmRzIEJhaWxzRXZlbnROYW1lID0gQmFpbHNFdmVudE5hbWU+KG5hbWU6IEUsIGRhdGE6IEJhaWxzRXZlbnREYXRhPEU+KTogUHJvbWlzZTxib29sZWFuPlxuZXhwb3J0IGZ1bmN0aW9uIEVtaXQ8RSBleHRlbmRzIEJhaWxzRXZlbnROYW1lID0gQmFpbHNFdmVudE5hbWU+KG5hbWU6IEJhaWxzRXZlbnREYXRhPEU+IGV4dGVuZHMgbnVsbCB8IHZvaWQgPyBFIDogbmV2ZXIpOiBQcm9taXNlPGJvb2xlYW4+XG5leHBvcnQgZnVuY3Rpb24gRW1pdDxFIGV4dGVuZHMgQmFpbHNFdmVudE5hbWUgPSBCYWlsc0V2ZW50TmFtZT4obmFtZTogQmFpbHNFdmVudERhdGE8RT4sIGRhdGE/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gY2FsbChFbWl0TWV0aG9kLCAgbmV3IEJhaWxzRXZlbnQobmFtZSwgZGF0YSkpXG59XG5cbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpemUge1xuICAgIC8qKiBUaGUgd2lkdGggb2YgYSByZWN0YW5ndWxhciBhcmVhLiAqL1xuICAgIFdpZHRoOiBudW1iZXI7XG4gICAgLyoqIFRoZSBoZWlnaHQgb2YgYSByZWN0YW5ndWxhciBhcmVhLiAqL1xuICAgIEhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlY3Qge1xuICAgIC8qKiBUaGUgWCBjb29yZGluYXRlIG9mIHRoZSBvcmlnaW4uICovXG4gICAgWDogbnVtYmVyO1xuICAgIC8qKiBUaGUgWSBjb29yZGluYXRlIG9mIHRoZSBvcmlnaW4uICovXG4gICAgWTogbnVtYmVyO1xuICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIHJlY3RhbmdsZS4gKi9cbiAgICBXaWR0aDogbnVtYmVyO1xuICAgIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSByZWN0YW5nbGUuICovXG4gICAgSGVpZ2h0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NyZWVuIHtcbiAgICAvKiogVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBzY3JlZW4uICovXG4gICAgSUQ6IHN0cmluZztcbiAgICAvKiogSHVtYW4tcmVhZGFibGUgbmFtZSBvZiB0aGUgc2NyZWVuLiAqL1xuICAgIE5hbWU6IHN0cmluZztcbiAgICAvKiogVGhlIHNjYWxlIGZhY3RvciBvZiB0aGUgc2NyZWVuIChEUEkvOTYpLiAxID0gc3RhbmRhcmQgRFBJLCAyID0gSGlEUEkgKFJldGluYSksIGV0Yy4gKi9cbiAgICBTY2FsZUZhY3RvcjogbnVtYmVyO1xuICAgIC8qKiBUaGUgWCBjb29yZGluYXRlIG9mIHRoZSBzY3JlZW4uICovXG4gICAgWDogbnVtYmVyO1xuICAgIC8qKiBUaGUgWSBjb29yZGluYXRlIG9mIHRoZSBzY3JlZW4uICovXG4gICAgWTogbnVtYmVyO1xuICAgIC8qKiBDb250YWlucyB0aGUgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgc2NyZWVuLiAqL1xuICAgIFNpemU6IFNpemU7XG4gICAgLyoqIENvbnRhaW5zIHRoZSBib3VuZHMgb2YgdGhlIHNjcmVlbiBpbiB0ZXJtcyBvZiBYLCBZLCBXaWR0aCwgYW5kIEhlaWdodC4gKi9cbiAgICBCb3VuZHM6IFJlY3Q7XG4gICAgLyoqIENvbnRhaW5zIHRoZSBwaHlzaWNhbCBib3VuZHMgb2YgdGhlIHNjcmVlbiBpbiB0ZXJtcyBvZiBYLCBZLCBXaWR0aCwgYW5kIEhlaWdodCAoYmVmb3JlIHNjYWxpbmcpLiAqL1xuICAgIFBoeXNpY2FsQm91bmRzOiBSZWN0O1xuICAgIC8qKiBDb250YWlucyB0aGUgYXJlYSBvZiB0aGUgc2NyZWVuIHRoYXQgaXMgYWN0dWFsbHkgdXNhYmxlIChleGNsdWRpbmcgdGFza2JhciBhbmQgb3RoZXIgc3lzdGVtIFVJKS4gKi9cbiAgICBXb3JrQXJlYTogUmVjdDtcbiAgICAvKiogQ29udGFpbnMgdGhlIHBoeXNpY2FsIFdvcmtBcmVhIG9mIHRoZSBzY3JlZW4gKGJlZm9yZSBzY2FsaW5nKS4gKi9cbiAgICBQaHlzaWNhbFdvcmtBcmVhOiBSZWN0O1xuICAgIC8qKiBUcnVlIGlmIHRoaXMgaXMgdGhlIHByaW1hcnkgbW9uaXRvciBzZWxlY3RlZCBieSB0aGUgdXNlciBpbiB0aGUgb3BlcmF0aW5nIHN5c3RlbS4gKi9cbiAgICBJc1ByaW1hcnk6IGJvb2xlYW47XG4gICAgLyoqIFRoZSByb3RhdGlvbiBvZiB0aGUgc2NyZWVuLiAqL1xuICAgIFJvdGF0aW9uOiBudW1iZXI7XG59XG5cbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXIsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuU2NyZWVucyk7XG5cbmNvbnN0IGdldEFsbCA9IDA7XG5jb25zdCBnZXRQcmltYXJ5ID0gMTtcbmNvbnN0IGdldEN1cnJlbnQgPSAyO1xuY29uc3QgZ2V0QnlJRCA9IDM7XG5jb25zdCBnZXRCeUluZGV4ID0gNDtcblxuLyoqXG4gKiBHZXRzIGFsbCBzY3JlZW5zLlxuICpcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIGFycmF5IG9mIFNjcmVlbiBvYmplY3RzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0QWxsKCk6IFByb21pc2U8U2NyZWVuW10+IHtcbiAgICByZXR1cm4gY2FsbChnZXRBbGwpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHByaW1hcnkgc2NyZWVuLlxuICpcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBwcmltYXJ5IHNjcmVlbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldFByaW1hcnkoKTogUHJvbWlzZTxTY3JlZW4+IHtcbiAgICByZXR1cm4gY2FsbChnZXRQcmltYXJ5KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBjdXJyZW50IGFjdGl2ZSBzY3JlZW4uXG4gKlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgY3VycmVudCBhY3RpdmUgc2NyZWVuLlxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0Q3VycmVudCgpOiBQcm9taXNlPFNjcmVlbj4ge1xuICAgIHJldHVybiBjYWxsKGdldEN1cnJlbnQpO1xufVxuXG4vKipcbiAqIEdldHMgYSBzY3JlZW4gYnkgaXRzIHVuaXF1ZSBkaXNwbGF5IElELlxuICpcbiAqIEBwYXJhbSBpZCAtIFRoZSB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgc2NyZWVuLlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIG1hdGNoaW5nIFNjcmVlbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEJ5SUQoaWQ6IHN0cmluZyk6IFByb21pc2U8U2NyZWVuPiB7XG4gICAgcmV0dXJuIGNhbGwoZ2V0QnlJRCwgeyBpZCB9KTtcbn1cblxuLyoqXG4gKiBHZXRzIGEgc2NyZWVuIGJ5IGl0cyBpbmRleCBpbiB0aGUgc2NyZWVuIGxpc3QuXG4gKlxuICogQHBhcmFtIGluZGV4IC0gVGhlIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIHNjcmVlbi5cbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBtYXRjaGluZyBTY3JlZW4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRCeUluZGV4KGluZGV4OiBudW1iZXIpOiBQcm9taXNlPFNjcmVlbj4ge1xuICAgIHJldHVybiBjYWxsKGdldEJ5SW5kZXgsIHsgaW5kZXggfSk7XG59XG4iLCIvKlxuIF8gICAgIF9fICAgICBfIF9fXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0IHsgbmV3UnVudGltZUNhbGxlciwgb2JqZWN0TmFtZXMgfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5cbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLklPUyk7XG5cbi8vIE1ldGhvZCBJRHNcbmNvbnN0IEhhcHRpY3NJbXBhY3QgPSAwO1xuY29uc3QgRGV2aWNlSW5mbyA9IDE7XG5cbmV4cG9ydCBuYW1lc3BhY2UgSGFwdGljcyB7XG4gICAgZXhwb3J0IHR5cGUgSW1wYWN0U3R5bGUgPSBcImxpZ2h0XCJ8XCJtZWRpdW1cInxcImhlYXZ5XCJ8XCJzb2Z0XCJ8XCJyaWdpZFwiO1xuICAgIGV4cG9ydCBmdW5jdGlvbiBJbXBhY3Qoc3R5bGU6IEltcGFjdFN0eWxlID0gXCJtZWRpdW1cIik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gY2FsbChIYXB0aWNzSW1wYWN0LCB7IHN0eWxlIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBEZXZpY2Uge1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgSW5mbyB7XG4gICAgICAgIG1vZGVsOiBzdHJpbmc7XG4gICAgICAgIHN5c3RlbU5hbWU6IHN0cmluZztcbiAgICAgICAgc3lzdGVtVmVyc2lvbjogc3RyaW5nO1xuICAgICAgICBpc1NpbXVsYXRvcjogYm9vbGVhbjtcbiAgICB9XG4gICAgZXhwb3J0IGZ1bmN0aW9uIEluZm8oKTogUHJvbWlzZTxJbmZvPiB7XG4gICAgICAgIHJldHVybiBjYWxsKERldmljZUluZm8pO1xuICAgIH1cbn1cbiIsIi8qXG4gXyAgICAgX18gICAgIF8gX19cbnwgfCAgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyLCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcblxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0TmFtZXMuQW5kcm9pZCk7XG5cbi8vIE1ldGhvZCBJRHMgKG11c3QgbWF0Y2ggbWVzc2FnZXByb2Nlc3Nvcl9hbmRyb2lkLmdvKVxuY29uc3QgSGFwdGljc1ZpYnJhdGUgPSAwO1xuY29uc3QgRGV2aWNlSW5mbyA9IDE7XG5jb25zdCBUb2FzdFNob3cgPSAyO1xuXG5leHBvcnQgbmFtZXNwYWNlIEhhcHRpY3Mge1xuICAgIC8qKiBWaWJyYXRlIHRoZSBkZXZpY2UgZm9yIHRoZSBnaXZlbiBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMuICovXG4gICAgZXhwb3J0IGZ1bmN0aW9uIFZpYnJhdGUoZHVyYXRpb25NczogbnVtYmVyID0gMTAwKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBjYWxsKEhhcHRpY3NWaWJyYXRlLCB7IGR1cmF0aW9uOiBkdXJhdGlvbk1zIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBEZXZpY2Uge1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgSW5mbyB7XG4gICAgICAgIHBsYXRmb3JtOiBzdHJpbmc7XG4gICAgICAgIG1hbnVmYWN0dXJlcjogc3RyaW5nO1xuICAgICAgICBicmFuZDogc3RyaW5nO1xuICAgICAgICBtb2RlbDogc3RyaW5nO1xuICAgICAgICBkZXZpY2U6IHN0cmluZztcbiAgICAgICAgdmVyc2lvbjogc3RyaW5nO1xuICAgICAgICBzZGtJbnQ6IG51bWJlcjtcbiAgICB9XG4gICAgLyoqIFJldHVybiBpbmZvcm1hdGlvbiBhYm91dCB0aGUgQW5kcm9pZCBkZXZpY2UuICovXG4gICAgZXhwb3J0IGZ1bmN0aW9uIEluZm8oKTogUHJvbWlzZTxJbmZvPiB7XG4gICAgICAgIHJldHVybiBjYWxsKERldmljZUluZm8pO1xuICAgIH1cbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBUb2FzdCB7XG4gICAgLyoqIFNob3cgYSBzaG9ydCBBbmRyb2lkIHRvYXN0IG1lc3NhZ2UuICovXG4gICAgZXhwb3J0IGZ1bmN0aW9uIFNob3cobWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBjYWxsKFRvYXN0U2hvdywgeyBtZXNzYWdlIH0pO1xuICAgIH1cbn1cbiIsIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKipcbiAqIFVwZGF0ZXIgZXZlbnQgbmFtZSBjb25zdGFudHMuXG4gKlxuICogVXNlIHRoZXNlIGluc3RlYWQgb2YgaGFyZC1jb2Rpbmcgc3RyaW5nIGxpdGVyYWxzIHdoZW4gc3Vic2NyaWJpbmcgdG9cbiAqIHVwZGF0ZXIgZXZlbnRzIGZyb20gSmF2YVNjcmlwdDpcbiAqXG4gKiAgICAgaW1wb3J0IHsgRXZlbnRzLCBVcGRhdGVyIH0gZnJvbSBcIkBiYWlscy9ydW50aW1lXCI7XG4gKlxuICogICAgIEV2ZW50cy5PbihVcGRhdGVyLkV2ZW50cy5VcGRhdGVBdmFpbGFibGUsIChlKSA9PiB7XG4gKiAgICAgICAgIGNvbnNvbGUubG9nKFwidXBkYXRlIGZvdW5kOlwiLCBlLmRhdGEudmVyc2lvbik7XG4gKiAgICAgfSk7XG4gKlxuICogICAgIEV2ZW50cy5PbihVcGRhdGVyLkV2ZW50cy5Eb3dubG9hZFByb2dyZXNzLCAoZSkgPT4ge1xuICogICAgICAgICBjb25zdCBwID0gZS5kYXRhO1xuICogICAgICAgICBjb25zb2xlLmxvZyhgJHtwLndyaXR0ZW59IC8gJHtwLnRvdGFsfSBieXRlc2ApO1xuICogICAgIH0pO1xuICpcbiAqIE1pcnJvcnMgdGhlIEdvLXNpZGUgY29uc3RhbnRzIGluIGBwa2cvdXBkYXRlci9ldmVudHMuZ29gIGFuZCB0aGVcbiAqIHVzZXItYWN0aW9uIGNvbnN0YW50cyBpbiBgcGtnL3VwZGF0ZXIvd2luZG93X2xpZmVjeWNsZS5nb2AuIEFueVxuICogY2hhbmdlcyBoZXJlIG11c3Qgc3RheSBpbiBzeW5jIHdpdGggdGhvc2UgZmlsZXMg4oCUIHRoZXJlJ3MgYW5cbiAqIGludGVncmF0aW9uIHRlc3QgdGhhdCBhc3NlcnRzIHRoZSBzdHJpbmdzIG1hdGNoLlxuICovXG5leHBvcnQgY29uc3QgRXZlbnRzID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgLyoqIEEgQ2hlY2sgcm91bmQtdHJpcCBpcyBzdGFydGluZy4gUGF5bG9hZDogbnVsbC4gKi9cbiAgICBDaGVja1N0YXJ0ZWQ6IFwiYmFpbHM6dXBkYXRlcjpjaGVjay1zdGFydGVkXCIsXG4gICAgLyoqIENoZWNrIGZvdW5kIGEgbmV3ZXIgcmVsZWFzZS4gUGF5bG9hZDogUmVsZWFzZS4gKi9cbiAgICBVcGRhdGVBdmFpbGFibGU6IFwiYmFpbHM6dXBkYXRlcjp1cGRhdGUtYXZhaWxhYmxlXCIsXG4gICAgLyoqIENoZWNrIGNvbmZpcm1lZCB0aGUgY2FsbGVyIGlzIHVwIHRvIGRhdGUuIFBheWxvYWQ6IG51bGwuICovXG4gICAgTm9VcGRhdGU6IFwiYmFpbHM6dXBkYXRlcjpuby11cGRhdGVcIixcbiAgICAvKiogRG93bmxvYWQgaXMgc3RhcnRpbmcuIFBheWxvYWQ6IFJlbGVhc2UuICovXG4gICAgRG93bmxvYWRTdGFydGVkOiBcImJhaWxzOnVwZGF0ZXI6ZG93bmxvYWQtc3RhcnRlZFwiLFxuICAgIC8qKiBQZXJpb2RpYyBwcm9ncmVzcyB0aWNrIGR1cmluZyBkb3dubG9hZCAofjEwIEh6KS4gUGF5bG9hZDogUHJvZ3Jlc3MuICovXG4gICAgRG93bmxvYWRQcm9ncmVzczogXCJiYWlsczp1cGRhdGVyOmRvd25sb2FkLXByb2dyZXNzXCIsXG4gICAgLyoqIEFsbCBieXRlcyBhcmUgb24gZGlzaywgYnV0IHZlcmlmaWNhdGlvbiBoYXMgbm90IHlldCBzdGFydGVkLiBQYXlsb2FkOiBSZWxlYXNlLiAqL1xuICAgIERvd25sb2FkQ29tcGxldGU6IFwiYmFpbHM6dXBkYXRlcjpkb3dubG9hZC1jb21wbGV0ZVwiLFxuICAgIC8qKiBTaWduYXR1cmUgLyBkaWdlc3QgdmVyaWZpY2F0aW9uIGhhcyBzdGFydGVkLiBQYXlsb2FkOiBSZWxlYXNlLiAqL1xuICAgIFZlcmlmeWluZzogXCJiYWlsczp1cGRhdGVyOnZlcmlmeWluZ1wiLFxuICAgIC8qKiBUaGUgVXBkYXRlciBpcyBzd2FwcGluZyB0aGUgYmluYXJ5IGludG8gcGxhY2UuIFBheWxvYWQ6IFJlbGVhc2UuICovXG4gICAgSW5zdGFsbGluZzogXCJiYWlsczp1cGRhdGVyOmluc3RhbGxpbmdcIixcbiAgICAvKiogVXBkYXRlIGlzIHN0YWdlZCBhbmQgYSByZXN0YXJ0IGlzIHBlbmRpbmcuIFBheWxvYWQ6IFJlbGVhc2UuICovXG4gICAgVXBkYXRlUmVhZHk6IFwiYmFpbHM6dXBkYXRlcjp1cGRhdGUtcmVhZHlcIixcbiAgICAvKiogU29tZXRoaW5nIGZhaWxlZC4gUGF5bG9hZDogRXJyb3JJbmZvIHsgc3RhZ2UsIG1lc3NhZ2UsIHByb3ZpZGVyIH0uICovXG4gICAgRXJyb3I6IFwiYmFpbHM6dXBkYXRlcjplcnJvclwiLFxuICAgIC8qKiBIb3N0LXNpZGUgY29udGV4dCBkZWxpdmVyZWQgb25jZSBwZXIgc2Vzc2lvbi4gUGF5bG9hZDogTWV0YSB7IGN1cnJlbnRWZXJzaW9uLCBza2lwcGVkVmVyc2lvbiB9LiAqL1xuICAgIE1ldGE6IFwiYmFpbHM6dXBkYXRlcjptZXRhXCIsXG5cbiAgICAvKiogU3ViLW5hbWVzcGFjZTogdXNlci1hY3Rpb24gZXZlbnRzIHRoYXQgdGhlIFVJIGVtaXRzIEJBQ0sgdG8gdGhlIGhvc3QuICovXG4gICAgVXNlcjogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgIC8qKiBVc2VyIGNsaWNrZWQgSW5zdGFsbCBvbiBhbiBBdmFpbGFibGUgdXBkYXRlLiAqL1xuICAgICAgICBJbnN0YWxsOiBcImJhaWxzOnVwZGF0ZXI6dXNlcjppbnN0YWxsXCIsXG4gICAgICAgIC8qKiBVc2VyIGNsaWNrZWQgUmVzdGFydCAmIEFwcGx5IG9uIGEgUmVhZHkgdXBkYXRlLiAqL1xuICAgICAgICBSZXN0YXJ0OiBcImJhaWxzOnVwZGF0ZXI6dXNlcjpyZXN0YXJ0XCIsXG4gICAgICAgIC8qKiBVc2VyIGNsaWNrZWQgU2tpcCBUaGlzIFZlcnNpb24uICovXG4gICAgICAgIFNraXA6IFwiYmFpbHM6dXBkYXRlcjp1c2VyOnNraXBcIixcbiAgICAgICAgLyoqIFVzZXIgY2xpY2tlZCBSZW1pbmQgTWUgTGF0ZXIuICovXG4gICAgICAgIFJlbWluZDogXCJiYWlsczp1cGRhdGVyOnVzZXI6cmVtaW5kXCIsXG4gICAgICAgIC8qKiBVc2VyIGNsaWNrZWQgQ2xvc2UgLyBDYW5jZWwuICovXG4gICAgICAgIENhbmNlbDogXCJiYWlsczp1cGRhdGVyOnVzZXI6Y2FuY2VsXCIsXG4gICAgfSksXG5cbiAgICAvKiogU3ViLW5hbWVzcGFjZTogZnJhbWV3b3JrLWludGVybmFsIGV2ZW50cyB0aGUgVUkgZW1pdHMgdG8gY29vcmRpbmF0ZVxuICAgICAqICB3aXRoIHRoZSBob3N0LiBNb3N0IGFwcCBjb2RlIGNhbiBpZ25vcmUgdGhlc2UuICovXG4gICAgV2luZG93OiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgLyoqIFRoZSB3aW5kb3cgZmluaXNoZWQgbG9hZGluZyBhbmQgYXNrcyB0aGUgaG9zdCB0byByZXBsYXkgY3VycmVudCBzdGF0ZS4gKi9cbiAgICAgICAgUmVhZHk6IFwiYmFpbHM6dXBkYXRlcjp3aW5kb3c6cmVhZHlcIixcbiAgICB9KSxcbn0pO1xuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCB7bmV3UnVudGltZUNhbGxlciwgb2JqZWN0TmFtZXN9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB0eXBlIHsgU2NyZWVuIH0gZnJvbSBcIi4vc2NyZWVucy5qc1wiO1xuXG4vLyBEcm9wIHRhcmdldCBjb25zdGFudHNcbmNvbnN0IERST1BfVEFSR0VUX0FUVFJJQlVURSA9ICdkYXRhLWZpbGUtZHJvcC10YXJnZXQnO1xuY29uc3QgRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTID0gJ2ZpbGUtZHJvcC10YXJnZXQtYWN0aXZlJztcbmxldCBjdXJyZW50RHJvcFRhcmdldDogRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG5jb25zdCBQb3NpdGlvbk1ldGhvZCAgICAgICAgICAgICAgICAgICAgPSAwO1xuY29uc3QgQ2VudGVyTWV0aG9kICAgICAgICAgICAgICAgICAgICAgID0gMTtcbmNvbnN0IENsb3NlTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICA9IDI7XG5jb25zdCBEaXNhYmxlU2l6ZUNvbnN0cmFpbnRzTWV0aG9kICAgICAgPSAzO1xuY29uc3QgRW5hYmxlU2l6ZUNvbnN0cmFpbnRzTWV0aG9kICAgICAgID0gNDtcbmNvbnN0IEZvY3VzTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICA9IDU7XG5jb25zdCBGb3JjZVJlbG9hZE1ldGhvZCAgICAgICAgICAgICAgICAgPSA2O1xuY29uc3QgRnVsbHNjcmVlbk1ldGhvZCAgICAgICAgICAgICAgICAgID0gNztcbmNvbnN0IEdldFNjcmVlbk1ldGhvZCAgICAgICAgICAgICAgICAgICA9IDg7XG5jb25zdCBHZXRab29tTWV0aG9kICAgICAgICAgICAgICAgICAgICAgPSA5O1xuY29uc3QgSGVpZ2h0TWV0aG9kICAgICAgICAgICAgICAgICAgICAgID0gMTA7XG5jb25zdCBIaWRlTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICAgPSAxMTtcbmNvbnN0IElzRm9jdXNlZE1ldGhvZCAgICAgICAgICAgICAgICAgICA9IDEyO1xuY29uc3QgSXNGdWxsc2NyZWVuTWV0aG9kICAgICAgICAgICAgICAgID0gMTM7XG5jb25zdCBJc01heGltaXNlZE1ldGhvZCAgICAgICAgICAgICAgICAgPSAxNDtcbmNvbnN0IElzTWluaW1pc2VkTWV0aG9kICAgICAgICAgICAgICAgICA9IDE1O1xuY29uc3QgTWF4aW1pc2VNZXRob2QgICAgICAgICAgICAgICAgICAgID0gMTY7XG5jb25zdCBNaW5pbWlzZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgPSAxNztcbmNvbnN0IE5hbWVNZXRob2QgICAgICAgICAgICAgICAgICAgICAgICA9IDE4O1xuY29uc3QgT3BlbkRldlRvb2xzTWV0aG9kICAgICAgICAgICAgICAgID0gMTk7XG5jb25zdCBSZWxhdGl2ZVBvc2l0aW9uTWV0aG9kICAgICAgICAgICAgPSAyMDtcbmNvbnN0IFJlbG9hZE1ldGhvZCAgICAgICAgICAgICAgICAgICAgICA9IDIxO1xuY29uc3QgUmVzaXphYmxlTWV0aG9kICAgICAgICAgICAgICAgICAgID0gMjI7XG5jb25zdCBSZXN0b3JlTWV0aG9kICAgICAgICAgICAgICAgICAgICAgPSAyMztcbmNvbnN0IFNldFBvc2l0aW9uTWV0aG9kICAgICAgICAgICAgICAgICA9IDI0O1xuY29uc3QgU2V0QWx3YXlzT25Ub3BNZXRob2QgICAgICAgICAgICAgID0gMjU7XG5jb25zdCBTZXRCYWNrZ3JvdW5kQ29sb3VyTWV0aG9kICAgICAgICAgPSAyNjtcbmNvbnN0IFNldEZyYW1lbGVzc01ldGhvZCAgICAgICAgICAgICAgICA9IDI3O1xuY29uc3QgU2V0RnVsbHNjcmVlbkJ1dHRvbkVuYWJsZWRNZXRob2QgID0gMjg7XG5jb25zdCBTZXRNYXhTaXplTWV0aG9kICAgICAgICAgICAgICAgICAgPSAyOTtcbmNvbnN0IFNldE1pblNpemVNZXRob2QgICAgICAgICAgICAgICAgICA9IDMwO1xuY29uc3QgU2V0UmVsYXRpdmVQb3NpdGlvbk1ldGhvZCAgICAgICAgID0gMzE7XG5jb25zdCBTZXRSZXNpemFibGVNZXRob2QgICAgICAgICAgICAgICAgPSAzMjtcbmNvbnN0IFNldFNpemVNZXRob2QgICAgICAgICAgICAgICAgICAgICA9IDMzO1xuY29uc3QgU2V0VGl0bGVNZXRob2QgICAgICAgICAgICAgICAgICAgID0gMzQ7XG5jb25zdCBTZXRab29tTWV0aG9kICAgICAgICAgICAgICAgICAgICAgPSAzNTtcbmNvbnN0IFNob3dNZXRob2QgICAgICAgICAgICAgICAgICAgICAgICA9IDM2O1xuY29uc3QgU2l6ZU1ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgID0gMzc7XG5jb25zdCBUb2dnbGVGdWxsc2NyZWVuTWV0aG9kICAgICAgICAgICAgPSAzODtcbmNvbnN0IFRvZ2dsZU1heGltaXNlTWV0aG9kICAgICAgICAgICAgICA9IDM5O1xuY29uc3QgVG9nZ2xlRnJhbWVsZXNzTWV0aG9kICAgICAgICAgICAgID0gNDA7IFxuY29uc3QgVW5GdWxsc2NyZWVuTWV0aG9kICAgICAgICAgICAgICAgID0gNDE7XG5jb25zdCBVbk1heGltaXNlTWV0aG9kICAgICAgICAgICAgICAgICAgPSA0MjtcbmNvbnN0IFVuTWluaW1pc2VNZXRob2QgICAgICAgICAgICAgICAgICA9IDQzO1xuY29uc3QgV2lkdGhNZXRob2QgICAgICAgICAgICAgICAgICAgICAgID0gNDQ7XG5jb25zdCBab29tTWV0aG9kICAgICAgICAgICAgICAgICAgICAgICAgPSA0NTtcbmNvbnN0IFpvb21Jbk1ldGhvZCAgICAgICAgICAgICAgICAgICAgICA9IDQ2O1xuY29uc3QgWm9vbU91dE1ldGhvZCAgICAgICAgICAgICAgICAgICAgID0gNDc7XG5jb25zdCBab29tUmVzZXRNZXRob2QgICAgICAgICAgICAgICAgICAgPSA0ODtcbmNvbnN0IFNuYXBBc3Npc3RNZXRob2QgICAgICAgICAgICAgICAgICA9IDQ5O1xuY29uc3QgRmlsZXNEcm9wcGVkICAgICAgICAgICAgICAgICAgICAgID0gNTA7XG5jb25zdCBQcmludE1ldGhvZCAgICAgICAgICAgICAgICAgICAgICAgPSA1MTtcbmNvbnN0IFNldFNjcmVlbk1ldGhvZCAgICAgICAgICAgICAgICAgICA9IDUyO1xuXG4vKipcbiAqIEZpbmRzIHRoZSBuZWFyZXN0IGRyb3AgdGFyZ2V0IGVsZW1lbnQgYnkgd2Fsa2luZyB1cCB0aGUgRE9NIHRyZWUuXG4gKi9cbmZ1bmN0aW9uIGdldERyb3BUYXJnZXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQgfCBudWxsKTogRWxlbWVudCB8IG51bGwge1xuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQuY2xvc2VzdChgWyR7RFJPUF9UQVJHRVRfQVRUUklCVVRFfV1gKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB3ZSBjYW4gdXNlIFdlYlZpZXcyJ3MgcG9zdE1lc3NhZ2VXaXRoQWRkaXRpb25hbE9iamVjdHMgKFdpbmRvd3MpXG4gKiBBbHNvIGNoZWNrcyB0aGF0IEVuYWJsZUZpbGVEcm9wIGlzIHRydWUgZm9yIHRoaXMgd2luZG93LlxuICovXG5mdW5jdGlvbiBjYW5SZXNvbHZlRmlsZVBhdGhzKCk6IGJvb2xlYW4ge1xuICAgIC8vIE11c3QgaGF2ZSBXZWJWaWV3MidzIHBvc3RNZXNzYWdlV2l0aEFkZGl0aW9uYWxPYmplY3RzIEFQSSAoV2luZG93cyBvbmx5KVxuICAgIGlmICgod2luZG93IGFzIGFueSkuY2hyb21lPy53ZWJ2aWV3Py5wb3N0TWVzc2FnZVdpdGhBZGRpdGlvbmFsT2JqZWN0cyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gTXVzdCBoYXZlIEVuYWJsZUZpbGVEcm9wIHNldCB0byB0cnVlIGZvciB0aGlzIHdpbmRvd1xuICAgIC8vIFRoaXMgZmxhZyBpcyBzZXQgYnkgdGhlIEdvIGJhY2tlbmQgZHVyaW5nIHJ1bnRpbWUgaW5pdGlhbGl6YXRpb25cbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLl9iYWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSB0cnVlO1xufVxuXG4vKipcbiAqIFNlbmQgZmlsZSBkcm9wIHRvIGJhY2tlbmQgdmlhIFdlYlZpZXcyIChXaW5kb3dzIG9ubHkpXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVGaWxlUGF0aHMoeDogbnVtYmVyLCB5OiBudW1iZXIsIGZpbGVzOiBGaWxlW10pOiB2b2lkIHtcbiAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLmNocm9tZT8ud2Vidmlldz8ucG9zdE1lc3NhZ2VXaXRoQWRkaXRpb25hbE9iamVjdHMpIHtcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLmNocm9tZS53ZWJ2aWV3LnBvc3RNZXNzYWdlV2l0aEFkZGl0aW9uYWxPYmplY3RzKGBmaWxlOmRyb3A6JHt4fToke3l9YCwgZmlsZXMpO1xuICAgIH1cbn1cblxuLy8gTmF0aXZlIGRyYWcgc3RhdGUgKExpbnV4L21hY09TIGludGVyY2VwdCBET00gZHJhZyBldmVudHMpXG5sZXQgbmF0aXZlRHJhZ0FjdGl2ZSA9IGZhbHNlO1xuXG4vKipcbiAqIENsZWFucyB1cCBuYXRpdmUgZHJhZyBzdGF0ZSBhbmQgaG92ZXIgZWZmZWN0cy5cbiAqIENhbGxlZCBvbiBkcm9wIG9yIHdoZW4gZHJhZyBsZWF2ZXMgdGhlIHdpbmRvdy5cbiAqL1xuZnVuY3Rpb24gY2xlYW51cE5hdGl2ZURyYWcoKTogdm9pZCB7XG4gICAgbmF0aXZlRHJhZ0FjdGl2ZSA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50RHJvcFRhcmdldCkge1xuICAgICAgICBjdXJyZW50RHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUyk7XG4gICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0ID0gbnVsbDtcbiAgICB9XG59XG5cbi8qKlxuICogQ2FsbGVkIGZyb20gR28gd2hlbiBhIGZpbGUgZHJhZyBlbnRlcnMgdGhlIHdpbmRvdyBvbiBMaW51eC9tYWNPUy5cbiAqL1xuZnVuY3Rpb24gaGFuZGxlRHJhZ0VudGVyKCk6IHZvaWQge1xuICAgIC8vIENoZWNrIGlmIGZpbGUgZHJvcHMgYXJlIGVuYWJsZWQgZm9yIHRoaXMgd2luZG93XG4gICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fYmFpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuOyAvLyBGaWxlIGRyb3BzIGRpc2FibGVkLCBkb24ndCBhY3RpdmF0ZSBkcmFnIHN0YXRlXG4gICAgfVxuICAgIG5hdGl2ZURyYWdBY3RpdmUgPSB0cnVlO1xufVxuXG4vKipcbiAqIENhbGxlZCBmcm9tIEdvIHdoZW4gYSBmaWxlIGRyYWcgbGVhdmVzIHRoZSB3aW5kb3cgb24gTGludXgvbWFjT1MuXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZURyYWdMZWF2ZSgpOiB2b2lkIHtcbiAgICBjbGVhbnVwTmF0aXZlRHJhZygpO1xufVxuXG4vKipcbiAqIENhbGxlZCBmcm9tIEdvIGR1cmluZyBmaWxlIGRyYWcgdG8gdXBkYXRlIGhvdmVyIHN0YXRlIG9uIExpbnV4L21hY09TLlxuICogQHBhcmFtIHggLSBYIGNvb3JkaW5hdGUgaW4gQ1NTIHBpeGVsc1xuICogQHBhcmFtIHkgLSBZIGNvb3JkaW5hdGUgaW4gQ1NTIHBpeGVsc1xuICovXG5mdW5jdGlvbiBoYW5kbGVEcmFnT3Zlcih4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xuICAgIGlmICghbmF0aXZlRHJhZ0FjdGl2ZSkgcmV0dXJuO1xuICAgIFxuICAgIC8vIENoZWNrIGlmIGZpbGUgZHJvcHMgYXJlIGVuYWJsZWQgZm9yIHRoaXMgd2luZG93XG4gICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fYmFpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuOyAvLyBGaWxlIGRyb3BzIGRpc2FibGVkLCBkb24ndCBzaG93IGhvdmVyIGVmZmVjdHNcbiAgICB9XG4gICAgXG4gICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgY29uc3QgZHJvcFRhcmdldCA9IGdldERyb3BUYXJnZXRFbGVtZW50KHRhcmdldEVsZW1lbnQpO1xuICAgIFxuICAgIGlmIChjdXJyZW50RHJvcFRhcmdldCAmJiBjdXJyZW50RHJvcFRhcmdldCAhPT0gZHJvcFRhcmdldCkge1xuICAgICAgICBjdXJyZW50RHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUyk7XG4gICAgfVxuICAgIFxuICAgIGlmIChkcm9wVGFyZ2V0KSB7XG4gICAgICAgIGRyb3BUYXJnZXQuY2xhc3NMaXN0LmFkZChEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xuICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IGRyb3BUYXJnZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudERyb3BUYXJnZXQgPSBudWxsO1xuICAgIH1cbn1cblxuXG5cbi8vIEV4cG9ydCB0aGUgaGFuZGxlcnMgZm9yIHVzZSBieSBHbyB2aWEgaW5kZXgudHNcbmV4cG9ydCB7IGhhbmRsZURyYWdFbnRlciwgaGFuZGxlRHJhZ0xlYXZlLCBoYW5kbGVEcmFnT3ZlciB9O1xuXG4vKipcbiAqIEEgcmVjb3JkIGRlc2NyaWJpbmcgdGhlIHBvc2l0aW9uIG9mIGEgd2luZG93LlxuICovXG5pbnRlcmZhY2UgUG9zaXRpb24ge1xuICAgIC8qKiBUaGUgaG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0aGUgd2luZG93LiAqL1xuICAgIHg6IG51bWJlcjtcbiAgICAvKiogVGhlIHZlcnRpY2FsIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuICovXG4gICAgeTogbnVtYmVyO1xufVxuXG4vKipcbiAqIEEgcmVjb3JkIGRlc2NyaWJpbmcgdGhlIHNpemUgb2YgYSB3aW5kb3cuXG4gKi9cbmludGVyZmFjZSBTaXplIHtcbiAgICAvKiogVGhlIHdpZHRoIG9mIHRoZSB3aW5kb3cuICovXG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICAvKiogVGhlIGhlaWdodCBvZiB0aGUgd2luZG93LiAqL1xuICAgIGhlaWdodDogbnVtYmVyO1xufVxuXG4vLyBQcml2YXRlIGZpZWxkIG5hbWVzLlxuY29uc3QgY2FsbGVyU3ltID0gU3ltYm9sKFwiY2FsbGVyXCIpO1xuXG5jbGFzcyBXaW5kb3cge1xuICAgIC8vIFByaXZhdGUgZmllbGRzLlxuICAgIHByaXZhdGUgW2NhbGxlclN5bV06IChtZXNzYWdlOiBudW1iZXIsIGFyZ3M/OiBhbnkpID0+IFByb21pc2U8YW55PjtcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpc2VzIGEgd2luZG93IG9iamVjdCB3aXRoIHRoZSBzcGVjaWZpZWQgbmFtZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgdGFyZ2V0IHdpbmRvdy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcgPSAnJykge1xuICAgICAgICB0aGlzW2NhbGxlclN5bV0gPSBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdE5hbWVzLldpbmRvdywgbmFtZSlcblxuICAgICAgICAvLyBiaW5kIGluc3RhbmNlIG1ldGhvZCB0byBtYWtlIHRoZW0gZWFzaWx5IHVzYWJsZSBpbiBldmVudCBoYW5kbGVyc1xuICAgICAgICBmb3IgKGNvbnN0IG1ldGhvZCBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhXaW5kb3cucHJvdG90eXBlKSkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIG1ldGhvZCAhPT0gXCJjb25zdHJ1Y3RvclwiXG4gICAgICAgICAgICAgICAgJiYgdHlwZW9mICh0aGlzIGFzIGFueSlbbWV0aG9kXSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAodGhpcyBhcyBhbnkpW21ldGhvZF0gPSAodGhpcyBhcyBhbnkpW21ldGhvZF0uYmluZCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHNwZWNpZmllZCB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB3aW5kb3cgdG8gZ2V0LlxuICAgICAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIHdpbmRvdyBvYmplY3QuXG4gICAgICovXG4gICAgR2V0KG5hbWU6IHN0cmluZyk6IFdpbmRvdyB7XG4gICAgICAgIHJldHVybiBuZXcgV2luZG93KG5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGFic29sdXRlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIFBvc2l0aW9uKCk6IFByb21pc2U8UG9zaXRpb24+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShQb3NpdGlvbk1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2VudGVycyB0aGUgd2luZG93IG9uIHRoZSBzY3JlZW4uXG4gICAgICovXG4gICAgQ2VudGVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKENlbnRlck1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgQ2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oQ2xvc2VNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc2FibGVzIG1pbi9tYXggc2l6ZSBjb25zdHJhaW50cy5cbiAgICAgKi9cbiAgICBEaXNhYmxlU2l6ZUNvbnN0cmFpbnRzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKERpc2FibGVTaXplQ29uc3RyYWludHNNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuYWJsZXMgbWluL21heCBzaXplIGNvbnN0cmFpbnRzLlxuICAgICAqL1xuICAgIEVuYWJsZVNpemVDb25zdHJhaW50cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShFbmFibGVTaXplQ29uc3RyYWludHNNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZvY3VzZXMgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBGb2N1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShGb2N1c01ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRm9yY2VzIHRoZSB3aW5kb3cgdG8gcmVsb2FkIHRoZSBwYWdlIGFzc2V0cy5cbiAgICAgKi9cbiAgICBGb3JjZVJlbG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShGb3JjZVJlbG9hZE1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3dpdGNoZXMgdGhlIHdpbmRvdyB0byBmdWxsc2NyZWVuIG1vZGUuXG4gICAgICovXG4gICAgRnVsbHNjcmVlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShGdWxsc2NyZWVuTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzY3JlZW4gdGhhdCB0aGUgd2luZG93IGlzIG9uLlxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIHNjcmVlbiB0aGUgd2luZG93IGlzIGN1cnJlbnRseSBvbi5cbiAgICAgKi9cbiAgICBHZXRTY3JlZW4oKTogUHJvbWlzZTxTY3JlZW4+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShHZXRTY3JlZW5NZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIGN1cnJlbnQgem9vbSBsZXZlbC5cbiAgICAgKi9cbiAgICBHZXRab29tKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oR2V0Wm9vbU1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUgY3VycmVudCBoZWlnaHQgb2YgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBIZWlnaHQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShIZWlnaHRNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhpZGVzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgSGlkZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShIaWRlTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmb2N1c2VkLlxuICAgICAqXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgd2luZG93IGlzIGN1cnJlbnRseSBmb2N1c2VkLlxuICAgICAqL1xuICAgIElzRm9jdXNlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShJc0ZvY3VzZWRNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGlzIGZ1bGxzY3JlZW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB3aW5kb3cgaXMgY3VycmVudGx5IGZ1bGxzY3JlZW4uXG4gICAgICovXG4gICAgSXNGdWxsc2NyZWVuKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKElzRnVsbHNjcmVlbk1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgbWF4aW1pc2VkLlxuICAgICAqXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgd2luZG93IGlzIGN1cnJlbnRseSBtYXhpbWlzZWQuXG4gICAgICovXG4gICAgSXNNYXhpbWlzZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oSXNNYXhpbWlzZWRNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGlzIG1pbmltaXNlZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHdpbmRvdyBpcyBjdXJyZW50bHkgbWluaW1pc2VkLlxuICAgICAqL1xuICAgIElzTWluaW1pc2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKElzTWluaW1pc2VkTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYXhpbWlzZXMgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBNYXhpbWlzZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShNYXhpbWlzZU1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWluaW1pc2VzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgTWluaW1pc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oTWluaW1pc2VNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG5hbWUgb2YgdGhlIHdpbmRvdy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoZSBuYW1lIG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgTmFtZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKE5hbWVNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9wZW5zIHRoZSBkZXZlbG9wbWVudCB0b29scyBwYW5lLlxuICAgICAqL1xuICAgIE9wZW5EZXZUb29scygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShPcGVuRGV2VG9vbHNNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cgdG8gdGhlIHNjcmVlbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgUmVsYXRpdmVQb3NpdGlvbigpOiBQcm9taXNlPFBvc2l0aW9uPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oUmVsYXRpdmVQb3NpdGlvbk1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVsb2FkcyB0aGUgcGFnZSBhc3NldHMuXG4gICAgICovXG4gICAgUmVsb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFJlbG9hZE1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgcmVzaXphYmxlLlxuICAgICAqXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgd2luZG93IGlzIGN1cnJlbnRseSByZXNpemFibGUuXG4gICAgICovXG4gICAgUmVzaXphYmxlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFJlc2l6YWJsZU1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzdG9yZXMgdGhlIHdpbmRvdyB0byBpdHMgcHJldmlvdXMgc3RhdGUgaWYgaXQgd2FzIHByZXZpb3VzbHkgbWluaW1pc2VkLCBtYXhpbWlzZWQgb3IgZnVsbHNjcmVlbi5cbiAgICAgKi9cbiAgICBSZXN0b3JlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFJlc3RvcmVNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGFic29sdXRlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0geCAtIFRoZSBkZXNpcmVkIGhvcml6b250YWwgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdy5cbiAgICAgKiBAcGFyYW0geSAtIFRoZSBkZXNpcmVkIHZlcnRpY2FsIGFic29sdXRlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgU2V0UG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRQb3NpdGlvbk1ldGhvZCwgeyB4LCB5IH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHdpbmRvdyB0byBiZSBhbHdheXMgb24gdG9wLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFsd2F5c09uVG9wIC0gV2hldGhlciB0aGUgd2luZG93IHNob3VsZCBzdGF5IG9uIHRvcC5cbiAgICAgKi9cbiAgICBTZXRBbHdheXNPblRvcChhbHdheXNPblRvcDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldEFsd2F5c09uVG9wTWV0aG9kLCB7IGFsd2F5c09uVG9wIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGJhY2tncm91bmQgY29sb3VyIG9mIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gciAtIFRoZSBkZXNpcmVkIHJlZCBjb21wb25lbnQgb2YgdGhlIHdpbmRvdyBiYWNrZ3JvdW5kLlxuICAgICAqIEBwYXJhbSBnIC0gVGhlIGRlc2lyZWQgZ3JlZW4gY29tcG9uZW50IG9mIHRoZSB3aW5kb3cgYmFja2dyb3VuZC5cbiAgICAgKiBAcGFyYW0gYiAtIFRoZSBkZXNpcmVkIGJsdWUgY29tcG9uZW50IG9mIHRoZSB3aW5kb3cgYmFja2dyb3VuZC5cbiAgICAgKiBAcGFyYW0gYSAtIFRoZSBkZXNpcmVkIGFscGhhIGNvbXBvbmVudCBvZiB0aGUgd2luZG93IGJhY2tncm91bmQuXG4gICAgICovXG4gICAgU2V0QmFja2dyb3VuZENvbG91cihyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyLCBhOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRCYWNrZ3JvdW5kQ29sb3VyTWV0aG9kLCB7IHIsIGcsIGIsIGEgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgd2luZG93IGZyYW1lIGFuZCB0aXRsZSBiYXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZnJhbWVsZXNzIC0gV2hldGhlciB0aGUgd2luZG93IHNob3VsZCBiZSBmcmFtZWxlc3MuXG4gICAgICovXG4gICAgU2V0RnJhbWVsZXNzKGZyYW1lbGVzczogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldEZyYW1lbGVzc01ldGhvZCwgeyBmcmFtZWxlc3MgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzYWJsZXMgdGhlIHN5c3RlbSBmdWxsc2NyZWVuIGJ1dHRvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbmFibGVkIC0gV2hldGhlciB0aGUgZnVsbHNjcmVlbiBidXR0b24gc2hvdWxkIGJlIGVuYWJsZWQuXG4gICAgICovXG4gICAgU2V0RnVsbHNjcmVlbkJ1dHRvbkVuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldEZ1bGxzY3JlZW5CdXR0b25FbmFibGVkTWV0aG9kLCB7IGVuYWJsZWQgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbWF4aW11bSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gd2lkdGggLSBUaGUgZGVzaXJlZCBtYXhpbXVtIHdpZHRoIG9mIHRoZSB3aW5kb3cuXG4gICAgICogQHBhcmFtIGhlaWdodCAtIFRoZSBkZXNpcmVkIG1heGltdW0gaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgU2V0TWF4U2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNldE1heFNpemVNZXRob2QsIHsgd2lkdGgsIGhlaWdodCB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBtaW5pbXVtIHNpemUgb2YgdGhlIHdpbmRvdy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB3aWR0aCAtIFRoZSBkZXNpcmVkIG1pbmltdW0gd2lkdGggb2YgdGhlIHdpbmRvdy5cbiAgICAgKiBAcGFyYW0gaGVpZ2h0IC0gVGhlIGRlc2lyZWQgbWluaW11bSBoZWlnaHQgb2YgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBTZXRNaW5TaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0TWluU2l6ZU1ldGhvZCwgeyB3aWR0aCwgaGVpZ2h0IH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cgdG8gdGhlIHNjcmVlbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB4IC0gVGhlIGRlc2lyZWQgaG9yaXpvbnRhbCByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93LlxuICAgICAqIEBwYXJhbSB5IC0gVGhlIGRlc2lyZWQgdmVydGljYWwgcmVsYXRpdmUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBTZXRSZWxhdGl2ZVBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0UmVsYXRpdmVQb3NpdGlvbk1ldGhvZCwgeyB4LCB5IH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgd2hldGhlciB0aGUgd2luZG93IGlzIHJlc2l6YWJsZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSByZXNpemFibGUgLSBXaGV0aGVyIHRoZSB3aW5kb3cgc2hvdWxkIGJlIHJlc2l6YWJsZS5cbiAgICAgKi9cbiAgICBTZXRSZXNpemFibGUocmVzaXphYmxlOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0UmVzaXphYmxlTWV0aG9kLCB7IHJlc2l6YWJsZSB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gd2lkdGggLSBUaGUgZGVzaXJlZCB3aWR0aCBvZiB0aGUgd2luZG93LlxuICAgICAqIEBwYXJhbSBoZWlnaHQgLSBUaGUgZGVzaXJlZCBoZWlnaHQgb2YgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBTZXRTaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oU2V0U2l6ZU1ldGhvZCwgeyB3aWR0aCwgaGVpZ2h0IH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHRpdGxlIG9mIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGl0bGUgLSBUaGUgZGVzaXJlZCB0aXRsZSBvZiB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIFNldFRpdGxlKHRpdGxlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRUaXRsZU1ldGhvZCwgeyB0aXRsZSB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gem9vbSAtIFRoZSBkZXNpcmVkIHpvb20gbGV2ZWwuXG4gICAgICovXG4gICAgU2V0Wm9vbSh6b29tOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRab29tTWV0aG9kLCB7IHpvb20gfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2hvd3MgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBTaG93KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNob3dNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHNpemUgb2YgdGhlIHdpbmRvdy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHNpemUgb2YgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBTaXplKCk6IFByb21pc2U8U2l6ZT4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNpemVNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZXMgdGhlIHdpbmRvdyBiZXR3ZWVuIGZ1bGxzY3JlZW4gYW5kIG5vcm1hbC5cbiAgICAgKi9cbiAgICBUb2dnbGVGdWxsc2NyZWVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFRvZ2dsZUZ1bGxzY3JlZW5NZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZXMgdGhlIHdpbmRvdyBiZXR3ZWVuIG1heGltaXNlZCBhbmQgbm9ybWFsLlxuICAgICAqL1xuICAgIFRvZ2dsZU1heGltaXNlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFRvZ2dsZU1heGltaXNlTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBmcmFtZWxlc3MgYW5kIG5vcm1hbC5cbiAgICAgKi9cbiAgICBUb2dnbGVGcmFtZWxlc3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oVG9nZ2xlRnJhbWVsZXNzTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVbi1mdWxsc2NyZWVucyB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIFVuRnVsbHNjcmVlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShVbkZ1bGxzY3JlZW5NZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVuLW1heGltaXNlcyB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIFVuTWF4aW1pc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oVW5NYXhpbWlzZU1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW4tbWluaW1pc2VzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgVW5NaW5pbWlzZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShVbk1pbmltaXNlTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB3aWR0aCBvZiB0aGUgd2luZG93LlxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIGN1cnJlbnQgd2lkdGggb2YgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBXaWR0aCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFdpZHRoTWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBab29tcyB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIFpvb20oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oWm9vbU1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5jcmVhc2VzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gICAgICovXG4gICAgWm9vbUluKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFpvb21Jbk1ldGhvZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVjcmVhc2VzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gICAgICovXG4gICAgWm9vbU91dCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShab29tT3V0TWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdlYnZpZXcgY29udGVudC5cbiAgICAgKi9cbiAgICBab29tUmVzZXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oWm9vbVJlc2V0TWV0aG9kKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIGZpbGUgZHJvcHMgb3JpZ2luYXRpbmcgZnJvbSBwbGF0Zm9ybS1zcGVjaWZpYyBjb2RlIChlLmcuLCBtYWNPUy9MaW51eCBuYXRpdmUgZHJhZy1hbmQtZHJvcCkuXG4gICAgICogR2F0aGVycyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZHJvcCB0YXJnZXQgZWxlbWVudCBhbmQgc2VuZHMgaXQgYmFjayB0byB0aGUgR28gYmFja2VuZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWxlbmFtZXMgLSBBbiBhcnJheSBvZiBmaWxlIHBhdGhzIChzdHJpbmdzKSB0aGF0IHdlcmUgZHJvcHBlZC5cbiAgICAgKiBAcGFyYW0geCAtIFRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIGRyb3AgZXZlbnQsIGluIGxvZ2ljYWwgKENTUykgcGl4ZWxzIHJlbGF0aXZlIHRvIHRoZSB3ZWJ2aWV3LlxuICAgICAqIEBwYXJhbSB5IC0gVGhlIHktY29vcmRpbmF0ZSBvZiB0aGUgZHJvcCBldmVudCwgaW4gbG9naWNhbCAoQ1NTKSBwaXhlbHMgcmVsYXRpdmUgdG8gdGhlIHdlYnZpZXcuXG4gICAgICovXG4gICAgSGFuZGxlUGxhdGZvcm1GaWxlRHJvcChmaWxlbmFtZXM6IHN0cmluZ1tdLCB4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xuICAgICAgICAvLyBDaGVjayBpZiBmaWxlIGRyb3BzIGFyZSBlbmFibGVkIGZvciB0aGlzIHdpbmRvd1xuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl9iYWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBGaWxlIGRyb3BzIGRpc2FibGVkLCBpZ25vcmUgdGhlIGRyb3BcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgICAgIGNvbnN0IGRyb3BUYXJnZXQgPSBnZXREcm9wVGFyZ2V0RWxlbWVudChlbGVtZW50KTtcblxuICAgICAgICBpZiAoIWRyb3BUYXJnZXQpIHtcbiAgICAgICAgICAgIC8vIERyb3Agd2FzIG5vdCBvbiBhIGRlc2lnbmF0ZWQgZHJvcCB0YXJnZXQgLSBpZ25vcmVcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVsZW1lbnREZXRhaWxzID0ge1xuICAgICAgICAgICAgaWQ6IGRyb3BUYXJnZXQuaWQsXG4gICAgICAgICAgICBjbGFzc0xpc3Q6IEFycmF5LmZyb20oZHJvcFRhcmdldC5jbGFzc0xpc3QpLFxuICAgICAgICAgICAgYXR0cmlidXRlczoge30gYXMgeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSxcbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkcm9wVGFyZ2V0LmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSBkcm9wVGFyZ2V0LmF0dHJpYnV0ZXNbaV07XG4gICAgICAgICAgICBlbGVtZW50RGV0YWlscy5hdHRyaWJ1dGVzW2F0dHIubmFtZV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgICAgIGZpbGVuYW1lcyxcbiAgICAgICAgICAgIHgsXG4gICAgICAgICAgICB5LFxuICAgICAgICAgICAgZWxlbWVudERldGFpbHMsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpc1tjYWxsZXJTeW1dKEZpbGVzRHJvcHBlZCwgcGF5bG9hZCk7XG4gICAgICAgIFxuICAgICAgICAvLyBDbGVhbiB1cCBuYXRpdmUgZHJhZyBzdGF0ZSBhZnRlciBkcm9wXG4gICAgICAgIGNsZWFudXBOYXRpdmVEcmFnKCk7XG4gICAgfVxuICBcbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0aGUgd2luZG93IHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNwZWNpZmllZCBzY3JlZW4ncyB3b3JrIGFyZWEuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2NyZWVuSUQgLSBUaGUgSUQgb2YgdGhlIHRhcmdldCBzY3JlZW4uXG4gICAgICovXG4gICAgU2V0U2NyZWVuKHNjcmVlbklEOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXNbY2FsbGVyU3ltXShTZXRTY3JlZW5NZXRob2QsIHsgc2NyZWVuSUQgfSk7XG4gICAgfVxuXG4gICAgLyogVHJpZ2dlcnMgV2luZG93cyAxMSBTbmFwIEFzc2lzdCBmZWF0dXJlIChXaW5kb3dzIG9ubHkpLlxuICAgICAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byBwcmVzc2luZyBXaW4rWiBhbmQgc2hvd3Mgc25hcCBsYXlvdXQgb3B0aW9ucy5cbiAgICAgKi9cbiAgICBTbmFwQXNzaXN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpc1tjYWxsZXJTeW1dKFNuYXBBc3Npc3RNZXRob2QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9wZW5zIHRoZSBwcmludCBkaWFsb2cgZm9yIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgUHJpbnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzW2NhbGxlclN5bV0oUHJpbnRNZXRob2QpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUaGUgd2luZG93IHdpdGhpbiB3aGljaCB0aGUgc2NyaXB0IGlzIHJ1bm5pbmcuXG4gKi9cbmNvbnN0IHRoaXNXaW5kb3cgPSBuZXcgV2luZG93KCcnKTtcblxuLyoqXG4gKiBTZXRzIHVwIGdsb2JhbCBkcmFnIGFuZCBkcm9wIGV2ZW50IGxpc3RlbmVycyBmb3IgZmlsZSBkcm9wcy5cbiAqIEhhbmRsZXMgdmlzdWFsIGZlZWRiYWNrIChob3ZlciBzdGF0ZSkgYW5kIGZpbGUgZHJvcCBwcm9jZXNzaW5nLlxuICovXG5mdW5jdGlvbiBzZXR1cERyb3BUYXJnZXRMaXN0ZW5lcnMoKSB7XG4gICAgY29uc3QgZG9jRWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICBsZXQgZHJhZ0VudGVyQ291bnRlciA9IDA7XG5cbiAgICBkb2NFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoIWV2ZW50LmRhdGFUcmFuc2Zlcj8udHlwZXMuaW5jbHVkZXMoJ0ZpbGVzJykpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gT25seSBoYW5kbGUgZmlsZSBkcmFncywgbGV0IG90aGVyIGRyYWdzIHBhc3MgdGhyb3VnaFxuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IC8vIEFsd2F5cyBwcmV2ZW50IGRlZmF1bHQgdG8gc3RvcCBicm93c2VyIG5hdmlnYXRpb25cbiAgICAgICAgLy8gT24gV2luZG93cywgY2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fYmFpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ25vbmUnOyAvLyBTaG93IFwibm8gZHJvcFwiIGN1cnNvclxuICAgICAgICAgICAgcmV0dXJuOyAvLyBGaWxlIGRyb3BzIGRpc2FibGVkLCBkb24ndCBzaG93IGhvdmVyIGVmZmVjdHNcbiAgICAgICAgfVxuICAgICAgICBkcmFnRW50ZXJDb3VudGVyKys7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB0YXJnZXRFbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgICAgICAgY29uc3QgZHJvcFRhcmdldCA9IGdldERyb3BUYXJnZXRFbGVtZW50KHRhcmdldEVsZW1lbnQpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBob3ZlciBzdGF0ZVxuICAgICAgICBpZiAoY3VycmVudERyb3BUYXJnZXQgJiYgY3VycmVudERyb3BUYXJnZXQgIT09IGRyb3BUYXJnZXQpIHtcbiAgICAgICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkcm9wVGFyZ2V0KSB7XG4gICAgICAgICAgICBkcm9wVGFyZ2V0LmNsYXNzTGlzdC5hZGQoRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTKTtcbiAgICAgICAgICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknO1xuICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQgPSBkcm9wVGFyZ2V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbm9uZSc7XG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9LCBmYWxzZSk7XG5cbiAgICBkb2NFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghZXZlbnQuZGF0YVRyYW5zZmVyPy50eXBlcy5pbmNsdWRlcygnRmlsZXMnKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBPbmx5IGhhbmRsZSBmaWxlIGRyYWdzXG4gICAgICAgIH1cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgLy8gQWx3YXlzIHByZXZlbnQgZGVmYXVsdCB0byBzdG9wIGJyb3dzZXIgbmF2aWdhdGlvblxuICAgICAgICAvLyBPbiBXaW5kb3dzLCBjaGVjayBpZiBmaWxlIGRyb3BzIGFyZSBlbmFibGVkIGZvciB0aGlzIHdpbmRvd1xuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl9iYWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSBmYWxzZSkge1xuICAgICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbm9uZSc7IC8vIFNob3cgXCJubyBkcm9wXCIgY3Vyc29yXG4gICAgICAgICAgICByZXR1cm47IC8vIEZpbGUgZHJvcHMgZGlzYWJsZWQsIGRvbid0IHNob3cgaG92ZXIgZWZmZWN0c1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBVcGRhdGUgZHJvcCB0YXJnZXQgYXMgY3Vyc29yIG1vdmVzXG4gICAgICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICAgICAgICBjb25zdCBkcm9wVGFyZ2V0ID0gZ2V0RHJvcFRhcmdldEVsZW1lbnQodGFyZ2V0RWxlbWVudCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoY3VycmVudERyb3BUYXJnZXQgJiYgY3VycmVudERyb3BUYXJnZXQgIT09IGRyb3BUYXJnZXQpIHtcbiAgICAgICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKGRyb3BUYXJnZXQpIHtcbiAgICAgICAgICAgIGlmICghZHJvcFRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoRFJPUF9UQVJHRVRfQUNUSVZFX0NMQVNTKSkge1xuICAgICAgICAgICAgICAgIGRyb3BUYXJnZXQuY2xhc3NMaXN0LmFkZChEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnY29weSc7XG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IGRyb3BUYXJnZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBldmVudC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdub25lJztcbiAgICAgICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0sIGZhbHNlKTtcblxuICAgIGRvY0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2xlYXZlJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghZXZlbnQuZGF0YVRyYW5zZmVyPy50eXBlcy5pbmNsdWRlcygnRmlsZXMnKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IC8vIEFsd2F5cyBwcmV2ZW50IGRlZmF1bHQgdG8gc3RvcCBicm93c2VyIG5hdmlnYXRpb25cbiAgICAgICAgLy8gT24gV2luZG93cywgY2hlY2sgaWYgZmlsZSBkcm9wcyBhcmUgZW5hYmxlZCBmb3IgdGhpcyB3aW5kb3dcbiAgICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KS5fYmFpbHM/LmZsYWdzPy5lbmFibGVGaWxlRHJvcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gT24gTGludXgvV2ViS2l0R1RLIGFuZCBtYWNPUywgZHJhZ2xlYXZlIGZpcmVzIGltbWVkaWF0ZWx5IHdpdGggcmVsYXRlZFRhcmdldD1udWxsIHdoZW4gbmF0aXZlXG4gICAgICAgIC8vIGRyYWcgaGFuZGxpbmcgaXMgaW52b2x2ZWQuIElnbm9yZSB0aGVzZSBzcHVyaW91cyBldmVudHMgLSB3ZSdsbCBjbGVhbiB1cCBvbiBkcm9wIGluc3RlYWQuXG4gICAgICAgIGlmIChldmVudC5yZWxhdGVkVGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRyYWdFbnRlckNvdW50ZXItLTtcbiAgICAgICAgXG4gICAgICAgIGlmIChkcmFnRW50ZXJDb3VudGVyID09PSAwIHx8IFxuICAgICAgICAgICAgKGN1cnJlbnREcm9wVGFyZ2V0ICYmICFjdXJyZW50RHJvcFRhcmdldC5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0IGFzIE5vZGUpKSkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnREcm9wVGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgY3VycmVudERyb3BUYXJnZXQuY2xhc3NMaXN0LnJlbW92ZShEUk9QX1RBUkdFVF9BQ1RJVkVfQ0xBU1MpO1xuICAgICAgICAgICAgICAgIGN1cnJlbnREcm9wVGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRyYWdFbnRlckNvdW50ZXIgPSAwO1xuICAgICAgICB9XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgZG9jRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghZXZlbnQuZGF0YVRyYW5zZmVyPy50eXBlcy5pbmNsdWRlcygnRmlsZXMnKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBPbmx5IGhhbmRsZSBmaWxlIGRyb3BzXG4gICAgICAgIH1cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgLy8gQWx3YXlzIHByZXZlbnQgZGVmYXVsdCB0byBzdG9wIGJyb3dzZXIgbmF2aWdhdGlvblxuICAgICAgICAvLyBPbiBXaW5kb3dzLCBjaGVjayBpZiBmaWxlIGRyb3BzIGFyZSBlbmFibGVkIGZvciB0aGlzIHdpbmRvd1xuICAgICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLl9iYWlscz8uZmxhZ3M/LmVuYWJsZUZpbGVEcm9wID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRyYWdFbnRlckNvdW50ZXIgPSAwO1xuICAgICAgICBcbiAgICAgICAgaWYgKGN1cnJlbnREcm9wVGFyZ2V0KSB7XG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKERST1BfVEFSR0VUX0FDVElWRV9DTEFTUyk7XG4gICAgICAgICAgICBjdXJyZW50RHJvcFRhcmdldCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbiBXaW5kb3dzLCBoYW5kbGUgZmlsZSBkcm9wcyB2aWEgSmF2YVNjcmlwdFxuICAgICAgICAvLyBPbiBtYWNPUy9MaW51eCwgbmF0aXZlIGNvZGUgd2lsbCBjYWxsIEhhbmRsZVBsYXRmb3JtRmlsZURyb3BcbiAgICAgICAgaWYgKGNhblJlc29sdmVGaWxlUGF0aHMoKSkge1xuICAgICAgICAgICAgY29uc3QgZmlsZXM6IEZpbGVbXSA9IFtdO1xuICAgICAgICAgICAgaWYgKGV2ZW50LmRhdGFUcmFuc2Zlci5pdGVtcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBldmVudC5kYXRhVHJhbnNmZXIuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ua2luZCA9PT0gJ2ZpbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gaXRlbS5nZXRBc0ZpbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlKSBmaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5kYXRhVHJhbnNmZXIuZmlsZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmVGaWxlUGF0aHMoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgZmlsZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwgZmFsc2UpO1xufVxuXG4vLyBJbml0aWFsaXplIGxpc3RlbmVycyB3aGVuIHRoZSBzY3JpcHQgbG9hZHNcbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHNldHVwRHJvcFRhcmdldExpc3RlbmVycygpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0aGlzV2luZG93O1xuIiwiLypcbiBfICAgICBfXyAgICAgXyBfX1xufCB8ICAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbmltcG9ydCB7IE9wZW5VUkwgfSBmcm9tIFwiLi9icm93c2VyLmpzXCI7XG5pbXBvcnQgeyBRdWVzdGlvbiB9IGZyb20gXCIuL2RpYWxvZ3MuanNcIjtcbmltcG9ydCB7IEVtaXQgfSBmcm9tIFwiLi9ldmVudHMuanNcIjtcbmltcG9ydCB7IGNhbkFib3J0TGlzdGVuZXJzLCB3aGVuUmVhZHkgfSBmcm9tIFwiLi91dGlscy5qc1wiO1xuaW1wb3J0IFdpbmRvdyBmcm9tIFwiLi93aW5kb3cuanNcIjtcblxuLyoqXG4gKiBTZW5kcyBhbiBldmVudCB3aXRoIHRoZSBnaXZlbiBuYW1lIGFuZCBvcHRpb25hbCBkYXRhLlxuICpcbiAqIEBwYXJhbSBldmVudE5hbWUgLSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byBzZW5kLlxuICogQHBhcmFtIFtkYXRhPW51bGxdIC0gLSBPcHRpb25hbCBkYXRhIHRvIHNlbmQgYWxvbmcgd2l0aCB0aGUgZXZlbnQuXG4gKi9cbmZ1bmN0aW9uIHNlbmRFdmVudChldmVudE5hbWU6IHN0cmluZywgZGF0YTogYW55ID0gbnVsbCk6IHZvaWQge1xuICAgIEVtaXQoZXZlbnROYW1lLCBkYXRhKTtcbn1cblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvbiBhIHNwZWNpZmllZCB3aW5kb3cuXG4gKlxuICogQHBhcmFtIHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93IHRvIGNhbGwgdGhlIG1ldGhvZCBvbi5cbiAqIEBwYXJhbSBtZXRob2ROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxuICovXG5mdW5jdGlvbiBjYWxsV2luZG93TWV0aG9kKHdpbmRvd05hbWU6IHN0cmluZywgbWV0aG9kTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgdGFyZ2V0V2luZG93ID0gV2luZG93LkdldCh3aW5kb3dOYW1lKTtcbiAgICBjb25zdCBtZXRob2QgPSAodGFyZ2V0V2luZG93IGFzIGFueSlbbWV0aG9kTmFtZV07XG5cbiAgICBpZiAodHlwZW9mIG1ldGhvZCAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFdpbmRvdyBtZXRob2QgJyR7bWV0aG9kTmFtZX0nIG5vdCBmb3VuZGApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgbWV0aG9kLmNhbGwodGFyZ2V0V2luZG93KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGNhbGxpbmcgd2luZG93IG1ldGhvZCAnJHttZXRob2ROYW1lfSc6IGAsIGUpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZXNwb25kcyB0byBhIHRyaWdnZXJpbmcgZXZlbnQgYnkgcnVubmluZyBhcHByb3ByaWF0ZSBXTUwgYWN0aW9ucyBmb3IgdGhlIGN1cnJlbnQgdGFyZ2V0LlxuICovXG5mdW5jdGlvbiBvbldNTFRyaWdnZXJlZChldjogRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZXYuY3VycmVudFRhcmdldCBhcyBFbGVtZW50O1xuXG4gICAgZnVuY3Rpb24gcnVuRWZmZWN0KGNob2ljZSA9IFwiWWVzXCIpIHtcbiAgICAgICAgaWYgKGNob2ljZSAhPT0gXCJZZXNcIilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBjb25zdCBldmVudFR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLWV2ZW50JykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd21sLWV2ZW50Jyk7XG4gICAgICAgIGNvbnN0IHRhcmdldFdpbmRvdyA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtdGFyZ2V0LXdpbmRvdycpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXdtbC10YXJnZXQtd2luZG93JykgfHwgXCJcIjtcbiAgICAgICAgY29uc3Qgd2luZG93TWV0aG9kID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC13aW5kb3cnKSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS13bWwtd2luZG93Jyk7XG4gICAgICAgIGNvbnN0IHVybCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtb3BlbnVybCcpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXdtbC1vcGVudXJsJyk7XG5cbiAgICAgICAgaWYgKGV2ZW50VHlwZSAhPT0gbnVsbClcbiAgICAgICAgICAgIHNlbmRFdmVudChldmVudFR5cGUpO1xuICAgICAgICBpZiAod2luZG93TWV0aG9kICE9PSBudWxsKVxuICAgICAgICAgICAgY2FsbFdpbmRvd01ldGhvZCh0YXJnZXRXaW5kb3csIHdpbmRvd01ldGhvZCk7XG4gICAgICAgIGlmICh1cmwgIT09IG51bGwpXG4gICAgICAgICAgICB2b2lkIE9wZW5VUkwodXJsKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25maXJtID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1jb25maXJtJykgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd21sLWNvbmZpcm0nKTtcblxuICAgIGlmIChjb25maXJtKSB7XG4gICAgICAgIFF1ZXN0aW9uKHtcbiAgICAgICAgICAgIFRpdGxlOiBcIkNvbmZpcm1cIixcbiAgICAgICAgICAgIE1lc3NhZ2U6IGNvbmZpcm0sXG4gICAgICAgICAgICBEZXRhY2hlZDogZmFsc2UsXG4gICAgICAgICAgICBCdXR0b25zOiBbXG4gICAgICAgICAgICAgICAgeyBMYWJlbDogXCJZZXNcIiB9LFxuICAgICAgICAgICAgICAgIHsgTGFiZWw6IFwiTm9cIiwgSXNEZWZhdWx0OiB0cnVlIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSkudGhlbihydW5FZmZlY3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJ1bkVmZmVjdCgpO1xuICAgIH1cbn1cblxuLy8gUHJpdmF0ZSBmaWVsZCBuYW1lcy5cbmNvbnN0IGNvbnRyb2xsZXJTeW0gPSBTeW1ib2woXCJjb250cm9sbGVyXCIpO1xuY29uc3QgdHJpZ2dlck1hcFN5bSA9IFN5bWJvbChcInRyaWdnZXJNYXBcIik7XG5jb25zdCBlbGVtZW50Q291bnRTeW0gPSBTeW1ib2woXCJlbGVtZW50Q291bnRcIik7XG5cbi8qKlxuICogQWJvcnRDb250cm9sbGVyUmVnaXN0cnkgZG9lcyBub3QgYWN0dWFsbHkgcmVtZW1iZXIgYWN0aXZlIGV2ZW50IGxpc3RlbmVyczogaW5zdGVhZFxuICogaXQgdGllcyB0aGVtIHRvIGFuIEFib3J0U2lnbmFsIGFuZCB1c2VzIGFuIEFib3J0Q29udHJvbGxlciB0byByZW1vdmUgdGhlbSBhbGwgYXQgb25jZS5cbiAqL1xuY2xhc3MgQWJvcnRDb250cm9sbGVyUmVnaXN0cnkge1xuICAgIC8vIFByaXZhdGUgZmllbGRzLlxuICAgIFtjb250cm9sbGVyU3ltXTogQWJvcnRDb250cm9sbGVyO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXNbY29udHJvbGxlclN5bV0gPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBvcHRpb25zIG9iamVjdCBmb3IgYWRkRXZlbnRMaXN0ZW5lciB0aGF0IHRpZXMgdGhlIGxpc3RlbmVyXG4gICAgICogdG8gdGhlIEFib3J0U2lnbmFsIGZyb20gdGhlIGN1cnJlbnQgQWJvcnRDb250cm9sbGVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBBbiBIVE1MIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gdHJpZ2dlcnMgLSBUaGUgbGlzdCBvZiBhY3RpdmUgV01MIHRyaWdnZXIgZXZlbnRzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnRzXG4gICAgICovXG4gICAgc2V0KGVsZW1lbnQ6IEVsZW1lbnQsIHRyaWdnZXJzOiBzdHJpbmdbXSk6IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zIHtcbiAgICAgICAgcmV0dXJuIHsgc2lnbmFsOiB0aGlzW2NvbnRyb2xsZXJTeW1dLnNpZ25hbCB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzIGFuZCByZXNldHMgdGhlIHJlZ2lzdHJ5LlxuICAgICAqL1xuICAgIHJlc2V0KCk6IHZvaWQge1xuICAgICAgICB0aGlzW2NvbnRyb2xsZXJTeW1dLmFib3J0KCk7XG4gICAgICAgIHRoaXNbY29udHJvbGxlclN5bV0gPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgfVxufVxuXG4vKipcbiAqIFdlYWtNYXBSZWdpc3RyeSBtYXBzIGFjdGl2ZSB0cmlnZ2VyIGV2ZW50cyB0byBlYWNoIERPTSBlbGVtZW50IHRocm91Z2ggYSBXZWFrTWFwLlxuICogVGhpcyBlbnN1cmVzIHRoYXQgdGhlIG1hcHBpbmcgcmVtYWlucyBwcml2YXRlIHRvIHRoaXMgbW9kdWxlLCB3aGlsZSBzdGlsbCBhbGxvd2luZyBnYXJiYWdlXG4gKiBjb2xsZWN0aW9uIG9mIHRoZSBpbnZvbHZlZCBlbGVtZW50cy5cbiAqL1xuY2xhc3MgV2Vha01hcFJlZ2lzdHJ5IHtcbiAgICAvKiogU3RvcmVzIHRoZSBjdXJyZW50IGVsZW1lbnQtdG8tdHJpZ2dlciBtYXBwaW5nLiAqL1xuICAgIFt0cmlnZ2VyTWFwU3ltXTogV2Vha01hcDxFbGVtZW50LCBzdHJpbmdbXT47XG4gICAgLyoqIENvdW50cyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHdpdGggYWN0aXZlIFdNTCB0cmlnZ2Vycy4gKi9cbiAgICBbZWxlbWVudENvdW50U3ltXTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXNbdHJpZ2dlck1hcFN5bV0gPSBuZXcgV2Vha01hcCgpO1xuICAgICAgICB0aGlzW2VsZW1lbnRDb3VudFN5bV0gPSAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgYWN0aXZlIHRyaWdnZXJzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIEFuIEhUTUwgZWxlbWVudFxuICAgICAqIEBwYXJhbSB0cmlnZ2VycyAtIFRoZSBsaXN0IG9mIGFjdGl2ZSBXTUwgdHJpZ2dlciBldmVudHMgZm9yIHRoZSBzcGVjaWZpZWQgZWxlbWVudFxuICAgICAqL1xuICAgIHNldChlbGVtZW50OiBFbGVtZW50LCB0cmlnZ2Vyczogc3RyaW5nW10pOiBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyB7XG4gICAgICAgIGlmICghdGhpc1t0cmlnZ2VyTWFwU3ltXS5oYXMoZWxlbWVudCkpIHsgdGhpc1tlbGVtZW50Q291bnRTeW1dKys7IH1cbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwU3ltXS5zZXQoZWxlbWVudCwgdHJpZ2dlcnMpO1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICovXG4gICAgcmVzZXQoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzW2VsZW1lbnRDb3VudFN5bV0gPD0gMClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yQWxsKCcqJykpIHtcbiAgICAgICAgICAgIGlmICh0aGlzW2VsZW1lbnRDb3VudFN5bV0gPD0gMClcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY29uc3QgdHJpZ2dlcnMgPSB0aGlzW3RyaWdnZXJNYXBTeW1dLmdldChlbGVtZW50KTtcbiAgICAgICAgICAgIGlmICh0cmlnZ2VycyAhPSBudWxsKSB7IHRoaXNbZWxlbWVudENvdW50U3ltXS0tOyB9XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycyB8fCBbXSlcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodHJpZ2dlciwgb25XTUxUcmlnZ2VyZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwU3ltXSA9IG5ldyBXZWFrTWFwKCk7XG4gICAgICAgIHRoaXNbZWxlbWVudENvdW50U3ltXSA9IDA7XG4gICAgfVxufVxuXG5jb25zdCB0cmlnZ2VyUmVnaXN0cnkgPSBjYW5BYm9ydExpc3RlbmVycygpID8gbmV3IEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5KCkgOiBuZXcgV2Vha01hcFJlZ2lzdHJ5KCk7XG5cbi8qKlxuICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhZGRXTUxMaXN0ZW5lcnMoZWxlbWVudDogRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IHRyaWdnZXJSZWdFeHAgPSAvXFxTKy9nO1xuICAgIGNvbnN0IHRyaWdnZXJBdHRyID0gKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtdHJpZ2dlcicpIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXdtbC10cmlnZ2VyJykgfHwgXCJjbGlja1wiKTtcbiAgICBjb25zdCB0cmlnZ2Vyczogc3RyaW5nW10gPSBbXTtcblxuICAgIGxldCBtYXRjaDtcbiAgICB3aGlsZSAoKG1hdGNoID0gdHJpZ2dlclJlZ0V4cC5leGVjKHRyaWdnZXJBdHRyKSkgIT09IG51bGwpXG4gICAgICAgIHRyaWdnZXJzLnB1c2gobWF0Y2hbMF0pO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRyaWdnZXJSZWdpc3RyeS5zZXQoZWxlbWVudCwgdHJpZ2dlcnMpO1xuICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycylcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRyaWdnZXIsIG9uV01MVHJpZ2dlcmVkLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZXMgYW4gYXV0b21hdGljIHJlbG9hZCBvZiBXTUwgdG8gYmUgcGVyZm9ybWVkIGFzIHNvb24gYXMgdGhlIGRvY3VtZW50IGlzIGZ1bGx5IGxvYWRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVuYWJsZSgpOiB2b2lkIHtcbiAgICB3aGVuUmVhZHkoUmVsb2FkKTtcbn1cblxuLyoqXG4gKiBSZWxvYWRzIHRoZSBXTUwgcGFnZSBieSBhZGRpbmcgbmVjZXNzYXJ5IGV2ZW50IGxpc3RlbmVycyBhbmQgYnJvd3NlciBsaXN0ZW5lcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxvYWQoKTogdm9pZCB7XG4gICAgdHJpZ2dlclJlZ2lzdHJ5LnJlc2V0KCk7XG4gICAgZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbd21sLWV2ZW50XSwgW3dtbC13aW5kb3ddLCBbd21sLW9wZW51cmxdLCBbZGF0YS13bWwtZXZlbnRdLCBbZGF0YS13bWwtd2luZG93XSwgW2RhdGEtd21sLW9wZW51cmxdJykuZm9yRWFjaChhZGRXTUxMaXN0ZW5lcnMpO1xufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qKlxuICogR29TdHJlYW0g4oCUIHRoZSBXZWJTb2NrZXQgcHJvZ3JhbW1pbmcgbW9kZWwgd2l0aG91dCBhIGxpc3RlbmluZyBzb2NrZXQuXG4gKlxuICogQSBXZWJTb2NrZXQgY2Fubm90IGJlIHNwb2tlbiBvdmVyIGEgY3VzdG9tIFVSTCBzY2hlbWUsIHNvIGdldHRpbmcgb25lIGluc2lkZVxuICogYSB3ZWJ2aWV3IG1lYW5zIGJpbmRpbmcgYSByZWFsIFRDUCBwb3J0LiBUaGlzIHNwZWFrcyB0aGUgc2FtZSBzaGFwZSBvdmVyIHRoZVxuICogYXNzZXQgc2VydmVyIHRoZSBhcHAgYWxyZWFkeSBzZXJ2ZXM6IEdv4oaSSlMgb3ZlciBvbmUgaGVsZCBwb2xsIHBlciBwYWdlLCBKU+KGkkdvXG4gKiBvdmVyIGEgbm9ybWFsIFBPU1QuXG4gKlxuICoge0BsaW5rIFN0cmVhbX0gcmV0dXJucyBzeW5jaHJvbm91c2x5IHdpdGggYHJlYWR5U3RhdGUgPT09IENPTk5FQ1RJTkdgLCB0aGUgd2F5XG4gKiBgbmV3IFdlYlNvY2tldCh1cmwpYCBkb2VzLCBzbyBhIGNvbm5lY3Rpb24gY2FuIGJlIGNyZWF0ZWQgYXQgbW9kdWxlIHNjb3BlOlxuICpcbiAqIGBgYGpzXG4gKiBleHBvcnQgY29uc3QgVGVsZW1ldHJ5ID0gU3RyZWFtKFwidGVsZW1ldHJ5XCIpOyAgIC8vIGNvbm5lY3RzIGluIHRoZSBiYWNrZ3JvdW5kXG4gKiBgYGBcbiAqL1xuXG5pbXBvcnQgeyBuYW5vaWQgfSBmcm9tIFwiLi9uYW5vaWQuanNcIjtcbmltcG9ydCB7IGhhc0RPTSB9IGZyb20gXCIuL2Vudmlyb25tZW50LmpzXCI7XG5cbi8vIEV2ZXJ5IHBpZWNlIG9mIHN0YXRlIHRoYXQgdHdvIHJ1bnRpbWUgaW5zdGFuY2VzIG11c3QgYWdyZWUgb24gbGl2ZXMgaGVyZSwgb25cbi8vIHdpbmRvdywgbm90IGluIG1vZHVsZSBzY29wZS4gVGhlIHJ1bnRpbWUgY2FuIGJlIGV2YWx1YXRlZCBtb3JlIHRoYW4gb25jZSBpbiBhXG4vLyBwYWdlIOKAlCB0aGUgcGxhdGZvcm0gaW5qZWN0cyBhIGNvcHkgYW5kIGFuIGFwcCBtYXkgaW1wb3J0IGl0IHRvbyDigJQgYW5kIGFcbi8vIHBlci1tb2R1bGUgcmVnaXN0cnkgbWVhbnQgYm90aCBpbnN0YW5jZXMgYWxsb2NhdGVkIGNvbm5lY3Rpb24gaWQgMSwgcmFuXG4vLyBjb21wZXRpbmcgcG9sbHMgYWdhaW5zdCBvbmUgc2Vzc2lvbiwgYW5kIGRpc2NhcmRlZCBmcmFtZXMgYWRkcmVzc2VkIHRvIGlkc1xuLy8gb25seSB0aGUgb3RoZXIgaW5zdGFuY2Uga25ldyBhYm91dC4gVGhlIHNlc3Npb24gaWQgYWxvbmUgd2FzIG5vdCBlbm91Z2guXG5pbnRlcmZhY2UgU3RyZWFtR2xvYmFscyB7XG4gICAgc2Vzc2lvbjogc3RyaW5nO1xuICAgIGdlbmVyYXRpb246IG51bWJlcjtcbiAgICBuZXh0Q29ubklEOiBudW1iZXI7XG4gICAgY29ubmVjdGlvbnM6IE1hcDxudW1iZXIsIEJhaWxzU29ja2V0PjtcbiAgICBwb2xsaW5nOiBib29sZWFuO1xuICAgIHBvbGxBYm9ydD86IEFib3J0Q29udHJvbGxlcjtcbn1cblxuY29uc3QgR0VORVJBVElPTl9LRVkgPSBcIl9fYmFpbHNfc3RyZWFtX2dlbmVyYXRpb25cIjtcbmNvbnN0IEdFTkVSQVRJT05fTkFNRV9NQVJLRVIgPSBcIlxcdTAwMWZfX2JhaWxzX3N0cmVhbV9nZW5lcmF0aW9uX186XCI7XG5cbi8vIHdpbmRvdy5uYW1lIGJlbG9uZ3MgdG8gdGhlIGJyb3dzaW5nIGNvbnRleHQgcmF0aGVyIHRoYW4gdGhlIERvY3VtZW50LCBzbyBpdFxuLy8gc3Vydml2ZXMgYSByZWxvYWQgZXZlbiB3aGVuIFdlYiBTdG9yYWdlIGlzIGRpc2FibGVkLiBQcmVzZXJ2ZSBhbnkgbmFtZSB0aGVcbi8vIGFwcGxpY2F0aW9uIGFzc2lnbmVkIGFuZCByZXNlcnZlIG9ubHkgYSBzdWZmaXggZm9yIHRoZSBTdHJlYW0gZ2VuZXJhdGlvbi5cbmZ1bmN0aW9uIG5hbWVkUGFnZUdlbmVyYXRpb24oKTogbnVtYmVyIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBtYXJrZXIgPSB3aW5kb3cubmFtZS5sYXN0SW5kZXhPZihHRU5FUkFUSU9OX05BTUVfTUFSS0VSKTtcbiAgICAgICAgaWYgKG1hcmtlciA8IDApIHJldHVybiAwO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IE51bWJlcih3aW5kb3cubmFtZS5zbGljZShtYXJrZXIgKyBHRU5FUkFUSU9OX05BTUVfTUFSS0VSLmxlbmd0aCkpO1xuICAgICAgICByZXR1cm4gTnVtYmVyLmlzU2FmZUludGVnZXIodmFsdWUpICYmIHZhbHVlID4gMCA/IHZhbHVlIDogMDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW1lbWJlck5hbWVkUGFnZUdlbmVyYXRpb24oZ2VuZXJhdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWFya2VyID0gd2luZG93Lm5hbWUubGFzdEluZGV4T2YoR0VORVJBVElPTl9OQU1FX01BUktFUik7XG4gICAgICAgIGNvbnN0IGFwcGxpY2F0aW9uTmFtZSA9IG1hcmtlciA8IDAgPyB3aW5kb3cubmFtZSA6IHdpbmRvdy5uYW1lLnNsaWNlKDAsIG1hcmtlcik7XG4gICAgICAgIHdpbmRvdy5uYW1lID0gYXBwbGljYXRpb25OYW1lICsgR0VORVJBVElPTl9OQU1FX01BUktFUiArIGdlbmVyYXRpb247XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIFNvbWUgZW1iZWRkZWQgYnJvd3NlciBwb2xpY2llcyBjYW4gZGVueSBhY2Nlc3MgdG8gdGhlIGJyb3dzaW5nXG4gICAgICAgIC8vIGNvbnRleHQgbmFtZS4gVGhlIHRpbWUgb3JpZ2luIHJlbWFpbnMgdGhlIGxhc3QtcmVzb3J0IGZhbGxiYWNrLlxuICAgIH1cbn1cblxuLy8gUmVxdWVzdCBhcnJpdmFsIG9yZGVyIGlzIG5vdCBwYWdlIG9yZGVyOiBhIHJlcXVlc3Qgc3RhcnRlZCBqdXN0IGJlZm9yZSBhXG4vLyBuYXZpZ2F0aW9uIGNhbiByZWFjaCBHbyBhZnRlciB0aGUgcmVwbGFjZW1lbnQgcGFnZSdzIGZpcnN0IHJlcXVlc3QuIEtlZXAgYVxuLy8gbW9ub3RvbmljIGNvdW50ZXIgaW4gdGhpcyB0b3AtbGV2ZWwgYnJvd3NpbmcgY29udGV4dCBzbyBHbyBjYW4gZGlzdGluZ3Vpc2hcbi8vIHRob3NlIHBhZ2UgaW5jYXJuYXRpb25zIHdpdGhvdXQgdHJ1c3Rpbmcgc2VydmVyIHNjaGVkdWxpbmcgb3JkZXIuXG5mdW5jdGlvbiBuZXh0UGFnZUdlbmVyYXRpb24oKTogbnVtYmVyIHtcbiAgICBpZiAoIWhhc0RPTSkgcmV0dXJuIDE7XG4gICAgLy8gQW5jaG9yIHRoZSB2YWx1ZSB0byB0aGUgcGFnZSdzIGNyZWF0aW9uIHRpbWUgYXMgd2VsbCBhcyB0aGUgc3RvcmVkXG4gICAgLy8gY291bnRlci4gSWYgYXBwbGljYXRpb24gY29kZSBjbGVhcnMgc2Vzc2lvblN0b3JhZ2UsIHRoZSBuZXh0IHJlbG9hZCBtdXN0XG4gICAgLy8gc3RpbGwgYmUgbmV3ZXIgdGhhbiB0aGUgZ2VuZXJhdGlvbiBHbyBoYXMgYWxyZWFkeSByZXRpcmVkOyByZXN0YXJ0aW5nXG4gICAgLy8gZnJvbSAxIHdvdWxkIG1ha2UgZXZlcnkgc3RyZWFtIHJlcXVlc3QgcmVjZWl2ZSA0MTAgdW50aWwgdGhlIGhvc3QgZXhpdHMuXG4gICAgLy8gUGVyZm9ybWFuY2UudGltZU9yaWdpbiBpcyBhYnNlbnQgb24gb2xkZXIgV2ViS2l0IHJlbGVhc2VzIHRoYXQgQmFpbHNcbiAgICAvLyBzdGlsbCB0YXJnZXRzLiBEYXRlLm5vdyBrZWVwcyB0aG9zZSBlbmdpbmVzIG9uIHRoZSBwcm90b2NvbDsgdGhlIHN0b3JlZFxuICAgIC8vIGNvdW50ZXIgZGlzYW1iaWd1YXRlcyByZWxvYWRzIHRoYXQgaGFwcGVuIHdpdGhpbiB0aGUgc2FtZSBtaWxsaXNlY29uZC5cbiAgICBjb25zdCBvcmlnaW4gPSB0eXBlb2YgcGVyZm9ybWFuY2UgIT09IFwidW5kZWZpbmVkXCIgJiYgTnVtYmVyLmlzRmluaXRlKHBlcmZvcm1hbmNlLnRpbWVPcmlnaW4pXG4gICAgICAgID8gcGVyZm9ybWFuY2UudGltZU9yaWdpblxuICAgICAgICA6IERhdGUubm93KCk7XG4gICAgY29uc3QgcGFnZVRpbWUgPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKG9yaWdpbiAqIDEwMDApKTtcbiAgICBsZXQgY3VycmVudCA9IG5hbWVkUGFnZUdlbmVyYXRpb24oKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByYXcgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShHRU5FUkFUSU9OX0tFWSk7XG4gICAgICAgIGNvbnN0IHN0b3JlZCA9IHJhdyA9PT0gbnVsbCA/IDAgOiBOdW1iZXIocmF3KTtcbiAgICAgICAgaWYgKE51bWJlci5pc1NhZmVJbnRlZ2VyKHN0b3JlZCkgJiYgc3RvcmVkID4gY3VycmVudCkgY3VycmVudCA9IHN0b3JlZDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gU3RvcmFnZSBjYW4gYmUgZGlzYWJsZWQgYnkgcG9saWN5LiB3aW5kb3cubmFtZSBzdXBwbGllcyB0aGVcbiAgICAgICAgLy8gYnJvd3NpbmctY29udGV4dCBjb3VudGVyIGluIHRoYXQgY2FzZS5cbiAgICB9XG5cbiAgICBjb25zdCBuZXh0ID0gTnVtYmVyLmlzU2FmZUludGVnZXIoY3VycmVudCkgJiYgY3VycmVudCA+PSAwICYmIGN1cnJlbnQgPCBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxuICAgICAgICA/IE1hdGgubWF4KGN1cnJlbnQgKyAxLCBwYWdlVGltZSlcbiAgICAgICAgOiBwYWdlVGltZTtcbiAgICB0cnkge1xuICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShHRU5FUkFUSU9OX0tFWSwgU3RyaW5nKG5leHQpKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gVGhlIGJyb3dzaW5nLWNvbnRleHQgZmFsbGJhY2sgYmVsb3cgaXMgc3VmZmljaWVudCB3aGVuIHN0b3JhZ2UgaXNcbiAgICAgICAgLy8gdW5hdmFpbGFibGUuXG4gICAgfVxuICAgIHJlbWVtYmVyTmFtZWRQYWdlR2VuZXJhdGlvbihuZXh0KTtcbiAgICByZXR1cm4gbmV4dDtcbn1cblxuZnVuY3Rpb24gc3RyZWFtR2xvYmFscygpOiBTdHJlYW1HbG9iYWxzIHtcbiAgICBjb25zdCBmcmVzaCA9ICgpOiBTdHJlYW1HbG9iYWxzID0+ICh7XG4gICAgICAgIHNlc3Npb246IG5hbm9pZCgpLFxuICAgICAgICBnZW5lcmF0aW9uOiBuZXh0UGFnZUdlbmVyYXRpb24oKSxcbiAgICAgICAgbmV4dENvbm5JRDogMSxcbiAgICAgICAgY29ubmVjdGlvbnM6IG5ldyBNYXA8bnVtYmVyLCBCYWlsc1NvY2tldD4oKSxcbiAgICAgICAgcG9sbGluZzogZmFsc2UsXG4gICAgfSk7XG4gICAgaWYgKCFoYXNET00pIHJldHVybiBmcmVzaCgpO1xuICAgIGNvbnN0IHcgPSAod2luZG93IGFzIGFueSkuX2JhaWxzID0gKHdpbmRvdyBhcyBhbnkpLl9iYWlscyB8fCB7fTtcbiAgICByZXR1cm4gKHcuX19zdHJlYW0gPSB3Ll9fc3RyZWFtIHx8IGZyZXNoKCkpO1xufVxuXG5jb25zdCBHID0gc3RyZWFtR2xvYmFscygpO1xuXG5jb25zdCBIRFJfU0VTU0lPTiA9IFwieC1iYWlscy1zdHJlYW0tc2Vzc2lvblwiO1xuY29uc3QgSERSX0dFTkVSQVRJT04gPSBcIngtYmFpbHMtc3RyZWFtLWdlbmVyYXRpb25cIjtcbmNvbnN0IEhEUl9DT05OID0gXCJ4LWJhaWxzLXN0cmVhbS1jb25uXCI7XG5jb25zdCBIRFJfS0lORCA9IFwieC1iYWlscy1zdHJlYW0ta2luZFwiO1xuY29uc3QgSERSX05BTUUgPSBcIngtYmFpbHMtc3RyZWFtLW5hbWVcIjtcbmNvbnN0IEhEUl9DSFVOSyA9IFwieC1iYWlscy1zdHJlYW0tY2h1bmtcIjtcbmNvbnN0IEhEUl9DSFVOS19JTkRFWCA9IFwieC1iYWlscy1zdHJlYW0tY2h1bmstaW5kZXhcIjtcbmNvbnN0IEhEUl9DSFVOS19UT1RBTCA9IFwieC1iYWlscy1zdHJlYW0tY2h1bmstdG90YWxcIjtcbmNvbnN0IEhEUl9CQVRDSCA9IFwieC1iYWlscy1zdHJlYW0tYmF0Y2hcIjtcblxuY29uc3QgS0lORF9EQVRBID0gMDtcbmNvbnN0IEtJTkRfT1BFTiA9IDE7XG5jb25zdCBLSU5EX0NMT1NFID0gMjtcbmNvbnN0IEtJTkRfRVJST1IgPSAzO1xuXG4vLyBNYXRjaGVzIHRoZSBydW50aW1lJ3Mgb3duIGxpbWl0OiBzdGF5IHVuZGVyIFdlYlZpZXcyJ3MgfjJNQiByZXF1ZXN0IGJvZHlcbi8vIGJ1ZmZlcmluZyBsaW1pdCBpbiBXZWJSZXNvdXJjZVJlcXVlc3RlZC5cbmNvbnN0IENIVU5LX1RIUkVTSE9MRCA9IDUxMiAqIDEwMjQ7XG5jb25zdCBNQVhfQkFUQ0hfRlJBTUVTID0gNDA5NjtcblxuLy8gQmFja29mZiBmbG9vciBhbmQgY2VpbGluZyBmb3IgYSBmYWlsaW5nIHBvbGwuIFRoaXMgaXMgdGhlIFwicmVhc29uYWJsZSBsb3dlclxuLy8gbGltaXRcIiBvbiBwb2xsaW5nIOKAlCBhbiBlcnJvciBiYWNrb2ZmLCBub3QgYSBzdGVhZHktc3RhdGUgaW50ZXJ2YWwuIEluIG5vcm1hbFxuLy8gb3BlcmF0aW9uIHRoZSBwb2xsIHJlLWlzc3VlcyBpbW1lZGlhdGVseSwgYmVjYXVzZSB0aGUgc2VydmVyIGhvbGQgaGFzIGFscmVhZHlcbi8vIHByb3ZpZGVkIHdoYXRldmVyIGRlbGF5IHdhcyBhcHByb3ByaWF0ZS5cbmNvbnN0IEJBQ0tPRkZfTUlOID0gMjUwO1xuY29uc3QgQkFDS09GRl9NQVggPSA1MDAwO1xuY29uc3QgdGV4dEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcblxuZnVuY3Rpb24gc3RyZWFtVVJMKGVuZHBvaW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgXCIvYmFpbHMvc3RyZWFtL1wiICsgZW5kcG9pbnQ7XG59XG5cblxuY2xhc3MgU3RyZWFtUmVxdWVzdENhbmNlbGxlZCBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoXCJzdHJlYW0gcmVxdWVzdCBjYW5jZWxsZWRcIik7XG4gICAgICAgIHRoaXMubmFtZSA9IFwiQWJvcnRFcnJvclwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2xlZXAobXM6IG51bWJlciwgc2lnbmFsPzogQWJvcnRTaWduYWwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXNpZ25hbCkgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG4gICAgaWYgKHNpZ25hbC5hYm9ydGVkKSByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFN0cmVhbVJlcXVlc3RDYW5jZWxsZWQoKSk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCBvbkFib3J0ID0gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgIHJlamVjdChuZXcgU3RyZWFtUmVxdWVzdENhbmNlbGxlZCgpKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0sIG1zKTtcbiAgICAgICAgc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBvbkFib3J0LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogQSBzdHJlYW0gY29ubmVjdGlvbi4gSW1wbGVtZW50cyB0aGUgdXNlZnVsIHN1YnNldCBvZiB0aGUgYFdlYlNvY2tldGBcbiAqIGludGVyZmFjZSwgc28gdGhlIHNhbWUgYXBwbGljYXRpb24gY29kZSB3b3JrcyBhZ2FpbnN0IGEgcmVhbCBXZWJTb2NrZXQgaW5cbiAqIHNlcnZlciBidWlsZHMuXG4gKlxuICogT25lIGRlbGliZXJhdGUgZGl2ZXJnZW5jZSBmcm9tIHRoZSBzdGFuZGFyZDogYGJpbmFyeVR5cGVgIGRlZmF1bHRzIHRvXG4gKiBgXCJhcnJheWJ1ZmZlclwiYCByYXRoZXIgdGhhbiBgXCJibG9iXCJgLCBiZWNhdXNlIHN0cmVhbSBmcmFtZXMgYXJlIGFsd2F5c1xuICogYmluYXJ5IGFuZCBhIEJsb2Igd291bGQgZm9yY2UgYW4gZXh0cmEgYXN5bmMgaG9wIHRvIHJlYWQgZXZlcnkgbWVzc2FnZS5cbiAqIFNldHRpbmcgaXQgdG8gYFwiYmxvYlwiYCBiZWhhdmVzIGFzIHRoZSBzdGFuZGFyZCBkZXNjcmliZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCYWlsc1NvY2tldCBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcbiAgICBzdGF0aWMgcmVhZG9ubHkgQ09OTkVDVElORyA9IDA7XG4gICAgc3RhdGljIHJlYWRvbmx5IE9QRU4gPSAxO1xuICAgIHN0YXRpYyByZWFkb25seSBDTE9TSU5HID0gMjtcbiAgICBzdGF0aWMgcmVhZG9ubHkgQ0xPU0VEID0gMztcblxuICAgIHJlYWRvbmx5IENPTk5FQ1RJTkcgPSAwO1xuICAgIHJlYWRvbmx5IE9QRU4gPSAxO1xuICAgIHJlYWRvbmx5IENMT1NJTkcgPSAyO1xuICAgIHJlYWRvbmx5IENMT1NFRCA9IDM7XG5cbiAgICAvKiogVGhlIHN0cmVhbSBuYW1lIHRoaXMgY29ubmVjdGlvbiB3YXMgb3BlbmVkIGFnYWluc3QuICovXG4gICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHVybDogc3RyaW5nO1xuXG4gICAgLyoqIEFsd2F5cyBlbXB0eTogc3VicHJvdG9jb2xzIGFuZCBleHRlbnNpb25zIGFyZSBub3QgbmVnb3RpYXRlZC4gKi9cbiAgICByZWFkb25seSBwcm90b2NvbCA9IFwiXCI7XG4gICAgcmVhZG9ubHkgZXh0ZW5zaW9ucyA9IFwiXCI7XG5cbiAgICBiaW5hcnlUeXBlOiBcImFycmF5YnVmZmVyXCIgfCBcImJsb2JcIiA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICByZWFkeVN0YXRlOiBudW1iZXIgPSBCYWlsc1NvY2tldC5DT05ORUNUSU5HO1xuXG4gICAgLy8gRGVjbGFyZWQgZm9yIHRoZSB0eXBlOyB0aGUgY29uc3RydWN0b3IgcmVwbGFjZXMgZWFjaCB3aXRoIGFuIGFjY2Vzc29yXG4gICAgLy8gdGhhdCByZWdpc3RlcnMgYSByZWFsIGxpc3RlbmVyLiBDYWxsaW5nIHRoZW0gZGlyZWN0bHkgaW5zdGVhZCB3b3VsZCBtYWtlXG4gICAgLy8gYW55IHdyYXBwZXIgKHNlZSBKU09OU3RyZWFtKSByZWNlaXZlIGJvdGggdGhlIHJhdyBhbmQgdGhlIGRlY29kZWQgZXZlbnQuXG4gICAgb25vcGVuOiAoKGV2OiBFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBvbm1lc3NhZ2U6ICgoZXY6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgICBvbmNsb3NlOiAoKGV2OiBDbG9zZUV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIG9uZXJyb3I6ICgoZXY6IEV2ZW50KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQGludGVybmFsIEFwcGxpZWQgdG8gZXZlcnkgaW5ib3VuZCBwYXlsb2FkIGJlZm9yZSBkaXNwYXRjaC4gSlNPTlN0cmVhbVxuICAgICAqIHJlcGxhY2VzIGl0LCBzbyBgb25tZXNzYWdlYCBhbmQgYGFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIOKApilgIHNlZSB0aGVcbiAgICAgKiBzYW1lIGRlY29kZWQgdmFsdWUg4oCUIGludGVyY2VwdGluZyBvbmx5IGBvbm1lc3NhZ2VgIG1hZGUgdGhlIHR3byBkaXNhZ3JlZS5cbiAgICAgKi9cbiAgICBfZGVjb2RlOiAocGF5bG9hZDogQXJyYXlCdWZmZXIpID0+IHVua25vd24gPSAocGF5bG9hZCkgPT4gcGF5bG9hZDtcblxuICAgIC8qKiBAaW50ZXJuYWwgKi8gcmVhZG9ubHkgX2lkOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfYnVmZmVyZWQgPSAwO1xuICAgIC8vIFNlbmRzIGFyZSBzZXJpYWxpc2VkIHBlciBjb25uZWN0aW9uOiBjb25jdXJyZW50IGZldGNoKCkgUE9TVHMgZG8gbm90XG4gICAgLy8gcHJlc2VydmUgb3JkZXIsIGFuZCBHbyByZWxpZXMgb24gc2VuZCBvcmRlciBiZWluZyB0aGUgb3JkZXIgaXQgb2JzZXJ2ZXMuXG4gICAgcHJpdmF0ZSBfY2hhaW46IFByb21pc2U8dm9pZD4gPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICBwcml2YXRlIF9wZW5kaW5nOiBQcm9taXNlPFVpbnQ4QXJyYXk+W10gPSBbXTtcbiAgICBwcml2YXRlIF9mbHVzaGluZyA9IGZhbHNlO1xuICAgIHByaXZhdGUgX29wZW5BYm9ydCA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBwcml2YXRlIF9zZW5kQWJvcnQgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG5cbiAgICAvKiogQnl0ZXMgcXVldWVkIGJ5IHNlbmQoKSB0aGF0IGhhdmUgbm90IHlldCByZWFjaGVkIEdvLiAqL1xuICAgIGdldCBidWZmZXJlZEFtb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fYnVmZmVyZWQ7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuX2lkID0gRy5uZXh0Q29ubklEKys7XG4gICAgICAgIHRoaXMudXJsID0gaGFzRE9NID8gc3RyZWFtVVJMKFwicG9sbFwiKSArIFwiI1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpIDogXCJcIjtcblxuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgW1wib3BlblwiLCBcIm1lc3NhZ2VcIiwgXCJjbG9zZVwiLCBcImVycm9yXCJdKSB7XG4gICAgICAgICAgICBkZWZpbmVIYW5kbGVyUHJvcGVydHkodGhpcywgdHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICBHLmNvbm5lY3Rpb25zLnNldCh0aGlzLl9pZCwgdGhpcyk7XG5cbiAgICAgICAgLy8gRmlyZSBhbmQgZm9yZ2V0OiB0aGUgYWNrIGFycml2ZXMgYXMgYW4gb3BlbiBmcmFtZSBvbiB0aGUgcG9sbCwgd2hpY2hcbiAgICAgICAgLy8gaXMgd2hhdCBtb3ZlcyByZWFkeVN0YXRlIHRvIE9QRU4uXG4gICAgICAgIHRoaXMuX2NoYWluID0gdGhpcy5fY2hhaW4udGhlbigoKSA9PlxuICAgICAgICAgICAgcG9zdEZyYW1lKHRoaXMuX2lkLCBLSU5EX09QRU4sIG5ldyBVaW50OEFycmF5KDApLCBuYW1lLCB0aGlzLl9vcGVuQWJvcnQuc2lnbmFsKVxuICAgICAgICApLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2ZhaWwoZXJyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3RhcnRQb2xsaW5nKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhIGZyYW1lIHRvIEdvLiBBY2NlcHRzIGFueXRoaW5nIGEgV2ViU29ja2V0IGRvZXM7IHN0cmluZ3MgYXJlXG4gICAgICogZW5jb2RlZCBhcyBVVEYtOCwgc2luY2UgR28gcmVjZWl2ZXMgZXZlcnkgZnJhbWUgYXMgYSBieXRlIHNsaWNlLlxuICAgICAqL1xuICAgIHNlbmQoZGF0YTogc3RyaW5nIHwgQXJyYXlCdWZmZXJMaWtlIHwgQXJyYXlCdWZmZXJWaWV3IHwgQmxvYik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBCYWlsc1NvY2tldC5DT05ORUNUSU5HKSB7XG4gICAgICAgICAgICAvLyBNYXRjaGVzIHRoZSBXZWJTb2NrZXQgc3BlY2lmaWNhdGlvbi5cbiAgICAgICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oXCJTdGlsbCBpbiBDT05ORUNUSU5HIHN0YXRlLlwiLCBcIkludmFsaWRTdGF0ZUVycm9yXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IEJhaWxzU29ja2V0Lk9QRU4pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgbm93IHJhdGhlciB0aGFuIGluc2lkZSB0aGUgY2hhaW4uIE11dGFibGUgYmluYXJ5IGlucHV0cyBhcmVcbiAgICAgICAgLy8gY29waWVkIHN5bmNocm9ub3VzbHkgc28gc2VuZCgpIHNuYXBzaG90cyB0aGVpciBieXRlcyBsaWtlIGEgbmF0aXZlXG4gICAgICAgIC8vIFdlYlNvY2tldCwgZXZlbiB3aGVuIGEgYmF0Y2ggd2FpdHMgYmVoaW5kIGFuIGluLWZsaWdodCByZXF1ZXN0LiBBXG4gICAgICAgIC8vIEJsb2IgaXMgaW1tdXRhYmxlIGFuZCBpcyB0aGVyZWZvcmUgc2FmZSB0byByZWFkIGFzeW5jaHJvbm91c2x5IG9uY2UuXG4gICAgICAgIGNvbnN0IGltbWVkaWF0ZSA9IHRvQnl0ZXNTeW5jKGRhdGEpO1xuICAgICAgICBjb25zdCBzbmFwc2hvdCA9IGltbWVkaWF0ZVxuICAgICAgICAgICAgPyBQcm9taXNlLnJlc29sdmUoaW1tZWRpYXRlKVxuICAgICAgICAgICAgOiB0b0J5dGVzKGRhdGEsIHRoaXMuX3NlbmRBYm9ydC5zaWduYWwpO1xuICAgICAgICAvLyBjbG9zZSgpIG1heSBkaXNjYXJkIHRoaXMgcHJvbWlzZSBiZWZvcmUgdGhlIGZsdXNoIGhhcyBkZXF1ZXVlZCBpdC5cbiAgICAgICAgLy8gQXR0YWNoIGEgcmVqZWN0aW9uIG9ic2VydmVyIGltbWVkaWF0ZWx5IHNvIGNhbmNlbGxpbmcgYW4gYXN5bmNocm9ub3VzXG4gICAgICAgIC8vIEJsb2IgcmVhZCBjYW5ub3QgYmVjb21lIGFuIHVuaGFuZGxlZCByZWplY3Rpb247IFByb21pc2UuYWxsIHN0aWxsXG4gICAgICAgIC8vIG9ic2VydmVzIHRoZSBvcmlnaW5hbCByZWplY3Rpb24gd2hlbiB0aGUgZmx1c2ggYWxyZWFkeSBvd25zIGl0LlxuICAgICAgICB2b2lkIHNuYXBzaG90LmNhdGNoKCgpID0+IHt9KTtcblxuICAgICAgICAvLyBBIEJsb2IgY2Fubm90IGJlIGNvbnZlcnRlZCBzeW5jaHJvbm91c2x5LCBidXQgQmxvYi5zaXplIGlzIGF2YWlsYWJsZVxuICAgICAgICAvLyBub3csIHNvIGl0cyBieXRlcyBhcmUgc3RpbGwgY291bnRlZCB0aGUgbW9tZW50IHNlbmQoKSByZXR1cm5zLiBXYWl0aW5nXG4gICAgICAgIC8vIGZvciBhcnJheUJ1ZmZlcigpIHRvIHJlc29sdmUgbGV0IGEgbGFyZ2UgQmxvYiBzbGlwIHBhc3QgY29kZSB1c2luZ1xuICAgICAgICAvLyBidWZmZXJlZEFtb3VudCBmb3IgYmFja3ByZXNzdXJlLlxuICAgICAgICBjb25zdCBibG9iU2l6ZSA9XG4gICAgICAgICAgICAhaW1tZWRpYXRlICYmIHR5cGVvZiBCbG9iICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBCbG9iID8gZGF0YS5zaXplIDogMDtcbiAgICAgICAgaWYgKGJsb2JTaXplKSB7XG4gICAgICAgICAgICB0aGlzLl9idWZmZXJlZCArPSBibG9iU2l6ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFjY291bnQgZm9yIHRoZSBieXRlcyBub3csIG5vdCB3aGVuIHRoZSBjaGFpbiByZWFjaGVzIHRoZW0uIFJlcG9ydGluZ1xuICAgICAgICAvLyB6ZXJvIHdoaWxlIGZyYW1lcyB3YWl0IGJlaGluZCBhbiBpbi1mbGlnaHQgYmF0Y2ggd291bGQgdGVsbCBhblxuICAgICAgICAvLyBhcHBsaWNhdGlvbiB1c2luZyBidWZmZXJlZEFtb3VudCBmb3IgYmFja3ByZXNzdXJlIHRoYXQgaXQgbWF5IGtlZXBcbiAgICAgICAgLy8gc2VuZGluZy5cbiAgICAgICAgaWYgKGltbWVkaWF0ZSkge1xuICAgICAgICAgICAgdGhpcy5fYnVmZmVyZWQgKz0gaW1tZWRpYXRlLmJ5dGVMZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcGVuZGluZy5wdXNoKHNuYXBzaG90KTtcblxuICAgICAgICAvLyBRdWV1ZSByYXRoZXIgdGhhbiBwb3N0LiBXaGF0ZXZlciBhY2N1bXVsYXRlcyB3aGlsZSBhIHJlcXVlc3QgaXMgaW5cbiAgICAgICAgLy8gZmxpZ2h0IGdvZXMgb3V0IHRvZ2V0aGVyIGluIHRoZSBuZXh0IG9uZSwgc28gdGhlIHBlci1yZXF1ZXN0IGNvc3Qg4oCUXG4gICAgICAgIC8vIGEgc2NoZW1lLWhhbmRsZXIgcm91bmQgdHJpcCwgYWJvdXQgZWxldmVuIGNnbyBjYWxscyBvbiBtYWNPUyDigJQgaXNcbiAgICAgICAgLy8gZGl2aWRlZCBhY3Jvc3MgdGhlIGJhdGNoLiBVbmRlciBsaWdodCBsb2FkIGEgYmF0Y2ggaXMgb25lIGZyYW1lIGFuZFxuICAgICAgICAvLyB0aGlzIGJlaGF2ZXMgZXhhY3RseSBhcyBiZWZvcmU7IHRoZSBiYXRjaGluZyBvbmx5IGFwcGVhcnMgd2hlbiB0aGVcbiAgICAgICAgLy8gc2VuZGVyIGlzIG91dHJ1bm5pbmcgdGhlIHRyYW5zcG9ydCwgd2hpY2ggaXMgd2hlbiBpdCBpcyBuZWVkZWQuXG4gICAgICAgIGlmICh0aGlzLl9mbHVzaGluZykgcmV0dXJuO1xuICAgICAgICB0aGlzLl9mbHVzaGluZyA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fY2hhaW4gPSB0aGlzLl9jaGFpbi50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuX3BlbmRpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBCb3VuZCB0aGUgd29yayBhbmQgdGVtcG9yYXJ5IHByb21pc2UgYXJyYXkgZm9yIG9uZSBwYXNzLlxuICAgICAgICAgICAgICAgICAgICAvLyBwb3N0QmF0Y2ggYXBwbGllcyB0aGUgd2lyZS1zaXplIGJvdW5kIGFmdGVyIHJlc29sdXRpb24uXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXVlZCA9IHRoaXMuX3BlbmRpbmcuc3BsaWNlKDAsIE1BWF9CQVRDSF9GUkFNRVMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYXRjaCA9IGF3YWl0IFByb21pc2UuYWxsKHF1ZXVlZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQSByZW1vdGUgY2xvc2UgbWF5IGFycml2ZSB3aGlsZSBhIEJsb2IgaXMgYmVpbmcgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGNvbm5lY3Rpb24gaXMgYWxyZWFkeSBnb25lIGluIHRoYXQgY2FzZSwgc28gZG8gbm90XG4gICAgICAgICAgICAgICAgICAgIC8vIGlzc3VlIGEgbGF0ZSBQT1NUIGZvciBieXRlcyB0aGUgcGVlciBjYW4gbm8gbG9uZ2VyIHRha2UuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IEJhaWxzU29ja2V0LkNMT1NFRCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b3RhbCA9IGJhdGNoLnJlZHVjZSgobiwgYikgPT4gbiArIGIuYnl0ZUxlbmd0aCwgMCk7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBwb3N0QmF0Y2godGhpcy5faWQsIGJhdGNoLCB0aGlzLl9zZW5kQWJvcnQuc2lnbmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIF9jbG9zZWQgcmVzZXRzIHRoZSBjb3VudGVyIGltbWVkaWF0ZWx5LiBBIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFscmVhZHkgaW4gZmxpZ2h0IG1heSBmaW5pc2ggYWZ0ZXJ3YXJkcywgYW5kIG11c3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBkcml2ZSBidWZmZXJlZEFtb3VudCBiZWxvdyB6ZXJvLlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYnVmZmVyZWQgPSBNYXRoLm1heCgwLCB0aGlzLl9idWZmZXJlZCAtIHRvdGFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmx1c2hpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZmx1c2hpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZhaWwoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIENsb3NlIHRoZSBjb25uZWN0aW9uLiBHbydzIGhhbmRsZXIgc2VlcyBSZWNlaXZlIGZhaWwgYW5kIHJldHVybnMuICovXG4gICAgY2xvc2UoY29kZTogbnVtYmVyID0gMTAwMCwgcmVhc29uOiBzdHJpbmcgPSBcIlwiKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IEJhaWxzU29ja2V0LkNMT1NJTkcgfHwgdGhpcy5yZWFkeVN0YXRlID09PSBCYWlsc1NvY2tldC5DTE9TRUQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBCYWlsc1NvY2tldC5DTE9TSU5HO1xuICAgICAgICB0aGlzLl9wZW5kaW5nLmxlbmd0aCA9IDA7XG4gICAgICAgIHRoaXMuX2J1ZmZlcmVkID0gMDtcbiAgICAgICAgdGhpcy5fb3BlbkFib3J0LmFib3J0KCk7XG5cbiAgICAgICAgLy8gQSBkYXRhIGZyYW1lIHdhaXRpbmcgZm9yIHJlY2VpdmVyIGNhcGFjaXR5IG11c3Qgbm90IHByZXZlbnQgdGhlXG4gICAgICAgIC8vIHJlc2VydmVkIGNsb3NlIGNvbnRyb2wgZnJvbSBldmVyIHJlYWNoaW5nIEdvLiBDYW5jZWwgb25seSB0aGUgZGF0YVxuICAgICAgICAvLyByZXRyeSBwYXRoOyB0aGUgY2hhaW4gYmVsb3cgc3RpbGwgb3JkZXJzIHRoZSBjbG9zZSBhZnRlciB0aGF0IHBhdGhcbiAgICAgICAgLy8gaGFzIHVud291bmQsIHByZXNlcnZpbmcgbm9ybWFsIHNlbmQtYmVmb3JlLWNsb3NlIG9yZGVyaW5nLlxuICAgICAgICB0aGlzLl9zZW5kQWJvcnQuYWJvcnQoKTtcbiAgICAgICAgdGhpcy5fY2hhaW4gPSB0aGlzLl9jaGFpbi50aGVuKCgpID0+XG4gICAgICAgICAgICBwb3N0RnJhbWUodGhpcy5faWQsIEtJTkRfQ0xPU0UsIG5ldyBVaW50OEFycmF5KDApKVxuICAgICAgICApLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFRoZSBwZWVyIGlzIGFscmVhZHkgZ29uZTsgdGhlIGxvY2FsIGNsb3NlIGJlbG93IGlzIHdoYXQgbWF0dGVycy5cbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9jbG9zZWQoY29kZSwgcmVhc29uLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIEBpbnRlcm5hbCBDYWxsZWQgd2hlbiB0aGUgb3BlbiBmcmFtZSBjb21lcyBiYWNrIGZyb20gR28uICovXG4gICAgX29wZW5lZCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gQmFpbHNTb2NrZXQuQ09OTkVDVElORykgcmV0dXJuO1xuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBCYWlsc1NvY2tldC5PUEVOO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwib3BlblwiKSk7XG4gICAgfVxuXG4gICAgLyoqIEBpbnRlcm5hbCBDYWxsZWQgZm9yIGVhY2ggZGF0YSBmcmFtZSBhZGRyZXNzZWQgdG8gdGhpcyBjb25uZWN0aW9uLiAqL1xuICAgIF9tZXNzYWdlKHBheWxvYWQ6IEFycmF5QnVmZmVyKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IEJhaWxzU29ja2V0Lk9QRU4pIHJldHVybjtcbiAgICAgICAgbGV0IGRhdGE6IHVua25vd247XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fZGVjb2RlKHBheWxvYWQpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJlcnJvclwiKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGEgPT09IHBheWxvYWQgJiYgdGhpcy5iaW5hcnlUeXBlID09PSBcImJsb2JcIikge1xuICAgICAgICAgICAgZGF0YSA9IG5ldyBCbG9iKFtwYXlsb2FkXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBNZXNzYWdlRXZlbnQoXCJtZXNzYWdlXCIsIHsgZGF0YSB9KSk7XG4gICAgfVxuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIF9mYWlsKGVycjogdW5rbm93bik6IHZvaWQge1xuICAgICAgICAvLyBBbiBpbi1mbGlnaHQgc2VuZCBjYW4gcmVqZWN0IGFmdGVyIGEgY2xlYW4gY2xvc2UgaGFzIGFscmVhZHkgYXJyaXZlZC5cbiAgICAgICAgLy8gVGhlIHNvY2tldCdzIGxpZmVjeWNsZSBpcyBjb21wbGV0ZSB0aGVuOiBlbWl0dGluZyBlcnJvciBhZnRlciBjbG9zZVxuICAgICAgICAvLyByZXZlcnNlcyB0aGUgV2ViU29ja2V0IGV2ZW50IG9yZGVyIGFuZCByZXBvcnRzIGEgZmFsc2UgZmFpbHVyZS5cbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gQmFpbHNTb2NrZXQuQ0xPU0VEIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gQmFpbHNTb2NrZXQuQ0xPU0lORykgcmV0dXJuO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiZXJyb3JcIikpO1xuICAgICAgICAvLyAxMDA2OiBjbG9zZWQgYWJub3JtYWxseSwgbm8gY2xvc2UgZnJhbWUuIFNhbWUgY29kZSBhIHJlYWwgV2ViU29ja2V0XG4gICAgICAgIC8vIHJlcG9ydHMgd2hlbiB0aGUgY29ubmVjdGlvbiBkcm9wcyB3aXRob3V0IGEgaGFuZHNoYWtlLlxuICAgICAgICB0aGlzLl9jbG9zZWQoMTAwNiwgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIF9jbG9zZWQoY29kZTogbnVtYmVyLCByZWFzb246IHN0cmluZywgd2FzQ2xlYW46IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gQmFpbHNTb2NrZXQuQ0xPU0VEKSByZXR1cm47XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IEJhaWxzU29ja2V0LkNMT1NFRDtcbiAgICAgICAgdGhpcy5fb3BlbkFib3J0LmFib3J0KCk7XG4gICAgICAgIHRoaXMuX3NlbmRBYm9ydC5hYm9ydCgpO1xuICAgICAgICBHLmNvbm5lY3Rpb25zLmRlbGV0ZSh0aGlzLl9pZCk7XG4gICAgICAgIGlmIChHLmNvbm5lY3Rpb25zLnNpemUgPT09IDApIEcucG9sbEFib3J0Py5hYm9ydCgpO1xuICAgICAgICB0aGlzLl9wZW5kaW5nLmxlbmd0aCA9IDA7XG4gICAgICAgIHRoaXMuX2J1ZmZlcmVkID0gMDtcblxuICAgICAgICBjb25zdCBldiA9IHR5cGVvZiBDbG9zZUV2ZW50ID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgID8gbmV3IENsb3NlRXZlbnQoXCJjbG9zZVwiLCB7IGNvZGUsIHJlYXNvbiwgd2FzQ2xlYW4gfSlcbiAgICAgICAgICAgIDogT2JqZWN0LmFzc2lnbihuZXcgRXZlbnQoXCJjbG9zZVwiKSwgeyBjb2RlLCByZWFzb24sIHdhc0NsZWFuIH0pIGFzIENsb3NlRXZlbnQ7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldik7XG4gICAgfVxufVxuXG4vKipcbiAqIENvbm5lY3QgdG8gYSBzdHJlYW0gZGVjbGFyZWQgaW4gR28gd2l0aCBgYXBwLkhhbmRsZVN0cmVhbShuYW1lLCBoYW5kbGVyKWAuXG4gKlxuICogUmV0dXJucyBpbW1lZGlhdGVseSB3aXRoIGByZWFkeVN0YXRlID09PSBDT05ORUNUSU5HYDsgbGlzdGVuIGZvciBgb3BlbmAsIG9yXG4gKiBqdXN0IGNhbGwge0BsaW5rIEJhaWxzU29ja2V0LnNlbmR9IG9uY2Ugb3Blbi4gQ3JlYXRpbmcgYSBjb25uZWN0aW9uIGF0IG1vZHVsZVxuICogc2NvcGUgaXMgc3VwcG9ydGVkIGFuZCBpcyB0aGUgaW50ZW5kZWQgc2hhcGUgZm9yIGdlbmVyYXRlZCBiaW5kaW5ncy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0cmVhbShuYW1lOiBzdHJpbmcpOiBCYWlsc1NvY2tldCB8IFdlYlNvY2tldCB7XG4gICAgLy8gU2VydmVyIGJ1aWxkcyBpbnN0YWxsIGEgZmFjdG9yeSByZXR1cm5pbmcgYSByZWFsIFdlYlNvY2tldCwgc2luY2UgdGhlcmVcbiAgICAvLyBpcyBhIGxpc3RlbmVyIHRoZXJlIHRvIHVwZ3JhZGUgb24gYW5kIG5vdGhpbmcgdG8gZW11bGF0ZS4gQm90aCBvYmplY3RzXG4gICAgLy8gcHJlc2VudCB0aGUgc2FtZSBpbnRlcmZhY2UsIHNvIG5vdGhpbmcgYWJvdmUgdGhpcyBsaW5lIGNhcmVzIHdoaWNoIGl0IGlzLlxuICAgIGlmIChoYXNET00pIHtcbiAgICAgICAgY29uc3QgZmFjdG9yeSA9ICh3aW5kb3cgYXMgYW55KS5fYmFpbHM/LnN0cmVhbUZhY3Rvcnk7XG4gICAgICAgIGlmICh0eXBlb2YgZmFjdG9yeSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFjdG9yeShuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEJhaWxzU29ja2V0KG5hbWUpO1xufVxuXG4vLyBEZWZpbmVzIGFuIGBvbjx0eXBlPmAgcHJvcGVydHkgdGhhdCByZWdpc3RlcnMgYW5kIHVucmVnaXN0ZXJzIGEgcmVhbCBldmVudFxuLy8gbGlzdGVuZXIsIHRoZSB3YXkgdGhlIERPTSBkZWZpbmVzIHRoZW0uIEFzc2lnbmluZyByZXBsYWNlcyB0aGUgcHJldmlvdXNcbi8vIGhhbmRsZXI7IHJlYWRpbmcgcmV0dXJucyBpdC5cbmZ1bmN0aW9uIGRlZmluZUhhbmRsZXJQcm9wZXJ0eSh0YXJnZXQ6IEV2ZW50VGFyZ2V0LCB0eXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgY3VycmVudDogKChldjogYW55KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIFwib25cIiArIHR5cGUsIHtcbiAgICAgICAgZ2V0OiAoKSA9PiBjdXJyZW50LFxuICAgICAgICBzZXQoZm46ICgoZXY6IGFueSkgPT4gdm9pZCkgfCBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudCkgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgY3VycmVudCk7XG4gICAgICAgICAgICBjdXJyZW50ID0gdHlwZW9mIGZuID09PSBcImZ1bmN0aW9uXCIgPyBmbiA6IG51bGw7XG4gICAgICAgICAgICBpZiAoY3VycmVudCkgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY3VycmVudCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBUaGUgb2JqZWN0LXNoYXBlZCB2aWV3IG9mIGEgc3RyZWFtIHJldHVybmVkIGJ5IHtAbGluayBKU09OU3RyZWFtfTogYHNlbmRgXG4gKiB0YWtlcyBhIHZhbHVlIHRvIHN0cmluZ2lmeSwgYW5kIGBldi5kYXRhYCBvbiBhIG1lc3NhZ2UgaXMgdGhlIHBhcnNlZCByZXN1bHQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSlNPTlNvY2tldCBleHRlbmRzIE9taXQ8QmFpbHNTb2NrZXQsIFwic2VuZFwiIHwgXCJvbm1lc3NhZ2VcIiB8IFwiYWRkRXZlbnRMaXN0ZW5lclwiIHwgXCJyZW1vdmVFdmVudExpc3RlbmVyXCI+IHtcbiAgICBzZW5kKHZhbHVlOiB1bmtub3duKTogdm9pZDtcbiAgICBvbm1lc3NhZ2U6ICgoZXY6IE1lc3NhZ2VFdmVudDxhbnk+KSA9PiB2b2lkKSB8IG51bGw7XG4gICAgYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGxpc3RlbmVyOiAoKHRoaXM6IEpTT05Tb2NrZXQsIGV2OiBNZXNzYWdlRXZlbnQ8YW55PikgPT4gYW55KSB8IEV2ZW50TGlzdGVuZXJPYmplY3QgfCBudWxsLFxuICAgICAgICBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zLFxuICAgICk6IHZvaWQ7XG4gICAgYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZTogc3RyaW5nLFxuICAgICAgICBsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsXG4gICAgICAgIG9wdGlvbnM/OiBib29sZWFuIHwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4gICAgKTogdm9pZDtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgbGlzdGVuZXI6ICgodGhpczogSlNPTlNvY2tldCwgZXY6IE1lc3NhZ2VFdmVudDxhbnk+KSA9PiBhbnkpIHwgRXZlbnRMaXN0ZW5lck9iamVjdCB8IG51bGwsXG4gICAgICAgIG9wdGlvbnM/OiBib29sZWFuIHwgRXZlbnRMaXN0ZW5lck9wdGlvbnMsXG4gICAgKTogdm9pZDtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgICB0eXBlOiBzdHJpbmcsXG4gICAgICAgIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0IHwgbnVsbCxcbiAgICAgICAgb3B0aW9ucz86IGJvb2xlYW4gfCBFdmVudExpc3RlbmVyT3B0aW9ucyxcbiAgICApOiB2b2lkO1xufVxuXG4vKipcbiAqIEEge0BsaW5rIFN0cmVhbX0gdGhhdCBzcGVha3Mgb2JqZWN0cyBpbnN0ZWFkIG9mIGJ5dGVzLlxuICpcbiAqIGBzZW5kKHZhbHVlKWAgbWFyc2hhbHMgd2l0aCBgSlNPTi5zdHJpbmdpZnlgLCBhbmQgYGV2LmRhdGFgIGluIGFuIGBvbm1lc3NhZ2VgXG4gKiBoYW5kbGVyIGlzIHRoZSBwYXJzZWQgb2JqZWN0IHJhdGhlciB0aGFuIGFuIGBBcnJheUJ1ZmZlcmAuIFBhaXJzIHdpdGhcbiAqIGBTdHJlYW1Db25uLlNlbmRKU09OYCAvIGBSZWNlaXZlSlNPTmAgb24gdGhlIEdvIHNpZGUuXG4gKlxuICogYGBganNcbiAqIGNvbnN0IHMgPSBKU09OU3RyZWFtKFwidGVsZW1ldHJ5XCIpO1xuICogcy5vbm1lc3NhZ2UgPSAoZXYpID0+IGNvbnNvbGUubG9nKGV2LmRhdGEudGVtcGVyYXR1cmUpO1xuICogcy5vbm9wZW4gICAgPSAoKSA9PiBzLnNlbmQoeyBzdWJzY3JpYmU6IFwic2Vuc29yc1wiIH0pO1xuICogYGBgXG4gKlxuICogQSBmcmFtZSB0aGF0IGlzIG5vdCB2YWxpZCBKU09OIHJhaXNlcyBhbiBgZXJyb3JgIGV2ZW50IGFuZCBpcyBkcm9wcGVkLCByYXRoZXJcbiAqIHRoYW4gdGhyb3dpbmcgZnJvbSB0aGUgcG9sbCBsb29wIGFuZCB0YWtpbmcgdGhlIGNvbm5lY3Rpb24gZG93biB3aXRoIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gSlNPTlN0cmVhbShuYW1lOiBzdHJpbmcpOiBKU09OU29ja2V0IHtcbiAgICBjb25zdCBzb2NrZXQgPSBTdHJlYW0obmFtZSk7XG4gICAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgIGNvbnN0IHBhcnNlID0gKHBheWxvYWQ6IEFycmF5QnVmZmVyIHwgc3RyaW5nKSA9PlxuICAgICAgICBKU09OLnBhcnNlKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiID8gcGF5bG9hZCA6IGRlY29kZXIuZGVjb2RlKHBheWxvYWQpKTtcblxuICAgIGlmIChzb2NrZXQgaW5zdGFuY2VvZiBCYWlsc1NvY2tldCkge1xuICAgICAgICAvLyBEZWNvZGluZyB0aHJvdWdoIHRoZSBob29rIHJhdGhlciB0aGFuIGJ5IHdyYXBwaW5nIG9ubWVzc2FnZSBtZWFuc1xuICAgICAgICAvLyBhZGRFdmVudExpc3RlbmVyIGxpc3RlbmVycyBzZWUgdGhlIHBhcnNlZCBvYmplY3QgdG9vLlxuICAgICAgICBzb2NrZXQuX2RlY29kZSA9IChwYXlsb2FkKSA9PiBwYXJzZShwYXlsb2FkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTZXJ2ZXIgYnVpbGRzIGdldCBhIG5hdGl2ZSBXZWJTb2NrZXQsIHdob3NlIGRpc3BhdGNoIG5ldmVyIGNvbnN1bHRzXG4gICAgICAgIC8vIF9kZWNvZGUuIFBhdGNoIGJvdGggbGlzdGVuZXIgc3R5bGVzIG9uIHRoaXMgaW5zdGFuY2Ugc28gSlNPTlN0cmVhbVxuICAgICAgICAvLyBtZWFucyB0aGUgc2FtZSB0aGluZyBvbiBlaXRoZXIgdHJhbnNwb3J0LCB3aGljaCBpcyB0aGUgcG9pbnQgb2YgdGhlXG4gICAgICAgIC8vIHNoYXJlZCBBUEkuXG4gICAgICAgIGNvbnN0IG5hdGl2ZSA9IHNvY2tldCBhcyBXZWJTb2NrZXQ7XG4gICAgICAgIG5hdGl2ZS5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xuXG4gICAgICAgIGNvbnN0IHdyYXBwZWQgPSBuZXcgV2Vha01hcDxvYmplY3QsIEV2ZW50TGlzdGVuZXI+KCk7XG4gICAgICAgIGNvbnN0IGRlY29kZWRFdmVudHMgPSBuZXcgV2Vha01hcDxFdmVudCwgTWVzc2FnZUV2ZW50IHwgbnVsbD4oKTtcbiAgICAgICAgY29uc3QgYWRkID0gbmF0aXZlLmFkZEV2ZW50TGlzdGVuZXIuYmluZChuYXRpdmUpO1xuICAgICAgICBjb25zdCByZW1vdmUgPSBuYXRpdmUucmVtb3ZlRXZlbnRMaXN0ZW5lci5iaW5kKG5hdGl2ZSk7XG5cbiAgICAgICAgY29uc3QgZGVjb2RlRXZlbnQgPSAoZXY6IEV2ZW50KTogTWVzc2FnZUV2ZW50IHwgbnVsbCA9PiB7XG4gICAgICAgICAgICBpZiAoZGVjb2RlZEV2ZW50cy5oYXMoZXYpKSByZXR1cm4gZGVjb2RlZEV2ZW50cy5nZXQoZXYpID8/IG51bGw7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2UoKGV2IGFzIE1lc3NhZ2VFdmVudCkuZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVjb2RlZCA9IG5ldyBNZXNzYWdlRXZlbnQoXCJtZXNzYWdlXCIsIHsgZGF0YTogdmFsdWUgfSk7XG4gICAgICAgICAgICAgICAgZGVjb2RlZEV2ZW50cy5zZXQoZXYsIGRlY29kZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVkO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgZGVjb2RlZEV2ZW50cy5zZXQoZXYsIG51bGwpO1xuICAgICAgICAgICAgICAgIG5hdGl2ZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImVycm9yXCIpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBkZWNvZGUgPSAobGlzdGVuZXI6IGFueSk6IEV2ZW50TGlzdGVuZXIgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSB3cmFwcGVkLmdldChsaXN0ZW5lciBhcyBvYmplY3QpO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nKSByZXR1cm4gZXhpc3Rpbmc7XG5cbiAgICAgICAgICAgIGNvbnN0IGZuOiBFdmVudExpc3RlbmVyID0gKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVjb2RlZCA9IGRlY29kZUV2ZW50KGV2KTtcbiAgICAgICAgICAgICAgICBpZiAoIWRlY29kZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyID09PSBcImZ1bmN0aW9uXCIpIGxpc3RlbmVyLmNhbGwobmF0aXZlLCBkZWNvZGVkKTtcbiAgICAgICAgICAgICAgICBlbHNlIGxpc3RlbmVyLmhhbmRsZUV2ZW50KGRlY29kZWQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdyYXBwZWQuc2V0KGxpc3RlbmVyIGFzIG9iamVjdCwgZm4pO1xuICAgICAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgICB9O1xuXG4gICAgICAgIG5hdGl2ZS5hZGRFdmVudExpc3RlbmVyID0gKCh0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBhbnksIG9wdHM/OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGFkZCh0eXBlLCB0eXBlID09PSBcIm1lc3NhZ2VcIiAmJiBsaXN0ZW5lciA/IGRlY29kZShsaXN0ZW5lcikgOiBsaXN0ZW5lciwgb3B0cyk7XG4gICAgICAgIH0pIGFzIHR5cGVvZiBuYXRpdmUuYWRkRXZlbnRMaXN0ZW5lcjtcblxuICAgICAgICBuYXRpdmUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9ICgodHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogYW55LCBvcHRzPzogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmbiA9IHR5cGUgPT09IFwibWVzc2FnZVwiICYmIGxpc3RlbmVyID8gd3JhcHBlZC5nZXQobGlzdGVuZXIpIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmVtb3ZlKHR5cGUsIGZuID8/IGxpc3RlbmVyLCBvcHRzKTtcbiAgICAgICAgfSkgYXMgdHlwZW9mIG5hdGl2ZS5yZW1vdmVFdmVudExpc3RlbmVyO1xuXG4gICAgICAgIGxldCBoYW5kbGVyOiAoKGV2OiBNZXNzYWdlRXZlbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuYXRpdmUsIFwib25tZXNzYWdlXCIsIHtcbiAgICAgICAgICAgIGdldDogKCkgPT4gaGFuZGxlcixcbiAgICAgICAgICAgIHNldChmbikge1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyKSBuYXRpdmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgaGFuZGxlciBhcyBFdmVudExpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gdHlwZW9mIGZuID09PSBcImZ1bmN0aW9uXCIgPyBmbiA6IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIpIG5hdGl2ZS5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBoYW5kbGVyIGFzIEV2ZW50TGlzdGVuZXIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNlbmQgPSBzb2NrZXQuc2VuZC5iaW5kKHNvY2tldCk7XG4gICAgKHNvY2tldCBhcyB1bmtub3duIGFzIEpTT05Tb2NrZXQpLnNlbmQgPSAodmFsdWU6IHVua25vd24pID0+IHNlbmQoSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcblxuICAgIHJldHVybiBzb2NrZXQgYXMgdW5rbm93biBhcyBKU09OU29ja2V0O1xufVxuXG4vLyBTeW5jaHJvbm91cyBjb252ZXJzaW9uIGZvciBldmVyeXRoaW5nIGJ1dCBhIEJsb2IuIEF2b2lkcyBhIHByb21pc2UgcGVyIHNlbmRcbi8vIGFuZCwgbW9yZSBpbXBvcnRhbnRseSwgbGV0cyBidWZmZXJlZEFtb3VudCBiZSBleGFjdCB0aGUgbW9tZW50IHNlbmQoKSByZXR1cm5zLlxuZnVuY3Rpb24gdG9CeXRlc1N5bmMoZGF0YTogc3RyaW5nIHwgQXJyYXlCdWZmZXJMaWtlIHwgQXJyYXlCdWZmZXJWaWV3IHwgQmxvYik6IFVpbnQ4QXJyYXkgfCBudWxsIHtcbiAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIHRleHRFbmNvZGVyLmVuY29kZShkYXRhKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBCbG9iICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhIGFzIEFycmF5QnVmZmVyTGlrZSkuc2xpY2UoKTtcbn1cblxuZnVuY3Rpb24gYWJvcnRhYmxlPFQ+KHByb21pc2U6IFByb21pc2U8VD4sIHNpZ25hbD86IEFib3J0U2lnbmFsKTogUHJvbWlzZTxUPiB7XG4gICAgaWYgKCFzaWduYWwpIHJldHVybiBwcm9taXNlO1xuICAgIGlmIChzaWduYWwuYWJvcnRlZCkgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBTdHJlYW1SZXF1ZXN0Q2FuY2VsbGVkKCkpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgb25BYm9ydCA9ICgpID0+IHJlamVjdChuZXcgU3RyZWFtUmVxdWVzdENhbmNlbGxlZCgpKTtcbiAgICAgICAgc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBvbkFib3J0LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIHByb21pc2UudGhlbihcbiAgICAgICAgICAgICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0b0J5dGVzKFxuICAgIGRhdGE6IHN0cmluZyB8IEFycmF5QnVmZmVyTGlrZSB8IEFycmF5QnVmZmVyVmlldyB8IEJsb2IsXG4gICAgc2lnbmFsPzogQWJvcnRTaWduYWwsXG4pOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIHRleHRFbmNvZGVyLmVuY29kZShkYXRhKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBCbG9iICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCBhYm9ydGFibGUoZGF0YS5hcnJheUJ1ZmZlcigpLCBzaWduYWwpKTtcbiAgICB9XG4gICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhkYXRhKSkge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZGF0YSBhcyBBcnJheUJ1ZmZlckxpa2UpLnNsaWNlKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBvc3RGcmFtZShjb25uSUQ6IG51bWJlciwga2luZDogbnVtYmVyLCBib2R5OiBVaW50OEFycmF5LCBuYW1lPzogc3RyaW5nLCBzaWduYWw/OiBBYm9ydFNpZ25hbCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgIFtIRFJfU0VTU0lPTl06IEcuc2Vzc2lvbixcbiAgICAgICAgW0hEUl9HRU5FUkFUSU9OXTogU3RyaW5nKEcuZ2VuZXJhdGlvbiksXG4gICAgICAgIFtIRFJfQ09OTl06IFN0cmluZyhjb25uSUQpLFxuICAgICAgICBbSERSX0tJTkRdOiBTdHJpbmcoa2luZCksXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgfTtcbiAgICBpZiAobmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGhlYWRlcnNbSERSX05BTUVdID0gbmFtZTtcbiAgICB9XG5cbiAgICBpZiAoYm9keS5ieXRlTGVuZ3RoIDw9IENIVU5LX1RIUkVTSE9MRCkge1xuICAgICAgICBhd2FpdCBwb3N0V2l0aFJldHJ5KGhlYWRlcnMsIGJvZHksIHNpZ25hbCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTcGxpdCBvdmVyc2l6ZWQgZnJhbWVzIHRoZSBzYW1lIHdheSB0aGUgcnVudGltZSBzcGxpdHMgb3ZlcnNpemVkIGNhbGxzLlxuICAgIGNvbnN0IGNodW5rSUQgPSBuYW5vaWQoKTtcbiAgICBjb25zdCB0b3RhbCA9IE1hdGguY2VpbChib2R5LmJ5dGVMZW5ndGggLyBDSFVOS19USFJFU0hPTEQpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG90YWw7IGkrKykge1xuICAgICAgICBjb25zdCBzbGljZSA9IGJvZHkuc3ViYXJyYXkoaSAqIENIVU5LX1RIUkVTSE9MRCwgKGkgKyAxKSAqIENIVU5LX1RIUkVTSE9MRCk7XG4gICAgICAgIGF3YWl0IHBvc3RXaXRoUmV0cnkoe1xuICAgICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgICAgIFtIRFJfQ0hVTktdOiBjaHVua0lELFxuICAgICAgICAgICAgW0hEUl9DSFVOS19JTkRFWF06IFN0cmluZyhpKSxcbiAgICAgICAgICAgIFtIRFJfQ0hVTktfVE9UQUxdOiBTdHJpbmcodG90YWwpLFxuICAgICAgICB9LCBzbGljZSwgc2lnbmFsKTtcbiAgICB9XG59XG5cbi8vIEEgNDI5IG1lYW5zIHRoZSBHbyBoYW5kbGVyIGhhcyBub3QgdGFrZW4gZGVsaXZlcnkgb2Ygd2hhdCBpcyBhbHJlYWR5IHF1ZXVlZC5cbi8vIFJldHJ5aW5nIHRoZSBzYW1lIGZyYW1lIGtlZXBzIG9yZGVyaW5nICh0aGUgc2VuZCBjaGFpbiBoYXMgbm90IG1vdmVkIG9uKSBhbmRcbi8vIGxlYXZlcyB0aGUgcmVxdWVzdCBzbG90IGZyZWUsIHdoaWNoIGlzIHdoYXQgc3RvcHMgYSBiYWNrZWQtdXAgY29ubmVjdGlvbiBmcm9tXG4vLyBzdGFydmluZyB0aGUgd2luZG93J3MgcG9sbC5cbmFzeW5jIGZ1bmN0aW9uIHBvc3RXaXRoUmV0cnkoaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiwgYm9keTogVWludDhBcnJheSwgc2lnbmFsPzogQWJvcnRTaWduYWwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBOZXZlciByZXRyeSB3aXRoIHplcm8gZGVsYXkuIFRoZSByZWNlaXZlciBiZWluZyBiZWhpbmQgaXMgYSBjb25kaXRpb25cbiAgICAvLyB0aGF0IHRha2VzIHRpbWUgdG8gY2xlYXIsIGFuZCBhbiBpbW1lZGlhdGUgcmV0cnkgaXMgYSBidXN5IGxvb3Agb2ZcbiAgICAvLyBmZXRjaGVzIOKAlCBlYWNoIG9uZSBhIHNjaGVtZS1oYW5kbGVyIHJvdW5kIHRyaXAsIGFuZCBvbiB0aGUgaG9zdCBhIGNnb1xuICAgIC8vIGNhbGwuIFN0YXJ0IGF0IDEgbXMgYW5kIHJhbXAuXG4gICAgbGV0IHdhaXQgPSAxO1xuICAgIGZvciAoOzspIHtcbiAgICAgICAgaWYgKHNpZ25hbD8uYWJvcnRlZCkgdGhyb3cgbmV3IFN0cmVhbVJlcXVlc3RDYW5jZWxsZWQoKTtcbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKHN0cmVhbVVSTChcInNlbmRcIiksIHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgYm9keTogYm9keSBhcyBCb2R5SW5pdCxcbiAgICAgICAgICAgIHNpZ25hbCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXNwLm9rKSByZXR1cm47XG4gICAgICAgIGlmIChyZXNwLnN0YXR1cyAhPT0gNDI5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYXdhaXQgcmVzcC50ZXh0KCkpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHNsZWVwKHdhaXQsIHNpZ25hbCk7XG4gICAgICAgIHdhaXQgPSBNYXRoLm1pbih3YWl0ICogMiwgNTApO1xuICAgIH1cbn1cblxuLy8gcG9zdEJhdGNoIHNlbmRzIHNldmVyYWwgZGF0YSBmcmFtZXMgZm9yIG9uZSBjb25uZWN0aW9uIGluIGJvdW5kZWQgcmVxdWVzdHMuXG4vLyBCb2R5OiBjb3VudCB1MzIsIHRoZW4gY291bnQgeCAoIGxlbiB1MzIgfCBwYXlsb2FkICkuIFRoZSBjb21iaW5lZCBib2R5IHN0YXlzXG4vLyB3aXRoaW4gQ0hVTktfVEhSRVNIT0xEOiBzZXZlcmFsIGluZGl2aWR1YWxseSBzbWFsbCBmcmFtZXMgbXVzdCBub3QgcmVjcmVhdGVcbi8vIHRoZSBXZWJWaWV3MiBib2R5LXNpemUgcHJvYmxlbSB0aGF0IGNodW5raW5nIHNpbmdsZSBsYXJnZSBmcmFtZXMgYXZvaWRzLlxuYXN5bmMgZnVuY3Rpb24gcG9zdEJhdGNoKGNvbm5JRDogbnVtYmVyLCBmcmFtZXM6IFVpbnQ4QXJyYXlbXSwgc2lnbmFsPzogQWJvcnRTaWduYWwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgc3RhcnQgPSAwO1xuICAgIHdoaWxlIChzdGFydCA8IGZyYW1lcy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGZyYW1lc1tzdGFydF0uYnl0ZUxlbmd0aCA+IENIVU5LX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgYXdhaXQgcG9zdEZyYW1lKGNvbm5JRCwgS0lORF9EQVRBLCBmcmFtZXNbc3RhcnRdLCB1bmRlZmluZWQsIHNpZ25hbCk7XG4gICAgICAgICAgICBzdGFydCsrO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZW5kID0gc3RhcnQ7XG4gICAgICAgIGxldCBzaXplID0gNDsgLy8gZnJhbWUgY291bnRcbiAgICAgICAgd2hpbGUgKGVuZCA8IGZyYW1lcy5sZW5ndGggJiYgZW5kIC0gc3RhcnQgPCBNQVhfQkFUQ0hfRlJBTUVTKSB7XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGZyYW1lc1tlbmRdO1xuICAgICAgICAgICAgaWYgKGZyYW1lLmJ5dGVMZW5ndGggPiBDSFVOS19USFJFU0hPTEQgfHwgc2l6ZSArIDQgKyBmcmFtZS5ieXRlTGVuZ3RoID4gQ0hVTktfVEhSRVNIT0xEKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaXplICs9IDQgKyBmcmFtZS5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgZW5kKys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBIG5lYXItdGhyZXNob2xkIGZyYW1lIGZpdHMgYXMgYSBub3JtYWwgUE9TVCBib2R5IGJ1dCBub3QgaW5zaWRlIGFcbiAgICAgICAgLy8gYmF0Y2ggb25jZSBpdHMgY291bnQgYW5kIGxlbmd0aCBoZWFkZXJzIGFyZSBpbmNsdWRlZC5cbiAgICAgICAgaWYgKGVuZCA9PT0gc3RhcnQpIHtcbiAgICAgICAgICAgIGF3YWl0IHBvc3RGcmFtZShjb25uSUQsIEtJTkRfREFUQSwgZnJhbWVzW3N0YXJ0XSwgdW5kZWZpbmVkLCBzaWduYWwpO1xuICAgICAgICAgICAgc3RhcnQrKztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ3JvdXAgPSBmcmFtZXMuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgICAgIGlmIChncm91cC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIGF3YWl0IHBvc3RGcmFtZShjb25uSUQsIEtJTkRfREFUQSwgZ3JvdXBbMF0sIHVuZGVmaW5lZCwgc2lnbmFsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHBvc3RCYXRjaEdyb3VwKGNvbm5JRCwgZ3JvdXAsIHNpZ25hbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhcnQgPSBlbmQ7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBwb3N0QmF0Y2hHcm91cChjb25uSUQ6IG51bWJlciwgZnJhbWVzOiBVaW50OEFycmF5W10sIHNpZ25hbD86IEFib3J0U2lnbmFsKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGZyYW1lcy5sZW5ndGggPT09IDAgfHwgZnJhbWVzLmxlbmd0aCA+IE1BWF9CQVRDSF9GUkFNRVMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBzdHJlYW0gYmF0Y2ggc2l6ZVwiKTtcbiAgICB9XG5cbiAgICBsZXQgYm9keSA9IGJ1aWxkQmF0Y2goZnJhbWVzKTtcbiAgICBsZXQgc2VudCA9IDA7XG4gICAgbGV0IHdhaXQgPSAxO1xuICAgIGZvciAoOzspIHtcbiAgICAgICAgaWYgKHNpZ25hbD8uYWJvcnRlZCkgdGhyb3cgbmV3IFN0cmVhbVJlcXVlc3RDYW5jZWxsZWQoKTtcbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKHN0cmVhbVVSTChcInNlbmRcIiksIHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgW0hEUl9TRVNTSU9OXTogRy5zZXNzaW9uLFxuICAgICAgICAgICAgICAgIFtIRFJfR0VORVJBVElPTl06IFN0cmluZyhHLmdlbmVyYXRpb24pLFxuICAgICAgICAgICAgICAgIFtIRFJfQ09OTl06IFN0cmluZyhjb25uSUQpLFxuICAgICAgICAgICAgICAgIFtIRFJfS0lORF06IFN0cmluZyhLSU5EX0RBVEEpLFxuICAgICAgICAgICAgICAgIFtIRFJfQkFUQ0hdOiBTdHJpbmcoZnJhbWVzLmxlbmd0aCAtIHNlbnQpLFxuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogYm9keSBhcyBCb2R5SW5pdCxcbiAgICAgICAgICAgIHNpZ25hbCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXNwLm9rKSByZXR1cm47XG4gICAgICAgIGlmIChyZXNwLnN0YXR1cyAhPT0gNDI5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYXdhaXQgcmVzcC50ZXh0KCkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRoZSByZWNlaXZlciB0b29rIGEgcHJlZml4IG9mIHRoZSBiYXRjaC4gUmVzZW5kIG9ubHkgd2hhdCBpcyBsZWZ0LFxuICAgICAgICAvLyB3aGljaCBrZWVwcyBvcmRlcmluZyB3aXRob3V0IHJlLWRlbGl2ZXJpbmcgYW55dGhpbmcuXG4gICAgICAgIGNvbnN0IGFjY2VwdGVkID0gTnVtYmVyKHJlc3AuaGVhZGVycy5nZXQoSERSX0JBVENIKSA/PyAwKTtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nID0gZnJhbWVzLmxlbmd0aCAtIHNlbnQ7XG4gICAgICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihhY2NlcHRlZCkgfHwgYWNjZXB0ZWQgPCAwIHx8IGFjY2VwdGVkID49IHJlbWFpbmluZykge1xuICAgICAgICAgICAgLy8gWmVybyBpcyB2YWxpZCAobm8gcHJvZ3Jlc3MpLCBidXQgYW4gb3V0LW9mLXJhbmdlIGFja25vd2xlZGdlbWVudFxuICAgICAgICAgICAgLy8gaXMgYSBwcm90b2NvbCBlcnJvci4gS2VlcCB6ZXJvIG9uIHRoZSByZXRyeSBwYXRoIGJlbG93LlxuICAgICAgICAgICAgaWYgKGFjY2VwdGVkICE9PSAwKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIHN0cmVhbSBiYXRjaCBhY2tub3dsZWRnZW1lbnRcIik7XG4gICAgICAgIH1cbiAgICAgICAgc2VudCArPSBhY2NlcHRlZDtcbiAgICAgICAgYm9keSA9IGJ1aWxkQmF0Y2goZnJhbWVzLnNsaWNlKHNlbnQpKTtcbiAgICAgICAgYXdhaXQgc2xlZXAod2FpdCwgc2lnbmFsKTtcbiAgICAgICAgd2FpdCA9IE1hdGgubWluKHdhaXQgKiAyLCA1MCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBidWlsZEJhdGNoKGZyYW1lczogVWludDhBcnJheVtdKTogVWludDhBcnJheSB7XG4gICAgbGV0IHNpemUgPSA0O1xuICAgIGZvciAoY29uc3QgZiBvZiBmcmFtZXMpIHNpemUgKz0gNCArIGYuYnl0ZUxlbmd0aDtcbiAgICBjb25zdCBvdXQgPSBuZXcgVWludDhBcnJheShzaXplKTtcbiAgICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KG91dC5idWZmZXIpO1xuICAgIHZpZXcuc2V0VWludDMyKDAsIGZyYW1lcy5sZW5ndGgpO1xuICAgIGxldCBvZmYgPSA0O1xuICAgIGZvciAoY29uc3QgZiBvZiBmcmFtZXMpIHtcbiAgICAgICAgdmlldy5zZXRVaW50MzIob2ZmLCBmLmJ5dGVMZW5ndGgpO1xuICAgICAgICBvZmYgKz0gNDtcbiAgICAgICAgb3V0LnNldChmLCBvZmYpO1xuICAgICAgICBvZmYgKz0gZi5ieXRlTGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBzdGFydFBvbGxpbmcoKTogdm9pZCB7XG4gICAgaWYgKEcucG9sbGluZyB8fCAhaGFzRE9NKSByZXR1cm47XG4gICAgRy5wb2xsaW5nID0gdHJ1ZTtcbiAgICB2b2lkIHBvbGxMb29wKCk7XG59XG5cbi8qKlxuICogT25lIHBvbGwgZm9yIHRoZSB3aG9sZSBwYWdlLCBzaGFyZWQgYnkgZXZlcnkgY29ubmVjdGlvbi5cbiAqXG4gKiBUaGVyZSBpcyBubyBwb2xsaW5nIGludGVydmFsIGFuZCBub3RoaW5nIGFkYXB0aXZlIGhlcmUgb24gcHVycG9zZS4gVGhlIHNlcnZlclxuICogaG9sZHMgdGhlIHJlcXVlc3QgdW50aWwgYSBmcmFtZSBleGlzdHMsIHNvIGRlbGl2ZXJ5IGxhdGVuY3kgaXMgYWxyZWFkeSB+MCBhbmRcbiAqIGEgY2xpZW50LXNpZGUgaW50ZXJ2YWwgY291bGQgb25seSBhZGQgdG8gaXQuIEZyYW1lcyB0aGF0IGFycml2ZSB3aGlsZSBhXG4gKiByZXNwb25zZSBpcyBpbiBmbGlnaHQgc2ltcGx5IGFjY3VtdWxhdGUgYW5kIHJpZGUgdGhlIG5leHQgb25lLCB3aGljaCBtYWtlc1xuICogdGhlIHJvdW5kIHRyaXAgaXRzZWxmIHRoZSBiYXRjaGluZyB3aW5kb3cg4oCUIGl0IHdpZGVucyBhcyBsb2FkIHJpc2VzIHdpdGhvdXRcbiAqIGFueXRoaW5nIGhhdmluZyB0byBtZWFzdXJlIGl0LlxuICovXG5hc3luYyBmdW5jdGlvbiBwb2xsTG9vcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgYmFja29mZiA9IDA7XG4gICAgY29uc3QgYWJvcnQgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgRy5wb2xsQWJvcnQgPSBhYm9ydDtcblxuICAgIHdoaWxlIChHLmNvbm5lY3Rpb25zLnNpemUgPiAwKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goc3RyZWFtVVJMKFwicG9sbFwiKSwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFtIRFJfU0VTU0lPTl06IEcuc2Vzc2lvbixcbiAgICAgICAgICAgICAgICAgICAgW0hEUl9HRU5FUkFUSU9OXTogU3RyaW5nKEcuZ2VuZXJhdGlvbiksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWNoZTogXCJuby1zdG9yZVwiLFxuICAgICAgICAgICAgICAgIHNpZ25hbDogYWJvcnQuc2lnbmFsLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PT0gNDEwKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHNlc3Npb24gaXMgZ29uZTogYXBwIHNodXR0aW5nIGRvd24sIHdpbmRvdyBjbG9zZWQsIG9yIHdlXG4gICAgICAgICAgICAgICAgLy8gd2VyZSByZWFwZWQgYXMgdW5yZWFjaGFibGUuIE5vdGhpbmcgdG8gcmV0cnkuXG4gICAgICAgICAgICAgICAgY2xvc2VBbGwoMTAwMSwgXCJzZXNzaW9uIGNsb3NlZFwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcmVzcC5vayAmJiByZXNwLnN0YXR1cyAhPT0gMjA0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1JldHJ5YWJsZVBvbGxTdGF0dXMocmVzcC5zdGF0dXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhaWxBbGwoXCJzdHJlYW0gcG9sbCBmYWlsZWQ6IFwiICsgcmVzcC5zdGF0dXMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicmV0cnlhYmxlIHN0cmVhbSBwb2xsIGZhaWx1cmU6IFwiICsgcmVzcC5zdGF0dXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBiYWNrb2ZmID0gMDtcbiAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cyAhPT0gMjA0KSB7XG4gICAgICAgICAgICAgICAgbGV0IGJ1ZjogQXJyYXlCdWZmZXI7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYnVmID0gYXdhaXQgcmVzcC5hcnJheUJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgR28gcXVldWUgd2FzIGNvbnN1bWVkIHdoZW4gdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgLy8gd2FzIHByb2R1Y2VkLiBSZXRyeWluZyBjYW5ub3QgcmVjb3ZlciBhIGJvZHkgdGhhdCB3YXNcbiAgICAgICAgICAgICAgICAgICAgLy8gaW50ZXJydXB0ZWQgYWZ0ZXIgdGhhdCBwb2ludCwgc28gc3VyZmFjZSB0aGUgbG9zcyBhbmRcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcCBpbnN0ZWFkIG9mIHNpbGVudGx5IGNvbnRpbnVpbmcgd2l0aCBtaXNzaW5nIGZyYW1lcy5cbiAgICAgICAgICAgICAgICAgICAgZmFpbEFsbChcInN0cmVhbSBwb2xsIHJlc3BvbnNlIGJvZHkgZmFpbGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgZnJhbWVzID0gZGVjb2RlRnJhbWVzKGJ1Zik7XG4gICAgICAgICAgICAgICAgaWYgKGZyYW1lcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIGZyYW1pbmcgbWlzbWF0Y2ggbWVhbnMgYSBzdGFsZSBjYWNoZWQgcnVudGltZSBhZ2FpbnN0IGFcbiAgICAgICAgICAgICAgICAgICAgLy8gbmV3ZXIgR28gc2lkZS4gUmV0cnlpbmcgY2Fubm90IGZpeCB0aGF0LCBhbmQgbGV0dGluZyBpdFxuICAgICAgICAgICAgICAgICAgICAvLyBmYWxsIGludG8gdGhlIGJhY2tvZmYgYmVsb3cgd291bGQgc3BpbiBzaWxlbnRseSBmb3JldmVyLFxuICAgICAgICAgICAgICAgICAgICAvLyBzbyBmYWlsIGV2ZXJ5IGNvbm5lY3Rpb24gd2l0aCBhIHJlYXNvbiBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgICAgICBjbG9zZUFsbCgxMDAyLCBcInVucmVjb2duaXNlZCBzdHJlYW0gZnJhbWluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlbGl2ZXIoZnJhbWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlLXBvbGwgaW1tZWRpYXRlbHksIG9uIGRhdGEgYW5kIG9uIGFuIGV4cGlyZWQgaG9sZCBhbGlrZS5cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoYWJvcnQuc2lnbmFsLmFib3J0ZWQgfHwgRy5jb25uZWN0aW9ucy5zaXplID09PSAwKSBicmVhaztcbiAgICAgICAgICAgIGJhY2tvZmYgPSBiYWNrb2ZmID8gTWF0aC5taW4oYmFja29mZiAqIDIsIEJBQ0tPRkZfTUFYKSA6IEJBQ0tPRkZfTUlOO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcChiYWNrb2ZmLCBhYm9ydC5zaWduYWwpO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoRy5wb2xsQWJvcnQgPT09IGFib3J0KSBHLnBvbGxBYm9ydCA9IHVuZGVmaW5lZDtcbiAgICBHLnBvbGxpbmcgPSBmYWxzZTtcblxuICAgIC8vIEEgY29ubmVjdGlvbiBvcGVuZWQgd2hpbGUgd2Ugd2VyZSB3aW5kaW5nIGRvd246IHBpY2sgdGhlIGxvb3AgYmFjayB1cC5cbiAgICBpZiAoRy5jb25uZWN0aW9ucy5zaXplID4gMCkge1xuICAgICAgICBzdGFydFBvbGxpbmcoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzUmV0cnlhYmxlUG9sbFN0YXR1cyhzdGF0dXM6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBzdGF0dXMgPT09IDQwOCB8fCBzdGF0dXMgPT09IDQyNSB8fCBzdGF0dXMgPT09IDQyOSB8fCAoc3RhdHVzID49IDUwMCAmJiBzdGF0dXMgPD0gNTk5KTtcbn1cblxuaW50ZXJmYWNlIEluRnJhbWUge1xuICAgIGNvbm5JRDogbnVtYmVyO1xuICAgIGtpbmQ6IG51bWJlcjtcbiAgICBwYXlsb2FkOiBBcnJheUJ1ZmZlcjtcbn1cblxuLy8gVmFsaWRhdGUgdGhlIGNvbXBsZXRlIHJlc3BvbnNlIGJlZm9yZSBkaXNwYXRjaGluZyBhbnkgcGFydCBvZiBpdC4gQSBzaG9ydFxuLy8gcGxhdGZvcm0gcmVzcG9uc2UgbXVzdCBub3QgZGVsaXZlciBhIHZhbGlkIHByZWZpeCBhbmQgdGhlbiB0aHJvdyBSYW5nZUVycm9yOlxuLy8gdGhlIEdvIHF1ZXVlIGhhcyBhbHJlYWR5IGJlZW4gZHJhaW5lZCwgc28gcmV0cnlpbmcgY2Fubm90IHJlY292ZXIgdGhvc2Vcbi8vIGZyYW1lcy4gVHJlYXQgdGhlIHdob2xlIHJlc3BvbnNlIGFzIGEgcHJvdG9jb2wgZXJyb3IgaW5zdGVhZC5cbmZ1bmN0aW9uIGRlY29kZUZyYW1lcyhidWY6IEFycmF5QnVmZmVyKTogSW5GcmFtZVtdIHwgbnVsbCB7XG4gICAgaWYgKGJ1Zi5ieXRlTGVuZ3RoIDwgOSkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgZHYgPSBuZXcgRGF0YVZpZXcoYnVmKTtcbiAgICBpZiAoZHYuZ2V0VWludDgoMCkgIT09IDB4NTcgfHwgZHYuZ2V0VWludDgoMSkgIT09IDB4NTMgfHxcbiAgICAgICAgZHYuZ2V0VWludDgoMikgIT09IDB4MzEgfHwgZHYuZ2V0VWludDgoMykgIT09IDB4MDAgfHxcbiAgICAgICAgKGR2LmdldFVpbnQ4KDQpICYgfjEpICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGNvdW50ID0gZHYuZ2V0VWludDMyKDUpO1xuICAgIGNvbnN0IGZyYW1lczogSW5GcmFtZVtdID0gW107XG4gICAgbGV0IG9mZiA9IDk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgaWYgKG9mZiArIDkgPiBidWYuYnl0ZUxlbmd0aCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IGNvbm5JRCA9IGR2LmdldFVpbnQzMihvZmYpOyBvZmYgKz0gNDtcbiAgICAgICAgY29uc3Qga2luZCA9IGR2LmdldFVpbnQ4KG9mZik7IG9mZiArPSAxO1xuICAgICAgICBjb25zdCBsZW4gPSBkdi5nZXRVaW50MzIob2ZmKTsgb2ZmICs9IDQ7XG4gICAgICAgIGlmIChraW5kID4gS0lORF9FUlJPUiB8fCBsZW4gPiBidWYuYnl0ZUxlbmd0aCAtIG9mZikgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBidWYuc2xpY2Uob2ZmLCBvZmYgKyBsZW4pOyBvZmYgKz0gbGVuO1xuICAgICAgICBmcmFtZXMucHVzaCh7IGNvbm5JRCwga2luZCwgcGF5bG9hZCB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2ZmID09PSBidWYuYnl0ZUxlbmd0aCA/IGZyYW1lcyA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIGRlbGl2ZXIoZnJhbWVzOiBJbkZyYW1lW10pOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGZyYW1lIG9mIGZyYW1lcykge1xuICAgICAgICBjb25zdCBjb25uSUQgPSBmcmFtZS5jb25uSUQ7XG4gICAgICAgIGNvbnN0IGtpbmQgPSBmcmFtZS5raW5kO1xuICAgICAgICBjb25zdCBwYXlsb2FkID0gZnJhbWUucGF5bG9hZDtcbiAgICAgICAgY29uc3QgY29ubiA9IEcuY29ubmVjdGlvbnMuZ2V0KGNvbm5JRCk7XG4gICAgICAgIGlmICghY29ubikgY29udGludWU7XG5cbiAgICAgICAgc3dpdGNoIChraW5kKSB7XG4gICAgICAgICAgICBjYXNlIEtJTkRfREFUQTpcbiAgICAgICAgICAgICAgICBjb25uLl9tZXNzYWdlKHBheWxvYWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLSU5EX09QRU46XG4gICAgICAgICAgICAgICAgY29ubi5fb3BlbmVkKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtJTkRfQ0xPU0U6XG4gICAgICAgICAgICAgICAgY29ubi5fY2xvc2VkKDEwMDAsIFwiXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLSU5EX0VSUk9SOlxuICAgICAgICAgICAgICAgIGNvbm4uX2ZhaWwobmV3IEVycm9yKG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwYXlsb2FkKSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjbG9zZUFsbChjb2RlOiBudW1iZXIsIHJlYXNvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBjb25uIG9mIFsuLi5HLmNvbm5lY3Rpb25zLnZhbHVlcygpXSkge1xuICAgICAgICBjb25uLl9jbG9zZWQoY29kZSwgcmVhc29uLCBmYWxzZSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmYWlsQWxsKHJlYXNvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBjb25uIG9mIFsuLi5HLmNvbm5lY3Rpb25zLnZhbHVlcygpXSkge1xuICAgICAgICBjb25uLl9mYWlsKG5ldyBFcnJvcihyZWFzb24pKTtcbiAgICB9XG59XG4iLCIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuaW1wb3J0ICogYXMgUnVudGltZSBmcm9tIFwiLi4vQGJhaWxzL3J1bnRpbWUvc3JjXCI7XG5cbmltcG9ydCB7IEVuYWJsZSBhcyBFbmFibGVXTUwgfSBmcm9tIFwiLi4vQGJhaWxzL3J1bnRpbWUvc3JjL3dtbFwiO1xuaW1wb3J0IHsgZGVidWdMb2cgfSBmcm9tIFwiLi4vQGJhaWxzL3J1bnRpbWUvc3JjL3V0aWxzXCI7XG5cbndpbmRvdy5iYWlscyA9IFJ1bnRpbWU7XG5FbmFibGVXTUwoKTtcblxuaWYgKERFQlVHKSB7XG4gICAgZGVidWdMb2coXCJCYWlscyBSdW50aW1lIExvYWRlZFwiKVxufVxuIiwiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8vIFNldHVwXG5pbXBvcnQgeyBoYXNET00gfSBmcm9tIFwiLi9lbnZpcm9ubWVudC5qc1wiO1xuXG5pZiAoaGFzRE9NKSB7XG4gICAgd2luZG93Ll9iYWlscyA9IHdpbmRvdy5fYmFpbHMgfHwge307XG59XG5cbmltcG9ydCBcIi4vY29udGV4dG1lbnUuanNcIjtcbmltcG9ydCBcIi4vZHJhZy5qc1wiO1xuaW1wb3J0IFwiLi9hcHByZWdpb24uanNcIjtcblxuLy8gUmUtZXhwb3J0IHB1YmxpYyBBUElcbmltcG9ydCAqIGFzIEFwcGxpY2F0aW9uIGZyb20gXCIuL2FwcGxpY2F0aW9uLmpzXCI7XG5pbXBvcnQgKiBhcyBCcm93c2VyIGZyb20gXCIuL2Jyb3dzZXIuanNcIjtcbmltcG9ydCAqIGFzIENhbGwgZnJvbSBcIi4vY2FsbHMuanNcIjtcbmltcG9ydCAqIGFzIENsaXBib2FyZCBmcm9tIFwiLi9jbGlwYm9hcmQuanNcIjtcbmltcG9ydCAqIGFzIENyZWF0ZSBmcm9tIFwiLi9jcmVhdGUuanNcIjtcbmltcG9ydCAqIGFzIERpYWxvZ3MgZnJvbSBcIi4vZGlhbG9ncy5qc1wiO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gXCIuL2V2ZW50cy5qc1wiO1xuaW1wb3J0ICogYXMgRmxhZ3MgZnJvbSBcIi4vZmxhZ3MuanNcIjtcbmltcG9ydCAqIGFzIFNjcmVlbnMgZnJvbSBcIi4vc2NyZWVucy5qc1wiO1xuaW1wb3J0ICogYXMgU3lzdGVtIGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuaW1wb3J0ICogYXMgSU9TIGZyb20gXCIuL2lvcy5qc1wiO1xuaW1wb3J0ICogYXMgQW5kcm9pZCBmcm9tIFwiLi9hbmRyb2lkLmpzXCI7XG5pbXBvcnQgKiBhcyBVcGRhdGVyIGZyb20gXCIuL3VwZGF0ZXIuanNcIjtcbmltcG9ydCBXaW5kb3csIHsgaGFuZGxlRHJhZ0VudGVyLCBoYW5kbGVEcmFnTGVhdmUsIGhhbmRsZURyYWdPdmVyIH0gZnJvbSBcIi4vd2luZG93LmpzXCI7XG5pbXBvcnQgKiBhcyBXTUwgZnJvbSBcIi4vd21sLmpzXCI7XG5pbXBvcnQgeyBTdHJlYW0sIEpTT05TdHJlYW0sIEJhaWxzU29ja2V0LCB0eXBlIEpTT05Tb2NrZXQgfSBmcm9tIFwiLi9zdHJlYW0uanNcIjtcblxuZXhwb3J0IHtcbiAgICBBcHBsaWNhdGlvbixcbiAgICBCcm93c2VyLFxuICAgIENhbGwsXG4gICAgQ2xpcGJvYXJkLFxuICAgIERpYWxvZ3MsXG4gICAgRXZlbnRzLFxuICAgIEZsYWdzLFxuICAgIFNjcmVlbnMsXG4gICAgU3lzdGVtLFxuICAgIElPUyxcbiAgICBBbmRyb2lkLFxuICAgIFVwZGF0ZXIsXG4gICAgV2luZG93LFxuICAgIFdNTCxcbiAgICBTdHJlYW0sXG4gICAgSlNPTlN0cmVhbSxcbiAgICBCYWlsc1NvY2tldCxcbiAgICB0eXBlIEpTT05Tb2NrZXRcbn07XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgdXRpbGl0eSBjb25zdW1lZCBieSB0aGUgYmluZGluZyBnZW5lcmF0b3IuXG4gKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgeyBDcmVhdGUgfTtcblxuZXhwb3J0ICogZnJvbSBcIi4vY2FuY2VsbGFibGUuanNcIjtcblxuLy8gRXhwb3J0IHRyYW5zcG9ydCBpbnRlcmZhY2VzIGFuZCB1dGlsaXRpZXNcbmV4cG9ydCB7XG4gICAgc2V0VHJhbnNwb3J0LFxuICAgIGdldFRyYW5zcG9ydCxcbiAgICB0eXBlIFJ1bnRpbWVUcmFuc3BvcnQsXG4gICAgb2JqZWN0TmFtZXMsXG4gICAgY2xpZW50SWQsXG59IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcblxuaW1wb3J0IHsgY2xpZW50SWQgfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5cbi8vIE5vdGlmeSBiYWNrZW5kXG5pZiAoaGFzRE9NKSB7XG4gICAgd2luZG93Ll9iYWlscy5pbnZva2UgPSBTeXN0ZW0uaW52b2tlO1xuICAgIHdpbmRvdy5fYmFpbHMuY2xpZW50SWQgPSBjbGllbnRJZDtcbn1cblxuLy8gUmVnaXN0ZXIgcGxhdGZvcm0gaGFuZGxlcnMgKGludGVybmFsIEFQSSlcbi8vIE5vdGU6IFdpbmRvdyBpcyB0aGUgdGhpc1dpbmRvdyBpbnN0YW5jZSAoZGVmYXVsdCBleHBvcnQgZnJvbSB3aW5kb3cudHMpXG4vLyBCaW5kaW5nIGVuc3VyZXMgJ3RoaXMnIGNvcnJlY3RseSByZWZlcnMgdG8gdGhlIGN1cnJlbnQgd2luZG93IGluc3RhbmNlXG5pZiAoaGFzRE9NKSB7XG4gICAgd2luZG93Ll9iYWlscy5oYW5kbGVQbGF0Zm9ybUZpbGVEcm9wID0gV2luZG93LkhhbmRsZVBsYXRmb3JtRmlsZURyb3AuYmluZChXaW5kb3cpO1xufVxuXG4vLyBMaW51eC1zcGVjaWZpYyBkcmFnIGhhbmRsZXJzIChHVEsgaW50ZXJjZXB0cyBET00gZHJhZyBldmVudHMpXG5pZiAoaGFzRE9NKSB7XG4gICAgd2luZG93Ll9iYWlscy5oYW5kbGVEcmFnRW50ZXIgPSBoYW5kbGVEcmFnRW50ZXI7XG4gICAgd2luZG93Ll9iYWlscy5oYW5kbGVEcmFnTGVhdmUgPSBoYW5kbGVEcmFnTGVhdmU7XG4gICAgd2luZG93Ll9iYWlscy5oYW5kbGVEcmFnT3ZlciA9IGhhbmRsZURyYWdPdmVyO1xufVxuXG5pZiAoaGFzRE9NKSB7XG4gICAgU3lzdGVtLmludm9rZShcImJhaWxzOnJ1bnRpbWU6cmVhZHlcIik7XG59XG5cbi8qKlxuICogTG9hZHMgYSBzY3JpcHQgZnJvbSB0aGUgZ2l2ZW4gVVJMIGlmIGl0IGV4aXN0cy5cbiAqIFVzZXMgSEVBRCByZXF1ZXN0IHRvIGNoZWNrIGV4aXN0ZW5jZSwgdGhlbiBpbmplY3RzIGEgc2NyaXB0IHRhZy5cbiAqIFNpbGVudGx5IGlnbm9yZXMgaWYgdGhlIHNjcmlwdCBkb2Vzbid0IGV4aXN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZE9wdGlvbmFsU2NyaXB0KHVybDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwgeyBtZXRob2Q6ICdIRUFEJyB9KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICAvLyBWZXJpZnkgdGhlIHJlc3BvbnNlIGlzIGFjdHVhbGx5IEphdmFTY3JpcHQgYW5kIG5vdCBhbiBIVE1MIGZhbGxiYWNrXG4gICAgICAgICAgICAgICAgLy8gKGUuZy4gVml0ZSBkZXYgc2VydmVyIHJldHVybnMgaW5kZXguaHRtbCBmb3IgdW5rbm93biByb3V0ZXMpXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSAocmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGlmIChjb250ZW50VHlwZS5pbmNsdWRlcygnamF2YXNjcmlwdCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgICAgICAgICBzY3JpcHQuc3JjID0gdXJsO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4ge30pOyAvLyBTaWxlbnRseSBpZ25vcmUgLSBzY3JpcHQgaXMgb3B0aW9uYWxcbn1cblxuLy8gTG9hZCBjdXN0b20uanMgaWYgYXZhaWxhYmxlICh1c2VkIGJ5IHNlcnZlciBtb2RlIGZvciBXZWJTb2NrZXQgZXZlbnRzLCBldGMuKVxuaWYgKGhhc0RPTSkge1xuICAgIGxvYWRPcHRpb25hbFNjcmlwdCgnL2JhaWxzL2N1c3RvbS5qcycpO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBaUJhLFNBQVMsT0FBTyxXQUFXLGVBQWUsT0FBTyxhQUFhOzs7OztBQ3NCM0UsU0FBZ0IsT0FBTyxPQUFlLElBQVk7Q0FDOUMsTUFBTSxTQUFTLE9BQU8sV0FBVyxlQUFlLE9BQU8sT0FBTyxvQkFBb0IsYUFDNUUsU0FDQTtDQUVOLElBQUksUUFBUTtFQUNSLE1BQU0sUUFBUSxJQUFJLFdBQVcsSUFBSTtFQUNqQyxPQUFPLGdCQUFnQixLQUFLO0VBQzVCLElBQUksS0FBSztFQUNULEtBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxNQUFNLEtBQ3RCLE1BQU0sWUFBWSxNQUFNLEtBQUs7RUFFakMsT0FBTztDQUNYO0NBSUEsSUFBSSxLQUFLO0NBQ1QsSUFBSSxJQUFJLE9BQU87Q0FDZixPQUFPLEtBQ0gsTUFBTSxZQUFh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