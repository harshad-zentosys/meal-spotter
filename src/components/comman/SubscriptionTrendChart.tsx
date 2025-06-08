import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface SubscriptionTrendChartProps {
    monthlyStats: any;
}

export const SubscriptionTrendChart = ({ monthlyStats }: SubscriptionTrendChartProps) => {
    return (
        <div className="bg-white rounded-2xl shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#fb923c" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
