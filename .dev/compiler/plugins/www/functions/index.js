
	(req, res) => (

		'<!DOCTYPE html>' +
		'<html lang="en">' +
			'<head>' +
				'<meta charset="utf-8">' +
				'<meta name="viewport" content="height=device-height, width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, minimal-ui">' +
				'<meta name="apple-mobile-web-app-capable" content="yes">' +
				'<meta name="mobile-web-app-capable" content="yes">' +
				'<meta name="description" content="' + plugin.description + '">' +
				'<meta name="theme-color" content="' + plugin.theme + '">' +
				'<meta property="og:type" content="website">' +
				'<meta property="og:title" content="' + plugin.title + '">' +
				'<meta property="og:description" content="' + plugin.description + '">' +
				'<title>' + plugin.title + '</title>' +
				'<link rel="apple-touch-icon" href="' + plugin.resourceUrl('logos/apple-touch-icon.png') + '">' +
				'<link rel="manifest" href="/manifest.json" crossorigin="use-credentials">' +
				'<link rel="stylesheet" href="/assets/fonts/fontawesome/all.css">' + // https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css
				'<script src="/assets/plugins/mqttjs/mqtt.min.js"></script>' +
			'</head>' +
			'<body>' +
				'<script id="data" type="text/plain">' + encodeURIComponent(JSON.stringify({ plugin : plugin.name, version : plugin.version, mqtt_host : ENV.mqtt.host, mqtt_port : ENV.mqtt.port })) + '</script>' +
				'<script id="lang" type="text/plain">' + encodeURIComponent(JSON.stringify(plugin.language(req.acceptLanguage()))) + '</script>' +
				'<script defer src="' + plugin.resourceUrl('scripts/main.js') + '?' + plugin.version + '"></script>' +
			'</body>' +
		'</html>'

	)
