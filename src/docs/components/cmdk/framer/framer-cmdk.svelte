<script lang="ts">
	import { Command } from '$lib';
	import { onMount, type ComponentType, tick } from 'svelte';
	import {
		AvatarIcon,
		BadgeIcon,
		ButtonIcon,
		ContainerIcon,
		InputIcon,
		RadioIcon,
		SearchIcon,
		SliderIcon
	} from './icons';
	import '$styles/cmdk/framer.postcss';

	let value = 'Button';
	let inputEl: HTMLInputElement;

	onMount(() => {
		tick().then(() => inputEl?.focus());
	});
	type Component = {
		value: string;
		subtitle: string;
		icon: ComponentType;
	};

	const components: Component[] = [
		{
			value: 'Button',
			subtitle: 'Trigger actions',
			icon: ButtonIcon
		},
		{
			value: 'Input',
			subtitle: 'Retrive user input',
			icon: InputIcon
		},
		{
			value: 'Radio',
			subtitle: 'Single choice input',
			icon: RadioIcon
		},
		{
			value: 'Badge',
			subtitle: 'Annotate context',
			icon: BadgeIcon
		},
		{
			value: 'Slider',
			subtitle: 'Free range picker',
			icon: SliderIcon
		},
		{
			value: 'Avatar',
			subtitle: 'Illustrate the user',
			icon: AvatarIcon
		},
		{
			value: 'Container',
			subtitle: 'Lay out items',
			icon: ContainerIcon
		}
	];
</script>

<div class="framer">
	<Command.Root bind:value>
		<div data-cmdk-framer-header="">
			<SearchIcon />
			<Command.Input
				autofocus
				placeholder="Find components, packages, and interactions..."
				bind:el={inputEl}
			/>
		</div>
		<Command.List>
			<div data-cmdk-framer-items="">
				<div data-cmdk-framer-left="">
					<Command.Group heading="Components">
						{#each components as { value, subtitle, icon }}
							<Command.Item {value}>
								<div data-cmdk-framer-icon-wrapper="">
									<svelte:component this={icon} />
								</div>
								<div data-cmdk-framer-item-meta="">
									{value}
									<span data-cmdk-framer-item-subtitle="">{subtitle}</span>
								</div>
							</Command.Item>
						{/each}
					</Command.Group>
				</div>
				<hr data-cmdk-framer-separator="" />
				<div data-cmdk-framer-right="">
					{#if value === 'Button'}
						<button>Primary</button>
					{:else if value === 'Input'}
						<input type="text" placeholder="Placeholder" />
					{:else if value === 'Badge'}
						<div data-cmdk-framer-badge="">Badge</div>
					{:else if value === 'Radio'}
						<label data-cmdk-framer-radio="">
							<input type="radio" checked />
							Radio Button
						</label>
					{:else if value === 'Avatar'}
						<img src="/rauno.jpeg" alt="Avatar of Rauno" />
					{:else if value === 'Slider'}
						<div data-cmdk-framer-slider="">
							<div />
						</div>
					{:else if value === 'Container'}
						<div data-cmdk-framer-container="" />
					{/if}
				</div>
			</div>
		</Command.List>
	</Command.Root>
</div>
