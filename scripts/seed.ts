import "dotenv/config";
import { connectMongo } from "@/lib/db/mongoose";
import { TripModel, UserModel } from "@/lib/db/models";
import { sampleTrips } from "@/lib/sample-data";
import bcrypt from "bcryptjs";

async function main() {
  await connectMongo();
  await TripModel.deleteMany({});
  await UserModel.deleteMany({ email: "demo@planora.ai" });
  await TripModel.insertMany(sampleTrips);
  await UserModel.create({
    email: "demo@planora.ai",
    password: await bcrypt.hash("password123", 10),
    name: "Planora Demo"
  });
  console.log("Database seeded");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
