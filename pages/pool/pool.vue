<template>
	<view>
		<div @click="showMask">
			<quick-menu :menu-count=getCount :icon-class="icons" :position="position" :backgroundColor="backgroundColor" :color="color"
			 @process=print :list="list" :is-open-new-tab=getIsOpenNewTab :menu-url-list="list">
			</quick-menu>
		</div>

		<div class="bg" v-if="bgshow"></div>

		<view class="canvas-box">
			<canvas id="canvas" canvas-id="canvas" class="canvas" disable-scroll="true" @touchstart="touchStart" @touchmove="touchMove"
			 @touchend="touchEnd"></canvas>
		</view>

		<view class="panel-input" :class="[{'active':showPanel}] ">
			<view class="panel-cover">
				<input class="text-input" confirm-type="send" placeholder="输入消息..." />
				<view class="text-line">
				</view>
			</view>
		</view>
	</view>


</template>

<script>
	import UserInput from './chat/UserInput.vue'
	import quickMenu from 'vue-quick-menu'
	import 'font-awesome/css/font-awesome.min.css'
	import availableColors from './chat/colors'

	import {
		TadpoleApp
	} from "./js/TadpoleApp.js";

	import Stats from "./js/lib/Stats.js"

	// import {
	// 	vmLog
	// } from "./js/World.js";


	var _tadpoleApp = null;
	var _touch_ticks = 0;

	export default {
		name: 'HelloWorld',
		components: {
			quickMenu,
			UserInput
		},
		props: {
			showEmoji: {
				type: Boolean,
				default: true
			},
			showCloseButton: {
				type: Boolean,
				default: true
			},
			showFile: {
				type: Boolean,
				default: false
			},
			showHeader: {
				type: Boolean,
				default: true
			},

			titleImageUrl: {
				type: String,
				default: ''
			},

			messageList: {
				type: Array,
				default: () => []
			},
			isOpen: {
				type: Boolean,
				default: () => false
			},
			placeholder: {
				type: String,
				default: 'Write a message...'
			},
			colors: {
				type: Object,
				default: () => availableColors['blue']
			}

		},
		data() {
			return {
				msg: 'Welcome to Your Vue.js App',
				bgshow: false,
				count: 4,
				icons: [
					"fa fa-home",
					"fa fa-commenting",
					"fa fa-user-circle-o",
					"fa fa-building-o",
				],
				list: [{
						isLink: false,
						url: '/Test2'
					},
					{
						isLink: false,
						url: '/Test2'
					},
					{
						isLink: false,
						url: '/Home'
					},
					{
						isLink: false,
						url: '/Home'
					},
				],
				backgroundColor: '#42b983',
				color: '#eee',
				position: 'top-right',
				isOpenNewTab: false,
				showPanel: false,
			}
		},
		computed: {
			getCount() {
				return Number(this.count)
			},
			getIsOpenNewTab() {
				return Boolean(this.isOpenNewTab)
			}
		},
		methods: {

			getSuggestions() {
				return ["输入消息"];
			},
			onUserInputSubmit() {

			},
			quickClick: function() {
				if (this.showPanel) {
					this.showPanel = false;
				} else {
					this.showPanel = true;
				}
			},

			touchStart: function(e) {
				console.log("touchstart:" + JSON.stringify(e));

				if (_tadpoleApp) {
					_tadpoleApp.touchstart(e);
				}
				_touch_ticks = Date.now();
			},

			touchMove: function(e) {
				console.log("touchmove:" + JSON.stringify(e));

				if (_tadpoleApp) {
					_tadpoleApp.touchmove(e);
				}
			},

			touchEnd: function(e) {
				console.log("touchend:" + JSON.stringify(e));

				if (_tadpoleApp) {
					_tadpoleApp.touchend(e);
				}

				var ticks = Date.now() - _touch_ticks;
				if (ticks < 200) {
					this.quickClick();
				}
			},

			print: function(key) {
				console.log("key : " + key)
				if (key === 0) {
					this.$router.push({
						path: '/'
					})
					this.bgshow = !this.bgshow;
					// window.open('https://github.com/AshleyLv/vue-quick-menu')
				}
				if (key === 1) {
					this.$router.push({
						path: '/Test2'
					})
					this.bgshow = this.bgshow;
					// window.open('https://github.com/AshleyLv/vue-quick-menu')
				}

				if (key) {
					this.bgshow = !this.bgshow;
				}
			},
			showMask: function() {
				this.bgshow = !this.bgshow;
			},

		},
		mounted() {


			var canvas = document.getElementById('canvas');
			// var context = canvas.getContext('2d');

			// var sysInfo = wx.getSystemInfoSync()
			// var canvas = {
			//   width: sysInfo.windowWidth,
			//   height: sysInfo.windowHeight
			// };


			let context = uni.createCanvasContext('canvas');

			// var app = new TadpoleApp(canvas, context, vmLog);
			_tadpoleApp = new TadpoleApp(canvas, context, null);
			_tadpoleApp.resize(window.innerWidth, window.innerHeight);


			var runLoop = function() {
				// if (stats) stats.begin();
				_tadpoleApp.update();
				_tadpoleApp.draw();
				// if (stats) stats.end();
				requestAnimationFrame(runLoop);
			}

			runLoop();

		}
	}
</script>

<style>
	.bg {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background-color: rgba(0, 0, 0, .3);
		z-index: 1001;
	}

	.quick-menu {
		z-index: 1002;
	}

	.panel-input {
		z-index: 1010;
		width: 100%;
		position: fixed;
		top: 100%;
		transform-origin: top;
		transform: translateY(0);
		transition: all 200ms;
	}

	.panel-input.active {
		transform: translateY(-100%);
	}

	.panel-cover {
		padding: 20rpx 20rpx;
		background-color: rgba(255, 255, 255, 0.1);
	}

	.text-input {
		height: 70rpx;
		font-size: 50rpx;
		color: grey;
	}

	.text-line {
		height: 2rpx;
		margin: 0rpx 0rpx;
		background-color: gray;
	}


	.quick-menu.active .menu {
		-webkit-transform: scale(.9) !important;
		transform: scale(.9) !important;
	}

	.canvas-box {
		width: 100%;
		position: fixed;
		top: 0rpx;
		bottom: 0rpx;
		transition: all 0.2s;
	}

	.canvas {
		width: 100%;
		height: 100%;
		z-index: 1000;
	}
</style>
