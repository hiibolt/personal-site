<script lang="ts">
	export let open = false;

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
		aria-label="Close modal"
		style="outline: none;"
		onkeydown={handleEscape}
		onclick={handleClose}
	>
		<div
			class="modal tech-modal"
			role="document"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<span class="modal-title">About Me</span>
				<button class="modal-close" type="button" onclick={handleClose} aria-label="Close">✕</button>
			</div>
			<div class="modal-banner">
				<img src="https://raw.githubusercontent.com/hiibolt/nixos/master/backgrounds/12.jpg" alt="Banner" />
			</div>
			<div class="modal-body">
				<div class="modal-text">
					<h2>Hi there, I'm @hiibolt!</h2>
					<p>I'm an enthusiastic Rust developer who loves all things tech -<br>
					If I'm not programming, I'm messing with NixOS or Kubernetes on my homelab :3<br></p>
				</div>
			</div>            
			<div class="modal-hobbies">
				<h3>Hobbies</h3>
				<div class="hobby-tags">
					<span class="hobby-tag">Motorcycling</span>
					<span class="hobby-tag">Electric Skateboarding</span>
					<span class="hobby-tag">Snowboarding</span>
					<span class="hobby-tag">Food</span>
					<span class="hobby-tag">EDM</span>
					<span class="hobby-tag">Cars</span>
				</div>
			</div>
			<div class="modal-hobbies">
				<h3>Tech Interests</h3>
				<div class="hobby-tags">
					<span class="hobby-tag">Svelte</span>
					<span class="hobby-tag">Nix / NixOS</span>
					<span class="hobby-tag">Rust</span>
					<span class="hobby-tag">Kubernetes</span>
					<span class="hobby-tag">Impermanence</span>
					<span class="hobby-tag">Declarative State</span>
				</div>
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
	.modal-banner {
		width: 100%;
		height: 200px;
		overflow: hidden;
	}
	.modal-banner img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
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
	.modal-body {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem 2rem 1rem 2rem;
	}
	.modal-text h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.3rem;
		color: #d4a574;
	}
	.modal-text p {
		margin: 0;
		font-size: 1rem;
		color: #f5f1de;
	}
	.modal-hobbies {
		padding: 1.5rem 2rem;
		border-top: 1px solid #d4a574;
	}
	.modal-hobbies h3 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		color: #d4a574;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.hobby-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.hobby-tag {
		display: inline-block;
		background: rgba(212, 165, 116, 0.15);
		color: #d4a574;
		padding: 0.4rem 0.9rem;
		border-radius: 20px;
		font-size: 0.85rem;
		border: 1px solid #d4a574;
		transition: background 0.2s, color 0.2s;
	}
	.hobby-tag:hover {
		background: #d4a574;
		color: #5c4033;
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
