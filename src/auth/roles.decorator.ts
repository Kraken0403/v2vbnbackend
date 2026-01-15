import { SetMetadata } from '@nestjs/common'
import { global_role } from '@prisma/client'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: global_role[]) =>
  SetMetadata(ROLES_KEY, roles)
