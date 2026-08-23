# ShelfGuard AI

### Real-Time E-Commerce Competitive Intelligence

ShelfGuard AI is a real-time competitive intelligence platform that helps e-commerce brands monitor and compare product listings across multiple marketplaces.

Instead of manually checking different marketplaces for price and availability changes, users can provide product URLs and ShelfGuard AI retrieves live listing information, normalizes the data, compares marketplace prices, and highlights actionable competitive opportunities.

---

## 🚀 What Does ShelfGuard AI Do?

ShelfGuard AI answers a simple business question:

> **"How is my product positioned across different marketplaces right now?"**

A user provides product URLs from supported marketplaces such as:

- Amazon
- Flipkart
- Myntra

ShelfGuard AI then:

1. Detects the marketplace from the URL.
2. Sends the URL to the appropriate Bright Data scraper.
3. Extracts live product information.
4. Normalizes marketplace-specific responses into a common format.
5. Compares prices and availability.
6. Identifies the cheapest marketplace and price gaps.
7. Detects competitive opportunities.
8. Displays the results through a real-time dashboard.

---

## 🎯 Problem

E-commerce sellers and brands often list the same products across multiple marketplaces.

Monitoring these listings manually creates several problems:

- Prices can differ significantly between marketplaces.
- Competitor discounts can go unnoticed.
- Stock availability changes frequently.
- Marketplace data is presented in different formats.
- Manual monitoring does not scale across many products.

This can result in missed pricing opportunities, inconsistent channel pricing, and slower decision-making.

---

## 💡 Solution

ShelfGuard AI provides a centralized marketplace intelligence layer.

Instead of opening multiple marketplace websites and comparing listings manually, users provide the relevant product URLs and ShelfGuard retrieves the available listing information in real time.

### Example

| Marketplace | Price | Availability |
|-------------|------:|--------------|
| Amazon | ₹3,999 | In Stock |
| Flipkart | ₹8,990 | In Stock |
| Myntra | ₹3,330 | In Stock |

ShelfGuard automatically identifies:

**Cheapest Marketplace:** Myntra  
**Highest Price:** Flipkart  
**Price Difference:** ₹5,660

It can then generate an opportunity such as:

> **Myntra is significantly cheaper than Flipkart. Review cross-channel pricing.**

---

# ✨ Key Features

### 🔴 Live Marketplace Scanning

Enter product URLs and scan the selected marketplaces for current listing information.

### 💰 Price Comparison

Compare current prices across marketplaces and calculate:

- Lowest price
- Highest price
- Absolute price difference
- Percentage price spread
- Cheapest marketplace
- Most expensive marketplace

### 📦 Stock Comparison

Track whether a product is:

- In stock
- Out of stock
- Unable to retrieve

### ⚡ Competitive Opportunities

ShelfGuard detects meaningful pricing differences and generates actionable signals.

Examples include:

- Price undercutting
- Significant price gaps
- Price drops
- Stock-related opportunities

### 📊 Unified Marketplace View

Marketplace-specific responses are converted into a common product structure, allowing different sources to be compared consistently.

### 🔄 URL-Driven Data

The product displayed on the dashboard is determined by the URLs provided by the user.

The application does not depend on a fixed product for comparison.

### 📱 Responsive Dashboard

The interface is designed to work across desktop and mobile screens with a visual marketplace intelligence dashboard.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     User Dashboard  │
                    │      Next.js / React│
                    └──────────┬──────────┘
                               │
                         Product URLs
                               │
                               ▼
                    ┌─────────────────────┐
                    │   /api/compare      │
                    │   Backend API Route  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌───────────┐    ┌───────────┐    ┌───────────┐
        │  Amazon   │    │ Flipkart  │    │  Myntra   │
        │  Scraper  │    │  Scraper  │    │  Scraper  │
        └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Bright Data      │
                    │   Scraper Studio   │
                    └──────────┬──────────┘
                               │
                       Structured Data
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Data Normalization  │
                    │ & Validation Layer  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Comparison Engine   │
                    │                     │
                    │ • Price comparison  │
                    │ • Stock comparison  │
                    │ • Price spread      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Opportunity Engine  │
                    │                     │
                    │ Detect competitive  │
                    │ pricing signals     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Intelligence UI     │
                    │                     │
                    │ Prices • Signals    │
                    │ Opportunities       │
                    └─────────────────────┘