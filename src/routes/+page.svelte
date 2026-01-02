<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let canvasContainer: HTMLDivElement;
	let p5Instance: any;
	let showAboutModal = false;

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
            const help_text = ['about - About @hiibolt', 'clear - Clears terminal'];
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
                            pushToTerminalHistory('hiii :3');
                            showAboutModal = true;
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
                <span class="modal-title">About @hiibolt</span>
                <button class="modal-close" type="button" onclick={() => showAboutModal = false} aria-label="Close">✕</button>
            </div>
            <div class="modal-body">
                <div class="modal-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="8" width="40" height="32" rx="4" fill="#5c4033" stroke="#d4a574" stroke-width="2"/>
                        <rect x="8" y="12" width="32" height="24" rx="2" fill="#4a3728"/>
                        <rect x="12" y="16" width="24" height="16" rx="1" fill="#5c4033"/>
                        <circle cx="24" cy="24" r="3" fill="#d4a574"/>
                        <rect x="20" y="32" width="8" height="2" rx="1" fill="#d4a574"/>
                    </svg>
                </div>
                <div class="modal-text">
                    <h2>Hi, I’m @hiibolt!</h2>
                    <p>Full-stack developer, Svelte enthusiast, and creative technologist.<br>
                    I love building interactive web experiences and exploring new tech.<br>
                    <span style="color:#d4a574;">Let's connect and build something awesome!</span></p>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
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
    .modal-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #4a3728;
        border-radius: 12px;
        padding: 0.75rem;
        box-shadow: 0 2px 8px 0 rgba(212,165,116,0.15);
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
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem 2rem 1.5rem 2rem;
        background: #4a3728;
        border-top: 1px solid #d4a574;
    }
    .modal-btn {
        background: #d4a574;
        color: #4a3728;
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1.5rem;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s, color 0.2s;
        box-shadow: 0 2px 8px 0 rgba(212,165,116,0.15);
    }
    .modal-btn:hover {
        background: #e5c8a8;
        color: #3e2723;
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
