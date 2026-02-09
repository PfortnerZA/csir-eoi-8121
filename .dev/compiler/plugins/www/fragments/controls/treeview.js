
	/*

		@version 1.0.5

		no_items=No items in this view

		ITEM
		{
			id    : integer
			text  : string
			desc  : string
			icon  : font/url
			color : color
			rank  : integer
			group : integer
			flags : OPEN | CHECKBOX | CHECKED | DESCEND | NOCLICK
			sync  : [ITEM, ...]
		}

	*/

	function(NS)
	{
		style(

			'.' + NS         , {margin : '1em', userSelect : 'none'},
			'.' + NS + ' > p', {opacity : 0.5, padding : '2em 1em', textAlign : 'center'},

			'.' + NS + ' .ITEM > p'          , {alignItems : 'center', backgroundColor : 'rgba(0, 0, 0, 0.1)', border : '1px solid rgba(0, 0, 0, 0.5)', borderRadius : '4px', cursor : 'pointer', display : 'flex', flexDirection : 'row', marginBottom : '2px', transition : 'all 0.3s'},
			'.' + NS + ' .ITEM > p p'        , {backgroundPosition : 'center', backgroundSize : 'cover', borderRadius : '3px', color : '#4fc0ff', flex : '0 0 2.4em', height : '2.4em', margin : '0.5em', position : 'relative'},
			'.' + NS + ' .ITEM > p p::before', {fontSize : '1.6em', left : '50%', position : 'absolute', top : '50%', transform : 'translate(-50%, -50%)'},
			'.' + NS + ' .ITEM > p div'      , {flex : 'auto'},
			'.' + NS + ' .ITEM > p h1'       , {fontWeight : 'normal'},
			'.' + NS + ' .ITEM > p h2'       , {fontSize : '0.8em', fontWeight : 'normal', opacity : 0.7},
			'.' + NS + ' .ITEM > p i'        , {flexShrink : 0, fontSize : '1.2em', padding : '0.5em 0.8em', transition : 'all 0.3s'},
			'.' + NS + ' .ITEM > div'        , {borderLeft : '1px solid rgba(128, 128, 128, 0.5)', borderRadius : '0 0 0 1em', paddingLeft : '1.3em'},
			'.' + NS + ' .ITEM + .LINE'      , {borderTop : '1px solid rgba(128, 128, 128, 0.5)', marginTop : '0.6em', paddingTop : '0.6em'},

			'.' + NS + ' .STUB > p i,.' + NS + ' .STUB > div,.' + NS + ' .SHUT > div', {display : 'none'},

			'.' + NS + ' .ACTV > p'      , {backgroundColor : 'rgba(255, 255, 255, 0.1)'},
			'.' + NS + ' .NORM > p:hover', {backgroundColor : 'rgba(0, 0, 0, 0.2)'},
			'.' + NS + ' .OPEN > p i'    , {transform : 'rotate(90deg)'}

		);
		const
			FLAG_OPEN     =   1,
			FLAG_LINE     =   2,
			FLAG_HOST     =   4,
			FLAG_MARK     =   8,
			FLAG_CHECKBOX =  16,
			FLAG_CHECKED  =  32,
			FLAG_DESCEND  =  64,
			FLAG_NOCLICK  = 128;

		function Item(id, root, flags)
		{
			if (root) {

				this.id                  = id;
				this.root                = root;
				this.root.items[this.id] = this;
				this.root.flags         |= FLAG_HOST;
				this.root.refresh();

				this.base = this.root.view.add('div');
				this.item = this.base.add('p');
				this.icon = this.item.add('p');
				this.text = this.item.add('div').add('h1');
				this.desc = this.text.add('h2', null, add.SIBLING);
				this.plus = this.item.add('i', { className : 'fa-solid fa-caret-right' });
				this.view = this.base.add('div');

				this.item.ondblclick = ( ) => {this.flags ^= FLAG_OPEN; this.refresh();};
				this.item.onclick    = (e) => {if (e.target === this.plus) {this.item.ondblclick();} else {this.select();}};

			} else {

				this.item = id.add('p', { textContent : lang('no_items') });
				this.view = id;

			}
			this.hwnd  = root ? root.hwnd : this;
			this.flags = flags & (FLAG_OPEN | FLAG_CHECKBOX | FLAG_CHECKED | FLAG_DESCEND | FLAG_NOCLICK);
			this.items = {};
			this.refresh();
		}
		Item.prototype = {

			onclick : FN_EMPTY,
			oncheck : FN_EMPTY,

			actv : null,
			data : null,
			tier : null,
			rank : null,

			add : function(data)
			{
				return (this.items[data.id] || new Item(data.id, this, data.flags)).update(data);
			},
			refresh : function()
			{
				let flags = this.flags;
				if (this.base) {

					this.base.className = 'ITEM' + ((FLAG_HOST & flags) ? '' : ' STUB') + ((FLAG_LINE & flags) ? ' LINE' : '') + ((FLAG_OPEN & flags) ? ' OPEN' : ' SHUT') + (((this.hwnd.actv === this) || ((FLAG_CHECKBOX & flags) && (FLAG_CHECKED & flags))) ? ' ACTV' : ' NORM');
					if (FLAG_CHECKBOX & flags) {this.icon.className = 'fa-regular fa-square' + ((FLAG_CHECKED & flags) ? '-check' : '');}

				} else {

					this.item.style.display = (FLAG_HOST & flags) ? 'none' : '';

				}
			},
			remove : function()
			{
				Object.values(this.items).forEach(item => item.remove());
				if (this.hwnd.actv === this) {this.reset();}
				this.base.parentNode.removeChild(this.base);

				delete this.root.items[this.id];
				if (!Object.keys(this.root.items).length)
				{
					this.root.flags &= ~FLAG_HOST;
					this.root.refresh();
				}
			},
			reset : function()
			{
				let
					hwnd = this.hwnd,
					prev = hwnd.actv;

				if (prev)
				{
					hwnd.actv = null;
					prev.refresh();
					hwnd.onclick();
				}
			},
			select : function()
			{
				let
					hwnd = this.hwnd,
					flag = this.flags,
					prev = hwnd.actv;

				if (FLAG_CHECKBOX & flag) {

					this.flags = flag ^ FLAG_CHECKED;
					this.refresh();
					hwnd.oncheck(this.data, !(FLAG_CHECKED & flag));

				} else if (FLAG_NOCLICK & flag) {

					if (FLAG_HOST & flag) {this.flags |= FLAG_OPEN;}
					this.refresh();

				} else if (prev !== this) {

					hwnd.actv = this;
					if (prev) {prev.refresh();}
					if (FLAG_HOST & flag) {this.flags |= FLAG_OPEN;}
					this.refresh();
					hwnd.onclick(this.data);

				}
			},
			sort : function(loop)
			{
				let tier = null;

				Object.values(this.items).sort((i, j) => (i.rank > j.rank) ? ((FLAG_DESCEND & i.flags) ? -1 : 1) : (i.rank < j.rank) ? ((FLAG_DESCEND & i.flags) ? 1 : -1) : 0).forEach(item => {

					let node = item.base.parentNode;
					node.appendChild(node.removeChild(item.base));

					if (tier !== item.tier) {
						item.flags |= FLAG_LINE;
						tier = item.tier;
					} else {
						item.flags &= ~FLAG_LINE;
					}
					item.refresh();

					if (loop) {item.sort(loop);}

				});
				return this;
			},
			sync : function(data)
			{
				Object.values(this.items).forEach(item => item.flags |= FLAG_MARK);
				if (data) {Object.values(data).forEach(data => this.add(data).sync(data.sync).flags &= ~FLAG_MARK);}
				Object.values(this.items).forEach(item => (FLAG_MARK & item.flags) && item.remove());
				return this.sort();
			},
			update : function(data)
			{
				this.data             = data;
				this.icon.style.color = data.color || '';
				this.text.textContent = data.text  || '';
				this.desc.textContent = data.desc  || '';
				this.tier             = data.group ||  5;
				this.rank             = String(this.tier + '|' + (data.rank || 5) + '|' + (data.text || '')).toLowerCase();

				if (FLAG_CHECKBOX & ~this.flags)
				{
					let
						icon = data.icon || 'fas fa-angle-right',
						path = (/[/.]/).test(icon);

					this.icon.style.backgroundImage = path ? 'url(' + icon + ')' : '';
					this.icon.className = path ? '' : icon;
				}
				return this;
			}

		};

		return function()
		{
			let
				root = new Item(this),
				hwnd = {

					OPEN     : FLAG_OPEN,
					CHECKBOX : FLAG_CHECKBOX,
					CHECKED  : FLAG_CHECKED,
					DESCEND  : FLAG_DESCEND,
					NOCLICK  : FLAG_NOCLICK,

					onclick : FN_EMPTY, //  data        => console.log('CLICK', data      );
					oncheck : FN_EMPTY, // (data, tick) => console.log('CHECK', data, tick);

					add   : data => root.add(data),
					reset : (  ) => root.actv && root.actv.reset(),
					sort  : loop => root.sort(loop) && hwnd,
					sync  : data => root.sync(data) && hwnd,
					items : tick => {

						let
							data = [],
							scan = item => Object.values(item.items).forEach(item => {

								if (!tick || ((FLAG_CHECKBOX & item.flags) && (FLAG_CHECKED & item.flags))) {data.push(item.data);}
								scan(item);

							});

						scan(root);
						return data;
					}

				};

			root.onclick =  data        => hwnd.onclick(data      );
			root.oncheck = (data, tick) => hwnd.oncheck(data, tick);

			return hwnd;
		};
	}
