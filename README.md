## Black shrimp

> An open source eyedropper extension for Chrome to **pick**, **save** and **organize color swatches**.  
  **Export** them as `.ase` files for programs like Illustrator or Photoshop.

**Features**
- Pick colors by clicking on the page with the eyedropper
- Create groups and organize your swatches
- Switch between `hex`, `rgb` and `hsl` color modes
- Export your collection in a `.ase` file and import it in *Photoshop* and *Illustrator*

**Install Black shrimp**  
[Black shrimp on the _Chrome Web Store_](https://chrome.google.com/webstore/detail/oggljfcldhdcoemgnamdaaaofaenefni)

![demo](https://raw.githubusercontent.com/Thomas-lhuillier/Black-shrimp/master/img/demo_screenshot.png)

**Hotkeys**
- `ALT + B` is the default key bidding to open Black shrimp  
  You can change it by browsing to `chrome://extensions/shortcuts`

While open:
- `ALT + SHIFT + A` — **A**dd a color
- `ALT + SHIFT + G` — Add **G**roup
- `ALT + SHIFT + D` — **D**elete selection
- `ALT + SHIFT + E` — **E**xport swatches

**Import `.ase` file in Photoshop, Illustrator and InDesign**  
Black shrimp exports your color swatches in Adobe Swatch Exchange files (.ase) than can be opened in Photoshop, Illustrator and InDesign.
- [Photoshop](https://helpx.adobe.com/photoshop/using/customizing-color-pickers-swatches.html#manage_swatch_libraries#manage_swatch_libraries)
- [Illustrator](https://helpx.adobe.com/illustrator/using/using-creating-swatches.html#import_swatches_from_another_document)
- [Indesign](https://helpx.adobe.com/indesign/using/swatches.html#import_swatches)


## Development

**Requirements**  
_Node_ 10+  

**Installation**  
Clone the repo, then run `npm install`.

**Commands**  
- `npm run watch` — watch code changes and build unpacked extensions  
  Once done, import the `/package` folder as an [unpacked extension](https://developer.chrome.com/extensions/getstarted#manifest)
- `npm run lint` — lint your code before any PR
- `npm run build` — build for production output packaged zip to `/build`
