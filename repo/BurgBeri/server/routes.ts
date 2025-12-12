import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import type { Server } from "http";
import session from "express-session";
import { z } from "zod";
import fs from "fs";
import path from "path";
import multer from "multer";
import { storage } from "./storage";
import type { OrderStatus } from "@shared/schema";
import {
  categories as categoriesTable,
  products as productsTable,
  customers as customersTable,
  blacklist as blacklistTable,
  promoCodes as promoCodesTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
  orderStatusHistory as orderStatusHistoryTable,
  siteSettings as siteSettingsTable,
  promotions as promotionsTable,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    adminId?: number;
  }
}

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const orderItemInputSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1),
  productPrice: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

const createOrderInputSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(5),
  deliveryType: z.enum(["courier", "pickup"]),
  deliveryAddress: z.string().optional().nullable(),
  paymentMethod: z.enum(["cash", "card"]),
  utensilsCount: z.number().int().min(0).max(20).default(1),
  promoCode: z.string().optional().nullable(),
  items: z.array(orderItemInputSchema).min(1),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "confirmed", "cancelled"]),
});

const createCategorySchema = z.object({
  name: z.string().min(1),
  isActive: z.boolean().optional().default(true),
});

const updateCategorySchema = createCategorySchema.partial().extend({
  sortOrder: z.number().optional(),
});

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fullDescription: z.string().optional(),
  ingredients: z.string().optional(),
  price: z.number().int().nonnegative(),
  weight: z.string().optional(),
  image: z.string().optional(),
  categoryId: z.number().int().optional(),
  isActive: z.boolean().optional().default(true),
  isNew: z.boolean().optional().default(false),
});

const updateProductSchema = createProductSchema.partial();

const createBlacklistSchema = z.object({
  phone: z.string().min(5),
  reason: z.string().optional(),
});

const createPromoCodeSchema = z.object({
  code: z.string().min(1),
  discountPercent: z.number().int().min(0).max(100),
  isActive: z.boolean().optional().default(true),
  maxUsage: z.number().int().positive().optional(),
});

const updatePromoCodeSchema = createPromoCodeSchema.partial();

const imageStringSchema = z.string().trim().min(1).optional().or(z.literal(""));

const siteSettingsInputSchema = z.object({
  heroImageUrl: imageStringSchema,
  logoImageUrl: imageStringSchema,
  footerLogoImageUrl: imageStringSchema,
});

const createPromotionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  discountLabel: z.string().optional(),
  imageUrl: imageStringSchema,
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional(),
});

const updatePromotionSchema = createPromotionSchema.partial();

const createVacancySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  salary: z.string().optional(),
  contacts: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional(),
});

const updateVacancySchema = createVacancySchema.partial();

const backupSchema = z.object({
  schemaVersion: z.number().optional().default(1),
  categories: z.array(z.any()),
  products: z.array(z.any()),
  customers: z.array(z.any()),
  blacklist: z.array(z.any()),
  promoCodes: z.array(z.any()),
  orders: z.array(z.any()),
  orderItems: z.array(z.any()),
  orderStatusHistory: z.array(z.any()),
});

function handleError(res: Response, err: unknown) {
  console.error(err);
  if (!res.headersSent) {
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
}

export async function registerRoutes(
  _httpServer: Server,
  app: Express,
): Promise<Server> {
  // ----- Sessions -----
  const useSecureCookies = process.env.SESSION_COOKIE_SECURE === "true";

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
        secure: useSecureCookies,
      },
    }),
  );

  // ----- Uploads directory & static -----
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  const uploadStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${unique}${ext}`);
    },
  });

  const upload = multer({
    storage: uploadStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  // ----- Default admin -----
  const defaultAdminUser = process.env.DEFAULT_ADMIN_USER || "admin";
  const defaultAdminPassword =
    process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
  try {
    const existingAdmin = await storage.getAdminByUsername(defaultAdminUser);
    if (!existingAdmin) {
      await storage.createAdmin({
        username: defaultAdminUser,
        password: defaultAdminPassword,
      });
      console.log(
        `Создан админ по умолчанию: ${defaultAdminUser}/${defaultAdminPassword}`,
      );
    }
  } catch (err) {
    console.error("Не удалось проверить/создать администратора:", err);
  }

  // ----- Default categories -----
  try {
    const existingCategories = await storage.getCategories();
    if (!existingCategories || existingCategories.length === 0) {
      const defaultCategories = [
        "Роллы",
        "Сеты",
        "Пицца",
        "Лапша ВОК",
        "Бургеры",
        "Сэндвичи",
        "Шаурма",
        "Морепродукты",
        "Ланч боксы",
        "Закуски",
        "Соусы",
        "Десерты и напитки",
        "Наборы",
        "Салаты",
      ];
      let sortOrder = 1;
      for (const name of defaultCategories) {
        await storage.createCategory({
          name,
          sortOrder,
          isActive: true,
        } as any);
        sortOrder += 1;
      }
      console.log("Созданы категории по умолчанию");
    }
  } catch (err) {
    console.error("Не удалось инициализировать категории по умолчанию:", err);
  }

  // ----- Default site settings (banner + logo) -----
  const defaultLogo =
    "https://images.unsplash.com/photo-1562296761-5d2add43d7d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBsb2dvJTIwaWNvbnxlbnwxfHx8fDE3NjQ4OTY3MzB8MA&ixlib=rb-4.1.0&q=80&w=1080";
  const defaultHero =
    "https://images.unsplash.com/photo-1606752449272-722d4c98682e?auto=format&fit=crop&w=1600&q=80";

  try {
    const existingSettings = await storage.getSiteSettings();
    if (!existingSettings) {
      await storage.upsertSiteSettings({
        heroImageUrl: defaultHero,
        logoImageUrl: defaultLogo,
        footerLogoImageUrl: defaultLogo,
      });
      console.log("Созданы настройки сайта по умолчанию");
    }
  } catch (err) {
    console.error("Не удалось инициализировать настройки сайта:", err);
  }

  const router = express.Router();

  const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.session?.adminId) {
      return res
        .status(401)
        .json({ message: "Требуется авторизация администратора" });
    }
    next();
  };

  // ---------- AUTH ----------
  router.post("/admin/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, message: "Неверные данные входа" });
      }

      const { username, password } = parsed.data;
      const admin = await storage.validateAdminPassword(username, password);
      if (!admin) {
        return res
          .status(401)
          .json({ success: false, message: "Неверный логин или пароль" });
      }

      req.session.adminId = admin.id;
      res.json({
        success: true,
        admin: { id: admin.id, username: admin.username },
      });
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post("/admin/logout", (req, res) => {
    try {
      req.session.destroy(() => {
        res.json({ success: true });
      });
    } catch (err) {
      handleError(res, err);
    }
  });

  // ---------- FILE UPLOADS ----------
  router.post(
    "/uploads",
    requireAdmin,
    upload.single("file"),
    (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "Файл не получен" });
        }
        const url = `/uploads/${req.file.filename}`;
        res.status(201).json({ url });
      } catch (err) {
        handleError(res, err);
      }
    },
  );

  // ---------- SETTINGS ----------
  router.get("/settings", async (_req, res) => {
    try {
      let settings = await storage.getSiteSettings();
      if (!settings) {
        settings = await storage.upsertSiteSettings({
          heroImageUrl: defaultHero,
          logoImageUrl: defaultLogo,
          footerLogoImageUrl: defaultLogo,
        });
      }
      res.json(settings);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.patch("/settings", requireAdmin, async (req, res) => {
    try {
      const parsed = siteSettingsInputSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные настроек" });
      }
      const normalizeImage = (value?: string | null) =>
        value === "" ? undefined : value;
      const current = await storage.getSiteSettings();
      const merged = {
        heroImageUrl:
          normalizeImage(parsed.data.heroImageUrl) ??
          current?.heroImageUrl ??
          defaultHero,
        logoImageUrl:
          normalizeImage(parsed.data.logoImageUrl) ??
          current?.logoImageUrl ??
          defaultLogo,
        footerLogoImageUrl:
          normalizeImage(parsed.data.footerLogoImageUrl) ??
          current?.footerLogoImageUrl ??
          defaultLogo,
      };
      const updated = await storage.upsertSiteSettings(merged);
      res.json(updated);
    } catch (err) {
      handleError(res, err);
    }
  });

  // ---------- CATEGORIES ----------
  router.get("/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post("/categories", requireAdmin, async (req, res) => {
    try {
      const parsed = createCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные категории" });
      }

      const existing = await storage.getCategories();
      const maxSortOrder = existing.reduce(
        (max, c: any) =>
          typeof c.sortOrder === "number" && c.sortOrder > max
            ? c.sortOrder
            : max,
        0,
      );

      const category = await storage.createCategory({
        name: parsed.data.name.trim(),
        isActive: parsed.data.isActive ?? true,
        sortOrder: maxSortOrder + 1,
      } as any);

      res.status(201).json(category);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.patch("/categories/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID категории" });
      }

      const parsed = updateCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные категории" });
      }

      const updated = await storage.updateCategory(id, parsed.data as any);
      if (!updated) {
        return res.status(404).json({ message: "Категория не найдена" });
      }

      res.json(updated);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.delete("/categories/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID категории" });
      }

      const ok = await storage.deleteCategory(id);
      if (!ok) {
        return res.status(404).json({ message: "Категория не найдена" });
      }

      res.json({ success: true });
    } catch (err) {
      handleError(res, err);
    }
  });

  // ---------- PRODUCTS ----------
  router.get("/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post("/products", requireAdmin, async (req, res) => {
    try {
      const parsed = createProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные товара" });
      }

      const product = await storage.createProduct(parsed.data as any);
      res.status(201).json(product);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.patch("/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID товара" });
      }

      const parsed = updateProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные товара" });
      }

      const updated = await storage.updateProduct(id, parsed.data as any);
      if (!updated) {
        return res.status(404).json({ message: "Товар не найден" });
      }

      res.json(updated);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.delete("/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID товара" });
      }

      const ok = await storage.deleteProduct(id);
      if (!ok) {
        return res.status(404).json({ message: "Товар не найден" });
      }

      res.json({ success: true });
    } catch (err) {
      handleError(res, err);
    }
  });

  // ---------- PROMO CODES ----------
  router.get("/promo-codes", requireAdmin, async (_req, res) => {
    try {
      const promos = await storage.getPromoCodes();
      res.json(promos);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post("/promo-codes", requireAdmin, async (req, res) => {
    try {
      const parsed = createPromoCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные промокода" });
      }

      const promo = await storage.createPromoCode(parsed.data as any);
      res.status(201).json(promo);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.patch("/promo-codes/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID промокода" });
      }

      const parsed = updatePromoCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные промокода" });
      }

      const updated = await storage.updatePromoCode(id, parsed.data as any);
      if (!updated) {
        return res.status(404).json({ message: "Промокод не найден" });
      }

      res.json(updated);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.delete("/promo-codes/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID промокода" });
      }

      const ok = await storage.deletePromoCode(id);
      if (!ok) {
        return res.status(404).json({ message: "Промокод не найден" });
      }

      res.json({ success: true });
    } catch (err) {
      handleError(res, err);
    }
  });

  router.get("/promo-codes/validate/:code", async (req, res) => {
    try {
      const rawCode = decodeURIComponent(req.params.code || "").trim();
      if (!rawCode) {
        return res.json({
          valid: false,
          message: "Промокод не указан",
        });
      }

      const promo = await storage.getPromoCode(rawCode);
      if (
        !promo ||
        !promo.isActive ||
        (promo.maxUsage &&
          promo.usageCount &&
          promo.usageCount >= promo.maxUsage)
      ) {
        return res.json({
          valid: false,
          message: "Промокод недействителен или исчерпан",
        });
      }

      res.json({
        valid: true,
        discountPercent: promo.discountPercent,
      });
    } catch (err) {
      handleError(res, err);
    }
  });

  // ---------- BLACKLIST ----------
  router.get("/blacklist", requireAdmin, async (_req, res) => {
    try {
      const list = await storage.getBlacklist();
      res.json(list);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post("/blacklist", requireAdmin, async (req, res) => {
    try {
      const parsed = createBlacklistSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные для черного списка" });
      }

      const entry = await storage.addToBlacklist(parsed.data as any);
      res.status(201).json(entry);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.delete("/blacklist/:phone", requireAdmin, async (req, res) => {
    try {
      const phone = decodeURIComponent(req.params.phone || "");
      if (!phone) {
        return res
          .status(400)
          .json({ message: "Некорректный номер телефона" });
      }

      const ok = await storage.removeFromBlacklist(phone);
      if (!ok) {
        return res.status(404).json({ message: "Запись не найдена" });
      }

      res.json({ success: true });
    } catch (err) {
      handleError(res, err);
    }
  });

  // ---------- CUSTOMERS ----------
  router.get("/customers", requireAdmin, async (_req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (err) {
      handleError(res, err);
    }
  });

  // ---------- ORDERS ----------
  router.get("/orders", requireAdmin, async (req, res) => {
    try {
      const statusParam = req.query.status;
      const searchParam = req.query.search;

      let status: OrderStatus | undefined;
      if (
        typeof statusParam === "string" &&
        statusParam !== "all" &&
        ["pending", "processing", "confirmed", "cancelled"].includes(
          statusParam,
        )
      ) {
        status = statusParam as OrderStatus;
      }

      const search =
        typeof searchParam === "string" && searchParam.trim() !== ""
          ? searchParam.trim()
          : undefined;

      const orders = await storage.getOrders(status, search);
      res.json(orders);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.get("/orders/:id/items", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID заказа" });
      }

      const items = await storage.getOrderItems(id);
      res.json(items);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.patch("/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID заказа" });
      }

      const parsed = updateOrderStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректный статус заказа" });
      }

      const updated = await storage.updateOrderStatus(
        id,
        parsed.data.status,
        "admin",
      );
      if (!updated) {
        return res.status(404).json({ message: "Заказ не найден" });
      }

      res.json({ success: true, order: updated });
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post("/orders", async (req, res) => {
    try {
      const parsed = createOrderInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Некорректные данные заказа",
        });
      }

      const data = parsed.data;

      // Проверяем чёрный список
      const blocked = await storage.isPhoneBlacklisted(data.customerPhone);
      if (blocked) {
        return res.status(400).json({
          success: false,
          message: "Номер телефона находится в черном списке",
        });
      }

      // Находим или создаём клиента
      let customer = await storage.getCustomerByPhone(data.customerPhone);
      if (!customer) {
        customer = await storage.createCustomer({
          name: data.customerName,
          phone: data.customerPhone,
        } as any);
      }

      // Считаем суммы
      const subtotal = data.items.reduce(
        (sum, item) => sum + item.productPrice * item.quantity,
        0,
      );

      let discountPercent = 0;
      let appliedPromoCode: string | null = null;

      if (data.promoCode && data.promoCode.trim() !== "") {
        const promo = await storage.usePromoCode(data.promoCode.trim());
        if (!promo) {
          return res.status(400).json({
            success: false,
            message: "Промокод недействителен или исчерпан",
          });
        }
        discountPercent = promo.discountPercent;
        appliedPromoCode = promo.code;
      }

      const discountAmount = Math.round(
        (subtotal * discountPercent) / 100,
      );
      const total = Math.max(0, subtotal - discountAmount);

      const newOrder = await storage.createOrder({
        customerId: customer.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryType: data.deliveryType,
        deliveryAddress:
          data.deliveryType === "courier"
            ? data.deliveryAddress || ""
            : "",
        paymentMethod: data.paymentMethod,
        utensilsCount: data.utensilsCount ?? 1,
        promoCode: appliedPromoCode,
        discount: discountPercent,
        subtotal,
        total,
        status: "pending",
      } as any);

      // Позиции заказа
      for (const item of data.items) {
        await storage.createOrderItem({
          orderId: newOrder.id,
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity,
        } as any);
      }

      // Обновляем статистику клиента
      await storage.updateCustomerStats(customer.id, total);

      res.status(201).json({ success: true, order: newOrder });
    } catch (err) {
      handleError(res, err);
    }
  });

  // ---------- PROMOTIONS (Акции) ----------
  router.get("/promotions", async (_req, res) => {
    try {
      let promotions = await storage.getPromotions();
      promotions = promotions.filter((p) => p.isActive !== false);
      res.json(promotions);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.get("/promotions/all", requireAdmin, async (_req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post("/promotions", requireAdmin, async (req, res) => {
    try {
      const parsed = createPromotionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные акции" });
      }

      const promotion = await storage.createPromotion(parsed.data as any);
      res.status(201).json(promotion);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.patch("/promotions/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID акции" });
      }

      const parsed = updatePromotionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные акции" });
      }

      const updated = await storage.updatePromotion(id, parsed.data as any);
      if (!updated) {
        return res.status(404).json({ message: "Акция не найдена" });
      }

      res.json(updated);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.delete("/promotions/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID акции" });
      }

      const ok = await storage.deletePromotion(id);
      if (!ok) {
        return res.status(404).json({ message: "Акция не найдена" });
      }

      res.json({ success: true });
    } catch (err) {
      handleError(res, err);
    }
  });

  // ---------- VACANCIES (Вакансии) ----------
  router.get("/vacancies", async (_req, res) => {
    try {
      const vacancies = await storage.getVacancies();
      res.json(vacancies.filter((v) => v.isActive !== false));
    } catch (err) {
      handleError(res, err);
    }
  });

  router.get("/vacancies/all", requireAdmin, async (_req, res) => {
    try {
      const vacancies = await storage.getVacancies();
      res.json(vacancies);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post("/vacancies", requireAdmin, async (req, res) => {
    try {
      const parsed = createVacancySchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные вакансии" });
      }

      const existing = await storage.getVacancies();
      const maxSortOrder = existing.reduce(
        (max, v) =>
          typeof v.sortOrder === "number" && v.sortOrder > max ? v.sortOrder : max,
        0,
      );

      const vacancy = await storage.createVacancy({
        ...parsed.data,
        sortOrder: parsed.data.sortOrder ?? maxSortOrder + 1,
        isActive: parsed.data.isActive ?? true,
      } as any);
      res.status(201).json(vacancy);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.patch("/vacancies/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID вакансии" });
      }

      const parsed = updateVacancySchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректные данные вакансии" });
      }

      const updated = await storage.updateVacancy(id, parsed.data as any);
      if (!updated) {
        return res.status(404).json({ message: "Вакансия не найдена" });
      }

      res.json(updated);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.delete("/vacancies/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Некорректный ID вакансии" });
      }

      const ok = await storage.deleteVacancy(id);
      if (!ok) {
        return res.status(404).json({ message: "Вакансия не найдена" });
      }

      res.json({ success: true });
    } catch (err) {
      handleError(res, err);
    }
  });

  // ---------- BACKUP / RESTORE ----------
  router.get("/admin/backup", requireAdmin, async (_req, res) => {
    try {
      const [categories, products, customers, blacklist, promoCodes, orders] =
        await Promise.all([
          db.select().from(categoriesTable),
          db.select().from(productsTable),
          db.select().from(customersTable),
          db.select().from(blacklistTable),
          db.select().from(promoCodesTable),
          db.select().from(ordersTable),
        ]);

      const orderItems = await db.select().from(orderItemsTable);
      const history = await db.select().from(orderStatusHistoryTable);

      const backup = {
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        categories,
        products,
        customers,
        blacklist,
        promoCodes,
        orders,
        orderItems,
        orderStatusHistory: history,
      };

      const json = JSON.stringify(backup, null, 2);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="burgbery-backup-${Date.now()}.json"`,
      );
      res.send(json);
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post("/admin/restore", requireAdmin, async (req, res) => {
    try {
      const parsed = backupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Некорректный формат файла бэкапа" });
      }
      const data = parsed.data;

      await db.transaction(async (tx) => {
        // очистка таблиц (в порядке зависимостей)
        await tx.execute(
          sql`TRUNCATE TABLE ${orderStatusHistoryTable}, ${orderItemsTable}, ${ordersTable}, ${promoCodesTable}, ${blacklistTable}, ${customersTable}, ${productsTable}, ${categoriesTable} RESTART IDENTITY CASCADE`,
        );

        const categoryIdMap = new Map<number, number>();
        for (const cat of data.categories as any[]) {
          const { id: oldId, ...rest } = cat;
          const [created] = await tx
            .insert(categoriesTable)
            .values({
              name: rest.name,
              sortOrder: rest.sortOrder ?? 0,
              isActive: rest.isActive ?? true,
            })
            .returning();
          categoryIdMap.set(oldId, created.id);
        }

        const productIdMap = new Map<number, number>();
        for (const p of data.products as any[]) {
          const { id: oldId, ...rest } = p;
          const [created] = await tx
            .insert(productsTable)
            .values({
              name: rest.name,
              description: rest.description,
              fullDescription: rest.fullDescription,
              ingredients: rest.ingredients,
              price: rest.price,
              weight: rest.weight,
              image: rest.image,
              categoryId: rest.categoryId
                ? categoryIdMap.get(rest.categoryId) ?? null
                : null,
              isActive: rest.isActive ?? true,
              isNew: rest.isNew ?? false,
            })
            .returning();
          productIdMap.set(oldId, created.id);
        }

        const customerIdMap = new Map<number, number>();
        for (const c of data.customers as any[]) {
          const { id: oldId, ...rest } = c;
          const [created] = await tx
            .insert(customersTable)
            .values({
              name: rest.name,
              phone: rest.phone,
              totalOrders: rest.totalOrders ?? 0,
              totalSpent: rest.totalSpent ?? 0,
            })
            .returning();
          customerIdMap.set(oldId, created.id);
        }

        for (const b of data.blacklist as any[]) {
          await tx.insert(blacklistTable).values({
            phone: b.phone,
            reason: b.reason,
          });
        }

        for (const pc of data.promoCodes as any[]) {
          await tx.insert(promoCodesTable).values({
            code: pc.code,
            discountPercent: pc.discountPercent,
            isActive: pc.isActive ?? true,
            usageCount: pc.usageCount ?? 0,
            maxUsage: pc.maxUsage ?? null,
          });
        }

        const orderIdMap = new Map<number, number>();
        for (const o of data.orders as any[]) {
          const { id: oldId, createdAt, updatedAt, ...rest } = o;
          const [created] = await tx
            .insert(ordersTable)
            .values({
              customerId: rest.customerId
                ? customerIdMap.get(rest.customerId) ?? null
                : null,
              customerName: rest.customerName,
              customerPhone: rest.customerPhone,
              deliveryType: rest.deliveryType,
              deliveryAddress: rest.deliveryAddress,
              paymentMethod: rest.paymentMethod,
              utensilsCount: rest.utensilsCount ?? 1,
              promoCode: rest.promoCode ?? null,
              discount: rest.discount ?? 0,
              subtotal: rest.subtotal,
              total: rest.total,
              status: rest.status ?? "pending",
              createdAt: createdAt ? new Date(createdAt) : new Date(),
              updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
            })
            .returning();
          orderIdMap.set(oldId, created.id);
        }

        for (const item of data.orderItems as any[]) {
          const newOrderId = orderIdMap.get(item.orderId);
          if (!newOrderId) continue;
          await tx.insert(orderItemsTable).values({
            orderId: newOrderId,
            productId: item.productId
              ? productIdMap.get(item.productId) ?? null
              : null,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.quantity,
          });
        }

        for (const h of data.orderStatusHistory as any[]) {
          const newOrderId = orderIdMap.get(h.orderId);
          if (!newOrderId) continue;
          await tx.insert(orderStatusHistoryTable).values({
            orderId: newOrderId,
            status: h.status,
            changedAt: h.changedAt ? new Date(h.changedAt) : new Date(),
            changedBy: h.changedBy ?? null,
          });
        }
      });

      res.json({ success: true });
    } catch (err) {
      handleError(res, err);
    }
  });

  app.use("/api", router);

  // dummy Server return to satisfy type, http server is created in index.ts
  return {} as Server;
}
