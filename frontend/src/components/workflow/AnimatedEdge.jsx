import React from 'react';
import { BaseEdge, getSmoothStepPath } from '@xyflow/react';
import { vars } from '../../theme';

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
      {active && (
        <path
          d={path}
          fill="none"
          stroke={vars.edgeActive()}
          strokeWidth={2}
          strokeDasharray="8 4"
          style={{ animation: 'flowDash 0.6s linear infinite' }}
        />
      )}
    </>
  );
}
