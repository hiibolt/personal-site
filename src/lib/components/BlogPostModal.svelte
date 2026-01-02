<script lang="ts">
	import type { BlogPost } from '$lib/blogParser';

	export let open = false;
	export let post: BlogPost | null = null;

	function handleClose() {
		open = false;
		post = null;
	}

	function handleEscape(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

{#if open && post}
	<div
		class="modal-backdrop"
		role="dialog"
		aria-modal="true"
		tabindex="0"
		aria-label="Blog post"
		style="outline: none;"
		onkeydown={handleEscape}
		onclick={handleClose}
	>
		<div
			class="modal tech-modal blog-post-modal"
			role="document"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<span class="modal-title">{post.meta.title}</span>
				<button class="modal-close" type="button" onclick={handleClose} aria-label="Close">✕</button>
			</div>
			<div class="blog-post-banner">
				<img src={post.meta.image} alt={post.meta.title} />
			</div>
			<div class="blog-post-meta">
				<span class="blog-date">{new Date(post.meta.date).toLocaleDateString()}</span>
				<div class="blog-tags">
					{#each post.meta.tags as tag}
						<span class="blog-tag">{tag}</span>
					{/each}
				</div>
			</div>
			<div class="blog-post-content">
				{@html post.html}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(10, 20, 30, 0.75);
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.2s;
	}
	.modal {
		background: #5c4033;
		border: 2px solid #d4a574;
		border-radius: 16px;
		box-shadow: 0 8px 32px 0 rgba(0,0,0,0.45);
		min-width: 340px;
		max-width: 90vw;
		min-height: 220px;
		padding: 0;
		color: #fff;
		font-family: 'JetBrains Mono', 'Fira Mono', 'Courier New', monospace;
		overflow: hidden;
		animation: popIn 0.2s;
	}
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #4a3728;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #d4a574;
	}
	.modal-title {
		font-size: 1.2rem;
		font-weight: bold;
		letter-spacing: 1px;
		color: #d4a574;
	}
	.modal-close {
		background: none;
		border: none;
		color: #d4a574;
		font-size: 1.5rem;
		cursor: pointer;
		transition: color 0.2s;
	}
	.modal-close:hover {
		color: #f5f1de;
	}

	.blog-post-modal {
		max-width: 95vw;
		max-height: 85vh;
		overflow-y: auto;
	}
	.blog-post-banner {
		width: 100%;
		height: 250px;
		overflow: hidden;
	}
	.blog-post-banner img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.blog-post-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		border-bottom: 1px solid #d4a574;
		flex-wrap: wrap;
	}
	.blog-date {
		font-size: 0.85rem;
		color: #b8a896;
	}
	.blog-tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.blog-tag {
		display: inline-block;
		background: rgba(212, 165, 116, 0.2);
		color: #d4a574;
		padding: 0.25rem 0.75rem;
		border-radius: 16px;
		font-size: 0.8rem;
	}

	:global(.blog-post-content) {
		padding: 2rem 1.5rem;
		color: #f5f1de;
		font-size: 1rem;
		line-height: 1.8;
		max-width: 75ch;
		margin: 0 auto;
	}
	:global(.blog-post-content h1),
	:global(.blog-post-content h2),
	:global(.blog-post-content h3),
	:global(.blog-post-content h4),
	:global(.blog-post-content h5),
	:global(.blog-post-content h6) {
		color: #d4a574;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		font-weight: 600;
	}
	:global(.blog-post-content h1) {
		font-size: 1.8rem;
	}
	:global(.blog-post-content h2) {
		font-size: 1.5rem;
	}
	:global(.blog-post-content h3) {
		font-size: 1.25rem;
	}
	:global(.blog-post-content p) {
		margin: 1rem 0;
	}
	:global(.blog-post-content code) {
		background: rgba(92, 64, 51, 0.5);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: 'Courier New', monospace;
		font-size: 0.95em;
		color: #f5f1de;
		border: 1px solid rgba(212, 165, 116, 0.3);
	}
	:global(.blog-post-content pre) {
		background: rgba(92, 64, 51, 0.3);
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		margin: 1rem 0;
		border-left: 3px solid #d4a574;
	}
	:global(.blog-post-content pre code) {
		background: none;
		padding: 0;
		border-radius: 0;
		color: #f5f1de;
	}
	:global(.blog-post-content a) {
		color: #d4a574;
		text-decoration: underline;
		transition: color 0.2s;
	}
	:global(.blog-post-content a:hover) {
		color: #e5c8a8;
	}
	:global(.blog-post-content blockquote) {
		border-left: 3px solid #d4a574;
		margin: 1rem 0;
		padding-left: 1rem;
		color: #d4a574;
		font-style: italic;
	}
	:global(.blog-post-content ul),
	:global(.blog-post-content ol) {
		margin: 1rem 0;
		padding-left: 2rem;
	}
	:global(.blog-post-content li) {
		margin: 0.5rem 0;
	}
	:global(.blog-post-content img) {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		margin: 1rem 0;
	}
	:global(.math-block),
	:global(.math-inline) {
		color: #d4a574;
	}
	:global(.hljs) {
		background: transparent;
		color: #f5f1de;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes popIn {
		from { transform: scale(0.95); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}
</style>
