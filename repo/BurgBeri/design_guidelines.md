# Design Guidelines: Fast Food Ordering System

## Design Approach
**Reference-Based Approach** inspired by food delivery leaders: UberEats, DoorDash, and Grubhub. This combines visual appeal for food presentation with efficient ordering workflows.

**Core Principle**: Make food irresistible visually while keeping ordering frictionless and admin workflows efficient.

---

## Typography System

**Primary Font**: Inter or Manrope (Google Fonts)
- Hero/Headlines: 3xl to 5xl, font-weight-700
- Section Titles: 2xl to 3xl, font-weight-600
- Menu Item Names: xl, font-weight-600
- Body Text: base, font-weight-400
- Prices: xl to 2xl, font-weight-700
- Admin Panel: sm to base, font-weight-500

**Secondary Font**: None needed - maintain consistency with single family

---

## Layout System

**Spacing Units**: Tailwind units of 2, 4, 6, and 8 for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Grid gaps: gap-4 to gap-6

**Grid Structure**:
- Menu Items: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Admin Tables: Full-width responsive tables
- Order Form: Single column layout, max-w-2xl centered

---

## Customer-Facing Site Components

### Hero Section
Full-width hero with appetizing food photography background (burgers, fries, drinks composition)
- Height: 70vh minimum
- Overlay: Semi-transparent dark gradient for text readability
- Centered headline and CTA with blurred background buttons
- No animations - static impactful imagery

### Menu Display
**Category Navigation**: Horizontal scrollable pills (sticky on scroll)
- Active category: Bold weight, underline indicator
- Smooth scroll to category sections

**Food Cards**: 
- High-quality food images (square aspect ratio, 1:1)
- Item name, description (2 lines max), price prominent
- "Add to Cart" button always visible
- Hover: Subtle lift effect (translate-y-1)

### Cart & Checkout
**Floating Cart Widget**: Fixed bottom-right on desktop, sticky bottom bar on mobile
- Shows item count and total
- Expands to show cart details

**Order Form** (matching screenshot requirements):
- Clean white container with subtle shadow
- Fields: Name, Phone, Delivery Type (radio buttons), Address (conditional), Payment Method (radio buttons), Utensils Count (number input), Promo Code (text input)
- CAPTCHA integration before submit
- Large, prominent "Submit Order" button
- Form validation with inline error messages

---

## Admin Panel Components

### Dashboard Layout
**Sidebar Navigation** (fixed left, 250px wide):
- Logo/brand at top
- Menu sections: Orders, Menu Items, Categories, Customers, Blacklist
- Active state: Background highlight

**Main Content Area**:
- Top bar: Admin name, logout
- Breadcrumb navigation
- Content with generous padding (p-8)

### Order Management Interface (matching screenshot 2)
**Order List Table**:
- Columns: Order ID, Customer Name, Phone, Status, Total, Actions
- Status badges: Ожидает (yellow), Подтверждаем (blue), Подтвержден (green), Отменена (red)
- Filters: Status dropdown, search by phone/name
- Action buttons per row: View Details, Confirm, Cancel

**Order Details Modal**:
- Customer info section
- Order items breakdown
- Delivery details
- Status timeline
- Action buttons

### Menu Management
**Category Cards**: Simple list with edit/delete actions
**Menu Item Form**: Image upload, name, description, price, category selector

### Customer Database
**Table View**: Name, phone, order count, total spent, blacklist toggle
**Blacklist**: Red indicator, toggle switch for quick add/remove

---

## Images

**Hero Section**: High-quality hero image (1920x1080px minimum)
- Description: Professional food photography featuring signature items (burger, fries, drink) on dark wooden table with dramatic lighting
- Placement: Full-width background with gradient overlay

**Menu Item Images**: 
- Description: Clean, appetizing product shots on neutral backgrounds (white or wood)
- Placement: Top of each food card, square format
- Quantity: One per menu item

**No other decorative images needed** - focus on food photography only

---

## Component Library

**Buttons**:
- Primary: Solid fill, rounded-lg, py-3 px-6
- Secondary: Outline style
- Danger: For delete/cancel actions
- All buttons include hover states (brightness adjustment)

**Form Inputs**:
- Border: 1px solid gray-300
- Focus: Ring-2 primary accent
- Padding: py-3 px-4
- Rounded: rounded-lg

**Cards**:
- Background: white
- Shadow: shadow-md
- Border-radius: rounded-xl
- Padding: p-6

**Tables** (Admin):
- Striped rows (alternating background)
- Header: Sticky, bold text
- Borders: Subtle gray-200

**Modals**:
- Overlay: backdrop-blur with dark semi-transparent
- Content: White, rounded-2xl, max-w-2xl
- Padding: p-8

**Status Badges**:
- Rounded-full
- Small text (text-xs)
- Padding: px-3 py-1
- Color-coded per status

---

**Accessibility**: Consistent focus states, ARIA labels for admin actions, keyboard navigation support throughout

**Mobile Responsiveness**: Stack all grids to single column, collapsible admin sidebar, touch-friendly button sizes (min 44px height)