/**
 * location.js — forward-geocoding helper backed by LocationIQ.
 *
 * Turns a free-text place title + address into { lat, lng, address } so a Place
 * can be stored with coordinates for map display. Called by the places
 * controller during createPlace before the document is saved.
 */

const axios = require("axios");
require("dotenv").config();
const API_KEY = process.env.LOCATIONIQ_API_KEY;

const getCoordsAndAddress = async (title, address) => {
  // Combine title + address into one search string to improve the geocode hit.
  const query = `${title}, ${address}`;
  const url = `https://us1.locationiq.com/v1/search?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&format=json`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    // LocationIQ returns an array of matches; empty means the query is unknown.
    if (!data || data.length === 0) {
      throw new Error("No location found for the given address.");
    }

    // Take the top-ranked match.
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
