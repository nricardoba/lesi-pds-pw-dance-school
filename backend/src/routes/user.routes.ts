import { Router } from "express";
import { prisma } from "../config/db";

const router = Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { userId: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// POST user (schema manual ID)
router.post("/", async (req, res) => {
  try {
    const { user_name, user_birth_date, user_start_date, user_type_id, user_is_active } = req.body;
    console.log(req.body);

    const user = await prisma.user.create({
      data: {
        userId: 1,
        userName: user_name,
        userBirthDate: user_birth_date,
        userStartDate: user_start_date,
        userTypeId: user_type_id,
        userIsActive: user_is_active,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating user" });
  }
});

// PUT user by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, user_birth_date, user_start_date, user_type_id, user_is_active } = req.body;
    
    if (
      user_name === undefined ||
      user_birth_date === undefined ||
      user_start_date === undefined ||
      user_type_id === undefined ||
      user_is_active === undefined
    ) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const updatedUser = await prisma.user.update({
      where: { userId: parseInt(id) },
      data: {
        userName: user_name,
        userBirthDate: user_birth_date,
        userStartDate: user_start_date,
        userTypeId: user_type_id,
        userIsActive: user_is_active,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating user" });
  }
});

// DELETE user by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { userId: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting user" });
  }
});

export default router;