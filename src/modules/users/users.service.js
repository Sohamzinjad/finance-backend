const prisma = require('../../config/db');

// Fields to always exclude passwordHash
const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Get all users with optional filters and pagination
 */
const getAllUsers = async ({ role, status, page = 1, limit = 10 }) => {
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select: safeUserSelect, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / take),
    },
  };
};

/**
 * Get a single user by ID
 */
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Update user's name, role, or status
 */
const updateUser = async (id, data) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.user.update({
    where: { id },
    data,
    select: safeUserSelect,
  });
};

/**
 * Soft-deactivate a user (set status to INACTIVE)
 */
const deactivateUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.status === 'INACTIVE') {
    const error = new Error('User is already deactivated');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.user.update({
    where: { id },
    data: { status: 'INACTIVE' },
    select: safeUserSelect,
  });
};

/**
 * Hard delete a user from the database
 */
const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.user.delete({ where: { id } });
};

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser, deleteUser };
