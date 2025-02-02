import * as schema from "./schema";
import { config } from "dotenv";
config({ path: ".env" }); // or .env.local
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });


// import * as schema from "./schema";
// import { config } from "dotenv";
config({ path: ".env" }); // or .env.local
import { drizzle as wsDrizzle} from 'drizzle-orm/neon-serverless';
import WebSocket from 'ws';

export const wsdb = wsDrizzle({
    connection: process.env.DATABASE_URL!,
    ws: WebSocket,
    schema
  });
