import { marked } from 'marked';
import hljs from 'highlight.js';

export interface BlogMeta {
	title: string;
	description: string;
	slug: string;
	date: string;
	image: string;
	categories: string[];
	tags: string[];
}

export interface BlogPost {
	meta: BlogMeta;
	content: string;
	html: string;
}

// Configure marked with highlight.js
marked.setOptions({
	highlight: (code, lang) => {
		if (lang && hljs.getLanguage(lang)) {
			return hljs.highlight(code, { language: lang }).value;
		}
		return hljs.highlightAuto(code).value;
	},
	breaks: true
});

// Add katex support for math
const katexExtension = {
	name: 'katex',
	level: 'inline',
	start(src: string) {
		return src.indexOf('$');
	},
	tokenizer(src: string) {
		// Block math $$...$$
		const blockRegex = /^\$\$([^$]+)\$\$/;
		const blockMatch = blockRegex.exec(src);
		if (blockMatch) {
			return {
				type: 'katex_block',
				raw: blockMatch[0],
				text: blockMatch[1].trim()
			};
		}

		// Inline math $...$
		const inlineRegex = /^\$([^$\n]+)\$/;
		const inlineMatch = inlineRegex.exec(src);
		if (inlineMatch) {
			return {
				type: 'katex_inline',
				raw: inlineMatch[0],
				text: inlineMatch[1].trim()
			};
		}
	},
	renderer: {
		katex_block(token: any) {
			return `<div class="math-block">\$\$${token.text}\$\$</div>`;
		},
		katex_inline(token: any) {
			return `<span class="math-inline">\$${token.text}\$</span>`;
		}
	}
};

marked.use({ extensions: [katexExtension as any] });

export async function parseBlogPost(markdown: string): Promise<BlogPost> {
	const lines = markdown.split('\n');
	let frontmatterEnd = -1;

	// Find the end of the frontmatter
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].trim() === '---') {
			frontmatterEnd = i;
			break;
		}
	}

	if (frontmatterEnd === -1) {
		throw new Error('No frontmatter found');
	}

	// Parse YAML frontmatter
	const frontmatter = lines.slice(1, frontmatterEnd).join('\n');
	const meta = parseYaml(frontmatter);

	// Get the content
	const content = lines.slice(frontmatterEnd + 1).join('\n').trim();

	// Parse markdown to HTML
	const html = await marked(content);

	return {
		meta: meta as BlogMeta,
		content,
		html
	};
}

function parseYaml(yaml: string): Partial<BlogMeta> {
	const result: any = {};
	const lines = yaml.split('\n');

	for (const line of lines) {
		if (!line.trim() || line.startsWith('#')) continue;

		const [key, ...valueParts] = line.split(':');
		const value = valueParts.join(':').trim();

		if (!key || !value) continue;

		const trimmedKey = key.trim();

		if (trimmedKey === 'categories' || trimmedKey === 'tags') {
			// Parse array
			const arr: string[] = [];
			let currentIndex = lines.indexOf(line);
			currentIndex++;

			while (currentIndex < lines.length) {
				const nextLine = lines[currentIndex];
				if (!nextLine.trim()) break;
				if (!nextLine.startsWith('    - ')) break;

				arr.push(nextLine.trim().substring(2).trim());
				currentIndex++;
			}

			result[trimmedKey] = arr;
		} else {
			result[trimmedKey] = value;
		}
	}

	return result;
}

export async function loadAllBlogPosts(): Promise<BlogPost[]> {
	const posts: BlogPost[] = [];
	const postFiles = [
		'decimal_factorials.md',
		'freshman_supercomputing.md',
		'impermanence.md',
		'multipart_rust_server.md'
	];

	for (const file of postFiles) {
		try {
			const response = await fetch(`/blogposts/${file}`);
			const markdown = await response.text();
			const post = await parseBlogPost(markdown);
			posts.push(post);
		} catch (error) {
			console.error(`Failed to load blog post ${file}:`, error);
		}
	}

	// Sort by date descending
	posts.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());

	return posts;
}
