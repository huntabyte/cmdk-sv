export const code = `<script>
  import * as Command from 'cmdk-sv';
  let loading = false
</script>
  
<Command.Root>
  <Command.Input />
  <Command.List>
    {#if loading}
      <Command.Loading>Loading...</Command.Loading>
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

// a function that removes indentation from all lines in a string
export function unindent(s: string) {
	const lines = s.split('\n');
	const indent = lines[0].match(/^\s*/)?.[0];
	if (!indent) return s;
	return lines.map((line) => line.replace(indent, '')).join('\n');
}

// remove spaces from the beginning and end of a string
export function trim(s: string) {
	return s.replace(/^\s+|\s+$/g, '');
}
