
	function(NS)
	{
		style(

			'.' + NS           , {border : '1px solid #888', borderRadius : '1rem', margin : '1em', overflow : 'hidden'},
			'.' + NS + ' h1'   , {backgroundColor : 'rgba(128, 128, 128, 0.3)', borderBottom : '1px solid #888', padding : '0.5em', textAlign : 'center'},
			'.' + NS + ' div'  , {display : 'grid', gap : '0.3em', gridTemplateColumns : 'repeat(2, 1fr)', padding : '1em'},
			'.' + NS + ' div p', {textAlign : 'right'},

			'@media (min-width: 1024px)' , [

				'.' + NS + ' div', {gridTemplateColumns : 'repeat(4, 1fr)'}

			]

		);
		return function()
		{
			let
				head   = this.add('h1', { textContent : 'MQTT Ticker ' }).add('span'),
				body   = this.add('div'),
				list   = {},
				client = mqtt.connect('ws://' + (ME.DAT.mqtt_host || location.hostname) + ':' + ME.DAT.mqtt_port + '/mqtt', {

					clientId        : 'mqtt_' + Date.now().toString(16).substr(-8),
					clean           : true,
					connectTimeout  : 4000,
					reconnectPeriod : 1000

				});

			body.add('p', { textContent : 'Last Update :' }); list.time = body.add('b', { textContent : '-' });
			body.add('p', { textContent : 'Temperature :' }); list.temperature = body.add('b', { textContent : '-' });
			body.add('p', { textContent : 'Wind Speed :' }); list.windspeed = body.add('b', { textContent : '-' });
			body.add('p', { textContent : 'Wind Direction :' }); list.winddirection = body.add('b', { textContent : '-' });

			client.on('connect', () => {client.subscribe(['weather/open-meteo/current'], () => head.textContent = '(Online)');});
			client.on('close'  , () => head.textContent = '(Offline)');
			client.on('message', (topic, payload) => {

				let data;
				try {data = JSON.parse(payload.toString());} catch(e) {

					console.log('Invalid Payload');

				}
				if (data) {

					let date = new Date(data.time);

					list.time.textContent          = String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0') + ':' + String(date.getSeconds()).padStart(2, '0');
					list.temperature.textContent   = data.temperature + '°C';
					list.windspeed.textContent     = data.windspeed + 'km/h';
					list.winddirection.textContent = data.winddirection + '°';

				}

			});

		};
	}
