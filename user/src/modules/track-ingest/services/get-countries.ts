import { Country, CountryDoc } from '../models/country';

export async function getCountries(): Promise<CountryDoc[]> {
  return await Country.find();
}
