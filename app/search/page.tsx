"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Camera, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"
import { MagneticButton } from "@/components/magnetic-button"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import Link from "next/link"

interface Snack {
  code: string
  product_name: string
  brands: string
  categories: string
  categories_en: string
  ingredients_text: string
  nutriscore_grade: string
  image_url: string
  image_small_url: string
  "energy-kcal_100g": string
  fat_100g: string
  carbohydrates_100g: string
  proteins_100g: string
  sugars_100g: string
  salt_100g: string
  fiber_100g: string
  countries_en: string
}

interface Filters {
  categories: string[]
  brands: string[]
  countries: string[]
  nutriscores: string[]
}

export default function SearchPage() {
  const [snacks, setSnacks] = useState<Snack[]>([])
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    brands: [],
    countries: [],
    nutriscores: [],
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedNutriscore, setSelectedNutriscore] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)

  const fetchSnacks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        category: selectedCategory,
        brand: selectedBrand,
        country: selectedCountry,
        nutriscore: selectedNutriscore,
        page: page.toString(),
        limit: "20",
      })

      const response = await fetch(`/api/snacks?${params}`)
      const data = await response.json()

      if (data.snacks) {
        setSnacks(data.snacks)
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
        if (data.filters) {
          setFilters(data.filters)
        }
      }
    } catch (error) {
      console.error("Error fetching snacks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSnacks()
  }, [page, selectedCategory, selectedBrand, selectedCountry, selectedNutriscore])

  const handleSearch = () => {
    setPage(1)
    fetchSnacks()
  }

  const handleBarcodeScan = async (barcode: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/snacks?barcode=${barcode}`)
      const data = await response.json()

      if (data.snacks && data.snacks.length > 0) {
        setSnacks(data.snacks)
        setTotalPages(1)
        setTotal(1)
        setSearchQuery("")
        setSelectedCategory("")
        setSelectedBrand("")
        setSelectedCountry("")
        setSelectedNutriscore("")
      } else {
        alert("Snack not found. Please try scanning again.")
      }
    } catch (error) {
      console.error("Error scanning barcode:", error)
      alert("Error scanning barcode. Please try again.")
    } finally {
      setLoading(false)
      stopScanning()
    }
  }

  const startScanning = async () => {
    try {
      setIsScanning(true)
      const scanner = new Html5Qrcode("scanner-container")
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleBarcodeScan(decodedText)
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      )
    } catch (error) {
      console.error("Error starting scanner:", error)
      alert("Could not access camera. Please ensure camera permissions are granted.")
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear()
          scannerRef.current = null
          setIsScanning(false)
        })
        .catch((error) => {
          console.error("Error stopping scanner:", error)
          setIsScanning(false)
        })
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedBrand("")
    setSelectedCountry("")
    setSelectedNutriscore("")
    setPage(1)
  }

  const getNutriscoreColor = (grade: string) => {
    const gradeUpper = grade?.toUpperCase() || ""
    switch (gradeUpper) {
      case "A":
        return "bg-green-500"
      case "B":
        return "bg-yellow-500"
      case "C":
        return "bg-orange-500"
      case "D":
        return "bg-red-500"
      case "E":
        return "bg-red-700"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <main className="relative min-h-screen w-full bg-background">
      <CustomCursor />
      <GrainOverlay />

      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-foreground/10 bg-background/80 px-6 py-4 backdrop-blur-md md:px-12">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/15 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-foreground/25">
            <span className="font-sans text-xl font-bold text-foreground">+</span>
          </div>
          <span className="font-sans text-xl font-semibold tracking-tight text-foreground">snack+</span>
        </Link>

        <div className="flex items-center gap-4">
          <MagneticButton variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </MagneticButton>
          <MagneticButton
            variant={isScanning ? "primary" : "secondary"}
            onClick={isScanning ? stopScanning : startScanning}
          >
            <Camera className="mr-2 h-4 w-4" />
            {isScanning ? "Stop Scan" : "Scan Barcode"}
          </MagneticButton>
        </div>
      </nav>

      {/* Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg bg-background/95 p-6 backdrop-blur-md">
            <button
              onClick={stopScanning}
              className="absolute right-4 top-4 rounded-full bg-foreground/10 p-2 transition-colors hover:bg-foreground/20"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
            <h2 className="mb-4 font-sans text-2xl font-semibold text-foreground">Scan Barcode</h2>
            <div id="scanner-container" ref={scannerContainerRef} className="w-full rounded-lg" />
            <p className="mt-4 text-center font-mono text-sm text-foreground/60">
              Point your camera at a barcode
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-6xl">
              Search Snacks
            </h1>
            <p className="font-mono text-sm text-foreground/60 md:text-base">
              Discover snack information from open data
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by name, brand, or ingredients..."
                className="w-full rounded-full border border-foreground/20 bg-foreground/5 px-12 py-3 font-sans text-foreground placeholder:text-foreground/40 focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    handleSearch()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <MagneticButton variant="primary" onClick={handleSearch}>
              Search
            </MagneticButton>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 rounded-lg border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-sans text-lg font-semibold text-foreground">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="font-mono text-sm text-foreground/60 hover:text-foreground/80"
                >
                  Clear All
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block font-mono text-xs text-foreground/60">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      setPage(1)
                    }}
                    className="w-full rounded-lg border border-foreground/20 bg-background px-4 py-2 font-sans text-sm text-foreground focus:border-foreground/40 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {filters.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-mono text-xs text-foreground/60">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value)
                      setPage(1)
                    }}
                    className="w-full rounded-lg border border-foreground/20 bg-background px-4 py-2 font-sans text-sm text-foreground focus:border-foreground/40 focus:outline-none"
                  >
                    <option value="">All Brands</option>
                    {filters.brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-mono text-xs text-foreground/60">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value)
                      setPage(1)
                    }}
                    className="w-full rounded-lg border border-foreground/20 bg-background px-4 py-2 font-sans text-sm text-foreground focus:border-foreground/40 focus:outline-none"
                  >
                    <option value="">All Countries</option>
                    {filters.countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-mono text-xs text-foreground/60">Nutri-Score</label>
                  <select
                    value={selectedNutriscore}
                    onChange={(e) => {
                      setSelectedNutriscore(e.target.value)
                      setPage(1)
                    }}
                    className="w-full rounded-lg border border-foreground/20 bg-background px-4 py-2 font-sans text-sm text-foreground focus:border-foreground/40 focus:outline-none"
                  >
                    <option value="">All Grades</option>
                    {filters.nutriscores.map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="font-mono text-sm text-foreground/60">
              {loading ? "Loading..." : `${total} snack${total !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Snack Grid */}
          {loading && snacks.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground"></div>
            </div>
          ) : snacks.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-sans text-lg text-foreground/60">No snacks found. Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {snacks.map((snack) => (
                  <div
                    key={snack.code}
                    className="group relative overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5 p-6 transition-all hover:border-foreground/20 hover:bg-foreground/10"
                  >
                    {/* Nutri-Score Badge */}
                    {snack.nutriscore_grade && (
                      <div className="absolute right-4 top-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${getNutriscoreColor(
                            snack.nutriscore_grade
                          )} font-sans text-xl font-bold text-white`}
                        >
                          {snack.nutriscore_grade}
                        </div>
                      </div>
                    )}

                    {/* Product Image */}
                    {snack.image_small_url || snack.image_url ? (
                      <div className="mb-4 aspect-square w-full overflow-hidden rounded-lg bg-foreground/5">
                        <img
                          src={snack.image_small_url || snack.image_url}
                          alt={snack.product_name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = "none"
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mb-4 aspect-square w-full rounded-lg bg-foreground/5 flex items-center justify-center">
                        <span className="font-mono text-xs text-foreground/40">No Image</span>
                      </div>
                    )}

                    {/* Product Info */}
                    <h3 className="mb-2 font-sans text-lg font-semibold text-foreground line-clamp-2">
                      {snack.product_name || "Unknown Product"}
                    </h3>

                    {snack.brands && (
                      <p className="mb-2 font-mono text-xs text-foreground/60">Brand: {snack.brands}</p>
                    )}

                    {snack.categories_en && (
                      <p className="mb-3 font-mono text-xs text-foreground/60">
                        {snack.categories_en.split(",").slice(0, 2).join(", ")}
                      </p>
                    )}

                    {/* Nutrition Info */}
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-foreground/10 pt-4">
                      {snack["energy-kcal_100g"] && (
                        <div>
                          <p className="font-mono text-xs text-foreground/60">Energy</p>
                          <p className="font-sans text-sm font-semibold text-foreground">
                            {!isNaN(parseFloat(snack["energy-kcal_100g"])) ? parseFloat(snack["energy-kcal_100g"]).toFixed(0) : "N/A"} kcal
                          </p>
                        </div>
                      )}
                      {snack.fat_100g && !isNaN(parseFloat(snack.fat_100g)) && (
                        <div>
                          <p className="font-mono text-xs text-foreground/60">Fat</p>
                          <p className="font-sans text-sm font-semibold text-foreground">
                            {parseFloat(snack.fat_100g).toFixed(1)}g
                          </p>
                        </div>
                      )}
                      {snack.carbohydrates_100g && !isNaN(parseFloat(snack.carbohydrates_100g)) && (
                        <div>
                          <p className="font-mono text-xs text-foreground/60">Carbs</p>
                          <p className="font-sans text-sm font-semibold text-foreground">
                            {parseFloat(snack.carbohydrates_100g).toFixed(1)}g
                          </p>
                        </div>
                      )}
                      {snack.proteins_100g && !isNaN(parseFloat(snack.proteins_100g)) && (
                        <div>
                          <p className="font-mono text-xs text-foreground/60">Protein</p>
                          <p className="font-sans text-sm font-semibold text-foreground">
                            {parseFloat(snack.proteins_100g).toFixed(1)}g
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Ingredients Preview */}
                    {snack.ingredients_text && (
                      <div className="mt-4 border-t border-foreground/10 pt-4">
                        <p className="mb-1 font-mono text-xs text-foreground/60">Ingredients</p>
                        <p className="line-clamp-2 font-sans text-xs text-foreground/80">
                          {snack.ingredients_text}
                        </p>
                      </div>
                    )}

                    {/* Barcode */}
                    <div className="mt-4 border-t border-foreground/10 pt-4">
                      <p className="font-mono text-xs text-foreground/40">Barcode: {snack.code}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="rounded-full border border-foreground/20 bg-foreground/5 p-2 transition-colors disabled:opacity-30 hover:bg-foreground/10"
                  >
                    <ChevronLeft className="h-5 w-5 text-foreground" />
                  </button>
                  <span className="font-mono text-sm text-foreground/60">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="rounded-full border border-foreground/20 bg-foreground/5 p-2 transition-colors disabled:opacity-30 hover:bg-foreground/10"
                  >
                    <ChevronRight className="h-5 w-5 text-foreground" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

