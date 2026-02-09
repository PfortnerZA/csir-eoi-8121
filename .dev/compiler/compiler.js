
	const root = __dirname.replace(/\\/g, '/').replace(/\/+$/ig, '');
	const fs   = require('node:fs');
	const mini = require('uglify-js');

	function adaptivCompressJS(code)
	{
		return true ? mini.minify(code, { toplevel : true }).code : code;
	}

	function adaptivDirectives(code, data)
	{
		/*
			ADAPTIV.FUNCTIONS();
			ADAPTIV.FRAGMENT('screens/', '{comma}{file}:{data}');
			ADAPTIV.FRAGMENT('widgets/', '{comma}{file:lower,trim}:{data:trim}');
			ADAPTIV.FRAGMENT('(widgets|controls)/', '{comma}"{file}":{data}');
		*/
		function transform(data, type)
		{
			if (type) {type.split(',').forEach(i => {switch (i.trim()) {

				case 'trim'  : data = data.trim();        break;
				case 'lower' : data = data.toLowerCase(); break;
				case 'upper' : data = data.toUpperCase(); break;

			}});}
			return data;
		}
		return String(code).replace(/(?:\/\/\s*|\/\*\s*)?ADAPTIV\.(\w+)\((.*?)\);\s(?:\s*\*\/)?/g, (_, type, args) => {

			args = args.split('').reduce((q => (s, c) => {

				if (/['"`]/.test(c) && (!q || q === c)) {q = !q && c;} else
				if (q) {s += c;} else
				if (',' === c) {s += '\n';}
				return s;

			})(), '').split('\n');

			switch (type.toLowerCase())
			{
				case 'functions' : return Object.keys(data.functions).reduce((o, i) => o + (o ? ',' : '') + `'${i}':` + fs.readFileSync(data.functions[i], 'utf8').trim(), '');
				case 'fragment'  : let rexp = new RegExp(args[0]); return Object.keys(data.fragments).reduce((o, i) => (o + (rexp.test(i) ? String(args[1]).replace(/{([^}]+)}/g, (_, type) => {

					type = type.split(':');
					switch (type[0].trim())
					{
						case 'data'  : return transform(adaptivDirectives(fs.readFileSync(data.fragments[i], 'utf8'), data), type[1]);
						case 'file'  : return transform(String(i).split('/').pop(), type[1]);
						case 'path'  : return transform(String(i).replace(rexp, ''), type[1]);
						case 'comma' : return o ? ',' : '';
						default      : return _;
					}

				}) : '')), '');

				default : return _;
			}

		});
	}

	fs.readdirSync(`${root}/plugins`).map(name => {

		let
			plug = `${root}/plugins/${name}`,
			init = `${plug}/index.js`,
			dirs = {

				fragments : 3,
				functions : 3,
				languages : 1,
				resources : 2

			},
			data = fs.existsSync(init) && Object.fromEntries(Object.keys(dirs).map(i => {

				let
					path = `${plug}/${i}/`,
					opts = dirs[i],
					list = [''],
					file = {};

				for (let i = 0; i < list.length; ++i)
				{
					let j = path + list[i];
					if (fs.existsSync(j)) {fs.readdirSync(j).forEach(k => {
						if (fs.statSync(j + k).isFile()) {if (!/^[#.]|^thumbs\.db$/i.test(k)) {
							file[list[i] + ((1 & opts) ? k.replace(/\.[^.]*$/, '') : k)] = j + k;
						}} else if (2 & opts) {
							list.push(`${list[i]}${k}/`);
						}
					});}
				}
				return [i, file];

			}));

		if (data) {

			let dest = `./lib/plugins/${name}`;
			fs.rm(dest, { force : true, recursive : true }, () => fs.mkdir(dest, { recursive : true }, () => {

				fs.writeFileSync(`${dest}/index.js`, adaptivCompressJS(adaptivDirectives(fs.readFileSync(init, 'utf8'), data)), 'utf8');

				Object.keys(data.resources).forEach(i => {
					let file = `${dest}/resources/${i}`;
					fs.mkdir(file.replace(/\/[^\/]*$/, ''), { recursive : true }, () => {switch (file.toLowerCase().split('.').pop())
					{
						case 'js' : fs.writeFileSync(file, adaptivCompressJS(adaptivDirectives(fs.readFileSync(data.resources[i], 'utf8'), data)), 'utf8'); break;
						default   : fs.copyFile(data.resources[i], file, 0, () => {});
					}});
				});

				if (Object.keys(data.languages).length) {
					fs.mkdir(`${dest}/languages`, { recursive : true }, () => Object.keys(data.languages).forEach(i =>
					fs.writeFileSync(`${dest}/languages/` + i.toLowerCase() + '.json', JSON.stringify(
					fs.readFileSync(data.languages[i], 'utf8').split('\n').reduce((o, i) => {

						let j = i.indexOf('=');
						if (j > 0) {o[i.slice(0, j).trim()] = i.slice(j + 1).trim().replace(/\\\\n/g, '\n');}
						return o;

					}, { '*' : i.toLowerCase() })), 'utf8')));
				}

			}));

			console.log(name, '=>', data); //TODO: REMOVE

		}

	});
