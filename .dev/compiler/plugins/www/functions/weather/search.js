
	/*

		name

	*/

	async (req, res) => {

		let
			gets = new URLSearchParams({ name : req.post.name }),
			http = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${gets.toString()}`);

		if (http.ok) {

			let
				json = await http.json(),
				code = json && json.results;

			return {

				code : code ? 200 : 0,
				data : code && Object.values(json.results).map(item => ({

					path : (item.country || item.name) + ';' + (item.admin1 ? item.admin1 + ';' : '') + item.name,
					lat  : item.latitude,
					lng  : item.longitude

				}))

			};

		}

	}
