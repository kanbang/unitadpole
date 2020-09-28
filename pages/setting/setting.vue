<template>
	<view>
		<u-button>默认按钮</u-button>
		<u-button type="primary">主要按钮</u-button>
		<u-button type="success">成功按钮</u-button>
		<u-button type="info">信息按钮</u-button>
		<u-button type="warning">警告按钮</u-button>
		<u-button type="error">危险按钮</u-button>
		<u-cell-group title="个人信息">
			<u-cell-item icon="share" title="昵称" :arrow="true" arrow-direction="right"></u-cell-item>
			<u-cell-item icon="map" title="签名" :arrow="true" arrow-direction="right"></u-cell-item>
		</u-cell-group>
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

</style>
