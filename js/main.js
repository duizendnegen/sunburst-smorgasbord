const mainWidth = 1152;
const mainHeight = 1152;

function getDisabledState(d) {
  if (d.data.disabled || d.data.disabled === undefined) {
    return true;
  }
  
  if (d.parent) {
    return getDisabledState(d.parent);
  }

  return false;
}

function setDisabledState(disabled, d) {
  d.data.disabled = disabled;

  const target = d3.select("path[uuid='" + d.data.uuid + "']");
  let color = disabled ? "#000" : target.attr("fill-original");
  target.attr("fill", color);
}

function setAndPropagateDisabledState(disabled, d) {
  // don't allow the root element to be disabled
  if(d.parent == null) {
    return;
  }

  setDisabledState(disabled, d);

  if (d.children) {
    d.children.forEach(function(child) {
      setAndPropagateDisabledState(disabled, child);
    });
  }
}

d3.json("/assets/autoingredients.json")
  .then(function (flare) {
    let chart = Sunburst(flare, {
      id: d => d.uuid,
      label: d => d.name, // display name for each cell
      title: (d, n) => d.name, // hover text
      value: d => d.value,
      width: mainWidth,
      height: mainHeight,
      onClick: (_, d) => {
        // don't allow the root element to be disabled
        if(d.parent == null) {
          return;
        }

        let disabled = d.data.disabled === undefined ? false : !d.data.disabled;

        if (!disabled) {
          parent = d.parent;

          do {
            setDisabledState(false, parent)
          } while (parent = parent.parent)
        }

        setAndPropagateDisabledState(disabled, d);
      },
    });

    document.querySelector("#sunburstContainer")
      .appendChild(chart);

    
    //PNG EXPORT FUNCTIONALITY
    // Set-up the export button
    d3.select('#saveButton').on('click', function () {
      // deep clone the image and process to hide disabled elements
      let nodes = document.getElementById('theImage').cloneNode(true);
      nodes.querySelectorAll("path[fill='#000']").forEach(function(path) {
        path.setAttribute('fill-opacity', 0);
        var uuid = path.getAttribute('uuid');
        nodes.querySelector("text[uuid='"+uuid+"'").setAttribute('fill-opacity', 0);
      });

      let svgString = getSVGString(nodes);

      svgString2Image(svgString, 2 * mainWidth, 2 * mainHeight, 'png', save); // passes Blob and filesize String to the callback

      function save(dataBlob, filesize) {
        saveAs(dataBlob, 'sunburst-smorgasbord.png'); // FileSaver.js function
      }
    });

    // Below are the functions that handle actual exporting:
    // getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
    function getSVGString(svgNode) {
      svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
      let cssStyleText = getCSSStyles(svgNode);
      appendCSS(cssStyleText, svgNode);

      let serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgNode);
      svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
      svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

      return svgString;

      function getCSSStyles(parentElement) {
        let selectorTextArr = [];

        // Add Parent element Id and Classes to the list
        selectorTextArr.push('#' + parentElement.id);
        for (let c = 0; c < parentElement.classList.length; c++)
          if (!contains('.' + parentElement.classList[c], selectorTextArr))
            selectorTextArr.push('.' + parentElement.classList[c]);

        // Add Children element Ids and Classes to the list
        let nodes = parentElement.getElementsByTagName("*");
        for (let i = 0; i < nodes.length; i++) {
          let id = nodes[i].id;
          if (!contains('#' + id, selectorTextArr))
            selectorTextArr.push('#' + id);

          let classes = nodes[i].classList;
          for (let c = 0; c < classes.length; c++)
            if (!contains('.' + classes[c], selectorTextArr))
              selectorTextArr.push('.' + classes[c]);
        }

        // Extract CSS Rules
        let extractedCSSText = "";
        for (let i = 0; i < document.styleSheets.length; i++) {
          let s = document.styleSheets[i];

          try {
            if (!s.cssRules) continue;
          } catch (e) {
            if (e.name !== 'SecurityError') throw e; // for Firefox
            continue;
          }

          var cssRules = s.cssRules;
          for (let r = 0; r < cssRules.length; r++) {
            if (contains(cssRules[r].selectorText, selectorTextArr))
              extractedCSSText += cssRules[r].cssText;
          }
        }

        return extractedCSSText;

        function contains(str, arr) {
          return arr.indexOf(str) === -1 ? false : true;
        }
      }

      function appendCSS(cssText, element) {
        let styleElement = document.createElement("style");
        styleElement.setAttribute("type", "text/css");
        styleElement.innerHTML = cssText;
        let refNode = element.hasChildNodes() ? element.children[0] : null;
        element.insertBefore(styleElement, refNode);
      }
    }

    function svgString2Image(svgString, width, height, imageFormat, callback) {
      const format = imageFormat ? imageFormat : 'png';

      let imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

      let canvas = document.createElement("canvas");
      let context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

      let image = new Image();
      image.onload = function () {
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob(function (blob) {
          let filesize = Math.round(blob.length / 1024) + ' KB';
          if (callback) callback(blob, filesize);
        });


      };

      image.src = imgsrc;
    }
  });