export type University = string
export type Topic = string

export interface TopicsResponse {
  topics: Topic[]
  meta: {
    count: number
    last_updated: string
  }
}
