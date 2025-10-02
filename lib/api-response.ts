import { NextResponse } from 'next/server'

type ApiErrorPayload = {
  code: string
  message: string
  details?: unknown
}

export type ApiSuccess<T> = {
  ok: true
  data: T
  error: null
}

export type ApiFailure = {
  ok: false
  data: null
  error: ApiErrorPayload
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export function respondOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({
    ok: true,
    data,
    error: null,
  }, init)
}

export function respondError(
  code: string,
  message: string,
  status: number,
  options?: { details?: unknown }
) {
  const payload: ApiFailure = {
    ok: false,
    data: null,
    error: {
      code,
      message,
      ...(options?.details !== undefined ? { details: options.details } : {}),
    },
  }

  return NextResponse.json(payload, { status })
}
