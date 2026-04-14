import { Router } from "express";
import { prisma } from "../config/db";

const router = Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST user (schema manual ID)
router.post("/", async (req, res) => {
  try {
    const { user_name, user_type_id, user_is_active } = req.body;

    if (
      user_name === undefined ||
      user_type_id === undefined ||
      user_is_active === undefined
    ) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await prisma.user.create({
      data: {
        user_id: 3,
        user_name,
        user_type_id,
        user_is_active,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating user" });
  }
});

export default router;