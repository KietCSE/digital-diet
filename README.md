# Digital Diet

Build a browser extension that helps users detox from the internet by reducing the time they spend on distracting websites. 
Target Browsers: Chrome, Firefox, Safari, Opera, Edge.

Success Criteria:
- Good UI/UX: The extension should be easy to use and visually appealing.
- Customizable: Users should be able to add/remove websites from the list of distracting websites.
- Time Tracking: The extension should track the time spent on each website.
- **Rate of users do not delete the extension within a week of installing it >= 70%**

## Build project
```sh
npm run build
```

## Run project 
```sh
npm run dev
```

## Project structure

```py
📦src
 ┣ 📂background                 # Event handler run in background of extension
 ┣ 📂components                 # Reusable components across the popup 
 ┣ 📂content                    # Interact with web browser inferface
 ┣ 📂pages                      # Each page for popup screen 
 ┣ 📂popup                      # Popup screen 
 ┗ 📜mainfest.json              # Config-file for extension
```
