
	/*

		ME
			DAT
			DIC

		FN_EMPTY

		add
		on
		send
		style
		colorscheme
		lang
		reqres
		reqfun

		control

	*/

	(function(ME)
	{
		'use strict'; const

	/////////////////////////////////////////////////////////////////////////////
	// GLOBAL CONSTANTS
	/////////////////////////////////////////////////////////////////////////////

		FN_EMPTY = () => {},

	/////////////////////////////////////////////////////////////////////////////
	// GLOBAL FUNCTIONS
	/////////////////////////////////////////////////////////////////////////////

		/**
		 * Creates a new extended element object of the specified tag type
		 * @param string tag The type of element to create eg. div, img, text (the att field becomes the text nodes string)
		 * @param object att An optional object specifying new or replacement attributes eg. { innerHTML : 'Content', onclick : function() {}, style : { backgroundColor : '#f00' }, inline : { autoplay : true } }
		 * @param integer opt An optional constant to attach the new element as a SIBLING and/or return the PARENT element
		 * @return object A new element object
		 */
		add = (function(FLAG_SIBLING, FLAG_PARENT)
		{
			let $ = (ext => (tag, att) => {

				let element;
				if ('text' !== tag) {
					element = ('object' === typeof tag) ? tag : document.createElement(tag);
					element.add = ext.add;
					ext.att(element, att);
				} else {
					element = document.createTextNode(att);
				}
				return element;

			})({

				add : function(tag, att, opt) {let element = ((FLAG_SIBLING & opt) && this.parentNode || this).appendChild($(tag, att)); return (FLAG_PARENT & opt) ? element.parentNode : element;},
				att : (() => {let attr = (e, v) => Object.keys(v).forEach(i => e.setAttribute(i, v[i])), prop = (e, v) => Object.keys(v).forEach(i => {if ('object' === typeof v[i]) {if ('inline' === i) {attr(e, v[i]);} else {prop(e[i], v[i]);}} else {e[i] = v[i];}}); return (e, v) => (v && prop(e, v));})()

			});
			$.SIBLING = FLAG_SIBLING;
			$.PARENT  = FLAG_PARENT;
			return $;
		}(1, 2)),

		/**
		 * Attaches/Detaches an event callback function
		 * Returning false from the callback function will remove the event
		 * @param object element The element object to attach the event
		 * @param string type The elements event type, eg. click, mousemove
		 * @param function listener The function to be called when the event is triggered, eg. doSomething, function doSomething(event) {}
		 * @param int flags REMOVE : Removes the previously attached event, ONCE : Execute the callback once then remove the event, CAPTURE : Use captured events
		 * @return boolean Returns True on success
		 * @example
		 *     on(document, "click", function(event) { [code] });
		 *     on(document, "click", function(event) { [code] }, on.REMOVE);
		 *     on(document, "click", function(event) { [code]; return false; });
		 */
		on = (function(touch, count, FLAG_ONCE, FLAG_CAPTURE, FLAG_REMOVE)
		{
			function fixEvent(element, event)
			{
				/* iPad/Phone */ if (touch && event.touches && event.touches.length) {let e = event; event = event.changedTouches[0]; if (!event.preventDefault) {event.preventDefault = function() {e.preventDefault();};} if (!event.stopPropagation) {event.stopPropagation = function() {e.stopPropagation();};}}
				/* elementX|Y */ if (event.pageX !== undefined) {event.elementX = event.pageX; event.elementY = event.pageY; if (element.getBoundingClientRect) {let rect = element.getBoundingClientRect(); event.elementX -= rect.left + (window.scrollX || window.pageXOffset || 0); event.elementY -= rect.top + (window.scrollY || window.pageYOffset || 0);}}
				return event;
			}
			function $(element, type, listener, flags)
			{
				type = (touch && touch[type]) || type;
				listener.APId = listener.APId || ++count;
				const id = type + '.' + listener.APId;
				if (FLAG_REMOVE & flags) {
					if ( element[id]) {element.removeEventListener(type, element[id], !!(FLAG_CAPTURE & flags)); delete element[id]; return true;}} else {
					if (!element[id]) {element[id] = function(event) {if (listener.call(element, fixEvent(element, event)) === false || (FLAG_ONCE & flags)) {$(element, type, listener, flags | FLAG_REMOVE);}}; element.addEventListener(type, element[id], !!(FLAG_CAPTURE & flags)); return true;}}
				return false;
			}
			$.ONCE    = FLAG_ONCE;
			$.CAPTURE = FLAG_CAPTURE;
			$.REMOVE  = FLAG_REMOVE;
			return $;
		}(
			(window.ontouchstart !== undefined) &&
			{
				mousedown : 'touchstart',
				mousemove : 'touchmove',
				mouseup   : 'touchend'
			},
			0, 1, 2, 4
		)),

		/**
		 * Performs an asynchronous request to the server, on response the callback functions are called
		 * @param string url The page to direct the request: '/info.php'
		 * @param object options Options include: { get/post/files/headers : {} / '', oncomplete/onfailure/onsuccess/onprogress : function }
		 */
		send = (getQS => (url, options) => {

			options = options || {}; let
			http    = new XMLHttpRequest(),
			post    = getQS(options.post, options.files),
			head    = {};

			if (post && 'string' === typeof post) {head['Content-Type'] = 'application/x-www-form-urlencoded';}
			if (options.headers) {Object.assign(head, options.headers);}

			http.onreadystatechange = function() {if (this.readyState === 4)
			{
				let
					text = (/application\/json/i).test(this.getResponseHeader('Content-Type')) ? JSON.parse(this.responseText) : this.responseText,
					func = (this.status >= 200 && this.status < 300) ? options.onsuccess : options.onfailure,
					done =  options.oncomplete;

				if (func) {func.call(this, text);}
				if (done) {done.call(this, text);}
			}};
			if (http.upload && options.onprogress) {http.upload.onprogress = options.onprogress;}

			http.open((null === post) ? 'GET' : 'POST', url + (options.get ? '?' + getQS(options.get) : ''), true);
			Object.keys(head).forEach(i => http.setRequestHeader(i, head[i]));
			http.send(post);

		})((data, blob) => {

			if (blob) {

				let form = new FormData();
				if (data) {Object.keys(data).forEach(i => form.append(i, data[i]));}
				Object.keys(blob).forEach(i => Object.values(blob[i].files || [blob[i]]).forEach(j => form.append(i, j, j.name)));
				return form;

			} else if (data) {

				return ('string' === typeof data) ? data : Object.keys(data).map(i => i + '=' + encodeURIComponent(data[i])).join('&');

			} else {

				return null;

			}

		}),

		/**
		 * Sets styling properties to the global stylesheet
		 * @param string selector The classname given to an element eg. 'BODY' or '.myname DIV'
		 * @param mixed styles A collection of styles eg. {backgroundColor : '#000'}
		 * @param [...] selector, styles, selector, styles ...
		 */
		style = ((style, cssText, setStyles) => {

			function $(style, data) {for (let i = 0; i < data.length; i += 2)
			{
				let
					styles = data[i + 1],
					rule   = style.cssRules[style.insertRule(String(data[i]).trim() + ' {}', style.cssRules.length)];

				switch (rule.type)
				{
					case 4  : $(rule, styles); break; // @media
					case 7  : for (let j = 0; j < styles.length; j += 2) {rule.appendRule(styles[j] + ' {' + cssText(styles[j + 1]) + '}');} break; // @keyframes
					default : setStyles(rule, styles);
				}
			}}
			return (...args) => $(style, args);

		})(document.head.appendChild(document.createElement('style')).sheet,

			(      styles) => Object.keys(styles).reduce((o, i) => o + String(i).replace(/[A-Z]/g, a => '-' + a.toLowerCase()) + ':' + styles[i] + ';', ''),
			(rule, styles) => Object.keys(styles).forEach(name => {

				let
					style = rule.style,
					value = styles[name];

				if (/^--/.test(name)) {style.setProperty(name, value);} else
				{
					switch (name)
					{
						case 'float'             : name = 'cssFloat'; break;
						case 'textSizeAdjust'    : style.MozTextSizeAdjust    = value; style.WebkitTextSizeAdjust    = value; break;
						case 'userSelect'        : style.MozUserSelect        = value; style.WebkitUserSelect        = value; break;
						case 'tapHighlightColor' : style.MozTapHighlightColor = value; style.WebkitTapHighlightColor = value; break;
						case 'backdropFilter'    :                                     style.WebkitBackdropFilter    = value; break;
					}
					style[name] = value;
				}

			})

		),

		/**
		 * Detects OS or overrides light and dark mode settings
		 * @param int mode Optional. Sets if the scheme should be detected or specified
		 * @return int Returns the current user defined setting. 0:AUTO, 1:LIGHT, 2:DARK
		 * @example
		 *     colorscheme(colorscheme.AUTO);
		 *     colorscheme(colorscheme.LIGHT);
		 *     colorscheme(colorscheme.DARK);
		 *     console.log(colorscheme());
		 */
		colorscheme = (media => {

			let
				bits = 0,
				name = 'theme',
				show = (v, m) => {bits = (bits & ~m) | (v & m); document.documentElement.setAttribute('data-' + name, ((bits & 6) ? (bits & 4) : (bits & 1)) ? 'dark' : 'light');},
				auto = e => show(e.matches ? 1 : 0, 1),
				hwnd = v => {if (v || v === 0) {show(v << 1, 6); try {localStorage.setItem(name, v);} catch (e) {}} return (bits & 6) >> 1;};

			auto(media);
			if (media.addEventListener) {media.addEventListener('change', auto);} // else if (media.addListener) {media.addListener(auto);}
			try {show(localStorage.getItem(name) << 1, 6);} catch (e) {}

			hwnd.AUTO  = 0;
			hwnd.LIGHT = 1;
			hwnd.DARK  = 2;

			return hwnd;

		})(matchMedia('(prefers-color-scheme: dark)')),

		/**
		 * Returns the language placeholders value
		 * @param string key The placeholders key
		 * @param mixed dat An optional key value pair object for string placeholders: Hi {username}! / {username : 'Name'}
		 * @return string
		 */
		lang = (key, dat) => (

			String(ME.DIC[key] || ME.DIC[String(key).toLowerCase()] || key)
				.replace(/\{([^}]+)\}/g, (i, j) => (dat && dat[j] !== undefined) ? dat[j] : i)

		),

		/**
		 * Plugin resource and function request helpers
		 */
		reqres = (res          ) => '/request/resource/' + ME.DAT.plugin + '/' + res,
		reqfun = (fun, dat, res) => {

			let
				opt = Object.assign({}, ('object' === typeof fun) ? fun : { url : fun }),
				url = '/request/function/' + ME.DAT.plugin + '/' + opt.url;

			if (dat) {
				if ('function' === typeof dat) {opt.oncomplete = dat;} else           {
				if ('function' === typeof res) {opt.oncomplete = res;} opt.post = dat;}
			}
			if (opt.rawurl) {
				return url + (opt.post ? '?' + Object.keys(opt.post).map(i => i + '=' + encodeURIComponent(opt.post[i])).join('&') : '');
			} else {
				send(url, opt);
			}
		};

	/////////////////////////////////////////////////////////////////////////////
	// INITIALIZATION
	/////////////////////////////////////////////////////////////////////////////

		style(

			'*, *::before, *::after'   , {boxSizing : 'inherit', color : 'inherit', fontFamily : 'inherit', fontSize : 'inherit', margin : 0, padding : 0, outline : 0},
			'html, body'               , {height : '100%', overflow : 'hidden'},
			'html'                     , {boxSizing : 'border-box', fontSize : '3.5vw'},
			'body'                     , {backgroundColor : '#fff', color : '#000', fontFamily : 'system-ui, tahoma, verdana, arial, helvetica, sans-serif', position : 'relative', textAlign : 'left'},
			'img'                      , {border : 0, verticalAlign : 'top'},
			'option'                   , {color : 'initial'},
			'[data-theme=dark] body'   , {backgroundColor : '#000', color : '#fff'},
			'@media (min-width: 420px)', [

				'html', {fontSize : 'small'},

				'*'                         , {scrollbarColor : 'rgba(128, 128, 128, 0.5) transparent', scrollbarWidth : 'thin'},
				'*::-webkit-scrollbar'      , {width : '8px'},
				'*::-webkit-scrollbar-thumb', {backgroundColor : 'rgba(128, 128, 128, 0.5)'},
				'*::-webkit-scrollbar-track', {backgroundColor : 'transparent'}

			]

		);
		[

			window,
			document,
			document.head,
			document.body

		].forEach(i => add(i)); const

	/////////////////////////////////////////////////////////////////////////////
	// INTERFACE FUNCTIONS
	/////////////////////////////////////////////////////////////////////////////

		control = ((NS, list, data) => {

			Object.keys(data).forEach(name => list[name] = data[name](NS + name));
			return (name, ...args) => {

				let
					base = add('div', { className : NS + name }),
					ctrl = {

						_ : base,

						onattach : FN_EMPTY,

						add : function(...args) {return base.add(...args);}

					},
					hwnd = list[name].apply(ctrl, args) || {};

				hwnd.attachTo = function(node)
				{
					if (base.parentNode) {base.parentNode.removeChild(base); ctrl.onattach(null);}
					if (node) {(node._ || node).appendChild(base); ctrl.onattach(base.parentNode);}
					return this;
				};
				return hwnd;

			};

		})('CONTROL', {}, {

			/* ADAPTIV.FRAGMENT('controls/', '{comma}{file}:{data}'); */

		});

	/////////////////////////////////////////////////////////////////////////////
	// APPLICATION START
	/////////////////////////////////////////////////////////////////////////////

		((NS, list, data, actv) => {

			style(

				'.' + NS          , {inset : 0, position : 'absolute', transition : 'opacity 1.5s, visibility 1.5s', zIndex : 2},
				'.' + NS + '-HIDE', {opacity : 0, pointerEvents : 'none', visibility : 'hidden', zIndex : 1}

			);
			Object.keys(data).forEach(name => {

				let
					base = document.body.add('div'),
					hwnd = {

						_ : base,

						onhide : FN_EMPTY,
						onload : FN_EMPTY, // func => {console.log('Loading...'); setTimeout(func, 1000); return false;}
						onshow : FN_EMPTY,
						ontick : FN_EMPTY, // time => {console.log(time);} | tick(time => {console.log(time);}, 1000, 5000);

						add     : function(...args) {return base.add(...args);},
						refresh : function() {base.className = NS + ' ' + NS + name + ((actv === this) ? '' : ' ' + NS + '-HIDE'); return this;},
						show    : function(name, ...args) {let item = name && list[name] || this, func = () => {let prev = actv; actv = item; if (prev) {prev.refresh(); prev.onhide();} item.refresh(); item.onshow(...args);}; if (item.onload(func, ...args) !== false) {func();}}

					};

				list[name] = hwnd.refresh();
				data[name].call(hwnd, NS + name);

			});

			setInterval(() => {

				let time = Date.now();
				if (actv) {actv.ontick(time - (time % 2));}

			}, 1000);

		})('SCREEN', {}, {

			/* ADAPTIV.FRAGMENT('screens/', '{comma}{file}:{data}'); */

		});

	}({

		DAT : JSON.parse(decodeURIComponent(document.getElementById('data').textContent)),
		DIC : JSON.parse(decodeURIComponent(document.getElementById('lang').textContent))

	}));
