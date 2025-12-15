import {
  admins,
  categories,
  products,
  customers,
  blacklist,
  orders,
  users,
  orderItems,
  orderStatusHistory,
  promoCodes,
  siteSettings,
  promotions,
  vacancies,
  loyaltyRules,
  type Admin,
  type InsertAdmin,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type User,
  type InsertUser,
  type Blacklist,
  type InsertBlacklist,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderStatusHistory,
  type PromoCode,
  type InsertPromoCode,
  type SiteSettings,
  type InsertSiteSettings,
  type Promotion,
  type InsertPromotion,
  type Vacancy,
  type InsertVacancy,
  type LoyaltyRule,
  type InsertLoyaltyRule,
  type OrderStatus,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, or, sql, inArray } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  validateAdminPassword(username: string, password: string): Promise<Admin | null>;

  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  validateUserPassword(phoneOrEmail: string, password: string): Promise<User | null>;

  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomerStats(id: number, orderTotal: number): Promise<void>;

  countUserOrders(userId: number): Promise<number>;
  getUserOrders(userId: number, limit?: number): Promise<{ order: Order; items: OrderItem[] }[]>;
  getLastUserOrder(userId: number): Promise<Order | undefined>;

  getBlacklist(): Promise<Blacklist[]>;
  isPhoneBlacklisted(phone: string): Promise<boolean>;
  addToBlacklist(entry: InsertBlacklist): Promise<Blacklist>;
  removeFromBlacklist(phone: string): Promise<boolean>;

  getOrders(status?: OrderStatus, search?: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderWithItems(id: number): Promise<{ order: Order; items: OrderItem[] } | undefined>;
  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  updateOrderStatus(id: number, status: OrderStatus, changedBy?: string): Promise<Order | undefined>;

  createOrderItem(item: Omit<OrderItem, 'id'>): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]>;

  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promo: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, promo: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<boolean>;
  usePromoCode(code: string): Promise<PromoCode | undefined>;

  getSiteSettings(): Promise<SiteSettings | undefined>;
  upsertSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings>;

  getPromotions(): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion | undefined>;
  deletePromotion(id: number): Promise<boolean>;

  getVacancies(): Promise<Vacancy[]>;
  createVacancy(vacancy: InsertVacancy): Promise<Vacancy>;
  updateVacancy(id: number, vacancy: Partial<InsertVacancy>): Promise<Vacancy | undefined>;
  deleteVacancy(id: number): Promise<boolean>;

  getLoyaltyRules(): Promise<LoyaltyRule[]>;
  createLoyaltyRule(rule: InsertLoyaltyRule): Promise<LoyaltyRule>;
  updateLoyaltyRule(id: number, rule: Partial<InsertLoyaltyRule>): Promise<LoyaltyRule | undefined>;
  deleteLoyaltyRule(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAdmin(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin || undefined;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const [newAdmin] = await db.insert(admins).values({ ...admin, password: hashedPassword }).returning();
    return newAdmin;
  }

  async validateAdminPassword(username: string, password: string): Promise<Admin | null> {
    const admin = await this.getAdminByUsername(username);
    if (!admin) return null;
    const isValid = await bcrypt.compare(password, admin.password);
    return isValid ? admin : null;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.sortOrder);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updated || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(products.name);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [created] = await db
      .insert(users)
      .values({ ...user, password: hashedPassword })
      .returning();
    return created;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const updatePayload = { ...user } as Partial<InsertUser>;
    if (user.password) {
      updatePayload.password = await bcrypt.hash(user.password, 10);
    }

    const [updated] = await db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, id))
      .returning();

    return updated || undefined;
  }

  async validateUserPassword(
    phoneOrEmail: string,
    password: string,
  ): Promise<User | null> {
    const candidate =
      (await this.getUserByPhone(phoneOrEmail)) ||
      (await this.getUserByEmail(phoneOrEmail));
    if (!candidate) return null;

    const isValid = await bcrypt.compare(password, candidate.password);
    if (!isValid) return null;
    return candidate;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  async getCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomerStats(id: number, orderTotal: number): Promise<void> {
    await db.update(customers)
      .set({
        totalOrders: sql`${customers.totalOrders} + 1`,
        totalSpent: sql`${customers.totalSpent} + ${orderTotal}`
      })
      .where(eq(customers.id, id));
  }

  async getBlacklist(): Promise<Blacklist[]> {
    return db.select().from(blacklist).orderBy(desc(blacklist.createdAt));
  }

  async isPhoneBlacklisted(phone: string): Promise<boolean> {
    const [entry] = await db.select().from(blacklist).where(eq(blacklist.phone, phone));
    return !!entry;
  }

  async addToBlacklist(entry: InsertBlacklist): Promise<Blacklist> {
    const [newEntry] = await db.insert(blacklist).values(entry).returning();
    return newEntry;
  }

  async removeFromBlacklist(phone: string): Promise<boolean> {
    await db.delete(blacklist).where(eq(blacklist.phone, phone));
    return true;
  }

  async getOrders(status?: OrderStatus, search?: string): Promise<Order[]> {
    let query = db.select().from(orders);
    
    if (status) {
      query = query.where(eq(orders.status, status)) as typeof query;
    }
    
    if (search) {
      query = query.where(
        or(
          like(orders.customerName, `%${search}%`),
          like(orders.customerPhone, `%${search}%`)
        )
      ) as typeof query;
    }
    
    return query.orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderWithItems(id: number): Promise<{ order: Order; items: OrderItem[] } | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    const items = await this.getOrderItems(id);
    return { order, items };
  }

  async countUserOrders(userId: number): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.userId, userId));

    return Number(row?.count || 0);
  }

  async getUserOrders(userId: number, limit = 20): Promise<{ order: Order; items: OrderItem[] }[]> {
    const orderList = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    if (orderList.length === 0) return [];

    const ids = orderList.map((o) => o.id);
    const items = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, ids));

    const grouped = new Map<number, OrderItem[]>();
    for (const item of items) {
      const list = grouped.get(item.orderId) || [];
      list.push(item);
      grouped.set(item.orderId, list);
    }

    return orderList.map((order) => ({ order, items: grouped.get(order.id) || [] }));
  }

  async getLastUserOrder(userId: number): Promise<Order | undefined> {
    const [lastOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(1);

    return lastOrder || undefined;
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    await db.insert(orderStatusHistory).values({
      orderId: newOrder.id,
      status: 'pending',
      changedBy: 'system'
    });
    return newOrder;
  }

  async updateOrderStatus(id: number, status: OrderStatus, changedBy?: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    
    if (updated) {
      await db.insert(orderStatusHistory).values({
        orderId: id,
        status,
        changedBy: changedBy || 'admin'
      });
    }
    
    return updated || undefined;
  }

  async createOrderItem(item: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    const [newItem] = await db.insert(orderItems).values(item).returning();
    return newItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    return db.select().from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(desc(orderStatusHistory.changedAt));
  }

  async getPromoCodes(): Promise<PromoCode[]> {
    return db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }

  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    const [promo] = await db.select().from(promoCodes)
      .where(eq(promoCodes.code, code.toUpperCase()));
    return promo || undefined;
  }

  async createPromoCode(promo: InsertPromoCode): Promise<PromoCode> {
    const [newPromo] = await db.insert(promoCodes)
      .values({ ...promo, code: promo.code.toUpperCase() })
      .returning();
    return newPromo;
  }

  async updatePromoCode(id: number, promo: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const updateData = promo.code ? { ...promo, code: promo.code.toUpperCase() } : promo;
    const [updated] = await db.update(promoCodes).set(updateData).where(eq(promoCodes.id, id)).returning();
    return updated || undefined;
  }

  async deletePromoCode(id: number): Promise<boolean> {
    await db.delete(promoCodes).where(eq(promoCodes.id, id));
    return true;
  }

  async usePromoCode(code: string): Promise<PromoCode | undefined> {
    const promo = await this.getPromoCode(code);
    if (!promo || !promo.isActive) return undefined;
    if (promo.maxUsage && promo.usageCount && promo.usageCount >= promo.maxUsage) return undefined;

    await db.update(promoCodes)
      .set({ usageCount: sql`${promoCodes.usageCount} + 1` })
      .where(eq(promoCodes.id, promo.id));

    return promo;
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    return settings || undefined;
  }

  async upsertSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings> {
    const existing = await this.getSiteSettings();
    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set(settings)
        .where(eq(siteSettings.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(siteSettings).values(settings).returning();
    return created;
  }

  async getPromotions(): Promise<Promotion[]> {
    return db
      .select()
      .from(promotions)
      .orderBy(asc(promotions.sortOrder), asc(promotions.id));
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const [created] = await db.insert(promotions).values(promotion).returning();
    return created;
  }

  async updatePromotion(
    id: number,
    promotion: Partial<InsertPromotion>,
  ): Promise<Promotion | undefined> {
    const [updated] = await db
      .update(promotions)
      .set(promotion)
      .where(eq(promotions.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePromotion(id: number): Promise<boolean> {
    await db.delete(promotions).where(eq(promotions.id, id));
    return true;
  }

  async getVacancies(): Promise<Vacancy[]> {
    return db
      .select()
      .from(vacancies)
      .orderBy(asc(vacancies.sortOrder), asc(vacancies.id));
  }

  async createVacancy(vacancy: InsertVacancy): Promise<Vacancy> {
    const [created] = await db.insert(vacancies).values(vacancy).returning();
    return created;
  }

  async updateVacancy(
    id: number,
    vacancy: Partial<InsertVacancy>,
  ): Promise<Vacancy | undefined> {
    const [updated] = await db
      .update(vacancies)
      .set(vacancy)
      .where(eq(vacancies.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteVacancy(id: number): Promise<boolean> {
    await db.delete(vacancies).where(eq(vacancies.id, id));
    return true;
  }

  async getLoyaltyRules(): Promise<LoyaltyRule[]> {
    return db
      .select()
      .from(loyaltyRules)
      .orderBy(asc(loyaltyRules.ordersThreshold), asc(loyaltyRules.id));
  }

  async createLoyaltyRule(rule: InsertLoyaltyRule): Promise<LoyaltyRule> {
    const [created] = await db.insert(loyaltyRules).values(rule).returning();
    return created;
  }

  async updateLoyaltyRule(
    id: number,
    rule: Partial<InsertLoyaltyRule>,
  ): Promise<LoyaltyRule | undefined> {
    const [updated] = await db
      .update(loyaltyRules)
      .set(rule)
      .where(eq(loyaltyRules.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLoyaltyRule(id: number): Promise<boolean> {
    await db.delete(loyaltyRules).where(eq(loyaltyRules.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
