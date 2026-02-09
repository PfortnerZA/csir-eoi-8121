
	/*
		https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
		https://nodejs.org/api/buffer.html
	*/

	const POST_MAX_SIZE = 1048576 * 20; // 20MB

	const query = require('querystring');

	function headerParse(head)
	{
		let
			mode = 0,
			text = '';

		for (let i of String(head)) {

			if (2  &  mode) {mode ^= 2; text += i;} else
			if ('\\' === i) {mode |= 2;} else
			if ( '"' === i) {mode ^= 1;} else {text += mode ? i : (';' === i) ? '\n' : ('=' === i) ? '\t' : i;}

		}
		return text.split('\n').reduce((o, i) => {

			let j = i.split('\t');
			if (j.length > 1) {o[j[0].trim().toLowerCase()] = j[1].trim();} else
			if (i) {o.mime = i.trim().toLowerCase();}
			return o;

		}, {});
	}

	function queryParse(data)
	{
		let list = query.parse(String(data || ''));
		Object.keys(list).forEach(i => {if (Array.isArray(list[i])) {list[i] = list[i].pop();}});
		return list;
	}

	module.exports = (out, req, res) => {

		req.query = queryParse(req.url.split('?')[1]);
		req.files = {};
		req.post  = {};

		if (/POST|PUT|PATCH|DELETE/i.test(req.method)) {

			let
				type = headerParse(req.headers['content-type']),
				size = 0,
				post = [];

			req.on('data', data => {if (size < POST_MAX_SIZE) {

				size += data.length;
				post.push(data);

			} else if (post) {

				post = null;
				res.writeHead(413).end(() => req.destroy());

			}}).on('end', () => {if (post) {post = Buffer.concat(post);

				switch (type.mime)
				{
					case 'application/x-www-form-urlencoded' :      req.post = queryParse(post.toString()); break;
					case 'application/json'                  : try {req.post = JSON.parse(post.toString());} catch (e) {} break;
					case 'multipart/form-data'               :

						let
							find = Buffer.from(`\r\n--${type.boundary}`),
							crlf = Buffer.from('\r\n'),
							rnrn = Buffer.from('\r\n\r\n'),
							prev = 0,
							next = 0,
							info = v => String(v).split('\r\n').reduce((o, i) => {

								let j = i.indexOf(':');
								if (j > 0) {switch (i.slice(0, j).trim().toLowerCase())
								{
									case 'content-disposition' : Object.assign(o, headerParse(i.slice(j + 1))); break;
									case 'content-type' : o.type = i.slice(j + 1).trim(); break;
								}}
								return o;

							}, { type : 'text/plain' });

						do {next = post.indexOf(find, prev); if (next > 0) {

							let
								part = post.subarray(prev + find.length, next),
								grep = part.indexOf(rnrn);
								prev = next + crlf.length;

							if (grep > 0)
							{
								let
									head = info(part.subarray(0, grep).toString()),
									body = part.subarray(grep + rnrn.length);

								req[head.filename ? 'files' : 'post'][head.name] = head.filename ? {

									size : body.length,
									name : head.filename,
									type : head.type,
									data : body

								} : body.toString();
							}

						}} while (next > 0);

						break;

					default : req.post = post.toString();
				}

				out();

			}});

		} else {

			out();

		}

	};
