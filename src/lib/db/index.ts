// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
import * as schema from "./schema";

// const connectionString = process.env.DATABASE_URL!;
// const client = postgres(connectionString);
// export const db = drizzle(client, { schema });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" }); // or .env.local

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });
