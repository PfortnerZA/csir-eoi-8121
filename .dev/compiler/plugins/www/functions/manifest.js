
	// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest

	() => ({

		name             : plugin.title,
		short_name       : plugin.title,
		description      : plugin.description,
		background_color : plugin.theme,
		theme_color      : plugin.theme,
		start_url        : '/',
		display          : 'standalone',
		icons            : [{

			src   : plugin.resourceUrl('logos/manifest.png'),
			type  : contentType('png'),
			sizes : '512x512'

		}]

	})
