
	function(NS)
	{
		style(

			'.' + NS                        , {borderBottom : '1px solid rgba(128, 128, 128, 0.5)', margin : '1em', paddingBottom : '1em'},
			'.' + NS + ' input::placeholder', {color : 'inherit', opacity : 0.5},
			'.' + NS + ' input'             , {backgroundColor : '#fff', border : '1px solid rgba(128, 128, 128, 0.5)', borderRadius : '0.4em', color : '#000', padding : '0.7em', transition : 'border-color 1s, box-shadow 1s', width : '100%'}

		);
		return function(desc)
		{
			let
				text = this.add('input', { type : 'text', placeholder : desc || '' }),
				last = '',
				hwnd = {

					onchange : FN_EMPTY

				}, id;

			text.onkeyup = text.oninput = () => {

				let data = text.value.trim();
				if (id) {clearTimeout(id); id = 0;}
				if (last !== data) {id = setTimeout(() => {id = 0; last = data; hwnd.onchange(data);}, 900);}

			};

			return hwnd;
		};
	}
