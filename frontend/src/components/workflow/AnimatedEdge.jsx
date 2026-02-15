import React from 'react';
import { BaseEdge, getSmoothStepPath } from '@xyflow/react';
import './AnimatedEdge.css';

export function AnimatedEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const active = data?.active === true;

  return (
    <>
      <BaseEdge id={id} path={path} />
      {active && <path d={path} className="animatedEdge_activePath" />}
    </>
  );
}
