<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';

	let canvasContainer: HTMLDivElement;
	let p5Instance: any;

	const dispatch = createEventDispatcher();

	// Snowflake interface
	interface Snowflake {
		x: number;
		y: number;
		v_x: number;
		v_y: number;
		size: number;
	}

	onMount(() => {
		if (!browser) return;

		(async () => {
			const p5Module = await import('p5');
			const p5 = p5Module.default;

			let bg_image: any;
			let wall_overlay_image: any;
			let snowflake_image: any;
			let computer_overlay_image: any;

			let phase: number = 0;
			let snowflakes: Snowflake[] = [];

			// Terminal state
			const help_text = [
				'about    - About @hiibolt',
				"blog     - Open @hiibolt's blog",
				"projects - View @hiibolt's projects",
				"resume   - View @hiibolt's resume",
				'clear    - Clears terminal'
			];
			let terminal_history: string[] = ['> help', ...help_text];
			let terminal_input: string = '';

			function pushToTerminalHistory(str: string) {
				let line = '';
				for (let char of str) {
					line += char;
					if (line.length >= 50) {
						terminal_history.push(line);
						line = '';
					}
				}
				if (line.length > 0) {
					terminal_history.push(line);
				}
			}

			const sketch = (p: any) => {
				p.setup = () => {
					p.createCanvas(p.windowWidth, p.windowHeight);
					p.background(0, 255, 0);

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

					for (let i = 0; i < 150; i++) {
						snowflakes.push({
							x: Math.random() * 1920,
							y: Math.random() * 1080,
							v_x: 0,
							v_y: 0,
							size: Math.random() * 10 + 5
						});
					}
				};

				function backgroundLayer() {
					p.image(bg_image, 260, 100, 1920 * 0.8, 1080 * 0.85);

					phase += Math.random();
					for (let i = 0; i < 10; i++) {
						const offset = Math.cos(phase / 20) * 50;

						p.noStroke();
						p.fill(255, 140, 0, 15);
						p.ellipse(480, 680, 100 + i * 20 + offset, 200 + i * 40 + offset);
					}

					for (let flake of snowflakes) {
						flake.v_x = Math.sin(((phase + flake.y) / 20)) * 0.5;
						flake.v_y = Math.cos(((phase + flake.x) / 20)) + 1.0;

						flake.x += flake.v_x;
						flake.y += flake.v_y;

						if (flake.y > 1080) {
							flake.y = -10;
							flake.x = Math.random() * 1920;
						}
						if (flake.x > 1920) {
							flake.x = -10;
						}
						if (flake.x < -10) {
							flake.x = 1920 + 10;
						}
						if (flake.y < -10) {
							flake.y = 1080 + 10;
						}

						p.image(snowflake_image, flake.x, flake.y, flake.size, flake.size);
					}
				}

				function wallLayer() {
					p.image(wall_overlay_image, -130, -125, 2120, 1280);
				}

				function computerLayer() {
					p.image(computer_overlay_image, 0, 0, 1920 * 1.2, 1080 * 1.2);

					p.noStroke();
					const size = 32;
					const brightness = 205;
					for (let i = 0; i < 10; i++) {
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

					p.fill(255, 255, 255, 150);
					p.textSize(20);
					p.textFont('Courier New');
					let text_y = 710;
					for (let ind = Math.max(0, terminal_history.length - 13); ind < terminal_history.length; ind++) {
						p.text(terminal_history[ind], 890, text_y);
						text_y += 25;
					}

					let underscore = p.frameCount % 80 < 40 ? "_" : " ";
					p.text(`> ${terminal_input}${underscore}`, 890, text_y);

					const spacing = 25;
					const reflection_color = 105;
					const opacity = 5;
					for (let i = 0; i < 15; i++) {
						p.fill(reflection_color, reflection_color, reflection_color, opacity);
						p.rect(871, 675 + i * spacing, 652, 380 - i * spacing);
					}
				}

				p.draw = () => {
					if (!bg_image || !wall_overlay_image || !snowflake_image || !computer_overlay_image) {
						return;
					}

					const x_parallax_offset = (p.windowWidth / 2 - p.mouseX) * 0.02;
					const y_parallax_offset = (p.windowHeight / 2 - p.mouseY) * 0.02;
					p.push();
					p.translate(
						x_parallax_offset * 0.15,
						y_parallax_offset * 0.05
					);
					p.scale(
						p.windowWidth / 1920,
						p.windowHeight / 1080
					);

					p.push();
					p.translate(x_parallax_offset * 0.1, y_parallax_offset * 0.01);

					p.push();
					p.translate(x_parallax_offset * 0.05, y_parallax_offset * 0.005);
					backgroundLayer();
					p.filter(p.BLUR, 0.5);
					p.pop();

					wallLayer();
					p.pop();

					p.push();
					p.translate(-235, -180);
					computerLayer();
					p.pop();

					for (let i = 0; i < 15; i++) {
						p.noStroke();
						p.fill(0, 0, 0, 5);
						p.rect(-20, 0, i * 50, 1080);
						p.rect(1920 + 20 - i * 50, 0, i * 50, 1080);
						p.rect(-20, 1080 - i * 30, 1920 + 40, 1080);
					}

					p.pop();
				};

				p.windowResized = () => {
					p.resizeCanvas(p.windowWidth, p.windowHeight);
				};

				p.keyPressed = () => {
					if (p.keyCode === 8) {
						terminal_input = terminal_input.slice(0, -1);
						return;
					}

					if (p.keyCode === 13) {
						if (terminal_input === 'clear') {
							terminal_history = [];
							terminal_input = '';
							return;
						}

						terminal_history.push(`> ${terminal_input}`);
						dispatch('terminalCommand', terminal_input);
						terminal_input = '';
						return;
					}

					if (p.key.length === 1) {
						terminal_input += p.key;
					}
				};
			};

			p5Instance = new p5(sketch, canvasContainer);
		})();

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
