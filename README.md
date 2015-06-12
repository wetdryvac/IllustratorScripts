# IllustratorScripts
Modified Scripts for Illustrator CC, typically project specific. Place script of choice in AI scritps director, restart AI.

1) Update Image Tracing Current - 10000 Point Doc Size - Fit Art To Doc and Export

  Based loosely on the basic image trace sample script, as well as chunks of resize/fit/export scripts.
  Operates as follows
  
  a) Select Source and Destination folders - source folder should have AI compatible graphics files.
  b) Loads image to (default 10Kx10k pixel) artboard
  c) Traces image using numbered trace preset
    i) You'll have to manually count your way to the preset you want.
    ii) Having a standard preset name to which you save other presets to when needed is a kludge, but works.
  d) Resize image to fit artboard. Typically overruns by a pixel or seven.
  e) Export to file(s) - JPG is defaule, and code for PNG is in the script commented out.
