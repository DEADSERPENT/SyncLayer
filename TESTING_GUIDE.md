# Testing Guide - RTCS Plugin

## 🧪 Step-by-Step Testing

Follow these steps **exactly** to test the plugin and verify it's working:

---

## ✅ **Step 1: Load the Plugin**

1. Open **Figma Desktop App** (not web browser)
2. Go to `Plugins` → `Development` → `Import plugin from manifest...`
3. Select `manifest.json` from this folder
4. You should see: "Real-Time Content Sync (RTCS)" added

**Expected Result:** Plugin appears in your plugins list

---

## ✅ **Step 2: Create Test Design**

1. Create a **new Figma file**
2. Press **T** to create a text layer
3. Type some placeholder text like "Title Here"
4. Make sure the text layer is still **selected**

**Expected Result:** You have a text layer selected

---

## ✅ **Step 3: Run the Plugin**

1. Go to `Plugins` → `Development` → `Real-Time Content Sync (RTCS)`
2. Plugin window opens

**Expected Result:** You see the plugin UI with 4 tabs (Connect, Sync, Mapping, Settings)

---

## ✅ **Step 4: Connect to API**

1. Stay in the **Connect** tab
2. Fill in these details:

   ```
   Source Type: REST API
   API URL: https://jsonplaceholder.typicode.com/posts/1
   Authentication: None
   Data Path: (leave empty)
   ```

3. Click **Test Connection**
4. Wait for the message

**Expected Result:**
- Green success message: "Connection successful! Found XXX bytes of data."
- If you get an error, check your internet connection

5. Click **Save & Connect**

**Expected Result:**
- Success message: "Connected successfully!"
- Connection Status badge turns **green** "Connected"
- Connected Source shows the URL

---

## ✅ **Step 5: Preview Data (Important!)**

1. Go to the **Sync** tab
2. Click **Preview Data**

**Expected Result:**
- You see a JSON preview box appear
- It should show something like:
  ```json
  {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere...",
    "body": "quia et suscipit..."
  }
  ```

**This step confirms data is loaded! Without data, mapping won't work.**

---

## ✅ **Step 6: Create Mapping**

1. Go to the **Mapping** tab
2. **IMPORTANT:** Go back to Figma and **select your text layer**
3. Come back to the plugin window
4. In the "Data Field Path" box, enter: `title`
5. Click **Map Selected Layer**

**Expected Result:**
- Success message: "Mapped 'Title Here' to 'title' - Text updated!"
- Your text layer in Figma should **immediately change** to show the API data
- The text should now say something like: "sunt aut facere repellat provident..."

**If it doesn't work, you'll see an error message like:**
- "No data available. Please connect and sync data first." → Go back to Step 4
- "Please select a text layer first" → Make sure text layer is selected in Figma
- "No value found for path" → Check your field path spelling

---

## ✅ **Step 7: Test Other Fields**

Create more text layers and try these mappings:

| Text Layer | Field Path | Expected Result |
|------------|-----------|-----------------|
| Body Text | `body` | Long paragraph text |
| User ID | `userId` | Number "1" |
| Post ID | `id` | Number "1" |

---

## 🐛 **Troubleshooting Common Issues**

### ❌ **Issue: "No data available. Please connect and sync data first."**

**Solution:**
1. Go to **Connect** tab
2. Click **Test Connection** first
3. Then click **Save & Connect**
4. Go to **Sync** tab
5. Click **Sync Now**
6. Now try mapping again

---

### ❌ **Issue: "Please select a text layer first"**

**Solution:**
1. Close the plugin
2. In Figma, click on your text layer
3. Reopen the plugin
4. Try mapping again

**Or:**
- Keep the plugin open
- Click in Figma
- Select the text layer
- Come back to plugin and try again

---

### ❌ **Issue: "No value found for path..."**

**Solution:**
1. Go to **Sync** tab
2. Click **Preview Data**
3. Look at the JSON structure
4. Use the exact field names you see
5. Common paths:
   - `title` (not `Title` or `name`)
   - `body` (not `content`)
   - `userId` (not `user_id`)

---

### ❌ **Issue: "Selected layer must be a text layer"**

**Solution:**
- You selected a Frame, Group, or Shape
- Only **TEXT** layers can be mapped
- Press **T** in Figma to create a text layer
- Select it and try again

---

### ❌ **Issue: Text doesn't update after mapping**

**Solution:**
1. Open Figma's Developer Console:
   - `Plugins` → `Development` → `Open Console`
2. Look for error messages
3. Common issues:
   - Font loading error → Try changing the font in Figma first
   - Permission error → Make sure text layer isn't locked

---

### ❌ **Issue: "Invalid field path format"**

**Solution:**
- Field paths can only contain:
  - Letters (a-z, A-Z)
  - Numbers (0-9)
  - Dots (.)
  - Brackets ([])
  - Underscores (_)

- **Valid examples:**
  ```
  title
  user.name
  items[0].title
  data.users[1].email
  ```

- **Invalid examples:**
  ```
  title!          ❌ (no special chars)
  user name       ❌ (no spaces)
  title?          ❌ (no question marks)
  ```

---

## 🔄 **Testing Sync**

After creating mappings:

1. Go to **Sync** tab
2. Change the API URL in **Connect** tab to a different endpoint
   - Example: `https://jsonplaceholder.typicode.com/posts/2`
3. Click **Save & Connect**
4. Go to **Sync** tab
5. Click **Sync Now**

**Expected Result:** All mapped text layers update with new data

---

## 🌍 **Testing with Different APIs**

Try these public APIs:

### **User Profile**
```
URL: https://jsonplaceholder.typicode.com/users/1
Field Paths:
- name
- email
- company.name
- address.city
```

### **Product Data**
```
URL: https://dummyjson.com/products/1
Field Paths:
- title
- price
- description
- rating
- brand
```

### **Random User**
```
URL: https://randomuser.me/api/
Data Path: results[0]
Field Paths:
- name.first
- name.last
- email
- location.city
```

---

## ✅ **Success Checklist**

After testing, you should be able to:

- [ ] Load the plugin in Figma
- [ ] Connect to an API successfully
- [ ] Preview JSON data
- [ ] Create a mapping that updates text immediately
- [ ] See the text layer change in real-time
- [ ] Create multiple mappings
- [ ] Sync data and see all mappings update
- [ ] See clear error messages if something goes wrong

---

## 📊 **Expected Behavior**

### **What SHOULD Happen:**
✅ Text updates **immediately** when you click "Map Selected Layer"
✅ You see a **success message** in green
✅ The mapping appears in the **Active Mappings** list
✅ Clicking **Sync Now** updates all mapped layers

### **What Should NOT Happen:**
❌ No error messages but text doesn't change
❌ Blank/empty error messages
❌ Plugin crashes or freezes
❌ Text disappears

---

## 🎥 **Demo Workflow**

Perfect test flow:

```
1. Create text layer → Select it
2. Run plugin → Go to Connect tab
3. Enter: https://jsonplaceholder.typicode.com/posts/1
4. Click Test Connection (wait for success)
5. Click Save & Connect
6. Go to Sync tab → Click Preview Data (verify JSON shows)
7. Go to Mapping tab
8. Make sure text layer is still selected
9. Enter: title
10. Click Map Selected Layer
11. ✅ Text changes immediately!
```

---

## 🆘 **Still Not Working?**

1. **Reload the plugin:**
   - `Plugins` → `Development` → Right-click → `Reload plugin`

2. **Check Developer Console:**
   - `Plugins` → `Development` → `Open Console`
   - Look for red error messages

3. **Verify Internet:**
   - Test the API URL in your browser first

4. **Check Figma version:**
   - Update to latest Figma Desktop

5. **Reinstall:**
   - Remove plugin
   - Import manifest.json again

---

## 📝 **Report Issues**

If still not working, please provide:
- Error message (exact text)
- API URL you're using
- Field path you're trying
- Type of layer selected
- Console errors (if any)

---

**Happy Testing!** 🎉
