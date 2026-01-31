import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
export async function OPTIONS(req) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}
export async function GET(req) {
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        const { searchParams } = new URL(req.url);
        const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
        const limitParam = Number.parseInt(searchParams.get("limit") ?? "5", 10);
        const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
        const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 5;
        const skip = (page - 1) * limit;
        const collection = db.collection("item");
        const total = await collection.countDocuments({});
        const items = await collection.find({}).skip(skip).limit(limit).toArray();
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return NextResponse.json({
            items,
            page,
            totalPages
        }, {
            headers: corsHeaders
        });
    }
    catch (exception) {
        console.log("exception", exception.toString());
        const errorMsg = exception.toString();
        return NextResponse.json({
            message: errorMsg
        }, {
            status: 400,
            headers: corsHeaders
        })
    }
}
export async function POST(req) {
    const data = await req.json();
    const itemName = data.itemName ?? data.name ?? null;
    const itemPrice = data.itemPrice ?? data.price ?? null;
    const itemCategory = data.itemCategory ?? data.category ?? null;
    const status = data.status ?? "active";
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        const result = await db.collection("item").insertOne({
            itemName: itemName,
            itemCategory: itemCategory,
            itemPrice: itemPrice,
            status: status
        });
        return NextResponse.json({
            id: result.insertedId
        }, {
            status: 200,
            headers: corsHeaders
        })
    }
    catch (exception) {
        console.log("exception", exception.toString());
        const errorMsg = exception.toString();
        return NextResponse.json({
            message: errorMsg
        }, {
            status: 400,
            headers: corsHeaders
        })
    }
} 
