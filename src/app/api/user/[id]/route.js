import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

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
    const result = await db.collection("user").findOne({ _id: new ObjectId(id) });
    console.log("==> result", result);
    return NextResponse.json(result, {
      headers: corsHeaders,
    });
  } catch (exception) {
    console.log("exception", exception.toString());
    const errorMsg = exception.toString();
    return NextResponse.json(
      {
        message: errorMsg,
      },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const data = await req.json(); // assume that it contain part of data...
  const partialUpdate = {};
  console.log("data : ", data);
  if (data.username != null) {
    partialUpdate.username = data.username;
  }
  if (data.email != null) {
    partialUpdate.email = data.email;
  }
  if (data.password != null) {
    partialUpdate.password = await bcrypt.hash(data.password, 10);
  }
  if (data.firstname != null) {
    partialUpdate.firstname = data.firstname;
  }
  if (data.lastname != null) {
    partialUpdate.lastname = data.lastname;
  }
  if (data.status != null) {
    partialUpdate.status = data.status;
  }
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const updatedResult = await db.collection("user").updateOne(
      {
        _id: new ObjectId(id),
      },
      { $set: partialUpdate }
    );
    return NextResponse.json(updatedResult, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (exception) {
    const errorMsg = exception.toString();
    return NextResponse.json(
      {
        message: errorMsg,
      },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const data = await req.json(); // assume that it contain whole user data...
  const updateData = {
    username: data.username ?? null,
    email: data.email ?? null,
    password: data.password ? await bcrypt.hash(data.password, 10) : null,
    firstname: data.firstname ?? null,
    lastname: data.lastname ?? null,
    status: data.status ?? "ACTIVE",
  };
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const updatedResult = await db.collection("user").updateOne(
      {
        _id: new ObjectId(id),
      },
      { $set: updateData }
    );
    return NextResponse.json(updatedResult, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (exception) {
    console.log("exception", exception.toString());
    const errorMsg = exception.toString();
    return NextResponse.json(
      {
        message: errorMsg,
      },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const deletedResult = await db.collection("user").deleteOne({
      _id: new ObjectId(id),
    });
    return NextResponse.json(deletedResult, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (exception) {
    const errorMsg = exception.toString();
    return NextResponse.json(
      {
        message: errorMsg,
      },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }
}
