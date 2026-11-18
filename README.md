# Social Media Post Skill

![A social media post created from a brief using HTML and CSS, illustrated with a sample infographic](assets/readme-banner.png)

An agent skill for creating custom social media posts and infographics with editable HTML and CSS, then exporting PNG or PDF. It works from a project, supplied assets, or a standalone creative brief. The skill instructs your agent to ask about the audience, content, style, brand, platform, dimensions, and output before designing.

## What it does

- Creates single graphics or carousel slides using HTML, CSS, and optional SVG.
- Adapts layouts, typography, and infographics to your brief and brand.
- Supports platform-oriented presets or custom dimensions, PNG, PDF, or both.
- Calls for research or supplied sources for factual claims, accessible contrast and labels, and inspection of the rendered result.
- Keeps editable HTML alongside exports unless you request otherwise.

The skill is a set of instructions for an agent, not a standalone graphic-design application. Results depend on the agent's capabilities, available assets, browser, and ability to inspect output. Platform requirements change; verify current specifications for your intended placement.

## Install with npx

The [skills CLI](https://github.com/vercel-labs/skills) supports OpenCode, Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, and many others. It currently requires Node.js 22.20 or newer. `npx` may download the CLI; review its source and permissions before use.

### From this local folder

From the project where you want the skill, replace the path with the absolute or relative path to this folder:

```bash
npx skills add /path/to/social-media-post-skill --skill social-media-post
```

Choose your agents when prompted. Quote paths containing spaces. On Windows PowerShell, for example:

```powershell
npx skills add 'C:\path\to\social-media-post-skill' --skill social-media-post
```

For all projects, add `-g`. To select particular agents and skip prompts:

```bash
npx skills add /path/to/social-media-post-skill --skill social-media-post -g -a opencode -a claude-code -a codex -a cursor -a gemini-cli -a github-copilot -y
```

Alternatively use `-a '*'` to target all agents supported by the CLI. Add `--copy` if symlinks are unavailable. Global installation writes to your user-level agent directories; omit `-g` for a project-only install. You may need to restart your agent for it to discover newly installed skills. Check the [full supported agent list](https://github.com/vercel-labs/skills/blob/main/docs/agents.md) and `npx skills add --help` for current options.

### Install from GitHub

From any project, install the skill for your choice of agents:

```bash
npx skills add Optify-Studio/social-media-post-skill --skill social-media-post
```

Add `-g` to install across projects. The CLI installs the skill and bundled renderer; it does **not** install the renderer's Playwright dependency.

### Prefer a prompt instead of a command?

Paste this into your favorite coding agent:

> Install the `social-media-post` skill from https://github.com/Optify-Studio/social-media-post-skill for this project and make it available to your agent. Review its instructions first. Ask me before installing any additional dependencies or changing global configuration. Then use the skill to help me create a social media post, starting by asking about my content, platform, style, size, branding, and preferred PNG or PDF output.

The agent needs permission and tools to access GitHub and install skills. Tell it if you want a global installation instead; exact discovery and installation steps depend on the agent.

## Use

Ask your agent, for example:

> Use the social-media-post skill to create a three-slide Instagram carousel explaining composting. Ask me about style, dimensions, branding and export format before you start.

Or provide your brand assets, exact copy, chart data, sources, dimensions, and output preference up front. The agent should skip already-answered questions and may suggest defaults if you ask it to decide. It should not publish posts without your permission.

## Renderer setup and manual use

The bundled renderer needs Node.js, the `playwright` Node package resolvable from `scripts/render.cjs`, and Playwright's Chromium browser. If you already have a suitable renderer, the agent may use that instead. One optional global setup is:

```bash
npm install -g playwright
playwright install chromium
```

Node does not automatically resolve global modules. Set `NODE_PATH` in the shell that launches your agent or runs the renderer:

```bash
# macOS / Linux
export NODE_PATH="$(npm root -g)"
```

```powershell
# Windows PowerShell
$env:NODE_PATH = (npm root -g)
```

Alternatively install Playwright where Node can resolve it from the installed skill directory. Installing packages globally changes your environment; use your preferred isolated setup if that is not desirable.

```bash
node /path/to/installed/social-media-post/scripts/render.cjs --input post.html --output post.png --width 1080 --height 1350
node /path/to/installed/social-media-post/scripts/render.cjs --input post.html --output post.pdf --width 1080 --height 1350
```

The input must be a local HTML file with a fixed-size canvas. PNGs have exactly the requested pixel dimensions; PDF dimensions are based on CSS pixels (96 pixels per inch). Use `--transparent` for PNG transparency, and provide a transparent HTML background. The renderer refuses to overwrite existing files and does not create output directories. One invocation handles one HTML file; multi-page PDF assembly is a separate agent workflow. Do not render untrusted HTML: Chromium executes page scripts and can access resources available to the local browser.

## Test

With Playwright and Chromium configured as above:

```bash
node tests/smoke.cjs
```

The smoke test creates a sample PNG and PDF in a temporary directory, verifies file signatures and PNG dimensions, and checks invalid dimensions, existing-output protection, and PDF transparency rejection. It prints the directory so you can inspect the results. This is not a full automated visual, PDF pagination, accessibility, platform-compliance, or agent-conversation test.

## Files

```text
SKILL.md             Agent instructions and workflow
assets/              README banner and its editable HTML source
scripts/render.cjs   Playwright-based PNG/PDF renderer
tests/fixture.html   Sample infographic for smoke testing
tests/smoke.cjs      Renderer smoke tests
```
