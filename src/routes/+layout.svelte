<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Preload critical images -->
	<link rel="preload" as="image" href="https://raw.githubusercontent.com/hiibolt/nixos/master/backgrounds/12.jpg" />
	<!-- DNS prefetch for external image domains -->
	<link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
</svelte:head>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
	
	:global(html) {
		height: 100%;
	}
</style>

{@render children()}
