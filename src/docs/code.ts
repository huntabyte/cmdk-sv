export const code = `
<script>
  import { Command } from 'cmdk-sv';
  let loading = false
</script>

<Command.Root>
  <Command.Input />
  <Command.List>

    {#if loading}
	  <Command.Loading>Hang on…</Command.Loading>
    {/if}
  
    <Command.Empty>No results found.</Command.Empty>

    <Command.Group heading="Fruits">
	  <Command.Item>Apple</Command.Item>
	  <Command.Item>Orange</Command.Item>
	  <Command.Separator />
	  <Command.Item>Pear</Command.Item>
	  <Command.Item>Blueberry</Command.Item>
    </Command.Group>

    <Command.Item>Fish</Command.Item>
  </Command.List>
</Command.Root>`;
