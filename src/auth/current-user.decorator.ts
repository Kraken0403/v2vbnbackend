import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export type JwtUser = {
  sub: number
  role: string
  memberId?: number | null
  email?: string | null
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest()
    return req.user as JwtUser
  },
)
