export const CATEGORIES = {
  navigation:   'Navigation',
  layout:       'Layout',
  content:      'Content',
  forms:        'Forms',
  media:        'Media',
  feedback:     'Feedback',
};

export const COMPONENTS = {
  navbar: {
    name: 'Navigation Bar',
    also: ['Topnav', 'Header', 'Site Header', 'Global Nav'],
    desc: 'Horizontal bar at the top of every page. Orients users, hosts the logo, navigation links, and the primary CTA.',
    variants: ['Standard', 'Centered logo', 'Transparent overlay', 'Mega menu', 'Sticky / fixed', 'With utility bar'],
    tip: '"Add a sticky navbar: logo on the left, 4 nav links centered, and a filled CTA button on the right."',
    frameworks: ['Tailwind UI', 'Headless UI', 'Radix UI', 'Shadcn/ui', 'Material UI', 'Chakra UI'],
    category: 'navigation',
  },
  logo: {
    name: 'Logo',
    also: ['Brand Mark', 'Brand Identity'],
    desc: 'The brand identifier. Can be an icon only (logomark), text only (wordmark), or both combined.',
    variants: ['Logomark + wordmark', 'Wordmark only', 'Icon only', 'Stacked', 'Horizontal'],
    tip: '"Place a horizontal logo (icon + brand name bold) top-left in the navbar, linking to the homepage."',
    category: 'navigation',
  },
  logomark: {
    name: 'Logomark',
    also: ['Brand Icon', 'Symbol', 'App Icon'],
    desc: 'The icon or graphic portion of a logo, used independently when the brand is already recognizable.',
    variants: ['Full color', 'Monochrome', 'Inverted', 'Square container', 'Circle container'],
    tip: '"Use a 32px logomark in the navbar. On mobile, hide the wordmark and keep only the logomark."',
    category: 'navigation',
  },
  wordmark: {
    name: 'Wordmark',
    also: ['Logotype', 'Brand Name Text'],
    desc: 'The text portion of a logo — the brand name in a specific typeface. Stands alone or pairs with the logomark.',
    variants: ['Regular weight', 'Bold', 'Custom lettering', 'Serif', 'All-caps'],
    tip: '"Add a semibold wordmark at 18–22px next to the logomark. Keep it in the brand primary color or white."',
    category: 'navigation',
  },
  'nav-link': {
    name: 'Navigation Link',
    also: ['Nav Item', 'Menu Item', 'Nav Tab'],
    desc: 'A clickable text link in the navbar routing users to a main section or page of the site.',
    variants: ['Plain text', 'With dropdown arrow', 'With icon', 'Active/current state', 'Underline indicator'],
    tip: '"Add 4 nav links: Features, Pricing, Docs, Blog. Show a bottom underline on the active page."',
    category: 'navigation',
  },
  hamburger: {
    name: 'Hamburger Menu',
    also: ['Mobile Menu Button', 'Nav Toggle', 'Three-line Menu'],
    desc: 'A button with three horizontal lines that shows/hides navigation on small screens. Hidden on desktop.',
    variants: ['3 lines', '3 dots (kebab)', 'Animated to X on open', 'With "Menu" label'],
    tip: '"Hide nav links on mobile and show a hamburger on the right. Clicking opens a full-height overlay menu."',
    category: 'navigation',
  },
  breadcrumb: {
    name: 'Breadcrumb',
    also: ['Breadcrumb Trail', 'Path Navigation'],
    desc: 'Secondary navigation showing the current location within the site hierarchy as a clickable trail.',
    variants: ['Slash separator', 'Arrow separator', 'With home icon', 'Schema.org structured data'],
    tip: '"Add a breadcrumb below the navbar: Home › Blog › Article Title. Make each ancestor a clickable link."',
    category: 'navigation',
  },
  footer: {
    name: 'Footer',
    also: ['Site Footer', 'Page Footer', 'Global Footer'],
    desc: 'The bottom section of every page. Contains secondary nav, legal links, social icons, and brand info.',
    variants: ['Minimal (copyright only)', 'Multi-column links', 'With newsletter signup', 'Dark / branded', 'Mega footer'],
    tip: '"Add a dark multi-column footer: logo + tagline left, 3 nav columns center, social icons and copyright bottom."',
    category: 'navigation',
  },
  'social-icons': {
    name: 'Social Icons',
    also: ['Social Links', 'Social Media Icons'],
    desc: 'A row of icon buttons linking to the brand\'s social media profiles. Usually in the footer or author bio.',
    variants: ['Icon only', 'Icon + label', 'Filled circles', 'Outlined', 'Monochrome grayscale'],
    tip: '"Add 4 social icon buttons: GitHub, Twitter/X, LinkedIn, YouTube. 24px icons, subtle hover opacity change."',
    category: 'navigation',
  },
  'sidebar-nav': {
    name: 'Sidebar Navigation',
    also: ['Side Nav', 'Vertical Nav', 'Left Nav', 'Dashboard Nav'],
    desc: 'Vertical navigation panel on the left side. Common in dashboards, admin panels, and docs sites.',
    variants: ['Full height', 'Collapsible (icon-only mode)', 'With sections/groups', 'With badge counts', 'With user profile at bottom'],
    tip: '"Add a 240px sidebar nav: grouped items with icons, active state highlighted, user profile pinned at the bottom."',
    category: 'navigation',
  },
  pagination: {
    name: 'Pagination',
    also: ['Page Numbers', 'Pager'],
    desc: 'Controls for navigating between pages of a content list or grid. Shows the current page and adjacent links.',
    variants: ['Numbered pages', 'Prev / Next only', 'With ellipsis', 'Load more button', 'Infinite scroll'],
    tip: '"Add centered pagination below the article grid: ← Prev, up to 7 page numbers with ellipsis, Next →."',
    category: 'navigation',
  },
  'tab-bar': {
    name: 'Tab Bar',
    also: ['Tabs', 'Tab Navigation', 'Tab Group'],
    desc: 'Horizontal row of tabs that switch between views within the same page. The active tab is visually distinguished.',
    variants: ['Underline style', 'Pill / filled style', 'Boxed', 'With icons', 'Vertical tabs', 'Scrollable on mobile'],
    tip: '"Add tabs below the page header: underline style, active tab in brand color with a 2px bottom border."',
    frameworks: ['Radix UI', 'Headless UI', 'React Aria', 'Shadcn/ui', 'Material UI', 'Chakra UI'],
    category: 'navigation',
  },
  'hero-section': {
    name: 'Hero Section',
    also: ['Above the Fold', 'Banner', 'Jumbotron'],
    desc: 'The first full-width section users see. Introduces the product, communicates value, and drives the primary conversion.',
    variants: ['Centered text', 'Split (text + image)', 'Full-bleed image', 'Video background', 'Animated illustration'],
    tip: '"Create a split-layout hero: value proposition headline left, product screenshot right. Subtle gradient background."',
    category: 'layout',
  },
  'section-header': {
    name: 'Section Header',
    also: ['Section Title', 'Block Header', 'Content Heading'],
    desc: 'A title and optional subtitle that introduce a content section. Usually centered, with a badge eyebrow above.',
    variants: ['Centered', 'Left-aligned', 'With badge eyebrow', 'With decorative line', 'Extra large'],
    tip: '"Use a centered section header: small badge eyebrow, large H2 title, 1–2 sentence description below in muted color."',
    category: 'layout',
  },
  card: {
    name: 'Card',
    also: ['Content Card', 'Tile', 'Panel'],
    desc: 'A self-contained UI container grouping related content. The fundamental building block for lists, grids, and dashboards.',
    variants: ['Default', 'Bordered', 'Elevated with shadow', 'Flat', 'Interactive / hoverable', 'Horizontal layout'],
    tip: '"Add a grid of cards: white background, 1px border, 8px radius, 24px padding, subtle box-shadow on hover."',
    category: 'layout',
  },
  divider: {
    name: 'Divider',
    also: ['Separator', 'Rule', 'Section Divider', 'HR'],
    desc: 'A horizontal line or visual break that separates sections of content or groups of elements.',
    variants: ['Plain line', 'With center text ("or")', 'With icon', 'Dashed', 'Thick / prominent'],
    tip: '"Add a divider with \'or\' text between social login buttons and the email form. Center text over a 1px line."',
    category: 'layout',
  },
  headline: {
    name: 'Headline',
    also: ['H1', 'Page Title', 'Hero Title', 'Main Heading'],
    desc: 'The largest text on the page. Communicates the core value proposition in 6–12 words. Usually the only H1.',
    variants: ['Single line', 'Two lines', 'Gradient text fill', 'With highlighted word', 'Animated word swap'],
    tip: '"Write a 2-line headline: bold first line states the benefit, second adds the differentiator. Use 48–64px, bold weight."',
    category: 'content',
  },
  subheadline: {
    name: 'Subheadline',
    also: ['Subtitle', 'Hero Description', 'Lead Text', 'Tagline'],
    desc: 'Supporting text below the headline. Expands on the value proposition in 1–3 sentences. Lighter weight, muted color.',
    variants: ['One sentence', 'Two sentences', 'Italic', 'Max-width constrained for readability'],
    tip: '"Add a 2-sentence subheadline: first explains what, second adds the key benefit. 16–20px, muted color."',
    category: 'content',
  },
  'cta-button': {
    name: 'CTA Button',
    also: ['Call-to-Action Button', 'Primary Button', 'Action Button'],
    desc: 'The main action button. High contrast, visually prominent, with a clear and specific action label.',
    variants: ['Filled / solid', 'Large hero size', 'With arrow icon', 'With loading spinner', 'Gradient fill'],
    tip: '"Add a large primary CTA: filled, high-contrast color, 44–48px height, label like \'Get started free →\'."',
    frameworks: ['Tailwind CSS', 'Shadcn/ui', 'Material UI', 'Chakra UI', 'Ant Design', 'Mantine'],
    category: 'content',
  },
  'ghost-button': {
    name: 'Ghost Button',
    also: ['Outlined Button', 'Secondary Button', 'Stroke Button'],
    desc: 'A button with transparent fill and visible border. Used as a secondary action alongside a primary CTA.',
    variants: ['With border', 'Text-only (no border)', 'With icon', 'Same height as primary', 'Smaller'],
    tip: '"Pair a ghost button with the primary CTA: same height, transparent fill, 1px border. Label: \'See how it works\'."',
    category: 'content',
  },
  badge: {
    name: 'Badge',
    also: ['Label', 'Tag', 'Pill', 'Chip', 'Eyebrow Text'],
    desc: 'A small visual label highlighting a status, category, or promotion. Often above a headline to set context.',
    variants: ['Filled', 'Outlined', 'With dot indicator', 'With icon', 'Animated "new" state'],
    tip: '"Add a badge above the hero headline: small rounded pill, accent color, with a small emoji. Text like \'✦ New in 2025\'."',
    category: 'content',
  },
  'testimonial-card': {
    name: 'Testimonial Card',
    also: ['Review Card', 'Quote Card', 'Social Proof Card'],
    desc: 'A card displaying a customer quote, author name, company, and optional star rating. Builds trust.',
    variants: ['Quote + avatar', 'With star rating', 'Compact tweet-style', 'Large pull quote', 'Video thumbnail'],
    tip: '"Create a testimonial card: large open-quote mark, 2–3 sentence quote, then avatar + bold name + company below."',
    category: 'content',
  },
  'pricing-card': {
    name: 'Pricing Card',
    also: ['Plan Card', 'Pricing Tier', 'Subscription Card'],
    desc: 'A card showing a subscription plan: name, price, feature list, and a CTA. In a 2–4 column grid.',
    variants: ['Simple 3-tier', 'With "Most popular" badge', 'Monthly/annual toggle', 'With comparison table'],
    tip: '"Add 3 pricing cards: Free, Pro, Enterprise. Highlight the middle tier with a colored border and \'Most popular\' badge."',
    category: 'content',
  },
  'stat-block': {
    name: 'Stat Block',
    also: ['Metric Block', 'Key Number', 'Social Proof Stat'],
    desc: 'A bold number with a short label showcasing a key metric like active users, uptime, or integrations.',
    variants: ['Plain number + label', 'With icon', 'With trend indicator', 'Animated counter', 'Row of 4'],
    tip: '"Add a row of 4 stat blocks: large bold number, small descriptor label below. Use formats: 10K+, 99.9%, 150+."',
    category: 'content',
  },
  'team-card': {
    name: 'Team Member Card',
    also: ['Person Card', 'Profile Card', 'Bio Card'],
    desc: 'A card showcasing a team member: photo, name, title, optional bio, and social links.',
    variants: ['Photo + name + role', 'With bio text', 'With social links', 'Circular photo', 'Hover to reveal bio'],
    tip: '"Add a team grid with 4 cards per row: circular photo, bold name, role title in muted text, 3 social icon links."',
    category: 'content',
  },
  accordion: {
    name: 'Accordion',
    also: ['FAQ', 'Collapsible', 'Expandable Row', 'Disclosure'],
    desc: 'An interactive element that expands and collapses to reveal content. Used for FAQ sections.',
    variants: ['Single open at a time', 'Multiple open', 'With +/− icon', 'With chevron', 'Borderless / minimal'],
    tip: '"Add an FAQ accordion: each item has a question row that expands to show the answer. Chevron rotates 180° on open."',
    frameworks: ['Radix UI', 'Headless UI', 'React Aria', 'Shadcn/ui', 'Material UI', 'Chakra UI'],
    category: 'content',
  },
  'feature-card': {
    name: 'Feature Card',
    also: ['Feature Block', 'Value Prop Card', 'Feature Item'],
    desc: 'A card presenting one product feature with an icon, short title, and 1–2 sentence description.',
    variants: ['Icon on top', 'Horizontal (icon + text side by side)', 'With screenshot', 'With number', 'Bordered vs. flat'],
    tip: '"Create a 3-column feature grid. Each card: icon on top, bold title, 2-line description. Subtle border and hover lift."',
    category: 'content',
  },
  'article-card': {
    name: 'Article Card',
    also: ['Blog Card', 'Post Card', 'Content Preview Card'],
    desc: 'A card representing a blog post. Shows thumbnail, category, title, excerpt, author, and date.',
    variants: ['Vertical (image top)', 'Horizontal (image left)', 'Minimal (no image)', 'Featured (large)'],
    tip: '"Add article cards (3 columns): 16:9 thumbnail, category badge, H3 title, 2-line excerpt, author avatar + name + date."',
    category: 'content',
  },
  'project-card': {
    name: 'Project Card',
    also: ['Work Card', 'Portfolio Card', 'Case Study Card'],
    desc: 'A card showcasing a project with a preview image, title, tech stack tags, and links.',
    variants: ['With thumbnail', 'Hover overlay with links', 'With tech stack tags', 'Case study style'],
    tip: '"Add project cards in a 2-column grid: screenshot thumbnail, project name, 3 tech stack tag pills, links."',
    category: 'content',
  },
  'skill-tags': {
    name: 'Skill Tags',
    also: ['Tech Stack Tags', 'Technology Pills', 'Tag Cloud'],
    desc: 'A cluster of pill-shaped labels listing skills, technologies, or keywords. Grouped by category.',
    variants: ['Plain pills', 'Colored by category', 'With icons', 'With proficiency indicator', 'Grouped sections'],
    tip: '"Add a skill section: group by category (Languages, Frameworks, Tools). 28–32px pill height, 8px gap, muted border."',
    category: 'content',
  },
  timeline: {
    name: 'Timeline',
    also: ['Vertical Timeline', 'Experience Log', 'History'],
    desc: 'A vertical list of events or milestones ordered chronologically. Common in portfolio experience sections.',
    variants: ['Left-aligned', 'Alternating sides', 'Dot markers', 'Numbered', 'With company logos'],
    tip: '"Add a vertical timeline for work experience: company + role as H3, date range right-aligned, 2–3 bullet points each."',
    category: 'content',
  },
  'article-featured': {
    name: 'Featured Article',
    also: ['Hero Post', 'Lead Article', 'Featured Story'],
    desc: 'A larger, visually prominent card at the top of a blog. Bigger thumbnail, more prominent title and excerpt.',
    variants: ['Full-width image', 'Split layout (text + image)', 'With overlay text', 'With category + author + date'],
    tip: '"Add a featured post: 60% content + 40% thumbnail, H2 title, 2-line excerpt, author avatar + name + date."',
    category: 'content',
  },
  alert: {
    name: 'Alert',
    also: ['Notification Banner', 'Message Banner', 'Info Box', 'Flash Message'],
    desc: 'A full-width or inline message that draws attention to important information, warnings, errors, or success states.',
    variants: ['Success (green)', 'Error (red)', 'Warning (yellow)', 'Info (blue)', 'With dismiss button', 'With title + desc'],
    tip: '"Add a success alert: green left border, checkmark icon, short message, and an X dismiss button. Auto-dismiss after 4s."',
    category: 'feedback',
  },
  'data-table': {
    name: 'Data Table',
    also: ['Table', 'Grid', 'List View'],
    desc: 'A structured display of tabular data with rows, columns, headers, and optional sorting, filtering, and row actions.',
    variants: ['Basic', 'With sortable columns', 'With row actions', 'Striped rows', 'Compact / dense', 'With pagination footer'],
    tip: '"Add a data table: sticky header, alternating row colors, right-align numeric columns, icon-only action buttons per row."',
    frameworks: ['TanStack Table', 'AG Grid', 'Material React Table', 'Ant Design Table', 'Mantine DataTable'],
    category: 'feedback',
  },
  avatar: {
    name: 'Avatar',
    also: ['Profile Picture', 'User Photo', 'Profile Image'],
    desc: 'A circular or rounded image representing a person. Used in testimonials, comment threads, author bios, and team sections.',
    variants: ['Circle', 'Square rounded', 'With status dot', 'Initials fallback', 'Stacked group'],
    tip: '"Use a 40–48px circular avatar next to testimonial text. Add a 2px white ring and a 1px brand color border."',
    category: 'media',
  },
  'hero-image': {
    name: 'Hero Image',
    also: ['Hero Visual', 'Product Screenshot', 'Hero Illustration'],
    desc: 'The main visual in the hero section. Can be a product screenshot, illustration, photo, or abstract graphic.',
    variants: ['Product screenshot with browser chrome', 'Illustration', 'Photo', 'Abstract gradient', 'Floating UI chips'],
    tip: '"Place a product screenshot with subtle drop shadow in the hero. Slight tilt and floating UI chips for a 3D feel."',
    category: 'media',
  },
  'logo-bar': {
    name: 'Logo Bar',
    also: ['Social Proof Bar', 'Brand Logos', 'Customer Logos', 'Trust Strip'],
    desc: 'A horizontal row of company logos showing notable customers or integrations. Builds trust below the hero.',
    variants: ['Grayscale logos', 'Full-color logos', 'With "Trusted by" label', 'Scrolling marquee', 'Grid layout'],
    tip: '"Add a logo bar just below the hero: \'Trusted by teams at\' label, then 5–6 grayscale company logos spread evenly."',
    category: 'media',
  },
  thumbnail: {
    name: 'Thumbnail',
    also: ['Preview Image', 'Article Image', 'Card Image'],
    desc: 'A small preview image used in cards, lists, and grids to represent an article, product, or project.',
    variants: ['16:9 ratio', '4:3 ratio', 'Square (1:1)', 'With category badge overlay', 'With play button (video)'],
    tip: '"Add a 16:9 thumbnail at the top of each article card. Use object-fit: cover so it fills without distortion."',
    category: 'media',
  },
  form: {
    name: 'Form',
    also: ['Input Form', 'Data Entry Form', 'Contact Form'],
    desc: 'A structured group of input fields for collecting user data. Needs clear labels, validation, and a submit button.',
    variants: ['Contact form', 'Sign-up / registration', 'Login', 'Multi-step wizard', 'Inline single-field'],
    tip: '"Add a contact form: name, email, subject, message textarea, and a submit button. 16px vertical gap between fields."',
    category: 'forms',
  },
  'input-field': {
    name: 'Input Field',
    also: ['Text Input', 'Text Box', 'Form Field'],
    desc: 'A single-line text field for collecting short user input like a name, email, or search query.',
    variants: ['Default', 'With label above', 'With placeholder', 'With prefix/suffix icon', 'With validation error state'],
    tip: '"Add a labeled text input: label above, 40–44px height, 1px border, 6px radius. Red border + error message on invalid."',
    frameworks: ['Tailwind CSS', 'Shadcn/ui', 'React Hook Form', 'Formik', 'Material UI', 'Chakra UI'],
    category: 'forms',
  },
  textarea: {
    name: 'Textarea',
    also: ['Multi-line Input', 'Text Area', 'Comment Box'],
    desc: 'A multi-line text field for longer input like messages, bios, or descriptions.',
    variants: ['Fixed height', 'Auto-grow with content', 'With character counter', 'Resizable handle'],
    tip: '"Add a message textarea: min-height 100–120px, same border style as text inputs. Character counter bottom-right."',
    category: 'forms',
  },
  'search-bar': {
    name: 'Search Bar',
    also: ['Search Input', 'Search Box', 'Search Field'],
    desc: 'A prominently styled input for searching content. Usually includes a magnifier icon and optional clear button.',
    variants: ['Inline in navbar', 'Full-width below nav', 'With autocomplete dropdown', 'With filter chips', 'Expandable'],
    tip: '"Add a search bar in the navbar: expandable, magnifier icon on the left. On mobile, show icon-only that expands on tap."',
    category: 'forms',
  },
  'select-field': {
    name: 'Select / Dropdown',
    also: ['Dropdown', 'Select Input', 'Combobox'],
    desc: 'A form control for selecting one option from a predefined list. Shows a native or custom-styled dropdown.',
    variants: ['Native select', 'Custom styled', 'Searchable (combobox)', 'Multi-select', 'With option groups'],
    tip: '"Use a select for 5+ options. For 2–4 options, prefer radio buttons. For many options with search, use a combobox."',
    category: 'forms',
  },
  'toggle-switch': {
    name: 'Toggle Switch',
    also: ['Switch', 'Toggle', 'On/Off Switch'],
    desc: 'A binary control that switches between on and off states. Cleaner than a checkbox for settings and preferences.',
    variants: ['Default size', 'Small', 'Large', 'With label left', 'With label right', 'Disabled state'],
    tip: '"Use a toggle switch for settings (not checkboxes). Label on the right, 36px width, green when active, gray when off."',
    category: 'forms',
  },
  checkbox: {
    name: 'Checkbox',
    also: ['Checkbox Input', 'Multi-select Control'],
    desc: 'A binary input allowing users to select or deselect an option independently. Use for multi-select or agreement prompts.',
    variants: ['Default', 'Checked', 'Indeterminate', 'With label', 'Card checkbox', 'Disabled'],
    tip: '"Add checkboxes for multi-select lists. Label always on the right, 16px size, brand color when checked."',
    category: 'forms',
  },
  'mega-menu': {
    name: 'Mega Menu',
    also: ['Mega Dropdown', 'Full-width Menu', 'Navigation Panel'],
    desc: 'A large dropdown panel triggered by a nav link, showing multiple columns of links, images, or featured content.',
    variants: ['Multi-column links', 'With featured image', 'With categories and icons', 'Tabbed sections', 'Full-width'],
    tip: '"Add a mega menu under Products: 3 columns of links with section headers, a featured product card on the right."',
    frameworks: ['Headless UI', 'Radix UI', 'React Aria', 'Tailwind UI'],
    category: 'navigation',
  },
  'bento-grid': {
    name: 'Bento Grid',
    also: ['Feature Grid', 'Mixed Grid', 'Asymmetric Grid', 'Dashboard Grid'],
    desc: 'A grid layout with cards of varying sizes — some span 2 columns or 2 rows — creating a visually dynamic feature showcase.',
    variants: ['2×2 with 1 large card', '3-column mixed', 'Masonry-style', 'With images', 'Interactive cards'],
    tip: '"Create a bento grid: one large card spanning 2 columns, 2 small cards beside it, then 3 equal cards below."',
    category: 'layout',
  },
  'browser-chrome': {
    name: 'Browser Chrome',
    also: ['Browser Frame', 'Browser Mockup', 'Window Frame'],
    desc: 'A decorative browser window frame showing traffic light dots and a URL bar, wrapping a product screenshot.',
    variants: ['macOS style', 'Windows style', 'With URL bar', 'Minimal (dots only)', 'Dark theme'],
    tip: '"Wrap the product screenshot in browser chrome: 3 traffic light dots, URL bar showing yourapp.com, then the screenshot."',
    category: 'media',
  },
  'phone-mockup': {
    name: 'Phone Mockup',
    also: ['Mobile Frame', 'Device Mockup', 'iPhone Frame'],
    desc: 'A phone-shaped frame showcasing a mobile app screenshot. Common in fintech, health, and mobile-first product pages.',
    variants: ['iPhone style', 'Android style', 'Flat/minimal', 'Tilted perspective', 'With notch'],
    tip: '"Show the mobile app in a phone mockup: rounded corners, notch at top, app screenshot inside, subtle shadow."',
    category: 'media',
  },
  'comparison-table': {
    name: 'Comparison Table',
    also: ['Feature Matrix', 'Comparison Grid', 'Spec Table'],
    desc: 'A table comparing features, plans, or products side by side with check marks, values, or ratings.',
    variants: ['Plans comparison', 'Product specs', 'With checkmarks', 'Highlighted column', 'Expandable rows'],
    tip: '"Add a comparison table: features as rows, plans as columns. Use checkmarks for included, dashes for excluded."',
    category: 'content',
  },
  carousel: {
    name: 'Carousel',
    also: ['Slider', 'Slideshow', 'Horizontal Scroll'],
    desc: 'A horizontally scrollable row of cards or slides with navigation arrows or dots. Shows one or more items at a time.',
    variants: ['Single slide', 'Multi-item visible', 'Auto-play', 'With dots', 'With arrows', 'Infinite loop'],
    tip: '"Add a carousel showing 3 cards at a time with left/right arrows. On mobile, show 1 card with swipe navigation."',
    frameworks: ['Swiper', 'Embla Carousel', 'Splide', 'React Slick'],
    category: 'layout',
  },
  'search-hero': {
    name: 'Search Hero',
    also: ['Search-first Hero', 'Search Landing', 'Discovery Hero'],
    desc: 'A hero section dominated by a large search input, common on marketplace and directory sites like Zocdoc, Airbnb, Indeed.',
    variants: ['Simple search', 'With filters', 'With category pills', 'With location input', 'With autocomplete'],
    tip: '"Make the hero search-first: large search input centered, category filter pills below, no hero image needed."',
    category: 'layout',
  },
  'map-placeholder': {
    name: 'Map',
    also: ['Map Embed', 'Location Map', 'Google Map', 'Store Locator'],
    desc: 'An embedded map showing a business location, coverage area, or store finder. Usually a third-party embed.',
    variants: ['Single pin', 'Multiple locations', 'With search', 'Interactive zoom', 'Static image'],
    tip: '"Add a map section showing office location with a pin marker. Use Google Maps embed or Mapbox for interactive maps."',
    frameworks: ['Google Maps', 'Mapbox', 'Leaflet', 'React Map GL'],
    category: 'media',
  },
  'video-background': {
    name: 'Video Background',
    also: ['Video Hero', 'Background Video', 'Hero Video'],
    desc: 'A looping video or video play button used as the hero background. Creates immersive first impressions.',
    variants: ['Autoplay muted loop', 'Play button overlay', 'With gradient overlay', 'YouTube/Vimeo embed'],
    tip: '"Add a dark hero with video play button: circular play icon centered over a dimmed background image."',
    category: 'media',
  },
  'command-palette': {
    name: 'Command Palette',
    also: ['Terminal Block', 'Code Snippet', 'Install Command', 'CLI Block'],
    desc: 'A styled terminal/code block showing an install command or code snippet. Common on developer-focused pages.',
    variants: ['Single command', 'Multi-line', 'With copy button', 'With tabs (npm/yarn/pnpm)', 'Dark theme'],
    tip: '"Add a terminal-style install block: dark background, monospace font, copy button on the right."',
    category: 'content',
  },
  'changelog-entry': {
    name: 'Changelog Entry',
    also: ['Release Note', 'Version History', 'Update Log'],
    desc: 'A list item showing a software release with version number, date, and description of changes.',
    variants: ['Simple list', 'With version badge', 'Grouped by date', 'With breaking change indicator', 'Timeline style'],
    tip: '"Show a changelog: version badge (v2.1.0), date, and bullet list of changes. Tag entries as feature/fix/breaking."',
    category: 'content',
  },
  'news-ticker': {
    name: 'News Ticker',
    also: ['Announcement Bar', 'Scrolling Banner', 'Marquee', 'Social Proof Ticker'],
    desc: 'A horizontal strip showing scrolling or rotating announcements, quotes, or real-time updates.',
    variants: ['Scrolling marquee', 'Static rotating', 'With close button', 'With CTA link', 'Multi-line'],
    tip: '"Add a social proof ticker below the hero: auto-scrolling customer quotes with company logos."',
    category: 'content',
  },
  'link-button': {
    name: 'Link Button',
    also: ['Link Card', 'Link Tile', 'Bio Link', 'Linktree Button'],
    desc: 'A full-width clickable button linking to an external profile or resource. Often has a favicon or icon, label, and optional description.',
    variants: ['Text only', 'With favicon', 'With icon', 'With description', 'Rounded pill', 'Glassmorphism', 'With thumbnail'],
    tip: '"Stack full-width link buttons vertically: 48px height, rounded corners, favicon left-aligned, label centered. Add hover scale effect."',
    frameworks: ['Linktree', 'Carrd', 'Bio.link', 'Bento.me'],
    category: 'navigation',
  },
  'background-image': {
    name: 'Background Image',
    also: ['Background Photo', 'Cover Image', 'Page Background', 'Backdrop'],
    desc: 'A full-page or section-level background image, often with an overlay or blur effect to ensure text readability.',
    variants: ['Full bleed', 'With dark overlay', 'With blur (frosted glass)', 'Gradient overlay', 'Fixed/parallax', 'Video background'],
    tip: '"Set a full-page background image with a dark semi-transparent overlay (rgba(0,0,0,0.6)) and backdrop-filter: blur(8px) on the content card."',
    category: 'media',
  },
  'section-divider': {
    name: 'Section Divider',
    also: ['Content Separator', 'Link Group Label', 'Category Label'],
    desc: 'A small text label or line that visually separates groups of content within a page.',
    variants: ['Text label', 'Horizontal rule', 'Icon separator', 'Dotted line', 'With icon'],
    tip: '"Add a small uppercase label (11px, muted color, letter-spacing) between link groups to categorize them."',
    category: 'layout',
  },
  modal: {
    name: 'Modal',
    also: ['Dialog', 'Popup', 'Overlay', 'Lightbox'],
    desc: 'A floating panel that overlays the page to show details, forms, or confirmations. Blocks interaction with the page behind it.',
    variants: ['Centered card', 'Full-screen', 'Side drawer', 'Bottom sheet (mobile)', 'With backdrop blur', 'Confirmation dialog'],
    tip: '"Add a centered modal: semi-transparent backdrop, rounded card (max-width 500px), close X top-right, focus-trapped."',
    frameworks: ['Headless UI', 'Radix Dialog', 'Shadcn/ui', 'Material UI', 'Chakra UI', 'React Modal'],
    category: 'feedback',
  },
  'progress-bar': {
    name: 'Progress Bar',
    also: ['Progress Indicator', 'Loading Bar', 'Completion Bar', 'Health Bar'],
    desc: 'A horizontal bar showing completion percentage or progress through a process. Can be determinate or indeterminate.',
    variants: ['Determinate', 'Indeterminate', 'With percentage label', 'Segmented', 'Stacked / multi-color', 'Circular'],
    tip: '"Add a 4px progress bar: rounded ends, gray track, colored fill. Show percentage label above or inline."',
    category: 'feedback',
  },
};

// Which components appear in each layout (determines browser list)
export const LAYOUT_COMPONENTS = {
  landing:   ['navbar','logo','logomark','wordmark','nav-link','cta-button','ghost-button','hamburger','hero-section','badge','headline','subheadline','hero-image','logo-bar','section-header','feature-card','stat-block','testimonial-card','avatar','pricing-card','accordion','footer','social-icons'],
  corporate: ['navbar','logo','logomark','wordmark','nav-link','hamburger','mega-menu','breadcrumb','hero-section','headline','subheadline','tab-bar','feature-card','section-header','team-card','avatar','form','input-field','textarea','sidebar-nav','stat-block','map-placeholder','footer','social-icons'],
  startup:   ['navbar','logo','logomark','wordmark','nav-link','cta-button','ghost-button','hamburger','hero-section','headline','subheadline','badge','section-header','bento-grid','feature-card','command-palette','changelog-entry','logo-bar','stat-block','footer','social-icons'],
  portfolio: ['navbar','logo','wordmark','nav-link','cta-button','hero-section','badge','headline','subheadline','avatar','social-icons','skill-tags','project-card','thumbnail','timeline','footer'],
  blog:      ['navbar','logo','logomark','wordmark','nav-link','search-bar','cta-button','hamburger','breadcrumb','article-featured','badge','headline','subheadline','thumbnail','avatar','section-header','article-card','pagination','footer','social-icons'],
  components: ['navbar','logo','sidebar-nav','breadcrumb','tab-bar','cta-button','ghost-button','badge','alert','section-header','input-field','select-field','textarea','toggle-switch','checkbox','card','data-table','divider','pagination','feature-card'],
  login:     ['logo','logomark','wordmark','headline','subheadline','cta-button','ghost-button','input-field','form','divider'],
  linkinbio: ['logo','avatar','headline','subheadline','link-button','social-icons','background-image','section-divider','badge'],
  fortune:   ['navbar','logo','logomark','wordmark','nav-link','mega-menu','breadcrumb','hero-section','headline','subheadline','hero-image','video-background','cta-button','ghost-button','stat-block','tab-bar','testimonial-card','section-header','feature-card','badge','footer','social-icons'],
  ecommerce: ['navbar','logo','logomark','wordmark','nav-link','search-bar','cta-button','hamburger','breadcrumb','hero-section','badge','headline','subheadline','sidebar-nav','project-card','thumbnail','select-field','pagination','social-icons'],
  gaming:    ['navbar','logo','logomark','wordmark','nav-link','hero-section','headline','subheadline','hero-image','video-background','cta-button','badge','carousel','stat-block','feature-card','section-header','comparison-table','footer','social-icons'],
  saas:      ['navbar','logo','logomark','wordmark','nav-link','hero-section','headline','subheadline','cta-button','input-field','badge','browser-chrome','section-header','feature-card','comparison-table','logo-bar','news-ticker','pricing-card','footer','social-icons'],
  fintech:   ['navbar','logo','logomark','wordmark','nav-link','hero-section','headline','subheadline','phone-mockup','cta-button','badge','comparison-table','feature-card','section-header','stat-block','select-field','input-field','form','footer','social-icons'],
  agency:    ['navbar','logo','wordmark','hamburger','hero-section','headline','subheadline','project-card','thumbnail','team-card','avatar','section-header','badge','cta-button','footer','social-icons'],
  photography:  ['navbar','logo','wordmark','nav-link','hero-section','headline','subheadline','hero-image','project-card','thumbnail','badge','footer','social-icons'],
  magazine:     ['navbar','logo','logomark','wordmark','nav-link','search-bar','cta-button','hamburger','breadcrumb','article-featured','badge','headline','subheadline','thumbnail','avatar','section-header','article-card','sidebar-nav','pagination','footer','social-icons','form','input-field'],
  docs:         ['navbar','logo','logomark','wordmark','nav-link','search-bar','breadcrumb','sidebar-nav','section-header','headline','subheadline','tab-bar','divider','pagination','footer'],
  healthcare:   ['navbar','logo','logomark','wordmark','nav-link','hamburger','search-hero','search-bar','hero-section','headline','subheadline','carousel','team-card','avatar','badge','cta-button','logo-bar','map-placeholder','form','input-field','section-header','stat-block','footer','social-icons'],
  guild:        ['navbar','logo','logomark','wordmark','hero-section','headline','subheadline','stat-block','tab-bar','select-field','badge','card','cta-button','ghost-button','avatar','progress-bar','modal','form','textarea'],
};

export const LAYOUTS = [
  // Basic Types
  { id: 'landing',     label: 'Landing Page',      category: 'basic' },
  { id: 'corporate',   label: 'Corporate',         category: 'basic' },
  { id: 'startup',     label: 'Startup',           category: 'basic' },
  { id: 'portfolio',   label: 'Portfolio',         category: 'basic' },
  { id: 'blog',        label: 'Blog',              category: 'basic' },
  { id: 'login',       label: 'Login / Auth',      category: 'basic' },
  { id: 'linkinbio',   label: 'Link in Bio',       category: 'basic' },
  { id: 'components',  label: 'Component Library', category: 'basic' },

  // Industry Layouts (parentType links to a basic type)
  { id: 'fortune',     label: 'Fortune 500',       category: 'industry', parentType: 'landing' },
  { id: 'ecommerce',   label: 'Ecommerce Store',   category: 'industry', parentType: 'landing' },
  { id: 'gaming',      label: 'Gaming / Esports',  category: 'industry', parentType: 'landing' },
  { id: 'saas',        label: 'SaaS Platform',     category: 'industry', parentType: 'startup' },
  { id: 'fintech',     label: 'Fintech / Banking', category: 'industry', parentType: 'corporate' },
  { id: 'agency',      label: 'Agency Portfolio',  category: 'industry', parentType: 'portfolio' },
  { id: 'photography', label: 'Photography',       category: 'industry', parentType: 'portfolio' },
  { id: 'magazine',    label: 'Magazine / Media',   category: 'industry', parentType: 'blog' },
  { id: 'docs',        label: 'Documentation',     category: 'industry', parentType: 'blog' },
  { id: 'healthcare',  label: 'Healthcare',        category: 'industry', parentType: 'corporate' },
  { id: 'guild',       label: 'Guild Board',       category: 'industry', parentType: 'landing' },
];

// Common Mistakes Data for Mistakes Reference Layout
export const MISTAKES_CATEGORIES = [
  { id: 'design', label: 'Design Anti-patterns' },
  { id: 'ux', label: 'UX Pitfalls' },
  { id: 'technical', label: 'Technical Mistakes' },
  { id: 'accessibility', label: 'Accessibility Failures' },
];

export const MISTAKES_DATA = {
  design: [
    {
      id: 'carousel',
      title: 'Automatic Carousels',
      severity: 'medium',
      before: 'Hero section with auto-rotating slides every 5 seconds',
      after: 'Static hero with manual slide navigation dots',
      explanation: 'Auto-rotating carousels reduce conversions by 20-30%. Users want control over what they view.',
      fix: 'Use static hero image or manual carousel with user-controlled navigation.',
      frameworks: { 'React': 'Swiper.js with autoplay: false', 'Vanilla': 'Add click handlers for dot navigation' }
    },
    {
      id: 'hamburger-only',
      title: 'Desktop Hamburger Menu',
      severity: 'medium',
      before: 'All screen sizes use hamburger menu icon',
      after: 'Desktop shows horizontal nav, only mobile uses hamburger',
      explanation: 'Hiding navigation on desktop adds unnecessary clicks and reduces discoverability.',
      fix: 'Use media queries to show horizontal nav on ≥1024px screens.',
      frameworks: { 'CSS': '@media (min-width: 1024px) { .nav-links { display: flex } }', 'Tailwind': 'hidden lg:flex' }
    },
    {
      id: 'too-many-columns',
      title: 'Too Many Columns in Grid',
      severity: 'medium',
      before: 'Product grid with 4+ columns on desktop',
      after: 'Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop',
      explanation: 'Crowded columns reduce click-through rates and make content hard to scan.',
      fix: 'Use CSS Grid with responsive column counts: grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))',
      frameworks: { 'Tailwind': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', 'CSS': 'Auto-fit with minmax()' }
    },
    {
      id: 'hidden-pricing',
      title: 'No Pricing Page or Hidden Pricing',
      severity: 'high',
      before: 'Pricing only available after demo request',
      after: 'Clear pricing page with 3 tiers and feature comparison',
      explanation: '82% of B2B buyers want to see pricing immediately. Hidden pricing frustrates users and reduces trust.',
      fix: 'Create transparent pricing page with tiers. Add FAQ addressing pricing questions.',
      frameworks: { 'Design': '3-column pricing grid with feature lists', 'Psychology': 'Anchor with high-priced option first' }
    },
    {
      id: 'ghost-buttons',
      title: 'WOAH Too Many Ghost Buttons',
      severity: 'low',
      before: 'Multiple secondary actions all styled as ghost buttons',
      after: 'One primary button + clearly differentiated secondary options',
      explanation: 'Ghost buttons should be used sparingly for secondary actions. Overuse creates visual noise and confuses hierarchy.',
      fix: 'Limit to 1-2 ghost buttons. Use text links or icon-only buttons for other secondary actions.',
      frameworks: { 'Design': 'Visual hierarchy with three levels: filled button > outlined > text link' }
    }
  ],
  ux: [
    {
      id: 'infinite-scroll',
      title: 'No Footer with Infinite Scroll',
      severity: 'high',
      before: 'Continuous loading content, footer inaccessible',
      after: 'Load more button or pagination with accessible footer',
      explanation: 'Users expect to find footer links. Infinite scroll traps users and hides important information.',
      fix: 'Replace infinite scroll with "Load more" button or traditional pagination.',
      frameworks: { 'UX': 'Keep footer visible at all times', 'Implementation': 'IntersectionObserver for manual load more' }
    },
    {
      id: 'no-loading-feedback',
      title: 'Missing Loading States',
      severity: 'high',
      before: 'Click button → nothing happens → suddenly content appears',
      after: 'Button shows loading spinner, skeleton placeholders for content',
      explanation: 'Users think the site is broken without visual feedback. Increases perceived wait time.',
      fix: 'Show loading state within 300ms. Use skeleton screens for predictable content.',
      frameworks: { 'React': 'isLoading state + spinner component', 'Performance': 'SkeletonUI with approximate layout' }
    },
    {
      id: 'generic-errors',
      title: 'Generic Error Messages',
      severity: 'high',
      before: 'Error: Something went wrong.',
      after: 'Failed to save: File size exceeds 10MB limit. Resize and try again.',
      explanation: 'Generic errors frustrate users and increase support tickets. Specific errors help users self-serve.',
      fix: 'Write specific error messages describing what happened and how to fix it.',
      frameworks: { 'Best practice': 'Error: [what] + [why] + [how to fix]', 'Example': "Couldn't connect: Server timeout. Check your connection and retry." }
    },
    {
      id: 'link-new-tab',
      title: 'Links Opening New Tabs Without Warning',
      severity: 'low',
      before: 'External links open new tab without indicator',
      after: 'External links show ↗ icon and "(opens in new tab)" text',
      explanation: 'Unexpected new tabs disorient users and break back-button navigation.',
      fix: 'Add external link icon and optionally text indicating new tab behavior.',
      frameworks: { 'Accessibility': 'target="_blank" should include rel="noopener" and visual indicator' }
    },
    {
      id: 'mobile-tap-targets',
      title: 'Tiny Mobile Tap Targets',
      severity: 'medium',
      before: '30x30px buttons with 2px spacing on mobile',
      after: '44x44px minimum buttons with 8px spacing',
      explanation: 'Small tap targets cause frustration and accidental clicks. Apple and Google recommend 44-48px minimum.',
      fix: 'Increase touch targets to 44x44px min. Add 8px spacing between interactive elements.',
      frameworks: { 'Mobile': '@media (pointer: coarse) for touch-optimized styles', 'Testing': 'Use browser devtools touch emulation' }
    }
  ],
  technical: [
    {
      id: 'no-csp',
      title: 'Missing Content Security Policy',
      severity: 'critical',
      before: 'No CSP headers - vulnerable to XSS attacks',
      after: 'Configured CSP allowing only trusted domains',
      explanation: 'Without CSP, site is vulnerable to cross-site scripting and data injection attacks.',
      fix: 'Implement CSP header. Start strict with default-src self, then add exceptions as needed.',
      frameworks: { 'Security': 'Content-Security-Policy: default-src \'self\'; script-src \'self\' \'unsafe-inline\'', 'Tool': 'Use CSP evaluator to test your policy' }
    },
    {
      id: 'x-powered-by',
      title: 'Exposing Tech Stack',
      severity: 'medium',
      before: 'X-Powered-By: Express 4.17.1, Server: nginx/1.18.0',
      after: 'Sensitive headers removed',
      explanation: 'Exposing server technology makes targeted attacks easier for hackers.',
      fix: 'Remove X-Powered-By and Server headers at web server or application level.',
      frameworks: { 'Express': 'app.disable("x-powered-by")', 'Nginx': 'server_tokens off' }
    },
    {
      id: 'console-errors',
      title: 'JavaScript Errors in Console',
      severity: 'high',
      before: '4 JavaScript errors showing in console',
      after: 'Clean console with no errors or warnings',
      explanation: 'Console errors often indicate broken functionality that users may encounter.',
      fix: 'Monitor console in production. Fix all errors, warnings acceptable but should be minimal.',
      frameworks: { 'Sentry': 'Track errors in production automatically', 'Testing': 'Test critical user flows end-to-end' }
    },
    {
      id: 'cache-headers',
      title: 'Missing Cache Headers',
      severity: 'medium',
      before: 'All requests return 200 OK, no caching',
      after: 'Static assets cached 1yr, API responses cached 5min',
      explanation: 'Poor caching slows down repeat visits and increases server costs unnecessarily.',
      fix: 'Set proper Cache-Control headers for different asset types.',
      frameworks: { 'Static': 'immutable, max-age=31536000', 'API': 'no-cache for sensitive data, 5min for public' }
    },
    {
      id: 'no-backup',
      title: 'No Backup Strategy',
      severity: 'critical',
      before: 'Site and database never backed up',
      after: 'Daily automated backups stored off-site',
      explanation: 'Hardware failure, hacking, or human error could permanently destroy all data.',
      fix: 'Automated daily backups for database and uploaded files. Test restoration monthly.',
      frameworks: { 'Database': 'pg_dump, mongodump with timestamp', 'Files': 'rsync to S3 or backup service' }
    }
  ],
  accessibility: [
    {
      id: 'empty-alt',
      title: 'Missing Alt Text',
      severity: 'high',
      before: '<img src="banner.jpg"> - no alt attribute',
      after: '<img src="banner.jpg" alt="Student using laptop in library, smiling">',
      explanation: 'Screen readers cannot describe images without alt text. WCAG A requirement.',
      fix: 'Add descriptive alt to all images. Use alt="" only for decorative images.',
      frameworks: { 'Testing': 'axe-core or WAVE will flag missing alt text', 'CMS': 'Require alt field in image upload form' }
    },
    {
      id: 'color-only',
      title: 'Color-Only Information',
      severity: 'high',
      before: 'Red text for errors, green for success - no icons',
      after: 'Red text + ⚠️ icon for errors, green + ✓ for success',
      explanation: '8% of men are colorblind. Information must not rely solely on color.',
      fix: 'Combine color with icons, text labels, or patterns.',
      frameworks: { 'Design': 'Never use red/green alone for critical information', 'Testing': 'Use browser extension to simulate colorblindness' }
    },
    {
      id: 'focus-indicator',
      title: 'No Visible Focus Indicator',
      severity: 'medium',
      before: 'Custom CSS removes focus outline: outline: none',
      after: 'Clear focus ring on all interactive elements',
      explanation: 'Keyboard users cannot see where they are on the page without focus indicators.',
      fix: 'Style focus-outline with 2px solid line in brand color. Never remove outlines.',
      frameworks: { 'Tailwind': 'focus:ring-2 focus:ring-blue-500', 'CSS': ':focus-visible { outline: 2px solid #0063e5}' }
    },
    {
      id: 'aria-missing',
      title: 'Missing ARIA Labels',
      severity: 'medium',
      before: '<button>×</button> - no label for screen reader',
      after: '<button aria-label="Close modal">×</button>',
      explanation: 'Icon-only buttons and custom controls need ARIA labels for screen reader users.',
      fix: 'Add aria-label to all icon-only buttons. Use aria-expanded for toggles.',
      frameworks: { 'React': 'aria-label or visually hidden text', 'Testing': 'axe-core flags missing labels automatically' }
    },
    {
      id: 'heading-hierarchy',
      title: 'Broken Heading Hierarchy',
      severity: 'medium',
      before: 'H1 → H4 → H2 - skipped levels',
      after: 'Proper outline: H1 → H2 → H3',
      explanation: 'Screen reader users navigate by headings. Skipped levels break document structure.',
      fix: 'Use headings sequentially. Style with CSS, don\'t pick by size.',
      frameworks: { 'Structure': 'H1 only once per page, H2 for main sections', 'Styling': 'h2 { font-size: 28px } not <h4> for styling' }
    }
  ]
};

// Prompt Library - Industry-specific prompt examples
export const PROMPT_LIBRARY = [
  {
    component: 'hero-section',
    examples: [
      {
        industry: 'fortune',
        title: 'Fortune 500 Enterprise Hero',
        prompt: 'Create a split-layout hero section for a Fortune 500 enterprise software company. Left side: large headline "Transform Your Enterprise Operations" with subheading "Trusted by 200+ Fortune 500 companies" and two CTAs: "Schedule Executive Briefing" (primary) and "View Case Studies" (secondary). Right side: abstract geometric visualization representing digital transformation. Use professional navy blue and white color scheme. Include trust indicators: "SOC 2 Certified • ISO 27001 • 99.99% Uptime" below the fold.'
      },
      {
        industry: 'ecommerce',
        title: 'Ecommerce Seasonal Sale',
        prompt: 'Design an ecommerce hero section for a summer tech sale. Full-width background with gradient from yellow to orange. Large centered headline: "Summer Tech Sale" with 40% off badge. Subheading: "Free shipping on orders over $99." Below hero: 4 product cards with headphones, smartwatch, webcam, and tablet showing original prices with strikethrough and sale prices in red. Include countdown timer "Sale ends in 24:00:00" and trust badges: "30-day returns • Secure checkout • 24/7 support"'
      },
      {
        industry: 'gaming',
        title: 'Gaming Platform Trailer Hero',
        prompt: 'Create a gaming hero with embedded video player showing game trailer on right (60% width), left side (40% width) has "Play Free Now" CTA button with game controller icon, feature bullets: "2.5M+ Active Players • Cross-Platform • No Downloads Required" and platform icons for PC, PlayStation, Xbox, and Mobile. Dark background with neon accents. Add glowing animations to CTA button.'
      },
      {
        industry: 'saas',
        title: 'SaaS ROI Calculator Hero',
        prompt: 'Build a SaaS hero section with interactive ROI calculator. Top: headline "Calculate Your ROI in 30 Seconds". Calculator has two inputs: "Number of employees" and "Average hourly rate". Live calculation showing "Monthly savings: $12,000" and "Annual ROI: $144,000+". Include bar chart visualization comparing before/after costs. Below calculator: "Start Free Trial" CTA with "No credit card required" text. Use clean modern design with blue accent colors.'
      },
      {
        industry: 'fintech',
        title: 'Fintech Security-Focused Hero',
        prompt: 'Design a fintech hero emphasizing security. Background: subtle animated lock icons pattern. Headline: "Bank-Grade Security for Your Digital Assets". Subheading highlighting 256-bit encryption, cold storage, and regulatory compliance. Left: "Open Account" CTA with ID verification status indicator. Right: security certificate badges (SOC 2, PCI DSS, ISO 27001). Include live security stats: "$2B+ Secured • 99.99% Uptime • 256-bit Encryption"'
      }
    ]
  },
  {
    component: 'navbar',
    examples: [
      {
        industry: 'fortune',
        title: 'Enterprise SaaS Navbar',
        prompt: 'Create a professional enterprise navbar with logo left, 5 menu items: Platform, Solutions, Resources, Pricing, Company. Right side: "Get Demo" CTA button and "Sign In" link. On scroll: navbar becomes sticky with transparent glass effect. Logo shrinks from 32px to 24px. Add subtle drop shadow. Include breadcrumbs below navbar showing current location: "Home › Solutions › Enterprise". Mobile: hamburger menu that slides from left with company logo at top.'
      },
      {
        industry: 'ecommerce',
        title: 'Ecommerce Shopping Navbar',
        prompt: 'Design an ecommerce navbar with search bar prominently centered (60% of width). Left: logo and hamburger menu with product categories. Right: shopping cart icon with item count badge, user profile dropdown with "Orders", "Wishlist", "Account". Add mega menu on hover showing product categories with featured products. Include search autocomplete showing recent searches and trending products.'
      },
      {
        industry: 'gaming',
        title: 'Gaming Portal Navbar',
        prompt: 'Build a gaming website navbar with game logo left (with animated hover effect). Center: Games, Community, News, Support. Right: user avatar showing achievement badges, notification bell with count for friend requests. Include search that finds games, players, and clans. Dark theme with RGB accents that match featured game of the week.'
      }
    ]
  },
  {
    component: 'product-card',
    examples: [
      {
        industry: 'ecommerce',
        title: 'Full Product Card',
        prompt: 'Create a comprehensive ecommerce product card: (1) Product image with "New" badge in top-left, (2) Hover to show secondary product image, (3) Wishlist heart icon top-right, (4) Star rating with review count, (5) Product name truncated to 2 lines, (6) Current price large, original price with strikethrough, (7) "Add to Cart" button with loading state, (8) Quick view button on hover showing modal preview. Card should have smooth hover animation with subtle lift and shadow.'
      },
      {
        industry: 'ecommerce',
        title: 'Dynamic Product Card',
        prompt: 'Design a product card showing live inventory: "Only 3 left!" in red when stock <5, "50+ available" in green when stock >50. Include delivery estimate: "Get it by Tomorrow" with countdown to cutoff time. Show personalization: "Based on your view of [similar product]". Include tiered pricing: "$99 each or $89 for 3+" with automatic quantity-based discount calculator.'
      }
    ]
  },
  {
    component: 'pricing-card',
    examples: [
      {
        industry: 'saas',
        title: 'SaaS Tiered Pricing',
        prompt: 'Build a 3-tier SaaS pricing comparison: (1) Starter $0/mo, (2) Professional $99/mo with "Most Popular" badge, (3) Enterprise $499/mo. Each card shows: user limits, API call limits, integrations, support level. Include free trial button for each tier. Professional tier highlighted with border and shadow. Add toggle for monthly vs annual billing (save 20%) with price animation.'
      },
      {
        industry: 'fintech',
        title: 'Fintech Volume-Based Pricing',
        prompt: 'Create fintech pricing table with per-transaction fees: Startup tier 2.9% + 30¢ per transaction for <$100K/mo, Growth tier 2.5% + 25¢ for $100K-$1M/mo, Enterprise custom pricing for >$1M/mo. Include live calculator: user inputs monthly volume and average transaction size, see exact monthly cost. Show estimated savings vs competitors (Stripe, Square).'
      }
    ]
  },
  {
    component: 'feature-card',
    examples: [
      {
        industry: 'saas',
        title: 'SaaS Feature Card',
        prompt: 'Design a SaaS feature card with icon on top, feature name below, short description (2-3 lines), "Learn more" link that expands to show screenshots and deeper explanation. Include implementation time: "Set up in 10 minutes". Show status indicator: green check for active features, gray for upcoming. Cards should align in a responsive grid with consistent heights.'
      },
      {
        industry: 'gaming',
        title: 'Game Feature Card',
        prompt: 'Create a gaming feature showcase card: large screenshot showing feature, "New" badge with animation, feature title, one-line description, player count using it ("523K players online"). Click to embed video demo. Include difficulty level for features: "Easy • 5 min setup". Show cross-platform availability icons.'
      }
    ]
  },
  {
    component: 'cta-button',
    examples: [
      {
        industry: 'ecommerce',
        title: 'Add to Cart Button',
        prompt: 'Build an ecommerce "Add to Cart" button with three states: (1) default "Add to Cart", (2) loading spinner while adding, (3) success state with checkmark ✓ and "Added!" for 2 seconds. Show quantity incrementer: when clicked multiple times, show 2x, 3x with simple animation. Include subtle micro-interaction on hover: button bounces or icon slides in. Mobile: full width with thumb-friendly 48px height.'
      },
      {
        industry: 'fortune',
        title: 'Enterprise Contact CTA',
        prompt: 'Create a professional enterprise "Get Demo" button: subtle 3D hover effect lifting button, on click shows modal form instead of navigating away. Form collects: company name, role, team size, use case. Include trust text: "No spam - we\'ll only contact you about your demo" with lock icon. Button should pulse gently every 10 seconds to draw attention.'
      }
    ]
  },
  {
    component: 'stat-block',
    examples: [
      {
        industry: 'fortune',
        title: 'Enterprise Social Proof',
        prompt: 'Design a stats section for enterprise credibility: 200+ Fortune 500 Clients (with rotating company logos), $50B+ Transactions Processed, 99.99% Uptime SLA, 24/7 Support (with response time guarantees). Include YoY growth arrows. Make numbers animate counting up from 0 on page load. Add "As seen in" logos: WSJ, TechCrunch, Forbes.'
      },
      {
        industry: 'gaming',
        title: 'Game Community Stats',
        prompt: 'Build a gaming community stats dashboard showing: 2.5M+ Active Players (with online counter ticking up), 98% Player Satisfaction (4.9/5 star rating), 50+ Countries (with flag icons), 24/7 Game Servers (with ping status lights). Include language selector: "Join players in your region". Add friend referral stats: "You\'ve referred 8 friends".'
      }
    ]
  },
  {
    component: 'testimonial-card',
    examples: [
      {
        industry: 'fortune',
        title: 'Fortune 500 Case Study',
        prompt: 'Create an enterprise case study card: "Global Retail Chain", quote "40% operational efficiency gain within 3 months", results visualization showing before/after metrics, ROI calculation: $2M annual savings, profile of CTO who implemented it (avatar, name, title), company logo. Include implementation timeline bar chart showing phases. "Read full case study" link opening PDF.'
      },
      {
        industry: 'saas',
        title: 'Customer Quote Card',
        prompt: 'Design a SaaS customer testimonial: ". . . reduced our customer support tickets by 60% in the first month. . ." - Jane Doe, Head of Support at TechCorp, 4.9/5 rating, efficiency metrics graph showing ticket reduction over time, company logo with "Verified Customer" badge. Include play button for 60-second video testimonial.'
      }
    ]
  }
];

export const HERO_BACKGROUNDS = [
  { id: 'solid',         label: 'Solid',      swatch: '#f9fafb' },
  { id: 'gradient-1',    label: 'Purple',     swatch: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'gradient-2',    label: 'Ocean',      swatch: 'linear-gradient(135deg,#0ea5e9,#10b981)' },
  { id: 'gradient-3',    label: 'Sunset',     swatch: 'linear-gradient(135deg,#f97316,#ec4899)' },
  { id: 'gradient-4',    label: 'Night',      swatch: 'linear-gradient(135deg,#1e293b,#0f172a)' },
  { id: 'pattern-dots',  label: 'Dots',       swatch: '#fff' },
  { id: 'pattern-lines', label: 'Lines',      swatch: '#f3f4f6' },
  { id: 'image',         label: 'Photo',      swatch: 'url(dummy-image.png)' },
];

// Website launch checklist items
export const CHECKLIST_CATEGORIES = {
  seo:          { label: 'SEO & Metadata', icon: 'favicon-seo', priority: 'high' },
  technical:    { label: 'Technical Setup', icon: 'favicon-gear', priority: 'high' },
  analytics:    { label: 'Analytics & Tracking', icon: 'favicon-chart', priority: 'medium' },
  legal:        { label: 'Legal & Compliance', icon: 'favicon-legal', priority: 'medium' },
  performance:  { label: 'Performance', icon: 'favicon-speed', priority: 'high' },
  security:     { label: 'Security', icon: 'favicon-shield', priority: 'high' },
  accessibility: { label: 'Accessibility', icon: 'favicon-accessibility', priority: 'high' },
  social:       { label: 'Social Media', icon: 'favicon-share', priority: 'low' },
  ux:           { label: 'UX & Design', icon: 'favicon-palette', priority: 'high' },
  conversion:   { label: 'Conversion Optimization', icon: 'favicon-trend', priority: 'high' },
  i18n:         { label: 'Internationalization', icon: 'favicon-globe', priority: 'medium' },
};

export const CHECKLIST_ITEMS = [
  // SEO & Metadata
  { id: 'title', category: 'seo', label: 'Page title (<title> tag)', desc: 'Unique, descriptive title under 60 characters', tip: 'Add <title>Your Brand — Short Value Prop</title> in <head>. Keep under 60 chars to avoid truncation in search results.' },
  { id: 'meta-desc', category: 'seo', label: 'Meta description', desc: 'Compelling summary under 160 characters', tip: 'Add <meta name="description" content="..."> in <head>. Write 150-160 chars. This appears in search results under your title.' },
  { id: 'og-title', category: 'seo', label: 'Open Graph title', desc: 'Title shown when shared on social media', tip: 'Add <meta property="og:title" content="Your Title">. Can be same as page title or slightly different for social context.' },
  { id: 'og-desc', category: 'seo', label: 'Open Graph description', desc: 'Description for social media previews', tip: 'Add <meta property="og:description" content="...">. Can be same as meta description or tailored for social sharing.' },
  { id: 'og-image', category: 'seo', label: 'Open Graph image (OG preview)', desc: '1200×630px image for social media cards', tip: 'Add <meta property="og:image" content="https://yoursite.com/og-preview.jpg">. Use 1200×630px PNG or JPG, under 1MB. This is what shows when you share on Facebook, LinkedIn, Slack.' },
  { id: 'og-url', category: 'seo', label: 'Open Graph URL', desc: 'Canonical URL for social sharing', tip: 'Add <meta property="og:url" content="https://yoursite.com/">. Use the full, canonical URL of the page.' },
  { id: 'twitter-card', category: 'seo', label: 'Twitter card meta tags', desc: 'Twitter-specific preview tags', tip: 'Add <meta name="twitter:card" content="summary_large_image">, twitter:title, twitter:description, twitter:image. Enables rich previews on Twitter/X.' },
  { id: 'canonical', category: 'seo', label: 'Canonical URL', desc: 'Link rel="canonical" to avoid duplicate content', tip: 'Add <link rel="canonical" href="https://yoursite.com/"> to tell search engines this is the main version of the page.' },
  { id: 'structured-data', category: 'seo', label: 'Structured data (JSON-LD)', desc: 'Schema.org markup for rich snippets', tip: 'Add <script type="application/ld+json"> with schema.org markup (e.g., WebSite, Organization, Article). Helps Google show rich results.' },
  { id: 'meta-robots', category: 'seo', label: 'Meta robots tag', desc: 'Control indexing and following links', tip: 'Add <meta name="robots" content="index, follow"> to allow search engines to index your page. Use "noindex, nofollow" for private pages.' },

  // Technical Setup
  { id: 'favicon', category: 'technical', label: 'Favicon', desc: '32×32px icon shown in browser tabs', tip: 'Add <link rel="icon" type="image/x-icon" href="favicon.ico"> or use PNG. Also add apple-touch-icon (180×180px) for iOS home screen.' },
  { id: 'robots-txt', category: 'technical', label: 'robots.txt', desc: 'Instructions for search engine crawlers', tip: 'Create /robots.txt file. Use "User-agent: *\nAllow: /" to allow all crawlers. Add "Sitemap: https://yoursite.com/sitemap.xml" at the bottom.' },
  { id: 'sitemap', category: 'technical', label: 'sitemap.xml', desc: 'XML file listing all pages for search engines', tip: 'Create /sitemap.xml with all pages. Submit to Google Search Console. Update whenever you add/remove pages.' },
  { id: 'ssl', category: 'technical', label: 'SSL certificate (HTTPS)', desc: 'Secure connection with TLS/SSL', tip: 'Enable HTTPS on your domain. Most hosting providers offer free SSL via Let\'s Encrypt. Redirect all HTTP to HTTPS.' },
  { id: 'custom-domain', category: 'technical', label: 'Custom domain', desc: 'yoursite.com instead of subdomain.platform.com', tip: 'Register a domain and point it to your hosting. Add CNAME file if using GitHub Pages, or update DNS A/CNAME records for other hosts.' },
  { id: '404-page', category: 'technical', label: 'Custom 404 page', desc: 'Friendly error page for broken links', tip: 'Create /404.html with helpful message, search box, and links to main pages. GitHub Pages auto-serves 404.html for missing pages.' },
  { id: 'responsive', category: 'technical', label: 'Responsive design', desc: 'Works on mobile, tablet, and desktop', tip: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">. Use CSS media queries and test on mobile (375px), tablet (768px), desktop (1440px).' },
  { id: 'crossbrowser', category: 'technical', label: 'Cross-browser testing', desc: 'Test in Chrome, Firefox, Safari, Edge', tip: 'Check your site in Chrome, Firefox, Safari, Edge. Use BrowserStack or real devices. Verify ES6 module support for modern JS.' },

  // Analytics & Tracking
  { id: 'analytics', category: 'analytics', label: 'Analytics platform', desc: 'Google Analytics, Plausible, or similar', tip: 'Add Google Analytics 4 (GA4) script to <head>, or use privacy-friendly alternatives like Plausible, Fathom, or Simple Analytics. Track page views and conversions.' },
  { id: 'search-console', category: 'analytics', label: 'Google Search Console', desc: 'Monitor search performance and indexing', tip: 'Sign up at search.google.com/search-console. Verify ownership via HTML tag or DNS. Submit sitemap. Monitor indexing issues and search queries.' },
  { id: 'conversion-tracking', category: 'analytics', label: 'Conversion tracking', desc: 'Track goals, sign-ups, purchases', tip: 'Set up goals in GA4 or your analytics tool. Track button clicks, form submissions, and key user actions. Use event tracking.' },

  // Legal & Compliance
  { id: 'privacy-policy', category: 'legal', label: 'Privacy Policy', desc: 'How you collect, use, and protect user data', tip: 'Create /privacy.html explaining data collection, cookies, analytics. Link in footer. Required if you collect any user data or use analytics.' },
  { id: 'terms', category: 'legal', label: 'Terms of Service', desc: 'Rules for using your website', tip: 'Create /terms.html with terms and conditions. Link in footer. Especially important for SaaS, marketplaces, or user-generated content sites.' },
  { id: 'cookie-banner', category: 'legal', label: 'Cookie consent banner', desc: 'GDPR/CCPA compliant cookie notice', tip: 'If targeting EU/California users, add cookie banner before setting any cookies. Use tools like CookieYes, OneTrust, or custom solution. Must allow opt-out.' },
  { id: 'gdpr', category: 'legal', label: 'GDPR compliance', desc: 'EU data protection requirements', tip: 'If you have EU visitors: get consent before analytics/cookies, provide data export/deletion, have clear privacy policy, use secure data handling.' },

  // Performance
  { id: 'image-optimization', category: 'performance', label: 'Image optimization', desc: 'Compress and format images efficiently', tip: 'Use WebP format for photos. Compress with ImageOptim or Squoosh. Keep images under 200KB. Use width/height attributes to prevent layout shift.' },
  { id: 'lazy-loading', category: 'performance', label: 'Lazy loading', desc: 'Load images only when needed', tip: 'Add loading="lazy" to <img> tags below the fold. Browsers will defer loading until user scrolls near them. Saves bandwidth and speeds up initial load.' },
  { id: 'minify', category: 'performance', label: 'Minify CSS/JS', desc: 'Remove whitespace and comments', tip: 'Use build tools (Vite, esbuild, Webpack) or online tools to minify CSS/JS. Reduces file size by 30-40%. For production only.' },
  { id: 'lighthouse', category: 'performance', label: 'Lighthouse score', desc: 'Audit performance, accessibility, SEO', tip: 'Run Lighthouse in Chrome DevTools (Cmd+Option+I > Lighthouse tab). Aim for 90+ in all categories. Fix issues it reports.' },
  { id: 'font-loading', category: 'performance', label: 'Font optimization', desc: 'Avoid FOUT/FOIT, use font-display', tip: 'Use font-display: swap in @font-face or Google Fonts URL (&display=swap). Preload critical fonts with <link rel="preload">. Subset fonts to needed characters only.' },

  // Security
  { id: 'https-redirect', category: 'security', label: 'HTTPS redirect', desc: 'Force all traffic to secure connection', tip: 'Configure server to redirect HTTP to HTTPS. For static sites, most hosts do this automatically. For custom servers, use 301 redirects.' },
  { id: 'csp', category: 'security', label: 'Content Security Policy', desc: 'HTTP header preventing XSS attacks', tip: 'Add Content-Security-Policy header. Start with "default-src \'self\'; script-src \'self\' \'unsafe-inline\'". Adjust based on your external resources.' },
  { id: 'cors', category: 'security', label: 'CORS configuration', desc: 'Control which domains can access your API', tip: 'If you have an API, set Access-Control-Allow-Origin header. Use specific domains, not "*" in production. For static sites, usually not needed.' },
  { id: 'security-headers', category: 'security', label: 'Security headers', desc: 'X-Frame-Options, X-Content-Type-Options, etc.', tip: 'Add headers: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: no-referrer-when-downgrade. Use securityheaders.com to check.' },

  // Accessibility
  { id: 'alt-text', category: 'accessibility', label: 'Alt text for images', desc: 'Descriptive text for screen readers', tip: 'Add alt="description" to every <img>. Describe what\'s in the image. Use alt="" for decorative images. Never skip the alt attribute.' },
  { id: 'aria-labels', category: 'accessibility', label: 'ARIA labels', desc: 'Accessibility labels for interactive elements', tip: 'Add aria-label to icon buttons, role="navigation" to navs, aria-hidden="true" to decorative icons. Use semantic HTML first, ARIA second.' },
  { id: 'keyboard-nav', category: 'accessibility', label: 'Keyboard navigation', desc: 'Tab, Enter, Space work on all interactive elements', tip: 'Test your site with Tab (focus), Enter (click buttons/links), Space (checkboxes). Ensure visible focus indicators. Use tabindex="-1" to remove from tab order.' },
  { id: 'color-contrast', category: 'accessibility', label: 'Color contrast', desc: 'WCAG AA minimum 4.5:1 for text', tip: 'Check contrast at webaim.org/resources/contrastchecker. Text should be 4.5:1 ratio (7:1 for AAA). Large text (18px+) can be 3:1.' },
  { id: 'skip-link', category: 'accessibility', label: 'Skip to content link', desc: 'Hidden link for keyboard users to skip navigation', tip: 'Add <a href="#main" class="skip-link">Skip to content</a> at top of <body>. Hide off-screen, show on focus. Helps keyboard users skip repetitive nav.' },

  // Social Media
  { id: 'social-preview-test', category: 'social', label: 'Test social previews', desc: 'Verify OG image and meta tags render correctly', tip: 'Test at: facebook.com/sharing/debugger (Facebook/LinkedIn), cards-dev.twitter.com/validator (Twitter), opengraph.xyz (generic). Fix any warnings.' },
  { id: 'social-icons', category: 'social', label: 'Social media links', desc: 'Links to your brand\'s social profiles', tip: 'Add icon links in footer or header to your social profiles. Use rel="noopener noreferrer" and target="_blank". Include aria-label for accessibility.' },
  { id: 'share-buttons', category: 'social', label: 'Share buttons (optional)', desc: 'Let users share your content', tip: 'Add "Share on Twitter", "Share on LinkedIn" buttons to blog posts/articles. Use native share URLs or Web Share API for mobile.' },

  // UX & Design (NEW)
  { id: 'ux-mobile-first', category: 'ux', label: 'Mobile-first design', desc: 'Primary experience designed for mobile devices', tip: 'Start design at 375px mobile width, then scale up. Use touch-friendly targets (44x44px min). Test all interactions on real mobile devices, not just browser emulator.' },
  { id: 'ux-consistent-nav', category: 'ux', label: 'Consistent navigation', desc: 'Same navigation pattern across all pages', tip: 'Keep navbar in same position, same links, same order on every page. Users should never get lost or need to re-learn navigation patterns.', industries: ['all'] },
  { id: 'ux-loading-states', category: 'ux', label: 'Loading states', desc: 'Visual feedback during async operations', tip: 'Show skeleton screens or spinners for any operation >300ms. Never leave users wondering if their action worked or if the site is broken.', industries: ['all'] },
  { id: 'ux-error-messages', category: 'ux', label: 'Clear error messages', desc: 'User-friendly error descriptions with solutions', tip: 'Instead of "Error 500", show "We couldn\'t process your payment. Please check your card details or try another card." Always suggest a fix.', industries: ['all'] },
  { id: 'ux-empty-states', category: 'ux', label: 'Helpful empty states', desc: 'Guidance when no content exists yet', tip: 'Show "You have no projects yet" + "Create your first project" button instead of blank page. Include illustration and clear next step.', industries: ['saas'] },
  { id: 'ux-breadcrumbs', category: 'ux', label: 'Breadcrumbs (deep sites)', desc: 'Show current location in site hierarchy', tip: 'Add breadcrumbs for sites with >2 levels of navigation. Format: Home > Category > Subcategory > Current Page. Each ancestor should be clickable.' },
  { id: 'ux-progress-indicators', category: 'ux', label: 'Progress indicators', desc: 'Show completion status for multi-step flows', tip: 'For forms, checkout, or onboarding with >3 steps, show "Step 3 of 5" with visual progress bar. Let users go back to previous steps.' },
  { id: 'ux-favicons', category: 'ux', label: 'Favicon variations', desc: 'Multiple favicon sizes and formats', tip: 'Generate favicon.ico (32x32), apple-touch-icon.png (180x180), icon-192.png, icon-512.png for PWA. Use realfavicongenerator.net for all formats at once.' },
  { id: 'ux-dark-mode', category: 'ux', label: 'Dark mode support', desc: 'Respect user\'s system dark mode preference', tip: 'Use @media (prefers-color-scheme: dark) to automatically show dark theme. Test charts, images, and logos still work in dark mode.' },

  // Conversion Optimization (NEW)
  { id: 'conv-cta-above-fold', category: 'conversion', label: 'Primary CTA above fold', desc: 'Main action visible without scrolling', tip: 'Hero CTA should be visible on 1024x768 screen. Use heatmaps (Hotjar) to verify users see it. For long pages, repeat CTA at bottom too.' },
  { id: 'conv-cta-contrast', category: 'conversion', label: 'CTA button contrast', desc: 'Primary button stands out from page', tip: 'CTA should be highest contrast element on page. Use brand accent color, sufficient size (44-48px), and action-oriented text ("Start free trial" not "Submit").' },
  { id: 'conv-social-proof', category: 'conversion', label: 'Social proof elements', desc: 'Trust signals like testimonials, reviews, counts', tip: 'Add "Trusted by 10,000+ companies" or customer logos near CTA. Specific numbers work better: "Rated 4.8/5 by 2,345 users" vs "Excellent reviews".' },
  { id: 'conv-urgency-scarcity', category: 'conversion', label: 'Urgency/scarcity (ethical)', desc: 'Time-limited offers or limited availability', tip: '"50% off this weekend only" or "Only 3 spots left". Use real constraints only - fake urgency damages trust.' },
  { id: 'conv-checkout-flow', category: 'conversion', label: 'Streamlined checkout', desc: 'Minimal steps to complete purchase', tip: 'Ecommerce: Reduce checkout to <5 steps. Offer guest checkout. Show progress indicator. Save cart across sessions. AB test one-page vs multi-step.' },
  { id: 'conv-abandoned-cart', category: 'conversion', label: 'Abandoned cart recovery', desc: 'Email sequence for incomplete purchases', tip: 'Send 1st email 1hr after abandonment: "Forget something?". 2nd email 24hrs with small discount. 3rd email 72hrs with social proof. 15-25% recovery rate.' },
  { id: 'conv-product-images', category: 'conversion', label: 'High-quality product images', desc: 'Multiple angles, zoom, lifestyle shots', tip: 'Ecommerce: 5-7 images per product. Include 360° view, zoom, lifestyle photos, size comparison, and video. 94% more views than text-only.' },
  { id: 'conv-live-chat', category: 'conversion', label: 'Live chat support', desc: 'Real-time customer assistance', tip: 'Add live chat widget for sales/support. 44% increase in conversion with live chat. Use chatbots for after-hours, escalate to humans for complex issues.' },
  { id: 'conv-gamification', category: 'conversion', label: 'Gamification elements', desc: 'Points, badges, progress for engagement', tip: 'Gaming/SaaS: Daily login bonuses, achievement badges, progress bars, leaderboards. Increase retention 30-40%. Keep rewards meaningful.' },
  { id: 'conv-personalization', category: 'conversion', label: 'Personalized recommendations', desc: 'AI-driven product/content suggestions', tip: 'Ecommerce: "Recommended for you" based on browse/purchase history. SaaS: Personalized dashboard content. Email: Dynamic content based on user data.' },

  // Internationalization (NEW)
  { id: 'i18n-language-switcher', category: 'i18n', label: 'Language selector', desc: 'Easy way to change site language', tip: 'Put language switcher in header (globe icon + "English ▾"). Auto-detect browser language on first visit. Remember user preference in localStorage.', industries: ['all'] },
  { id: 'i18n-date-format', category: 'i18n', label: 'Localized date formats', desc: 'DD/MM/YYYY vs MM/DD/YYYY vs YYYY-MM-DD', tip: 'Use Intl.DateTimeFormat().format(new Date()) for locale-aware dates. UK: 14/03/2026, US: 03/14/2026, Japan: 2026/03/14.' },
  { id: 'i18n-number-format', category: 'i18n', label: 'Localized number/currency', desc: '1,000.00 vs 1.000,00 format', tip: 'Use Intl.NumberFormat(). Price: $1,999.99 (US) vs €1.999,99 (Germany). Auto-format based on selected locale.' },
  { id: 'i18n-timezone', category: 'i18n', label: 'Timezone handling', desc: 'Display times in user\'s local timezone', tip: 'Store timestamps in UTC, convert to local timezone on display. Show relative times: "2 hours ago" works globally.' },
  { id: 'i18n-rtl-support', category: 'i18n', label: 'RTL language support', desc: 'Right-to-left layout for Arabic/Hebrew', tip: 'Add dir="rtl" to <html> tag for RTL languages. Mirror layouts: nav on right, text align right, flip directional icons.' },
  { id: 'i18n-currency-switcher', category: 'i18n', label: 'Currency converter', desc: 'Display prices in local currency', tip: 'Ecommerce: Auto-detect location and show prices in local currency. Use current exchange rates. Include "Prices in USD" disclaimer if needed.' },
  { id: 'i18n-translation-quality', category: 'i18n', label: 'Professional translation', desc: 'Human translation, not machine-only', tip: 'Use professional translators for customer-facing content. Machine translate (DeepL) first, then human review. Include locale-specific idioms and cultural references.' },
  { id: 'i18n-local-payment', category: 'i18n', label: 'Local payment methods', desc: 'Accept region-specific payment types', tip: 'Europe: SOFORT, iDEAL. China: Alipay, WeChat Pay. Brazil: Boleto. India: UPI. Increase conversion 20-30% by offering local methods.' },
  { id: 'i18n-vat-taxes', category: 'i18n', label: 'VAT/sales tax calculation', desc: 'Automatic tax calculation by region', tip: 'Ecommerce: Use TaxJar or Avalara API for automatic tax calculation. Show "Includes VAT €120" or "+tax" clearly at checkout.' },

  // Ecommerce Specific
  { id: 'ec-shipping-calculator', category: 'conversion', label: 'Shipping calculator', desc: 'Show shipping costs before checkout', tip: 'Add zip code input on product pages to estimate shipping early. Free shipping above threshold? Show "Add $12 more for FREE shipping".' },
  { id: 'ec-stock-alerts', category: 'conversion', label: 'Stock availability alerts', desc: 'Low stock warnings create urgency', tip: 'Show "Only 3 left in stock" or "Low stock - order soon" with red/orange indicator. Update in real-time. Limited stock increases conversion 20-30%.' },
  { id: 'ec-wishlist', category: 'ux', label: 'Wishlist/favorites', desc: 'Save items for later purchase', tip: 'Heart icon on product cards. Persistent wishlist across sessions. Share wishlist with others. Email notifications for price drops or back-in-stock.' },
  { id: 'ec-comparison', category: 'ux', label: 'Product comparison', desc: 'Compare products side-by-side', tip: 'Ecommerce: Checkbox to compare up to 3-4 products. Show specs, prices, reviews in table. Critical for electronics, appliances, tools with many features.' },
  { id: 'ec-inventory-sync', category: 'technical', label: 'Real-time inventory sync', desc: 'Prevent overselling across channels', tip: 'Sync inventory across Shopify, Amazon, eBay, retail stores in real-time. Critical for multi-channel sellers. Prevent cancellations and unhappy customers.' },

  // SaaS Specific
  { id: 'saas-onboarding', category: 'ux', label: 'Guided onboarding flow', desc: 'Interactive tutorial for new users', tip: 'First login: 5-step interactive tour showing key features. Checklist showing progress. Tooltips highlighting important UI. Skip option for experienced users.' },
  { id: 'saas-empty-states', category: 'ux', label: 'Contextual empty states', desc: 'Guide users when data is empty', tip: 'Dashboard empty: "No projects yet" + "Create first project" button with arrow pointing. Help users get value immediately.' },
  { id: 'saas-dashboard', category: 'ux', label: 'Analytics dashboard', desc: 'KPI overview for tracking metrics', tip: 'SaaS: Show active users, MRR, churn rate, conversion funnel. Custom date ranges. Interactive charts with hover details. Export to CSV.' },
  { id: 'saas-api-documentation', category: 'technical', label: 'Developer API docs', desc: 'Interactive API documentation', tip: 'SaaS/Fintech: Swagger/OpenAPI docs with Try It Now feature. Code samples in 5+ languages. Rate limit info. Webhook documentation.' },
  { id: 'saas-webhooks', category: 'technical', label: 'Webhook support', desc: 'Real-time event notifications', tip: 'SaaS: Let users subscribe to events (user.created, payment.failed). Include retry logic with exponential backoff. Dashboard to monitor webhook status.' },
  { id: 'saas-team-mgmt', category: 'ux', label: 'Team management', desc: 'Add/remove team members with roles', tip: 'SaaS: Owner, Admin, Member, Viewer roles. Invite by email with expiring link. Bulk import from Slack/CSV. Show usage per team member.' },
  { id: 'saas-usage-limits', category: 'conversion', label: 'Usage limit warnings', desc: 'Alert users approaching plan limits', tip: 'SaaS: "You\'re using 850/1000 API calls this month. Upgrade plan?" Progress bar in dashboard. Proactive communication prevents service interruption.' },
  { id: 'saas-offline-mode', category: 'ux', label: 'Offline functionality', desc: 'Work offline, sync when connected', tip: 'Mobile SaaS: Cache data locally (IndexedDB). Show "You\'re offline - changes will sync when reconnected." Conflict resolution UI when multiple edits.' },

  // Gaming Specific
  { id: 'game-anti-cheat', category: 'security', label: 'Anti-cheat system', desc: 'Prevent hacking and exploits', tip: 'Gaming: Implement server-side validation for all actions. Detect speed hacks, aimbots, wall hacks. Ban waves, not individual bans (harder to test hacks).' },
  { id: 'game-matchmaking', category: 'ux', label: 'Skill-based matchmaking', desc: 'Fair matches based on player skill', tip: 'Gaming: ELO/Glicko rating system. Match players within ±100 rating points. Short queue times (<2min). Show expected wait time.' },
  { id: 'game-cross-platform', category: 'technical', label: 'Cross-platform saves', desc: 'Sync progress across devices/platforms', tip: 'Gaming: Enable cloud saves. Player can start on PC, continue on mobile. Conflict resolution when saves diverge. Works offline, syncs on reconnect.' },
  { id: 'game-leaderboard', category: 'conversion', label: 'Leaderboards & ranks', desc: 'Competitive ranking system', tip: 'Gaming: Global and friends leaderboards. Monthly/seasonal resets. Bronze/Silver/Gold ranks with badges. Top 100 leaderboard with player profiles.' },
  { id: 'game-social', category: 'ux', label: 'Social features', desc: 'Friends, clans, chat system', tip: 'Gaming: Friend list, clan/guild system, in-game chat, voice chat. Friend invites via link/code. Social features increase retention 40-60%.' },
  { id: 'game-events', category: 'conversion', label: 'Live events & seasons', desc: 'Time-limited content and events', tip: 'Gaming: Weekly events, monthly seasons, holiday themes. Exclusive rewards. Event leaderboard. Teaser countdown before event starts.' },
  { id: 'game-achievements', category: 'conversion', label: 'Achievement system', desc: 'Goals and trophies for engagement', tip: 'Gaming: Easy, medium, hard, legendary achievements. "First win" to "1000 games played". Achievement points total. Rare achievements with special badges.' },
  { id: 'game-tutorial', category: 'ux', label: 'Interactive tutorial', desc: 'Teach game mechanics progressively', tip: 'Gaming: First 3 minutes: show move, attack, special ability one at a time. Let player practice each. Skip option for experienced players. Can replay tutorial from settings.' },

  // Fintech Specific
  { id: 'fintech-kyc', category: 'legal', label: 'KYC verification', desc: 'Know Your Customer compliance', tip: 'Fintech: ID verification (passport/driver\'s license). Proof of address (utility bill <3mo). Selfie with ID. Automated verification with fallback to manual review (24-48hrs).' },
  { id: 'fintech-fraud-detection', category: 'security', label: 'AI fraud detection', desc: 'Machine learning fraud prevention', tip: 'Fintech: Detect unusual patterns (location, amount, frequency). 3D Secure for suspicious transactions. SMS verification for new devices. Machine learning improves over time.' },
  { id: 'fintech-account-statements', category: 'ux', label: 'Monthly statements', desc: 'PDF statements for tax/accounting', tip: 'Fintech: Auto-generate monthly statements (PDF). Itemized transactions with categories. Tax-ready format. Email automatically or download from dashboard. Keep 7-year history.' },
  { id: 'fintech-disputes', category: 'legal', label: 'Dispute resolution', desc: 'Process for transaction disputes', tip: 'Fintech: In-app dispute filing. Automated acknowledgments. Status tracking dashboard. Resolution in <30 days. Chargeback management for merchants.' },
  { id: 'fintech-crypto', category: 'technical', label: 'Cold wallet storage', desc: 'Offline storage for crypto assets', tip: 'Fintech/Crypto: 95% of funds in cold storage (offline). Multi-signature required for transfers. Insurance coverage for hot wallet. Transparent proof of reserves.' },
  { id: 'fittest-tax-reporting', category: 'legal', label: 'Tax reporting tools', desc: 'Capital gains/loss calculations', tip: 'Fintech/Crypto: Auto-calculate capital gains/losses. FIFO/LIFO/HIFO methods. Generate Form 8949 (US). CSV export for accountants. Tax-loss harvesting suggestions.' },
];
