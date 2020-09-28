<template>
	<view>
		<view class="clearinput__form">
				<view class="clearinput__box">
					<input type="text" class="clearinput__input" :placeholder="placeholder" :v-model="value" :focus="focus" @blur="inputBlur"
					 @focus="inputFocus" @input="inputChange" />
				</view>
		</view>
		<view class="btns">
			<u-button type="default" class="btn-cancel" size="mini" @click="onBtnCancel"> "cancelText" </u-button>
			<u-button type="primary" class="btn-ok" size="mini" :disabled="value==valuein" @click="onBtnOK"> "okText"
			</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {

		}
	}
</script>

<style>
	.clearinput {
		position: relative;
		padding: 8px;
		display: flex;
		box-sizing: border-box;
		background-color: #ededed;
		-webkit-text-size-adjust: 100%;
		align-items: center;
	}
	.clearinput__form {
		padding: 8px;
		position: relative;
		flex: auto;
		background: #fff;
	}

	.clearinput__text {
	}



	.clearinput__box {
		display: inline-block;
		font-size: 14px;
		vertical-align: top;
		position: relative;
		padding-left: 8px;
		padding-right: 8px;
		width: 100%;
		box-sizing: border-box;
	border-radius: 4px;
		z-index: 1;
	}

	.clearinput__input {
		height: 32px;
		line-height: 32px;
		font-size: 14px;
		caret-color: #07c160;
	}

	.weui-icon-clear {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		padding: 0 12px;
		font-size: 0;
	}

	.weui-icon-clear:after {
		content: "";
		height: 100%;
		vertical-align: middle;
		display: inline-block;
		width: 0;
		overflow: hidden;
	}

	.btns {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
	}

	button {
		margin-left: 0;
		margin-right: 16rpx;

	}

	.btn-cancel {}

	.btn-cancel::after {
		border: none;
	}

	.ok-btn {}
</style>
