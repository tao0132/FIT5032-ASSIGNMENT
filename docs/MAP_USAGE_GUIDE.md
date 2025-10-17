# 🗺️ Map Feature Usage Guide

## Quick Start Guide for Users

### Accessing the Map
1. Navigate to the **Map** page from the main menu
2. Allow location access when prompted by your browser

---

## 📍 Feature 1: Finding Your Location

### Automatic Location Detection
- The map **automatically** tries to get your location when it loads
- You'll see a **📍 marker** at your position
- The map will **fly to** your location smoothly

### Manual Location Refresh
1. Click the **"📍 Find My Location"** button in the control panel
2. Grant permission if prompted
3. Your marker will update to your current position

### What You'll See
- **Animated pulse effect** on your location marker
- Your **coordinates** displayed in the control panel
- Map **centered** on your location

---

## 📏 Feature 2: Viewing Distances

### Automatic Distance Calculation
Once your location is detected:
- Each coach marker will show **distance in kilometers**
- Distance is calculated using the **Haversine formula** (accurate geodesic distance)
- Updates automatically when your location changes

### How to View
1. Click on any **coach marker** (red pin icon)
2. A popup will appear showing:
   - Coach name
   - Specializations
   - **📍 Distance: X.XX km away**
   - "Get Directions" button

---

## 🧭 Feature 3: Getting Directions

### Step-by-Step Instructions

1. **Click a coach marker** on the map
2. In the popup, click **"🧭 Get Directions"**
3. The system will:
   - Draw a **blue route line** on the map
   - Show an alert with:
     - **Distance** (e.g., 5.2 km)
     - **Duration** (e.g., 12 minutes)
   - Automatically **zoom** to show the entire route

### Understanding the Route
- **Blue line** = Your driving route
- **Thicker line** = Main road
- Route is **optimized** for driving

### Clearing the Route
- Click **"🗑️ Clear Route"** button in the control panel
- The route line will disappear
- Map returns to normal view

---

## 🔍 Feature 4: Searching Places

### Using the Search Bar
1. Find the **search bar** at the top of the map
2. Start typing:
   - Street addresses
   - City names
   - Landmarks
   - Business names

3. Select from **autocomplete suggestions**
4. Map will fly to the selected location

### Search Tips
- Be specific for better results
- Use full addresses when possible
- Try different search terms if needed

---

## 🎮 Map Controls

### Built-in Controls (Top Right)

1. **➕ ➖ Zoom Buttons**
   - Click to zoom in/out
   - Or use mouse scroll wheel

2. **🧭 Compass**
   - Click to reset map rotation
   - Drag to rotate map

3. **📍 Geolocate Button**
   - Alternative way to center on your location
   - Shows your heading direction

---

## 💡 Tips & Best Practices

### For Best Experience

✅ **Enable GPS:**
- Use GPS (not WiFi) for better accuracy
- Allow "High Accuracy" mode

✅ **Internet Connection:**
- Stable connection required for:
  - Route calculations
  - Map tiles loading
  - Search functionality

✅ **Browser Permissions:**
- Grant location access when prompted
- Check browser settings if blocked

### Troubleshooting

❌ **"Unable to get location" error:**
- Check browser permissions
- Enable location services on your device
- Try the geolocate button (top right)

❌ **"Failed to get directions" error:**
- Ensure you have internet connection
- Check if your location is detected
- Try refreshing the page

❌ **Markers not showing:**
- Wait for map to fully load
- Check if coaches have location data in database
- Refresh the page

---

## 🌟 Use Cases

### Scenario 1: Finding Nearest Coach
1. Open map and allow location access
2. View all coach markers with distances
3. Identify the closest coach
4. Click "Get Directions" to navigate

### Scenario 2: Planning a Visit
1. Search for your current area
2. Compare coach locations and distances
3. Get directions to your chosen coach
4. Note the travel time before leaving

### Scenario 3: Exploring the Area
1. Use search to find nearby gyms or parks
2. See which coaches are in that area
3. Plan your route accordingly

---

## 🔒 Privacy & Security

### Your Location Data
- ✅ Used **only** for map display
- ✅ **Not stored** in any database
- ✅ **Not shared** with third parties
- ✅ Stays in your browser **session only**

### What We Access
- **GPS coordinates** (with your permission)
- **Map interactions** (for display purposes)
- **Nothing else**

---

## 📱 Mobile Users

### Touch Gestures
- **Pinch** to zoom in/out
- **Drag** with one finger to pan
- **Two-finger rotate** to rotate map
- **Tap** markers to view info

### Mobile Tips
- Enable high-accuracy location
- Use in areas with good GPS signal
- Portrait mode works best

---

## 🆘 Support

### Common Questions

**Q: Why isn't my location showing?**
A: Check browser permissions and enable location services.

**Q: How accurate is the distance?**
A: Very accurate! Uses Haversine formula for geodesic calculations.

**Q: Can I save routes?**
A: Currently not supported, but planned for future updates.

**Q: Does it work offline?**
A: No, requires internet for map tiles and directions API.

---

## 🎯 Getting the Most Out of the Map

### Power User Tips

1. **Combo Search + Directions:**
   - Search for a landmark near coach
   - Then get directions to coach

2. **Compare Multiple Coaches:**
   - Check distances to several coaches
   - Choose based on convenience

3. **Use Control Panel:**
   - Quick access to refresh location
   - Easy route clearing

4. **Explore Features List:**
   - See all available capabilities
   - Try each feature

---

## 🚀 What's Next?

### Upcoming Features (Planned)
- 🚶 Walking directions
- 🚴 Cycling routes
- 🚌 Public transit options
- 📊 Route comparison
- ⭐ Favorite locations
- 📱 Mobile app version

---

**Happy Mapping! 🗺️**

For technical documentation, see [MAP_FEATURES.md](./MAP_FEATURES.md)

