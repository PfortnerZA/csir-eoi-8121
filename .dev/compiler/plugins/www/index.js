
	module.exports = plugin => {

		plugin.name        = 'www';
		plugin.version     = '1.0.2';
		plugin.title       = 'EOI No. 8121/10/02/2026';
		plugin.description = 'The Provision or supply of Software Development Services to the CSIR';
		plugin.theme       = '#1f344b';
		plugin.expose      = {

			'*'             : 'index',
			'manifest.json' : 'manifest'

		};

		return {

			/* ADAPTIV.FUNCTIONS(); */

		};

	};
