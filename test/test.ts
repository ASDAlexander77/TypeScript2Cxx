var f = function ()
{
	const i = 10;
	return function() {
		return i;
	};
}

f()();