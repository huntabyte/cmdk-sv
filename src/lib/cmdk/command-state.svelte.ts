import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { tick, untrack } from 'svelte';
import { commandScore } from '$lib/internal/command-score.js';
import type {
	ReadableBoxedValues,
	WithRefProps,
	WritableBoxedValues
} from '$lib/internal/types.js';
import { useRefById } from '$lib/internal/useRefById.svelte.js';
import { kbd } from '$lib/internal/index.js';
import { createContext } from '$lib/internal/createContext.js';
import { findNextSibling, findPreviousSibling } from '$lib/internal/helpers/siblings.js';
import { sleep } from '$lib/internal/helpers/sleep.js';

export const LIST_SELECTOR = `[data-cmdk-list-sizer]`;
export const GROUP_SELECTOR = `[data-cmdk-group]`;
export const GROUP_ITEMS_SELECTOR = `[data-cmdk-group-items]`;
export const GROUP_HEADING_SELECTOR = `[data-cmdk-group-heading]`;
export const ITEM_SELECTOR = `[data-cmdk-item]`;
export const VALID_ITEM_SELECTOR = `${ITEM_SELECTOR}:not([aria-disabled="true"])`;
export const VALUE_ATTR = `data-value`;

export function defaultFilter(value: string, search: string): number {
	return commandScore(value, search);
}

type CommandRootStateProps = WithRefProps<
	ReadableBoxedValues<{
		filter: (value: string, search: string) => number;
		shouldFilter: boolean;
		loop: boolean;
	}>
>;

class CommandRootState {
	allItems = new SvelteSet<string>(); // [...itemIds]
	allGroups = new SvelteMap<string, Set<string>>(); // groupId -> [...itemIds]
	allIds = new SvelteMap<string, string>(); // id -> value
	id: CommandRootStateProps['id'];
	ref: CommandRootStateProps['ref'];
	filter: CommandRootStateProps['filter'];
	shouldFilter: CommandRootStateProps['shouldFilter'];
	loop: CommandRootStateProps['loop'];
	listNode = $state<HTMLElement | null>(null);
	labelNode = $state<HTMLElement | null>(null);
	search = $state('');
	value = $state('');
	filtered = $state({
		count: 0,
		items: new SvelteMap<string, number>(),
		groups: new SvelteSet<string>()
	});

	constructor(props: CommandRootStateProps) {
		this.id = props.id;
		this.ref = props.ref;
		this.filter = props.filter;
		this.shouldFilter = props.shouldFilter;
		this.loop = props.loop;

		useRefById({
			id: this.id,
			ref: this.ref
		});
	}

	#score(value: string | undefined, search: string) {
		const lowerCaseAndTrimmedValue = value?.toLowerCase().trim();
		const filterFn = this.filter.current;
		return lowerCaseAndTrimmedValue ? filterFn(lowerCaseAndTrimmedValue, search) : 0;
	}

	#filterItems() {
		const shouldFilter = this.shouldFilter.current;
		if (!this.search || !shouldFilter) {
			this.filtered.count = this.allItems.size;
			return;
		}

		this.filtered.groups = new SvelteSet();
		let itemCount = 0;

		// check which items should be included
		for (const id of this.allItems) {
			const value = this.allIds.get(id);
			const rank = this.#score(value, this.search);
			this.filtered.items.set(id, rank);
			if (rank > 0) {
				itemCount++;
			}
		}

		// check which groups have at least 1 item shown
		for (const [groupId, group] of this.allGroups) {
			for (const itemId of group) {
				const rank = this.filtered.items.get(itemId);

				if (rank && rank > 0) {
					this.filtered.groups.add(groupId);
				}
			}
		}
		this.filtered.count = itemCount;
	}

	#sort() {
		const shouldFilter = this.shouldFilter.current;
		if (!this.search || !shouldFilter) return;

		const scores = this.filtered.items;

		// sort groups
		const groups: [string, number][] = [];

		for (const value of this.filtered.groups) {
			const items = this.allGroups.get(value);
			if (!items) continue;
			// gt max score of group's items
			let max = 0;
			for (const item of items) {
				const score = scores.get(item);
				if (score === undefined) continue;
				max = Math.max(score, max);
			}
			groups.push([value, max]);
		}

		// sort items within groups to bottom
		// sort items outside of groups
		// sort groups to bottom (pushed all non-grouped items to the top)
		const commandNode = this.ref.current;
		if (!commandNode) return;
		const list = this.listNode;

		const validItems = this.#getValidItems().sort((a, b) => {
			const valueA = a.getAttribute(VALUE_ATTR) ?? '';
			const valueB = b.getAttribute(VALUE_ATTR) ?? '';
			return (scores.get(valueA) ?? 0) - (scores.get(valueB) ?? 0);
		});

		for (const item of validItems) {
			const group = item.closest(GROUP_ITEMS_SELECTOR);
			const closest = item.closest(`${GROUP_ITEMS_SELECTOR} > *`);
			if (group) {
				if (item.parentElement === group) {
					group.appendChild(item);
				} else {
					if (!closest) continue;
					group.appendChild(closest);
				}
			} else {
				if (item.parentElement === list) {
					list?.appendChild(item);
				} else {
					if (!closest) continue;
					list?.appendChild(closest);
				}
			}
		}

		groups.sort((a, b) => b[1] - a[1]);

		for (const group of groups) {
			const el = commandNode.querySelector(`${GROUP_SELECTOR}[${VALUE_ATTR}="${group[0]}"]`);
			el?.parentElement?.appendChild(el);
		}
	}

	#getValidItems = () => {
		const node = this.ref.current;
		if (!node) return [];
		return Array.from(node.querySelectorAll<HTMLElement>(VALID_ITEM_SELECTOR)).filter(
			(el): el is HTMLElement => !!el
		);
	};

	#getSelectedItem = () => {
		const node = this.ref.current;
		if (!node) return;
		const selectedNode = node.querySelector<HTMLElement>(
			`${VALID_ITEM_SELECTOR}[aria-selected="true"]`
		);
		if (!selectedNode) return;
		return selectedNode;
	};

	#selectFirstItem = () => {
		const item = this.#getValidItems().find((item) => !item.ariaDisabled);
		if (!item) return;
		const value = item.getAttribute(VALUE_ATTR) ?? '';
		if (!value) return;
		return value;
	};

	#scrollSelectedIntoView() {
		const item = this.#getSelectedItem();
		if (!item) return;

		if (item.parentElement?.firstChild === item) {
			tick().then(() => {
				item
					.closest(GROUP_SELECTOR)
					?.querySelector(GROUP_HEADING_SELECTOR)
					?.scrollIntoView({ block: 'nearest' });
			});
		}
		tick().then(() => item.scrollIntoView({ block: 'nearest' }));
	}

	#updateSelectedToIndex(index: number) {
		const node = this.ref.current;
		if (!node) return;
		const items = this.#getValidItems();
		const item = items[index];
		if (!item) return;
		this.setValue(item.getAttribute(VALUE_ATTR) ?? '');
	}

	#updateSelectedByChange(change: 1 | -1) {
		const selected = this.#getSelectedItem();
		const items = this.#getValidItems();
		const index = items.findIndex((item) => item === selected);

		// get item at this index
		let newSelected = items[index + change];
		if (this.loop.current) {
			if (index + change < 0) {
				newSelected = items[items.length - 1];
			} else if (index + change === items.length) {
				newSelected = items[0];
			} else {
				newSelected = items[index + change];
			}
		}
		if (newSelected) {
			this.setValue(newSelected.getAttribute(VALUE_ATTR) ?? '');
		}
	}

	#updateSelectedToGroup(change: 1 | -1) {
		const selected = this.#getSelectedItem();
		let group = selected?.closest(GROUP_SELECTOR);
		let item: HTMLElement | undefined | null;

		while (group && !item) {
			group =
				change > 0
					? findNextSibling(group, GROUP_SELECTOR)
					: findPreviousSibling(group, GROUP_SELECTOR);
			item = group?.querySelector(VALID_ITEM_SELECTOR);
		}

		if (item) {
			this.setValue(item.getAttribute(VALUE_ATTR) ?? '');
		} else {
			this.#updateSelectedByChange(change);
		}
	}

	registerValue(id: string, value: string) {
		if (value === this.allIds.get(id)) return;

		this.allIds.set(id, value);
		this.filtered.items.set(id, this.#score(value, this.search));
	}

	registerItem(id: string, groupId: string | undefined) {
		this.allItems.add(id);

		// track this item within the group
		if (groupId) {
			if (!this.allGroups.has(groupId)) {
				this.allGroups.set(groupId, new SvelteSet([id]));
			} else {
				this.allGroups.get(groupId)?.add(id);
			}
		}

		this.#filterItems();

		if (!this.value) {
			this.value = this.#selectFirstItem() ?? '';
		}

		return () => {
			this.allIds.delete(id);
			this.allItems.delete(id);
			this.filtered.items.delete(id);
			const selectedItem = this.#getSelectedItem();

			this.#filterItems();

			if (selectedItem?.getAttribute('id') === id) {
				this.value = this.#selectFirstItem() ?? '';
			}
		};
	}

	registerGroup(id: string) {
		if (!this.allGroups.has(id)) {
			this.allGroups.set(id, new SvelteSet());
		}

		return () => {
			this.allIds.delete(id);
			this.allGroups.delete(id);
		};
	}

	setSearch(search: string) {
		this.search = search;
		this.#filterItems();
		this.#sort();
		tick().then(() => {
			this.value = this.#selectFirstItem() ?? '';
		});
	}

	setValue(newVal: string, preventScroll?: boolean) {
		this.value = newVal;
		if (preventScroll) return;
		tick().then(() => this.#scrollSelectedIntoView());
	}

	#last = () => {
		return this.#updateSelectedToIndex(this.#getValidItems().length - 1);
	};

	#next = (e: KeyboardEvent) => {
		e.preventDefault();

		if (e.metaKey) {
			this.#last();
		} else if (e.altKey) {
			this.#updateSelectedToGroup(1);
		} else {
			this.#updateSelectedByChange(1);
		}
	};

	#prev = (e: KeyboardEvent) => {
		e.preventDefault();

		if (e.metaKey) {
			this.setValue(this.search);
		} else if (e.altKey) {
			this.#updateSelectedToGroup(-1);
		} else {
			this.#updateSelectedByChange(-1);
		}
	};

	#onkeydown = (e: KeyboardEvent) => {
		switch (e.key) {
			case kbd.ARROW_DOWN:
				this.#next(e);
				break;
			case kbd.ARROW_UP:
				this.#prev(e);
				break;
			case kbd.HOME:
				// first item
				e.preventDefault();
				this.#updateSelectedToIndex(0);
				break;
			case kbd.END:
				// last item
				e.preventDefault();
				this.#last();
				break;
			case kbd.ENTER: {
				e.preventDefault();
				const item = this.#getSelectedItem() as HTMLElement;
				if (item) {
					item?.click();
				}
			}
		}
	};

	props = $derived.by(
		() =>
			({
				id: this.id.current,
				role: 'application',
				'data-cmdk-root': '',
				onkeydown: this.#onkeydown
			}) as const
	);

	createEmpty(props: CommandEmptyStateProps) {
		return new CommandEmptyState(props, this);
	}

	createGroupContainer(props: CommandGroupContainerStateProps) {
		return new CommandGroupContainerState(props, this);
	}

	createInput(props: CommandInputStateProps) {
		return new CommandInputState(props, this);
	}

	createLabel(props: CommandInputLabelStateProps) {
		return new CommandInputLabelState(props, this);
	}
}

type CommandEmptyStateProps = WithRefProps;

class CommandEmptyState {
	#ref: CommandEmptyStateProps['ref'];
	#id: CommandEmptyStateProps['id'];
	#root: CommandRootState;
	shouldRender = $derived.by(() => this.#root.filtered.count === 0);

	constructor(props: CommandEmptyStateProps, root: CommandRootState) {
		this.#ref = props.ref;
		this.#id = props.id;
		this.#root = root;

		useRefById({
			id: this.#id,
			ref: this.#ref
		});
	}

	props = $derived.by(
		() =>
			({
				id: this.#id.current,
				role: 'presentation',
				'data-cmdk-empty': ''
			}) as const
	);
}

type CommandGroupContainerStateProps = WithRefProps<
	ReadableBoxedValues<{
		value: string;
		forceMount: boolean;
		heading: string;
	}>
>;

class CommandGroupContainerState {
	#ref: CommandGroupContainerStateProps['ref'];
	#id: CommandGroupContainerStateProps['id'];
	#forceMount: CommandGroupContainerStateProps['forceMount'];
	#value: CommandGroupContainerStateProps['value'];
	#root: CommandRootState;
	#headingValue: CommandGroupContainerStateProps['heading'];
	headingNode = $state<HTMLElement | null>(null);

	shouldRender = $derived.by(() => {
		if (this.#forceMount.current) return true;
		if (this.#root.shouldFilter.current === false) return true;
		if (!this.#root.search) return true;
		return this.#root.filtered.groups.has(this.#id.current);
	});
	trueValue = $state('');

	constructor(props: CommandGroupContainerStateProps, root: CommandRootState) {
		this.#ref = props.ref;
		this.#id = props.id;
		this.#root = root;
		this.#forceMount = props.forceMount;
		this.#value = props.value;
		this.trueValue = props.value.current;
		this.#headingValue = props.heading;

		useRefById({
			id: this.#id,
			ref: this.#ref
		});

		$effect(() => {
			const unsub = this.#root.registerGroup(this.#id.current);
			return unsub;
		});

		$effect(() => {
			untrack(() => {
				if (this.#value.current) {
					this.trueValue = this.#value.current;
					this.#root.registerValue(this.#id.current, this.#value.current);
				} else if (this.#headingValue.current) {
					this.trueValue = this.#headingValue.current.trim().toLowerCase();
				} else if (this.#ref.current?.textContent) {
					this.trueValue = this.#ref.current.textContent.trim().toLowerCase();
				}
			});
		});
	}

	props = $derived.by(
		() =>
			({
				id: this.#id.current,
				role: 'presentation',
				hidden: this.shouldRender ? undefined : 'true',
				'data-value': this.trueValue,
				'data-cmdk-group': ''
			}) as const
	);

	createGroupHeading(props: CommandGroupHeadingStateProps) {
		return new CommandGroupHeadingState(props, this);
	}

	createGroupItems(props: CommandGroupItemsStateProps) {
		return new CommandGroupItemsState(props, this);
	}
}

type CommandGroupHeadingStateProps = WithRefProps;

class CommandGroupHeadingState {
	#ref: CommandGroupHeadingStateProps['ref'];
	#id: CommandGroupHeadingStateProps['id'];
	#group: CommandGroupContainerState;

	constructor(props: CommandGroupHeadingStateProps, group: CommandGroupContainerState) {
		this.#ref = props.ref;
		this.#id = props.id;
		this.#group = group;

		useRefById({
			id: this.#id,
			ref: this.#ref,
			onRefChange: (node) => {
				this.#group.headingNode = node;
			}
		});
	}

	props = $derived.by(
		() =>
			({
				id: this.#id.current,
				'data-cmdk-group-heading': ''
			}) as const
	);
}

type CommandGroupItemsStateProps = WithRefProps;

class CommandGroupItemsState {
	#ref: CommandGroupItemsStateProps['ref'];
	#id: CommandGroupItemsStateProps['id'];
	#group: CommandGroupContainerState;

	constructor(props: CommandGroupItemsStateProps, group: CommandGroupContainerState) {
		this.#ref = props.ref;
		this.#id = props.id;
		this.#group = group;

		useRefById({
			id: this.#id,
			ref: this.#ref
		});
	}

	props = $derived.by(
		() =>
			({
				id: this.#id.current,
				role: 'group',
				'data-cmdk-group-items': '',
				'aria-labelledby': this.#group.headingNode?.id ?? undefined
			}) as const
	);
}

type CommandInputLabelStateProps = WithRefProps<ReadableBoxedValues<{ for?: string }>>;

class CommandInputLabelState {
	#ref: CommandInputLabelStateProps['ref'];
	#id: CommandInputLabelStateProps['id'];
	#root: CommandRootState;
	#for: CommandInputLabelStateProps['for'];

	constructor(props: CommandInputLabelStateProps, root: CommandRootState) {
		this.#ref = props.ref;
		this.#id = props.id;
		this.#root = root;
		this.#for = props.for;

		useRefById({
			id: this.#id,
			ref: this.#ref,
			onRefChange: (node) => {
				this.#root.labelNode = node;
			}
		});
	}

	props = $derived.by(
		() =>
			({
				id: this.#id.current,
				'data-cmdk-input-label': '',
				for: this.#for?.current
			}) as const
	);
}

type CommandInputStateProps = WithRefProps<
	WritableBoxedValues<{
		value: string;
	}> &
		ReadableBoxedValues<{
			autofocus: boolean;
		}>
>;

class CommandInputState {
	#ref: CommandInputStateProps['ref'];
	#id: CommandInputStateProps['id'];
	#root: CommandRootState;
	#value: CommandInputStateProps['value'];
	#autofocus: CommandInputStateProps['autofocus'];

	constructor(props: CommandInputStateProps, root: CommandRootState) {
		this.#ref = props.ref;
		this.#id = props.id;
		this.#root = root;
		this.#value = props.value;
		this.#autofocus = props.autofocus;

		useRefById({
			id: this.#id,
			ref: this.#ref
		});

		$effect(() => {
			const node = this.#ref.current;
			untrack(() => {
				if (node && this.#autofocus.current) {
					sleep(10).then(() => node.focus());
				}
			});
		});

		$effect(() => {
			this.#root.setSearch(this.#value.current);
		});
	}

	props = $derived.by(
		() =>
			({
				id: this.#id.current,
				type: 'text',
				'data-cmdk-input': '',
				autocomplete: 'off',
				autocorrect: 'off',
				spellcheck: false,
				'aria-autocomplete': 'list',
				role: 'combobox',
				'aria-expanded': 'true',
				'aria-controls': this.#root.listNode?.id ?? undefined,
				'aria-labelledby': this.#root.labelNode?.id ?? undefined,
				'aria-activedescendant': '' // TODO
			}) as const
	);
}

type CommandItemStateProps = WithRefProps<
	ReadableBoxedValues<{
		value: string;
		disabled: boolean;
		onSelect: () => void;
		forceMount: boolean;
	}>
>;

class CommandItemState {
	#ref: CommandItemStateProps['ref'];
	#id: CommandItemStateProps['id'];
	#root: CommandRootState;
	#value: CommandItemStateProps['value'];
	#disabled: CommandItemStateProps['disabled'];
	#onSelect: CommandItemStateProps['onSelect'];
	#forceMount: CommandItemStateProps['forceMount'];

	constructor(props: CommandItemStateProps, root: CommandRootState) {
		this.#ref = props.ref;
		this.#id = props.id;
		this.#root = root;
		this.#value = props.value;
		this.#disabled = props.disabled;
		this.#onSelect = props.onSelect;
		this.#forceMount = props.forceMount;

		useRefById({
			id: this.#id,
			ref: this.#ref
		});
	}

	props = $derived.by(
		() =>
			({
				id: this.#id.current,
				role: 'presentation',
				hidden: this.shouldRender ? undefined : 'true',
				'data-value': this.trueValue,
				'data-cmdk-item': ''
			}) as const
	);
}

const [setCommandRootContext, getCommandRootContext] =
	createContext<CommandRootState>('Command.Root');

const [setCommandGroupContainerContext, getCommandGroupContainerContext] =
	createContext<CommandGroupContainerState>('Command.Group');

export function useCommandRoot(props: CommandRootStateProps) {
	return setCommandRootContext(new CommandRootState(props));
}

export function useCommandEmpty(props: CommandEmptyStateProps) {
	return getCommandRootContext().createEmpty(props);
}

export function useCommandGroupContainer(props: CommandGroupContainerStateProps) {
	return setCommandGroupContainerContext(getCommandRootContext().createGroupContainer(props));
}

export function useCommandGroupHeading(props: CommandGroupHeadingStateProps) {
	return getCommandGroupContainerContext().createGroupHeading(props);
}

export function useCommandGroupItems(props: CommandGroupItemsStateProps) {
	return getCommandGroupContainerContext().createGroupItems(props);
}
