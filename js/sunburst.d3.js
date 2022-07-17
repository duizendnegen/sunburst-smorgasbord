// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sunburst
function Sunburst(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
    path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
    id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
    parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
    children, // if hierarchical data, given a d in data, returns its children
    value, // given a node d, returns a quantitative value (for area encoding; null for count)
    sort = (a, b) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
    label, // given a node d, returns the name to display on the rectangle
    title, // given a node d, returns its hover text
    link, // given a node d, its link (if any)
    onClick, // an event that fires when a node d is clicked
    linkTarget = "_blank", // the target attribute for links (if any)
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    margin = 1, // shorthand for margins
    marginTop = margin, // top margin, in pixels
    marginRight = margin, // right margin, in pixels
    marginBottom = margin, // bottom margin, in pixels
    marginLeft = margin, // left margin, in pixels
    padding = 1, // separation between arcs
    radius = Math.min(width - marginLeft - marginRight, height - marginTop - marginBottom) / 2, // outer radius
    color = d3.interpolateRainbow, // color scheme, if any
    fill = "#1b1b1b", // fill for arcs (if no color encoding)
    fillOpacity = 1.0, // fill opacity for arcs
  } = {}) {
  
    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.

    const root = path != null ? d3.stratify().path(path)(data)
        : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
        : d3.hierarchy(data, children);
  
    // Compute the values of internal nodes by aggregating from the leaves.
    value == null ? root.count() : root.sum(d => Math.max(0, value(d)));
  
    // Sort the leaves (typically by descending value for a pleasing layout).
    if (sort != null) root.sort(sort);
  
    // Compute the partition layout. Note polar coordinates: x is angle and y is radius.
    d3.partition().size([2 * Math.PI, radius])(root);
    root.each(d => d.current = d);
  
    // Construct a color scale.
    if (color != null) {
      color = d3.scaleSequential([0, root.children.length], color).unknown(fill);
      root.children.forEach((child, i) => child.index = i);
    }
  
    // Construct an arc generator.
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 2 * padding / radius))
        .padRadius(radius / 2)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1 - padding);
  
    const svg = d3.create("svg")
        .attr("viewBox", [
          marginRight - marginLeft - width / 2,
          marginBottom - marginTop - height / 2,
          width,
          height
        ])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .attr("id", 'theImage');
  
    const cell = svg
      .selectAll("a")
      .data(root.descendants())
      .join("a")
        .attr("xlink:href", link == null ? null : d => link(d.data, d))
        .attr("target", link == null ? null : linkTarget)
        .attr("class", d => {
          if (d.parent != null) {
            return "sunburst-clickable";
          }
        });
  
    cell.append("path")
        .attr("d", d => arc(d.current))
        .attr("fill", d => {
          if(d.data.disabled || d.data.disabled === undefined && d.parent) {
            return "#000";
          }
          return color ? d3.color(color(d.ancestors().reverse()[1]?.index)).darker(1) : fill;
        })
        .attr("fill-original", d => {
          return color ? d3.color(color(d.ancestors().reverse()[1]?.index)).darker(1) : fill;
        })
        .attr("fill-opacity", fillOpacity)
        .attr("uuid", d => d.data.uuid)
        .on("click", onClick ? onClick : null);

    if (label != null) cell
      .filter(d => (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10)
      .append("text")
        .attr("transform", d => {
          if (!d.depth) return;
          const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
          const y = (d.y0 + d.y1) / 2;
          return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        })
        .attr("fill-opacity", "1")
        .attr("fill", "#fff") // Makes text in sunburst white
        .attr("dy", "0.32em")
        .text(d => label(d.data, d))
        .attr("uuid", d => d.data.uuid)
        .on("click", onClick ? onClick : null);
  
    if (title != null) cell.append("title")
        .text(d => title(d.data, d));
  
    return svg.node();
  }