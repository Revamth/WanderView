const axios = require("axios");
require("dotenv").config();
const API_KEY = process.env.LOCATIONIQ_API_KEY;

const getCoordsAndAddress = async (title, address) => {
  const query = `${title}, ${address}`;
  const url = `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&format=json`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (!data || data.length === 0) {
      throw new Error("No location found for the given address.");
    }

    const result = data[0];

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    };
  } catch (err) {
    console.error("LocationIQ Error:", err.message);
    throw new Error("Failed to fetch coordinates and address from address.");
  }
};

module.exports = getCoordsAndAddress;
