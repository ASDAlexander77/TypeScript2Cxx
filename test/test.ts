var f = function() {
	const a = 10;
	return function() {
		return a;
	}
}

f()();