import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as d3 from "d3";
import './Smorgasbord.css';
import Flavour from "../../interfaces";
import hierarchicalNodesState from "../../states/hierarchicalNodes.selector";
import { useRecoilValue } from "recoil";
import { padding, diameter, radius } from "../../constants";

interface  SmorgasbordProps {
  onElementClick: (uuid: string) => void
}

const Smorgasbord = ({ onElementClick } : SmorgasbordProps) => {
  const { t } = useTranslation();

  const svgRef = React.useRef<SVGSVGElement>(null);
  
  const nodes = useRecoilValue(hierarchicalNodesState);
  
  const [ dragSubject, setDragSubject ] = useState<d3.HierarchyRectangularNode<Flavour>>(null);
  const [ globalRotation, setGlobalRotation ] = useState(0.0);
  const [ previousRotation, setPreviousRotation ] = useState(0.0);
  const [ dragStart, setDragStart ] = useState({x: null, y: null});
  
  // Construct an arc generator.
  const getArc = d3.arc<d3.HierarchyRectangularNode<Flavour>>()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 2 * padding / radius))
    .padRadius(radius / 2)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1 - padding);

  const getTextTransform = (d: d3.HierarchyRectangularNode<Flavour>) => {
    if (!d.depth) return;

    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2;
    let flip = ((x + globalRotation + 360) % 360) < 180;
    return `rotate(${x - 90}) translate(${y}, 0) rotate(${flip ? 0 : 180})`;
  }

  const getGTransform = (d: d3.HierarchyRectangularNode<Flavour>) => {
    if (!d.depth) return;

    return `rotate(${globalRotation})`;
  }

  const getColor = (d: any) => {
    if (!d.depth) { // root node is not clickable & has a distinct colour
      return "#1F1F1F";
    } else if (d.data.state === 'NO') {
      return "#000";
    } else if (d.data.state === 'MAYBE') {
      return d.color.darker(3).toString();
    } else {
      return d.color.darker(1).toString();
    }
  }

  const calculateRotationFor = (clickX, clickY) => {
    let rootClientRect = document.getElementsByClassName('flavour-root-node')[0].getBoundingClientRect();
    let rootCenterX = rootClientRect.left + ((rootClientRect.right - rootClientRect.left) / 2);
    let rootCenterY = rootClientRect.top + ((rootClientRect.bottom - rootClientRect.top) / 2);

    let x = clickX - rootCenterX;
    let y = clickY - rootCenterY;

    let currentAngle = Math.atan2(y, x);
    let currentRotation = (180 / Math.PI * currentAngle) + 90;

    return currentRotation;
  }

  const startDrag = (e, d: d3.HierarchyRectangularNode<Flavour>) => {
    let currentRotation = calculateRotationFor(e.clientX, e.clientY);

    setDragSubject(d);
    setDragStart({x: e.clientX, y: e.clientY});
    setPreviousRotation(currentRotation);
  }

  const updateDrag = (e) => {
    if (dragSubject) {
      let currentRotation = calculateRotationFor(e.clientX, e.clientY);
      let diff = currentRotation - previousRotation;
      setPreviousRotation(currentRotation);
      setGlobalRotation(globalRotation + diff);
    }
  }

  const endDrag = (e, d: d3.HierarchyRectangularNode<Flavour>) => {
    if (d && d.depth && e.clientX === dragStart.x && e.clientY === dragStart.y) {
      onElementClick(d.data.uuid);
    }

    setDragSubject(null);
  }

  return <svg
    xmlns="http://www.w3.org/2000/svg"
    ref={svgRef}
    width={diameter}
    height={diameter}
    viewBox="-576 -576 1152 1152"
    id='smorgasbordImage'
    // only listen to mouse move event; touch screen moves get confused between scrolling and rotating
    // TODO should implement a different gesture for mobile
    onMouseMove={(e) => { updateDrag(e) }} 
    onPointerUp={(e) => { endDrag(e, null) }}
    onPointerLeave={(e) => { endDrag(e, null) }}>
    {nodes
      .map((d, i) => (
        <g key={d.data.uuid}
          onPointerDown={(e) => { startDrag(e, d) }}
          onPointerUp={(e) => { endDrag(e, d) }}
          className={d.parent === null ? 'flavour-root-node' : ''}
          transform={getGTransform(d)}>
          <path
            d={getArc(d)}
            fill={getColor(d)}
            fillOpacity="1.0">
          </path>
          <text
            transform={getTextTransform(d)}
            fill="#fff"
            fillOpacity="1.0"
            dy="0.32em"
            style={{fontFamily: 'sans-serif', fontSize: '12px', textAnchor: 'middle'}}>
            { d.data.key ? t('flavours.' + d.data.key) : d.data.name }
          </text>
        </g>
      ))}
  </svg>;
}

export default Smorgasbord;