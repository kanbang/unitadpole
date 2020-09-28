<template>
	<view class="page-root">

		<uni-nav-bar :leftIconBool="true" @clickLeft="" leftText="取消" rightText="确定" :fixed="true" :status-bar="true"
		 title="设置" :rightButton="true" :rightButtonDisable="rightButtonDisable" :moveRightBtn="isWxapp" @clickRight="submit"></uni-nav-bar>
		<view class="uni-common-mt">
			<view class="uni-form-item uni-column">

				<view class="uni-input-wrapper">
					<input class="uni-input" placeholder="带清除按钮的输入框" :value="inputClearValue" @input="clearInput" />
					<text class="uni-icon" v-if="showClearIcon" @click="clearIcon">&#xe434;</text>
				</view>

				<!-- 
					<input class="uni-input" type="text" confirm-type="done" @confirm="submit" @focus="inputed" :focus="focus" v-model="petName" /> -->
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'

	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue"

	export default {
		components: {
			uniNavBar
		},
		data() {
			return {
				petName: '',
				setPetName: '',
				focus: false,
				rightButtonDisable: false,
				showClearIcon: false,
				inputClearValue: '',
				friend_id: '',
				isWxapp: false,
			}
		},
		computed: {
			// ...mapState({
			// 	user: state => state.user.user,

			// })
		},
		onLoad(option) {
			// #ifndef  APP-NVUE
			// this.isWxapp = true;
			// #endif
			this.setPetName = option.petName;
			this.petName = option.petName;
			this.friend_id = option.id;
			if (uni.getSystemInfoSync().platform == "ios") {
				this.focus = true
			}
		},
		watch: {
			petName() {
				if (this.setPetName != this.petName) {
					this.rightButtonDisable = false;
				}
			}
		},
		methods: {
			back: function() {
				uni.navigateBack({
					delta: 1
				})
			},
			clearInput: function(event) {
				this.inputClearValue = event.detail.value;
				if (event.detail.value.length > 0) {
					this.showClearIcon = true;
				} else {
					this.showClearIcon = false;
				}
			},
			submit: function() {
				if (!this.petName) {
					uni.showToast({
						title: "请输入备注后保存",
						duration: 2500,
						icon: 'none'
					})
					return;
				}
				var that = this;
				uni.showLoading();
				uniCloud.callFunction({
					name: 'user',
					data: {
						$url: "updateFriendPetName",
						token: this.$store.state.user.user_token,
						data: {
							user_id: this.user._id,
							friend_id: this.friend_id,
							pet_name: this.petName
						}

					},
				}).then((res) => {
					uni.hideLoading();
					if (res.result.updated === 1) {
						uni.showToast({
							title: "设置成功",
							duration: 2000
						})
						that.$store.dispatch('getFriendIds')
					} else {
						uni.showToast({
							title: "设置失败",
							duration: 2000,
							icon: 'none'
						})
					}
				}).catch((err) => {
					uni.hideLoading()
					uni.showModal({
						title: '提示',
						content: err
					});
				})
			}

		}
	}
</script>

<style scoped>
	.page-root {
		padding-bottom: 40rpx;
	}

	.page-title {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 35rpx;
	}

	.page-title__wrapper {
		padding: 0px 40rpx;
		border-bottom-color: #D8D8D8;
		border-bottom-width: 2rpx;
	}

	.page-title__text {
		font-size: 32rpx;
		height: 96rpx;
		line-height: 96rpx;
		color: #BEBEBE;
	}

	.title {
		padding: 10rpx 26rpx;
	}

	.uni-form-item__title {
		font-size: 32rpx;
		line-height: 48rpx;
	}

	    .uni-input-wrapper {
	        /* #ifndef APP-NVUE */
	        display: flex;
	        /* #endif */
	        padding: 8px 13px;
	        flex-direction: row;
	        flex-wrap: nowrap;
	        background-color: #FFFFFF;
	    }
	    .uni-input {
	        height: 28px;
	        line-height: 28px;
	        font-size: 15px;
	        padding: 0px;
	        flex: 1;
	        background-color: #FFFFFF;
	    }
	    .uni-icon {
	        font-family: uniicons;
	        font-size: 24px;
	        font-weight: normal;
	        font-style: normal;
	        width: 24px;
	        height: 24px;
	        line-height: 24px;
	        color: #999999;
	    }

	.uni-eye-active {
		color: #007AFF;
	}

	.passwordHover:active {
		background-color: green;
		opacity: 0.5;
	}

	.button {
		margin-top: 40rpx;
		justify-content: center;
		align-items: center
	}

	.submit {
		width: 700rpx;
		background-color: #29c160;
		justify-content: center;
		align-items: center;
		border-radius: 10rpx;
	}

	.submit-text {
		color: white;
		padding: 30rpx;
	}

	.submit:active {
		background-color: green;
		opacity: 0.5;
	}
</style>
