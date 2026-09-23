export const diagrams = [

  {
    id: 'mermaid-flowchart-basics',
    title: 'Mermaid Flowchart Basics',
    description: 'Create flowcharts with Mermaid syntax for architecture docs',
    category: 'diagrams',
    tools: ['claude', 'cursor'],
    difficulty: 'beginner',
    content: `## What is Mermaid?

Mermaid is a text-based diagramming language that renders in GitHub, GitLab, Notion, and many editors. Write text, get diagrams.

## Basic flowchart

\`\`\`
flowchart TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`

## Node shapes

\`\`\`
A[Rectangle]
B(Rounded)
C([Stadium])
D{Diamond}
E[(Database)]
F((Circle))
\`\`\`

## Direction options

- \`TD\` or \`TB\` -- top to bottom
- \`LR\` -- left to right
- \`BT\` -- bottom to top
- \`RL\` -- right to left

## Subgraphs for grouping

\`\`\`
flowchart LR
    subgraph Frontend
        A[React App] --> B[Components]
    end
    subgraph Backend
        C[API Server] --> D[(Database)]
    end
    B --> C
\`\`\`

## Common gotchas

- Do not use spaces in node IDs (\`UserService\`, not \`User Service\`)
- Wrap edge labels with special chars in quotes: \`A -->|"O(n)"| B\`
- Avoid \`end\` as a node ID (reserved keyword)`,
  },

  {
    id: 'generate-architecture-svg',
    title: 'Generate Architecture SVGs',
    description: 'Use mmdc CLI to convert Mermaid source into SVG files for docs',
    category: 'diagrams',
    tools: ['claude', 'cursor'],
    difficulty: 'intermediate',
    content: `## Why SVGs?

Mermaid renders in GitHub markdown, but SVGs give you:
- Consistent rendering everywhere
- Version-controlled visual diffs
- Embeddable in any documentation

## Install mermaid-cli

\`\`\`bash
npm install -g @mermaid-js/mermaid-cli
\`\`\`

## Create a .mmd source file

Save your diagram as \`docs/architecture.mmd\`:

\`\`\`
flowchart TB
    User([User]) --> HTML["index.html"]
    HTML --> App["app.js"]
    App --> State["state.js"]
    App --> Render["render.js"]
\`\`\`

## Generate the SVG

\`\`\`bash
npx mmdc -i docs/architecture.mmd -o docs/architecture.svg --backgroundColor white
\`\`\`

## Embed in README

\`\`\`markdown
## Architecture

![Architecture](docs/architecture.svg)
\`\`\`

## Automation tip

Add a Makefile target:

\`\`\`makefile
docs/architecture.svg: docs/architecture.mmd
	npx mmdc -i $< -o $@ --backgroundColor white
\`\`\``,
  },

  {
    id: 'c4-diagrams-mermaid',
    title: 'C4 Diagrams in Mermaid',
    description: 'Model system architecture with C4 context, container, and component diagrams',
    category: 'diagrams',
    tools: ['claude', 'cursor'],
    difficulty: 'advanced',
    content: `## C4 model overview

C4 describes software architecture at four levels of zoom:

1. **Context** -- system + external actors
2. **Container** -- deployable units (apps, databases, queues)
3. **Component** -- internal modules within a container
4. **Code** -- class/function level (rarely diagrammed)

## C4 Context in Mermaid

\`\`\`
C4Context
    title System Context

    Person(user, "Developer", "Uses the tool")
    System(app, "Agent Lore", "AI tutorial hub")
    System_Ext(github, "GitHub Pages", "Static hosting")

    Rel(user, app, "Browses tutorials")
    Rel(app, github, "Deployed to")
\`\`\`

## C4 Container diagram

\`\`\`
C4Container
    title Container Diagram

    Person(user, "Developer")

    Container_Boundary(web, "Web App") {
        Container(html, "index.html", "HTML", "App shell")
        Container(js, "ES Modules", "JavaScript", "App logic")
        Container(css, "style.css", "CSS", "Styling")
    }

    ContainerDb(storage, "localStorage", "Browser", "Filter state")

    Rel(user, html, "Loads")
    Rel(html, js, "Imports")
    Rel(js, storage, "Reads/writes")
\`\`\`

## Tips

- Start with Context (zoom out), then drill into Containers
- Use \`System_Ext\` for third-party services
- Keep each diagram focused on one level
- GitHub renders C4 Mermaid natively since 2024`,
  },

];
