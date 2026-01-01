<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let canvasContainer: HTMLDivElement;
	let p5Instance: any;

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
            let snowflakes: any[] = [];
            let commands: string[] = [];

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

				p.draw = () => {
                    // wait for images to load
                    if ( !bg_image || !wall_overlay_image || !snowflake_image || !computer_overlay_image ) {
                        return;
                    }
                    
                    // parallax effect
                    const x_offset = ( p.windowWidth / 2 - p.mouseX ) * 0.02;
                    const y_offset = ( p.windowHeight / 2 - p.mouseY ) * 0.02;
                    p.push();
                    p.scale( p.windowWidth / 1920, p.windowHeight / 1080 );
                    p.translate( x_offset * 0.15, y_offset * 0.05 );
                    p.push();
                    p.translate( x_offset * 0.10, y_offset * 0.01 );
                    p.push();
                    p.translate( x_offset * 0.05, y_offset * 0.005 );

                    // background
                    p.image(bg_image, 260, 100, 1920 * 0.80, 1080 * 0.85);
                    
                    // lantern glow
                    phase += Math.random();
                    for ( let i = 0; i < 10; i++ ) {
                        const offset = Math.cos( phase / 20 ) * 50;

                        p.noStroke();
                        p.fill(255, 140, 0, 15);
                        p.ellipse(520, 680, 100 + i * 20 + offset, 200 + i * 40 + offset);
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

                    p.filter(p.BLUR, 0.5);
                    p.pop();

                    // wall
                    p.image(wall_overlay_image, -130, -125, 2120, 1280);
                    p.pop();

                    // computer
                    p.push();
                    p.translate(-230, -130);
                    p.image(computer_overlay_image, 0, 0, 1920 * 1.2, 1080 * 1.2);

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

                    p.pop();

                    p.pop();
				};

				p.windowResized = () => {
					p.resizeCanvas(p.windowWidth, p.windowHeight);
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

<style>
	.canvas-container {
		width: 100vw;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 0;
	}
</style>
