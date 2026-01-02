<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { loadAllBlogPosts } from '$lib/blogParser';
	import type { BlogPost } from '$lib/blogParser';
	
	let canvasContainer: HTMLDivElement;
	let p5Instance: any;
	let showAboutModal = false;
	let showBlogModal = false;
	let showBlogPostModal = false;
	let blogPosts: BlogPost[] = [];
	let selectedBlogPost: BlogPost | null = null;

	onMount(() => {
		if (!browser) return;
		
		// Dynamic import to ensure P5.js only loads on client-side
		(async () => {
			const p5Module = await import('p5');
			const p5 = p5Module.default;

            let bg_image: any;
            let wall_overlay_image: any;
            let snowflake_image: any;
            let computer_overlay_image: any;

            let phase: number = 0;

            // snowflake state
            interface Snowflake {
                x: number;
                y: number;
                v_x: number;
                v_y: number;
                size: number;
            };
            let snowflakes: Snowflake[] = [];

            // terminal state
            const help_text = [
                'about    - About @hiibolt',
                "blog     - Open @hiibolt's blog",
                "projects - View @hiibolt's projects",
                "resume   - View @hiibolt's resume",
                'clear    - Clears terminal'
            ];
            let terminal_history: string[] = ['> help', ...help_text];
            let terminal_input: string = '';

            function pushToTerminalHistory ( str: string ) {
                let line = '';
                for ( let char of str ) {
                    line += char;
                    if ( line.length >= 50 ) {
                        terminal_history.push(line);
                        line = '';
                    }
                }
                if ( line.length > 0 ) {
                    terminal_history.push(line);
                }
            }

			const sketch = (p: any) => {
				p.setup = () => {
					p.createCanvas(p.windowWidth, p.windowHeight);
					p.background(0, 255, 0); // Green background

					p.loadImage('/bg_image.jpg', (img: any) => {
						bg_image = img;
					}, (err: any) => {
						console.error('Failed to load bg_image.jpg', err);
					});
                    p.loadImage('/wall_overlay.png', (img: any) => {
						wall_overlay_image = img;
					}, (err: any) => {
						console.error('Failed to load wall_overlay.png', err);
					});
                    p.loadImage('/pixel_snowflake.png', (img: any) => {
						snowflake_image = img;
					}, (err: any) => {
						console.error('Failed to load pixel_snowflake.png', err);
					});
                    p.loadImage('/computer_overlay.png', (img: any) => {
                        computer_overlay_image = img;
                    }, (err: any) => {
                        console.error('Failed to load computer_overlay.png', err);
                    });

                    for ( let i = 0; i < 150; i++ ) {
                        snowflakes.push({
                            x: Math.random() * 1920,
                            y: Math.random() * 1080,
                            v_x: 0,
                            v_y: 0,
                            size: Math.random() * 10 + 5
                        });
                    }

				};

                function backgroundLayer () {
                    // background
                    p.image(bg_image, 260, 100, 1920 * 0.80, 1080 * 0.85);
                    
                    // lantern glow
                    phase += Math.random();
                    for ( let i = 0; i < 10; i++ ) {
                        const offset = Math.cos( phase / 20 ) * 50;

                        p.noStroke();
                        p.fill(255, 140, 0, 15);
                        p.ellipse(480, 680, 100 + i * 20 + offset, 200 + i * 40 + offset);
                    }

                    // snowflakes
                    for ( let flake of snowflakes ) {
                        flake.v_x = Math.sin( ( phase + flake.y ) / 20 ) * 0.5;
                        flake.v_y = Math.cos( ( phase + flake.x ) / 20 ) + 1.0;

                        flake.x += flake.v_x;
                        flake.y += flake.v_y;

                        if ( flake.y > 1080 ) {
                            flake.y = -10;
                            flake.x = Math.random() * 1920;
                        }
                        if ( flake.x > 1920 ) {
                            flake.x = -10;
                        }
                        if ( flake.x < -10 ) {
                            flake.x = 1920 + 10;
                        }
                        if ( flake.y < -10 ) {
                            flake.y = 1080 + 10;
                        }

                        p.image(snowflake_image, flake.x, flake.y, flake.size, flake.size);
                    }
                }
                function wallLayer () {
                    p.image(wall_overlay_image, -130, -125, 2120, 1280);
                }
                function computerLayer () {
                    p.image(computer_overlay_image, 0, 0, 1920 * 1.2, 1080 * 1.2);

                    // computer screen glow
                    p.noStroke();
                    const size = 32;
                    const brightness = 205;
                    for ( let i = 0; i < 10; i++ ) {
                        p.fill(brightness, brightness, brightness, 5);
                        p.rect(
                            871 - (size / 2 * i),
                            675 - (size / 2 * i),
                            652 + (size * i),
                            380 + (size * i),
                            10
                        );
                    }
                    p.fill(25);
                    p.rect(871, 675, 652, 380);

                    // terminal history
                    p.fill(255, 255, 255, 150);
                    p.textSize(20);
                    p.textFont('Courier New');
                    let text_y = 710;
                    for ( let ind = Math.max(0, terminal_history.length - 13); ind < terminal_history.length; ind++ ) {
                        p.text(terminal_history[ind], 890, text_y);
                        text_y += 25;
                    }

                    // input prompt
                    let underscore = p.frameCount % 80 < 40 ? "_" : " ";
                    p.text(`> ${terminal_input}${underscore}`, 890, text_y);

                    // computer reflection
                    const spacing = 25;
                    const reflection_color = 105;
                    const opacity = 5;
                    for ( let i = 0; i < 15; i++ ) {
                        p.fill(reflection_color, reflection_color, reflection_color, opacity);
                        p.rect(871, 675 + i * spacing, 652, 380 - i * spacing);
                    }
                }
				p.draw = () => {
                    // wait for images to load
                    if ( !bg_image || !wall_overlay_image || !snowflake_image || !computer_overlay_image ) {
                        return;
                    }
                    
                    // parallax effect
                    const x_parallax_offset = ( p.windowWidth / 2 - p.mouseX ) * 0.02;
                    const y_parallax_offset = ( p.windowHeight / 2 - p.mouseY ) * 0.02;
                    p.push(); // start fg layer
                    p.translate(
                        x_parallax_offset * 0.15,
                        y_parallax_offset * 0.05
                    );
                    p.scale(
                        p.windowWidth / 1920,
                        p.windowHeight / 1080
                    );

                    p.push(); // start wall layer
                    p.translate( x_parallax_offset * 0.10, y_parallax_offset * 0.01 );

                    p.push(); // start bg layer
                    p.translate( x_parallax_offset * 0.05, y_parallax_offset * 0.005 );
                    backgroundLayer();
                    p.filter(p.BLUR, 0.5);
                    p.pop(); // end bg layer

                    wallLayer();
                    p.pop(); // end wall layer

                    p.push(); // start computer layer
                    p.translate(-235, -180);
                    computerLayer();
                    p.pop(); // end computer layer

                    // shadows
                    for ( let i = 0; i < 15; i++ ) {
                        p.noStroke();
                        p.fill(0, 0, 0, 5);
                        p.rect(-20, 0, i * 50, 1080);
                        p.rect(1920 + 20 - i * 50, 0, i * 50, 1080);
                        p.rect(-20, 1080 - i * 30, 1920 + 40, 1080);
                    }

                    p.pop(); // end fg layer
				};

				p.windowResized = () => {
					p.resizeCanvas(p.windowWidth, p.windowHeight);
				};

                p.keyPressed = () => {
                    // backspace key
                    if ( p.keyCode === 8 ) { 
                        terminal_input = terminal_input.slice(0, -1);
                        return;
                    }

                    // enter key
                    if ( p.keyCode === 13 ) { 
                        // clear commmand
                        if ( terminal_input === 'clear' ) {
                            terminal_history = [];
                            terminal_input = '';
                            return;
                        }

                        // other commands
                        terminal_history.push(`> ${terminal_input}`);
                        if ( terminal_input === 'about' ) {
                            showAboutModal = true;
                        } else if ( terminal_input === 'blog' ) {
                            showBlogModal = true;
                            if (blogPosts.length === 0) {
                                loadAllBlogPosts().then((posts) => {
                                    blogPosts = posts;
                                }).catch(() => {
                                    terminal_history.push('Error loading blog posts');
                                });
                            }
                        } else if ( terminal_input === 'help' ) {
                            terminal_history.push(...help_text);
                        } else {
                            terminal_history.push(`Command not found: ${terminal_input}`);
                        }

                        terminal_input = '';
                        return;
                    }
                    
                    if ( p.key.length === 1 ) {
                        terminal_input += p.key;
                    }
                };
			};

			p5Instance = new p5(sketch, canvasContainer);
		})();

		// Cleanup function
		return () => {
			p5Instance?.remove();
		};
	});
</script>


<div bind:this={canvasContainer} class="canvas-container"></div>

{#if showAboutModal}
    <div
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        tabindex="0"
        aria-label="Close modal"
        style="outline: none;"
        onkeydown={(e) => { if (e.key === 'Escape') { showAboutModal = false; } }}
    >
        <div
            class="modal tech-modal"
            role="document"
            onclick={(e) => e.stopPropagation()}
        >
            <div class="modal-header">
                <span class="modal-title">About Me</span>
                <button class="modal-close" type="button" onclick={() => showAboutModal = false} aria-label="Close">✕</button>
            </div>
            <div class="modal-banner">
                <img src="https://raw.githubusercontent.com/hiibolt/nixos/master/backgrounds/12.jpg" alt="Banner" />
            </div>
            <div class="modal-body">
                <div class="modal-text">
                    <h2>Hi there, I’m @hiibolt!</h2>
                    <p>I'm an enthusiastic Rust developer who loves all things tech -<br>
                    If I'm not programming, I'm messing with NixOS or Kubernetes on my homelab :3<br>
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

<!-- Blog List Modal -->
{#if showBlogModal && !showBlogPostModal}
  <div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    tabindex="0"
    aria-label="Blog posts"
    style="outline: none;"
    onkeydown={(e) => { if (e.key === 'Escape') { showBlogModal = false; } }}
  >
    <div
      class="modal tech-modal blog-modal"
      role="document"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="modal-header">
        <span class="modal-title">Blog</span>
        <button class="modal-close" type="button" onclick={() => showBlogModal = false} aria-label="Close">✕</button>
      </div>
      <div class="blog-list">
        {#each blogPosts as post (post.meta.slug)}
          <div class="blog-item" onclick={() => { selectedBlogPost = post; showBlogPostModal = true; }}>
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

<!-- Blog Post Detail Modal -->
{#if showBlogPostModal && selectedBlogPost}
  <div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    tabindex="0"
    aria-label="Blog post"
    style="outline: none;"
    onkeydown={(e) => { if (e.key === 'Escape') { showBlogPostModal = false; selectedBlogPost = null; } }}
  >
    <div
      class="modal tech-modal blog-post-modal"
      role="document"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="modal-header">
        <span class="modal-title">{selectedBlogPost.meta.title}</span>
        <button class="modal-close" type="button" onclick={() => { showBlogPostModal = false; selectedBlogPost = null; }} aria-label="Close">✕</button>
      </div>
      <div class="blog-post-banner">
        <img src={selectedBlogPost.meta.image} alt={selectedBlogPost.meta.title} />
      </div>
      <div class="blog-post-meta">
        <span class="blog-date">{new Date(selectedBlogPost.meta.date).toLocaleDateString()}</span>
        <div class="blog-tags">
          {#each selectedBlogPost.meta.tags as tag}
            <span class="blog-tag">{tag}</span>
          {/each}
        </div>
      </div>
      <div class="blog-post-content">
        {@html selectedBlogPost.html}
      </div>
    </div>
  </div>
{/if}

<style>
    /* stylelint-disable-next-line no-descending-specificity */
    .canvas-container {
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 0;
    }

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
    
    /* Blog Modal Styles */
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
