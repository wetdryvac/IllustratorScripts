/**********************************************************

ADOBE SYSTEMS INCORPORATED 
Copyright 2005-2012 Adobe Systems Incorporated 
All Rights Reserved 

NOTICE:  Adobe permits you to use, modify, and 
distribute this file in accordance with the terms
of the Adobe license agreement accompanying it.  
If you have received this file from a source 
other than Adobe, then your use, modification,
or distribution of it requires the prior 
written permission of Adobe. 

*********************************************************/

/**********************************************************
 
Based on ImageTracing.jsx and a few other online sources. Recoded a bit for cleaner.

DESCRIPTION

This is a kludge. Anyone who knows what they're doing can probably do this better. What it does:

1) Select source and destination folders, and for each compatible file in the source folder
    -Compatible files are by type, case sensitive (Much to my surprise a couple times)
2) Load file to 10Kx10K pixel artboard
3) Fit art to board proportionally, filling it. Proportionally, this usually saves over by a few pixels
4) Export specified file type to destination folder

Things I may get to, but probably won't: Dialogue to set specific art output sizes.

**********************************************************/

//Goal: Adapt  tracing script to trace an image using a specifc preset rather than the default one. Included jp2 as a valid file type.
//Export both the .ai for use later, and ,jpg, .png, .tiff etc. for print production

// Main Code [Execution of script begins here]

// uncomment to suppress Illustrator warning dialogs
// app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

// Collectable files

var COLLECTABLE_EXTENSIONS = ["bmp", "gif", "giff", "jpeg", "jpg", "pct", "pic", "psd", "png", "tif", "tiff","jp2"];
   
var destFolder, sourceFolder;

// Select the source folder
sourceFolder = Folder.selectDialog( 'Select the SOURCE folder...', '~' );
//sourceFolder = new Folder("C:/Users/<Username>/Desktop/1");

if(sourceFolder != null)
{
    // Select the destination folder
    destFolder = Folder.selectDialog( 'Select the DESTINATION folder...', '~' );        
    //destFolder = new Folder("C:/Users/<Username>/Desktop/2");
}

if(sourceFolder != null && destFolder != null)
{
        //getting the list of the files from the input folder
        var fileList = sourceFolder.getFiles();
        var errorList;
        var tracingPresets = app.tracingPresetsList;
        
        //show the available presets. rem out to avoid the alert.
        //alert( app.tracingPresetsList );

        for (var i=0; i<fileList.length; ++i)
        {
            if (fileList[i] instanceof File)
            {
                 try
                 {                
                        var fileExt = String(fileList[i]).split (".").pop();
                        if(isTraceable(fileExt) != true)
                            continue;
                        
                        // Trace the files by placing them in the document.
                        // Add a document in the app of 10000x10000 points
                        // Change the 10000,10000 below to a different doc size if desired
                        // Art (files imported) will be fit proportionally to artboard
                        // Remove stuff in paren for default doc size
                        
                        var doc = app.documents.add( null , 10000,10000);
                        
                        // Add a placed item
                        var p = doc.placedItems.add();
                        p.file = new File(fileList[i]);
                        
                       //Resize object to fit artboard
                        
                                // Current document and selection:
                                var activeDoc = app.activeDocument,
                                    selection = activeDoc.selection;
                                 
                                // Check if anything is selected:
                                if (selection.length > 0) {
                                 
                                  // Loop over selected items:
                                  for (ii = 0; ii < selection.length; ii++) {
                                 
                                    var item       = selection[ii].duplicate(),
                                        abActive   = activeDoc.artboards[
                                                       activeDoc.artboards.getActiveArtboardIndex()
                                                     ],
                                        abProps    = getArtboardBounds(abActive),
                                        boundsDiff = itemBoundsDiff(selection[ii]);
                                 
                                    // Scale object to fit artboard:
                                    fitItem(item, abProps, boundsDiff);
                                 
                                  }
                                 
                                } else {
                                  alert("Select an object before running this script.");
                                }
                                 
                                // Artboard bounds helper (used above):
                                function getArtboardBounds(artboard) {
                                 
                                  var bounds = artboard.artboardRect,
                                 
                                      left   = bounds[0],
                                      top    = bounds[1],
                                      right  = bounds[2],
                                      bottom = bounds[3],
                                 
                                      width  = right - left,
                                      height = top - bottom,
                                 
                                      props  = {
                                        left   : left,
                                        top    : top,
                                        width  : width,
                                        height : height
                                      };
                                 
                                  return props;
                                }
                                 
                                // Bounds difference helper (used at the top):
                                function itemBoundsDiff(item) {
                                 
                                  var itemVB = item.visibleBounds,
                                      itemVW = itemVB[2] - itemVB[0],
                                      itemVH = itemVB[1] - itemVB[3],
                                 
                                      itemGB = item.geometricBounds,
                                      itemGW = itemGB[2] - itemGB[0],
                                      itemGH = itemGB[1] - itemGB[3],
                                 
                                      deltaX = itemVW - itemGW,
                                      deltaY = itemVH - itemGH,
                                 
                                      diff   = {
                                        deltaX: deltaX,
                                        deltaY: deltaY
                                      };
                                 
                                    return diff;
                                }
                                 
                                 
                                 
                                // Fit item helper (used at the top):
                                function fitItem(item, props, diff) {
                                 
                                  // Cache current values:
                                  var oldWidth  = item.width; // alert(oldWidth);
                                  var oldHeight = item.height; // alert(oldHeight);
                                 
                                  // Wide or tall?
                                  if (item.width > item.height) {
                                 
                                    // alert('wide');
                                    item.width = props.width - diff.deltaX;
                                 
                                    // Scale height using ratio from width:
                                    var ratioW  = item.width / oldWidth;
                                    item.height = oldHeight * ratioW;
                                 
                                  } else {
                                 
                                    // alert('tall');
                                    item.height = props.height - diff.deltaY;
                                 
                                    // Scale width using ratio from height:
                                    var ratioH = item.height / oldHeight;
                                    item.width = oldWidth * ratioH;
                                 
                                  }
                                 
                                  // Center:
                                  item.top  = 10000 - ((props.height / 2) - (item.height / 2));
                                  item.left = (props.width / 2) - (item.width / 2);
                                 
                                  // Deselect: and remove original item
                                  item.selected = false;
                                  app.cut();
                                  
                                  // Select all
                                  var currentLayer = activeDoc.layers[0];
                                  currentLayer.hasSelectedArtwork = true;
                                 
                                }

                        // Trace the placed item using present number 24. Illustrator is a pain as regards tracing presents - you have to count your way to the correct preset.
                        // Best solution I've found to get this script to use a specific setting is to create a new preset and save a specific group of settings to that preset
                        // Thus, for a specific graphic series, I create a custom tracing preset, save that, and then save again to the  preset this script calls
                        // Yes, I am terrible at this.
                        
                        var pp = item;
                        var t = pp.trace();
                        t.tracing.tracingOptions.loadFromPreset(tracingPresets[24]);
                        app.redraw();
                        
                        //Export file
 
                        var destFileName = fileList[i].name.substring(0, fileList[i].name.length - fileExt.length-1) + "_" +fileExt;
                        var outfile = new File(destFolder+"/"+destFileName);

                            //Set export options for JPG - rem out if no JPG wanted.
                            //1:1 document pint size to pixel size is a scale of 100.

                                var exportOptions = new ExportOptionsJPEG();
                                var type = ExportType.JPEG;
                                var fileSpec = new File(destFolder+"/"+destFileName);

                                exportOptions.horizontalScale = 100;
                                exportOptions.verticalScale = 100;
                                exportOptions.antiAliasing = false;
                                exportOptions.qualitySetting = 70;
                                app.activeDocument.exportFile( fileSpec, type, exportOptions ); 
                            
                            //Set export options for PNG - rem out if no PNG wanted.
                            //300 dip PNG

                                //var options = new ExportOptionsPNG24();
                                //var type = ExportType.PNG24;
                                //var fileSpec = new File(destFolder+"/"+destFileName);
                                
                                //options.antiAliasing = true;
                                //options.transparency = true;
                                //options.artBoardClipping = true;
                                //options.verticalScale = 416.667;
                                //options.horizontalScale = 416.667;
                                //app.activeDocument.exportFile( fileSpec, type, exportOptions ); 
                        
                        //Saving Options
                        //doc.saveAs(outfile);
                        //doc.close(SaveOptions.SAVECHANGES);
                        doc.close(SaveOptions.DONOTSAVECHANGES);
                }
                catch (err)
                {
                        errorStr = ("Error while tracing "+ fileList[i].name  +".\n" + (err.number & 0xFFFF) + ", " + err.description);
                        // alert(errorStr);
                        errorList += fileList[i].name + " ";
                }
            }
       }
       fileList = null;
       alert("Batch process complete.");
}
else
{
       alert("Batch process aborted.");
}

 sourceFolder = null;
 destFolder = null;
 
function isTraceable(ext)
 {
     var result = false;
     for (var i=0; i<COLLECTABLE_EXTENSIONS.length; ++i)
     {
          if(ext == COLLECTABLE_EXTENSIONS[i])
          {
            result = true;
            break;
          }
    }
    return result;
}	
