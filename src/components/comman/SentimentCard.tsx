import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Smile, Frown, Meh } from "lucide-react";

export const SentimentCard = ({
  sentiment,
}: {
  sentiment: { average: string; score: number; topComment: string };
}) => {
  const Icon =
    sentiment.average === "Positive"
      ? "😀"
      : sentiment.average === "Negative"
      ? "😞"
      : "😐";

  const iconColor =
    sentiment.average === "Positive"
      ? "text-green-500"
      : sentiment.average === "Negative"
      ? "text-red-500"
      : "text-yellow-500";
    
    const bgColor = sentiment.average === "Positive"
      ? "bg-green-50"
      : sentiment.average === "Negative"
      ? "bg-red-50"
      : "bg-yellow-50";

  return (
    <Card className={`bg-white shadow-md rounded-lg border border-gray-200 max-w-sm mx-auto ${bgColor}`}>
      <CardHeader className="flex items-center justify-between border-b border-gray-100">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Customer Sentiment
        </CardTitle>
        <div className={`flex items-center justify-center text-4xl ${iconColor}`}>{Icon}</div>
      </CardHeader>

      <CardContent className="">
        <div className="text-4xl font-extrabold text-gray-900 mb-1">
          {sentiment.average}
        </div>
        <p className="text-sm text-gray-600 font-medium mb-3">
          Score: <span className="text-gray-900">{Number(sentiment.score).toFixed(2)}</span>
        </p>
        <p className="text-sm italic text-gray-500 border-l-4 border-green-400 pl-3">
          &ldquo;{sentiment.topComment}&rdquo;
        </p>
      </CardContent>
    </Card>
  );
};
