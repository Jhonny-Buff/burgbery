import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'confirmed', 'cancelled']);
export const deliveryTypeEnum = pgEnum('delivery_type', ['courier', 'pickup']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card']);

export const admins = pgTable("admins", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  fullDescription: text("full_description"),
  ingredients: text("ingredients"),
  price: integer("price").notNull(),
  weight: text("weight"),
  image: text("image"),
  categoryId: integer("category_id").references(() => categories.id),
  isActive: boolean("is_active").default(true),
  isNew: boolean("is_new").default(false),
});

export const customers = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  totalOrders: integer("total_orders").default(0),
  totalSpent: integer("total_spent").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blacklist = pgTable("blacklist", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  phone: text("phone").notNull().unique(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id"),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryType: deliveryTypeEnum("delivery_type").notNull(),
  deliveryAddress: text("delivery_address"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  utensilsCount: integer("utensils_count").default(1),
  promoCode: text("promo_code"),
  discount: integer("discount").default(0),
  subtotal: integer("subtotal").notNull(),
  total: integer("total").notNull(),
  status: orderStatusEnum("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nickname: text("nickname").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vacancies = pgTable("vacancies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description"),
  salary: text("salary"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  contacts: text("contacts"),
});

export const loyaltyRules = pgTable("loyalty_rules", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ordersThreshold: integer("orders_threshold").notNull(),
  discountType: text("discount_type").notNull().default("percent"),
  discountValue: integer("discount_value").notNull(),
  usageLimit: integer("usage_limit"),
  promoCode: text("promo_code").notNull(),
  isActive: boolean("is_active").default(true),
});

export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  productPrice: integer("product_price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  status: orderStatusEnum("status").notNull(),
  changedAt: timestamp("changed_at").defaultNow(),
  changedBy: text("changed_by"),
});

export const promoCodes = pgTable("promo_codes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: text("code").notNull().unique(),
  discountPercent: integer("discount_percent").notNull(),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  maxUsage: integer("max_usage"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  heroImageUrl: text("hero_image_url"),
  logoImageUrl: text("logo_image_url"),
  footerLogoImageUrl: text("footer_logo_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description"),
  discountLabel: text("discount_label"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});


export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
}));

export const insertAdminSchema = createInsertSchema(admins).pick({
  username: true,
  password: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  sortOrder: true,
  isActive: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  fullDescription: true,
  ingredients: true,
  price: true,
  weight: true,
  image: true,
  categoryId: true,
  isActive: true,
  isNew: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  phone: true,
});

export const insertBlacklistSchema = createInsertSchema(blacklist).pick({
  phone: true,
  reason: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  customerName: true,
  customerPhone: true,
  deliveryType: true,
  deliveryAddress: true,
  paymentMethod: true,
  utensilsCount: true,
  promoCode: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  productName: true,
  productPrice: true,
  quantity: true,
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).pick({
  code: true,
  discountPercent: true,
  isActive: true,
  maxUsage: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  nickname: true,
  phone: true,
  email: true,
  password: true,
});

export const insertVacancySchema = createInsertSchema(vacancies).pick({
  title: true,
  description: true,
  salary: true,
  isActive: true,
  sortOrder: true,
  contacts: true,
});

export const insertLoyaltyRuleSchema = createInsertSchema(loyaltyRules)
  .pick({
    ordersThreshold: true,
    discountType: true,
    discountValue: true,
    usageLimit: true,
    promoCode: true,
    isActive: true,
  })
  .extend({
    discountType: z.enum(["percent", "amount"]),
    discountValue: z.number().min(1),
    usageLimit: z.number().int().positive().optional().nullable(),
  });


export const insertSiteSettingsSchema = createInsertSchema(siteSettings).pick({
  heroImageUrl: true,
  logoImageUrl: true,
  footerLogoImageUrl: true,
});

export const insertPromotionSchema = createInsertSchema(promotions).pick({
  title: true,
  description: true,
  discountLabel: true,
  imageUrl: true,
  isActive: true,
  sortOrder: true,
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Blacklist = typeof blacklist.$inferSelect;
export type InsertBlacklist = z.infer<typeof insertBlacklistSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vacancy = typeof vacancies.$inferSelect;
export type InsertVacancy = z.infer<typeof insertVacancySchema>;
export type LoyaltyRule = typeof loyaltyRules.$inferSelect;
export type InsertLoyaltyRule = z.infer<typeof insertLoyaltyRuleSchema>;


export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;

export type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'cancelled';
export type DeliveryType = 'courier' | 'pickup';
export type PaymentMethod = 'cash' | 'card';
