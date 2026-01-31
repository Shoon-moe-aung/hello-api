import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
export async function OPTIONS(req) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}
export async function GET(req, { params }) {
    const { id } = await params;

    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        const result = await db.collection("item").findOne({ _id: new ObjectId(id) });
        console.log("==> result", result);
        return NextResponse.json(result, {
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
export async function PATCH(req, { params }) {
    const { id } = await params;
    const data = await req.json(); //assume that it contain part of data...
    const partialUpdate = {};
    console.log("data : ", data);
    if (data.itemName != null || data.name != null) {
        partialUpdate.itemName = data.itemName ?? data.name;
    }
    if (data.itemCategory != null || data.category != null) {
        partialUpdate.itemCategory = data.itemCategory ?? data.category;
    }
    if (data.itemPrice != null || data.price != null) {
        partialUpdate.itemPrice = data.itemPrice ?? data.price;
    }
    if (data.status != null) {
        partialUpdate.status = data.status;
    }
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        const updatedResult = await db.collection("item").updateOne({
            _id: new
                ObjectId(id)
        }, { $set: partialUpdate });
        return NextResponse.json(updatedResult, {
            status: 200,
            headers: corsHeaders
        })
    }
    catch (exception) {
        const errorMsg = exception.toString();
        return NextResponse.json({
            message: errorMsg
        }, {
            status: 400,
            headers: corsHeaders
        })
    }
}
export async function PUT(req, { params }) {
    const { id } = await params;
    const data = await req.json(); //assume that it contain whole item data...
    const updateData = {
        itemName: data.itemName ?? data.name ?? null,
        itemCategory: data.itemCategory ?? data.category ?? null,
        itemPrice: data.itemPrice ?? data.price ?? null,
        status: data.status ?? "active"
    };
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        const updatedResult = await db.collection("item").updateOne({
            _id: new
                ObjectId(id)
        }, { $set: updateData });
        return NextResponse.json(updatedResult, {
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

export async function DELETE(req, { params }) {
    const { id } = await params;
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        const deletedResult = await db.collection("item").deleteOne({
            _id: new ObjectId(id)
        });
        return NextResponse.json(deletedResult, {
            status: 200,
            headers: corsHeaders
        });
    }
    catch (exception) {
        const errorMsg = exception.toString();
        return NextResponse.json({
            message: errorMsg
        }, {
            status: 400,
            headers: corsHeaders
        });
    }
}
