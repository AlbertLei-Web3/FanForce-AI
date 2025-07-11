// A reusable component to display a single statistic with an icon.
// 一个可复用的组件，用于显示带图标的单项统计数据。

import { ReactNode, FC } from 'react';

interface StatCardProps {
  icon: ReactNode; // The icon to display. 要显示的图标。
  title: string; // The title of the statistic. 统计数据的标题。
  value: string | number; // The value of the statistic. 统计数据的值。
}

const StatCard: FC<StatCardProps> = ({ icon, title, value }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 flex items-center">
      <div className="bg-gray-700 rounded-full p-3 mr-4">
        <span className="text-xl text-white">{icon}</span>
      </div>
      <div>
        <h4 className="text-sm text-gray-400 font-medium">{title}</h4>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatCard; 