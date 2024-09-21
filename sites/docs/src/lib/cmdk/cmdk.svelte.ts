import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { commandScore } from "./command-score.js";
import type {
	ReadableBoxedValues,
	WithRefProps,
	WritableBoxedValues,
} from "$lib/internal/types.js";
import { useRefById } from "$lib/internal/useRefById.svelte.js";
import { useId } from "$lib/internal/index.js";

type FilterFn = (value: string, search: string, keywords?: string[]) => number;

const GROUP_SELECTOR = `[data-cmdk-group]`;
const GROUP_ITEMS_SELECTOR = `[data-cmdk-group-items]`;
const GROUP_HEADING_SELECTOR = `[data-cmdk-group-heading]`;
const ITEM_SELECTOR = `[data-cmdk-item]`;
const VALID_ITEM_SELECTOR = `${ITEM_SELECTOR}:not([aria-disabled="true"])`;
const SELECT_EVENT = `cmdk-item-select`;
const VALUE_ATTR = `data-value`;

const srOnlyStyles = {
	position: "absolute",
	width: "1px",
	height: "1px",
	padding: "0",
	margin: "-1px",
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	borderWidth: "0",
} as const;

const defaultFilter: FilterFn = (value, search, keywords) => commandScore(value, search, keywords);

type State = {
	search: string;
	value: string;
	filtered: { count: number; items: Map<string, number>; groups: Set<string> };
};

type CommandRootStateProps = WithRefProps &
	ReadableBoxedValues<{
		label: string;
		shouldFilter: boolean;
		filter: (value: string, search: string, keywords?: string[]) => number;
		loop: boolean;
		disablePointerSelection: boolean;
		vimBindings: boolean;
	}> &
	WritableBoxedValues<{
		value: string;
	}>;

class CommandRootState {
	// props
	#ref: CommandRootStateProps["ref"];
	#id: CommandRootStateProps["id"];
	#valueProp: CommandRootStateProps["value"] =
		undefined as unknown as CommandRootStateProps["value"];
	label: CommandRootStateProps["label"];
	shouldFilter: CommandRootStateProps["shouldFilter"];
	filter: CommandRootStateProps["filter"];
	loop: CommandRootStateProps["loop"];
	disablePointerSelection: CommandRootStateProps["disablePointerSelection"];
	vimBindings: CommandRootStateProps["vimBindings"];

	// internal
	state = $state<State>({
		/** Value of the search query */
		search: this.#valueProp.current ?? "",
		/** Value of the selected command menu item */
		value: this.#valueProp.current ?? "",
		filtered: {
			/** The count of all visible items. */
			count: 0,
			/** Map from visible item id to its search store. */
			items: new Map(),
			/** Set of groups with at least one visible item. */
			groups: new Set(),
		},
	});
	allItems = new SvelteSet<string>(); // [...itemIds]
	allGroups = new SvelteMap<string, Set<string>>(); // groupId → [...itemIds]
	ids = new SvelteMap<string, { value: string; keywords?: string[] }>(); // id → { value, keywords }
	listeners = new SvelteSet<() => void>(); // [...rerenders]

	listId = useId();
	labelId = useId();
	inputId = useId();

	listInnerNode = $state<HTMLElement | null>(null);

	constructor(props: CommandRootStateProps) {
		this.#ref = props.ref;
		this.#id = props.id;
		this.#valueProp = props.value;
		this.label = props.label;
		this.shouldFilter = props.shouldFilter;
		this.filter = props.filter;
		this.loop = props.loop;
		this.disablePointerSelection = props.disablePointerSelection;
		this.vimBindings = props.vimBindings;

		useRefById({
			id: this.#id,
			ref: this.#ref,
		});
	}

	setState = <T extends keyof typeof this.state>(
		key: T,
		value: State[T],
		dontScrollIntoView?: boolean
	) => {
		if (this.state[key] === value) return;
		this.state[key] = value;

		if (key === "search") {
			this.#filterItems();
			this.#sort();
			// TODO: schedule select first item
		} else if (key === "value") {
			if (!dontScrollIntoView) {
				// TODO: scroll into view
			}
		}
	};

	handleValue = (id: string, value: string, keywords?: string[]) => {
		if (value === this.ids.get(id)?.value) return;
		this.ids.set(id, { value, keywords });
		this.state.filtered.items.set(id, this.#score(value, keywords));
		this.#sort();
	};

	handleItem = (id: string, groupId?: string) => {
		this.allItems.add(id);

		// track this item within the group
		if (groupId) {
			if (!this.allGroups.has(groupId)) {
				this.allGroups.set(groupId, new Set([id]));
			} else {
				this.allGroups.get(groupId)?.add(id);
			}
		}

		this.#filterItems();
		this.#sort();

		if (!this.state.value) {
			this.#selectFirstItem();
		}

		return () => {
			this.ids.delete(id);
			this.allItems.delete(id);
			this.state.filtered.items.delete(id);
			const selectedItem = this.#getSelectedItem() as unknown as HTMLElement;

			this.#filterItems();

			if (selectedItem?.getAttribute("id") === id) this.#selectFirstItem();
		};
	};

	handleGroup = (id: string) => {
		if (!this.allGroups.has(id)) {
			this.allGroups.set(id, new Set());
		}

		return () => {
			this.ids.delete(id);
			this.allGroups.delete(id);
		};
	};

	#score = (value: string, keywords?: string[]) => {
		const filter = this.filter.current ?? defaultFilter;
		return value ? filter(value, this.state.search, keywords) : 0;
	};

	#sort = () => {
		if (!this.state.search || this.shouldFilter.current === false) return;

		const scores = this.state.filtered.items;

		// sort the groups
		const groups: [string, number][] = [];
		for (const value of this.state.filtered.groups) {
			const items = this.allGroups.get(value);
			if (!items) continue;

			// get the max score of the group's items
			let max = 0;

			for (const item of items) {
				const score = scores.get(item) ?? 0;
				max = Math.max(score, max);
			}

			groups.push([value, max]);
		}

		// sort items within groups to bottom
		// sort items outside of groups
		// sort groups t0o bottom (pushes all non-grouped items to the top)

		const listInsertionElement = this.listInnerNode;

		this.#getValidItems()
			.sort((a, b) => {
				const valueA = a.getAttribute("id");
				const valueB = b.getAttribute("id");
				return (scores.get(valueA ?? "") ?? 0) - (scores.get(valueB ?? "") ?? 0);
			})
			.forEach((item) => {
				const group = item.closest(GROUP_ITEMS_SELECTOR);

				if (group) {
					const nodeToAppend =
						item.parentElement === group
							? item
							: item.closest(`${GROUP_ITEMS_SELECTOR} > *`);
					if (!nodeToAppend) return;
					group.appendChild(nodeToAppend);
				} else {
					const nodeToAppend =
						item.parentElement === listInsertionElement
							? item
							: item.closest(`${GROUP_ITEMS_SELECTOR} > *`);
					if (!nodeToAppend) return;
					listInsertionElement?.appendChild(nodeToAppend);
				}
			});

		groups
			.sort((a, b) => b[1] - a[1])
			.forEach((group) => {
				const element = this.listInnerNode?.querySelector(
					`${GROUP_SELECTOR}[${VALUE_ATTR}="${encodeURIComponent(group[0])}"]`
				);
				element?.parentElement?.appendChild(element);
			});
	};

	#selectFirstItem = () => {
		const item = this.#getValidItems().find(
			(item) => item.getAttribute("aria-disabled") !== "true"
		);
		const value = item?.getAttribute(VALUE_ATTR);
		if (!value) return;
		this.setState("value", value);
	};

	#filterItems = () => {
		if (!this.state.search || this.shouldFilter.current === false) {
			this.state.filtered.count = this.allItems.size;
			return;
		}

		// reset the groups
		this.state.filtered.groups = new Set();
		let itemCount = 0;

		// Check which items should be included
		for (const id of this.allItems) {
			const value = this.ids.get(id)?.value ?? "";
			const keywords = this.ids.get(id)?.keywords ?? [];
			const rank = this.#score(value, keywords);
			this.state.filtered.items.set(id, rank);
			if (rank > 0) itemCount++;
		}

		// Check which groups have at least 1 item shown
		for (const [groupId, group] of this.allGroups) {
			for (const itemId of group) {
				if (this.state.filtered.items.get(itemId) ?? -1 > 0) {
					this.state.filtered.groups.add(groupId);
					break;
				}
			}
		}

		this.state.filtered.count = itemCount;
	};

	#scrollSelectedIntoView = () => {
		const item = this.#getSelectedItem();

		if (!item) return;
		if (item.parentElement?.firstChild === item) {
			// first item in group, ensure heading is in view
			item
				.closest(GROUP_SELECTOR)
				?.querySelector(GROUP_HEADING_SELECTOR)
				?.scrollIntoView({ block: "nearest" });
		}

		// ensure item is always in view
		item.scrollIntoView({ block: "nearest" });
	};

	#getSelectedItem = () => {
		return this.listInnerNode?.querySelector<HTMLElement>(
			`${ITEM_SELECTOR}[aria-selected="true"]`
		);
	};

	#getValidItems = () => {
		return Array.from(
			this.listInnerNode?.querySelectorAll<HTMLElement>(VALID_ITEM_SELECTOR) ?? []
		);
	};

	#updateSelectedToIndex = (index: number) => {
		const items = this.#getValidItems();
		const item = items[index];
		if (!item) return;
		const valueAttr = item.getAttribute(VALUE_ATTR);
		if (!valueAttr) return;
		this.setState("value", valueAttr);
	};

	#updateSelectedByItem(change: 1 | -1) {
		const selected = this.#getSelectedItem();
		const items = this.#getValidItems();
		const index = items.findIndex((item) => item === selected);

		// Get item at this index
		let newSelected = items[index + change];

		if (this.loop.current) {
			newSelected =
				index + change < 0
					? items[items.length - 1]
					: index + change === items.length
						? items[0]
						: items[index + change];
		}

		if (newSelected) {
			const valueAttr = newSelected.getAttribute(VALUE_ATTR);
			if (!valueAttr) return;
			this.setState("value", valueAttr);
		}
	}

	#updateSelectedByGroup(change: 1 | -1) {
		const selected = this.#getSelectedItem();
		let group = selected?.closest(GROUP_SELECTOR);
		// eslint-disable-next-line no-undef-init
		let item: HTMLElement | undefined | null = undefined;

		while (group && !item) {
			group =
				change > 0
					? findNextSibling(group, GROUP_SELECTOR)
					: findPreviousSibling(group, GROUP_SELECTOR);
			item = group?.querySelector(VALID_ITEM_SELECTOR);
		}

		if (item) {
			const valueAttr = item.getAttribute(VALUE_ATTR);
			if (!valueAttr) return;
			this.setState("value", valueAttr);
		} else {
			this.#updateSelectedByItem(change);
		}
	}

	#last = () => {
		this.#updateSelectedToIndex(this.#getValidItems().length - 1);
	};

	#next = (e: KeyboardEvent) => {
		e.preventDefault();

		if (e.metaKey) {
			// last item
			this.#last();
		} else if (e.altKey) {
			// next group
			this.#updateSelectedByGroup(1);
		} else {
			// next item
			this.#updateSelectedByItem(1);
		}
	};

	#prev = (e: KeyboardEvent) => {
		e.preventDefault();

		if (e.metaKey) {
			// first item
			this.#updateSelectedToIndex(0);
		} else if (e.altKey) {
			// previous group
			this.#updateSelectedByGroup(-1);
		} else {
			// previous item
			this.#updateSelectedByItem(-1);
		}
	};

	#onkeydown = (e: KeyboardEvent) => {
		const vim = this.vimBindings.current;
		switch (e.key) {
			case "n":
			case "j":
				// vim keybind down
				if (vim && e.ctrlKey) {
					this.#next(e);
				}
				break;
			case "ArrowDown":
				this.#next(e);
				break;
			case "p":
			case "k":
				// vim keybind up
				if (vim && e.ctrlKey) {
					this.#prev(e);
				}
				break;
			case "ArrowUp":
				this.#prev(e);
				break;
			case "Home":
				// first item
				e.preventDefault();
				this.#updateSelectedToIndex(0);
				break;
			case "End":
				// last item
				e.preventDefault();
				this.#last();
				break;
			case "Enter":
				// Check if IME composition is finished before triggering onSelect
				// This prevents unwanted triggering while user is still inputting text with IME
				// e.keyCode === 229 is for the Japanese IME and Safari.
				// isComposing does not work with Japanese IME and Safari combination.
				if (!e.isComposing && e.keyCode !== 229) {
					// trigger item select
					e.preventDefault();
					const item = this.#getSelectedItem();
					if (item) {
						const event = new Event(SELECT_EVENT);
						item.dispatchEvent(event);
					}
				}
		}
	};

	props = $derived.by(
		() =>
			({
				id: this.#id.current,
				tabIndex: -1,
				"data-cmdk-root": "",
				onkeydown: this.#onkeydown,
			}) as const
	);

	labelProps = $derived.by(
		() =>
			({
				id: this.labelId,
				for: this.inputId,
				"data-cmdk-label": "",
				style: srOnlyStyles,
			}) as const
	);
}

type CommandGroupStateProps = WithRefProps &
	ReadableBoxedValues<{
		heading: string;
		value?: string;
		forceMount: boolean;
	}>;

class CommandGroupState {
	#id: CommandGroupStateProps["id"];
	#ref: CommandGroupStateProps["ref"];
	#heading: CommandGroupStateProps["heading"];
	#value: CommandGroupStateProps["value"];
	#forceMount: CommandGroupStateProps["forceMount"];

	constructor(props: CommandGroupStateProps) {
		this.#id = props.id;
		this.#ref = props.ref;
		this.#heading = props.heading;
		this.#value = props.value;
		this.#forceMount = props.forceMount;
	}
}

type CommandItemStateProps = WithRefProps &
	ReadableBoxedValues<{
		disabled: boolean;
		onSelect: (value: string) => void;
		value?: string;
		keywords?: string[];
		forceMount?: boolean;
	}>;

class CommandItemState {
	#id: CommandItemStateProps["id"];
	#ref: CommandItemStateProps["ref"];
	#disabled: CommandItemStateProps["disabled"];
	#onSelect: CommandItemStateProps["onSelect"];
	#value: CommandItemStateProps["value"];
	#keywords: CommandItemStateProps["keywords"];
	#forceMount: CommandItemStateProps["forceMount"];

	#root: CommandRootState;

	constructor(props: CommandItemStateProps, root: CommandRootState, group?: CommandGroupState) {
		this.#id = props.id;
		this.#ref = props.ref;
		this.#disabled = props.disabled;
		this.#onSelect = props.onSelect;
		this.#value = props.value;
		this.#keywords = props.keywords;
		this.#forceMount = props.forceMount;
		this.#root = root;
	}
}

function findNextSibling(el: Element, selector: string) {
	let sibling = el.nextElementSibling;

	while (sibling) {
		if (sibling.matches(selector)) return sibling;
		sibling = sibling.nextElementSibling;
	}
}

function findPreviousSibling(el: Element, selector: string) {
	let sibling = el.previousElementSibling;

	while (sibling) {
		if (sibling.matches(selector)) return sibling;
		sibling = sibling.previousElementSibling;
	}
}
