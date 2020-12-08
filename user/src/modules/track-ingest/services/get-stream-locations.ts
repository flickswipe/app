import { StreamLocation, StreamLocationDoc } from '../models/stream-location';

export async function getStreamLocations(
  country: string
): Promise<StreamLocationDoc[]> {
  return await StreamLocation.find({ country });
}
