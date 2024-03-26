function outer(s) {
	var s = "outer.s";
	return function(t) { 
		debugger;
		console.log(t);
		console.log(this.s);
	};
}

outer.prototype.s = "prototype s"
var test = outer();