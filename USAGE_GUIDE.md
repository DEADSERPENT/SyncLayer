# RTCS - Quick Usage Guide

## Getting Started in 5 Minutes

### 1. Install the Plugin

1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to this folder and select `manifest.json`
4. The plugin is now ready to use!

### 2. Test with a Sample API

Let's create a simple blog post card:

#### Step 1: Create Your Design
1. Create a new Figma file
2. Add a text layer named "Post Title"
3. Add another text layer named "Post Body"

#### Step 2: Connect to API
1. Run the plugin: **Plugins** → **Development** → **Real-Time Content Sync**
2. In the **Connect** tab:
   - **API URL**: `https://jsonplaceholder.typicode.com/posts/1`
   - **Authentication**: None
3. Click **Test Connection** (should succeed!)
4. Click **Save & Connect**

#### Step 3: Map Your Layers
1. Go to the **Mapping** tab
2. Select the "Post Title" text layer in Figma
3. Enter field path: `title`
4. Click **Map Selected Layer**
5. Watch it auto-fill with real data!
6. Repeat for "Post Body" with field path: `body`

#### Step 4: Sync & Manage
1. Go to **Sync** tab
2. Click **Preview Data** to see the JSON
3. Click **Sync Now** to refresh
4. Enable **Auto Sync** for automatic updates

---

## Real-World Use Cases

### E-Commerce Product Card

**Design Setup:**
- Product Name (text layer)
- Product Price (text layer)
- Product Description (text layer)

**API Example:**
```
https://dummyjson.com/products/1
```

**Mappings:**
- Product Name → `title`
- Product Price → `price`
- Product Description → `description`

---

### User Profile Card

**Design Setup:**
- User Name (text layer)
- User Email (text layer)
- Company Name (text layer)

**API Example:**
```
https://jsonplaceholder.typicode.com/users/1
```

**Mappings:**
- User Name → `name`
- User Email → `email`
- Company Name → `company.name`

---

### Multi-Item List (Array Access)

**Design Setup:**
- Item 1 Title (text layer)
- Item 2 Title (text layer)
- Item 3 Title (text layer)

**API Example:**
```
https://jsonplaceholder.typicode.com/posts
```

**Settings:**
- Data Path: Leave empty (data is at root)

**Mappings:**
- Item 1 Title → `[0].title`
- Item 2 Title → `[1].title`
- Item 3 Title → `[2].title`

---

## Tips & Tricks

### 1. Use Data Path for Nested APIs

If your API returns:
```json
{
  "data": {
    "items": [...]
  }
}
```

Set **Data Path** to `data.items` in the Connect tab, then you can directly access items with `[0].name` instead of `data.items[0].name`

### 2. Preview Before Mapping

Always click **Preview Data** first to see the structure of your API response. This helps you understand the correct field paths.

### 3. Test Connection First

Use **Test Connection** before saving to catch any issues with:
- Wrong URL
- Missing authentication
- Network problems
- CORS issues

### 4. Name Your Layers Clearly

Use descriptive names for text layers like:
- "Product Title"
- "User Email"
- "Price Label"

This makes mappings easier to manage.

### 5. Export Configuration

Before making big changes, use **Settings** → **Export Configuration** to save your current setup.

---

## Troubleshooting

### "No connection configured"
→ Go to Connect tab and save a connection first

### "Please select a text layer first"
→ You can only map TEXT layers, not frames or other elements

### "No value found for path"
→ Check your field path spelling or use Preview Data to verify structure

### "Failed to fetch data"
→ Check internet connection and verify the API URL is accessible

---

## Advanced: Working with Your Own API

### Required API Format

Your API should return JSON data. Example:

```json
{
  "title": "My Title",
  "description": "My Description",
  "metadata": {
    "author": "John Doe"
  }
}
```

### Authentication

**Bearer Token** (JWT):
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**API Key**:
```
Key: your-secret-api-key-here
```

**Basic Auth**:
```
Credentials: username:password
```

### CORS Requirements

If you're using your own API, make sure it allows CORS from Figma:
```
Access-Control-Allow-Origin: *
```

Or specifically:
```
Access-Control-Allow-Origin: https://www.figma.com
```

---

## Keyboard Shortcuts

- **Esc** - Close plugin
- When plugin is open, switch between tabs with mouse or keyboard navigation

---

## Support

Having issues? Check:

1. README.md - Full documentation
2. GitHub Issues - Report bugs
3. Console logs - Open Developer Tools in Figma

---

## What's Next?

Try these next steps:

1. Connect to your own API
2. Create component variants with different data
3. Use Auto Sync for live updates
4. Test multi-language content
5. Share your configuration with teammates

---

Happy designing with real content! 🎨
