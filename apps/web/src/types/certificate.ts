export interface Certificate {
  id: string
  title: string
  issuer: string
  issueDate: string
  credentialUrl?: string
  image?: string
  issuerIcon?: string
  sortOrder: number
  published: boolean
}
