export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  WAREHOUSE: 'WAREHOUSE',
  ACCOUNTANT: 'ACCOUNTANT',
};

export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole) return false;
  if (userRole === ROLES.ADMIN) return true;
  return requiredRoles.includes(userRole);
};

