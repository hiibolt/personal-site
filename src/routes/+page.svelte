<script lang="ts">
	import { loadAllBlogPosts } from '$lib/blogParser';
	import type { BlogPost } from '$lib/blogParser';
	import Canvas from '$lib/components/Canvas.svelte';
	import AboutModal from '$lib/components/AboutModal.svelte';
	import BlogListModal from '$lib/components/BlogListModal.svelte';
	import BlogPostModal from '$lib/components/BlogPostModal.svelte';

	let showAboutModal = false;
	let showBlogModal = false;
	let showBlogPostModal = false;
	let blogPosts: BlogPost[] = [];
	let selectedBlogPost: BlogPost | null = null;

	const help_text = [
		'about    - About @hiibolt',
		"blog     - Open @hiibolt's blog",
		"projects - View @hiibolt's projects",
		"resume   - View @hiibolt's resume",
		'clear    - Clears terminal'
	];

	function handleTerminalCommand(event: CustomEvent<string>) {
		const command = event.detail;
		if (command === 'about') {
			showAboutModal = true;
		} else if (command === 'blog') {
			showBlogModal = true;
			if (blogPosts.length === 0) {
				loadAllBlogPosts()
					.then((posts) => {
						blogPosts = posts;
						// Preload blog post images
						preloadBlogImages(posts);
					})
					.catch(() => {
						console.error('Error loading blog posts');
					});
			}
		}
	}

	function preloadBlogImages(posts: BlogPost[]) {
		posts.forEach((post) => {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'image';
			link.href = post.meta.image;
			document.head.appendChild(link);
		});
	}

	function handleSelectBlogPost(post: BlogPost) {
		selectedBlogPost = post;
		showBlogPostModal = true;
	}
</script>

<Canvas on:terminalCommand={handleTerminalCommand} />

<AboutModal bind:open={showAboutModal} />

<BlogListModal
	bind:open={showBlogModal}
	{blogPosts}
	onSelectPost={handleSelectBlogPost}
/>

<BlogPostModal bind:open={showBlogPostModal} post={selectedBlogPost} />
