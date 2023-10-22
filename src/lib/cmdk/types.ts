/* eslint-disable @typescript-eslint/ban-types */
import type { Expand, HTMLDivAttributes } from '$lib/internal';
import type { Dialog as DialogPrimitive } from 'bits-ui';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { Writable } from 'svelte/store';

//
// PROPS
//

export type LoadingProps = {
	/** Estimated loading progress */
	progress?: number;
} & HTMLDivAttributes;

export type EmptyProps = HTMLDivAttributes;

export type SeparatorProps = {
	/**
	 * Whether this separator is always rendered, regardless
	 * of the filter.
	 */
	alwaysRender?: boolean;
} & HTMLDivAttributes;

export type DialogProps = DialogPrimitive.Props & {};

type BaseCommandProps = {
	/**
	 * An accessible label for the command menu.
	 * Not visible & only used for screen readers.
	 */
	label?: string;

	/**
	 * Optionally set to `false` to turn off the automatic filtering
	 * and sorting. If `false`, you must conditionally render valid
	 * items yourself.
	 */
	shouldFilter?: boolean;

	/**
	 * A custom filter function for whether each command item should
	 * match the query. It should return a number between `0` and `1`,
	 * with `1` being a perfect match, and `0` being no match, resulting
	 * in the item being hidden entirely.
	 *
	 * By default, it will use the `command-score` package to score.
	 */
	filter?: (value: string, search: string) => number;

	/**
	 * Optionally provide or bind to the selected command menu item.
	 */
	value?: string;

	/**
	 * A function that is called when the selected command menu item
	 * changes. It receives the new value as an argument.
	 */
	onValueChange?: (value: string) => void;

	/**
	 * Optionally set to `true` to enable looping through the items
	 * when the user reaches the end of the list using the keyboard.
	 */
	loop?: boolean;
};

export type CommandProps = Expand<BaseCommandProps> & HTMLDivAttributes;

export type ListProps = HTMLDivAttributes;

export type InputProps = {
	/**
	 * Function called when the search value changes.
	 * It receives the new value as an argument.
	 */
	onValueChange?: (search: string) => void;
} & HTMLInputAttributes;

export type GroupProps = {
	/**
	 * Optional heading to render for the group
	 */
	heading?: string;

	/**
	 * If heading isn't provided, you must provide a unique
	 * value for the group.
	 */
	value?: string;

	/**
	 * Whether or not this group is always rendered,
	 * regardless of filtering.
	 */
	alwaysRender?: boolean;
} & HTMLDivAttributes;

export type ItemProps = {
	/**
	 * Whether this item is disabled.
	 */
	disabled?: boolean;

	/**
	 * A function called when this item is selected, either
	 * via click or keyboard selection.
	 */
	onSelect?: (value: string) => void;

	/**
	 * A unique value for this item.
	 * If not provided, it will be inferred from the rendered
	 * `textContent`. If your `textContent` is dynamic, you must
	 * provide a stable unique `value`.
	 */
	value?: string;

	/**
	 * Whether or not this item is always rendered,
	 * regardless of filtering.
	 */
	alwaysRender?: boolean;
} & HTMLDivAttributes;

//
// Internal
//
export type CommandOptionStores = {
	[K in keyof Omit<Required<BaseCommandProps>, 'value'>]: Writable<CommandProps[K]>;
};

export type State = {
	search: string;
	value: string;
	filtered: {
		count: number;
		items: Map<string, number>;
		groups: Set<string>;
	};
};

export type CommandIds = Record<'root' | 'label' | 'input' | 'list', string>;

export type Context = {
	value: (id: string, value: string) => void;
	item: (id: string, groupId: string | undefined) => void;
	group: (id: string) => void;
	filter: () => boolean;
	label: string;
	commandEl: Writable<HTMLElement | null>;
	ids: CommandIds;
	updateState: UpdateState;
};

type UpdateState = <K extends keyof State>(
	key: K,
	value: State[K],
	scrollIntoView?: boolean
) => void;

export type ConextStore = Writable<Context>;

export type StateStore = Writable<State> & {
	updateState: UpdateState;
};

export type Group = {
	id: string;
	alwaysRender: boolean;
};
