var f = function(f1) {
	const a = 10;
	return f1(a);
}

f(function(b) {
	return b;
})();