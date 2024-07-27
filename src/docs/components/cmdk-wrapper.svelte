<script lang="ts">
	import { type FlyAndScaleParams, flyAndScale } from '$docs/utils.js';

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

<div style:position="relative" style:width="100%">
	<div
		style:height="475px"
		style:width="100%"
		style:position="absolute"
		style:top="0"
		style:left="0"
		out:flyAndScale={outConf}
		in:flyAndScale={inConf}
	>
		<slot />
	</div>
</div>
