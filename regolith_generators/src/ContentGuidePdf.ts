import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, extname, resolve } from "node:path";
import { marked, type Token, type Tokens } from "marked";
import { decodeHTML } from "entities";
import pdfmake from "pdfmake";
import type { Content, ContentText, TDocumentDefinitions, TFontDictionary } from "pdfmake/interfaces";

const require = createRequire(import.meta.url);
const fonts: TFontDictionary = require("pdfmake/fonts/Roboto");
pdfmake.addFonts(fonts);
const fontPaths = new Set(
	Object.values(fonts)
		.flatMap((family) => Object.values(family))
		.filter((path): path is string => typeof path === "string")
		.map((path) => resolve(path)),
);
pdfmake.setLocalAccessPolicy((path) => fontPaths.has(resolve(path)));
pdfmake.setUrlAccessPolicy(() => false);

function inline(tokens: Token[]): ContentText[] {
	return tokens.flatMap((token): ContentText[] => {
		switch (token.type) {
			case "escape":
				return [{ text: decodeHTML(token.text) }];
			case "text":
				return token.tokens ? inline(token.tokens!) : [{ text: decodeHTML(token.text) }];
			case "strong":
				return [{ text: inline(token.tokens!), bold: true }];
			case "em":
				return [{ text: inline(token.tokens!), italics: true }];
			case "del":
				return [{ text: inline(token.tokens!), decoration: "lineThrough" }];
			case "codespan":
				return [{ text: token.text, background: "#eeeeee" }];
			case "br":
				return [{ text: "\n" }];
			case "link":
				return [{ text: inline(token.tokens!), link: token.href, color: "#184e77", decoration: "underline" }];
			case "html":
				if (/^<!--[\s\S]*-->$/.test(token.raw.trim())) return [];
				if (/^<br\s*\/?\s*>$/i.test(token.raw.trim())) return [{ text: "\n" }];
				throw new Error(`Unsupported HTML in content guide PDF: ${token.raw}`);
			default:
				throw new Error(`Unsupported inline Markdown in content guide PDF: ${token.type}`);
		}
	});
}

async function blocks(tokens: Token[], baseDirectory: string): Promise<Content[]> {
	const content: Content[] = [];
	for (const token of tokens) {
		switch (token.type) {
			case "space":
				break;
			case "heading":
				content.push({ text: inline(token.tokens!), style: `h${token.depth}`, headlineLevel: token.depth });
				break;
			case "paragraph":
			case "text": {
				const parts = token.tokens ?? marked.Lexer.lexInline(token.text);
				let run: Token[] = [];
				const flush = () => {
					if (run.length) content.push({ text: inline(run), margin: [0, 0, 0, 7] });
					run = [];
				};
				for (const part of parts) {
					if (part.type !== "image") {
						run.push(part);
						continue;
					}
					flush();
					const image = part as Tokens.Image;
					const path = resolve(baseDirectory, image.href);
					if (!/\.(png|jpe?g)$/i.test(path) || /^[a-z]+:/i.test(image.href)) {
						throw new Error(`PDF images must be local PNG or JPEG files: ${image.href}`);
					}
					const bytes = await readFile(path);
					content.push({
						image: `data:image/${extname(path).toLowerCase() === ".png" ? "png" : "jpeg"};base64,${bytes.toString("base64")}`,
						fit: [490, 620],
						margin: [0, 5, 0, 10],
					});
				}
				flush();
				break;
			}
			case "list": {
				const list = token as Tokens.List;
				const items = await Promise.all(
					list.items.map(async (item) => {
						const nodes = await blocks(item.tokens, baseDirectory);
						if (item.task) nodes.unshift({ text: item.checked ? "[x]" : "[ ]" });
						return { stack: nodes };
					}),
				);
				content.push(
					list.ordered
						? { ol: items, start: Number(list.start) || 1, margin: [0, 0, 0, 8] }
						: { ul: items, margin: [0, 0, 0, 8] },
				);
				break;
			}
			case "blockquote":
				content.push({
					stack: await blocks(token.tokens!, baseDirectory),
					margin: [14, 4, 0, 10],
					italics: true,
				});
				break;
			case "code":
				content.push({ text: token.text, fontSize: 9, background: "#eeeeee", margin: [0, 4, 0, 10] });
				break;
			case "hr":
				content.push({
					canvas: [{ type: "line", x1: 0, y1: 0, x2: 490, y2: 0, lineWidth: 0.5, lineColor: "#bbbbbb" }],
					margin: [0, 8, 0, 8],
				});
				break;
			case "table": {
				const table = token as Tokens.Table;
				const cell = (value: Tokens.TableCell, column: number): ContentText => ({
					text: inline(value.tokens),
					alignment: table.align[column] ?? "left",
				});
				content.push({
					table: {
						headerRows: 1,
						widths: table.header.map(() => "*"),
						body: [
							table.header.map((value, column) => ({ ...cell(value, column), bold: true })),
							...table.rows.map((row) => row.map(cell)),
						],
					},
					layout: "lightHorizontalLines",
					margin: [0, 4, 0, 10],
				});
				break;
			}
			case "html":
				if (token.raw.replace(/<!--[\s\S]*?-->/g, "").trim())
					throw new Error(`Unsupported HTML in content guide PDF: ${token.raw}`);
				break;
			default:
				throw new Error(`Unsupported Markdown in content guide PDF: ${token.type}`);
		}
	}
	return content;
}

/** Renders the filled Markdown with expanded entity ID lists, without HTML or a browser renderer. */
export async function writeContentGuidePdf(markdown: string, output: string, templatePath: string): Promise<void> {
	const expanded = markdown
		.replace(/^\s*<details(?:\s+open)?>\s*$/gm, "")
		.replace(/^\s*<summary>([^<]*)<\/summary>\s*$/gm, "**$1**\n")
		.replace(/^\s*<\/details>\s*$/gm, "");
	const tokens = marked.lexer(expanded);
	const title = tokens.find((token) => token.type === "heading" && token.depth === 1);
	const definition: TDocumentDefinitions = {
		info: { title: title?.type === "heading" ? title.text : "Content Guide" },
		pageSize: "A4",
		pageMargins: [48, 42, 48, 42],
		defaultStyle: { font: "Roboto", fontSize: 10, lineHeight: 1.15 },
		content: await blocks(tokens, dirname(templatePath)),
		styles: {
			h1: { fontSize: 23, bold: true, margin: [0, 0, 0, 16] },
			h2: { fontSize: 16, bold: true, margin: [0, 14, 0, 8] },
			h3: { fontSize: 12, bold: true, margin: [0, 10, 0, 6] },
			h4: { fontSize: 11, bold: true, margin: [0, 8, 0, 5] },
			h5: { fontSize: 10, bold: true, margin: [0, 8, 0, 5] },
			h6: { fontSize: 10, italics: true, margin: [0, 8, 0, 5] },
		},
		footer: (page, total) => ({
			text: `${page} / ${total}`,
			alignment: "center",
			fontSize: 8,
			color: "#666666",
			margin: [0, 12, 0, 0],
		}),
		pageBreakBefore: (node, container) =>
			Boolean(node.headlineLevel && container.getFollowingNodesOnPage().length === 0),
	};
	await writeFile(output, await pdfmake.createPdf(definition).getBuffer());
}
