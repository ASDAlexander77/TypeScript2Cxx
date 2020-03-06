function f()
{
	const i = 10;
	return function() {
		return i;
	};
}

f()();