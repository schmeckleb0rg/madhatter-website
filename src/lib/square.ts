import { SquareClient, SquareEnvironment } from "square";

let squareClient: SquareClient | null = null;

export function getSquareClient(): SquareClient {
  if (squareClient) return squareClient;

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  if (!accessToken) throw new Error("SQUARE_ACCESS_TOKEN not set");

  squareClient = new SquareClient({
    token: accessToken,
    environment:
      process.env.SQUARE_ENVIRONMENT === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });

  return squareClient;
}

export function getSquareLocationId(): string {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) throw new Error("SQUARE_LOCATION_ID not set");
  return locationId;
}
