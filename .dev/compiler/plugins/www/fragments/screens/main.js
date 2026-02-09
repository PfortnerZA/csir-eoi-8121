
	function(NS)
	{
		style(

			'.' + NS                   , {display : 'flex', flexDirection : 'column'},
			'.' + NS + 'HEAD'          , {alignItems : 'center', backgroundColor : '#fff', display : 'flex', color : '#000', flexDirection : 'row', flexShrink : 0, padding : '0.5em'},
			'.' + NS + 'HEAD p'        , {alignItems : 'center', borderRadius : '4px', cursor : 'pointer', display : 'flex', height : '3em', justifyContent : 'center', transition : 'all 0.3s', width : '3em'},
			'.' + NS + 'HEAD p::before', {fontSize : '1.6em'},
			'.' + NS + 'HEAD p:hover'  , {backgroundColor : 'rgba(128, 128, 128, 0.3)'},
			'.' + NS + 'HEAD img'      , {height : '2em', marginLeft : '0.3em'},
			'.' + NS + 'BODY'          , {backgroundImage : 'linear-gradient(#eee, transparent)', display : 'flex', flex : 1, flexDirection : 'row', minHeight : 0},
			'.' + NS + 'SIDE'          , {overflowX : 'hidden', overflowY : 'auto', transition : 'all 0.3s', width : '20em'},
			'.' + NS + 'VIEW'          , {flex : 'auto', overflowX : 'hidden', overflowY : 'auto'},

			'[data-theme=dark] .' + NS + 'HEAD', {backgroundColor : '#1e2936', color : '#fff'},
			'[data-theme=dark] .' + NS + 'BODY', {backgroundImage : 'linear-gradient(180deg, rgba(50, 70, 80, 0.9), #0d101b)'},

			'@media (max-width: 767px)', [

				'.' + NS + 'BODY > p.ON', {backgroundColor : 'rgba(0, 0, 0, 0.2)', inset : 0, position : 'fixed', zIndex : 8},
				'.' + NS + 'SIDE'       , {backgroundColor : '#fff', bottom : 0, color : '#000', left : 0, position : 'fixed', top : 0, zIndex : 9},
				'.' + NS + 'SIDE.NO'    , {pointerEvents : 'none', transform : 'translateX(-100%)', visibility : 'hidden'},

				'[data-theme=dark] .' + NS + 'SIDE', {backgroundColor : 'rgba(44, 56, 70, 0.98)', color : '#fff'}

			],
			'@media (min-width: 768px)', [

				'.' + NS + 'BODY'   , {overflow : 'hidden'},
				'.' + NS + 'SIDE'   , {flexShrink : 0},
				'.' + NS + 'SIDE.ON', {pointerEvents : 'none', marginLeft : '-20em', visibility : 'hidden'}

			]

		);

		let
			head = this.add('div', { className : NS + 'HEAD' }),
			body = this.add('div', { className : NS + 'BODY' }),
			side = body.add('div'),
			menu = side.add('div'),
			view = body.add('div', { className : NS + 'VIEW' }),
			wrap = body.add('p'),
			find = control('search', 'Location or Lat Long').attachTo(menu),
			tree = control('treeview').attachTo(menu),
			mqtt = control('mqtt').attachTo(view),
			cast = control('weather').attachTo(view),
			hwnd = {

				open : false,

				refresh : function()
				{
					let open = this.open ? 'ON' : 'NO';
					side.className = NS + 'SIDE ' + open;
					wrap.className = open;
				},

				toggle : function(v)
				{
					this.open = v ? false : !this.open;
					this.refresh();
				}

			};

		hwnd.refresh();
		head.add('p', { className : 'fa-solid fa-bars', onclick : () => hwnd.toggle() });
		head.add('img', { src : reqres('logos/logo.png') });
		wrap.onclick = () => hwnd.toggle(true);

		tree.onclick  = v => {

			if (v) {

				hwnd.toggle(true);
				cast.show(v);

			}

		};
		find.onchange = v => {

			let ltlg = v && v.match(/([\d\.\-]+)[\s,]+([\d\.\-]+)/);
			if (ltlg) {

				tree.sync([{

					id    : Date.now(),
					icon  : 'fa-solid fa-location-dot',
					color : '#ec4f4f',
					text  : 'GPS',
					desc  : ltlg[1] + ', ' + ltlg[2],
					lat   : parseFloat(ltlg[1]) || 0,
					lng   : parseFloat(ltlg[2]) || 0

				}]);

			} else if (v) {

				reqfun('weather/search', { name : v }, res => {

					let data = {};
					if (res && res.code === 200) {Object.values(res.data).forEach(item => {

						let
							node = data,
							list = String(item.path).split(';'),
							name, i;

						for (i = 0; i < list.length; ++i) {

							name = list[i];
							node[name] = node[name] || ((i < list.length - 1) ? {

								id    : name,
								icon  : i ? 'fa-solid fa-signs-post' : 'fa-solid fa-earth-americas',
								text  : name,
								flags : tree.NOCLICK,
								sync  : {}

							} : {

								id    : name,
								icon  : 'fa-solid fa-location-dot',
								color : '#ec4f4f',
								text  : name,
								desc  : item.lat + ', ' + item.lng,
								lat   : item.lat,
								lng   : item.lng,
								sync  : {}

							});
							node = node[name].sync;

						}

					});}

					tree.sync(data);

				});

			} else {

				tree.sync([

					{ id : 0, icon : 'fa-solid fa-earth-americas', text : 'Examples', flags : tree.OPEN | tree.NOCLICK, sync : [

						{
							id    : 1,
							icon  : 'fa-solid fa-location-dot',
							color : '#ec4f4f',
							text  : 'Pretoria',
							lat   : -25.74486,
							lng   :  28.18783
						},
						{
							id    : 2,
							icon  : 'fa-solid fa-location-dot',
							color : '#ec4f4f',
							text  : 'Rome',
							lat   : 41.89193,
							lng   : 12.51133
						},
						{
							id    : 3,
							icon  : 'fa-solid fa-location-dot',
							color : '#ec4f4f',
							text  : 'Brazil',
							lat   : -10,
							lng   : -55
						}

					] }

				]);

			}

		};

		find.onchange();
		cast.show({

			lat : -25.75,
			lng :  28.25

		});

		this.ontick = function(time)
		{
			cast.tick(time);
		};

		setTimeout(() => this.show(), 500);

	}
