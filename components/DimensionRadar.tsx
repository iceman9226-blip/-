import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Dimension } from '../types';

interface Props {
  data: {
    [key in Dimension]: number;
  };
}

const DimensionRadar: React.FC<Props> = ({ data }) => {
  const chartData = [
    { subject: Dimension.OPERABILITY, A: data[Dimension.OPERABILITY], fullMark: 10 },
    { subject: Dimension.LEARNABILITY, A: data[Dimension.LEARNABILITY], fullMark: 10 },
    { subject: Dimension.CLARITY, A: data[Dimension.CLARITY], fullMark: 10 },
  ];

  // Custom tick component to render dimension name and score
  const CustomTick = ({ payload, x, y, textAnchor, stroke, radius }: any) => {
    const dataPoint = chartData.find(d => d.subject === payload.value);
    const score = dataPoint ? dataPoint.A : 0;
    
    return (
      <g className="recharts-layer recharts-polar-angle-axis-tick">
        <text
          radius={radius}
          stroke={stroke}
          x={x}
          y={y}
          className="recharts-text recharts-polar-angle-axis-tick-value"
          textAnchor={textAnchor}
        >
          <tspan x={x} dy="0em" fill="#334155" fontSize="13" fontWeight="500">{payload.value}</tspan>
          <tspan x={x} dy="1.4em" fill="#1e293b" fontSize="15" fontWeight="700">{score}</tspan>
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-64 outline-none">
      <ResponsiveContainer width="100%" height="100%" className="outline-none">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
          <PolarGrid gridType="circle" stroke="#cbd5e1" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={(props) => <CustomTick {...props} />}
          />
          <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="得分"
            dataKey="A"
            stroke="#f97316" 
            strokeWidth={2}
            fill="#fdba74"
            fillOpacity={0.4}
            isAnimationActive={true}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DimensionRadar;