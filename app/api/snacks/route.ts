import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

const CSV_PATH = path.join(process.cwd(), "opendata", "opendata.csv")

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
  [key: string]: string
}

let snackDataCache: Snack[] | null = null

function loadSnackData(): Snack[] {
  if (snackDataCache) {
    return snackDataCache
  }

  try {
    // Check if file exists
    if (!fs.existsSync(CSV_PATH)) {
      console.error("CSV file not found at:", CSV_PATH)
      return []
    }

    const fileContent = fs.readFileSync(CSV_PATH, "utf-8")
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: "\t",
      relax_column_count: true,
    }) as Snack[]

    // Filter out empty/incomplete products and cache
    snackDataCache = records.filter(
      (record) =>
        record.product_name &&
        record.product_name.trim() !== "" &&
        record.code &&
        !record.product_name.includes("to-be-completed")
    )

    console.log(`Loaded ${snackDataCache.length} snacks from CSV`)
    return snackDataCache
  } catch (error) {
    console.error("Error loading snack data:", error)
    return []
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || ""
  const brand = searchParams.get("brand") || ""
  const country = searchParams.get("country") || ""
  const nutriscore = searchParams.get("nutriscore") || ""
  const barcode = searchParams.get("barcode") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  try {
    let data = loadSnackData()

    // Search by barcode (code)
    if (barcode) {
      const barcodeMatch = data.find((item) => item.code === barcode)
      if (barcodeMatch) {
        return NextResponse.json({
          snacks: [barcodeMatch],
          total: 1,
          page: 1,
          totalPages: 1,
        })
      }
      return NextResponse.json({
        snacks: [],
        total: 0,
        page: 1,
        totalPages: 0,
      })
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      data = data.filter(
        (item) =>
          item.product_name?.toLowerCase().includes(searchLower) ||
          item.brands?.toLowerCase().includes(searchLower) ||
          item.ingredients_text?.toLowerCase().includes(searchLower) ||
          item.categories_en?.toLowerCase().includes(searchLower)
      )
    }

    // Filter by category
    if (category) {
      data = data.filter(
        (item) =>
          item.categories_en?.toLowerCase().includes(category.toLowerCase()) ||
          item.categories?.toLowerCase().includes(category.toLowerCase())
      )
    }

    // Filter by brand
    if (brand) {
      data = data.filter((item) =>
        item.brands?.toLowerCase().includes(brand.toLowerCase())
      )
    }

    // Filter by country
    if (country) {
      data = data.filter((item) =>
        item.countries_en?.toLowerCase().includes(country.toLowerCase())
      )
    }

    // Filter by nutriscore
    if (nutriscore) {
      data = data.filter(
        (item) => item.nutriscore_grade?.toLowerCase() === nutriscore.toLowerCase()
      )
    }

    // Pagination
    const total = data.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = data.slice(startIndex, endIndex)

    // Get unique values for filters
    const uniqueCategories = new Set<string>()
    const uniqueBrands = new Set<string>()
    const uniqueCountries = new Set<string>()
    const uniqueNutriscores = new Set<string>()

    data.forEach((item) => {
      if (item.categories_en) {
        item.categories_en.split(",").forEach((cat) => {
          if (cat.trim()) uniqueCategories.add(cat.trim())
        })
      }
      if (item.brands) {
        item.brands.split(",").forEach((b) => {
          if (b.trim()) uniqueBrands.add(b.trim())
        })
      }
      if (item.countries_en) {
        item.countries_en.split(",").forEach((c) => {
          if (c.trim()) uniqueCountries.add(c.trim())
        })
      }
      if (item.nutriscore_grade) {
        uniqueNutriscores.add(item.nutriscore_grade)
      }
    })

    return NextResponse.json({
      snacks: paginatedData,
      total,
      page,
      totalPages,
      filters: {
        categories: Array.from(uniqueCategories).sort().slice(0, 50),
        brands: Array.from(uniqueBrands).sort().slice(0, 50),
        countries: Array.from(uniqueCountries).sort().slice(0, 50),
        nutriscores: Array.from(uniqueNutriscores).sort(),
      },
    })
  } catch (error) {
    console.error("Error searching snacks:", error)
    return NextResponse.json(
      { error: "Failed to search snacks" },
      { status: 500 }
    )
  }
}

