import { StreamLocation, StreamLocationDoc } from "../models/stream-location";

export async function getStreamLocations(): Promise<StreamLocationDoc[]> {
  return await StreamLocation.find();
}
