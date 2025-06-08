import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Subscription from "@/models/Subscription";
import Review from "@/models/Review";
import { SentimentIntensityAnalyzer } from "vader-sentiment"; // use locally
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: Promise<{ messId: string }> }) {
  try {
    await connectToDatabase();
    const { messId } = await params;

    const reviews = await Review.find({ messId }).sort({ createdAt: -1 }).limit(10);
    const sentiments = reviews.map(r => {
      const commentSentiment = SentimentIntensityAnalyzer.polarity_scores(r.comment || "");
      // Convert rating (1-5) to sentiment scale (-1 to 1)
      const ratingSentiment = (r.rating - 3) / 2;
      // Combine both sentiments with equal weight
      return {
        compound: (commentSentiment.compound + ratingSentiment) / 2,
        pos: (commentSentiment.pos + (ratingSentiment > 0 ? ratingSentiment : 0)) / 2,
        neg: (commentSentiment.neg + (ratingSentiment < 0 ? -ratingSentiment : 0)) / 2,
        neu: (commentSentiment.neu + (ratingSentiment === 0 ? 1 : 0)) / 2
      };
    });

    const avgSentiment = sentiments.reduce((sum, s) => sum + s.compound, 0) / sentiments.length;
    const topComment = reviews.find(r => SentimentIntensityAnalyzer.polarity_scores(r.comment).compound > 0.6)?.comment;

    const topPlans = await Subscription.aggregate([
      { $match: { messId: new mongoose.Types.ObjectId(messId) } },
      { $group: { _id: "$planName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);

    const currentMonthSubs = await Subscription.countDocuments({ messId, startDate: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } });
    const lastMonthSubs = await Subscription.countDocuments({ messId, startDate: { $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), $lt: new Date(now.getFullYear(), now.getMonth(), 1) } });

    const growthRate = lastMonthSubs > 0 ? (((currentMonthSubs - lastMonthSubs) / lastMonthSubs) * 100).toFixed(1) : 0;

    const revenueLastMonth = await Subscription.aggregate([
      {
        $match: {
          messId: new mongoose.Types.ObjectId(messId),
          startDate: {
            $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const revenue = revenueLastMonth[0]?.total || 0;
    const predictedRevenue = currentMonthSubs > lastMonthSubs ? revenue * 1.1 : revenue;

    const result = {
      messId,
      reviewSentiment: {
        average: avgSentiment > 0.3 ? "Positive" : avgSentiment < -0.3 ? "Negative" : "Neutral",
        score: avgSentiment.toFixed(2),
        topComment: topComment || "No standout review yet"
      },
      topPlans,
      subscriptionTrend: {
        thisMonth: currentMonthSubs,
        lastMonth: lastMonthSubs,
        growthRate
      },
      revenue: {
        predictedRevenueNextMonth: Math.round(predictedRevenue),
        revenueLastMonth: revenue,
        revenueGrowthRate: lastMonthSubs > 0 ? (((predictedRevenue - revenue) / revenue) * 100).toFixed(1) : 0
      },
      reviews: reviews.map(r => ({
        id: r._id,
        rating: r.rating,
        comment: r.comment,
        userName: r.userId?.name || "Anonymous",
        createdAt: r.createdAt
      }))
    };
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error generating insights" }, { status: 500 });
  }
}
