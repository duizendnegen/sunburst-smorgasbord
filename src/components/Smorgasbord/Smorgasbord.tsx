import { useState } from 'react';
import { useInterval } from 'usehooks-ts';

const generateDataset = () => (
  Array(10).fill(0).map(() => ([
    Math.random() * 80 + 10,
    Math.random() * 35 + 10,
  ]))
)

const Smorgasbord = () => {
  const [dataset, setDataset] = useState(
    generateDataset()
  )
  useInterval(() => {
    const newDataset = generateDataset()
    setDataset(newDataset)
  }, 2000)
  return (
    <svg viewBox="0 0 100 50">
      {dataset.map(([x, y], i) => (
        <circle
          cx={x}
          cy={y}
          r="3"
        />
      ))}
    </svg>
  )
}

export default Smorgasbord;