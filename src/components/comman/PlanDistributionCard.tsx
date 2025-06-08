import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#fb923c', '#34d399', '#60a5fa', '#facc15', '#f87171'];

interface PlanDistributionCardProps {
  stats: any;
}

export const PlanDistributionCard = ({ stats }: PlanDistributionCardProps) => {
  return (
    <div className="">
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Plan Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.planDistribution}
              dataKey="count"
              nameKey="_id"
              outerRadius={100}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {stats.planDistribution.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
