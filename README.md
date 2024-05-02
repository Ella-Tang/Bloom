# Bloom
Nature of Code - 24 Spring - Final Project

Description: 
Bloom is an interactive art project that invites users to experience the essence of spring through cultivating flowers and interacting with them on a digital canvas. This project uses the hand pose detection model provided by the ml5.js library. Therefore, a camera is required for hand manipulation, yet basic mouse interactions are also supported. Drawing modes can be switched.

Key Features:
- Hand Detection
  - real-time video input utilized to track user hand movements and generate graphics in response to movements
- Flowers
  - users can choose to generate flower either with completely random genes or based on those of previously selected flower; if a flower is selected, its   -   
  genetics will be passed to the newly generated flower with possibilities of mutation and randomness
  - If a new flower is generated using genes of a previously selected flower. The previously selected will gradually die out (disappear from canvas);   
  physics elements such as gravity, acceleration, and wind are involved in the process  
- Background
  - background color can be changed through the button ‘Toggle Background’
  - background turns into a randomly selected color from palette each time  
- User Interface (UI):
  - buttons: ‘Clear Canvas’, ‘Start/Pause’ drawing, ‘Toggle Background’, ‘Switch Drawing Mode’
  - message displayed when drawing mode is switched
- Audio
  - background music played while drawing

Structures:
- Video
  - used for hand detection
- layer 1
  - drawing all the graphics (flowers)
  - background can be switched using 'Switch Background' btn
  - 'clear canvas' btn clears this layer
- layer 2
  - drawing selection indicator when object selected
  - background always transparent
  - visible if a selection is made
- layer 3
  - drawing ui elements (buttons: clear canvas, start/ pause, toggle background, switch drawing mode)
  - drawing texture
  - always visible
- layer 4
  - drawing hand indicator on top of everything
  - only visible in draw mode 1 for hand detection
  - background always transparent

Credits:
- Music track: Lemonade by Kvarmez
Source: https://freetouse.com/music
Royalty Free Music for Videos (Safe)
