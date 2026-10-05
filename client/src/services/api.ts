import type { ApiErrorResponse, AnswerResponse, HintResponse, Mystery, MysteryListItem } from '../types/mystery.types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
const NETWORK_ERROR_MESSAGE = 'The server is unavailable. Please check your connection and try again.'
const STATUS_MESSAGES: Record<number, string> = { 400: 'Invalid input or gameplay action.', 403: 'This mystery is locked. Complete the previous mystery first.', 404: 'The requested mystery or question was not found.', 500: 'A server error occurred. Please try again later.' }

export class ApiError extends Error { constructor(message: string, public readonly status: number | null) { super(message); this.name = 'ApiError' } }
function isApiErrorResponse(value: unknown): value is ApiErrorResponse { return typeof value === 'object' && value !== null && 'message' in value && typeof value.message === 'string' }
function getHttpErrorMessage(status: number, data: unknown): string { return STATUS_MESSAGES[status] ?? (isApiErrorResponse(data) ? data.message : `Request failed with status ${status}.`) }
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try { response = await fetch(`${API_BASE_URL}${path}`, options) } catch { throw new ApiError(NETWORK_ERROR_MESSAGE, null) }
  let data: unknown
  try { data = await response.json() } catch { if (!response.ok) throw new ApiError(getHttpErrorMessage(response.status, null), response.status); throw new ApiError('The server returned an invalid response.', response.status) }
  if (!response.ok) throw new ApiError(getHttpErrorMessage(response.status, data), response.status)
  return data as T
}
export function getMysteries(): Promise<MysteryListItem[]> { return request<MysteryListItem[]>('/mysteries') }
export function getMysteryById(id: string): Promise<Mystery> { return request<Mystery>(`/mysteries/${encodeURIComponent(id)}`) }
export function submitAnswer(mysteryId: string, questionId: number, answer: string): Promise<AnswerResponse> { return request<AnswerResponse>(`/mysteries/${encodeURIComponent(mysteryId)}/questions/${questionId}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answer }) }) }
export function requestHint(mysteryId: string, questionId: number): Promise<HintResponse> { return request<HintResponse>(`/mysteries/${encodeURIComponent(mysteryId)}/questions/${questionId}/hint`, { method: 'PATCH' }) }
