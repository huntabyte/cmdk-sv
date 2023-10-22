<script lang="ts">
	import type { LoadingProps } from '../types.js';

	type $$Props = LoadingProps;
	export let progress: $$Props['progress'] = 0;
</script>

<div
	data-cmdk-loading=""
	role="progressbar"
	aria-valuenow={progress}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-label="Loading..."
	{...$$restProps}
>
	<div aria-hidden>
		<slot />
	</div>
</div>
