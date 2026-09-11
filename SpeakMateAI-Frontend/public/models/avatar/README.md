# Live2D Custom Model Folder

Place your custom Live2D models here!

## How to use a local custom Live2D model:

1. Copy your Live2D Cubism model export folder into `public/models/avatar/`
   For example:
   ```
   public/models/avatar/
   ├── my_avatar.model3.json
   ├── my_avatar.moc3
   ├── textures/
   │   └── texture_00.png
   ├── motions/
   └── physics/
   ```

2. Open `src/config/AvatarConfig.js` and change `modelPath`:
   ```javascript
   export const DEFAULT_AVATAR_CONFIG = {
     modelPath: '/models/avatar/my_avatar.model3.json',
     ...
   };
   ```
