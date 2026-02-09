
	/*

		lat
		lng

	*/

	async (req, res) => {

		let
			post = req.post,
			list = {

				temperature_2m     : 'temperature',
				wind_speed_10m     : 'wind_speed',
				wind_direction_10m : 'wind_direction',
				is_day             : 'is_day',
				weather_code       : 'weather_code'

			},
			gets = new URLSearchParams({

				latitude        : float(post.lat),
				longitude       : float(post.lng),
				hourly          : Object.keys(list).join(','),
			//	current_weather : 'true',
				timezone        : 'auto',
				forecast_days   : 1

			}),
			http = await fetch(`https://api.open-meteo.com/v1/forecast?${gets.toString()}`);

		if (http.ok) {

			let
				json = await http.json(),
				code = json && json.hourly && json.hourly_units;

			return {

				code : code ? 200 : 0,
				data : code && {

					lat    : json.latitude,
					lng    : json.longitude,
					offset : json.utc_offset_seconds,
					hourly : Object.values(Object.keys(json.hourly).reduce((o, i) => {Object.values(json.hourly[i]).forEach((j, k) => {if (!o[k]) {o[k] = {};} if (list[i]) {

						o[k][list[i]] = j;
						if (json.hourly_units[i]) {o[k][list[i] + '_unit'] = json.hourly_units[i];}

					}}); return o;}, {}))

				}

			};

		}

	}
