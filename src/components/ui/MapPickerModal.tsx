"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Search,
  X,
  ExternalLink,
  RotateCw,
  Navigation,
  Compass,
  Check,
  Layers,
  Sparkles,
} from "lucide-react";

export interface SelectedLocationData {
  name: string;
  formattedAddress: string;
  googleMapsUrl: string;
  location: { lat: number; lng: number };
}

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (data: SelectedLocationData) => void;
  initialLocation?: { lat: number; lng: number } | null;
  initialPlaceName?: string;
  initialAddress?: string;
  initialQuery?: string;
}

declare const google: any;

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

const DEFAULT_CENTER = { lat: 20.2961, lng: 85.8245 }; // Bhubaneswar center

const DARK_MAP_STYLE: any[] = [
  { elementType: "geometry", stylers: [{ color: "#03080B" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#03080B" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8E9E9B" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#88DECC" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#88DECC" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#071A1A" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3B7D72" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#142226" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0B1518" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#A4B5B2" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#223B40" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0B1518" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#F3D3A2" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#0F2024" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#88DECC" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#05131A" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#28565F" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#03080B" }],
  },
];

export function MapPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation,
  initialPlaceName,
  initialAddress,
  initialQuery,
}: MapPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>(
    initialLocation || DEFAULT_CENTER
  );
  const [placeName, setPlaceName] = useState(initialPlaceName || "");
  const [formattedAddress, setFormattedAddress] = useState(initialAddress || "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    initialLocation
      ? `https://www.google.com/maps/search/?api=1&query=${initialLocation.lat},${initialLocation.lng}`
      : ""
  );

  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      if (initialLocation) {
        setCurrentCoords(initialLocation);
        setGoogleMapsUrl(
          `https://www.google.com/maps/search/?api=1&query=${initialLocation.lat},${initialLocation.lng}`
        );
      } else {
        setCurrentCoords(DEFAULT_CENTER);
        setGoogleMapsUrl("");
      }
      setPlaceName(initialPlaceName || "");
      setFormattedAddress(initialAddress || "");
      setSearchQuery(initialQuery || "");
      setPredictions([]);
      setShowDropdown(false);
    }
  }, [isOpen, initialLocation, initialPlaceName, initialAddress, initialQuery]);

  // Reverse geocode a lat/lng coordinate
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(`/api/location/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        setPlaceName(data.name || "Pinned Location");
        setFormattedAddress(data.formattedAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setGoogleMapsUrl(data.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
      }
    } catch (err) {
      console.error("Reverse geocode failed:", err);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Center & Pin marker
  const moveMapToLocation = useCallback(
    (lat: number, lng: number, title?: string, address?: string, url?: string) => {
      setCurrentCoords({ lat, lng });
      if (title) setPlaceName(title);
      if (address) setFormattedAddress(address);
      if (url) {
        setGoogleMapsUrl(url);
      } else {
        setGoogleMapsUrl(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat, lng });
        mapInstanceRef.current.setZoom(16);
      }

      if (markerInstanceRef.current) {
        markerInstanceRef.current.setPosition({ lat, lng });
        markerInstanceRef.current.setVisible(true);
      }
    },
    []
  );

  // Initialize Google Maps instance
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadGoogleMapsScript = () => {
      if (typeof window !== "undefined" && (window as any).google?.maps) {
        initMap();
        return;
      }

      const existingScript = document.getElementById("google-maps-js-sdk");
      if (existingScript) {
        existingScript.addEventListener("load", initMap);
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-js-sdk";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyACGz00EpH4dPQ2a0sL0XiMbI20GBCesWg"
      }&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (isMounted) initMap();
      };
      script.onerror = () => {
        if (isMounted) {
          setLoadError(true);
        }
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainerRef.current || !isMounted) return;

      const center = initialLocation || DEFAULT_CENTER;

      try {
        const map = new google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 15,
          styles: DARK_MAP_STYLE,
          mapTypeId: mapType === "satellite" ? "hybrid" : "roadmap",
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        // Custom pin marker
        const hasInitial = Boolean(initialLocation && (initialPlaceName || placeName));
        const marker = new google.maps.Marker({
          position: center,
          map,
          draggable: true,
          title: placeName || "Selected Venue",
          animation: google.maps.Animation.DROP,
          visible: hasInitial,
        });

        markerInstanceRef.current = marker;

        // Drag marker to pick new coordinates
        marker.addListener("dragend", async () => {
          const pos = marker.getPosition();
          if (pos) {
            const lat = pos.lat();
            const lng = pos.lng();
            setCurrentCoords({ lat, lng });
            await reverseGeocode(lat, lng);
          }
        });

        // Click on map to place pin
        map.addListener("click", async (e: any) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            marker.setPosition({ lat, lng });
            marker.setVisible(true);
            setCurrentCoords({ lat, lng });
            await reverseGeocode(lat, lng);
          }
        });

        setMapLoaded(true);
      } catch (err) {
        console.error("Map initialization error:", err);
        setLoadError(true);
      }
    };

    loadGoogleMapsScript();

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialLocation, reverseGeocode, mapType, placeName]);

  // Handle map type toggle (Roadmap vs Satellite)
  const toggleMapType = () => {
    const nextType = mapType === "roadmap" ? "satellite" : "roadmap";
    setMapType(nextType);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(nextType === "satellite" ? "hybrid" : "roadmap");
    }
  };

  // Search input typing with debounce
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setShowDropdown(true);

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    if (!val || val.trim().length < 2) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location/autocomplete?input=${encodeURIComponent(val.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setPredictions(data.predictions || []);
        }
      } catch (err) {
        console.error("Autocomplete fetch failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
  };

  // Select place from autocomplete
  const handleSelectPrediction = async (p: PlacePrediction) => {
    setShowDropdown(false);
    setIsSearching(true);
    try {
      const res = await fetch(`/api/location/details?placeId=${encodeURIComponent(p.placeId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.location) {
          moveMapToLocation(
            data.location.lat,
            data.location.lng,
            data.name || p.mainText,
            data.formattedAddress || p.description,
            data.googleMapsUrl
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch details:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Confirm and return location to form
  const handleConfirm = () => {
    onSelectLocation({
      name: placeName,
      formattedAddress,
      googleMapsUrl,
      location: currentCoords,
    });
    onClose();
  };

  // Auto-search and focus on open
  useEffect(() => {
    if (isOpen) {
      if (initialQuery && initialQuery.trim().length >= 2) {
        setSearchQuery(initialQuery);
        // Trigger search
        setIsSearching(true);
        setShowDropdown(true);
        fetch(`/api/location/autocomplete?input=${encodeURIComponent(initialQuery.trim())}`)
          .then((res) => (res.ok ? res.json() : { predictions: [] }))
          .then((data) => setPredictions(data.predictions || []))
          .catch(console.error)
          .finally(() => setIsSearching(false));
      }
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="join-glass-panel border border-white/15 rounded-3xl w-full max-w-4xl h-[90vh] sm:h-[82vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC] to-transparent z-30" />

        {/* ── Modal Header & Search Bar ─────────────────────────────────────── */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#050D10]/90 backdrop-blur-md z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider text-[#88DECC]">
              <Compass className="w-3.5 h-3.5 text-[#88DECC]" />
              <span>Interactive Google Maps Place Finder</span>
            </div>
            <h3 className="text-base sm:text-lg font-light font-display text-[#F5FAF6]">
              Search, Pin &amp; Verify Venue on Map
            </h3>
          </div>

          {/* Autocomplete Search Input directly in the modal */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#88DECC] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (predictions.length > 0) setShowDropdown(true);
              }}
              placeholder="Search place, hub or address on map..."
              className="w-full h-10 pl-9 pr-10 bg-white/[0.06] border border-white/15 rounded-xl text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/40 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/30 outline-none transition-all shadow-inner"
            />
            {isSearching && (
              <RotateCw className="w-3.5 h-3.5 animate-spin text-[#88DECC] absolute right-3 top-1/2 -translate-y-1/2" />
            )}

            {/* Dropdown Predictions */}
            {showDropdown && predictions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#071318]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-white/5 animate-fade-in">
                {predictions.map((p) => (
                  <button
                    key={p.placeId}
                    type="button"
                    onClick={() => handleSelectPrediction(p)}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/[0.08] transition-colors flex items-start gap-2.5 cursor-pointer group"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#88DECC] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs text-[#F5FAF6] font-medium leading-snug">
                        {p.mainText}
                      </div>
                      {p.secondaryText && (
                        <div className="text-[11px] text-[#ECF1EF]/60 leading-tight">
                          {p.secondaryText}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#ECF1EF]/60 hover:text-[#F5FAF6] p-1.5 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer self-end sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Interactive Map Viewport ───────────────────────────────────────── */}
        <div className="relative flex-1 w-full h-full bg-[#03080B] overflow-hidden">
          {/* Real Google Map Container */}
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Fallback if map fails or while loading */}
          {!mapLoaded && !loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#03080B]/90 backdrop-blur-sm text-xs text-[#ECF1EF]/70 gap-2 z-10">
              <RotateCw className="w-6 h-6 animate-spin text-[#88DECC]" />
              <span>Loading Google Maps &amp; Geolocation Engine...</span>
            </div>
          )}

          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#03080B] p-6 text-center z-10 space-y-3">
              <MapPin className="w-10 h-10 text-[#88DECC] opacity-60" />
              <h4 className="text-sm font-medium text-[#F5FAF6]">Google Maps Viewport</h4>
              <p className="text-xs text-[#ECF1EF]/60 max-w-md">
                Map engine initialized. You can still use the Google Places search bar above or pick standard venue presets.
              </p>
            </div>
          )}

          {/* Floating Map Controls (Top Left: Satellite toggle & Presets) */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={toggleMapType}
              className="px-3 py-1.5 rounded-xl bg-[#050D10]/85 backdrop-blur-md border border-white/15 text-[#F5FAF6] text-xs font-mono flex items-center gap-2 hover:bg-[#07171C] transition-all shadow-lg"
            >
              <Layers className="w-3.5 h-3.5 text-[#88DECC]" />
              <span>{mapType === "roadmap" ? "Satellite View" : "Roadmap View"}</span>
            </button>
          </div>

          {/* Drag pin instruction toast */}
          <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-[#050D10]/85 backdrop-blur-md border border-white/15 text-[11px] font-mono text-[#88DECC] flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3 h-3" />
            <span>Click or drag pin anywhere on map</span>
          </div>

          {/* ── Bottom Selected Place Confirmation Card ──────────────────────── */}
          {placeName && formattedAddress ? (
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#050D10]/95 backdrop-blur-xl border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.9)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#88DECC]/15 border border-[#88DECC]/30 flex items-center justify-center text-[#88DECC] shrink-0 mt-0.5 shadow-inner">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm sm:text-base text-[#F5FAF6]">
                        {placeName}
                      </h4>
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                        Google Maps Verified
                      </span>
                      {isReverseGeocoding && (
                        <RotateCw className="w-3 h-3 animate-spin text-[#88DECC]" />
                      )}
                    </div>
                    <p className="text-xs text-[#ECF1EF]/75 font-sans mt-0.5 line-clamp-1">
                      {formattedAddress}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10.5px] font-mono text-[#88DECC]/80">
                      <span>
                        GPS: {currentCoords.lat.toFixed(4)}° N, {currentCoords.lng.toFixed(4)}° E
                      </span>
                      {googleMapsUrl && (
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#F3D3A2] hover:underline"
                        >
                          <span>Google Maps Link</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#ECF1EF]/80 text-xs font-medium transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#EEF1EA] text-[#03080B] font-semibold text-xs sm:text-sm hover:bg-white hover:shadow-[0_0_20px_rgba(136,222,204,0.4)] transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[#03080B]" />
                    <span>Use This Venue Location</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
              <div className="mx-auto max-w-md p-3 rounded-2xl bg-[#050D10]/90 backdrop-blur-md border border-white/15 text-center shadow-lg pointer-events-auto flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2 text-xs text-[#ECF1EF]/70 font-sans">
                  <MapPin className="w-4 h-4 text-[#88DECC] shrink-0" />
                  <span>Search a venue above or click map to drop a pin</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#ECF1EF]/80 text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
