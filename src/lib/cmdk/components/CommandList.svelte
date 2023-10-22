<script lang="ts">
	import { getCtx } from '../command.js';
	import type { ListProps } from '../types.js';

	const { ids } = getCtx();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type $$Props = ListProps;

	let listEl: HTMLDivElement;

	function sizerAction(node: HTMLElement) {
		let animationFrame: number;

		const observer = new ResizeObserver(() => {
			animationFrame = requestAnimationFrame(() => {
				const height = node.offsetHeight;
				listEl.style.setProperty('--cmdk-list-height', height.toFixed(1) + 'px');
			});
		});

		observer.observe(node);
		return {
			destroy() {
				cancelAnimationFrame(animationFrame);
				observer.unobserve(node);
			}
		};
	}
</script>

<div
	bind:this={listEl}
	data-cmdk-list=""
	role="listbox"
	aria-label="Suggestions"
	id={ids.list}
	aria-labelledby={ids.input}
	{...$$restProps}
>
	<div data-cmdk-list-sizer="" use:sizerAction>
		<slot />
	</div>
</div>
