<script lang="ts">
	import { flyAndScale, type FlyAndScaleParams } from '$docs/utils';

	const outConf: FlyAndScaleParams = {
		y: 0,
		duration: 200,
		start: 0.98
	};

	const inConf: FlyAndScaleParams = {
		y: 0,
		delay: 210,
		duration: 200,
		start: 0.98
	};
</script>

<div style:height="475px" out:flyAndScale={outConf} in:flyAndScale={inConf}>
	<slot />
</div>
