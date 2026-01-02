<script lang="ts">
	import type { BlogPost } from '$lib/blogParser';

	export let open = false;
	export let blogPosts: BlogPost[] = [];
	export let onSelectPost: (post: BlogPost) => void = () => {};

	function handleClose() {
		open = false;
	}

	function handleEscape(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

{#if open}
	<div
		class="modal-backdrop"
		role="dialog"
		aria-modal="true"
		tabindex="0"
		aria-label="Blog posts"
		style="outline: none;"
		onkeydown={handleEscape}
		onclick={handleClose}
	>
		<div
			class="modal tech-modal blog-modal"
			role="document"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<span class="modal-title">Blog</span>
				<button class="modal-close" type="button" onclick={handleClose} aria-label="Close">✕</button>
			</div>
			<div class="blog-list">
				{#each blogPosts as post (post.meta.slug)}
					<div class="blog-item" onclick={() => onSelectPost(post)}>
						<div class="blog-item-image">
							<img src={post.meta.image} alt={post.meta.title} />
						</div>
						<div class="blog-item-content">
							<h3>{post.meta.title}</h3>
							<p>{post.meta.description}</p>
							<div class="blog-item-meta">
								<span class="blog-date">{new Date(post.meta.date).toLocaleDateString()}</span>
								<div class="blog-tags">
									{#each post.meta.tags as tag}
										<span class="blog-tag">{tag}</span>
									{/each}
								</div>
							</div>
						</div>
					</div>
				{/each}
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

	.blog-modal {
		max-width: 95vw;
		max-height: 85vh;
		overflow-y: auto;
	}
	.blog-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		max-width: 70ch;
		margin: 0 auto;
	}
	.blog-item {
		display: flex;
		gap: 1.5rem;
		padding: 1rem;
		background: rgba(212, 165, 116, 0.08);
		border: 1px solid #d4a574;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.blog-item:hover {
		background: rgba(212, 165, 116, 0.15);
		transform: translateX(4px);
	}
	.blog-item-image {
		flex-shrink: 0;
		width: 120px;
		height: 120px;
		border-radius: 8px;
		overflow: hidden;
	}
	.blog-item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.blog-item-content {
		flex: 1;
		min-width: 0;
	}
	.blog-item-content h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		color: #d4a574;
		word-wrap: break-word;
	}
	.blog-item-content p {
		margin: 0 0 0.75rem 0;
		font-size: 0.95rem;
		color: #e0d5c7;
		line-height: 1.4;
	}
	.blog-item-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
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

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes popIn {
		from { transform: scale(0.95); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}
</style>
