# Real-Time Content Sync (RTCS) - Figma Plugin

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A powerful Figma plugin that syncs real-time content from APIs, CMS, databases, and other data sources directly into your Figma designs. Say goodbye to placeholder text and outdated mockups!

## Why RTCS?

Traditional design workflows rely on placeholder text, fake data, or manually copying content from various sources. This creates several problems:

- Designs get out of sync with actual content
- Manual updates are time-consuming and error-prone
- Hard to test designs with real-world data variations
- Localization testing requires recreating entire designs
- Collaboration between designers and content teams is difficult

**RTCS solves all of this** by creating a live bridge between your content sources and your designs.

---

## Key Features

### 1. Universal Content Connections
- Connect to **REST APIs**, **GraphQL** endpoints, **JSON URLs**
- Support for **Google Sheets**, **Notion**, **Airtable**
- Multiple authentication methods: Bearer Token, API Key, Basic Auth
- Custom data path extraction (e.g., `data.items[0].title`)

### 2. Smart Mapping Engine
- Map any text layer to any data field
- Supports nested object paths (e.g., `user.profile.name`)
- Supports array indexing (e.g., `products[0].price`)
- Automatic text updates when data changes
- Preserves text formatting and styles

### 3. Real-Time Sync
- **Manual Sync**: Update all content with one click
- **Auto Sync**: Automatically refresh data every 15 minutes
- **Preview Mode**: View data before applying to designs
- Intelligent caching for offline work

### 4. Multi-Language Support
- Switch between languages instantly
- Perfect for localization testing
- See how designs adapt to different text lengths
- Support for 8+ languages out of the box

### 5. Environment Management
- Switch between Production, Staging, and Development
- Test with different data sets
- Safe testing without affecting live data

### 6. Advanced Options
- Preserve text formatting
- Auto-resize text boxes
- Warn on text overflow
- Export/Import configuration
- Full plugin reset capability

---

## Installation

### Prerequisites

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Figma Desktop App** - [Download here](https://www.figma.com/downloads/)

### Setup Steps

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/rtcs-figma-plugin.git
   cd rtcs-figma-plugin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the plugin**
   ```bash
   npm run build
   ```

4. **Load in Figma**
   - Open Figma Desktop App
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Select the `manifest.json` file from this directory
   - Click "Import"

5. **Run the plugin**
   - In any Figma file, go to `Plugins` → `Development` → `Real-Time Content Sync (RTCS)`

---

## Quick Start Guide

### Step 1: Connect to a Data Source

1. Open the plugin in Figma
2. Go to the **Connect** tab
3. Enter your API URL (try this example: `https://jsonplaceholder.typicode.com/posts/1`)
4. Select authentication type (use "None" for the example)
5. Click **Test Connection** to verify
6. Click **Save & Connect** to store the connection

### Step 2: Create Mappings

1. Go to the **Mapping** tab
2. Create a text layer in Figma (e.g., "Title")
3. Select the text layer
4. Enter the field path (e.g., `title`)
5. Click **Map Selected Layer**
6. The text will automatically update with data!

### Step 3: Sync Your Content

1. Go to the **Sync** tab
2. Click **Sync Now** to refresh all content
3. Click **Preview Data** to see the raw data
4. Enable **Auto Sync** for automatic updates

---

## Real-World Examples

### Example 1: E-Commerce Product Cards

**API:** Your product catalog API
```json
{
  "products": [
    {
      "name": "Wireless Headphones",
      "price": "$299.99",
      "description": "Premium noise-canceling headphones",
      "rating": "4.5"
    }
  ]
}
```

**Mappings:**
- Product Name → `products[0].name`
- Price → `products[0].price`
- Description → `products[0].description`
- Rating → `products[0].rating`

### Example 2: Blog Post Preview

**API:** `https://jsonplaceholder.typicode.com/posts/1`
```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere...",
  "body": "quia et suscipit..."
}
```

**Mappings:**
- Title Layer → `title`
- Body Layer → `body`
- Author ID → `userId`

### Example 3: User Profile

**API:** `https://jsonplaceholder.typicode.com/users/1`
```json
{
  "name": "Leanne Graham",
  "email": "Sincere@april.biz",
  "company": {
    "name": "Romaguera-Crona"
  }
}
```

**Mappings:**
- Name → `name`
- Email → `email`
- Company → `company.name`

---

## Advanced Usage

### Working with Arrays

To access array items, use bracket notation:
```
items[0].title        → First item's title
items[1].price        → Second item's price
data.users[2].name    → Third user's name
```

### Nested Objects

Access nested properties with dot notation:
```
user.profile.name
data.company.address.city
product.metadata.sku
```

### Authentication Examples

**Bearer Token:**
- Auth Type: Bearer Token
- Token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**API Key:**
- Auth Type: API Key
- Key: `your-api-key-here`

**Basic Auth:**
- Auth Type: Basic Auth
- Credentials: `username:password`

---

## Development

### Build Commands

```bash
npm run build         # Build once
npm run watch         # Watch for changes and rebuild
npm run lint          # Check for code issues
npm run lint:fix      # Fix linting issues
```

### Project Structure

```
rtcs-figma-plugin/
├── manifest.json      # Plugin configuration
├── code.ts           # Main plugin logic (TypeScript)
├── code.js           # Compiled JavaScript
├── ui.html           # Plugin UI
├── package.json      # Node dependencies
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

### Key Files

- **manifest.json**: Plugin metadata and permissions
- **code.ts**: Core functionality (runs in Figma sandbox)
- **ui.html**: User interface (runs in browser context)

---

## Troubleshooting

### Connection Issues

**Problem:** "Failed to fetch data"
- Check your internet connection
- Verify the API URL is correct
- Ensure the API allows CORS requests
- Check authentication credentials

**Problem:** "Unauthorized" or "403 Forbidden"
- Verify your API token/key is correct
- Check token hasn't expired
- Ensure you have permission to access the endpoint

### Mapping Issues

**Problem:** "No value found for path"
- Check the field path spelling
- Use **Preview Data** to see the data structure
- Verify the path exists in your data

**Problem:** "Layer not found"
- The mapped layer may have been deleted
- Remove the old mapping and create a new one

### Build Issues

**Problem:** TypeScript errors
```bash
npm run lint:fix
npm run build
```

**Problem:** Module not found
```bash
rm -rf node_modules
npm install
```

---

## API Reference

### Message Types (UI → Plugin)

| Type | Parameters | Description |
|------|------------|-------------|
| `init` | - | Initialize plugin state |
| `test-connection` | `url`, `authType`, `authValue`, `dataPath` | Test API connection |
| `save-connection` | `config` | Save connection config |
| `sync-now` | - | Sync data immediately |
| `preview-data` | - | Show data preview |
| `map-layer` | `fieldPath` | Map selected layer |
| `remove-mapping` | `layerId` | Remove a mapping |
| `clear-mappings` | - | Clear all mappings |

### Storage Keys

- `rtcs_config`: Connection configuration
- `rtcs_mappings`: Layer mappings
- `rtcs_cached_data`: Cached API data
- `rtcs_auto_sync`: Auto-sync setting
- `rtcs_language`: Selected language

---

## Roadmap

Future features we're considering:

- [ ] AI-powered content suggestions
- [ ] Support for image URLs (not just text)
- [ ] Webhooks for instant updates
- [ ] Team collaboration features
- [ ] Plugin marketplace integrations
- [ ] GraphQL schema introspection
- [ ] Multi-page sync
- [ ] Conditional content rules
- [ ] A/B testing variants

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Support

- Report bugs: GitHub Issues
- Feature requests: GitHub Discussions
- Documentation: Wiki

---

## Credits

Built with focus on real-world design workflows.

**Tech Stack:**
- TypeScript
- Figma Plugin API
- Modern Web APIs (Fetch, Storage)

---

Made with care for designers and developers everywhere.
