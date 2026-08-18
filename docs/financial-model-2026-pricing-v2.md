# Kleenest 2026 Revenue Model — Corrected Pricing v2

Effective pricing authority:

| Plan | Price | Billing | Capacity / stacking |
|---|---:|---|---|
| Consumer Free | $0 | Free | 1 user |
| Consumer Premium User | $5 | One-time | Permanent premium unlock |
| Family (≤5) | $20 | One-time | Up to 5 users |
| Fleet (Premium Users ≤50 Users) | $75 | Monthly | Up to 50 Premium Users; may add Business Standard |
| Business Standard | $20 | Monthly | One business location |
| Business Growth | $50 | Monthly | Growth tier |
| Business Enterprise | Contact | Custom | Enterprise may add Fleet |

## Revenue-model rules

1. Do **not** model Consumer Premium as recurring revenue. It is a one-time $5 purchase.
2. Do **not** model Family as recurring revenue. It is a one-time $20 purchase.
3. Fleet is recurring at $75/month and supports up to 50 Premium Users.
4. Fleet and Business Standard are additive: a Fleet account may purchase Business Standard.
5. Enterprise is custom-priced and may purchase Fleet as an additive plan. Enterprise revenue is therefore shown separately and conservatively modeled only when explicitly assumed.
6. Business Growth is $50/month; there is no per-location multiplier in the corrected pricing authority.
7. Advertising is excluded from the core forecast so the model does not depend on unproven ad inventory.

## Forecast assumptions

### Conservative

| Year | Users | New Premium purchases | Family purchases | Avg Fleet accounts | Business accounts | Enterprise contracts |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 10,000 | 2.0% | 50 | 10 | 100 | 0 |
| 2 | 50,000 | 2.5% | 250 | 40 | 300 | 0 |
| 3 | 150,000 | 3.0% | 750 | 100 | 700 | 0 |

Business mix is approximately 70/30 Standard/Growth in Years 1–2 and 60/40 in Year 3.

Projected revenue:

- Year 1: **$45,800**
- Year 2: **$151,650**
- Year 3: **$396,300**

### Base

| Year | Users | New Premium purchases | Family purchases | Avg Fleet accounts | Business accounts | Enterprise contracts |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 20,000 | 3.0% | 100 | 25 | 200 | 0 |
| 2 | 100,000 | 4.0% | 500 | 100 | 800 | 1 |
| 3 | 300,000 | 5.0% | 1,500 | 300 | 2,000 | 3 |

Business mix is approximately 70/30 Standard/Growth in Year 1, 60/40 in Year 2, and 55/45 in Year 3. Enterprise contracts are modeled at $12,000/year only as a conservative placeholder for a custom contract; actual Enterprise pricing remains Contact.

Projected revenue:

- Year 1: **$97,100**
- Year 2: **$439,200**
- Year 3: **$1,215,000**

### Aggressive

| Year | Users | New Premium purchases | Family purchases | Avg Fleet accounts | Business accounts | Enterprise contracts |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 50,000 | 4.0% | 250 | 75 | 500 | 1 |
| 2 | 300,000 | 5.0% | 1,500 | 300 | 2,500 | 5 |
| 3 | 800,000 | 6.0% | 4,000 | 750 | 7,000 | 15 |

Business mix is approximately 60/40 Standard/Growth in Year 1, 50/50 in Year 2, and 40/60 in Year 3. Enterprise contracts are modeled at $12,000/year only as a placeholder; actual pricing remains Contact.

Projected revenue:

- Year 1: **$286,500**
- Year 2: **$1,485,000**
- Year 3: **$4,367,000**

## Revenue composition formula

`Revenue = (new Premium purchases × $5) + (new Family purchases × $20) + (average Fleet accounts × $75 × 12) + (Business Standard accounts × $20 × 12) + (Business Growth accounts × $50 × 12) + (Enterprise contracts × assumed contract value)`

The Enterprise placeholder is not a published price and must not be presented to customers as such.

## Strategic interpretation

The corrected pricing changes Kleenest's financial model materially. Consumer Premium and Family are acquisition/monetization events rather than subscription ARR. Recurring revenue is therefore driven primarily by Fleet, Business Standard, Business Growth, and eventually Enterprise.

The most important recurring-revenue milestone is therefore not a large consumer subscription count. It is a repeatable business acquisition engine plus Fleet adoption.

A practical planning target is approximately **2,000 paying business accounts plus a growing Fleet base**, supported by a dense and trustworthy location network. The aggressive case should be treated as upside rather than the operating plan.
