/**
 * Copyright (c) 2015 rokurou
 *
 * This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */

/* util  */
var Hstry = function(len) {
	this.buf = new Array(len);
	this.head = 0;
};
Hstry.prototype.add = function(val) {
	if (this.head < this.buf.length - 1)
		this.head++;
	else
		this.head = 0;
	this.buf[this.head] = val;
};
Hstry.prototype.len = function() {
	return this.buf.length;
};
Hstry.prototype.get = function(idx) {
	var i = this.head - idx;
	return this.buf[i >= 0 ? i : i + this.buf.length];
};
Hstry.prototype.idx = function(val) {
	for (var i = 0; i < this.buf.length; i++) {
		if (val == this.get(i))
			break;
	}
	return i;
};
Hstry.prototype.map = function(func, arg) {
	var ret = [];
	for (var i = 0; i < this.buf.length; i++) {
		var val = this.get(i);
		if (val === undefined)
			break;
		ret.push(func(val, i));
	}
	return ret;
};

function overlap(array) {
	return array.some(function(v, i, ary) {
		return i !== ary.indexOf(v);
	});
}

function queryparam() {
	return location.search.substring(1).split('&').reduce(function (map, para) {
		var p = para.split('=');
		if (p[0])
			map[decodeURIComponent(p[0])] = JSON.parse(decodeURIComponent(p[0]));
		return map;
	}, {});
}

function map(collection, func) {
	var rslt = [];
	if (collection.length) {
		for (var i = 0; i < collection.length; i++)
			rslt[i] = func(collection[i]);
	} else {
		for (var key in collection)
			rslt.push(func(collection[key]));
	}
	return rslt;
}

function random(min, max) {
  return Math.floor( Math.random() * (max - min + 1) ) + min;
}

function mins(array, comp) {
	if (array.length <= 1)
		return array;
		
	if (comp.length == 1)
		return mins(array, function(pre, cur) {
			return comp(pre) - comp(cur);
		});
	
	var ls = [array[0]];
	for (var i = 1; i < array.length; i++) {
		var cur = array[i];
		var d = comp(ls[0], cur);
		if (d >= 0) {
			if (d > 0)
				ls.length = 0;
			ls.push(cur);
		}
	}
	return ls;
}

function maxs(array, comp) {
	if (comp.length == 1)
		return mins(array, function(pre, cur) {
			return comp(cur) - comp(pre);
		});
	else
		return mins(array, function(pre, cur) {
			return comp(cur, pre);
		});
}

/* Symbol name in the sense of Japanese  */
var Ika = function(name, id, win) {
	this.name = name;
	this.id = id || name;
	this.win = win || BASE;
};
Ika.prototype.corps = function() {
	if (alfa.indexOf(this) >= 0)
		return 'alfa';
	else if (bravo.indexOf(this) >= 0)
		return 'bravo';
	else
		return '';
}

var frends = [];
var alfa = [];
var bravo = [];
var patterns = [];
var hstry = new Hstry(10);
var loser;
var BASE = 1;

function sum(ikas) {
	return ikas.reduce(function (pre, cur) {
		return pre + cur.win;
	}, 0);
}

function entry(frend, id) {
	if (!(frend instanceof Ika))
		frend = new Ika(frend, id, Math.floor(sum(frends) / frends.length));
	frends.push(frend);
}

function escape(frend) {
	if (frend instanceof Ika) {
		for (var i = 0; i < frends.length; i++)
			if (frends[i].id == frend.id)
				frends.splice(i, 1);
	} else {
		frends.splice(Number(frend), 1);
	}
}

function other(corps) {
	return frends.filter(function(ika) {
		return corps.indexOf(ika) < 0;
	});
}

function patternGen() {
	
	function pattern(corps) {
		if (corps.length > 4)
			return;
			
		if (frends.length - corps.length <= 4)
			patterns.push([corps, other(corps)]);
			
		var i = frends.indexOf(corps[corps.length - 1]);
		if (i >= 0)
			for (i++; i < frends.length; i++)
				pattern(corps.concat(frends[i]));
	}
	
	patterns.length = 0;
	for (var i = 1; i < frends.length; i++)
		pattern([frends[i]]);
}

function dWin(pattern) {
	return sum(pattern[0]) - sum(pattern[1]);
}

function countOf(corps, win) {
	return corps.reduce(function(pre, ika) {
		if (ika.win == win)
			pre++;
		return pre;
	}, 0);
}

function dMinimalist(pattern) {
	return countOf(pattern[0], BASE) - countOf(pattern[1], BASE);
}

function genDMaximalist() {
	var max = 0;
	for (var i = 0; i < frends.length; i++) {
		var win = frends[i].win;
		if (win > max)
			max = win;
	}
	return function(pattern) {
		return countOf(pattern[0], max) - countOf(pattern[1], max);
	}
}

function ikawake() {
	var dMaximalist = genDMaximalist();
	// 合計勝利数がより近く
	var list = mins(patterns, function(pat) {
		return Math.abs(dWin(pat));
	});
	if (overlap(list)) alert('overlap!');
	// 最少勝利数の人がよりばらけて
	list = mins(list, function(pat) {
		return Math.abs(dMinimalist(pat));
	});
	if (overlap(list)) alert('overlap!');
	// 最多勝利数の人がよりばらけて
	list = mins(list, function(pat) {
		return Math.abs(dMaximalist(pat));
	});
	if (overlap(list)) alert('overlap!');
	// 最少勝利数の人が有利側となり
	var ls = list.filter(function(pat) {
		return dWin(pat) * dMinimalist(pat) >= 0;
	});
	if (ls.length > 0)
		list = ls;
	if (overlap(list)) alert('overlap!');
	// 最多勝利数の人が不利側となり
	ls = list.filter(function(pat) {
		return dWin(pat) * dMaximalist(pat) >= 0;
	});
	if (ls.length > 0)
		list = ls;
	if (overlap(list)) alert('overlap!');
	// 人数がより近く
	list = mins(list, function(pat) {
		return Math.abs(pat[0].length - pat[1].length);
	});
	if (overlap(list)) alert('overlap!');
	// 最近組んでない
	list = maxs(list, function(pat) {
		var idx = hstry.idx(pat);
		return idx < 0 ? hstry.len() : idx;
	});
	if (overlap(list)) alert('overlap!');
	// あとはランダム
	var pat = list[random(0, list.length - 1)];
	alfa = pat[1];
	bravo = pat[0];
	hstry.add(pat);
}

function mode(cls) {
	if (cls) {
		document.querySelector('body').className = cls;
		document.getElementById('undo').style.display = 'none';
	} else {
		return document.querySelector('body').className;
	}
}

function refleshIka(li, ika) {
	if (mode() == 'entry' )
		li.className = 'null';
	else
		li.className = ika ? ika.corps() : 'null';
	li.querySelector('input').value = ika ? ika.name : '';
	li.querySelector('span').innerHTML = ika ? ika.win : '';
}

function refleshFrends() {
	var li = document.querySelectorAll('#frends li');
	for (var i = 0; i < li.length; i++) {
		refleshIka(li[i], frends[i]);
	}
}

function refleshCorps() {
	var li = document.querySelectorAll('#alfa li');
	for (var i = 0; i < li.length; i++) {
		refleshIka(li[i], alfa[i]);
	}
	li = document.querySelectorAll('#bravo li');
	for (var i = 0; i < li.length; i++) {
		refleshIka(li[i], bravo[i]);
	}
}

function change(input) {
	if (frends.some(function(v) {
		if (v.name == input.value)
			return true;
	})) {
		input.value = (frends[input.id] || {name:''}).name;
		return false;
	}
	escape(input.id);
	if (input.value)
		entry(input.value);
	mode('entry');
	refleshFrends();
	patternGen();
	return true;
}

function rslt(winner) {
	loser = winner == alfa ? bravo : alfa;
	if (loser.some(function(ika) {return ika.win == BASE;}))
		winner.map(function(ika) { ika.win++; });
	else
		loser.map(function(ika) { ika.win--; });
}

function result(winner) {
	rslt(winner == 'alfa' ? alfa : bravo);
	mode('entry');
	document.getElementById('undo').style.display = "inherit";
	refleshFrends();
}

function undo() {
	if (loser) {
		rslt(loser);
		loser = null;
		mode('fight');
		refleshCorps();
	}
}

function wake() {
	ikawake();
	mode('wake');
	refleshFrends();
}

function ok() {
	mode('fight');
	refleshCorps();
}

function main()
{
	var li = document.querySelectorAll('li');
	for (var i = 0; i < li.length; i++) {
		var name = li[i].querySelector('input').value;
		if (name)
			frends.push(new Ika(name, null,
								 li[i].querySelector('span').innerHTML));
	}
	patternGen();
}

function run()
{
	try {
		main();
	} catch (e) {
		alert(e);
	}
}

window.onload = function() {
	main();
};
