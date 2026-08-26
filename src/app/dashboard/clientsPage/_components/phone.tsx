"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Loader2, X } from "lucide-react";

interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  idd: {
    root: string;
    suffixes: string[];
  };
  flags: {
    png: string;
    svg: string;
  };
}

interface CountryCode {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string, fullNumber: string) => void;
  className?: string;
  error?: string;
  required?: boolean;
}

// Pays de repli (utilisé si l'API restcountries est indisponible).
// Couvre l'Afrique de l'Ouest + indicatifs courants pour ne jamais bloquer la saisie.
const FALLBACK_COUNTRIES: CountryCode[] = [
  { name: "Sénégal", code: "SN", dial_code: "+221", flag: "https://flagcdn.com/sn.svg" },
  { name: "Côte d'Ivoire", code: "CI", dial_code: "+225", flag: "https://flagcdn.com/ci.svg" },
  { name: "Mali", code: "ML", dial_code: "+223", flag: "https://flagcdn.com/ml.svg" },
  { name: "Burkina Faso", code: "BF", dial_code: "+226", flag: "https://flagcdn.com/bf.svg" },
  { name: "Guinée", code: "GN", dial_code: "+224", flag: "https://flagcdn.com/gn.svg" },
  { name: "Bénin", code: "BJ", dial_code: "+229", flag: "https://flagcdn.com/bj.svg" },
  { name: "Togo", code: "TG", dial_code: "+228", flag: "https://flagcdn.com/tg.svg" },
  { name: "Niger", code: "NE", dial_code: "+227", flag: "https://flagcdn.com/ne.svg" },
  { name: "Mauritanie", code: "MR", dial_code: "+222", flag: "https://flagcdn.com/mr.svg" },
  { name: "Gambie", code: "GM", dial_code: "+220", flag: "https://flagcdn.com/gm.svg" },
  { name: "Cameroun", code: "CM", dial_code: "+237", flag: "https://flagcdn.com/cm.svg" },
  { name: "France", code: "FR", dial_code: "+33", flag: "https://flagcdn.com/fr.svg" },
  { name: "Maroc", code: "MA", dial_code: "+212", flag: "https://flagcdn.com/ma.svg" },
  { name: "États-Unis", code: "US", dial_code: "+1", flag: "https://flagcdn.com/us.svg" },
];

const DEFAULT_COUNTRY_CODE = "SN"; // Sénégal par défaut

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  className = "",
  error,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags"
        );
        if (!response.ok) throw new Error("restcountries unavailable");
        const data: Country[] = await response.json();

        const formattedCountries: CountryCode[] = data
          .filter((country) => country.idd?.root)
          .map((country) => ({
            name: country.name.common,
            code: country.cca2,
            dial_code: `${country.idd.root}${country.idd.suffixes?.[0] || ""}`,
            flag: country.flags.svg,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "fr"));

        setCountries(formattedCountries);
        const fallback =
          formattedCountries.find((c) => c.code === DEFAULT_COUNTRY_CODE) ||
          formattedCountries[0];
        if (fallback) setSelectedCountry((prev) => prev ?? fallback);
      } catch (err) {
        console.error("Erreur lors du chargement des pays, utilisation du repli:", err);
        setCountries(FALLBACK_COUNTRIES);
        setSelectedCountry(
          (prev) =>
            prev ?? FALLBACK_COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY_CODE) ?? FALLBACK_COUNTRIES[0]
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(q) || country.dial_code.includes(q)
    );
  }, [searchQuery, countries]);

  // Initialiser le numéro à partir de la valeur fournie
  useEffect(() => {
    if (value && countries.length > 0) {
      const countryCode = countries.find((country) =>
        value.startsWith(country.dial_code)
      );
      if (countryCode) {
        setSelectedCountry(countryCode);
        setPhoneNumber(value.slice(countryCode.dial_code.length));
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value, countries]);

  const openDropdown = useCallback(() => {
    if (buttonRef.current) {
      setAnchorRect(buttonRef.current.getBoundingClientRect());
    }
    setIsOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
  }, []);

  // Focus la recherche + verrouille le scroll du body quand ouvert
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 50);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeDropdown();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        clearTimeout(t);
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [isOpen, closeDropdown]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    closeDropdown();
    const fullNumber = `${country.dial_code}${phoneNumber}`;
    onChange(phoneNumber, fullNumber);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d]/g, "");
    setPhoneNumber(newNumber);
    if (selectedCountry) {
      const fullNumber = `${selectedCountry.dial_code}${newNumber}`;
      onChange(newNumber, fullNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Chargement des indicatifs…</span>
      </div>
    );
  }

  const countryList = (
    <div className="divide-y divide-gray-100">
      {filteredCountries.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          Aucun pays trouvé
        </div>
      ) : (
        filteredCountries.map((country) => {
          const active = selectedCountry?.code === country.code;
          return (
            <button
              key={country.code}
              type="button"
              className={`flex items-center w-full px-4 py-3 sm:py-2.5 text-left transition-colors active:bg-gray-100 hover:bg-gray-50 space-x-3 ${
                active ? "bg-orange-50" : ""
              }`}
              onClick={() => handleCountrySelect(country)}
            >
              <img
                src={country.flag}
                alt=""
                loading="lazy"
                className="w-6 h-4 object-cover rounded-sm shadow-sm shrink-0"
              />
              <span className="flex-1 truncate text-[15px] sm:text-sm text-gray-800">
                {country.name}
              </span>
              <span className="text-gray-500 text-sm tabular-nums shrink-0">
                {country.dial_code}
              </span>
            </button>
          );
        })
      )}
    </div>
  );

  const searchBar = (
    <div className="p-3 border-b border-gray-100 bg-white">
      <div className="flex items-center px-3 py-2.5 bg-gray-100 rounded-lg focus-within:ring-2 focus-within:ring-orange-400/40">
        <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          inputMode="search"
          className="w-full bg-transparent outline-none text-[15px] sm:text-sm"
          placeholder="Rechercher un pays ou un indicatif…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="ml-1 text-gray-400 hover:text-gray-600"
            aria-label="Effacer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center border bg-white ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md focus-within:ring-2 focus-within:ring-orange-400/40 transition`}
      >
        <button
          ref={buttonRef}
          type="button"
          className="flex items-center px-3 py-2 space-x-2 text-gray-700 hover:bg-gray-50 rounded-l-md focus:outline-none border-r border-gray-200 shrink-0"
          onClick={() => (isOpen ? closeDropdown() : openDropdown())}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {selectedCountry && (
            <>
              <img
                src={selectedCountry.flag}
                alt=""
                className="w-5 h-4 object-cover rounded-sm shadow-sm"
              />
              <span className="text-sm tabular-nums">{selectedCountry.dial_code}</span>
            </>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <input
          type="tel"
          inputMode="tel"
          required={required}
          value={phoneNumber}
          onChange={handlePhoneChange}
          className="flex-1 min-w-0 px-3 py-2 outline-none rounded-r-md bg-transparent"
          placeholder="Numéro de téléphone"
        />
      </div>
      {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}

      {/* Dropdown rendu dans un portal => jamais coupé par overflow:hidden d'un parent */}
      {mounted && isOpen && anchorRect &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[998] bg-black/30 sm:bg-transparent"
              onClick={closeDropdown}
            />

            {/* MOBILE: bottom-sheet plein écran */}
            <div className="sm:hidden fixed inset-x-0 bottom-0 z-[999] flex flex-col bg-white rounded-t-2xl shadow-2xl max-h-[75vh] animate-[slideUp_.2s_ease-out]">
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-sm font-semibold text-gray-800">
                  Sélectionner un pays
                </span>
                <button
                  type="button"
                  onClick={closeDropdown}
                  className="p-1.5 -mr-1.5 text-gray-400 hover:text-gray-700"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mx-auto mt-1 mb-2 h-1 w-10 rounded-full bg-gray-200" />
              {searchBar}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                {countryList}
              </div>
            </div>

            {/* DESKTOP: popover ancré sous le bouton */}
            <div
              className="hidden sm:flex flex-col fixed z-[999] w-80 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
              style={{
                top: Math.min(anchorRect.bottom + 6, window.innerHeight - 360),
                left: Math.min(anchorRect.left, window.innerWidth - 320 - 8),
              }}
            >
              {searchBar}
              <div className="max-h-72 overflow-y-auto overscroll-contain">
                {countryList}
              </div>
            </div>

            <style>{`
              @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}</style>
          </>,
          document.body
        )}
    </div>
  );
};

export default PhoneInput;
