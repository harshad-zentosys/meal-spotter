import { NextResponse } from "next/server";
import Subscription from "@/models/Subscription";
import mongoose, { PipelineStage } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth-options";
import Mess from "@/models/Mess";


export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        if (session.user.role !== "mess-owner") {
            return NextResponse.json(
                { error: "Only mess owners can access this endpoint" },
                { status: 403 }
            );
        }

        // Find the mess owned by the current user
        const mess = await Mess.findOne({ ownerId: session.user.id });

        if (!mess) {
            return NextResponse.json(
                { error: "Mess profile not found" },
                { status: 404 }
            );
        }

        const messId = mess._id.toString();
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const pipeline: PipelineStage[] = [
            { $match: { messId: new mongoose.Types.ObjectId(messId) } },
            {
                $facet: {
                    total: [{ $count: "count" }],
                    active: [{ $match: { status: "active" } }, { $count: "count" }],
                    expired: [{ $match: { status: "expired" } }, { $count: "count" }],
                    cancelled: [{ $match: { status: "cancelled" } }, { $count: "count" }],
                    upcoming: [{ $match: { startDate: { $gt: today } } }, { $count: "count" }],
                    newThisMonth: [
                        { $match: { startDate: { $gte: startOfMonth } } },
                        { $count: "count" },
                    ],
                    totalRevenue: [
                        { $match: { status: { $in: ["active", "expired"] } } },
                        { $group: { _id: null, total: { $sum: "$price" } } },
                    ],
                    monthlyRevenue: [
                        { $match: { startDate: { $gte: startOfMonth }, status: { $in: ["active", "expired"] } } },
                        { $group: { _id: null, total: { $sum: "$price" } } },
                    ],
                    avgPrice: [{ $group: { _id: null, avg: { $avg: "$price" } } }],
                    avgDuration: [{ $group: { _id: null, avg: { $avg: "$duration" } } }],
                    planDistribution: [
                        {
                            $group: {
                                _id: "$planName",
                                count: { $sum: 1 },
                                revenue: { $sum: "$price" },
                            },
                        },
                    ],
                    monthlyStats: [
                        {
                            $group: {
                                _id: {
                                    month: { $month: "$startDate" },
                                },
                                total: { $sum: "$price" },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                monthNumber: "$_id.month",
                                count: "$total",
                                month: {
                                    $arrayElemAt: [
                                        [
                                            "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                                        ],
                                        "$_id.month",
                                    ],
                                },
                            },
                        },
                        {
                            $sort: {
                                monthNumber: 1,
                            },
                        },
                    ],
                    statusDistribution: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                status: "$_id",
                                count: 1,
                            },
                        },
                    ],
                    retentionUsers: [
                        {
                            $group: {
                                _id: "$userId",
                                subs: { $sum: 1 },
                            },
                        },
                        { $match: { subs: { $gt: 1 } } },
                        { $count: "count" },
                    ],
                    nearExpiry: [
                        {
                            $match: {
                                endDate: {
                                    $gte: today,
                                    $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
                                },
                            },
                        },
                        { $count: "count" },
                    ],
                },
            },
        ];

        const stats = await Subscription.aggregate(pipeline);

        const format = (data: any[], key: string = "count") =>
            data[0]?.[key] || 0;

        const result = {
            totalSubscriptions: format(stats[0].total),
            activeSubscriptions: format(stats[0].active),
            expiredSubscriptions: format(stats[0].expired),
            cancelledSubscriptions: format(stats[0].cancelled),
            upcomingSubscriptions: format(stats[0].upcoming),
            newSubscriptionsThisMonth: format(stats[0].newThisMonth),
            totalRevenue: format(stats[0].totalRevenue, "total"),
            monthlyRevenue: format(stats[0].monthlyRevenue, "total"),
            avgSubscriptionPrice: format(stats[0].avgPrice, "avg"),
            avgSubscriptionDuration: format(stats[0].avgDuration, "avg"),
            planDistribution: stats[0].planDistribution || [],
            monthlyStats: stats[0].monthlyStats || [],
            statusDistribution: stats[0].statusDistribution || [],
            repeatUsers: format(stats[0].retentionUsers),
            nearExpirySubscriptions: format(stats[0].nearExpiry),
        };

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
};
