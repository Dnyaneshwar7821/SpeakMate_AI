# Navigation Migration TODO

- [x] Add `@react-navigation/drawer` dependency
- [ ] Refactor `src/navigation/DrawerNavigator.js` to use official Drawer Navigator
- [ ] Preserve `BottomNavigator` exactly (4 tabs only)
- [ ] Update `DrawerSidebar` to become `drawerContent` and to navigate correctly within Drawer + BottomTabs hierarchy
- [ ] Preserve active drawer item highlight based on navigation state
- [ ] Ensure drawer closes automatically after navigation (no Modal overlay)
- [ ] Ensure Android back button and gesture behavior are correct
- [ ] Ensure no React Navigation warnings
- [ ] Verify every drawer item + every bottom tab navigates successfully

