const HyperExpress = require("hyper-express");
const { MongoClient, ObjectId } = require("mongodb");
// const cors = require("cors");
require("dotenv").config();

const webserver = new HyperExpress.Server();
const port = 4000;

// Database Configuration
const client = new MongoClient(
  process.env.MONGO_URI || "mongodb://localhost:27017"
);
let binsCollection;

async function connectDB() {
  await client.connect();
  const db = client.db("cleanmedic_data");
  binsCollection = db.collection("cleanmedic_data_1");
  console.log("Connected to MongoDB: cleanmedic_data");
}

// Middleware: CORS
webserver.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Helper: Determine status based on fullness
const getStatus = (fullness) => {
  if (fullness === 0) return "empty";
  if (fullness >= 100) return "full";
  return "partial";
};

// --- ROUTES ---

// 1. GET /api/bins - List bins, sort by lastCollected desc
webserver.get("/api/bins", async (req, res) => {
  try {
    const bins = await binsCollection
      .find()
      .sort({ lastCollected: -1 }) // -1 = Descending
      .toArray();

    // Map _id to id string for frontend consistency
    const mappedBins = bins.map((b) => ({ ...b, id: b._id.toString() }));
    res.status(200).json(mappedBins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST /api/bins - Create bin, validate fullness
webserver.post("/api/bins", async (req, res) => {
  const body = await req.json();
  const { location, fullnessPercentage } = body;

  // Validation
  if (
    typeof fullnessPercentage !== "number" ||
    fullnessPercentage < 0 ||
    fullnessPercentage > 100
  ) {
    return res
      .status(400)
      .json({ error: "Fullness must be a number between 0 and 100" });
  }

  const newBin = {
    location,
    fullnessPercentage,
    status: getStatus(fullnessPercentage),
    lastCollected: new Date(), // Default to now
  };

  const result = await binsCollection.insertOne(newBin);
  res.status(201).json({ ...newBin, id: result.insertedId });
});

// 3. PUT /api/bins/:id - Update fullness/status or 404
webserver.put("/api/bins/:id", async (req, res) => {
  const { id } = req.path_parameters;
  const body = await req.json();

  // Validate fullness if provided
  if (body.fullnessPercentage !== undefined) {
    if (body.fullnessPercentage < 0 || body.fullnessPercentage > 100) {
      return res.status(400).json({ error: "Fullness must be 0-100" });
    }
    // Auto-update status if fullness changes
    body.status = getStatus(body.fullnessPercentage);
  }

  // Convert string ID to ObjectId
  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch (err) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const result = await binsCollection.findOneAndUpdate(
    { _id: objectId },
    { $set: body },
    { returnDocument: "after" }
  );

  if (!result) {
    return res.status(404).json({ error: "Bin not found" });
  }

  res.status(200).json({ ...result, id: result._id });
});

// Start
connectDB().then(() => {
  webserver
    .listen(port)
    .then(() => console.log(`Server running on port ${port}`))
    .catch(console.error);
});
