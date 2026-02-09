
	'use strict';

	const http  = require('node:http');
	const https = require('node:https');
	const fs    = require('node:fs');

	globalThis.APP_PATH    = __dirname.replace(/\\/g, '/').replace(/\/+$/ig, '');
	globalThis.ENV         = (env => {let ini = {}, sec = ini; env.split('\n').forEach(i => {i = i.trim(); if (i && (/^[^;#]/).test(i)) {let j = i.match(/^\[([^\]]+)\]/), k = j ? j[1].trim() : i.indexOf('='); if (j) {ini[k] = sec = ini[k] || {};} else if (k > 0) {j = i.slice(k + 1).trim(); sec[i.slice(0, k).trim()] = (/^-?(0|[1-9]\d*)(\.\d+)?$/).test(j) ? Number(j) : j;}}}); return ini;})(fs.readFileSync(`${APP_PATH}/.env`, 'utf8'));
	globalThis.bool        = v => (v === '0') ? false : !!v;
	globalThis.float       = v => (v === true) ? 1 : v && parseFloat(v) || 0;
	globalThis.int         = v => (v === true) ? 1 : v && parseInt(v, 10) || 0;
	globalThis.str         = v => (!v && v !== 0) ? '' : (v === true) ? '1' : String(v);
	globalThis.include     = v => require(`${APP_PATH}/lib/includes/${v}.js`);
	globalThis.contentType = (mime => file => mime[String(file).toLowerCase().split('.').pop()] || mime.bin)
	({
		apng  : 'image/apng',
		bin   : 'application/octet-stream',
		css   : 'text/css',
		eot   : 'application/vnd.ms-fontobject',
		gif   : 'image/gif',
		html  : 'text/html; charset=utf-8',
		ico   : 'image/x-icon',
		jpeg  : 'image/jpeg',
		jpg   : 'image/jpeg',
		js    : 'text/javascript; charset=utf-8',
		json  : 'application/json; charset=utf-8',
		mp4   : 'video/mp4',
		pdf   : 'application/pdf',
		png   : 'image/png',
		svg   : 'image/svg+xml',
		ttf   : 'font/ttf',
		txt   : 'text/plain',
		webp  : 'image/webp',
		woff  : 'font/woff',
		woff2 : 'font/woff2',
		xml   : 'application/xml'
	});

	http.IncomingMessage.prototype.acceptLanguage = function(    ) {return String(this.headers['accept-language'] || '').toLowerCase().split(',').map(i => i.trim().split(/\W/g)[0] || 'en');};
	http.OutgoingMessage.prototype.send           = function(data) {if (data === null || data === undefined) {this.end();} else if (data instanceof Promise) {data.then(data => this.send(data)).catch(() => this.end());} else if ('string' === typeof data || Buffer.isBuffer(data)) {if (!this.getHeader('Content-Type')) {this.setHeader('Content-Type', contentType(Buffer.isBuffer(data) ? 'bin' : 'html'));} this.end(data);} else {this.setHeader('Content-Type', contentType('json')).end(JSON.stringify(data));} return this;};
	http.OutgoingMessage.prototype.writeFile      = function(path) {let file = fs.isFileSync(path); if (file) {let pipe = fs.createReadStream(path); pipe.pipe(this.writeHead(200, { 'Content-Length' : file.size, 'Content-Type' : contentType(path), 'Expires' : (new Date(Date.now() + 604800000)).toUTCString() }));} else {this.writeHead(404).end();}};
	fs.isFileSync                                 = function(path) {try {let stat = path && this.statSync(path); return (stat && stat.isFile()) ? stat : false;} catch (e) {return false;}};

	const adapters = fs.readdirSync(`${APP_PATH}/lib/adapters`).reduce((res, dir) => {let func = (/\.js$/i).test(dir) && require(`${APP_PATH}/lib/adapters/${dir}`); if (func) {res.push(Array.isArray(func) ? func : [5, func]);} return res;}, []).sort((a, b) => b[0] - a[0]).map(i => i[1]);
	const plugins  = fs.readdirSync(`${APP_PATH}/lib/plugins` ).reduce((dic => (res, dir) => {

		let func, lang, plug = {

			onevent : null, // (e, ...args) => { return 'optional_output'; }

			name    : dir,
			path    : `${APP_PATH}/lib/plugins/${dir}`,
			version : '1.0.0',
			expose  : {},

			function    :         (name, ...args) => !(func && func[name]) ? false : func[name](...args) || null,
			functionUrl : function(name         ) {return `/request/function/${this.name}/${name}`;},
			resource    : function(path         ) {return `${this.path}/resources/${path}`;},
			resourceUrl : function(path         ) {return `/request/resource/${this.name}/${path}`;},
			language    :         (name         ) => lang ? Object.assign({}, lang.en, !name ? null : Array.isArray(name) ? name.reduce((o, i) => o || lang[i], null) : lang[name]) : {},
			raiseEvent  :         (name, ...args) => Object.values(res).reduce((o, i) => i.onevent && i.onevent(String(name), ...args) || o, null)

		};
		if (fs.isFileSync(`${plug.path}/index.js`))
		{
			func = require(`${plug.path}/index.js`)(plug);
			lang = dic(`${plug.path}/languages`);
			res[plug.name] = plug;
			console.log(`Plugin: ${plug.name} v${plug.version}` + ((lang && Object.keys(lang).length) ? ' [' + Object.keys(lang).join(', ') + ']' : '')); //DEBUG
		}
		return res;

	})(path => fs.existsSync(path) && fs.readdirSync(path).reduce((res, dir) => {

		let lang = (/\.json$/i).test(dir) && require(`${path}/${dir}`);
		if (lang) {res[lang['*']] = lang;}
		return res;

	}, {})), {});

	http.createServer((out => (req, res) => {let i = adapters.length, j = () => {--i; if (i < 0) {out(req, res);} else {adapters[i](j, req, res);}}; j();})((req, res) => {

		req.urlPath = req.url.split('?')[0].replace(/^[ /]+|[ /]+$/g, '').replace(/\.+/g, '.');
		req.urlHash = '';

		let api = req.urlPath.match(/^request\/(function|resource|language|features)\/?([^/]*)\/?([\w\W]*)$/);
		if (api) {switch (api[1]) {

			case 'function' : {let plug = plugins[api[2]], data = plug && plug.function(api[3], req, res); if (data) {res.send(data);} else if (!plug || data === false) {res.writeHead(404).end();} break;}
			case 'resource' :  res.writeFile(plugins[api[2]] && plugins[api[2]].resource(api[3])); break;
			case 'language' :  res.send(plugins[api[2]] && plugins[api[2]].language(api[3] || req.acceptLanguage())); break;
			case 'features' :  res.send(Object.fromEntries(Object.keys(plugins).map(i => [i, plugins[i].version]))); break;

		}} else if (fs.isFileSync(`${APP_PATH}/res/${req.urlPath}`)) {

			res.writeFile(`${APP_PATH}/res/${req.urlPath}`);

		} else {

			let
				path = req.urlPath || '!',
				list = Object.values(plugins),
				find, plug, func,
				i, j;

			router: do {i = Math.max(i ? path.lastIndexOf('/', i - 1) : path.length, 0);

				find = i ? path.slice(0, i) : '*';

				for (j = 0; j < list.length; ++j) {

					plug = list[j];
					func = plug.expose[find];

					if (func) {

						req.urlHash = i ? path.slice(i + 1) : req.urlPath;
						let data = plug.function(func, req, res);
						if (data) {res.send(data);} else if (data === false) {res.writeHead(500).end(`Invalid plugin endpoint ${plug.name}:${func}`);}
						break router;

					}

				}
				if (!i) {res.end('No default route found');}

			} while (i);

		}

	})).listen(80, () => console.log('HTTP has started')); //DEBUG
