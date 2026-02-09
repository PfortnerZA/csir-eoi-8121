
	/*
		https://gist.github.com/stellasphere/9490c195ed2b53c707087c8c2db4ec0c
		https://open-meteo.com/en/docs
	*/

	function(NS)
	{
		style(

			'.' + NS                     , {display : 'flex', flexDirection : 'column', gap : '1em', margin : '1em'},
			'.' + NS + ' .HEAD'          , {backgroundImage : 'linear-gradient(transparent, rgba(0, 70, 203, 0.5))', border : '1px solid #888', borderRadius : '1rem', flexShrink : 0, fontSize : '1.2em', overflow : 'hidden', padding : '1rem'},
			'.' + NS + ' .HEAD span'     , {float : 'right'},
			'.' + NS + ' .HEAD img'      , {display : 'block', margin : 'auto', maxWidth : '15em', width : '70%'},
			'.' + NS + ' .BODY'          , {display : 'grid', gap : '4px', flex : 'auto', gridTemplateColumns : 'repeat(4, 1fr)'},
			'.' + NS + ' .BODY > div'    , {backgroundColor : '#c9c9c9', borderRadius : '0.8em', color : '#000', padding : '0.5em', textAlign : 'center'},
			'.' + NS + ' .BODY > div img', {width : '70%'},
			'.' + NS + ' .BODY > div.ON' , {backgroundImage : 'linear-gradient(transparent, rgba(0, 159, 255, 0.75))', textShadow : '1px 1px 2px #fff'},

			'@media (min-width: 768px)' , [

				'.' + NS + ' .BODY', {gridTemplateColumns : 'repeat(6, 1fr)'}

			],
			'@media (min-width: 1024px)', [

				'.' + NS           , {flexDirection : 'row'},
				'.' + NS + ' .HEAD', {display : 'flex', flexDirection : 'column', flex : '0 0 25%'},
				'.' + NS + ' .BODY', {gridTemplateColumns : 'repeat(8, 1fr)'}

			]

		);
		return function()
		{
			let
				head = this.add('div', { className : 'HEAD' }),
				body = this.add('div', { className : 'BODY' }),
				last = null,
				actv = null,
				utco = 0,
				list = {},
				icon = {

					 '0d' : { desc : 'Sunny', icon : '01d' }, '0n' : { desc : 'Clear', icon : '01n' },
					 '1d' : { desc : 'Mainly Sunny', icon : '01d' }, '1n' : { desc : 'Mainly Clear', icon : '01n' },
					 '2d' : { desc : 'Partly Cloudy', icon : '02d' }, '2n' : { desc : 'Partly Cloudy', icon : '02n' },
					 '3d' : { desc : 'Cloudy', icon : '03d' }, '3n' : { desc : 'Cloudy', icon : '03n' },
					'45d' : { desc : 'Foggy', icon : '50d' }, '45n' : { desc : 'Foggy', icon : '50n' },
					'48d' : { desc : 'Rime Fog', icon : '50d' }, '48n' : { desc : 'Rime Fog', icon : '50n' },
					'51d' : { desc : 'Light Drizzle', icon : '09d' }, '51n' : { desc : 'Light Drizzle', icon : '09n' },
					'53d' : { desc : 'Drizzle', icon : '09d' }, '53n' : { desc : 'Drizzle', icon : '09n' },
					'55d' : { desc : 'Heavy Drizzle', icon : '09d' }, '55n' : { desc : 'Heavy Drizzle', icon : '09n' },
					'56d' : { desc : 'Light Freezing Drizzle', icon : '09d' }, '56n' : { desc : 'Light Freezing Drizzle', icon : '09n' },
					'57d' : { desc : 'Freezing Drizzle', icon : '09d' }, '57n' : { desc : 'Freezing Drizzle', icon : '09n' },
					'61d' : { desc : 'Light Rain', icon : '10d' }, '61n' : { desc : 'Light Rain', icon : '10n' },
					'63d' : { desc : 'Rain', icon : '10d' }, '63n' : { desc : 'Rain', icon : '10n' },
					'65d' : { desc : 'Heavy Rain', icon : '10d' }, '65n' : { desc : 'Heavy Rain', icon : '10n' },
					'66d' : { desc : 'Light Freezing Rain', icon : '10d' }, '66n' : { desc : 'Light Freezing Rain', icon : '10n' },
					'67d' : { desc : 'Freezing Rain', icon : '10d' }, '67n' : { desc : 'Freezing Rain', icon : '10n' },
					'71d' : { desc : 'Light Snow', icon : '13d' }, '71n' : { desc : 'Light Snow', icon : '13n' },
					'73d' : { desc : 'Snow', icon : '13d' }, '73n' : { desc : 'Snow', icon : '13n' },
					'75d' : { desc : 'Heavy Snow', icon : '13d' }, '75n' : { desc : 'Heavy Snow', icon : '13n' },
					'77d' : { desc : 'Snow Grains', icon : '13d' }, '77n' : { desc : 'Snow Grains', icon : '13n' },
					'80d' : { desc : 'Light Showers', icon : '09d' }, '80n' : { desc : 'Light Showers', icon : '09n' },
					'81d' : { desc : 'Showers', icon : '09d' }, '81n' : { desc : 'Showers', icon : '09n' },
					'82d' : { desc : 'Heavy Showers', icon : '09d' }, '82n' : { desc : 'Heavy Showers', icon : '09n' },
					'85d' : { desc : 'Light Snow Showers', icon : '13d' }, '85n' : { desc : 'Light Snow Showers', icon : '13n' },
					'86d' : { desc : 'Snow Showers', icon : '13d' }, '86n' : { desc : 'Snow Showers', icon : '13n' },
					'95d' : { desc : 'Thunderstorm', icon : '11d' }, '95n' : { desc : 'Thunderstorm', icon : '11n' },
					'96d' : { desc : 'Light Thunderstorms With Hail', icon : '11d' }, '96n' : { desc : 'Light Thunderstorms With Hail', icon : '11n' },
					'99d' : { desc : 'Thunderstorm With Hail', icon : '11d' }, '99n' : { desc : 'Thunderstorm With Hail', icon : '11n' }

				};

			const details = (base => {

				let
					info = base.add('div'),
					time = info.add('span'),
					name = info.add('p'),
					icon = base.add('img'),
					cast = base.add('div'),
					temp = cast.add('span'),
					desc = cast.add('p');

				return {

					name : text => name.textContent = text || 'GPS',
					time : text => time.textContent = text || '12:00 am',
					show : data => {

						icon.src = reqres('weather/' + data.icon + '@2x.png');
						desc.textContent = data.desc;
						temp.textContent = data.temperature + data.temperature_unit;

					}

				};

			})(head);

			function Hour(id)
			{
				this.base = body.add('div');
				this.base.add('h1', { textContent : ((id % 12) || 12) + ((id > 11) ? ' p.m' : ' a.m') });
				this.icon = this.base.add('img');
				this.temp = this.base.add('div');
				list[id]  = this;
			}
			Hour.prototype = {

				notify  : function() {details.show(this.data);},
				refresh : function() {this.base.className = (this === actv) ? 'ON' : '';},
				select  : function()
				{
					let prev = actv;
					if (this !== actv)
					{
						actv = this;
						if (prev) {prev.refresh();}
						actv.refresh();
						actv.notify();
					}
				},

				update : function(data)
				{
					this.data     = data;
					this.icon.src = reqres('weather/' + data.icon + '@2x.png');
					this.temp.textContent = data.temperature + data.temperature_unit;
					if (this === actv) {this.notify();}
				}

			};

			return {

				add  : function(id, data) {return (list[id] || new Hour(id)).update(data);},
				show : function(data)
				{
					let
						next = Date.now();
						last = next;

					reqfun('weather/forecast', { lat : data.lat, lng : data.lng }, res => {

						if (next === last && res && res.code === 200) {

							details.name(data.text);
							utco = res.data.offset;
							Object.values(res.data.hourly).forEach((item, i) => this.add(i, Object.assign({}, icon[item.weather_code + (item.is_day ? 'd' : 'n')] || icon['0d'], item)));

						}

					});
				},

				tick : function(time)
				{
					let
						date = new Date(time + (utco * 1000)),
						hour = date.getUTCHours();

					if (list[hour]) {list[hour].select();}
					details.time(((hour % 12) || 12) + ':' + String(date.getUTCMinutes()).padStart(2, '0') +  ((hour > 11) ? ' p.m' : ' a.m'));
				}

			};
		};
	}
