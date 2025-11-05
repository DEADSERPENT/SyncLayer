# RTCS Installation & Testing Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Verify Build

The plugin is already built and ready! Check that these files exist:
- ✅ `manifest.json` - Plugin configuration
- ✅ `code.js` - Compiled plugin code
- ✅ `ui.html` - Plugin interface

### Step 2: Load in Figma

1. **Open Figma Desktop App**
   (Must be desktop app, not web browser)

2. **Import Plugin**
   - Click `Plugins` in the menu
   - Select `Development` → `Import plugin from manifest...`
   - Navigate to this folder
   - Select `manifest.json`
   - Click `Open`

3. **Success!**
   You should see "Real-Time Content Sync (RTCS)" in your plugin list

### Step 3: Test It!

1. **Create a test file**
   - Create a new Figma file
   - Add a text layer (press T)
   - Type "Title" as placeholder

2. **Run the plugin**
   - Go to `Plugins` → `Development` → `Real-Time Content Sync (RTCS)`
   - The plugin window opens!

3. **Connect to test API**
   - Stay in the "Connect" tab
   - Enter URL: `https://jsonplaceholder.typicode.com/posts/1`
   - Auth Type: None
   - Click **Test Connection** ✅
   - Click **Save & Connect** ✅

4. **Create your first mapping**
   - Go to "Mapping" tab
   - Select your text layer in Figma
   - Enter field path: `title`
   - Click **Map Selected Layer**
   - BOOM! Your text updates with real API data! 🎉

---

## 📁 Project Structure

```
SyncLayer/
├── manifest.json          # Figma plugin config
├── code.ts               # Source TypeScript
├── code.js               # Compiled JavaScript ✅
├── ui.html               # Plugin UI
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── README.md             # Full documentation
├── USAGE_GUIDE.md        # Quick usage guide
├── FEATURES.md           # Complete feature list
└── INSTALLATION.md       # This file
```

---

## 🔧 Development Mode

### Build Commands

```bash
# Build once
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Check for code issues
npm run lint

# Fix linting issues
npm run lint:fix
```

### Making Changes

1. Edit `code.ts` or `ui.html`
2. Run `npm run build`
3. In Figma: `Plugins` → `Development` → `Reload plugin`

---

## 🧪 Testing Examples

### Example 1: Blog Post
**API:** `https://jsonplaceholder.typicode.com/posts/1`

**Create layers:**
- Title
- Body
- User ID

**Mappings:**
- Title → `title`
- Body → `body`
- User ID → `userId`

### Example 2: User Profile
**API:** `https://jsonplaceholder.typicode.com/users/1`

**Create layers:**
- Name
- Email
- Company

**Mappings:**
- Name → `name`
- Email → `email`
- Company → `company.name`

### Example 3: Product Data
**API:** `https://dummyjson.com/products/1`

**Create layers:**
- Product Name
- Price
- Description
- Rating

**Mappings:**
- Product Name → `title`
- Price → `price`
- Description → `description`
- Rating → `rating`

---

## ❓ Troubleshooting

### Plugin won't load
- ✅ Using Figma Desktop (not web)?
- ✅ `code.js` file exists?
- ✅ Run `npm run build` first

### "Failed to fetch data"
- ✅ Internet connected?
- ✅ URL is correct?
- ✅ API is public or auth is correct?

### Mapping not updating
- ✅ Text layer selected?
- ✅ Field path is correct?
- ✅ Data synced recently?
- ✅ Try "Preview Data" to check structure

### Build errors
```bash
rm -rf node_modules
npm install
npm run build
```

---

## 🎯 Next Steps

1. ✅ Install and test with sample APIs
2. ✅ Read USAGE_GUIDE.md for detailed examples
3. ✅ Check FEATURES.md for all capabilities
4. ✅ Connect your own API
5. ✅ Create real designs with real data!

---

## 🌟 Key Features to Try

1. **Test Connection** - Always test before saving
2. **Preview Data** - See JSON structure before mapping
3. **Auto Sync** - Enable for automatic updates
4. **Multiple Mappings** - Map many layers at once
5. **Export Config** - Save your setup
6. **Language Switcher** - Test localization

---

## 📚 Documentation

- `README.md` - Complete documentation
- `USAGE_GUIDE.md` - Step-by-step guide
- `FEATURES.md` - Feature showcase
- `INSTALLATION.md` - This file

---

## 🆘 Support

**Issues?**
- Check README troubleshooting section
- Verify API URL in browser first
- Check Figma Developer Console (Plugins → Development → Open Console)

**Questions?**
- Read USAGE_GUIDE.md
- Check FEATURES.md

---

## ✨ Tips for Success

1. **Start Simple**: Use JSONPlaceholder APIs for testing
2. **Preview First**: Always check data structure before mapping
3. **Name Layers**: Use clear names for text layers
4. **Test Auth**: Test connection before adding many mappings
5. **Save Often**: Export config after setting up mappings

---

## 🎉 You're Ready!

The plugin is built, tested, and ready to use. Open Figma and start designing with real content!

**Happy designing!** 🎨
