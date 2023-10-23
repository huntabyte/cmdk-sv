<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../styles/globals.postcss';
	import '../styles/app.postcss';
	import '../styles/icons.postcss';
	import '../styles/code.postcss';
	import '../styles/cmdk/raycast.postcss';
	import '../styles/cmdk/linear.postcss';
	import '../styles/cmdk/framer.postcss';
	import '../styles/cmdk/vercel.postcss';
</script>

<ModeWatcher />
<slot />
