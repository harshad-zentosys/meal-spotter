import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    YAxis,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

interface SubscriptionStatusChartProps {
    data: any;
}

export const SubscriptionStatusChart = ({ data }: SubscriptionStatusChartProps) => (
    <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Subscription Status Overview
        </h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981">
                    {data.map((entry: any, index: number) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[entry.status] || '#8884d8'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
);      
