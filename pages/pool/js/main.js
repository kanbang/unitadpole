/*
 * @Descripttion: 
 * @version: 0.x
 * @Author: zhai
 * @Date: 2019-08-05 12:33:17
 * @LastEditors: zhai
 * @LastEditTime: 2020-09-14 10:41:48
 */


import {
	TadpoleApp
} from "./TadpoleApp.js";

import Stats from "./lib/Stats.js"

import {
	parseUri
} from "./lib/parseUri.js"

// import {
// 	vmLog
// } from "./World.js";


var debug = false;
var isStatsOn = false;
var stats;

var authWindow;

export var app;

var runLoop = function () {
	if (stats) stats.begin();
	app.update();
	app.draw();
	if (stats) stats.end();
	requestAnimationFrame(runLoop);
}

var addStats = function () {
	if (isStatsOn) {
		return;
	}

	// Draw fps
	stats = new Stats();
	stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.getElementById('fps').appendChild(stats.dom);

	isStatsOn = true;
}

var initApp = function () {
	if (app != null) {
		return;
	}

	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	app = new TadpoleApp(canvas, context, vmLog);
	app.resize(window.innerWidth, window.innerHeight);

	app.websocket.on("disconnection", (data) => {
		$('#cant-connect').fadeIn(300);
	});

	app.websocket.on("welcome", (data) => {
		$('#chat').initChat();
	});

	// 不懂
	app.websocket.on("open", (data) => {
		var uri = parseUri(document.location)
		if (uri.queryKey.oauth_token) {
			app.authorize(uri.queryKey.oauth_token, uri.queryKey.oauth_verifier);
		}
	});


	window.addEventListener('resize', (ev) => {
		app.resize(window.innerWidth, window.innerHeight);
	}, false);

	document.addEventListener('mousemove', (ev) => {
		app.mousemove(ev);
	}, false);
	document.addEventListener('mousedown', (ev) => {
		app.mousedown(ev);
	}, false);
	document.addEventListener('mouseup', (ev) => {
		app.mouseup(ev);
	}, false);

	document.addEventListener('touchstart', (ev) => {
		app.touchstart(ev);
	}, false);
	document.addEventListener('touchend', (ev) => {
		app.touchend(ev);
	}, false);
	document.addEventListener('touchcancel', (ev) => {
		app.touchend(ev);
	}, false);
	document.addEventListener('touchmove', (ev) => {
		app.touchmove(ev);
	}, false);

	document.addEventListener('keydown', (ev) => {
		app.keydown(ev);
	}, false);
	document.addEventListener('keyup', (ev) => {
		app.keyup(ev);
	}, false);

	document.addEventListener('keydown', function (e) {
		if (e.which == 27) { //Escape
			addStats();
		}
	});

	if (debug) {
		addStats();
	}

	runLoop();

	// setInterval(runLoop, 30);
}

var forceInit = function () {
	initApp()
	document.getElementById('unsupported-browser').style.display = "none";
	return false;
}

if (Modernizr.canvas && Modernizr.websockets) {
	initApp();
} else {
	document.getElementById('unsupported-browser').style.display = "block";
	document.getElementById('force-init-button').addEventListener('click', forceInit, false);
}


$(function () {
	$('a[rel=external]').click(function (e) {
		e.preventDefault();
		window.open($(this).attr('href'));
	});
});

document.body.onselectstart = function () {
	return false;
}