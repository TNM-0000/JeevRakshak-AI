"""
src/weather/adapter.py
Open-Meteo Environmental & Weather Adapter for JeevRakshak AI.
Retrieves micro-climate variables (temperature, relative humidity, precipitation).
Gracefully degrades with strict timeout to prevent offline pipeline blockages.
"""

from typing import Dict, Optional, Tuple, List
import requests
from src.common.schema import EnvironmentalContextData

# District and state centroid coordinate lookup for key livestock regions in India
REGION_COORDINATES: Dict[str, Tuple[float, float]] = {
    "karnataka": (12.9716, 77.5946),
    "bengaluru": (12.9716, 77.5946),
    "bengaluru rural": (13.2274, 77.5746),
    "punjab": (30.9010, 75.8573),
    "ludhiana": (30.9010, 75.8573),
    "uttar pradesh": (26.8467, 80.9462),
    "lucknow": (26.8467, 80.9462),
    "gujarat": (23.2156, 72.6369),
    "anand": (22.5645, 72.9289),
    "maharashtra": (18.5204, 73.8567),
    "pune": (18.5204, 73.8567),
    "rajasthan": (26.9124, 75.7873),
    "jaipur": (26.9124, 75.7873),
    "bihar": (25.5941, 85.1376),
    "patna": (25.5941, 85.1376),
    "west bengal": (22.5726, 88.3639),
    "kolkata": (22.5726, 88.3639),
    "odisha": (20.4625, 85.8828),
    "cuttack": (20.4625, 85.8828),
    "bhubaneswar": (20.2961, 85.8245),
    "assam": (26.1445, 91.7362),
    "guwahati": (26.1445, 91.7362),
    "tamil nadu": (13.0827, 80.2707),
    "chennai": (13.0827, 80.2707),
    "andhra pradesh": (16.5062, 80.6480),
    "vijayawada": (16.5062, 80.6480),
    "telangana": (17.3850, 78.4867),
    "hyderabad": (17.3850, 78.4867),
    "haryana": (29.0588, 76.0856),
    "hisar": (29.1492, 75.7217),
    "karnal": (29.6857, 76.9905),
    "madhya pradesh": (23.2599, 77.4126),
    "bhopal": (23.2599, 77.4126),
    "kerala": (10.8505, 76.2711),
    "jammu & kashmir": (34.0837, 74.7973),
    "srinagar": (34.0837, 74.7973)
}

DEFAULT_INDIA_COORDS = (20.5937, 78.9629)


class WeatherAdapter:
    """
    Client for Open-Meteo keyless weather queries.
    """
    def __init__(self, timeout_seconds: float = 3.0):
        self.timeout_seconds = timeout_seconds

    def resolve_coordinates(self, state: Optional[str], district: Optional[str]) -> Tuple[float, float]:
        """Resolves latitude and longitude from location strings."""
        if district:
            d_key = district.lower().strip()
            if d_key in REGION_COORDINATES:
                return REGION_COORDINATES[d_key]

        if state:
            s_key = state.lower().strip()
            if s_key in REGION_COORDINATES:
                return REGION_COORDINATES[s_key]

        return DEFAULT_INDIA_COORDS

    def fetch_current_weather(
        self,
        state: Optional[str] = None,
        district: Optional[str] = None
    ) -> EnvironmentalContextData:
        """
        Fetches current weather observations from Open-Meteo.
        If network fails or location is unavailable, degrades gracefully.
        """
        if not state and not district:
            return EnvironmentalContextData(
                weather_available=False,
                relevant_observations=["No location provided; environmental weather context unavailable."],
                source="Open-Meteo"
            )

        lat, lon = self.resolve_coordinates(state, district)

        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,precipitation",
            "timezone": "auto"
        }

        try:
            resp = requests.get(url, params=params, timeout=self.timeout_seconds)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                temp = current.get("temperature_2m")
                rh = current.get("relative_humidity_2m")
                precip = current.get("precipitation")

                observations: List[str] = []
                if temp is not None:
                    observations.append(f"Ambient Temperature: {temp}°C")
                if rh is not None:
                    observations.append(f"Relative Humidity: {rh}%")
                    if rh > 80:
                        observations.append("High humidity (>80%): Elevated risk factor for Haemorrhagic Septicaemia and vector-borne arthropods.")
                if precip is not None:
                    observations.append(f"Precipitation: {precip} mm")
                    if precip > 5.0:
                        observations.append("Recent rainfall recorded: Surface water pooling and vector breeding conditions present.")

                return EnvironmentalContextData(
                    weather_available=True,
                    temperature_2m_c=float(temp) if temp is not None else None,
                    relative_humidity_2m_pct=float(rh) if rh is not None else None,
                    precipitation_mm=float(precip) if precip is not None else None,
                    relevant_observations=observations,
                    source="Open-Meteo"
                )
            else:
                return EnvironmentalContextData(
                    weather_available=False,
                    relevant_observations=[f"Open-Meteo API returned HTTP {resp.status_code}."],
                    source="Open-Meteo"
                )
        except Exception as e:
            # Safe degradation: do not fail the assessment
            return EnvironmentalContextData(
                weather_available=False,
                relevant_observations=[f"Weather data unavailable (network timeout/offline: {type(e).__name__})."],
                source="Open-Meteo"
            )


def get_weather_context(state: Optional[str] = None, district: Optional[str] = None) -> EnvironmentalContextData:
    adapter = WeatherAdapter()
    return adapter.fetch_current_weather(state, district)


if __name__ == "__main__":
    w = get_weather_context(state="Karnataka", district="Bengaluru Rural")
    print("Weather Response:\n", w.model_dump_json(indent=2))
